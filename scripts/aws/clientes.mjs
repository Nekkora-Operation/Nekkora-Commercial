/**
 * Adaptadores mínimos do S3 e do CloudFront (AWS SDK v3) usados por publicar.mjs e rollback.mjs. As credenciais vêm
 * do ambiente: no GitHub Actions, credenciais temporárias do STS obtidas por OIDC (aws-actions/configure-aws-credentials);
 * nunca chaves permanentes. Os testes trocam estes adaptadores por scripts/testes/aws-simulado.mjs, com a mesma interface.
 *
 * Interface do armazenamento (store):
 *   head(key)            → { etag, sha256, contentType, cacheControl, size } | null
 *   get(key)             → { body: Buffer, etag } | null
 *   put(key, body, opts) → { etag }   opts: { contentType, cacheControl, sha256, ifNoneMatch?: true, ifMatch?: etag }
 *   copy(from, to)       → { etag }   (cópia no servidor, com os metadados e o checksum do original)
 * Falha de pré-condição (If-None-Match/If-Match) lança um erro com code === 'PRECONDICAO'.
 *
 * Interface da CDN (cdn):
 *   invalidate(paths, ref) → id · waitInvalidation(id) · responseHeadersPolicy(id) → ResponseHeadersPolicyConfig
 */
import { CopyObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateInvalidationCommand, GetInvalidationCommand, GetResponseHeadersPolicyCommand } from '@aws-sdk/client-cloudfront';

const status = (e) => e?.$metadata?.httpStatusCode;
const precondition = (e) => {
  if (status(e) === 412 || status(e) === 409 || e?.name === 'PreconditionFailed' || e?.name === 'ConditionalRequestConflict') {
    const err = new Error(`pré-condição falhou: ${e.message}`);
    err.code = 'PRECONDICAO';
    return err;
  }
  return e;
};
const encodeKey = (key) => key.split('/').map(encodeURIComponent).join('/');

export function s3Store({ bucket, region, client = new S3Client({ region }) }) {
  if (!bucket) throw new Error('bucket não informado');
  return {
    bucket,
    async head(key) {
      try {
        const r = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key, ChecksumMode: 'ENABLED' }));
        return { etag: r.ETag, sha256: r.ChecksumSHA256 ?? null, contentType: r.ContentType, cacheControl: r.CacheControl, size: r.ContentLength };
      } catch (e) {
        if (status(e) === 404 || e?.name === 'NotFound') return null;
        throw e;
      }
    },
    async get(key) {
      try {
        const r = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
        return { body: Buffer.from(await r.Body.transformToByteArray()), etag: r.ETag };
      } catch (e) {
        if (status(e) === 404 || e?.name === 'NoSuchKey') return null;
        throw e;
      }
    },
    async put(key, body, { contentType, cacheControl, sha256, ifNoneMatch, ifMatch } = {}) {
      try {
        const r = await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
            CacheControl: cacheControl,
            // O S3 confere o SHA-256 na chegada e o guarda: head() devolve o mesmo valor para verificação posterior.
            ChecksumAlgorithm: 'SHA256',
            ChecksumSHA256: sha256,
            IfNoneMatch: ifNoneMatch ? '*' : undefined,
            IfMatch: ifMatch,
          }),
        );
        return { etag: r.ETag };
      } catch (e) {
        throw precondition(e);
      }
    },
    async copy(from, to) {
      try {
        const r = await client.send(
          new CopyObjectCommand({ Bucket: bucket, Key: to, CopySource: `${bucket}/${encodeKey(from)}`, MetadataDirective: 'COPY', ChecksumAlgorithm: 'SHA256' }),
        );
        return { etag: r.CopyObjectResult?.ETag };
      } catch (e) {
        throw precondition(e);
      }
    },
  };
}

export function cloudFrontCdn({ distributionId, client = new CloudFrontClient({ region: 'us-east-1' }), waitMs = 10000, tries = 60 }) {
  if (!distributionId) throw new Error('distribuição do CloudFront não informada');
  return {
    distributionId,
    async invalidate(paths, ref) {
      const r = await client.send(
        new CreateInvalidationCommand({ DistributionId: distributionId, InvalidationBatch: { CallerReference: ref, Paths: { Quantity: paths.length, Items: paths } } }),
      );
      return r.Invalidation.Id;
    },
    async waitInvalidation(id) {
      for (let i = 0; i < tries; i++) {
        const r = await client.send(new GetInvalidationCommand({ DistributionId: distributionId, Id: id }));
        if (r.Invalidation.Status === 'Completed') return true;
        await new Promise((res) => setTimeout(res, waitMs));
      }
      return false;
    },
    async responseHeadersPolicy(id) {
      const r = await client.send(new GetResponseHeadersPolicyCommand({ Id: id }));
      return r.ResponseHeadersPolicy.ResponseHeadersPolicyConfig;
    },
  };
}
