#!/usr/bin/env node
/**
 * Verificação pós-publicação (COM-RELEASE-003-C §6.1 item 9, D §7.4) — compara o que o site SERVE com o que deveria:
 *
 *   - release.json do commit esperado; index.html e cada arquivo do build com o SHA-256 do artefato;
 *   - Content-Type e Cache-Control de cada arquivo (assets imutáveis; documento sempre revalidado);
 *   - cabeçalhos de segurança idênticos aos de deploy/aws/cabecalhos.mjs (CSP com os hashes do artefato);
 *   - página inexistente → 404 com a página de erro (nunca 200); _releases/ nunca servido;
 *   - bucket fechado: o endereço direto do S3 recusa a leitura (403);
 *   - opcionalmente: http → https e www → apex.
 *
 *   node scripts/aws/verificar-site.mjs --base https://nekkora.com (--dist dist | --manifesto arquivo.json)
 *                                       [--bucket-url URL] [--www URL] [--http URL] [--tentativas N]
 * Saída 1 se algo divergir. Usado pelos workflows de deploy e rollback e, nos testes, contra o servidor local.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { securityHeaders } from '../../deploy/aws/cabecalhos.mjs';
import { planFromDist } from './plano.mjs';

const sha = (buf) => createHash('sha256').update(buf).digest('base64');

/** O que deve estar no ar: o build local (--dist) ou o manifesto de uma release (--manifesto, usado no rollback). */
export function expectedFrom({ dist, manifest }) {
  if (manifest) {
    return {
      commit: manifest.commit,
      cspScriptHashes: manifest.cspScriptHashes ?? [],
      cspOrigens: manifest.cspOrigens,
      files: manifest.arquivos.map((f) => ({ key: f.caminho, sha256: f.sha256, contentType: f.contentType, cacheControl: f.cacheControl })),
    };
  }
  const plan = planFromDist(dist);
  return { commit: plan.commit, cspScriptHashes: plan.release.cspScriptHashes ?? [], cspOrigens: plan.release.cspOrigens, files: plan.files };
}

export async function verifySite({ base, dist = null, manifest = null, bucketUrl = null, wwwUrl = null, httpUrl = null, tries = 1, waitMs = 10000, fetchImpl = fetch, log = console.log }) {
  const plan = expectedFrom({ dist, manifest });
  const expectedHeaders = securityHeaders(plan.cspScriptHashes, plan.cspOrigens);
  const url = (p) => new URL(p, base).href;
  const get = async (p, init) => {
    const r = await fetchImpl(url(p), { redirect: 'manual', cache: 'no-store', ...init });
    return { status: r.status, headers: r.headers, body: Buffer.from(await r.arrayBuffer()) };
  };

  // Propagação: espera o release.json do commit esperado (até `tries` tentativas)
  let served = null;
  for (let i = 0; i < tries; i++) {
    const r = await get('release.json').catch(() => null);
    try {
      served = r?.status === 200 ? JSON.parse(r.body.toString('utf8')).commit : null;
    } catch {
      served = null;
    }
    if (served === plan.commit) break;
    if (i < tries - 1) await new Promise((res) => setTimeout(res, waitMs));
  }

  const results = [];
  const check = (id, ok, detail = '') => {
    results.push({ id, ok: !!ok, detail });
    log(`${ok ? 'OK  ' : 'FALHA'} ${id}${detail ? ` — ${detail}` : ''}`);
  };
  check('release-json-do-commit', served === plan.commit, `servido ${served ?? '?'} · esperado ${plan.commit}`);

  const home = await get('/');
  check('pagina-inicial-200', home.status === 200 && /text\/html/.test(home.headers.get('content-type') ?? ''), `HTTP ${home.status} ${home.headers.get('content-type')}`);
  const index = plan.files.find((f) => f.key === 'index.html');
  check('pagina-inicial-e-o-index-do-artefato', sha(home.body) === index.sha256);
  const missing = Object.entries(expectedHeaders).filter(([k, v]) => home.headers.get(k) !== v);
  check('cabecalhos-de-seguranca', missing.length === 0, missing.map(([k, v]) => `${k}: "${home.headers.get(k)}" ≠ "${v}"`).join(' | ') || `${Object.keys(expectedHeaders).length} cabeçalhos idênticos`);
  check('documento-revalidado', home.headers.get('cache-control') === 'no-cache', `cache-control: ${home.headers.get('cache-control')}`);

  const broken = [];
  for (const f of plan.files) {
    const r = await get(f.key);
    const problems = [];
    if (r.status !== 200) problems.push(`HTTP ${r.status}`);
    else if (sha(r.body) !== f.sha256) problems.push('conteúdo diferente do artefato');
    if (r.headers.get('content-type') !== f.contentType) problems.push(`content-type ${r.headers.get('content-type')}`);
    if (r.headers.get('cache-control') !== f.cacheControl) problems.push(`cache-control ${r.headers.get('cache-control')}`);
    if (problems.length) broken.push(`${f.key}: ${problems.join(', ')}`);
  }
  check('arquivos-do-artefato-integros', broken.length === 0, broken.join(' | ') || `${plan.files.length} arquivos com hash, tipo e cache esperados`);

  const notFound = await get(`/nao-existe-${Date.now()}`);
  check('inexistente-404-com-pagina-de-erro', notFound.status === 404 && /Página não encontrada/.test(notFound.body.toString('utf8')), `HTTP ${notFound.status}`);
  const internal = await Promise.all(['_releases/atual.json', '_releases/historico.json', `_releases/${plan.commit}/manifest.json`, '%5Freleases/atual.json'].map((p) => get(p)));
  check('prefixo-interno-nao-servido', internal.every((r) => r.status === 404), internal.map((r) => r.status).join(', '));
  check('sem-listagem-do-bucket', !/<ListBucketResult/.test(notFound.body.toString('utf8')) && !/<ListBucketResult/.test((await get('/?list-type=2')).body.toString('utf8')));

  if (bucketUrl) {
    const direct = await fetchImpl(new URL('index.html', bucketUrl).href, { redirect: 'manual' }).catch((e) => ({ status: `erro: ${e.message}` }));
    check('bucket-sem-acesso-publico', direct.status === 403, `GET direto no S3: HTTP ${direct.status}`);
  }
  if (httpUrl) {
    const r = await fetchImpl(httpUrl, { redirect: 'manual' });
    check('http-redireciona-para-https', [301, 302, 307, 308].includes(r.status) && (r.headers.get('location') ?? '').startsWith('https://'), `HTTP ${r.status} → ${r.headers.get('location')}`);
  }
  if (wwwUrl) {
    const r = await fetchImpl(new URL('/precos?x=1', wwwUrl).href, { redirect: 'manual' });
    check('www-redireciona-para-o-dominio', r.status === 301 && r.headers.get('location') === 'https://nekkora.com/precos?x=1', `HTTP ${r.status} → ${r.headers.get('location')}`);
  }
  const failed = results.filter((r) => !r.ok);
  return { ok: failed.length === 0, results, commit: plan.commit };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const argv = process.argv.slice(2);
  const opt = (n) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : null);
  const manifest = opt('--manifesto') ? JSON.parse(readFileSync(opt('--manifesto'), 'utf8')) : null;
  const r = await verifySite({ base: opt('--base'), dist: manifest ? null : (opt('--dist') ?? 'dist'), manifest, bucketUrl: opt('--bucket-url'), wwwUrl: opt('--www'), httpUrl: opt('--http'), tries: Number(opt('--tentativas') ?? 1) });
  console.log(r.ok ? `\nsite confere com o artefato ${r.commit}` : `\n${r.results.filter((x) => !x.ok).length} verificação(ões) falharam`);
  process.exitCode = r.ok ? 0 : 1;
}
