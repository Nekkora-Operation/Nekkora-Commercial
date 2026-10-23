/**
 * Plano de publicação (COM-RELEASE-003-C): a lista exata de objetos que um build produz no S3, com hash, tipo e
 * cache de cada um, e o manifesto da release. Não acessa a AWS — publicar.mjs e rollback.mjs executam o plano.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { cacheControlFor, contentTypeFor, isImmutable, RELEASES_PREFIX } from '../../deploy/aws/cabecalhos.mjs';

export const sha256 = (buf) => createHash('sha256').update(buf);
/** O S3 guarda e devolve o checksum SHA-256 em base64 (x-amz-checksum-sha256). */
export const sha256b64 = (buf) => sha256(buf).digest('base64');

/** Arquivos que nunca vão para o bucket (artefatos de outros provedores). */
const IGNORED = new Set(['_headers', '_redirects']);
/** Publicados por último, nesta ordem: o documento inicial troca depois de tudo o que ele referencia estar lá. */
export const ENTRY_ORDER = ['index.html', 'release.json'];

function walk(dir, base = dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full, base) : [relative(base, full).replace(/\\/g, '/')];
  });
}

export function readRelease(dist) {
  const file = join(dist, 'release.json');
  if (!existsSync(file)) throw new Error(`${file} não existe (rode npm run build)`);
  const rel = JSON.parse(readFileSync(file, 'utf8'));
  if (!/^[0-9a-f]{40}$/.test(rel.commit ?? '')) throw new Error(`release.json sem commit válido: ${rel.commit}`);
  return rel;
}

/** Recursos que o index.html carrega do próprio site (src/href começando por /). */
export const referencedPaths = (html) => [...html.matchAll(/\s(?:src|href)="\/([^"#?]+)"/g)].map((m) => m[1]);

export function planFromDist(dist) {
  const release = readRelease(dist);
  const files = walk(dist)
    .filter((key) => !IGNORED.has(key))
    .sort()
    .map((key) => {
      const body = readFileSync(join(dist, key));
      return { key, body, size: body.length, sha256: sha256b64(body), contentType: contentTypeFor(key), cacheControl: cacheControlFor(key), immutable: isImmutable(key) };
    });
  const keys = new Set(files.map((f) => f.key));
  for (const required of ['index.html', '404.html', 'release.json']) if (!keys.has(required)) throw new Error(`${required} ausente no build`);
  if (files.some((f) => f.key.startsWith(RELEASES_PREFIX))) throw new Error(`o build não pode ter arquivos em ${RELEASES_PREFIX}`);
  // Tudo o que o documento inicial referencia precisa estar no próprio build (nenhum asset quebrado).
  const index = files.find((f) => f.key === 'index.html').body.toString('utf8');
  const missing = referencedPaths(index).filter((p) => !keys.has(p));
  if (missing.length) throw new Error(`index.html referencia arquivos que não estão no build: ${missing.join(', ')}`);
  return { release, commit: release.commit, files };
}

export const releaseDir = (commit) => `${RELEASES_PREFIX}${commit}/`;
export const manifestKey = (commit) => `${releaseDir(commit)}manifest.json`;
/** Cópia de um arquivo sem hash no nome dentro da release (os imutáveis ficam só na raiz, compartilhados). */
export const snapshotKey = (commit, key) => `${releaseDir(commit)}arquivos/${key}`;
export const CURRENT_KEY = `${RELEASES_PREFIX}atual.json`;
export const HISTORY_KEY = `${RELEASES_PREFIX}historico.json`;

/** Manifesto gravado em _releases/<commit>/manifest.json — identifica a release sem ambiguidade. */
export function buildManifest(plan, { publishedAt, checks = null }) {
  const { release } = plan;
  return {
    formato: 1,
    commit: plan.commit,
    aplicacao: release.aplicacao,
    publicadoEm: publishedAt,
    nekkoraLib: release.nekkoraLib,
    cspScriptHashes: release.cspScriptHashes,
    // Origens externas da CSP (COM-RELEASE-005): só existem com recebimento automático configurado
    ...(release.cspOrigens ? { cspOrigens: release.cspOrigens } : {}),
    verificacoes: checks,
    // Hash do conjunto: sha256 da lista "caminho sha256" ordenada — compara releases inteiras de uma vez.
    hashDoArtefato: sha256(plan.files.map((f) => `${f.key} ${f.sha256}`).join('\n')).digest('hex'),
    arquivos: plan.files.map(({ key, size, sha256: hash, contentType, cacheControl, immutable }) => ({ caminho: key, bytes: size, sha256: hash, contentType, cacheControl, imutavel: immutable })),
  };
}

/** Os arquivos sem hash no nome na ordem de troca: os demais primeiro, depois index.html e, por fim, release.json. */
export function entryOrder(files) {
  const mutable = files.filter((f) => !(f.imutavel ?? f.immutable));
  const key = (f) => f.caminho ?? f.key;
  const rank = (f) => ENTRY_ORDER.indexOf(key(f));
  return [...mutable.filter((f) => rank(f) < 0), ...ENTRY_ORDER.map((k) => mutable.find((f) => key(f) === k)).filter(Boolean)];
}

/** Caminhos a invalidar no CloudFront: só os arquivos sem hash que mudaram (+ "/" quando o index.html mudou). */
export function invalidationPaths(changedKeys) {
  const paths = changedKeys.map((k) => `/${k}`);
  if (changedKeys.includes('index.html')) paths.unshift('/');
  return paths;
}
