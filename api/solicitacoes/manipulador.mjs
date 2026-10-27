/**
 * Manipulador HTTP do recebimento de solicitações (COM-RELEASE-005 §5) — formato de evento do API Gateway HTTP API
 * (payload 2.0). Toda a lógica está aqui, com as dependências injetadas: o Lambda (lambda.mjs), o servidor local da
 * homologação (scripts/api-local.mjs) e os testes usam o mesmo código.
 *
 * Ordem: CORS → método e rota → contrato → sinais de robô → volume → desafio → idempotência → entrega.
 *
 * Respostas (sempre JSON, Cache-Control: no-store; nunca ecoam dados enviados):
 *   202 { recebida: true, idSolicitacao, protocolo, duplicada }    entregue à caixa comercial (ou já tinha sido)
 *   400 campo-invalido | json-invalido | campo-desconhecido | solicitacao-recusada
 *   403 origem-nao-permitida | desafio-invalido                  404 rota  405 metodo  413 corpo  415 tipo
 *   409 em-processamento | conflito                              429 limite (Retry-After)
 *   502 entrega-indisponivel (recuperável)                       503 desafio-indisponivel (recuperável)
 *   500 erro-interno
 * A página só diz "recebida" com um 202 com recebida: true para o MESMO idSolicitacao.
 *
 * Logs: uma linha JSON por pedido, sem nome, e-mail, empresa, descrição, IP ou token — só o hash do id, o resultado,
 * o status e a latência (verificado em scripts/testes/api-solicitacoes.test.mjs).
 */
import { createHash } from 'node:crypto';
import { botSignals, checkRate, DEFAULT_LIMITS, idHash } from './antiabuso.mjs';
import { LEAD_API_PATH, parseLeadRequest } from './contrato.mjs';
import { composeMessage, protocolOf } from './entrega.mjs';

/** Pedido em andamento ou entregue: guardado por 24 h (janela de novas tentativas do visitante). */
const CLAIM_TTL_SEC = 24 * 3600;

const recoverable = new Set(['entrega-indisponivel', 'desafio-indisponivel', 'em-processamento', 'limite', 'erro-interno']);

export function createHandler({ config, store, deliver, verifyChallenge, log = (line) => console.log(line), now = () => new Date() }) {
  const allowed = new Set(config.allowedOrigins);
  const limits = { ...DEFAULT_LIMITS, ...config.limits };
  if (!config.ipSecret || config.ipSecret.length < 16) throw new Error('segredo do HMAC de IP ausente ou curto demais');

  return async function handler(event) {
    const started = Date.now();
    const http = event.requestContext?.http ?? {};
    const headers = Object.fromEntries(Object.entries(event.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v]));
    const origin = headers.origin;
    const cors = origin && allowed.has(origin) ? { 'access-control-allow-origin': origin, vary: 'Origin' } : { vary: 'Origin' };
    const record = { evento: 'solicitacao', requestId: event.requestContext?.requestId ?? null };

    const reply = (statusCode, body, extra = {}) => {
      log(JSON.stringify({ ...record, status: statusCode, resultado: body.codigo ?? (body.recebida ? 'recebida' : 'ok'), latenciaMs: Date.now() - started }));
      return {
        statusCode,
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...cors, ...extra },
        body: JSON.stringify(body),
      };
    };
    const refuse = (statusCode, codigo, extra) => reply(statusCode, { recebida: false, codigo, recuperavel: recoverable.has(codigo) }, extra);

    // CORS: só a origem do site. Não protege contra abuso (um script ignora o CORS) — só impede que outras páginas
    // usem a API pelo navegador de um visitante e leiam a resposta.
    if (!origin || !allowed.has(origin)) return refuse(403, 'origem-nao-permitida');
    if (http.path !== LEAD_API_PATH) return refuse(404, 'rota');
    if (http.method === 'OPTIONS') {
      log(JSON.stringify({ ...record, status: 204, resultado: 'preflight', latenciaMs: Date.now() - started }));
      return {
        statusCode: 204,
        headers: { ...cors, 'access-control-allow-methods': 'POST', 'access-control-allow-headers': 'content-type', 'access-control-max-age': '600', 'cache-control': 'no-store' },
        body: '',
      };
    }
    if (http.method !== 'POST') return refuse(405, 'metodo', { allow: 'POST, OPTIONS' });

    const parsed = parseLeadRequest({ body: event.body, isBase64Encoded: event.isBase64Encoded, contentType: headers['content-type'] });
    if (!parsed.ok) {
      record.campo = parsed.campo;
      return reply(parsed.status, { recebida: false, codigo: parsed.codigo, recuperavel: false, ...(parsed.campo ? { campo: parsed.campo } : {}) });
    }
    const value = parsed.value;
    record.id = idHash(value.idSolicitacao);

    try {
      const bot = botSignals(value, limits);
      if (bot) {
        record.motivo = bot;
        return refuse(400, 'solicitacao-recusada');
      }

      const rate = await checkRate(store, { ip: http.sourceIp, secret: config.ipSecret, now: now(), limits });
      if (!rate.ok) {
        record.motivo = rate.escopo;
        // Teto global: sinal operacional para a titular (alarme no CloudWatch filtrando "limite-diario").
        if (rate.escopo === 'global') record.alerta = 'limite-diario';
        return refuse(429, 'limite', { 'retry-after': String(rate.retryAfter) });
      }

      const challenge = await verifyChallenge({ token: value.desafio, ip: http.sourceIp, idempotencyKey: value.idSolicitacao });
      if (!challenge.ok) {
        record.motivo = challenge.motivo;
        return challenge.temporario ? refuse(503, 'desafio-indisponivel') : refuse(403, 'desafio-invalido');
      }

      // Idempotência: a mesma solicitação (mesmo id e conteúdo) nunca gera dois e-mails.
      const fingerprint = createHash('sha256').update(JSON.stringify([value.nome, value.email, value.empresa, value.descricao])).digest('hex');
      const protocolo = protocolOf(record.id);
      const claim = await store.claim(value.idSolicitacao, fingerprint, CLAIM_TTL_SEC);
      if (claim.state !== 'novo') {
        if (claim.fingerprint !== fingerprint) return refuse(409, 'conflito');
        if (claim.state === 'entregue') return reply(202, { recebida: true, idSolicitacao: value.idSolicitacao, protocolo, duplicada: true });
        return refuse(409, 'em-processamento', { 'retry-after': '5' });
      }

      const recebidaEm = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }).format(now());
      try {
        await deliver(composeMessage(value, { protocolo, recebidaEm }), { replyTo: value.email });
      } catch (e) {
        record.motivo = e?.code ?? 'entrega';
        await store.release(value.idSolicitacao).catch(() => {});
        return refuse(502, 'entrega-indisponivel');
      }
      // Já entregue: uma falha ao registrar não pode virar "não recebida" para o visitante (o e-mail chegou).
      await store.complete(value.idSolicitacao, protocolo).catch(() => (record.aviso = 'registro-de-entrega'));
      return reply(202, { recebida: true, idSolicitacao: value.idSolicitacao, protocolo, duplicada: false });
    } catch (e) {
      record.motivo = e?.name ?? 'erro';
      return refuse(500, 'erro-interno');
    }
  };
}
