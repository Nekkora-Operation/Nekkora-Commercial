/**
 * Publicação (scripts/aws/publicar.mjs) e rollback (scripts/aws/rollback.mjs) contra o S3/CloudFront SIMULADOS de
 * aws-simulado.mjs. Prova a estratégia — ordem, imutabilidade, consistência em falha, concorrência, validação do destino
 * do rollback — sem acessar a AWS. NÃO equivale a um deploy ou rollback real (COM-RELEASE-003 §11.3).
 */
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { responseHeadersPolicy } from '../../deploy/aws/cabecalhos.mjs';
import { CURRENT_KEY, HISTORY_KEY, manifestKey, snapshotKey } from '../aws/plano.mjs';
import { publicar } from '../aws/publicar.mjs';
import { rollback } from '../aws/rollback.mjs';
import { fakeCloudFront, fakeS3 } from './aws-simulado.mjs';

const tmp = mkdtempSync(join(tmpdir(), 'aws-publicacao-'));
after(() => rmSync(tmp, { recursive: true, force: true }));
const HASH = "'sha256-JDd2nuaninfZZDJOM3fEvC7cCoIy0w7m1A5JfhKL6tE='";
const commitOf = (label) => createHash('sha1').update(label).digest('hex');
const quiet = () => {};

/** Build sintético no formato do Vite: index.html → assets com hash; release.json com o commit. */
function makeDist(label, { assetName = `app-${label.padEnd(8, 'x').slice(0, 8)}.js`, extra = {}, release = {} } = {}) {
  const dir = join(tmp, label);
  mkdirSync(join(dir, 'assets'), { recursive: true });
  const html = `<!doctype html><html><head><script type="module" src="/assets/${assetName}"></script><link rel="stylesheet" href="/assets/base-Aa1Bb2Cc.css"><link rel="icon" href="/favicon.svg"></head><body>${label}</body></html>`;
  const files = {
    'index.html': html,
    '404.html': '<!doctype html><h1>Página não encontrada</h1>',
    'favicon.svg': '<svg xmlns="http://www.w3.org/2000/svg"/>',
    'robots.txt': 'User-agent: *\nAllow: /\n',
    [`assets/${assetName}`]: `console.log(${JSON.stringify(label)})`,
    'assets/base-Aa1Bb2Cc.css': 'body{margin:0}',
    'release.json': JSON.stringify({ aplicacao: 'nekkora-commercial@teste', commit: commitOf(label), arvoreLimpa: true, homologacao: false, publicacao: 'publicacao.json', nekkoraLib: { versao: '0.2.0' }, cspScriptHashes: [HASH], ...release }),
    ...extra,
  };
  for (const [k, v] of Object.entries(files)) writeFileSync(join(dir, k), v);
  return { dir, commit: commitOf(label), asset: `assets/${assetName}` };
}

const env = () => {
  const store = fakeS3();
  const cdn = fakeCloudFront(responseHeadersPolicy([HASH]));
  const run = (dist, extra = {}) => publicar({ dist: dist.dir, store, cdn, policyId: 'politica', actor: 'titular', run: 'https://github.com/x/actions/runs/1', log: quiet, now: () => new Date('2026-10-22T20:00:00Z'), ...extra });
  return { store, cdn, run };
};
const json = (store, key) => JSON.parse(store.text(key));

test('primeira publicação: raiz completa, metadados, cópia da release, manifesto e registro', async () => {
  const { store, cdn, run } = env();
  const a = makeDist('release-a');
  const r = await run(a);
  assert.equal(r.commit, a.commit);
  // Raiz: exatamente os arquivos do build, com tipo, cache e checksum
  assert.deepEqual(store.rootKeys(), ['404.html', 'assets/app-release-.js', 'assets/base-Aa1Bb2Cc.css', 'favicon.svg', 'index.html', 'release.json', 'robots.txt']);
  assert.equal((await store.head('index.html')).cacheControl, 'no-cache');
  assert.equal((await store.head('index.html')).contentType, 'text/html; charset=utf-8');
  assert.equal((await store.head(a.asset)).cacheControl, 'public, max-age=31536000, immutable');
  assert.equal((await store.head(a.asset)).contentType, 'text/javascript; charset=utf-8');
  // Cópia (só arquivos sem hash) + manifesto
  assert.ok(store.objects.has(snapshotKey(a.commit, 'index.html')));
  assert.ok(!store.objects.has(snapshotKey(a.commit, a.asset)), 'assets com hash não são duplicados');
  const m = json(store, manifestKey(a.commit));
  assert.equal(m.commit, a.commit);
  assert.equal(m.arquivos.length, 7);
  assert.match(m.hashDoArtefato, /^[0-9a-f]{64}$/);
  assert.deepEqual(m.cspScriptHashes, [HASH]);
  // Estado e histórico
  assert.equal(json(store, CURRENT_KEY).commit, a.commit);
  assert.deepEqual(json(store, HISTORY_KEY).map((e) => [e.tipo, e.commit, e.de, e.ator]), [['publicacao', a.commit, null, 'titular']]);
  // Invalidação só dos caminhos sem hash
  assert.equal(cdn.invalidations.length, 1);
  assert.ok(cdn.invalidations[0].paths.includes('/') && cdn.invalidations[0].paths.includes('/index.html'));
  assert.ok(!cdn.invalidations[0].paths.some((p) => p.startsWith('/assets/')));
});

test('ordem: assets e manifesto antes de qualquer arquivo de entrada; index.html e release.json por último', async () => {
  const { store, run } = env();
  const a = makeDist('ordem');
  await run(a);
  const puts = store.ops.filter(([op]) => op === 'put').map(([, k]) => k);
  const pos = (k) => puts.indexOf(k);
  assert.ok(pos(a.asset) < pos('404.html') && pos(manifestKey(a.commit)) < pos('404.html'));
  const rootMutable = puts.filter((k) => !k.startsWith('_releases/') && !k.startsWith('assets/'));
  assert.deepEqual(rootMutable.slice(-2), ['index.html', 'release.json']);
  assert.ok(!store.ops.some(([op]) => op === 'delete'), 'nenhuma exclusão');
});

test('republicar o mesmo commit é idempotente: nada trocado, nada invalidado', async () => {
  const { store, cdn, run } = env();
  const a = makeDist('idempotente');
  await run(a);
  const r = await run(a);
  assert.deepEqual(r.changed, []);
  assert.equal(cdn.invalidations.length, 1);
  assert.equal(json(store, HISTORY_KEY).length, 2);
});

test('segunda release: assets anteriores continuam no bucket (cache e rollback) e só o que mudou é invalidado', async () => {
  const { store, cdn, run } = env();
  const a = makeDist('rel-a1', { assetName: 'app-AAAAAAAA.js' });
  const b = makeDist('rel-b1', { assetName: 'app-BBBBBBBB.js' });
  await run(a);
  const r = await run(b);
  assert.ok(store.objects.has('assets/app-AAAAAAAA.js') && store.objects.has('assets/app-BBBBBBBB.js'));
  assert.match(store.text('index.html'), /app-BBBBBBBB/);
  assert.deepEqual(r.changed.sort(), ['index.html', 'release.json']);
  assert.deepEqual(cdn.invalidations[1].paths, ['/', '/index.html', '/release.json']);
  assert.deepEqual(json(store, HISTORY_KEY).map((e) => [e.commit, e.de]), [[a.commit, null], [b.commit, a.commit]]);
});

test('bloqueia: asset com o mesmo nome e outro conteúdo — e a raiz não muda', async () => {
  const { store, run } = env();
  const a = makeDist('conf-a', { assetName: 'app-CCCCCCCC.js' });
  await run(a);
  const before = store.text('index.html');
  const b = makeDist('conf-b', { assetName: 'app-CCCCCCCC.js' }); // mesmo nome, conteúdo diferente
  await assert.rejects(run(b), /já existe com outro conteúdo/);
  assert.equal(store.text('index.html'), before);
  assert.equal(json(store, CURRENT_KEY).commit, a.commit);
});

test('bloqueia antes de gravar: CSP da distribuição não aceita os scripts do artefato', async () => {
  const { store, cdn, run } = env();
  cdn.policy = responseHeadersPolicy(["'sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='"]);
  await assert.rejects(run(makeDist('csp')), /Response Headers Policy da distribuição não corresponde/);
  assert.equal(store.ops.filter(([op]) => op === 'put').length, 0);
});

test('bloqueia: sem o ID da política de cabeçalhos não há publicação', async () => {
  const { run } = env();
  await assert.rejects(run(makeDist('sem-politica'), { policyId: null }), /AWS_RESPONSE_HEADERS_POLICY_ID/);
});

test('bloqueia: artefato de homologação e mesmo commit com artefato diferente', async () => {
  const { run } = env();
  await assert.rejects(run(makeDist('homolog', { release: { homologacao: true } })), /homologação/);
  const a = makeDist('mesmo-commit');
  await run(a);
  const other = makeDist('mesmo-commit-2', { release: { commit: a.commit } });
  await assert.rejects(run(other), /já foi publicado com outro artefato/);
});

test('falha no meio da troca: o site continua íntegro (index antigo + seus assets), estado não avança', async () => {
  const { store, run } = env();
  const a = makeDist('falha-a', { assetName: 'app-DDDDDDDD.js' });
  await run(a);
  const b = makeDist('falha-b', { assetName: 'app-EEEEEEEE.js' });
  store.failNext('put', 'index.html');
  await assert.rejects(run(b), /falha simulada/);
  // index.html continua o de A e tudo o que ele referencia existe
  assert.match(store.text('index.html'), /app-DDDDDDDD/);
  assert.ok(store.objects.has('assets/app-DDDDDDDD.js'));
  assert.equal(json(store, CURRENT_KEY).commit, a.commit);
  // repetir a publicação conclui normalmente
  const r = await run(b);
  assert.match(store.text('index.html'), /app-EEEEEEEE/);
  assert.equal(r.commit, b.commit);
});

test('concorrência: outra operação alterou atual.json → interrompe antes de trocar a raiz', async () => {
  const { store, run } = env();
  const a = makeDist('conc-a');
  await run(a);
  const b = makeDist('conc-b');
  // simula outra execução gravando atual.json no meio desta (logo depois do manifesto)
  const originalPut = store.put;
  store.put = async (key, body, opts) => {
    const r = await originalPut(key, body, opts);
    if (key === manifestKey(b.commit)) await originalPut(CURRENT_KEY, Buffer.from('{"commit":"outro"}'), {});
    return r;
  };
  await assert.rejects(run(b), /alterou _releases\/atual\.json/);
  assert.doesNotMatch(store.text('index.html'), /conc-b/);
});

test('o bucket recusa gravar asset sem If-None-Match (política de escrita única)', async () => {
  const store = fakeS3();
  await assert.rejects(store.put('assets/x-AAAAAAAA.js', 'x', {}), /AccessDenied/);
});

// ------------------------------------------------------------------------------------------------ rollback
async function twoReleases() {
  const e = env();
  const a = makeDist('rb-a', { assetName: 'app-FFFFFFFF.js', extra: { 'antigo.txt': 'só na A' } });
  const b = makeDist('rb-b', { assetName: 'app-GGGGGGGG.js' });
  await e.run(a);
  await e.run(b);
  const rb = (extra = {}) => rollback({ store: e.store, cdn: e.cdn, reason: 'teste', actor: 'titular', run: 'run-rb', log: quiet, now: () => new Date('2026-10-23T10:00:00Z'), ...extra });
  return { ...e, a, b, rb };
}

test('rollback sem destino: volta para a release anterior aprovada, confere a raiz e registra', async () => {
  const { store, cdn, a, b, rb } = await twoReleases();
  const r = await rb();
  assert.equal(r.target, a.commit);
  assert.match(store.text('index.html'), /app-FFFFFFFF/);
  assert.equal(json(store, 'release.json').commit, a.commit);
  assert.equal(json(store, CURRENT_KEY).commit, a.commit);
  const last = json(store, HISTORY_KEY).at(-1);
  assert.deepEqual([last.tipo, last.commit, last.de, last.motivo, last.ator], ['rollback', a.commit, b.commit, 'teste', 'titular']);
  assert.deepEqual(cdn.invalidations.at(-1).paths, ['/', '/index.html', '/release.json']);
  // a restauração é feita por cópia no servidor, index.html e release.json por último
  const copies = store.ops.filter(([op]) => op === 'copy').map(([, k]) => k.split(' → ')[1]);
  assert.deepEqual(copies.slice(-2), ['index.html', 'release.json']);
});

test('rollback para commit informado; recusa commit nunca publicado, destino igual ao atual e motivo vazio', async () => {
  const { a, b, rb } = await twoReleases();
  await assert.rejects(rb({ target: commitOf('nunca') }), /nunca foi publicado/);
  await assert.rejects(rb({ target: b.commit }), /já é a release atual/);
  await assert.rejects(rb({ target: 'abc123' }), /hash completo/);
  await assert.rejects(rb({ reason: '  ' }), /motivo/);
  const r = await rb({ target: a.commit });
  assert.equal(r.target, a.commit);
});

test('rollback recusa destino corrompido ou incompleto — e não toca na raiz', async () => {
  for (const damage of [
    (s, a) => s.tamper(snapshotKey(a.commit, 'index.html'), '<html>alterado</html>'),
    // conteúdo alterado com o checksum antigo nos metadados: a validação confere o conteúdo, não só o metadado
    (s, a) => s.tamper(snapshotKey(a.commit, 'release.json'), '{"commit":"adulterado"}', { keepChecksum: true }),
    (s) => s.tamper('assets/app-FFFFFFFF.js', 'alert(1)'),
    (s) => s.objects.delete('assets/app-FFFFFFFF.js'),
    (s, a) => s.tamper(manifestKey(a.commit), '{"commit":"x"}'),
  ]) {
    const { store, a, b, rb } = await twoReleases();
    damage(store, a);
    await assert.rejects(rb(), /não pode ser restaurada|inconsistente/);
    assert.equal(json(store, 'release.json').commit, b.commit);
    assert.equal(store.ops.filter(([op]) => op === 'copy').length, 0);
  }
});

test('rollback --simular valida e não grava nada', async () => {
  const { store, b, rb } = await twoReleases();
  const puts = store.ops.length;
  const r = await rb({ dryRun: true });
  assert.equal(r.dryRun, true);
  assert.ok(store.ops.slice(puts).every(([op]) => op === 'get' || op === 'head'));
  assert.equal(json(store, CURRENT_KEY).commit, b.commit);
});

test('rollback sem release anterior ou sem publicação: erro claro', async () => {
  const { store, run } = env();
  await assert.rejects(rollback({ store, reason: 'x', log: quiet }), /não há release publicada/);
  await run(makeDist('unica'));
  await assert.rejects(rollback({ store, reason: 'x', log: quiet }), /não há release anterior/);
});

test('publicar depois de um rollback: a release nova entra normalmente e o histórico guarda tudo', async () => {
  const { store, a, b, rb, run } = await twoReleases();
  await rb();
  const c = makeDist('rb-c', { assetName: 'app-HHHHHHHH.js' });
  await run(c);
  assert.deepEqual(json(store, HISTORY_KEY).map((e) => `${e.tipo}:${e.commit.slice(0, 4)}`), [`publicacao:${a.commit.slice(0, 4)}`, `publicacao:${b.commit.slice(0, 4)}`, `rollback:${a.commit.slice(0, 4)}`, `publicacao:${c.commit.slice(0, 4)}`]);
  // os três conjuntos de assets continuam disponíveis
  for (const k of ['assets/app-FFFFFFFF.js', 'assets/app-GGGGGGGG.js', 'assets/app-HHHHHHHH.js']) assert.ok(store.objects.has(k));
});
