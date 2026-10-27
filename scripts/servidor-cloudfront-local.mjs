#!/usr/bin/env node
/**
 * Servidor local que reproduz a entrega do CloudFront para a homologação (COM-RELEASE-003-H), sem acessar a AWS:
 *
 *   - função viewer-request de deploy/aws/funcao-viewer-request.js (www → apex, bloqueio de _releases/);
 *   - objeto raiz padrão index.html só para "/" (sem fallback de SPA);
 *   - origem S3 privada: objeto inexistente → 403, como o S3 responde ao OAC sem s3:ListBucket;
 *   - respostas de erro de deploy/aws/cabecalhos.mjs (403/404 → /404.html com status 404);
 *   - Content-Type e Cache-Control de cada objeto como o deploy grava (scripts/aws/plano.mjs);
 *   - cabeçalhos da Response Headers Policy VERSIONADA (deploy/aws/politica-cabecalhos.json), traduzidos como o
 *     CloudFront os envia — a CSP que a homologação exercita é a mesma que vai para a distribuição;
 *   - ETag + If-None-Match → 304 (o navegador revalida o que é no-cache);
 *   - compressão brotli/gzip dos tipos de texto a partir de 1.000 bytes, como o CloudFront com "Compress objects"
 *     e a política CachingOptimized (sem isso, a medição de desempenho local fica irreal).
 * Também responde /__s3/<chave> com 403 (AccessDenied), simulando o acesso direto ao bucket privado.
 *
 *   node scripts/servidor-cloudfront-local.mjs --dist dist --porta 4173 [--politica deploy/aws/politica-cabecalhos.json]
 *   node scripts/servidor-cloudfront-local.mjs --dist dist-homologacao-api --porta 4177 --politica-do-build
 *
 * É uma simulação: comprova a configuração, não substitui a homologação pública (COM-RELEASE-004).
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { ERROR_RESPONSES, responseHeadersPolicy } from '../deploy/aws/cabecalhos.mjs';
import { planFromDist } from './aws/plano.mjs';

const root = resolve(fileURLToPath(import.meta.url), '../..');
/** Tipos que o CloudFront comprime (lista da documentação: texto, JSON, JavaScript, SVG, ícone…); woff2 já é comprimido. */
const COMPRESSIBLE = /^(text\/|application\/(json|javascript|xml|manifest\+json)|image\/(svg\+xml|x-icon))/;

/** Carrega a CloudFront Function como o runtime: código ES5 avulso que define handler(event). */
export function loadViewerRequest(file = resolve(root, 'deploy/aws/funcao-viewer-request.js')) {
  const context = vm.createContext({});
  vm.runInContext(`${readFileSync(file, 'utf8')}\n;globalThis.__handler = handler;`, context);
  return context.__handler;
}

/** Cabeçalhos que o CloudFront acrescenta a partir de uma ResponseHeadersPolicyConfig. */
export function headersFromPolicy(policy) {
  const out = {};
  const sec = policy.SecurityHeadersConfig ?? {};
  if (sec.ContentSecurityPolicy) out['content-security-policy'] = sec.ContentSecurityPolicy.ContentSecurityPolicy;
  if (sec.StrictTransportSecurity) {
    const h = sec.StrictTransportSecurity;
    out['strict-transport-security'] = `max-age=${h.AccessControlMaxAgeSec}${h.IncludeSubdomains ? '; includeSubDomains' : ''}${h.Preload ? '; preload' : ''}`;
  }
  if (sec.ContentTypeOptions) out['x-content-type-options'] = 'nosniff';
  if (sec.FrameOptions) out['x-frame-options'] = sec.FrameOptions.FrameOption;
  if (sec.ReferrerPolicy) out['referrer-policy'] = sec.ReferrerPolicy.ReferrerPolicy;
  for (const item of policy.CustomHeadersConfig?.Items ?? []) out[item.Header.toLowerCase()] = item.Value;
  return out;
}

export function createCloudFrontServer({ dist, policyFile = resolve(root, 'deploy/aws/politica-cabecalhos.json'), policyFromBuild = false, log = () => {} }) {
  const plan = planFromDist(dist);
  const objects = new Map(plan.files.map((f) => [f.key, { ...f, etag: `"${createHash('md5').update(f.body).digest('hex')}"` }]));
  // --politica-do-build: builds de homologação com origens próprias (backend local, COM-RELEASE-005) — a política é
  // gerada do release.json do próprio build, pelo mesmo código que gera a versionada.
  const policy = policyFromBuild ? responseHeadersPolicy(plan.release.cspScriptHashes ?? [], plan.release.cspOrigens) : JSON.parse(readFileSync(policyFile, 'utf8'));
  const policyHeaders = headersFromPolicy(policy);
  const viewerRequest = loadViewerRequest();
  const errors = new Map(ERROR_RESPONSES.map((e) => [e.ErrorCode, e]));

  // A borda guarda a versão comprimida em cache; comprimir a cada requisição distorceria a medição de desempenho.
  const compressed = new Map();
  const compress = (body, enc) => {
    const key = `${enc}:${createHash('md5').update(body).digest('hex')}`;
    if (!compressed.has(key)) compressed.set(key, enc === 'br' ? brotliCompressSync(body) : gzipSync(body));
    return compressed.get(key);
  };

  return createServer((req, res) => {
    const url = new URL(req.url, 'http://local');
    const send = (status, headers, body) => {
      const accept = String(req.headers['accept-encoding'] ?? '');
      if (body && body.length >= 1000 && COMPRESSIBLE.test(headers['content-type'] ?? '')) {
        const br = /(^|[\s,])br([\s,;]|$)/.test(accept);
        if (br || /(^|[\s,])gzip([\s,;]|$)/.test(accept)) {
          body = compress(Buffer.from(body), br ? 'br' : 'gzip');
          headers = { ...headers, 'content-encoding': br ? 'br' : 'gzip', 'content-length': body.length, vary: 'Accept-Encoding' };
        }
      }
      res.writeHead(status, { ...headers, ...policyHeaders });
      res.end(req.method === 'HEAD' ? undefined : body);
      log(`${req.method} ${req.headers.host}${req.url} → ${status}`);
    };
    if (url.pathname.startsWith('/__s3/')) {
      return send(403, { 'content-type': 'application/xml' }, '<?xml version="1.0" encoding="UTF-8"?><Error><Code>AccessDenied</Code><Message>Access Denied</Message></Error>');
    }
    const querystring = {};
    for (const [k, v] of url.searchParams) querystring[k] = { value: v };
    const event = { request: { method: req.method, uri: url.pathname, querystring, headers: { host: { value: req.headers.host ?? '' } } } };
    const result = viewerRequest(event);
    if (result.statusCode) {
      const headers = Object.fromEntries(Object.entries(result.headers ?? {}).map(([k, v]) => [k, v.value]));
      res.writeHead(result.statusCode, headers);
      res.end();
      return log(`${req.method} ${req.headers.host}${req.url} → ${result.statusCode} (função)`);
    }
    let key = result.uri === '/' ? 'index.html' : result.uri.slice(1);
    try {
      key = decodeURIComponent(key);
    } catch {}
    const obj = objects.get(key);
    if (!obj) {
      // S3 privado sem s3:ListBucket para o CloudFront: 403 → resposta de erro configurada (404.html, status 404)
      const rule = errors.get(403);
      const page = objects.get(rule.ResponsePagePath.slice(1));
      return send(Number(rule.ResponseCode), { 'content-type': page.contentType, 'cache-control': page.cacheControl }, page.body);
    }
    if (req.headers['if-none-match'] === obj.etag) return send(304, { etag: obj.etag, 'cache-control': obj.cacheControl }, undefined);
    send(200, { 'content-type': obj.contentType, 'cache-control': obj.cacheControl, etag: obj.etag, 'content-length': obj.size }, obj.body);
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const argv = process.argv.slice(2);
  const opt = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
  const port = Number(opt('--porta', 4173));
  const server = createCloudFrontServer({ dist: resolve(opt('--dist', 'dist')), policyFile: opt('--politica') ? resolve(opt('--politica')) : undefined, policyFromBuild: argv.includes('--politica-do-build'), log: argv.includes('--log') ? console.log : () => {} });
  server.listen(port, '127.0.0.1', () => console.log(`CloudFront local: http://127.0.0.1:${port}/ (${opt('--dist', 'dist')})`));
}
