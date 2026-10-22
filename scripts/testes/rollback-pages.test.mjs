/**
 * Teste do scripts/rollback-pages.mjs contra uma API do Cloudflare Pages SIMULADA (servidor local) e um "domínio"
 * local que passa a servir o release.json do deploy de destino quando o rollback é chamado.
 * Não substitui o teste na conta real (pendente da titular): prova a lógica de escolha do destino, a chamada de
 * rollback e a verificação pública.   node --test scripts/testes/
 */
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';

const deployments = [
  { id: 'd3', environment: 'production', created_on: '2026-10-22T12:00:00Z', latest_stage: { status: 'success' }, deployment_trigger: { metadata: { commit_hash: 'ccccccc3333' } } },
  { id: 'd2-falhou', environment: 'production', created_on: '2026-10-21T12:00:00Z', latest_stage: { status: 'failure' }, deployment_trigger: { metadata: { commit_hash: 'bbbbbbb2222' } } },
  { id: 'd1', environment: 'production', created_on: '2026-10-20T12:00:00Z', latest_stage: { status: 'success' }, deployment_trigger: { metadata: { commit_hash: 'aaaaaaa1111' } } },
  { id: 'p1', environment: 'preview', created_on: '2026-10-21T18:00:00Z', latest_stage: { status: 'success' }, deployment_trigger: { metadata: { commit_hash: 'eeeeeee5555' } } },
];
let canonical = 'd3';
const calls = [];
let server;
let url;

before(async () => {
  server = createServer((req, res) => {
    calls.push(`${req.method} ${req.url}`);
    const json = (status, body) => res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(body));
    if (req.headers.authorization !== 'Bearer token-de-teste' && req.url.startsWith('/api/')) return json(403, { success: false, errors: [{ message: 'auth' }] });
    const p = '/api/accounts/conta/pages/projects/nekkora-commercial';
    if (req.url === p) return json(200, { success: true, result: { canonical_deployment: deployments.find((d) => d.id === canonical) } });
    if (req.url === `${p}/deployments?env=production`) return json(200, { success: true, result: deployments });
    const m = new RegExp(`^${p}/deployments/([\\w-]+)/rollback$`).exec(req.url);
    if (m && req.method === 'POST') {
      canonical = m[1];
      return json(200, { success: true, result: { id: m[1] } });
    }
    // "Domínio": serve o release.json do deploy canônico
    if (req.url === '/site/release.json') return json(200, { commit: deployments.find((d) => d.id === canonical).deployment_trigger.metadata.commit_hash + '000' });
    return json(404, { success: false });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  url = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

// Assíncrono: o servidor simulado roda neste mesmo processo e precisa responder enquanto o script executa.
const run = (extra = {}) =>
  new Promise((done) => {
    const child = execFile(process.execPath, ['scripts/rollback-pages.mjs'], {
    encoding: 'utf8',
    env: { ...process.env, CF_API: `${url}/api`, DOMINIO: `${url}/site`, CLOUDFLARE_API_TOKEN: 'token-de-teste', CLOUDFLARE_ACCOUNT_ID: 'conta', PROJECT: 'nekkora-commercial', MOTIVO: 'teste', ESPERA_MS: '50', TENTATIVAS: '5', ...extra },
    }, (err, stdout, stderr) => done({ status: err ? (err.code ?? 1) : 0, stdout, stderr }));
    void child;
  });

test('sem destino: volta para o deploy de produção bem-sucedido anterior (pula falhos e previews)', async () => {
  canonical = 'd3';
  const r = await run();
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.equal(canonical, 'd1');
  assert.match(r.stdout, /destino: d1/);
  assert.match(r.stdout, /verificado: .* serve o commit aaaaaaa1111/);
});

test('com destino explícito', async () => {
  canonical = 'd1';
  const r = await run({ DESTINO: 'd3' });
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.equal(canonical, 'd3');
});

test('destino inexistente, falho ou de preview é recusado sem chamar o rollback', async () => {
  canonical = 'd3';
  for (const id of ['nao-existe', 'd2-falhou', 'p1']) {
    const before = calls.filter((c) => c.endsWith('/rollback')).length;
    const r = await run({ DESTINO: id });
    assert.notEqual(r.status, 0);
    assert.equal(calls.filter((c) => c.endsWith('/rollback')).length, before, id);
  }
  assert.equal(canonical, 'd3');
});

test('sem deploy anterior: falha sem chamar o rollback', async () => {
  canonical = 'd1';
  const before = calls.filter((c) => c.endsWith('/rollback')).length;
  const r = await run();
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /não há deploy de produção anterior/);
  assert.equal(calls.filter((c) => c.endsWith('/rollback')).length, before);
});

test('token errado: falha', async () => {
  const r = await run({ CLOUDFLARE_API_TOKEN: 'errado' });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /HTTP 403/);
});
