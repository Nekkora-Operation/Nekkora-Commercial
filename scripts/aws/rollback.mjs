#!/usr/bin/env node
/**
 * Rollback de produção no S3 + CloudFront (COM-RELEASE-003-E) — chamado pelo workflow "Rollback de produção", com a
 * mesma aprovação humana do environment "production". Sem rebuild e sem apagar nada:
 *
 *   1. identifica a release atual (_releases/atual.json) e o destino: o commit informado ou, sem ele, a última release
 *      publicada antes da atual no histórico (_releases/historico.json);
 *   2. valida o destino: precisa ter sido publicado por este processo, ter manifesto íntegro e TODOS os arquivos no
 *      bucket com o SHA-256 do manifesto (assets na raiz; arquivos sem hash na cópia _releases/<commit>/arquivos/);
 *   3. restaura os arquivos sem hash por cópia no próprio S3 — os demais, depois index.html e, por último,
 *      release.json — e confere a raiz;
 *   4. registra a operação (atual.json e historico.json, com motivo e autor) e invalida os caminhos trocados.
 *
 * Uso: AWS_S3_BUCKET, AWS_REGION, AWS_CLOUDFRONT_DISTRIBUTION_ID, MOTIVO, ATOR, EXECUCAO [, DESTINO]
 *      node scripts/aws/rollback.mjs [--simular] [--manifesto saida.json]
 *      --simular: só valida e mostra o que faria, sem gravar · --manifesto: grava o manifesto do destino (verificação)
 */
import { createHash } from 'node:crypto';
import { appendFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { CURRENT_KEY, HISTORY_KEY, entryOrder, invalidationPaths, manifestKey, referencedPaths, snapshotKey } from './plano.mjs';
import { FalhaDePublicacao, readJson, writeState } from './publicar.mjs';

const fail = (msg) => {
  throw new FalhaDePublicacao(msg);
};

/** Destino padrão: a última release publicada (tipo "publicacao") antes da atual, diferente dela. */
export function pickTarget(history, currentCommit, requested) {
  const published = history.filter((e) => e.tipo === 'publicacao');
  if (requested) {
    if (!/^[0-9a-f]{40}$/.test(requested)) fail(`DESTINO deve ser o hash completo do commit (40 caracteres): ${requested}`);
    if (!published.some((e) => e.commit === requested)) fail(`o commit ${requested} nunca foi publicado por este processo — não é uma versão aprovada`);
    if (requested === currentCommit) fail('o destino já é a release atual');
    return requested;
  }
  const order = [...new Set(published.map((e) => e.commit))];
  const idx = order.lastIndexOf(currentCommit);
  const candidates = (idx >= 0 ? order.slice(0, idx) : order).filter((c) => c !== currentCommit);
  if (!candidates.length) fail('não há release anterior aprovada para restaurar');
  return candidates.at(-1);
}

export async function validateRelease(store, commit) {
  const { value: manifest } = await readJson(store, manifestKey(commit));
  if (!manifest) fail(`manifesto ${manifestKey(commit)} ausente`);
  if (manifest.commit !== commit || !Array.isArray(manifest.arquivos) || !manifest.arquivos.length) fail(`manifesto de ${commit} inconsistente`);
  const problems = [];
  for (const f of manifest.arquivos) {
    if (f.imutavel) {
      // Assets na raiz: o checksum que o S3 guardou na gravação (If-None-Match — nunca reescritos)
      const h = await store.head(f.caminho);
      if (!h) problems.push(`${f.caminho} ausente`);
      else if (h.sha256 !== f.sha256) problems.push(`${f.caminho} com sha256 ${h.sha256} ≠ manifesto ${f.sha256}`);
      continue;
    }
    // Arquivos que serão copiados para a raiz: baixados e conferidos pelo conteúdo, não só pelos metadados
    const key = snapshotKey(commit, f.caminho);
    const obj = await store.get(key);
    const got = obj && createHash('sha256').update(obj.body).digest('base64');
    if (!obj) problems.push(`${key} ausente`);
    else if (got !== f.sha256) problems.push(`${key} com conteúdo diferente do manifesto (sha256 ${got} ≠ ${f.sha256})`);
  }
  // O index.html da cópia só pode usar arquivos que estão no manifesto
  const index = manifest.arquivos.find((f) => f.caminho === 'index.html');
  if (!index) problems.push('manifesto sem index.html');
  else {
    const html = (await store.get(snapshotKey(commit, 'index.html')))?.body.toString('utf8') ?? '';
    const listed = new Set(manifest.arquivos.map((f) => f.caminho));
    for (const ref of referencedPaths(html)) if (!listed.has(ref)) problems.push(`index.html de ${commit} referencia ${ref}, fora do manifesto`);
  }
  if (problems.length) fail(`a release ${commit} não pode ser restaurada:\n  - ${problems.join('\n  - ')}`);
  return manifest;
}

export async function rollback({ store, cdn, target: requested = null, reason, actor = null, run = null, now = () => new Date(), dryRun = false, log = console.log }) {
  if (!reason?.trim()) fail('informe o motivo do rollback');
  const current = await readJson(store, CURRENT_KEY);
  if (!current.value?.commit) fail('não há release publicada (_releases/atual.json ausente)');
  const { value: history } = await readJson(store, HISTORY_KEY);
  const target = pickTarget(Array.isArray(history) ? history : [], current.value.commit, requested);
  log(`atual:   ${current.value.commit} (desde ${current.value.desde})`);
  log(`destino: ${target}`);
  log(`motivo:  ${reason}`);

  const manifest = await validateRelease(store, target);
  log(`destino validado: ${manifest.arquivos.length} arquivos conferidos pelo SHA-256 (${manifest.aplicacao}, publicado em ${manifest.publicadoEm})`);
  const order = entryOrder(manifest.arquivos);
  if (dryRun) {
    log(`simulação: restauraria ${order.map((f) => f.caminho).join(', ')} — nada foi gravado`);
    return { target, manifest, changed: [], dryRun: true };
  }

  const changed = [];
  for (const f of order) {
    const h = await store.head(f.caminho);
    if (h?.sha256 === f.sha256) continue;
    await store.copy(snapshotKey(target, f.caminho), f.caminho);
    changed.push(f.caminho);
    log(`  ← ${f.caminho}`);
  }
  for (const f of manifest.arquivos) {
    const h = await store.head(f.caminho);
    if (h?.sha256 !== f.sha256) fail(`${f.caminho} não confere na raiz depois da restauração`);
  }
  const event = { tipo: 'rollback', commit: target, de: current.value.commit, em: now().toISOString(), ator: actor, execucao: run, motivo: reason, hashDoArtefato: manifest.hashDoArtefato };
  await writeState(store, { current, event });
  let invalidation = null;
  if (cdn && changed.length) {
    const paths = invalidationPaths(changed);
    invalidation = await cdn.invalidate(paths, `rollback-${target}-${event.em}`);
    log(`invalidação ${invalidation}: ${paths.join(' ')}`);
  }
  log(`restaurado: ${target}`);
  return { target, manifest, changed, invalidation, event };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const env = process.env;
  for (const k of ['AWS_S3_BUCKET', 'AWS_REGION', 'AWS_CLOUDFRONT_DISTRIBUTION_ID', 'MOTIVO']) {
    if (!env[k]) {
      console.error(`variável ausente: ${k}`);
      process.exit(2);
    }
  }
  const { s3Store, cloudFrontCdn } = await import('./clientes.mjs');
  const cdn = cloudFrontCdn({ distributionId: env.AWS_CLOUDFRONT_DISTRIBUTION_ID });
  try {
    const r = await rollback({
      store: s3Store({ bucket: env.AWS_S3_BUCKET, region: env.AWS_REGION }),
      cdn,
      target: env.DESTINO || null,
      reason: env.MOTIVO,
      actor: env.ATOR ?? null,
      run: env.EXECUCAO ?? null,
      dryRun: process.argv.includes('--simular'),
    });
    if (r.invalidation && !(await cdn.waitInvalidation(r.invalidation))) console.warn(`invalidação ${r.invalidation} ainda em andamento`);
    // Manifesto restaurado: a verificação pública (verificar-site.mjs --manifesto) compara o site com ele.
    const out = process.argv.includes('--manifesto') ? process.argv[process.argv.indexOf('--manifesto') + 1] : null;
    if (out) writeFileSync(out, `${JSON.stringify(r.manifest, null, 2)}\n`);
    if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, `commit=${r.target}\n`);
  } catch (e) {
    console.error(`ROLLBACK INTERROMPIDO: ${e.message}`);
    process.exitCode = 1;
  }
}
