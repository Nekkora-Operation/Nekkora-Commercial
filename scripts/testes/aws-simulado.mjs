/**
 * S3 e CloudFront SIMULADOS (em memória) para os testes de publicação e rollback — mesma interface de
 * scripts/aws/clientes.mjs. Reproduz o comportamento do S3 que a estratégia usa:
 *   - checksum SHA-256 conferido na chegada e devolvido no head (x-amz-checksum-sha256);
 *   - If-None-Match: * e If-Match: <etag> → erro PRECONDICAO;
 *   - CopyObject com os metadados do original;
 *   - a declaração "AssetsEReleasesGravadosUmaVez" de deploy/aws/iam/politica-bucket.json (gravação em assets/ ou
 *     _releases/<commit>/ sem If-None-Match é negada);
 *   - nenhuma operação de exclusão (a role de deploy não tem s3:DeleteObject).
 * Não substitui a homologação contra a AWS real — os testes que o usam são declarados como simulados.
 */
import { createHash } from 'node:crypto';

export function fakeS3({ writeOnce = true } = {}) {
  const objects = new Map();
  const ops = [];
  let failures = [];
  let etagSeq = 0;
  const sha = (b) => createHash('sha256').update(b).digest('base64');
  const precondition = (msg) => Object.assign(new Error(msg), { code: 'PRECONDICAO' });
  const maybeFail = (op, key) => {
    const f = failures.find((x) => x.op === op && (x.key === key || x.key === '*'));
    if (f) {
      failures = failures.filter((x) => x !== f);
      throw new Error(`falha simulada em ${op} ${key}`);
    }
  };
  const protectedKey = (key) => /^assets\//.test(key) || /^_releases\/[^/]+\//.test(key);
  return {
    objects,
    ops,
    /** Faz a próxima operação `op` na chave `key` ('*' = qualquer) falhar. */
    failNext(op, key) {
      failures.push({ op, key });
    },
    /** Altera um objeto por fora (edição manual no console) — o S3 recalcula o checksum, como numa gravação real. */
    tamper(key, body, { keepChecksum = false } = {}) {
      const o = objects.get(key);
      const buf = Buffer.from(body);
      objects.set(key, { ...o, body: buf, sha256: keepChecksum ? o.sha256 : sha(buf), etag: `"e${++etagSeq}"` });
    },
    async head(key) {
      ops.push(['head', key]);
      const o = objects.get(key);
      return o ? { etag: o.etag, sha256: o.sha256, contentType: o.contentType, cacheControl: o.cacheControl, size: o.body.length } : null;
    },
    async get(key) {
      ops.push(['get', key]);
      const o = objects.get(key);
      return o ? { body: Buffer.from(o.body), etag: o.etag } : null;
    },
    async put(key, body, { contentType, cacheControl, sha256, ifNoneMatch, ifMatch } = {}) {
      ops.push(['put', key]);
      maybeFail('put', key);
      if (writeOnce && protectedKey(key) && !ifNoneMatch) throw new Error(`AccessDenied: ${key} exige If-None-Match (política do bucket)`);
      const buf = Buffer.from(body);
      if (sha256 && sha256 !== sha(buf)) throw new Error(`BadDigest: checksum enviado não confere (${key})`);
      const existing = objects.get(key);
      if (ifNoneMatch && existing) throw precondition(`${key} já existe`);
      if (ifMatch && existing?.etag !== ifMatch) throw precondition(`${key}: etag ${existing?.etag} ≠ ${ifMatch}`);
      const etag = `"e${++etagSeq}"`;
      objects.set(key, { body: buf, contentType, cacheControl, sha256: sha(buf), etag });
      return { etag };
    },
    async copy(from, to) {
      ops.push(['copy', `${from} → ${to}`]);
      maybeFail('copy', to);
      const src = objects.get(from);
      if (!src) throw new Error(`NoSuchKey: ${from}`);
      if (writeOnce && protectedKey(to)) throw new Error(`AccessDenied: ${to} exige If-None-Match (política do bucket)`);
      const etag = `"e${++etagSeq}"`;
      objects.set(to, { ...src, body: Buffer.from(src.body), sha256: sha(src.body), etag });
      return { etag };
    },
    /** Chaves da raiz (o que o CloudFront serve). */
    rootKeys: () => [...objects.keys()].filter((k) => !k.startsWith('_releases/')).sort(),
    text: (key) => objects.get(key)?.body.toString('utf8'),
  };
}

export function fakeCloudFront(policyConfig) {
  const invalidations = [];
  return {
    invalidations,
    policy: policyConfig,
    async invalidate(paths, ref) {
      invalidations.push({ paths, ref });
      return `I${invalidations.length}`;
    },
    async waitInvalidation() {
      return true;
    },
    async responseHeadersPolicy() {
      return this.policy;
    },
  };
}
