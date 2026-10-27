/**
 * scripts/verificar-environment.mjs: proteções do environment "production" conferidas antes de deploy e rollback.
 * A API do GitHub é simulada; nada sai da máquina.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { avaliarEnvironment, verificarEnvironment } from '../verificar-environment.mjs';

const revisor = { type: 'required_reviewers', prevent_self_review: false, reviewers: [{ type: 'User', reviewer: { login: 'Nekkolly' } }] };
const env = (extra = {}) => ({
  name: 'production',
  protection_rules: [{ type: 'branch_policy' }, revisor],
  deployment_branch_policy: { protected_branches: false, custom_branch_policies: true },
  ...extra,
});
const soMain = { total_count: 1, branch_policies: [{ name: 'main', type: 'branch' }] };

/** fetch simulado: rotas → [status, corpo]; registra as URLs e o token recebido. */
function fakeFetch(rotas) {
  const chamadas = [];
  const impl = async (url, { headers }) => {
    chamadas.push({ url, auth: headers.Authorization });
    const caminho = new URL(url).pathname;
    const [status, corpo] = rotas[caminho] ?? [404, { message: 'Not Found' }];
    return { ok: status >= 200 && status < 300, status, json: async () => corpo };
  };
  return { impl, chamadas };
}
const BASE = '/repos/Nekkora-Operation/Nekkora-Commercial/environments/production';

test('configuração real (revisor Nekkolly, só main): liberado', () => {
  const r = avaliarEnvironment(env(), soMain);
  assert.deepEqual(r.problemas, []);
  assert.deepEqual(r.revisores, ['Nekkolly']);
  assert.deepEqual(r.branches, ['branch:main']);
  assert.equal(r.autoRevisao, true);
});

test('bloqueia sem revisor, sem restrição de branches, por protected branches e com política além de main', () => {
  assert.match(avaliarEnvironment(env({ protection_rules: [{ type: 'branch_policy' }] }), soMain).problemas.join(), /sem revisor/);
  assert.match(avaliarEnvironment(env({ protection_rules: [{ ...revisor, reviewers: [] }] }), soMain).problemas.join(), /sem revisor/);
  assert.match(avaliarEnvironment(env({ deployment_branch_policy: null }), null).problemas.join(), /sem restrição de branches/);
  assert.match(avaliarEnvironment(env({ deployment_branch_policy: { protected_branches: true, custom_branch_policies: false } }), null).problemas.join(), /protected branches/);
  assert.match(avaliarEnvironment(env(), { branch_policies: [] }).problemas.join(), /vazia/);
  for (const extra of [{ name: '*', type: 'branch' }, { name: 'release/*', type: 'branch' }, { name: 'v*', type: 'tag' }]) {
    assert.match(avaliarEnvironment(env(), { branch_policies: [soMain.branch_policies[0], extra] }).problemas.join(), /além de main/, extra.name);
  }
  assert.match(avaliarEnvironment(env(), { branch_policies: [{ name: 'main', type: 'tag' }] }).problemas.join(), /além de main/);
});

test('consulta environment e políticas com o token e libera a configuração real', async () => {
  const { impl, chamadas } = fakeFetch({ [BASE]: [200, env()], [`${BASE}/deployment-branch-policies`]: [200, soMain] });
  const r = await verificarEnvironment({ repo: 'Nekkora-Operation/Nekkora-Commercial', token: 't0k3n', fetchImpl: impl });
  assert.deepEqual(r.problemas, []);
  assert.equal(chamadas.length, 2);
  assert.ok(chamadas.every((c) => c.auth === 'Bearer t0k3n'));
});

test('fecha em caso de dúvida: environment ausente, token sem acesso ou políticas inacessíveis', async () => {
  const repo = 'Nekkora-Operation/Nekkora-Commercial';
  for (const [rotas, re] of [
    [{}, /inacessível ou inexistente.*404/],
    [{ [BASE]: [403, { message: 'Resource not accessible by integration' }] }, /inacessível.*403/],
    [{ [BASE]: [200, env()], [`${BASE}/deployment-branch-policies`]: [403, {}] }, /políticas de branches inacessíveis/],
  ]) {
    const r = await verificarEnvironment({ repo, token: 'x', fetchImpl: fakeFetch(rotas).impl });
    assert.match(r.problemas.join(), re);
  }
  const rede = async () => {
    throw new Error('rede indisponível');
  };
  assert.match((await verificarEnvironment({ repo, token: 'x', fetchImpl: rede })).problemas.join(), /rede indisponível/);
});
