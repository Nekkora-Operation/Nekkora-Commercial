/**
 * Contrato HTTP do recebimento de solicitações comerciais (COM-RELEASE-005 §5.4):
 *
 *   POST /v1/commercial/requests
 *   Content-Type: application/json            (corpo de até 8 KiB)
 *   {
 *     "idSolicitacao": "<UUID v4>",           gerado pelo navegador; o mesmo em cada nova tentativa (idempotência)
 *     "nome": "…",                            2 a 100 caracteres
 *     "email": "…",                           obrigatório: é por ele que a Nekkora responde
 *     "empresa": "…",                         opcional, até 120 caracteres
 *     "descricao": "…",                       20 a 1.000 caracteres
 *     "desafio": "…",                         token do desafio antiautomação (Turnstile), quando exigido
 *     "preenchimentoMs": 12345,               tempo entre abrir o formulário e confirmar o envio
 *     "site": ""                              armadilha para robôs: campo oculto que precisa chegar vazio
 *   }
 *
 * A validação daqui é a que vale: o React valida para ajudar o visitante, mas o servidor não confia nele. Nada de dados
 * pessoais em URL (só no corpo) e nenhum campo além dos listados. Sem dependências: roda no Lambda e nos testes.
 */

export const LEAD_API_PATH = '/v1/commercial/requests';
export const MAX_BODY_BYTES = 8192;
export const LIMITS = {
  nome: { min: 2, max: 100 },
  empresa: { min: 0, max: 120 },
  email: { min: 6, max: 254 },
  descricao: { min: 20, max: 1000 },
  desafio: { min: 0, max: 2048 },
};
const FIELDS = new Set(['idSolicitacao', 'nome', 'email', 'empresa', 'descricao', 'desafio', 'preenchimentoMs', 'site']);
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
/** Endereço simples, sem espaços nem caracteres de controle; o domínio precisa ter um ponto e um TLD de 2+ letras. */
const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i;
/** Caracteres de controle (inclui CR e LF): proibidos em campos de uma linha — evitam injeção de cabeçalho no e-mail. */
const CONTROL = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/;
/** Na descrição, só quebra de linha e tabulação são aceitas. */
const CONTROL_MULTILINE = /[\u0000-\u0008\u000b-\u001f\u007f-\u009f\u2028\u2029]/;

/** Erro de contrato → status HTTP e código estável (a página mostra a mensagem dela, nunca a do servidor). */
const fail = (status, codigo, campo) => ({ ok: false, status, codigo, ...(campo ? { campo } : {}) });

const text = (v) => (typeof v === 'string' ? v.normalize('NFC').trim() : null);
const length = (s) => [...s].length;

/**
 * Valida e normaliza o corpo. Recebe o que o API Gateway entrega (corpo em texto ou base64) e o Content-Type.
 * Retorna { ok: true, value } ou { ok: false, status, codigo, campo? }.
 */
export function parseLeadRequest({ body, isBase64Encoded = false, contentType }) {
  if (!/^application\/json(\s*;|$)/i.test(String(contentType ?? '').trim())) return fail(415, 'tipo-de-conteudo');
  const raw = body == null ? '' : isBase64Encoded ? Buffer.from(body, 'base64') : Buffer.from(String(body), 'utf8');
  if (raw.length === 0) return fail(400, 'corpo-vazio');
  if (raw.length > MAX_BODY_BYTES) return fail(413, 'corpo-grande-demais');
  let data;
  try {
    data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(raw));
  } catch {
    return fail(400, 'json-invalido');
  }
  if (data == null || typeof data !== 'object' || Array.isArray(data)) return fail(400, 'json-invalido');
  for (const key of Object.keys(data)) if (!FIELDS.has(key)) return fail(400, 'campo-desconhecido', key);

  if (typeof data.idSolicitacao !== 'string' || !UUID_V4.test(data.idSolicitacao)) return fail(400, 'campo-invalido', 'idSolicitacao');

  const nome = text(data.nome);
  if (nome == null || CONTROL.test(nome) || length(nome) < LIMITS.nome.min || length(nome) > LIMITS.nome.max) return fail(400, 'campo-invalido', 'nome');

  const email = text(data.email);
  if (email == null || length(email) > LIMITS.email.max || length(email) < LIMITS.email.min || CONTROL.test(email) || !EMAIL.test(email)) {
    return fail(400, 'campo-invalido', 'email');
  }

  const empresa = data.empresa == null ? '' : text(data.empresa);
  if (empresa == null || CONTROL.test(empresa) || length(empresa) > LIMITS.empresa.max) return fail(400, 'campo-invalido', 'empresa');

  const descricao = typeof data.descricao === 'string' ? data.descricao.normalize('NFC').replace(/\r\n?/g, '\n').trim() : null;
  if (descricao == null || CONTROL_MULTILINE.test(descricao) || length(descricao) < LIMITS.descricao.min || length(descricao) > LIMITS.descricao.max) {
    return fail(400, 'campo-invalido', 'descricao');
  }

  const desafio = data.desafio == null ? '' : data.desafio;
  if (typeof desafio !== 'string' || desafio.length > LIMITS.desafio.max || CONTROL.test(desafio)) return fail(400, 'campo-invalido', 'desafio');

  const preenchimentoMs = data.preenchimentoMs;
  if (!Number.isInteger(preenchimentoMs) || preenchimentoMs < 0 || preenchimentoMs > 86_400_000) return fail(400, 'campo-invalido', 'preenchimentoMs');

  if (data.site != null && typeof data.site !== 'string') return fail(400, 'campo-invalido', 'site');

  return {
    ok: true,
    value: { idSolicitacao: data.idSolicitacao, nome, email, empresa, descricao, desafio, preenchimentoMs, site: data.site ?? '' },
  };
}
