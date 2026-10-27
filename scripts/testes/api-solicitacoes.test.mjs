/**
 * Backend de solicitações (COM-RELEASE-005 §5, §8 "Backend"): contrato HTTP, validação no servidor, CORS, controles de
 * abuso, idempotência, falhas do provedor de e-mail, logs sem dados pessoais, adaptadores da AWS (com clientes
 * SIMULADOS — nada é chamado na AWS) e permissões mínimas das políticas IAM. Os dados abaixo são fictícios.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DeleteItemCommand, GetItemCommand, PutItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { SendEmailCommand } from '@aws-sdk/client-sesv2';
import { GetParameterCommand } from '@aws-sdk/client-ssm';
import { TURNSTILE_VERIFY_URL, turnstileVerifier } from '../../api/solicitacoes/antiabuso.mjs';
import { dynamoStore, memoryStore } from '../../api/solicitacoes/armazenamento.mjs';
import { LIMITS, MAX_BODY_BYTES, parseLeadRequest } from '../../api/solicitacoes/contrato.mjs';
import { sesProvider, simulatedProvider } from '../../api/solicitacoes/entrega.mjs';
import { buildHandler, configFromEnv } from '../../api/solicitacoes/lambda.mjs';
import { createHandler } from '../../api/solicitacoes/manipulador.mjs';

const ORIGIN = 'https://nekkora.com';
const PATH = '/v1/commercial/requests';
const valid = (over = {}) => ({
  idSolicitacao: '3f2b8c1e-9d4a-4b6e-8f1a-2c3d4e5f6a7b',
  nome: 'Pessoa Fictícia',
  email: 'pessoa@empresa-ficticia.com.br',
  empresa: 'Empresa Fictícia',
  descricao: 'Conferimos todo dia os pagamentos do banco com o sistema financeiro, manualmente.',
  desafio: 'token-valido',
  preenchimentoMs: 45000,
  site: '',
  ...over,
});
const PII = ['Pessoa Fictícia', 'pessoa@empresa-ficticia.com.br', 'Empresa Fictícia', 'Conferimos todo dia', '203.0.113.7', 'token-valido'];

function event({ method = 'POST', path = PATH, origin = ORIGIN, body = valid(), contentType = 'application/json', ip = '203.0.113.7', raw } = {}) {
  return {
    version: '2.0',
    headers: { ...(origin ? { origin } : {}), ...(contentType ? { 'content-type': contentType } : {}) },
    body: raw ?? (body == null ? undefined : JSON.stringify(body)),
    isBase64Encoded: false,
    requestContext: { requestId: 'req-teste', http: { method, path, sourceIp: ip } },
  };
}

function setup({ challenge = async () => ({ ok: true }), limits, nowValue } = {}) {
  const logs = [];
  const store = memoryStore();
  const deliver = simulatedProvider({ to: 'contato@nekkora.com', from: 'formulario@nekkora.com' });
  const handler = createHandler({
    config: { allowedOrigins: [ORIGIN], ipSecret: 'segredo-de-teste-com-32-caracteres!!', limits },
    store,
    deliver,
    verifyChallenge: challenge,
    log: (l) => logs.push(l),
    ...(nowValue ? { now: () => nowValue } : {}),
  });
  return { handler, logs, store, deliver };
}
const json = (res) => JSON.parse(res.body);

// --------------------------------------------------------------------------------------------- contrato
test('contrato: corpo válido é normalizado (CRLF → LF, espaços nas pontas)', () => {
  const r = parseLeadRequest({ body: JSON.stringify(valid({ nome: '  Pessoa Fictícia ', descricao: 'Linha um do processo atual\r\nlinha dois com detalhes' })), contentType: 'application/json; charset=utf-8' });
  assert.equal(r.ok, true);
  assert.equal(r.value.nome, 'Pessoa Fictícia');
  assert.equal(r.value.descricao, 'Linha um do processo atual\nlinha dois com detalhes');
});

test('contrato: aceita corpo em base64 (como o API Gateway entrega) e empresa ausente', () => {
  const { empresa, ...semEmpresa } = valid();
  assert.ok(empresa);
  const r = parseLeadRequest({ body: Buffer.from(JSON.stringify(semEmpresa)).toString('base64'), isBase64Encoded: true, contentType: 'application/json' });
  assert.equal(r.ok, true);
  assert.equal(r.value.empresa, '');
});

const invalid = [
  ['Content-Type text/plain', { contentType: 'text/plain' }, 415, 'tipo-de-conteudo'],
  ['Content-Type de formulário', { contentType: 'application/x-www-form-urlencoded' }, 415, 'tipo-de-conteudo'],
  ['corpo vazio', { body: '' }, 400, 'corpo-vazio'],
  ['corpo acima de 8 KiB', { body: JSON.stringify(valid({ descricao: 'x'.repeat(MAX_BODY_BYTES) })) }, 413, 'corpo-grande-demais'],
  ['JSON inválido', { body: '{"nome":' }, 400, 'json-invalido'],
  ['JSON que não é objeto', { body: '["a"]' }, 400, 'json-invalido'],
  ['UTF-8 inválido', { body: Buffer.from([0x7b, 0xff, 0x7d]).toString('base64'), isBase64Encoded: true }, 400, 'json-invalido'],
  ['campo desconhecido (destinatário)', { body: JSON.stringify(valid({ para: 'vitima@exemplo.com' })) }, 400, 'campo-desconhecido'],
  ['campo desconhecido (cc)', { body: JSON.stringify(valid({ cc: 'x@exemplo.com' })) }, 400, 'campo-desconhecido'],
  ['id que não é UUID v4', { body: JSON.stringify(valid({ idSolicitacao: '123' })) }, 400, 'campo-invalido'],
  ['nome curto', { body: JSON.stringify(valid({ nome: 'A' })) }, 400, 'campo-invalido'],
  ['nome longo', { body: JSON.stringify(valid({ nome: 'a'.repeat(LIMITS.nome.max + 1) })) }, 400, 'campo-invalido'],
  ['nome com quebra de linha (injeção de cabeçalho)', { body: JSON.stringify(valid({ nome: 'Pessoa\r\nBcc: vitima@exemplo.com' })) }, 400, 'campo-invalido'],
  ['e-mail ausente', { body: JSON.stringify(valid({ email: undefined })) }, 400, 'campo-invalido'],
  ['e-mail inválido', { body: JSON.stringify(valid({ email: 'nao-e-email' })) }, 400, 'campo-invalido'],
  ['e-mail com quebra de linha', { body: JSON.stringify(valid({ email: 'a@b.com\nBcc: c@d.com' })) }, 400, 'campo-invalido'],
  ['e-mail com vários destinatários', { body: JSON.stringify(valid({ email: 'a@b.com,c@d.com' })) }, 400, 'campo-invalido'],
  ['empresa longa', { body: JSON.stringify(valid({ empresa: 'e'.repeat(LIMITS.empresa.max + 1) })) }, 400, 'campo-invalido'],
  ['descrição curta', { body: JSON.stringify(valid({ descricao: 'curta demais' })) }, 400, 'campo-invalido'],
  ['descrição com 1.001 caracteres', { body: JSON.stringify(valid({ descricao: 'd'.repeat(1001) })) }, 400, 'campo-invalido'],
  ['descrição com caractere de controle', { body: JSON.stringify(valid({ descricao: `Processo com controle \u0007 no meio do texto` })) }, 400, 'campo-invalido'],
  ['tempo de preenchimento negativo', { body: JSON.stringify(valid({ preenchimentoMs: -1 })) }, 400, 'campo-invalido'],
  ['tempo de preenchimento como texto', { body: JSON.stringify(valid({ preenchimentoMs: '5000' })) }, 400, 'campo-invalido'],
  ['armadilha que não é texto', { body: JSON.stringify(valid({ site: 1 })) }, 400, 'campo-invalido'],
];
for (const [name, input, status, codigo] of invalid) {
  test(`contrato recusa: ${name} → ${status}`, () => {
    const r = parseLeadRequest({ contentType: 'application/json', ...input });
    assert.equal(r.ok, false);
    assert.equal(r.status, status);
    assert.equal(r.codigo, codigo);
  });
}

test('contrato: descrição com exatamente 1.000 caracteres (limite) é aceita', () => {
  assert.equal(parseLeadRequest({ body: JSON.stringify(valid({ descricao: 'd'.repeat(1000) })), contentType: 'application/json' }).ok, true);
});

// --------------------------------------------------------------------------------------------- HTTP e CORS
test('CORS: sem Origin ou de outra origem → 403 sem Access-Control-Allow-Origin; nada é entregue', async () => {
  const { handler, deliver } = setup();
  for (const origin of [null, 'https://atacante.example', 'https://nekkora.com.atacante.example', 'http://nekkora.com']) {
    const res = await handler(event({ origin }));
    assert.equal(res.statusCode, 403);
    assert.equal(json(res).codigo, 'origem-nao-permitida');
    assert.equal(res.headers['access-control-allow-origin'], undefined);
  }
  assert.equal(deliver.outbox.length, 0);
});

test('CORS: preflight da origem do site → 204 só com POST e content-type', async () => {
  const { handler } = setup();
  const res = await handler(event({ method: 'OPTIONS', body: null, contentType: null }));
  assert.equal(res.statusCode, 204);
  assert.equal(res.headers['access-control-allow-origin'], ORIGIN);
  assert.equal(res.headers['access-control-allow-methods'], 'POST');
  assert.equal(res.headers['access-control-allow-headers'], 'content-type');
  assert.equal(res.headers['access-control-allow-credentials'], undefined);
});

test('rota e método: outro caminho → 404, GET → 405 com Allow', async () => {
  const { handler } = setup();
  assert.equal((await handler(event({ path: '/v1/commercial/requests/x' }))).statusCode, 404);
  const get = await handler(event({ method: 'GET', body: null }));
  assert.equal(get.statusCode, 405);
  assert.equal(get.headers.allow, 'POST, OPTIONS');
});

test('202: entrega à caixa fixa, Reply-To do visitante, protocolo estável, sem cache', async () => {
  const { handler, deliver } = setup();
  const res = await handler(event());
  assert.equal(res.statusCode, 202);
  const body = json(res);
  assert.deepEqual(Object.keys(body).sort(), ['duplicada', 'idSolicitacao', 'protocolo', 'recebida']);
  assert.equal(body.recebida, true);
  assert.equal(body.idSolicitacao, valid().idSolicitacao);
  assert.match(body.protocolo, /^NK-[0-9A-F]{8}$/);
  assert.equal(res.headers['cache-control'], 'no-store');
  assert.equal(res.headers['access-control-allow-origin'], ORIGIN);
  assert.equal(deliver.outbox.length, 1);
  const msg = deliver.outbox[0];
  assert.equal(msg.to, 'contato@nekkora.com');
  assert.equal(msg.from, 'formulario@nekkora.com');
  assert.equal(msg.replyTo, 'pessoa@empresa-ficticia.com.br');
  assert.match(msg.subject, new RegExp(`^Solicitação de avaliação ${body.protocolo} — site Nekkora$`));
  assert.ok(!msg.subject.includes('Pessoa'), 'assunto sem dado pessoal');
  for (const v of ['Nome: Pessoa Fictícia', 'E-mail: pessoa@empresa-ficticia.com.br', 'Empresa: Empresa Fictícia', 'Conferimos todo dia']) assert.ok(msg.text.includes(v), v);
});

test('respostas de erro não ecoam os dados enviados', async () => {
  const { handler } = setup();
  const res = await handler(event({ body: valid({ email: 'invalido', nome: 'Nome Que Não Volta' }) }));
  assert.equal(res.statusCode, 400);
  assert.deepEqual(json(res), { recebida: false, codigo: 'campo-invalido', recuperavel: false, campo: 'email' });
  assert.ok(!res.body.includes('Nome Que Não Volta'));
});

// --------------------------------------------------------------------------------------------- idempotência
test('idempotência: a mesma solicitação reenviada não gera segundo e-mail e recebe o mesmo protocolo', async () => {
  const { handler, deliver } = setup();
  const a = json(await handler(event()));
  const b = await handler(event());
  assert.equal(b.statusCode, 202);
  assert.equal(json(b).protocolo, a.protocolo);
  assert.equal(json(b).duplicada, true);
  assert.equal(deliver.outbox.length, 1);
});

test('idempotência: mesmo id com outro conteúdo → 409 conflito; em andamento → 409 recuperável', async () => {
  const { handler, store, deliver } = setup();
  await handler(event());
  const other = await handler(event({ body: valid({ descricao: 'Outro processo completamente diferente do primeiro.' }) }));
  assert.equal(other.statusCode, 409);
  assert.equal(json(other).codigo, 'conflito');
  // outra instância já está entregando ESTA solicitação (mesmo conteúdo): a nova tentativa espera, sem segundo e-mail
  const id = '0b7a1c2d-3e4f-4a5b-9c6d-7e8f9a0b1c2d';
  const v = valid();
  await store.claim(id, createHash('sha256').update(JSON.stringify([v.nome, v.email, v.empresa, v.descricao])).digest('hex'), 60);
  const busy = await handler(event({ body: valid({ idSolicitacao: id }) }));
  assert.equal(busy.statusCode, 409);
  assert.equal(json(busy).codigo, 'em-processamento');
  assert.equal(json(busy).recuperavel, true);
  assert.equal(busy.headers['retry-after'], '5');
  assert.equal(deliver.outbox.length, 1);
});

// --------------------------------------------------------------------------------------------- falhas de entrega
test('falha temporária do provedor → 502 recuperável, nenhum e-mail; nova tentativa com o mesmo id entrega uma vez', async () => {
  const { handler, deliver } = setup();
  deliver.failWith('temporaria');
  const fail = await handler(event());
  assert.equal(fail.statusCode, 502);
  assert.deepEqual(json(fail), { recebida: false, codigo: 'entrega-indisponivel', recuperavel: true });
  assert.equal(deliver.outbox.length, 0);
  deliver.failWith(null);
  const retry = await handler(event());
  assert.equal(retry.statusCode, 202);
  assert.equal(json(retry).duplicada, false);
  assert.equal(deliver.outbox.length, 1);
});

test('falha permanente do provedor também libera nova tentativa (502), sem afirmar recebimento', async () => {
  const { handler, deliver } = setup();
  deliver.failWith('permanente');
  const res = await handler(event());
  assert.equal(res.statusCode, 502);
  assert.equal(json(res).recebida, false);
});

test('erro inesperado (armazenamento fora do ar) → 500 sem detalhes internos', async () => {
  const logs = [];
  const handler = createHandler({
    config: { allowedOrigins: [ORIGIN], ipSecret: 'segredo-de-teste-com-32-caracteres!!' },
    store: { increment: async () => Promise.reject(Object.assign(new Error('Conexão recusada em 10.0.0.1 tabela x'), { name: 'ServiceUnavailable' })) },
    deliver: simulatedProvider(),
    verifyChallenge: async () => ({ ok: true }),
    log: (l) => logs.push(l),
  });
  const res = await handler(event());
  assert.equal(res.statusCode, 500);
  assert.deepEqual(json(res), { recebida: false, codigo: 'erro-interno', recuperavel: true });
  assert.ok(!logs.join('\n').includes('10.0.0.1'));
});

// --------------------------------------------------------------------------------------------- abuso
test('armadilha preenchida e envio rápido demais → 400 recusada, nada entregue', async () => {
  const { handler, deliver } = setup();
  assert.equal(json(await handler(event({ body: valid({ site: 'http://spam.example' }) }))).codigo, 'solicitacao-recusada');
  assert.equal(json(await handler(event({ body: valid({ preenchimentoMs: 800 }) }))).codigo, 'solicitacao-recusada');
  assert.equal(deliver.outbox.length, 0);
});

const uuid = (n) => `${String(n).padStart(8, '0')}-0000-4000-8000-000000000000`;
test('limite por origem de rede: a 6ª na mesma hora → 429 com Retry-After; outra origem continua', async () => {
  const { handler, deliver } = setup();
  for (let i = 1; i <= 5; i++) assert.equal((await handler(event({ body: valid({ idSolicitacao: uuid(i) }) }))).statusCode, 202);
  const sixth = await handler(event({ body: valid({ idSolicitacao: uuid(6) }) }));
  assert.equal(sixth.statusCode, 429);
  assert.equal(json(sixth).codigo, 'limite');
  assert.ok(Number(sixth.headers['retry-after']) > 0);
  assert.equal((await handler(event({ ip: '198.51.100.9', body: valid({ idSolicitacao: uuid(7) }) }))).statusCode, 202);
  assert.equal(deliver.outbox.length, 6);
});

test('teto diário global: acima dele, 429 e alerta operacional no log', async () => {
  const { handler, deliver, logs } = setup({ limits: { globalDay: 3 } });
  for (let i = 1; i <= 3; i++) await handler(event({ ip: `198.51.100.${i}`, body: valid({ idSolicitacao: uuid(i) }) }));
  const over = await handler(event({ ip: '198.51.100.50', body: valid({ idSolicitacao: uuid(4) }) }));
  assert.equal(over.statusCode, 429);
  assert.equal(deliver.outbox.length, 3);
  assert.match(logs.at(-1), /"alerta":"limite-diario"/);
});

test('desafio recusado → 403; serviço do desafio indisponível → 503 recuperável; nada entregue', async () => {
  const bad = setup({ challenge: async () => ({ ok: false, temporario: false, motivo: 'invalid-input-response' }) });
  const r1 = await bad.handler(event());
  assert.equal(r1.statusCode, 403);
  assert.equal(json(r1).codigo, 'desafio-invalido');
  const down = setup({ challenge: async () => ({ ok: false, temporario: true, motivo: 'rede' }) });
  const r2 = await down.handler(event());
  assert.equal(r2.statusCode, 503);
  assert.equal(json(r2).recuperavel, true);
  assert.equal(bad.deliver.outbox.length + down.deliver.outbox.length, 0);
});

test('Turnstile: segredo e token no corpo (nunca na URL), idempotency_key = id do pedido, hostname conferido', async () => {
  const calls = [];
  const fake = (response) => async (url, init) => {
    calls.push({ url, body: String(init.body) });
    if (response instanceof Error) throw response;
    return { ok: true, json: async () => response };
  };
  const ok = turnstileVerifier({ secret: 'segredo-turnstile', hostnames: ['nekkora.com'], fetchImpl: fake({ success: true, hostname: 'nekkora.com' }) });
  assert.deepEqual(await ok({ token: 'tok', ip: '203.0.113.7', idempotencyKey: 'id-1' }), { ok: true });
  assert.equal(calls[0].url, TURNSTILE_VERIFY_URL);
  const form = new URLSearchParams(calls[0].body);
  assert.equal(form.get('secret'), 'segredo-turnstile');
  assert.equal(form.get('response'), 'tok');
  assert.equal(form.get('idempotency_key'), 'id-1');
  const other = turnstileVerifier({ secret: 's', hostnames: ['nekkora.com'], fetchImpl: fake({ success: true, hostname: 'atacante.example' }) });
  assert.equal((await other({ token: 't' })).ok, false);
  const refused = turnstileVerifier({ secret: 's', hostnames: ['nekkora.com'], fetchImpl: fake({ success: false, 'error-codes': ['timeout-or-duplicate'] }) });
  assert.deepEqual(await refused({ token: 't' }), { ok: false, temporario: false, motivo: 'timeout-or-duplicate' });
  const offline = turnstileVerifier({ secret: 's', hostnames: ['nekkora.com'], fetchImpl: fake(new Error('ECONNRESET')) });
  assert.equal((await offline({ token: 't' })).temporario, true);
  assert.equal((await ok({ token: '' })).ok, false, 'sem token não consulta a Cloudflare');
});

// --------------------------------------------------------------------------------------------- logs
test('logs operacionais sem dados pessoais, IP, token ou segredo — em todos os cenários', async () => {
  const all = [];
  const scenarios = [
    setup(),
    setup({ challenge: async () => ({ ok: false, temporario: false, motivo: 'x' }) }),
  ];
  for (const s of scenarios) {
    await s.handler(event());
    await s.handler(event());
    await s.handler(event({ body: valid({ email: 'x' }) }));
    await s.handler(event({ origin: 'https://atacante.example' }));
    s.deliver.failWith('temporaria');
    await s.handler(event({ body: valid({ idSolicitacao: uuid(9) }) }));
    all.push(...s.logs);
  }
  assert.ok(all.length >= 10);
  for (const line of all) {
    const rec = JSON.parse(line);
    assert.deepEqual(Object.keys(rec).filter((k) => !['evento', 'requestId', 'status', 'resultado', 'latenciaMs', 'id', 'motivo', 'campo', 'alerta', 'aviso'].includes(k)), [], line);
    for (const v of [...PII, 'segredo-de-teste']) assert.ok(!line.includes(v), `log com "${v}": ${line}`);
  }
});

// --------------------------------------------------------------------------------------------- adaptadores AWS (simulados)
test('SES: remetente e destinatário fixos, Reply-To do visitante; limitação → erro temporário', async () => {
  const sent = [];
  let fail = null;
  const client = {
    async send(cmd) {
      assert.ok(cmd instanceof SendEmailCommand);
      if (fail) throw Object.assign(new Error('x'), { name: fail });
      sent.push(cmd.input);
      return { MessageId: 'm-1' };
    },
  };
  const deliver = sesProvider({ client, SendEmailCommand, from: 'formulario@nekkora.com', to: 'contato@nekkora.com' });
  assert.equal(await deliver({ subject: 'S', text: 'T' }, { replyTo: 'p@empresa-ficticia.com.br' }), 'm-1');
  assert.deepEqual(sent[0].Destination, { ToAddresses: ['contato@nekkora.com'] });
  assert.equal(sent[0].FromEmailAddress, 'formulario@nekkora.com');
  assert.deepEqual(sent[0].ReplyToAddresses, ['p@empresa-ficticia.com.br']);
  assert.equal(sent[0].Content.Simple.Body.Html, undefined, 'só texto');
  fail = 'TooManyRequestsException';
  await assert.rejects(deliver({ subject: 'S', text: 'T' }, { replyTo: 'p@x.com' }), (e) => e.kind === 'temporaria');
  fail = 'MessageRejected';
  await assert.rejects(deliver({ subject: 'S', text: 'T' }, { replyTo: 'p@x.com' }), (e) => e.kind === 'permanente' && !String(e.message).includes('p@x.com'));
});

/** DynamoDB simulado com a semântica de condição e ADD que o armazenamento usa. */
function fakeDynamo() {
  const items = new Map();
  const ops = [];
  return {
    items,
    ops,
    async send(cmd) {
      const i = cmd.input;
      ops.push(cmd.constructor.name);
      const key = i.Key?.pk.S ?? i.Item?.pk.S;
      if (cmd instanceof PutItemCommand) {
        const cur = items.get(key);
        const now = Number(i.ExpressionAttributeValues[':agora'].N);
        if (cur && Number(cur.expira.N) >= now) throw Object.assign(new Error('cond'), { name: 'ConditionalCheckFailedException' });
        items.set(key, structuredClone(i.Item));
        return {};
      }
      if (cmd instanceof GetItemCommand) return { Item: items.get(key) };
      if (cmd instanceof DeleteItemCommand) return items.delete(key), {};
      if (cmd instanceof UpdateItemCommand) {
        const cur = items.get(key) ?? { pk: { S: key } };
        if (i.UpdateExpression.startsWith('ADD')) {
          cur.contagem = { N: String(Number(cur.contagem?.N ?? 0) + 1) };
          cur.expira ??= i.ExpressionAttributeValues[':expira'];
        } else {
          cur.estado = i.ExpressionAttributeValues[':e'];
          cur.protocolo = i.ExpressionAttributeValues[':p'];
        }
        items.set(key, cur);
        return { Attributes: { contagem: cur.contagem } };
      }
      throw new Error(`comando inesperado ${cmd.constructor.name}`);
    },
  };
}
const commands = { PutItemCommand, GetItemCommand, UpdateItemCommand, DeleteItemCommand };

test('DynamoDB: claim condicional, entregue, liberação após falha, contador e item vencido', async () => {
  let clock = 1_800_000_000_000;
  const client = fakeDynamo();
  const store = dynamoStore({ client, table: 't', commands, now: () => clock });
  assert.deepEqual(await store.claim('a', 'f1', 60), { state: 'novo' });
  assert.equal((await store.claim('a', 'f1', 60)).state, 'processando');
  await store.complete('a', 'NK-00000001');
  assert.deepEqual(await store.claim('a', 'f1', 60), { state: 'entregue', protocolo: 'NK-00000001', fingerprint: 'f1' });
  await store.release('a');
  assert.deepEqual(await store.claim('a', 'f1', 60), { state: 'novo' });
  clock += 61_000; // TTL do DynamoDB apaga com atraso: item vencido conta como inexistente
  assert.deepEqual(await store.claim('a', 'f2', 60), { state: 'novo' });
  assert.equal(await store.increment('ip#x', 60), 1);
  assert.equal(await store.increment('ip#x', 60), 2);
  // nenhum dado pessoal no armazenamento: só ids, hashes, protocolo e contadores
  assert.ok(![...client.items.keys()].some((k) => /@|Pessoa/.test(k)));
});

test('Lambda montado com clientes simulados: segredos do SSM, 202 de ponta a ponta, nada da configuração no log', async () => {
  const env = {
    ORIGENS_PERMITIDAS: ORIGIN,
    DESTINO: 'contato@nekkora.com',
    REMETENTE: 'formulario@nekkora.com',
    TABELA: 'nekkora-commercial-solicitacoes',
    PARAMETRO_TURNSTILE: '/nekkora-commercial/solicitacoes/turnstile',
    PARAMETRO_SEGREDO_IP: '/nekkora-commercial/solicitacoes/segredo-ip',
    HOSTNAMES_DESAFIO: 'nekkora.com',
  };
  const params = [];
  const ssm = {
    async send(cmd) {
      assert.ok(cmd instanceof GetParameterCommand);
      assert.equal(cmd.input.WithDecryption, true);
      params.push(cmd.input.Name);
      return { Parameter: { Value: cmd.input.Name.endsWith('turnstile') ? 'segredo-turnstile-simulado' : 'segredo-ip-simulado-com-mais-de-32-caracteres' } };
    },
  };
  const sent = [];
  const ses = { send: async (cmd) => (sent.push(cmd.input), { MessageId: 'm' }) };
  const logs = [];
  const fetchImpl = async () => ({ ok: true, json: async () => ({ success: true, hostname: 'nekkora.com' }) });
  const handler = await buildHandler({ env, clients: { ssm, ses, dynamo: fakeDynamo() }, fetchImpl, log: (l) => logs.push(l) });
  const res = await handler(event());
  assert.equal(res.statusCode, 202, res.body);
  assert.deepEqual(params.sort(), [env.PARAMETRO_SEGREDO_IP, env.PARAMETRO_TURNSTILE].sort());
  assert.deepEqual(sent[0].Destination.ToAddresses, ['contato@nekkora.com']);
  assert.ok(!logs.join('').includes('segredo'));
});

test('configuração do Lambda: recusa origem http, curinga, e-mail inválido e variável ausente', () => {
  const base = { ORIGENS_PERMITIDAS: ORIGIN, DESTINO: 'contato@nekkora.com', REMETENTE: 'formulario@nekkora.com', TABELA: 't', PARAMETRO_TURNSTILE: 'a', PARAMETRO_SEGREDO_IP: 'b', HOSTNAMES_DESAFIO: 'nekkora.com' };
  assert.equal(configFromEnv(base).to, 'contato@nekkora.com');
  assert.throws(() => configFromEnv({ ...base, ORIGENS_PERMITIDAS: 'http://nekkora.com' }), /origem inválida/);
  assert.throws(() => configFromEnv({ ...base, ORIGENS_PERMITIDAS: '*' }), /origem inválida/);
  assert.throws(() => configFromEnv({ ...base, DESTINO: 'contato' }), /DESTINO e REMETENTE/);
  assert.throws(() => configFromEnv({ ...base, TABELA: '' }), /TABELA ausente/);
  assert.throws(() => configFromEnv({ ...base, LIMITE_DIARIO: '100000' }), /LIMITE_DIARIO/);
});

// --------------------------------------------------------------------------------------------- IAM
const root = resolve('.');
const render = (file) =>
  JSON.parse(
    readFileSync(join(root, 'deploy/aws/solicitacoes', file), 'utf8').replace(/\$\{([A-Z0-9_]+)\}/g, (_, k) => ({
      AWS_ACCOUNT_ID: '111122223333',
      AWS_REGION: 'us-east-1',
      DYNAMODB_TABLE: 'nekkora-commercial-solicitacoes',
      SES_IDENTITY: 'nekkora.com',
      SES_FROM: 'formulario@nekkora.com',
      SES_TO: 'contato@nekkora.com',
    })[k] ?? assert.fail(`variável sem valor de teste: ${k}`)),
  );

test('IAM da função: permissões mínimas — sem curingas, sem administração, e-mail só do remetente fixo para a caixa fixa', () => {
  const policy = render('permissoes-lambda.json');
  const actions = policy.Statement.flatMap((s) => [].concat(s.Action));
  const resources = policy.Statement.flatMap((s) => [].concat(s.Resource));
  assert.ok(policy.Statement.every((s) => s.Effect === 'Allow'));
  assert.ok(!actions.some((a) => a.includes('*')), `ação com curinga: ${actions}`);
  assert.ok(!resources.some((r) => r === '*' || /:\*$/.test(r.replace(/:log-group:[^:]+:\*$/, ''))), `recurso amplo: ${resources}`);
  assert.deepEqual(actions.sort(), ['dynamodb:DeleteItem', 'dynamodb:GetItem', 'dynamodb:PutItem', 'dynamodb:UpdateItem', 'logs:CreateLogStream', 'logs:PutLogEvents', 'ses:SendEmail', 'ssm:GetParameter'].sort());
  assert.ok(!actions.some((a) => /^(iam|sts|s3|cloudfront|lambda|kms):/.test(a)));
  const ses = policy.Statement.find((s) => [].concat(s.Action).includes('ses:SendEmail'));
  assert.equal(ses.Condition.StringEquals['ses:FromAddress'], 'formulario@nekkora.com');
  assert.deepEqual(ses.Condition['ForAllValues:StringEquals']['ses:Recipients'], ['contato@nekkora.com']);
  const trust = render('confianca-lambda.json');
  assert.deepEqual(trust.Statement[0].Principal, { Service: 'lambda.amazonaws.com' });
  assert.equal(trust.Statement[0].Condition.StringEquals['aws:SourceAccount'], '111122223333');
});
