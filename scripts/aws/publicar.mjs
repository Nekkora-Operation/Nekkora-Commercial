#!/usr/bin/env node
/**
 * Publicação do Commercial no S3 + CloudFront (COM-RELEASE-003-C) — chamada pelo workflow "Deploy de produção" DEPOIS do
 * portão (scripts/verificar-publicacao.mjs) e da aprovação humana do environment "production".
 *
 * Ordem (nenhum passo apaga nada; a identidade de deploy nem tem s3:DeleteObject):
 *   1. confere o estado atual (_releases/atual.json) e se a CSP da distribuição aceita o artefato;
 *   2. grava a cópia da release em _releases/<commit>/arquivos/ (só os arquivos sem hash; escrita única);
 *   3. grava os assets com hash na raiz com If-None-Match: um nome existente nunca recebe conteúdo diferente;
 *   4. grava o manifesto (_releases/<commit>/manifest.json) — com ele, a release está completa e serve de rollback;
 *   5. confere no bucket o SHA-256 de cada asset (tudo o que o novo index.html usa já está lá);
 *   6. troca os arquivos sem hash da raiz: os demais, depois index.html e, por último, release.json;
 *   7. confere a raiz, registra atual.json e historico.json (If-Match: duas publicações não se sobrepõem);
 *   8. invalida no CloudFront só os caminhos sem hash que mudaram.
 * Uma falha no meio deixa o site no ar: até o passo 6 a raiz não muda; durante o 6, o index.html antigo continua
 * apontando para assets que não são apagados.
 *
 * Uso (o workflow passa tudo por variáveis): AWS_S3_BUCKET, AWS_REGION, AWS_CLOUDFRONT_DISTRIBUTION_ID,
 * AWS_RESPONSE_HEADERS_POLICY_ID, ATOR, EXECUCAO [, VERIFICACOES (JSON)]  →  node scripts/aws/publicar.mjs --dist dist
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { responseHeadersPolicy } from '../../deploy/aws/cabecalhos.mjs';
import {
  CURRENT_KEY,
  HISTORY_KEY,
  buildManifest,
  entryOrder,
  invalidationPaths,
  manifestKey,
  planFromDist,
  referencedPaths,
  snapshotKey,
} from './plano.mjs';

export class FalhaDePublicacao extends Error {}
const fail = (msg) => {
  throw new FalhaDePublicacao(msg);
};

export async function readJson(store, key) {
  const obj = await store.get(key);
  if (!obj) return { value: null, etag: null };
  try {
    return { value: JSON.parse(obj.body.toString('utf8')), etag: obj.etag };
  } catch {
    fail(`${key} não é JSON válido`);
  }
}
const jsonBody = (v) => Buffer.from(`${JSON.stringify(v, null, 2)}\n`);
const JSON_META = { contentType: 'application/json; charset=utf-8', cacheControl: 'no-cache' };

/** Grava uma vez: se a chave já existe, só aceita se o conteúdo for idêntico (SHA-256). */
async function putOnce(store, key, file, log) {
  try {
    await store.put(key, file.body, { contentType: file.contentType, cacheControl: file.cacheControl, sha256: file.sha256, ifNoneMatch: true });
    return 'gravado';
  } catch (e) {
    if (e.code !== 'PRECONDICAO') throw e;
    const existing = await store.head(key);
    if (existing?.sha256 !== file.sha256) fail(`${key} já existe com outro conteúdo (sha256 ${existing?.sha256 ?? '?'} ≠ ${file.sha256}) — um arquivo imutável nunca é sobrescrito`);
    log?.(`  = ${key} (já existia, idêntico)`);
    return 'existente';
  }
}

/** A CSP da Response Headers Policy em uso precisa aceitar os scripts inline deste build — senão a página quebraria. */
export function checkPolicy(live, release) {
  const expected = responseHeadersPolicy(release.cspScriptHashes ?? []).SecurityHeadersConfig.ContentSecurityPolicy.ContentSecurityPolicy;
  const got = live?.SecurityHeadersConfig?.ContentSecurityPolicy?.ContentSecurityPolicy;
  if (got !== expected) {
    fail(`a Response Headers Policy da distribuição não corresponde a este artefato.\n  esperada: ${expected}\n  em uso:   ${got ?? '(sem CSP)'}\n  Atualize a política com deploy/aws/politica-cabecalhos.json ANTES de publicar (docs/release/COM-RELEASE-003-aws.md).`);
  }
}

export async function publicar({ dist, store, cdn, policyId, now = () => new Date(), actor = null, run = null, checks = null, log = console.log }) {
  const plan = planFromDist(dist);
  const { commit } = plan;
  log(`release ${plan.release.aplicacao} · commit ${commit} · ${plan.files.length} arquivos`);
  if (plan.release.homologacao !== false) fail('artefato de homologação (dados sintéticos) não pode ser publicado');

  // 1. Estado atual e política de cabeçalhos
  const current = await readJson(store, CURRENT_KEY);
  log(`atual: ${current.value?.commit ?? '(nenhuma release publicada)'}`);
  if (cdn && policyId) checkPolicy(await cdn.responseHeadersPolicy(policyId), plan.release);
  else if (cdn) fail('AWS_RESPONSE_HEADERS_POLICY_ID não informado: sem ele não há como garantir a CSP do artefato');

  const publishedAt = now().toISOString();
  const manifest = buildManifest(plan, { publishedAt, checks });
  const previous = await readJson(store, manifestKey(commit));
  if (previous.value && previous.value.hashDoArtefato !== manifest.hashDoArtefato) {
    fail(`o commit ${commit} já foi publicado com outro artefato (hash ${previous.value.hashDoArtefato}) — builds do mesmo commit precisam ser idênticos`);
  }

  // 2. Cópia da release (arquivos sem hash) e 3. assets com hash na raiz
  const mutable = plan.files.filter((f) => !f.immutable);
  const immutable = plan.files.filter((f) => f.immutable);
  log(`cópia da release: ${mutable.length} arquivo(s) em _releases/${commit}/arquivos/`);
  for (const f of mutable) await putOnce(store, snapshotKey(commit, f.key), f, log);
  log(`assets imutáveis: ${immutable.length}`);
  for (const f of immutable) await putOnce(store, f.key, f, log);

  // 4. Manifesto: a release fica completa e disponível para rollback
  if (!previous.value) {
    await store.put(manifestKey(commit), jsonBody(manifest), { ...JSON_META, ifNoneMatch: true });
  }
  const manifestFinal = previous.value ?? manifest;

  // 5. Tudo o que o novo index.html referencia já está no bucket, com o conteúdo certo
  for (const f of immutable) {
    const h = await store.head(f.key);
    if (h?.sha256 !== f.sha256) fail(`asset ${f.key} não confere no bucket depois da gravação`);
  }
  const index = plan.files.find((f) => f.key === 'index.html');
  for (const ref of referencedPaths(index.body.toString('utf8'))) {
    const f = plan.files.find((x) => x.key === ref);
    if (f.immutable && !(await store.head(ref))) fail(`index.html referencia ${ref}, ausente no bucket`);
  }

  // 6. Troca dos arquivos sem hash na raiz — o documento inicial por último
  const before = await readJson(store, CURRENT_KEY);
  if (before.etag !== current.etag) fail('outra publicação ou rollback alterou _releases/atual.json durante esta execução — nada da raiz foi trocado');
  const changed = [];
  for (const f of entryOrder(mutable)) {
    const h = await store.head(f.key);
    if (h?.sha256 === f.sha256 && h.contentType === f.contentType && h.cacheControl === f.cacheControl) continue;
    await store.put(f.key, f.body, { contentType: f.contentType, cacheControl: f.cacheControl, sha256: f.sha256 });
    changed.push(f.key);
    log(`  → ${f.key}`);
  }

  // 7. Conferência da raiz e registro
  for (const f of plan.files) {
    const h = await store.head(f.key);
    if (h?.sha256 !== f.sha256) fail(`${f.key} não confere na raiz do bucket depois da troca`);
  }
  const event = { tipo: 'publicacao', commit, de: current.value?.commit ?? null, em: publishedAt, ator: actor, execucao: run, hashDoArtefato: manifestFinal.hashDoArtefato };
  await writeState(store, { current, event });

  // 8. Cache do CloudFront: só os caminhos sem hash que mudaram
  let invalidation = null;
  if (cdn && changed.length) {
    const paths = invalidationPaths(changed);
    invalidation = await cdn.invalidate(paths, `publicacao-${commit}-${publishedAt}`);
    log(`invalidação ${invalidation}: ${paths.join(' ')}`);
  }
  log(`publicado: ${commit} (${changed.length} arquivo(s) de entrada trocados)`);
  return { commit, manifest: manifestFinal, changed, invalidation, event };
}

/** atual.json e historico.json com If-Match/If-None-Match: duas operações simultâneas não se sobrepõem em silêncio. */
export async function writeState(store, { current, event }) {
  const history = await readJson(store, HISTORY_KEY);
  const list = Array.isArray(history.value) ? history.value : [];
  await store.put(HISTORY_KEY, jsonBody([...list, event]), { ...JSON_META, ...(history.etag ? { ifMatch: history.etag } : { ifNoneMatch: true }) });
  const next = { commit: event.commit, desde: event.em, tipo: event.tipo, execucao: event.execucao };
  await store.put(CURRENT_KEY, jsonBody(next), { ...JSON_META, ...(current.etag ? { ifMatch: current.etag } : { ifNoneMatch: true }) });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const argv = process.argv.slice(2);
  const dist = resolve(argv[argv.indexOf('--dist') + 1] ?? 'dist');
  const env = process.env;
  for (const k of ['AWS_S3_BUCKET', 'AWS_REGION', 'AWS_CLOUDFRONT_DISTRIBUTION_ID', 'AWS_RESPONSE_HEADERS_POLICY_ID']) {
    if (!env[k]) {
      console.error(`variável ausente: ${k}`);
      process.exit(2);
    }
  }
  const { s3Store, cloudFrontCdn } = await import('./clientes.mjs');
  const store = s3Store({ bucket: env.AWS_S3_BUCKET, region: env.AWS_REGION });
  const cdn = cloudFrontCdn({ distributionId: env.AWS_CLOUDFRONT_DISTRIBUTION_ID });
  try {
    const r = await publicar({
      dist,
      store,
      cdn,
      policyId: env.AWS_RESPONSE_HEADERS_POLICY_ID,
      actor: env.ATOR ?? null,
      run: env.EXECUCAO ?? null,
      checks: env.VERIFICACOES ? JSON.parse(env.VERIFICACOES) : null,
    });
    if (r.invalidation && !(await cdn.waitInvalidation(r.invalidation))) console.warn(`invalidação ${r.invalidation} ainda em andamento`);
    if (env.GITHUB_OUTPUT) {
      const { appendFileSync } = await import('node:fs');
      appendFileSync(env.GITHUB_OUTPUT, `commit=${r.commit}\nhash=${r.manifest.hashDoArtefato}\n`);
    }
  } catch (e) {
    console.error(`PUBLICAÇÃO INTERROMPIDA: ${e.message}`);
    process.exitCode = 1;
  }
}
