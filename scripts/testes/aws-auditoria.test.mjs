/**
 * Auditoria somente leitura (scripts/aws/auditar.mjs) com respostas SIMULADAS da AWS — usa as classes de comando do
 * próprio SDK, então os nomes de operação e parâmetros são os reais. Cobre a configuração correta, o estado "em
 * andamento" (certificado aguardando DNS), os erros mais comuns de configuração manual e os falsos positivos da
 * auditoria real de 26/10/2026 (S07 com ArnLike; K01/K02 com um certificado antigo VALIDATION_TIMED_OUT ao lado do novo).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as S3 from '@aws-sdk/client-s3';
import * as CF from '@aws-sdk/client-cloudfront';
import * as ACM from '@aws-sdk/client-acm';
import * as STS from '@aws-sdk/client-sts';
import { audit, CACHING_OPTIMIZED, normalizeHeadersPolicy, report, structuralDiff } from '../aws/auditar.mjs';

const versionedPolicy = JSON.parse(readFileSync(resolve('deploy/aws/politica-cabecalhos.json'), 'utf8'));
const versionedFunction = readFileSync(resolve('deploy/aws/funcao-viewer-request.js'), 'utf8');
// Identificadores FICTÍCIOS
const ACCOUNT = '111122223333';
const BUCKET = 'nekkora-commercial-teste';
const DIST = 'E2EXEMPLO12345';
const DIST_ARN = `arn:aws:cloudfront::${ACCOUNT}:distribution/${DIST}`;
const CERT = `arn:aws:acm:us-east-1:${ACCOUNT}:certificate/00000000-0000-0000-0000-000000000000`;
const OLD_CERT = `arn:aws:acm:us-east-1:${ACCOUNT}:certificate/11111111-1111-1111-1111-111111111111`;

function awsError(name) {
  return Object.assign(new Error(name), { name });
}
/** Estado de uma conta bem configurada; cada teste altera o que precisa. */
function account() {
  return {
    identity: `arn:aws:iam::${ACCOUNT}:user/titular`,
    pab: { BlockPublicAcls: true, IgnorePublicAcls: true, BlockPublicPolicy: true, RestrictPublicBuckets: true },
    ownership: 'BucketOwnerEnforced',
    encryption: { SSEAlgorithm: 'AES256' },
    isPublic: false,
    policy: {
      Statement: [
        { Sid: 'CloudFrontLeObjetosPeloOAC', Effect: 'Allow', Principal: { Service: 'cloudfront.amazonaws.com' }, Action: 's3:GetObject', Resource: `arn:aws:s3:::${BUCKET}/*`, Condition: { StringEquals: { 'AWS:SourceArn': DIST_ARN } } },
        { Sid: 'CloudFrontNuncaServeOPrefixoInterno', Effect: 'Deny', Principal: { Service: 'cloudfront.amazonaws.com' }, Action: 's3:GetObject', Resource: `arn:aws:s3:::${BUCKET}/_releases/*` },
        { Sid: 'AssetsEReleasesGravadosUmaVez', Effect: 'Deny', Principal: '*', Action: 's3:PutObject', Resource: [`arn:aws:s3:::${BUCKET}/assets/*`], Condition: { Null: { 's3:if-none-match': 'true' } } },
      ],
    },
    website: null,
    distribution: {
      Id: DIST,
      ARN: DIST_ARN,
      DomainName: 'd111111abcdef8.cloudfront.net',
      Status: 'Deployed',
      DistributionConfig: {
        Enabled: true,
        Aliases: { Quantity: 2, Items: ['nekkora.com', 'www.nekkora.com'] },
        DefaultRootObject: 'index.html',
        Origins: { Quantity: 1, Items: [{ Id: 's3', DomainName: `${BUCKET}.s3.sa-east-1.amazonaws.com`, OriginAccessControlId: 'EOAC123', S3OriginConfig: { OriginAccessIdentity: '' } }] },
        DefaultCacheBehavior: {
          ViewerProtocolPolicy: 'redirect-to-https',
          CachePolicyId: CACHING_OPTIMIZED,
          Compress: true,
          AllowedMethods: { Quantity: 2, Items: ['HEAD', 'GET'] },
          ResponseHeadersPolicyId: 'rhp-1',
          FunctionAssociations: { Quantity: 1, Items: [{ EventType: 'viewer-request', FunctionARN: `arn:aws:cloudfront::${ACCOUNT}:function/nekkora-commercial-viewer-request` }] },
        },
        CacheBehaviors: { Quantity: 0 },
        CustomErrorResponses: { Quantity: 2, Items: [403, 404].map((c) => ({ ErrorCode: c, ResponsePagePath: '/404.html', ResponseCode: '404', ErrorCachingMinTTL: 60 })) },
        ViewerCertificate: { ACMCertificateArn: CERT, SSLSupportMethod: 'sni-only', MinimumProtocolVersion: 'TLSv1.2_2021' },
        PriceClass: 'PriceClass_All',
        WebACLId: '',
        Logging: { Enabled: false },
      },
    },
    oac: { Name: 'nekkora-oac', SigningBehavior: 'always', SigningProtocol: 'sigv4', OriginAccessControlOriginType: 's3' },
    livePolicy: versionedPolicy,
    liveFunction: versionedFunction,
    certs: [{ CertificateArn: CERT, Status: 'ISSUED', SubjectAlternativeNames: ['nekkora.com', 'www.nekkora.com'], InUseBy: [DIST_ARN], NotAfter: new Date('2027-11-25T23:59:59Z'), DomainValidationOptions: [] }],
  };
}

function clientsFor(a) {
  const calls = [];
  const handlers = {
    GetCallerIdentityCommand: () => ({ Account: ACCOUNT, Arn: a.identity }),
    GetBucketLocationCommand: () => ({ LocationConstraint: 'sa-east-1' }),
    GetPublicAccessBlockCommand: () => ({ PublicAccessBlockConfiguration: a.pab }),
    GetBucketOwnershipControlsCommand: () => ({ OwnershipControls: { Rules: [{ ObjectOwnership: a.ownership }] } }),
    GetBucketEncryptionCommand: () => ({ ServerSideEncryptionConfiguration: { Rules: [{ ApplyServerSideEncryptionByDefault: a.encryption }] } }),
    GetBucketPolicyStatusCommand: () => ({ PolicyStatus: { IsPublic: a.isPublic } }),
    GetBucketPolicyCommand: () => ({ Policy: JSON.stringify(a.policy) }),
    GetBucketWebsiteCommand: () => {
      if (!a.website) throw awsError('NoSuchWebsiteConfiguration');
      return a.website;
    },
    GetBucketVersioningCommand: () => ({ Status: 'Suspended' }),
    GetDistributionCommand: () => ({ Distribution: a.distribution }),
    ListDistributionsCommand: () => ({ DistributionList: { Items: [{ Id: DIST, Origins: a.distribution.DistributionConfig.Origins }] } }),
    GetOriginAccessControlCommand: () => ({ OriginAccessControl: { OriginAccessControlConfig: a.oac } }),
    GetResponseHeadersPolicyCommand: () => ({ ResponseHeadersPolicy: { ResponseHeadersPolicyConfig: a.livePolicy } }),
    GetFunctionCommand: () => ({ FunctionCode: new TextEncoder().encode(a.liveFunction) }),
    ListCertificatesCommand: () => ({ CertificateSummaryList: a.certs.filter((c) => !c.unlisted).map((c) => ({ CertificateArn: c.CertificateArn, DomainName: c.SubjectAlternativeNames[0], Status: c.Status })) }),
    DescribeCertificateCommand: ({ CertificateArn }) => {
      const cert = a.certs.find((c) => c.CertificateArn === CertificateArn);
      if (!cert) throw awsError('ResourceNotFoundException');
      return { Certificate: cert };
    },
  };
  const client = {
    send: async (cmd) => {
      const n = cmd.constructor.name;
      calls.push(n);
      if (!handlers[n]) throw new Error(`operação não simulada: ${n}`);
      return handlers[n](cmd.input);
    },
  };
  return { clients: { s3: client, cloudfront: client, acm: client, sts: client }, calls };
}
const run = (a, extra = {}) => {
  const { clients, calls } = clientsFor(a);
  return audit({ clients, sdk: { S3, CF, ACM, STS }, bucket: BUCKET, distributionId: DIST, versionedPolicy, versionedFunction, now: () => new Date('2026-10-26T12:00:00Z'), ...extra }).then((r) => ({ ...r, calls }));
};
const statusOf = (r, id) => r.checks.find((c) => c.id === id)?.status;

test('conta bem configurada: nenhuma falha e inventário com os identificadores reais', async () => {
  const r = await run(account());
  assert.deepEqual(r.checks.filter((c) => c.status === 'falha'), []);
  assert.equal(r.inventory.conta, ACCOUNT);
  assert.equal(r.inventory.bucket.regiao, 'sa-east-1');
  assert.equal(r.inventory.distribuicao.arn, DIST_ARN);
  assert.equal(r.inventory.oac.id, 'EOAC123');
  assert.equal(r.inventory.certificados[0].estado, 'ISSUED');
  assert.match(report(r), /\| K01 \| OK \|/);
});

test('somente leitura: só operações Get/List/Describe', async () => {
  const r = await run(account());
  assert.ok(r.calls.every((n) => /^(Get|List|Describe)/.test(n)), r.calls.join(', '));
});

test('certificado aguardando validação DNS: pendente, com os registros a criar', async () => {
  const a = account();
  a.certs[0] = { ...a.certs[0], Status: 'PENDING_VALIDATION', InUseBy: [], DomainValidationOptions: [{ DomainName: 'nekkora.com', ValidationMethod: 'DNS', ValidationStatus: 'PENDING_VALIDATION', ResourceRecord: { Name: '_abc.nekkora.com.', Type: 'CNAME', Value: '_xyz.acm-validations.aws.' } }] };
  a.distribution.DistributionConfig.ViewerCertificate = { CloudFrontDefaultCertificate: true };
  a.distribution.DistributionConfig.Aliases = { Quantity: 0, Items: [] };
  const r = await run(a);
  assert.equal(statusOf(r, 'K01'), 'pendente');
  assert.match(r.checks.find((c) => c.id === 'K01').fix, /_abc\.nekkora\.com\. CNAME _xyz\.acm-validations\.aws\./);
  assert.equal(statusOf(r, 'D01'), 'pendente');
  assert.equal(statusOf(r, 'D02'), 'pendente');
  assert.equal(statusOf(r, 'K02'), 'pendente');
  assert.deepEqual(r.checks.filter((c) => c.status === 'falha'), []);
});

test('erros comuns de configuração manual viram falha, com o motivo', async () => {
  const cases = [
    ['S01', (a) => (a.pab = { ...a.pab, BlockPublicPolicy: false })],
    ['S02', (a) => (a.ownership = 'ObjectWriter')],
    ['S04', (a) => (a.isPublic = true)],
    ['S05', (a) => (a.website = { IndexDocument: { Suffix: 'index.html' } })],
    ['S07', (a) => (a.policy.Statement[0].Condition.StringEquals['AWS:SourceArn'] = `arn:aws:cloudfront::${ACCOUNT}:distribution/EOUTRA`)],
    ['S08', (a) => a.policy.Statement.push({ Sid: 'Publico', Effect: 'Allow', Principal: '*', Action: 's3:GetObject', Resource: `arn:aws:s3:::${BUCKET}/*` })],
    ['C02', (a) => (a.distribution.DistributionConfig.Origins.Items[0].DomainName = `${BUCKET}.s3-website-sa-east-1.amazonaws.com`)],
    ['C03', (a) => (a.oac = { ...a.oac, SigningBehavior: 'never' })],
    ['C04', (a) => (a.distribution.DistributionConfig.DefaultRootObject = '')],
    ['C05', (a) => (a.distribution.DistributionConfig.DefaultCacheBehavior.ViewerProtocolPolicy = 'allow-all')],
    ['C08', (a) => (a.livePolicy = { ...versionedPolicy, CustomHeadersConfig: { Quantity: 0, Items: [] } })],
    ['C09', (a) => (a.liveFunction = 'function handler(e){return e.request}')],
    ['D02', (a) => (a.distribution.DistributionConfig.ViewerCertificate.SSLSupportMethod = 'vip')],
    ['A01', (a) => (a.identity = `arn:aws:iam::${ACCOUNT}:root`)],
  ];
  for (const [id, mutate] of cases) {
    const a = account();
    mutate(a);
    const r = await run(a);
    assert.equal(statusOf(r, id), 'falha', `${id}: ${JSON.stringify(r.checks.find((c) => c.id === id))}`);
  }
});

test('IP dedicado (vip) é apontado como custo de US$ 600/mês', async () => {
  const a = account();
  a.distribution.DistributionConfig.ViewerCertificate.SSLSupportMethod = 'vip';
  const r = await run(a);
  assert.match(r.checks.find((c) => c.id === 'D02').fix, /600/);
});

test('erro convertido em 200 (fallback de SPA) não é aceito', async () => {
  const a = account();
  a.distribution.DistributionConfig.CustomErrorResponses.Items[1].ResponseCode = '200';
  const r = await run(a);
  assert.equal(statusOf(r, 'C10'), 'pendente');
});

test('descobre a distribuição pela origem quando o ID não é informado', async () => {
  const r = await run(account(), { distributionId: null });
  assert.equal(r.inventory.distribuicao.id, DIST);
  assert.ok(r.calls.includes('ListDistributionsCommand'));
});

const timedOut = () => ({
  CertificateArn: OLD_CERT,
  Status: 'VALIDATION_TIMED_OUT',
  SubjectAlternativeNames: ['nekkora.com', 'www.nekkora.com'],
  InUseBy: [],
  DomainValidationOptions: [{ DomainName: 'nekkora.com', ValidationMethod: 'DNS', ValidationStatus: 'FAILED', ResourceRecord: { Name: '_old.nekkora.com.', Type: 'CNAME', Value: '_old.acm-validations.aws.' } }],
});
const cfAllow = (a) => a.policy.Statement[0];

test('regressão S07: StringEquals, ArnEquals e ArnLike com o ARN exato da distribuição são aceitos', async () => {
  for (const op of ['StringEquals', 'ArnEquals', 'ArnLike']) {
    const a = account();
    cfAllow(a).Condition = { [op]: { 'AWS:SourceArn': DIST_ARN } };
    const r = await run(a);
    assert.equal(statusOf(r, 'S07'), 'ok', `${op}: ${JSON.stringify(r.checks.find((c) => c.id === 'S07'))}`);
  }
  // chave de condição não diferencia maiúsculas; lista de um único valor equivale ao valor
  const a = account();
  cfAllow(a).Condition = { ArnLike: { 'aws:SourceArn': [DIST_ARN] } };
  assert.equal(statusOf(await run(a), 'S07'), 'ok');
});

test('S07: condições ARN que ampliam o acesso ou não restringem viram falha', async () => {
  const other = `arn:aws:cloudfront::${ACCOUNT}:distribution/EOUTRA`;
  const cases = {
    'curinga em todas as distribuições': { ArnLike: { 'AWS:SourceArn': `arn:aws:cloudfront::${ACCOUNT}:distribution/*` } },
    'curinga no fim do ID': { ArnLike: { 'AWS:SourceArn': `${DIST_ARN.slice(0, -3)}*` } },
    'curinga de um caractere': { ArnLike: { 'AWS:SourceArn': `${DIST_ARN.slice(0, -1)}?` } },
    'curinga na conta': { ArnLike: { 'AWS:SourceArn': `arn:aws:cloudfront::*:distribution/${DIST}` } },
    'só curinga': { ArnLike: { 'AWS:SourceArn': '*' } },
    'lista com outra distribuição (OU)': { ArnEquals: { 'AWS:SourceArn': [DIST_ARN, other] } },
    'ARN exato e curinga em outro operador': { StringEquals: { 'AWS:SourceArn': DIST_ARN }, ArnLike: { 'AWS:SourceArn': `arn:aws:cloudfront::${ACCOUNT}:distribution/*` } },
    'outra distribuição com ArnLike': { ArnLike: { 'AWS:SourceArn': other } },
    'IfExists (passa sem a chave)': { ArnLikeIfExists: { 'AWS:SourceArn': DIST_ARN } },
    'ForAnyValue': { 'ForAnyValue:ArnLike': { 'AWS:SourceArn': DIST_ARN } },
    'StringLike (não aceito)': { StringLike: { 'AWS:SourceArn': DIST_ARN } },
    'só AWS:SourceAccount': { StringEquals: { 'AWS:SourceAccount': ACCOUNT } },
    'sem condição': undefined,
  };
  for (const [name, condition] of Object.entries(cases)) {
    const a = account();
    cfAllow(a).Condition = condition;
    const r = await run(a);
    assert.equal(statusOf(r, 'S07'), 'falha', `${name}: ${JSON.stringify(r.checks.find((c) => c.id === 'S07'))}`);
  }
});

test('regressão K01/K02: certificado antigo VALIDATION_TIMED_OUT não esconde o emitido e associado', async () => {
  const a = account();
  a.certs.unshift(timedOut()); // listado antes do novo, como na auditoria real
  const r = await run(a);
  assert.equal(statusOf(r, 'K01'), 'ok', JSON.stringify(r.checks.find((c) => c.id === 'K01')));
  assert.equal(statusOf(r, 'K02'), 'ok', JSON.stringify(r.checks.find((c) => c.id === 'K02')));
  assert.equal(r.inventory.certificadoSelecionado, CERT);
  assert.equal(r.inventory.certificados.length, 2);
  assert.doesNotMatch(r.checks.find((c) => c.id === 'K01').detail, /TIMED_OUT/);
});

test('K01/K02: prioriza o certificado associado à distribuição, mesmo fora da listagem', async () => {
  const a = account();
  a.certs.push({ ...a.certs[0], CertificateArn: `${CERT.slice(0, -1)}9`, InUseBy: [] });
  a.certs[0].unlisted = true;
  const r = await run(a);
  assert.equal(r.inventory.certificadoSelecionado, CERT);
  assert.equal(statusOf(r, 'K02'), 'ok');
});

test('K01/K02: emitido mas não associado — K01 ok, K02 pendente', async () => {
  const a = account();
  a.certs = [timedOut(), { ...a.certs[0], InUseBy: [] }];
  a.distribution.DistributionConfig.ViewerCertificate = { CloudFrontDefaultCertificate: true };
  const r = await run(a);
  assert.equal(statusOf(r, 'K01'), 'ok');
  assert.equal(statusOf(r, 'K02'), 'pendente');
  assert.equal(r.inventory.certificadoSelecionado, CERT);
});

test('K01/K02: só o certificado VALIDATION_TIMED_OUT — falha, pede um novo', async () => {
  const a = account();
  a.certs = [timedOut()];
  a.distribution.DistributionConfig.ViewerCertificate = { CloudFrontDefaultCertificate: true };
  const r = await run(a);
  assert.equal(statusOf(r, 'K01'), 'falha');
  assert.match(r.checks.find((c) => c.id === 'K01').fix, /solicitar um novo/);
  assert.equal(statusOf(r, 'K02'), 'pendente');
});

test('K01/K02: certificado associado vencido ou sem www não é adequado', async () => {
  const expired = account();
  expired.certs[0].NotAfter = new Date('2026-10-01T00:00:00Z');
  const r1 = await run(expired);
  assert.equal(statusOf(r1, 'K01'), 'falha');
  assert.equal(statusOf(r1, 'K02'), 'falha');
  const apexOnly = account();
  apexOnly.certs[0].SubjectAlternativeNames = ['nekkora.com'];
  const r2 = await run(apexOnly);
  assert.equal(statusOf(r2, 'K01'), 'falha');
  assert.equal(statusOf(r2, 'K02'), 'falha');
});

test('K02: certificado da distribuição inexistente no ACM vira falha, sem derrubar a auditoria', async () => {
  const a = account();
  a.distribution.DistributionConfig.ViewerCertificate.ACMCertificateArn = `${CERT.slice(0, -1)}8`;
  const r = await run(a);
  assert.equal(statusOf(r, 'K01'), 'ok');
  assert.equal(statusOf(r, 'K02'), 'falha');
  assert.match(r.checks.find((c) => c.id === 'K02').detail, /não encontrado/);
});

test('cenário reconstruído da auditoria de 26/10/2026 (S07/K01/K02): 21 ok, 5 pendentes, nenhuma falha, 3 informativos', async () => {
  // Reconstruído só do relato da S07/K01/K02 (a auditoria real mostrou depois que a política de cabeçalhos já estava
  // associada — ver o teste de regressão C08):ArnLike com o ARN exato, certificado antigo VALIDATION_TIMED_OUT + novo ISSUED associado,
  // política do bucket sem as declarações versionadas, e cabeçalhos/função/páginas de erro ainda por configurar.
  const a = account();
  a.policy.Statement = [{ ...cfAllow(a), Condition: { ArnLike: { 'AWS:SourceArn': DIST_ARN } } }];
  a.certs.unshift(timedOut());
  const c = a.distribution.DistributionConfig;
  c.DefaultCacheBehavior.ResponseHeadersPolicyId = '';
  c.DefaultCacheBehavior.FunctionAssociations = { Quantity: 0, Items: [] };
  c.CustomErrorResponses = { Quantity: 0, Items: [] };
  const r = await run(a);
  const by = (st) => r.checks.filter((x) => x.status === st).map((x) => x.id);
  assert.deepEqual(by('falha'), []);
  assert.deepEqual(by('pendente'), ['S09', 'S10', 'C08', 'C09', 'C10']);
  assert.deepEqual(by('info'), ['S06', 'C11', 'C12']);
  assert.equal(by('ok').length, 21);
  for (const id of ['S07', 'K01', 'K02']) assert.equal(statusOf(r, id), 'ok');
});

/** Como a AWS devolve a política real: mesmas configurações, outra ordem de propriedades e XSSProtection: {}. */
function asReturnedByAws(p) {
  const s = p.SecurityHeadersConfig;
  return {
    RemoveHeadersConfig: p.RemoveHeadersConfig,
    Name: p.Name,
    CustomHeadersConfig: { Items: [...p.CustomHeadersConfig.Items].reverse().map((i) => ({ Override: i.Override, Value: i.Value, Header: i.Header })), Quantity: p.CustomHeadersConfig.Quantity },
    Comment: p.Comment,
    SecurityHeadersConfig: {
      XSSProtection: {},
      ReferrerPolicy: s.ReferrerPolicy,
      FrameOptions: { FrameOption: s.FrameOptions.FrameOption, Override: s.FrameOptions.Override },
      ContentTypeOptions: s.ContentTypeOptions,
      StrictTransportSecurity: { Preload: s.StrictTransportSecurity.Preload, IncludeSubdomains: s.StrictTransportSecurity.IncludeSubdomains, AccessControlMaxAgeSec: s.StrictTransportSecurity.AccessControlMaxAgeSec, Override: s.StrictTransportSecurity.Override },
      ContentSecurityPolicy: s.ContentSecurityPolicy,
    },
  };
}
const withLivePolicy = (live) => {
  const a = account();
  a.distribution.DistributionConfig.DefaultCacheBehavior.ResponseHeadersPolicyId = 'dc2d71f5-a25d-4718-82b0-fe57ad674e13';
  a.livePolicy = live;
  return a;
};
const c08 = (r) => r.checks.find((c) => c.id === 'C08');

test('regressão C08 (auditoria real): XSSProtection: {} e outra ordem de propriedades não são diferença', async () => {
  const r = await run(withLivePolicy(asReturnedByAws(versionedPolicy)));
  assert.equal(c08(r).status, 'ok', JSON.stringify(c08(r)));
  assert.match(c08(r).detail, /nekkora-commercial-seguranca \(dc2d71f5-a25d-4718-82b0-fe57ad674e13\)/);
  // Name e Comment só descrevem a política
  const relabeled = asReturnedByAws(versionedPolicy);
  relabeled.Comment = 'editado no console';
  assert.equal(c08(await run(withLivePolicy(relabeled))).status, 'ok');
  // a mesma política no formato antigo do auditor (JSON.stringify) dava diferença
  assert.notEqual(JSON.stringify(asReturnedByAws(versionedPolicy).SecurityHeadersConfig), JSON.stringify(versionedPolicy.SecurityHeadersConfig));
});

test('C08: XSSProtection com valor efetivo, propriedade inesperada ou cabeçalho diferente vira falha', async () => {
  const cases = {
    'XSSProtection ligado': (p) => (p.SecurityHeadersConfig.XSSProtection = { Override: true, Protection: true, ModeBlock: true }),
    'XSSProtection desligado explicitamente': (p) => (p.SecurityHeadersConfig.XSSProtection = { Override: true, Protection: false }),
    'propriedade inesperada em SecurityHeadersConfig': (p) => (p.SecurityHeadersConfig.Novidade = { Override: true }),
    'propriedade inesperada em um cabeçalho': (p) => (p.SecurityHeadersConfig.FrameOptions.Extra = false),
    'CSP diferente': (p) => (p.SecurityHeadersConfig.ContentSecurityPolicy.ContentSecurityPolicy += "; script-src *"),
    'HSTS sem subdomínios': (p) => (p.SecurityHeadersConfig.StrictTransportSecurity.IncludeSubdomains = false),
    'HSTS com max-age em texto': (p) => (p.SecurityHeadersConfig.StrictTransportSecurity.AccessControlMaxAgeSec = '31536000'),
    'FrameOptions SAMEORIGIN': (p) => (p.SecurityHeadersConfig.FrameOptions.FrameOption = 'SAMEORIGIN'),
    'ContentTypeOptions ausente': (p) => delete p.SecurityHeadersConfig.ContentTypeOptions,
    'cabeçalho personalizado a mais': (p) => (p.CustomHeadersConfig = { Quantity: 3, Items: [...p.CustomHeadersConfig.Items, { Header: 'X-Extra', Value: '1', Override: true }] }),
    'valor de cabeçalho personalizado': (p) => (p.CustomHeadersConfig.Items[0].Value = 'camera=*'),
    'RemoveHeadersConfig vazio': (p) => (p.RemoveHeadersConfig = { Quantity: 0, Items: [] }),
    'RemoveHeadersConfig ausente': (p) => delete p.RemoveHeadersConfig,
    'RemoveHeadersConfig com outro cabeçalho': (p) => (p.RemoveHeadersConfig.Items[1] = { Header: 'server' }),
    'RemoveHeadersConfig com propriedade inesperada': (p) => (p.RemoveHeadersConfig.Items[0].Extra = 'x'),
    'seção CorsConfig fora do arquivo versionado': (p) => (p.CorsConfig = { AccessControlAllowOrigins: { Quantity: 1, Items: ['*'] } }),
    'seção ServerTimingHeadersConfig fora do arquivo versionado': (p) => (p.ServerTimingHeadersConfig = { Enabled: true, SamplingRate: 100 }),
  };
  for (const [name, mutate] of Object.entries(cases)) {
    const live = asReturnedByAws(structuredClone(versionedPolicy));
    mutate(live);
    const r = await run(withLivePolicy(live));
    assert.equal(c08(r).status, 'falha', `${name}: ${JSON.stringify(c08(r))}`);
    assert.match(c08(r).detail, /difere em: /, name);
  }
});

test('C08: diferença apontada pelo caminho da propriedade', () => {
  const live = asReturnedByAws(structuredClone(versionedPolicy));
  live.SecurityHeadersConfig.XSSProtection = { Override: true, Protection: true };
  live.RemoveHeadersConfig = { Quantity: 0, Items: [] };
  assert.deepEqual(structuralDiff(normalizeHeadersPolicy(live), normalizeHeadersPolicy(versionedPolicy)), ['RemoveHeadersConfig.Items', 'RemoveHeadersConfig.Quantity', 'SecurityHeadersConfig.XSSProtection']);
  // o arquivo versionado não é alterado pela normalização
  assert.equal(versionedPolicy.SecurityHeadersConfig.XSSProtection, undefined);
  assert.equal(versionedPolicy.CustomHeadersConfig.Items[0].Header, 'Permissions-Policy');
});
