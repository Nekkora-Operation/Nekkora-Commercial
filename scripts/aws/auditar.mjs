#!/usr/bin/env node
/**
 * Auditoria SOMENTE LEITURA da infraestrutura AWS do Commercial (COM-RELEASE-003-A, D02). Não cria, não altera e não
 * apaga nada: só chamadas Get/Describe/List. Levanta os identificadores reais (conta, região, bucket, distribuição,
 * OAC, certificado) e confere cada requisito da missão, com o que falta e como corrigir.
 *
 *   node scripts/aws/auditar.mjs --bucket <nome> [--distribuicao <id>] [--saida pasta]
 *     sem --distribuicao: procura a distribuição cuja origem é o bucket (precisa de cloudfront:ListDistributions)
 *   Credenciais: as do ambiente (perfil da AWS CLI/SSO da titular, ou OIDC no workflow "Auditoria AWS").
 *
 * Resultado por verificação: ok · pendente (depende de ação externa, ex.: certificado aguardando DNS) · falha
 * (configuração errada) · info. Saída 1 se houver falha. Grava auditoria.json e auditoria.md em --saida.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ERROR_RESPONSES } from '../../deploy/aws/cabecalhos.mjs';

const root = resolve(fileURLToPath(import.meta.url), '../../..');
export const DOMAINS = ['nekkora.com', 'www.nekkora.com'];
/** Política gerenciada "CachingOptimized": respeita o Cache-Control da origem, comprime gzip/brotli. */
export const CACHING_OPTIMIZED = '658327ea-f89d-4fab-a63d-7e88639e58f6';

/**
 * Operadores aceitos para restringir a leitura à distribuição. ArnLike só passa porque o valor precisa ser o ARN exato
 * (sem * nem ?); variantes IfExists e ForAnyValue/ForAllValues não restringem quando a chave falta e são recusadas.
 */
export const SOURCE_ARN_OPERATORS = ['StringEquals', 'ArnEquals', 'ArnLike'];

/**
 * Valores de AWS:SourceArn nos operadores aceitos. Ok só se houver ao menos um e todos forem exatamente o ARN esperado,
 * com um único valor por operador (lista = OU, ampliaria o acesso). Chaves de condição não diferenciam maiúsculas.
 */
export function sourceArnRestriction(statement, expectedArn) {
  const found = [];
  for (const [op, keys] of Object.entries(statement?.Condition ?? {})) {
    if (!SOURCE_ARN_OPERATORS.includes(op)) continue;
    for (const [key, value] of Object.entries(keys ?? {})) {
      if (key.toLowerCase() === 'aws:sourcearn') found.push({ op, values: [value].flat() });
    }
  }
  const ok = found.length > 0 && found.every((f) => f.values.length === 1 && f.values[0] === expectedArn);
  return { ok, detail: found.map((f) => `${f.op} ${f.values.join(', ')}`).join(' · ') };
}

async function call(client, Command, input, { missing = [] } = {}) {
  try {
    return await client.send(new Command(input));
  } catch (e) {
    if (missing.includes(e.name) || missing.includes(e.Code)) return null;
    throw e;
  }
}

export async function audit({ clients, sdk, bucket, distributionId = null, versionedPolicy, versionedFunction, now = () => new Date() }) {
  const { S3, CF, ACM, STS } = sdk;
  const checks = [];
  const add = (id, status, title, detail = '', fix = '') => checks.push({ id, status, title, detail, fix });
  const inventory = { verificadoEm: now().toISOString() };

  // Conta
  const who = await call(clients.sts, STS.GetCallerIdentityCommand, {});
  inventory.conta = who.Account;
  inventory.identidade = who.Arn;
  add('A01', who.Arn.endsWith(':root') ? 'falha' : 'ok', 'Identidade usada na auditoria não é o usuário root', who.Arn, 'Use o usuário administrativo com MFA ou a role de auditoria.');

  // Bucket
  const loc = await call(clients.s3, S3.GetBucketLocationCommand, { Bucket: bucket });
  inventory.bucket = { nome: bucket, regiao: loc.LocationConstraint || 'us-east-1', arn: `arn:aws:s3:::${bucket}` };
  const pab = (await call(clients.s3, S3.GetPublicAccessBlockCommand, { Bucket: bucket }, { missing: ['NoSuchPublicAccessBlockConfiguration'] }))?.PublicAccessBlockConfiguration;
  const pabOk = pab && pab.BlockPublicAcls && pab.IgnorePublicAcls && pab.BlockPublicPolicy && pab.RestrictPublicBuckets;
  add('S01', pabOk ? 'ok' : 'falha', 'Block Public Access ativo (4 opções)', JSON.stringify(pab ?? 'não configurado'), 'S3 → bucket → Permissions → Block public access: marcar as quatro opções.');
  const own = (await call(clients.s3, S3.GetBucketOwnershipControlsCommand, { Bucket: bucket }, { missing: ['OwnershipControlsNotFoundError'] }))?.OwnershipControls?.Rules?.[0]?.ObjectOwnership;
  add('S02', own === 'BucketOwnerEnforced' ? 'ok' : 'falha', 'ACLs desabilitadas (Object Ownership = Bucket owner enforced)', own ?? 'não configurado', 'S3 → bucket → Permissions → Object Ownership → ACLs disabled.');
  const enc = (await call(clients.s3, S3.GetBucketEncryptionCommand, { Bucket: bucket }, { missing: ['ServerSideEncryptionConfigurationNotFoundError'] }))?.ServerSideEncryptionConfiguration?.Rules?.[0]?.ApplyServerSideEncryptionByDefault;
  inventory.bucket.criptografia = enc?.SSEAlgorithm ?? null;
  add(
    'S03',
    enc?.SSEAlgorithm === 'AES256' ? 'ok' : enc?.SSEAlgorithm ? 'info' : 'falha',
    'Criptografia em repouso',
    enc ? `${enc.SSEAlgorithm}${enc.KMSMasterKeyID ? ` (${enc.KMSMasterKeyID})` : ''}` : 'ausente',
    enc?.SSEAlgorithm?.startsWith('aws:kms') ? 'SSE-KMS exige permissão kms na role de deploy e na política da chave para o CloudFront, e tem custo por chave/requisição; SSE-S3 (AES256) basta para um site público.' : '',
  );
  const status = (await call(clients.s3, S3.GetBucketPolicyStatusCommand, { Bucket: bucket }, { missing: ['NoSuchBucketPolicy'] }))?.PolicyStatus?.IsPublic;
  add('S04', status === false ? 'ok' : 'falha', 'Política do bucket não é pública', `IsPublic=${status}`, 'Remova qualquer Allow com Principal "*" (deploy/aws/iam/politica-bucket.json).');
  const policyText = (await call(clients.s3, S3.GetBucketPolicyCommand, { Bucket: bucket }, { missing: ['NoSuchBucketPolicy'] }))?.Policy;
  const policy = policyText ? JSON.parse(policyText) : { Statement: [] };
  const website = await call(clients.s3, S3.GetBucketWebsiteCommand, { Bucket: bucket }, { missing: ['NoSuchWebsiteConfiguration'] });
  add('S05', website == null ? 'ok' : 'falha', 'S3 Static Website Hosting desabilitado', website ? 'habilitado' : 'desabilitado', 'S3 → bucket → Properties → Static website hosting → Disable.');
  const versioning = (await call(clients.s3, S3.GetBucketVersioningCommand, { Bucket: bucket }))?.Status ?? 'Disabled';
  inventory.bucket.versionamento = versioning;
  add('S06', 'info', 'Versionamento do bucket', versioning, versioning === 'Enabled' ? 'O rollback não depende dele. Se mantido, crie uma regra de ciclo de vida que expire versões antigas (custo de armazenamento).' : 'O rollback usa as cópias em _releases/ — versionamento não é necessário.');

  // Distribuição
  let dist;
  if (distributionId) {
    dist = await call(clients.cloudfront, CF.GetDistributionCommand, { Id: distributionId });
  } else {
    const list = (await call(clients.cloudfront, CF.ListDistributionsCommand, {}))?.DistributionList?.Items ?? [];
    const found = list.filter((d) => d.Origins?.Items?.some((o) => o.DomainName.startsWith(`${bucket}.s3.`)));
    if (found.length !== 1) {
      add('C00', 'falha', 'Distribuição do CloudFront com origem no bucket', `${found.length} encontrada(s)`, 'Informe --distribuicao <id>.');
      return { inventory, checks };
    }
    dist = await call(clients.cloudfront, CF.GetDistributionCommand, { Id: found[0].Id });
  }
  const d = dist.Distribution;
  const cfg = d.DistributionConfig;
  inventory.distribuicao = { id: d.Id, arn: d.ARN, dominio: d.DomainName, estado: d.Status, habilitada: cfg.Enabled, aliases: cfg.Aliases?.Items ?? [], priceClass: cfg.PriceClass, httpVersion: cfg.HttpVersion, ipv6: cfg.IsIPV6Enabled };
  add('C01', cfg.Enabled && d.Status === 'Deployed' ? 'ok' : 'pendente', 'Distribuição habilitada e implantada', `${d.Status}, Enabled=${cfg.Enabled}`);
  const origins = cfg.Origins.Items;
  const origin = origins.find((o) => o.DomainName.startsWith(`${bucket}.s3.`));
  add('C02', origin && !/s3-website/.test(origin.DomainName) && origins.length === 1 ? 'ok' : 'falha', 'Origem única: endpoint REST do bucket (não o de website)', origins.map((o) => o.DomainName).join(', '));
  const oacId = origin?.OriginAccessControlId || null;
  inventory.oac = { id: oacId };
  if (oacId) {
    const oac = (await call(clients.cloudfront, CF.GetOriginAccessControlCommand, { Id: oacId })).OriginAccessControl.OriginAccessControlConfig;
    inventory.oac = { id: oacId, nome: oac.Name, assinatura: oac.SigningBehavior, protocolo: oac.SigningProtocol, tipo: oac.OriginAccessControlOriginType };
    add('C03', oac.SigningBehavior === 'always' && oac.SigningProtocol === 'sigv4' && oac.OriginAccessControlOriginType === 's3' ? 'ok' : 'falha', 'OAC assina todas as requisições (sigv4, always)', JSON.stringify(inventory.oac));
  } else {
    add('C03', 'falha', 'OAC associado à origem', origin?.S3OriginConfig?.OriginAccessIdentity ? 'usa OAI legado' : 'sem OAC', 'Origins → Edit → Origin access control settings.');
  }
  const allow = (policy.Statement ?? []).filter((s) => s.Effect === 'Allow');
  const cfAllow = allow.find((s) => s.Principal?.Service === 'cloudfront.amazonaws.com' && [s.Action].flat().includes('s3:GetObject'));
  const sourceArn = cfAllow ? sourceArnRestriction(cfAllow, d.ARN) : { ok: false, detail: 'sem a declaração do CloudFront' };
  add('S07', sourceArn.ok ? 'ok' : 'falha', 'Política do bucket libera leitura só para esta distribuição (AWS:SourceArn)', sourceArn.detail || 'sem condição AWS:SourceArn (StringEquals, ArnEquals ou ArnLike)', `Condição AWS:SourceArn igual a ${d.ARN}, sem curingas nem lista de valores.`);
  const extra = allow.filter((s) => s !== cfAllow);
  add('S08', extra.length === 0 ? 'ok' : 'falha', 'Nenhuma outra permissão concedida pela política do bucket', extra.map((s) => s.Sid ?? JSON.stringify(s.Principal)).join(', ') || 'nenhuma');
  const denyReleases = (policy.Statement ?? []).some((s) => s.Effect === 'Deny' && [s.Resource].flat().some((r) => r.endsWith('/_releases/*')));
  add('S09', denyReleases ? 'ok' : 'pendente', 'Prefixo interno _releases/ negado ao CloudFront', denyReleases ? 'presente' : 'ausente', 'Aplicar deploy/aws/iam/politica-bucket.json (gerado com os IDs reais).');
  const writeOnce = (policy.Statement ?? []).some((s) => s.Effect === 'Deny' && s.Condition?.Null?.['s3:if-none-match'] === 'true');
  add('S10', writeOnce ? 'ok' : 'pendente', 'Assets e releases gravados uma única vez (If-None-Match obrigatório)', writeOnce ? 'presente' : 'ausente', 'Aplicar deploy/aws/iam/politica-bucket.json.');

  add('C04', cfg.DefaultRootObject === 'index.html' ? 'ok' : 'falha', 'Default root object = index.html', cfg.DefaultRootObject || '(vazio)');
  const beh = cfg.DefaultCacheBehavior;
  const others = cfg.CacheBehaviors?.Quantity ?? 0;
  add('C05', beh.ViewerProtocolPolicy === 'redirect-to-https' ? 'ok' : 'falha', 'HTTP redireciona para HTTPS', beh.ViewerProtocolPolicy);
  add('C06', beh.CachePolicyId === CACHING_OPTIMIZED && beh.Compress ? 'ok' : 'info', 'Política de cache respeita o Cache-Control dos objetos (CachingOptimized) e comprime', `CachePolicyId=${beh.CachePolicyId ?? 'legado (ForwardedValues)'}, Compress=${beh.Compress}, comportamentos extras=${others}`, 'Recomendado: Managed-CachingOptimized + Compress objects automatically = Yes.');
  add('C07', JSON.stringify([...(beh.AllowedMethods?.Items ?? [])].sort()) === JSON.stringify(['GET', 'HEAD']) ? 'ok' : 'falha', 'Só GET e HEAD aceitos', (beh.AllowedMethods?.Items ?? []).join(', '));
  const rhp = beh.ResponseHeadersPolicyId || null;
  inventory.distribuicao.responseHeadersPolicyId = rhp;
  if (rhp) {
    const live = (await call(clients.cloudfront, CF.GetResponseHeadersPolicyCommand, { Id: rhp })).ResponseHeadersPolicy.ResponseHeadersPolicyConfig;
    const same = JSON.stringify(live.SecurityHeadersConfig) === JSON.stringify(versionedPolicy.SecurityHeadersConfig) && JSON.stringify(live.CustomHeadersConfig) === JSON.stringify(versionedPolicy.CustomHeadersConfig);
    add('C08', same ? 'ok' : 'falha', 'Response Headers Policy igual à versionada (deploy/aws/politica-cabecalhos.json)', live.Name, 'Atualize a política com o conteúdo do arquivo versionado.');
  } else {
    add('C08', 'pendente', 'Response Headers Policy associada ao comportamento padrão', 'nenhuma', 'Criar a política a partir de deploy/aws/politica-cabecalhos.json e associá-la (runbook, passo 3).');
  }
  const fn = (beh.FunctionAssociations?.Items ?? []).find((f) => f.EventType === 'viewer-request');
  if (fn) {
    const code = await call(clients.cloudfront, CF.GetFunctionCommand, { Name: fn.FunctionARN.split('/').pop(), Stage: 'LIVE' });
    const live = Buffer.from(code.FunctionCode).toString('utf8');
    add('C09', live.trim() === versionedFunction.trim() ? 'ok' : 'falha', 'CloudFront Function viewer-request igual à versionada', fn.FunctionARN);
  } else {
    add('C09', 'pendente', 'CloudFront Function viewer-request (www → apex, bloqueio de _releases/)', 'nenhuma', 'Criar a função a partir de deploy/aws/funcao-viewer-request.js (runbook, passo 4).');
  }
  const errs = cfg.CustomErrorResponses?.Items ?? [];
  const errOk = ERROR_RESPONSES.every((e) => errs.some((x) => x.ErrorCode === e.ErrorCode && x.ResponsePagePath === e.ResponsePagePath && String(x.ResponseCode) === e.ResponseCode));
  const to200 = errs.filter((x) => String(x.ResponseCode) === '200');
  add('C10', errOk && !to200.length ? 'ok' : 'pendente', 'Erros 403/404 → /404.html com status 404 (nenhum vira 200)', errs.map((x) => `${x.ErrorCode}→${x.ResponsePagePath ?? '-'} ${x.ResponseCode ?? ''}`).join(', ') || 'nenhuma resposta de erro', 'Error pages → 403 e 404: /404.html, código 404, TTL 60.');
  add('C11', 'info', 'AWS WAF', cfg.WebACLId ? `associado (${cfg.WebACLId}) — tem custo mensal` : 'desativado (sem custo; decisão da titular)');
  add('C12', 'info', 'Classe de preço', cfg.PriceClass, cfg.PriceClass === 'PriceClass_All' ? '' : 'Visitantes no Brasil só usam pontos da América do Sul com PriceClass_All; com o nível gratuito, a diferença de custo é desprezível.');
  add('C13', cfg.Logging?.Enabled ? 'info' : 'ok', 'Logs padrão do CloudFront', cfg.Logging?.Enabled ? `habilitados em ${cfg.Logging.Bucket} (custo de armazenamento)` : 'desabilitados');

  // Domínio e certificado
  const aliases = cfg.Aliases?.Items ?? [];
  const vc = cfg.ViewerCertificate;
  add('D01', DOMAINS.every((x) => aliases.includes(x)) ? 'ok' : 'pendente', 'Nomes alternativos nekkora.com e www.nekkora.com', aliases.join(', ') || 'nenhum', 'Exige o certificado emitido; não altera DNS.');
  add('D02', vc.CloudFrontDefaultCertificate ? 'pendente' : vc.SSLSupportMethod === 'sni-only' ? 'ok' : 'falha', 'Certificado próprio com SNI (sem IP dedicado)', vc.CloudFrontDefaultCertificate ? 'certificado padrão *.cloudfront.net' : `${vc.SSLSupportMethod}, ${vc.MinimumProtocolVersion}`, vc.SSLSupportMethod === 'vip' ? 'URGENTE: "Legacy clients support" (IP dedicado) custa US$ 600/mês — troque para SNI.' : '');
  if (!vc.CloudFrontDefaultCertificate) add('D03', /^TLSv1\.2_20(19|21)$/.test(vc.MinimumProtocolVersion) ? 'ok' : 'falha', 'TLS mínimo 1.2', vc.MinimumProtocolVersion);
  const certs = (await call(clients.acm, ACM.ListCertificatesCommand, {
      CertificateStatuses: ['PENDING_VALIDATION', 'ISSUED', 'FAILED', 'VALIDATION_TIMED_OUT', 'EXPIRED', 'INACTIVE', 'REVOKED'],
      // Sem Includes, o ACM só lista certificados RSA 2048
      Includes: { keyTypes: ['RSA_2048', 'RSA_3072', 'RSA_4096', 'EC_prime256v1', 'EC_secp384r1', 'EC_secp521r1'] },
    }))?.CertificateSummaryList ?? [];
  const candidates = certs.filter((c) => c.DomainName === 'nekkora.com' || c.SubjectAlternativeNameSummaries?.includes('nekkora.com'));
  // O certificado da distribuição entra mesmo que a listagem não o traga (SANs truncados na listagem)
  const arns = [...new Set([vc.ACMCertificateArn, ...candidates.map((c) => c.CertificateArn)].filter(Boolean))];
  inventory.certificados = [];
  for (const arn of arns) {
    const cert = (await call(clients.acm, ACM.DescribeCertificateCommand, { CertificateArn: arn }, { missing: ['ResourceNotFoundException'] }))?.Certificate;
    if (!cert) continue;
    inventory.certificados.push({
      arn: cert.CertificateArn,
      estado: cert.Status,
      nomes: cert.SubjectAlternativeNames ?? [],
      validoAte: cert.NotAfter ? new Date(cert.NotAfter).toISOString() : null,
      emUsoPor: cert.InUseBy ?? [],
      validacao: (cert.DomainValidationOptions ?? []).map((v) => ({ dominio: v.DomainName, metodo: v.ValidationMethod, estado: v.ValidationStatus, registro: v.ResourceRecord ?? null })),
    });
  }
  const covers = (c) => DOMAINS.every((x) => c.nomes.includes(x));
  const adequate = (c) => c.estado === 'ISSUED' && covers(c) && (!c.validoAte || new Date(c.validoAte) > now());
  const attached = inventory.certificados.find((c) => c.arn === vc.ACMCertificateArn) ?? null;
  // Prioridade: o associado à distribuição, outro emitido e adequado, um aguardando validação, qualquer outro
  const ranked = inventory.certificados.filter(covers);
  const cert =
    (attached && adequate(attached) ? attached : null) ??
    ranked.find(adequate) ??
    ranked.find((c) => c.estado === 'PENDING_VALIDATION') ??
    (attached && covers(attached) ? attached : null) ??
    ranked[0];
  inventory.certificadoSelecionado = cert?.arn ?? null;
  const certTitle = 'Certificado ACM (us-east-1) emitido e válido para nekkora.com e www.nekkora.com';
  if (!cert) {
    add('K01', 'falha', certTitle, `${candidates.length} certificado(s) encontrado(s) para nekkora.com`, 'Solicitar no ACM, região us-east-1, com os dois nomes e validação por DNS.');
  } else if (adequate(cert)) {
    add('K01', 'ok', certTitle, `${cert.arn} — ${cert.estado}${cert.validoAte ? `, válido até ${cert.validoAte}` : ''}`);
  } else if (cert.estado === 'PENDING_VALIDATION') {
    const records = cert.validacao.filter((v) => v.registro).map((v) => `${v.registro.Name} CNAME ${v.registro.Value} (${v.dominio}: ${v.estado})`);
    add('K01', 'pendente', certTitle, `${cert.arn} — ${cert.estado}`, `Validação por DNS pendente. Registros a criar na Cloudflare (DNS only), após autorização: ${records.join(' · ')}`);
  } else {
    add('K01', 'falha', certTitle, `${cert.arn} — ${cert.estado}`, 'Nenhum certificado emitido: solicitar um novo no ACM (us-east-1) com os dois nomes e validação por DNS.');
  }
  const k02Title = 'Certificado emitido associado à distribuição do CloudFront';
  if (vc.CloudFrontDefaultCertificate || !vc.ACMCertificateArn) {
    add('K02', 'pendente', k02Title, 'certificado padrão *.cloudfront.net', 'Associar o certificado emitido à distribuição (Settings → Custom SSL certificate).');
  } else if (attached && adequate(attached)) {
    add('K02', 'ok', k02Title, `${attached.arn}${attached.emUsoPor.includes(d.ARN) ? ' (ACM confirma o uso pela distribuição)' : ''}`);
  } else {
    add('K02', 'falha', k02Title, `${vc.ACMCertificateArn} — ${attached ? `${attached.estado}, ${attached.nomes.join(', ')}` : 'não encontrado no ACM (us-east-1)'}`, 'Associar à distribuição um certificado emitido para nekkora.com e www.nekkora.com.');
  }
  return { inventory, checks };
}

export function report({ inventory, checks }) {
  const icon = { ok: 'OK', pendente: 'PENDENTE', falha: '**FALHA**', info: 'info' };
  return [
    `# Auditoria AWS — Nekkora Commercial (${inventory.verificadoEm})`,
    '',
    'Somente leitura. Identificadores reais encontrados:',
    '',
    '```json',
    JSON.stringify(inventory, null, 2),
    '```',
    '',
    '| ID | Situação | Verificação | Encontrado | Como resolver |',
    '|---|---|---|---|---|',
    ...checks.map((c) => `| ${c.id} | ${icon[c.status]} | ${c.title} | ${String(c.detail).replace(/\|/g, '\\|')} | ${String(c.fix).replace(/\|/g, '\\|')} |`),
    '',
  ].join('\n');
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const argv = process.argv.slice(2);
  const opt = (n) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : null);
  const bucket = opt('--bucket') ?? process.env.AWS_S3_BUCKET;
  if (!bucket) {
    console.error('informe --bucket <nome> (ou AWS_S3_BUCKET)');
    process.exit(2);
  }
  const [S3, CF, ACM, STS] = await Promise.all(['@aws-sdk/client-s3', '@aws-sdk/client-cloudfront', '@aws-sdk/client-acm', '@aws-sdk/client-sts'].map((m) => import(m)));
  const region = process.env.AWS_REGION ?? 'us-east-1';
  // O cliente S3 segue o redirecionamento de região sozinho; CloudFront e o certificado do CloudFront ficam em us-east-1.
  const clients = { s3: new S3.S3Client({ region, followRegionRedirects: true }), cloudfront: new CF.CloudFrontClient({ region: 'us-east-1' }), acm: new ACM.ACMClient({ region: 'us-east-1' }), sts: new STS.STSClient({ region }) };
  const result = await audit({
    clients,
    sdk: { S3, CF, ACM, STS },
    bucket,
    distributionId: opt('--distribuicao') ?? process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID ?? null,
    versionedPolicy: JSON.parse(readFileSync(join(root, 'deploy/aws/politica-cabecalhos.json'), 'utf8')),
    versionedFunction: readFileSync(join(root, 'deploy/aws/funcao-viewer-request.js'), 'utf8'),
  });
  const out = opt('--saida');
  if (out) {
    mkdirSync(out, { recursive: true });
    writeFileSync(join(out, 'auditoria.json'), `${JSON.stringify(result, null, 2)}\n`);
    writeFileSync(join(out, 'auditoria.md'), report(result));
  }
  console.log(report(result));
  if (process.env.GITHUB_STEP_SUMMARY) writeFileSync(process.env.GITHUB_STEP_SUMMARY, report(result), { flag: 'a' });
  process.exitCode = result.checks.some((c) => c.status === 'falha') ? 1 : 0;
}
