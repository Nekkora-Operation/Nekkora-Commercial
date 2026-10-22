/**
 * Auditoria somente leitura (scripts/aws/auditar.mjs) com respostas SIMULADAS da AWS — usa as classes de comando do
 * próprio SDK, então os nomes de operação e parâmetros são os reais. Cobre a configuração correta, o estado "em
 * andamento" (certificado aguardando DNS) e os erros mais comuns de configuração manual.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as S3 from '@aws-sdk/client-s3';
import * as CF from '@aws-sdk/client-cloudfront';
import * as ACM from '@aws-sdk/client-acm';
import * as STS from '@aws-sdk/client-sts';
import { audit, CACHING_OPTIMIZED, report } from '../aws/auditar.mjs';

const versionedPolicy = JSON.parse(readFileSync(resolve('deploy/aws/politica-cabecalhos.json'), 'utf8'));
const versionedFunction = readFileSync(resolve('deploy/aws/funcao-viewer-request.js'), 'utf8');
// Identificadores FICTÍCIOS
const ACCOUNT = '111122223333';
const BUCKET = 'nekkora-commercial-teste';
const DIST = 'E2EXEMPLO12345';
const DIST_ARN = `arn:aws:cloudfront::${ACCOUNT}:distribution/${DIST}`;
const CERT = `arn:aws:acm:us-east-1:${ACCOUNT}:certificate/00000000-0000-0000-0000-000000000000`;

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
    cert: { CertificateArn: CERT, Status: 'ISSUED', SubjectAlternativeNames: ['nekkora.com', 'www.nekkora.com'], InUseBy: [DIST_ARN], DomainValidationOptions: [] },
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
    ListCertificatesCommand: () => ({ CertificateSummaryList: [{ CertificateArn: CERT, DomainName: 'nekkora.com' }] }),
    DescribeCertificateCommand: () => ({ Certificate: a.cert }),
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
  return audit({ clients, sdk: { S3, CF, ACM, STS }, bucket: BUCKET, distributionId: DIST, versionedPolicy, versionedFunction, ...extra }).then((r) => ({ ...r, calls }));
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
  a.cert = { ...a.cert, Status: 'PENDING_VALIDATION', InUseBy: [], DomainValidationOptions: [{ DomainName: 'nekkora.com', ValidationMethod: 'DNS', ValidationStatus: 'PENDING_VALIDATION', ResourceRecord: { Name: '_abc.nekkora.com.', Type: 'CNAME', Value: '_xyz.acm-validations.aws.' } }] };
  a.distribution.DistributionConfig.ViewerCertificate = { CloudFrontDefaultCertificate: true };
  a.distribution.DistributionConfig.Aliases = { Quantity: 0, Items: [] };
  const r = await run(a);
  assert.equal(statusOf(r, 'K01'), 'pendente');
  assert.match(r.checks.find((c) => c.id === 'K01').fix, /_abc\.nekkora\.com\. CNAME _xyz\.acm-validations\.aws\./);
  assert.equal(statusOf(r, 'D01'), 'pendente');
  assert.equal(statusOf(r, 'D02'), 'pendente');
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
