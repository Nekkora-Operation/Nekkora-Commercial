/**
 * Fonte única da entrega HTTP do Commercial na AWS (COM-RELEASE-003-C/D): cabeçalhos de segurança, cache e tipo de
 * cada arquivo e respostas de erro. Usada por:
 *   - scripts/aws/gerar-config.mjs → deploy/aws/politica-cabecalhos.json (Response Headers Policy do CloudFront);
 *   - scripts/aws/plano.mjs → metadados Content-Type e Cache-Control gravados em cada objeto do S3;
 *   - scripts/servidor-cloudfront-local.mjs → homologação local com a mesma configuração.
 *
 * A página não carrega nada de terceiros: fonte, imagens e scripts são servidos pelo próprio domínio. O WhatsApp e o
 * e-mail são abertos por link (navegação), que a CSP não restringe. Sem upgrade-insecure-requests: todos os recursos
 * são relativos ao próprio domínio e o HSTS já força HTTPS; a diretiva só atrapalhava a validação local no WebKit (que
 * a aplica até em http://127.0.0.1).
 */

/** Origem externa aceita na CSP: https sem caminho; http só para 127.0.0.1/localhost (homologação local). */
const ORIGIN = /^(https:\/\/[a-z0-9.-]+(:\d+)?|http:\/\/(127\.0\.0\.1|localhost)(:\d+)?)$/;
/** Origem do Cloudflare Turnstile (desafio antiautomação do recebimento de solicitações, COM-RELEASE-005 §5.5). */
export const TURNSTILE_ORIGIN = 'https://challenges.cloudflare.com';

/**
 * Origens externas que a página precisa (dist/release.json → cspOrigens), derivadas de publicacao.json no build:
 *   connect: o backend de solicitações (COM-RELEASE-005), quando houver endpoint;
 *   script/frame: o Turnstile, quando houver chave do desafio.
 * Sem recebimento automático (a publicação atual), nada muda: tudo continua 'self'.
 */
function origins(cspOrigens = {}) {
  const out = {};
  for (const k of ['connect', 'script', 'frame']) {
    const list = cspOrigens[k] ?? [];
    if (!Array.isArray(list) || list.some((o) => !ORIGIN.test(o))) throw new Error(`origens de CSP inválidas (${k}): ${JSON.stringify(list)}`);
    out[k] = list.length ? ` ${list.join(' ')}` : '';
  }
  return out;
}

/** CSP com o SHA-256 de cada <script> inline do index.html (dist/release.json → cspScriptHashes), sem 'unsafe-inline'. */
export function csp(scriptHashes, cspOrigens) {
  if (!Array.isArray(scriptHashes) || scriptHashes.some((h) => !/^'sha256-[A-Za-z0-9+/]{43}='$/.test(h))) {
    throw new Error(`hashes de script inválidos: ${JSON.stringify(scriptHashes)}`);
  }
  const o = origins(cspOrigens);
  return [
    "default-src 'self'",
    `script-src 'self'${scriptHashes.length ? ` ${scriptHashes.join(' ')}` : ''}${o.script}`,
    // React aplica style="" em alguns componentes da nekkora-lib; scripts continuam restritos por hash.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self'${o.connect}`,
    ...(o.frame ? [`frame-src${o.frame}`] : []),
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
}

export const HSTS = { maxAge: 31536000, includeSubdomains: true, preload: false };
export const REFERRER_POLICY = 'strict-origin-when-cross-origin';
export const PERMISSIONS_POLICY = 'camera=(), microphone=(), geolocation=(), payment=()';
export const COOP = 'same-origin';
/** Cabeçalhos que o S3 devolve e que não interessam ao visitante. */
export const REMOVED_HEADERS = ['x-amz-server-side-encryption', 'x-amz-version-id'];

/** Os cabeçalhos de segurança como o navegador os recebe (nome em minúsculas → valor). */
export function securityHeaders(scriptHashes, cspOrigens) {
  return {
    'content-security-policy': csp(scriptHashes, cspOrigens),
    'strict-transport-security': `max-age=${HSTS.maxAge}${HSTS.includeSubdomains ? '; includeSubDomains' : ''}${HSTS.preload ? '; preload' : ''}`,
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': REFERRER_POLICY,
    'permissions-policy': PERMISSIONS_POLICY,
    'cross-origin-opener-policy': COOP,
  };
}

/** ResponseHeadersPolicyConfig do CloudFront (API CreateResponseHeadersPolicy / UpdateResponseHeadersPolicy). */
export function responseHeadersPolicy(scriptHashes, cspOrigens) {
  const custom = [
    { Header: 'Permissions-Policy', Value: PERMISSIONS_POLICY, Override: true },
    { Header: 'Cross-Origin-Opener-Policy', Value: COOP, Override: true },
  ];
  return {
    Name: 'nekkora-commercial-seguranca',
    Comment: 'Cabecalhos de seguranca do Nekkora Commercial (gerado por scripts/aws/gerar-config.mjs)',
    SecurityHeadersConfig: {
      ContentSecurityPolicy: { Override: true, ContentSecurityPolicy: csp(scriptHashes, cspOrigens) },
      StrictTransportSecurity: { Override: true, AccessControlMaxAgeSec: HSTS.maxAge, IncludeSubdomains: HSTS.includeSubdomains, Preload: HSTS.preload },
      ContentTypeOptions: { Override: true },
      FrameOptions: { Override: true, FrameOption: 'DENY' },
      ReferrerPolicy: { Override: true, ReferrerPolicy: REFERRER_POLICY },
    },
    CustomHeadersConfig: { Quantity: custom.length, Items: custom },
    RemoveHeadersConfig: { Quantity: REMOVED_HEADERS.length, Items: REMOVED_HEADERS.map((Header) => ({ Header })) },
  };
}

/** Arquivos com hash no nome, gerados pelo Vite: o conteúdo nunca muda para o mesmo nome. */
export const isImmutable = (key) => /^assets\/[^/]+-[A-Za-z0-9_-]{8}\.[a-z0-9]+$/.test(key);

/**
 * Cache: assets com hash → um ano, imutáveis; todo o resto (HTML, release.json, ícones, imagem de compartilhamento,
 * robots, sitemap) → no-cache: navegador e CloudFront revalidam (ETag) e uma publicação nova aparece logo, sem
 * depender de invalidação.
 */
export const cacheControlFor = (key) => (isImmutable(key) ? 'public, max-age=31536000, immutable' : 'no-cache');

const TYPES = {
  html: 'text/html; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  css: 'text/css; charset=utf-8',
  json: 'application/json; charset=utf-8',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  ico: 'image/x-icon',
  woff2: 'font/woff2',
  txt: 'text/plain; charset=utf-8',
  xml: 'application/xml; charset=utf-8',
  webmanifest: 'application/manifest+json; charset=utf-8',
};
export function contentTypeFor(key) {
  const ext = /\.([a-z0-9]+)$/i.exec(key)?.[1]?.toLowerCase();
  const type = ext && TYPES[ext];
  if (!type) throw new Error(`tipo de conteúdo desconhecido para ${key} — inclua a extensão em deploy/aws/cabecalhos.mjs`);
  return type;
}

/**
 * Respostas de erro da distribuição. O bucket é privado e o CloudFront lê pelo OAC: objeto inexistente volta do S3
 * como 403 (sem s3:ListBucket para o CloudFront) — os dois códigos viram a página 404.html com status 404, nunca 200.
 * Não há fallback de SPA: a página é única, com âncoras.
 */
export const ERROR_RESPONSES = [403, 404].map((code) => ({ ErrorCode: code, ResponsePagePath: '/404.html', ResponseCode: '404', ErrorCachingMinTTL: 60 }));

/** Prefixo do bucket com manifestos e cópias de cada release (rollback). Nunca servido ao visitante. */
export const RELEASES_PREFIX = '_releases/';
