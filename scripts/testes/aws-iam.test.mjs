/**
 * Modelos IAM de deploy/aws/iam/ (COM-RELEASE-003, D03): confiança OIDC das roles de deploy e de auditoria, permissões
 * mínimas, o preenchimento pelo gerador (scripts/aws/gerar-config.mjs) e a coerência com os workflows que assumem cada
 * role. Só lê arquivos do repositório; nada é enviado à AWS.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderTemplate } from '../aws/gerar-config.mjs';

const IAM = resolve('deploy/aws/iam');
const read = (f) => readFileSync(resolve(IAM, f), 'utf8');
const json = (f) => JSON.parse(read(f));
const workflow = (f) => readFileSync(resolve('.github/workflows', f), 'utf8');

/** Identidade imutável do repositório (owner@id/repo@id), formato do sub confirmado pelo GitHub. */
const REPO = 'repo:Nekkora-Operation@333915842/Nekkora-Commercial@1389833224';
const PROVIDER = 'token.actions.githubusercontent.com';
const ROLES = {
  'confianca-deploy.json': { environment: 'production', roleVar: 'AWS_ROLE_ARN', workflows: ['deploy-producao.yml', 'rollback-producao.yml'] },
  'confianca-auditoria.json': { environment: 'auditoria-aws', roleVar: 'AWS_AUDIT_ROLE_ARN', workflows: ['auditoria-aws.yml'] },
};
// Identificadores FICTÍCIOS
const VALUES = { AWS_ACCOUNT_ID: '111122223333', AWS_S3_BUCKET: 'nekkora-commercial-teste', AWS_CLOUDFRONT_DISTRIBUTION_ID: 'E2EXEMPLO12345', AWS_RESPONSE_HEADERS_POLICY_ID: '00000000-0000-0000-0000-000000000000' };

/** Blocos de job de um workflow (indentação de 2 espaços em jobs:). */
function jobs(text) {
  const body = text.slice(text.indexOf('\njobs:\n') + 7);
  return body.split(/\n(?=  [a-z][a-z0-9-]*:\n)/).map((b) => ({ name: b.match(/^ {2}([a-z][a-z0-9-]*):/)?.[1], text: b }));
}

for (const [file, { environment }] of Object.entries(ROLES)) {
  test(`${file}: só GitHub Actions do environment ${environment}, pela main, com a identidade imutável do repositório`, () => {
    const policy = json(file);
    assert.equal(policy.Version, '2012-10-17');
    assert.equal(policy.Statement.length, 1);
    const [s] = policy.Statement;
    assert.equal(s.Effect, 'Allow');
    assert.deepEqual(s.Principal, { Federated: `arn:aws:iam::\${AWS_ACCOUNT_ID}:oidc-provider/${PROVIDER}` });
    assert.equal(s.Action, 'sts:AssumeRoleWithWebIdentity');
    // Só StringEquals (sem StringLike/curingas) e exatamente as três chaves, cada uma com um único valor
    assert.deepEqual(Object.keys(s.Condition), ['StringEquals']);
    assert.deepEqual(s.Condition.StringEquals, {
      [`${PROVIDER}:aud`]: 'sts.amazonaws.com',
      [`${PROVIDER}:sub`]: `${REPO}:environment:${environment}`,
      [`${PROVIDER}:ref`]: 'refs/heads/main',
    });
    assert.ok(Object.values(s.Condition.StringEquals).every((v) => typeof v === 'string' && !/[*?]/.test(v)));
    // formato antigo do sub (sem os IDs) não é mais aceito
    assert.doesNotMatch(read(file), /repo:Nekkora-Operation\/Nekkora-Commercial:/);
  });
}

test('confiança: cada role aceita só o próprio environment', () => {
  const sub = (f) => json(f).Statement[0].Condition.StringEquals[`${PROVIDER}:sub`];
  assert.notEqual(sub('confianca-deploy.json'), sub('confianca-auditoria.json'));
  assert.ok(sub('confianca-deploy.json').endsWith(':environment:production'));
  assert.ok(sub('confianca-auditoria.json').endsWith(':environment:auditoria-aws'));
});

test('permissões da auditoria: só leitura (Get/List/Describe), sem curinga de ação', () => {
  const actions = json('permissoes-auditoria.json').Statement.flatMap((s) => {
    assert.equal(s.Effect, 'Allow');
    return [s.Action].flat();
  });
  for (const a of actions) {
    assert.match(a, /^[a-z0-9]+:(Get|List|Describe)[A-Za-z]+$/, a);
  }
});

test('permissões do deploy: só o necessário, sem exclusão, IAM, ACM, DNS nem alteração da distribuição', () => {
  const statements = json('permissoes-deploy.json').Statement;
  const actions = statements.flatMap((s) => [s.Action].flat()).sort();
  assert.deepEqual(actions, ['cloudfront:CreateInvalidation', 'cloudfront:GetDistribution', 'cloudfront:GetInvalidation', 'cloudfront:GetResponseHeadersPolicy', 's3:GetObject', 's3:ListBucket', 's3:PutObject']);
  assert.ok(statements.every((s) => s.Effect === 'Allow' && [s.Resource].flat().every((r) => r !== '*')));
});

test('gerador: preenche todos os modelos com os identificadores e não altera a confiança OIDC', () => {
  const files = readdirSync(IAM).filter((f) => f.endsWith('.json'));
  assert.deepEqual(files.sort(), ['confianca-auditoria.json', 'confianca-deploy.json', 'permissoes-auditoria.json', 'permissoes-deploy.json', 'politica-bucket.json']);
  for (const f of files) {
    const out = renderTemplate(read(f), VALUES);
    assert.doesNotMatch(out, /\$\{/, f);
    JSON.parse(out);
  }
  for (const [file, { environment }] of Object.entries(ROLES)) {
    const [s] = JSON.parse(renderTemplate(read(file), VALUES)).Statement;
    assert.equal(s.Principal.Federated, `arn:aws:iam::${VALUES.AWS_ACCOUNT_ID}:oidc-provider/${PROVIDER}`);
    assert.equal(s.Condition.StringEquals[`${PROVIDER}:sub`], `${REPO}:environment:${environment}`);
    assert.equal(s.Condition.StringEquals[`${PROVIDER}:ref`], 'refs/heads/main');
  }
});

test('gerador: recusa identificador fora do formato e marcador sem valor', () => {
  assert.throws(() => renderTemplate(read('confianca-deploy.json'), { ...VALUES, AWS_ACCOUNT_ID: '1234' }), /AWS_ACCOUNT_ID fora do formato/);
  assert.throws(() => renderTemplate(read('confianca-deploy.json'), { AWS_S3_BUCKET: VALUES.AWS_S3_BUCKET }), /AWS_ACCOUNT_ID\} sem valor/);
});

test('workflows: só jobs do environment certo, disparados da main, recebem token OIDC e assumem a role', () => {
  const all = readdirSync(resolve('.github/workflows')).filter((f) => f.endsWith('.yml'));
  for (const f of all) {
    for (const job of jobs(workflow(f))) {
      const oidc = /id-token: write/.test(job.text);
      const role = job.text.match(/role-to-assume: \$\{\{ vars\.(\w+) \}\}/)?.[1];
      if (!oidc && !role) continue;
      const entry = Object.values(ROLES).find((r) => r.workflows.includes(f));
      assert.ok(entry, `${f}/${job.name}: workflow inesperado com OIDC`);
      assert.ok(oidc && role, `${f}/${job.name}: id-token e role-to-assume andam juntos`);
      assert.equal(role, entry.roleVar, `${f}/${job.name}`);
      assert.match(job.text, new RegExp(`environment:\\s*(\\n\\s+name:\\s*)?${entry.environment}\\n`), `${f}/${job.name}: environment ${entry.environment}`);
    }
    // o permissions do topo nunca concede id-token
    assert.doesNotMatch(workflow(f).split('\njobs:\n')[0], /id-token/, f);
  }
  // A condição ref = refs/heads/main exige que os workflows com OIDC só rodem a partir da main
  assert.match(workflow('auditoria-aws.yml'), /if: github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow('rollback-producao.yml'), /if: github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow('deploy-producao.yml'), /test "\$GITHUB_REF" = "refs\/heads\/main"/);
});
