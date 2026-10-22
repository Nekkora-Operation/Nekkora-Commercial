/**
 * Configuração de entrega do CloudFront (COM-RELEASE-003-D) exercitada sobre um build REAL do Commercial:
 *   - a CloudFront Function versionada (www → apex, bloqueio de _releases/);
 *   - a Response Headers Policy versionada = cabeçalhos de deploy/aws/cabecalhos.mjs com a CSP dos scripts do build;
 *   - o servidor local (scripts/servidor-cloudfront-local.mjs) + a verificação pós-publicação
 *     (scripts/aws/verificar-site.mjs), em cenários positivos e negativos.
 * Simulação local: não substitui a verificação contra a distribuição real (COM-RELEASE-004).
 */
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { request } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { securityHeaders } from '../../deploy/aws/cabecalhos.mjs';
import { verifySite } from '../aws/verificar-site.mjs';
import { createCloudFrontServer, headersFromPolicy, loadViewerRequest } from '../servidor-cloudfront-local.mjs';

const root = resolve('.');
const tmp = mkdtempSync(join(tmpdir(), 'cloudfront-local-'));
const dist = join(tmp, 'dist');
const policyFile = join(root, 'deploy/aws/politica-cabecalhos.json');
const servers = [];
const quiet = () => {};

before(() => {
  execFileSync(process.execPath, [join(root, 'node_modules/vite/bin/vite.js'), 'build', '--outDir', dist, '--emptyOutDir', '--logLevel', 'error'], { cwd: root, stdio: 'pipe' });
});
after(() => {
  for (const s of servers) s.close();
  rmSync(tmp, { recursive: true, force: true });
});

async function serve(opts) {
  const server = createCloudFrontServer({ dist, policyFile, ...opts });
  servers.push(server);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return `http://127.0.0.1:${server.address().port}/`;
}
const raw = (base, path, headers = {}, method = 'GET') =>
  new Promise((done, fail) => {
    const req = request(new URL(path, base), { method, headers }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c)).on('end', () => done({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', fail);
    req.end();
  });

test('função viewer-request: www → https://nekkora.com com caminho e query; apex segue', () => {
  const handler = loadViewerRequest();
  const ev = (host, uri, qs = {}) => ({ request: { method: 'GET', uri, querystring: qs, headers: { host: { value: host } } } });
  const r = handler(ev('WWW.nekkora.com', '/precos', { a: { value: '1' }, b: { value: '', multiValue: [{ value: 'x' }, { value: 'y' }] } }));
  assert.equal(r.statusCode, 301);
  assert.equal(r.headers.location.value, 'https://nekkora.com/precos?a=1&b=x&b=y');
  const pass = handler(ev('nekkora.com', '/assets/index-ABCDEFGH.js'));
  assert.equal(pass.uri, '/assets/index-ABCDEFGH.js');
  assert.equal(pass.statusCode, undefined);
});

test('função viewer-request: _releases/ nunca chega ao bucket (inclusive com escape e maiúsculas)', () => {
  const handler = loadViewerRequest();
  for (const uri of ['/_releases/atual.json', '/_releases', '/%5Freleases/historico.json', '/_Releases/x/manifest.json', '/%5f%72eleases/a']) {
    const r = handler({ request: { method: 'GET', uri, querystring: {}, headers: { host: { value: 'nekkora.com' } } } });
    assert.equal(r.uri, '/_bloqueado', uri);
  }
});

test('política versionada = cabeçalhos esperados, com a CSP exata dos scripts inline do build (T12)', () => {
  const release = JSON.parse(readFileSync(join(dist, 'release.json'), 'utf8'));
  assert.ok(release.cspScriptHashes.length >= 1);
  assert.deepEqual(headersFromPolicy(JSON.parse(readFileSync(policyFile, 'utf8'))), securityHeaders(release.cspScriptHashes));
  // todo <script> inline do index.html tem o hash na CSP; nenhum script externo de outra origem
  const html = readFileSync(join(dist, 'index.html'), 'utf8');
  const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].length;
  assert.equal(inline, release.cspScriptHashes.length);
  assert.ok([...html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)].every((m) => m[1].startsWith('/')));
  assert.doesNotMatch(securityHeaders(release.cspScriptHashes)['content-security-policy'], /script-src[^;]*unsafe-inline/);
});

test('servidor local + verificação pós-publicação: o build real passa em tudo (T13, T20)', async () => {
  const base = await serve();
  const r = await verifySite({ base, dist, bucketUrl: new URL('__s3/', base).href, log: quiet });
  assert.ok(r.ok, JSON.stringify(r.results.filter((x) => !x.ok)));
  assert.ok(r.results.length >= 9);
});

test('erros: inexistente → 404 com a página de erro (nunca 200); só "/" usa o objeto raiz; 304 na revalidação', async () => {
  const base = await serve();
  for (const p of ['/nao-existe', '/precos', '/assets/nao-existe-ABCDEFGH.js', '/_releases/atual.json']) {
    const r = await raw(base, p);
    assert.equal(r.status, 404, p);
    assert.match(r.body, /Página não encontrada/);
    assert.equal(r.headers['content-security-policy'] != null, true, 'cabeçalhos de segurança também no erro');
  }
  const home = await raw(base, '/');
  assert.equal(home.status, 200);
  const again = await raw(base, '/', { 'if-none-match': home.headers.etag });
  assert.equal(again.status, 304);
  const www = await raw(base, '/precos?x=1', { host: 'www.nekkora.com' });
  assert.equal(www.status, 301);
  assert.equal(www.headers.location, 'https://nekkora.com/precos?x=1');
});

test('verificação negativa: cabeçalho de segurança ausente na política → falha', async () => {
  const policy = JSON.parse(readFileSync(policyFile, 'utf8'));
  policy.CustomHeadersConfig = { Quantity: 0, Items: [] };
  const broken = join(tmp, 'politica-sem-permissions.json');
  writeFileSync(broken, JSON.stringify(policy));
  const base = await serve({ policyFile: broken });
  const r = await verifySite({ base, dist, log: quiet });
  assert.equal(r.ok, false);
  assert.deepEqual(r.results.filter((x) => !x.ok).map((x) => x.id), ['cabecalhos-de-seguranca']);
});

test('verificação negativa: site servindo outro artefato → release.json e arquivos divergem', async () => {
  const other = join(tmp, 'outro');
  cpSync(dist, other, { recursive: true });
  const rel = JSON.parse(readFileSync(join(other, 'release.json'), 'utf8'));
  writeFileSync(join(other, 'release.json'), JSON.stringify({ ...rel, commit: 'f'.repeat(40) }));
  writeFileSync(join(other, 'index.html'), readFileSync(join(other, 'index.html'), 'utf8').replace('</body>', '<!-- alterado --></body>'));
  const server = createCloudFrontServer({ dist: other, policyFile });
  servers.push(server);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const r = await verifySite({ base: `http://127.0.0.1:${server.address().port}/`, dist, log: quiet });
  const failed = r.results.filter((x) => !x.ok).map((x) => x.id);
  assert.ok(failed.includes('release-json-do-commit') && failed.includes('pagina-inicial-e-o-index-do-artefato') && failed.includes('arquivos-do-artefato-integros'), failed.join(', '));
});

test('verificação negativa: bucket que responde publicamente → falha', async () => {
  const base = await serve();
  const r = await verifySite({ base, dist, bucketUrl: base, log: quiet });
  assert.deepEqual(r.results.filter((x) => !x.ok).map((x) => x.id), ['bucket-sem-acesso-publico']);
});
