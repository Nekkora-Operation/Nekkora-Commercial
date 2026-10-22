#!/usr/bin/env node
/**
 * Rollback de produção no Cloudflare Pages (COM-RELEASE-003 §6.5) — chamado pelo workflow "Rollback de produção".
 *
 * Volta o domínio para um deploy de produção JÁ EXISTENTE (sem rebuild): com DESTINO vazio, o deploy de produção
 * bem-sucedido imediatamente anterior ao atual (canonical_deployment do projeto). Depois confere, no domínio público,
 * que o release.json servido é o do commit de destino.
 *
 * Ambiente: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, PROJECT, DESTINO (opcional), MOTIVO,
 *           CF_API (padrão https://api.cloudflare.com/client/v4), DOMINIO (padrão https://nekkora.com),
 *           ESPERA_MS (padrão 10000) e TENTATIVAS (padrão 30) para a verificação pública.
 * Testado contra uma API simulada em scripts/testes/rollback-pages.test.mjs.
 */
const env = process.env;
const API = env.CF_API ?? 'https://api.cloudflare.com/client/v4';
const DOMINIO = env.DOMINIO ?? 'https://nekkora.com';
for (const k of ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID', 'PROJECT', 'MOTIVO']) {
  if (!env[k]) {
    console.error(`variável ausente: ${k}`);
    process.exit(2);
  }
}
const base = `${API}/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/pages/projects/${env.PROJECT}`;

async function cf(path, init = {}) {
  const res = await fetch(`${base}${path}`, { ...init, headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) throw new Error(`Cloudflare ${init.method ?? 'GET'} ${path}: HTTP ${res.status} ${JSON.stringify(body.errors ?? body).slice(0, 300)}`);
  return body.result;
}

const project = await cf('');
const current = project.canonical_deployment;
if (!current) throw new Error('o projeto não tem deploy de produção atual');
const deployments = (await cf('/deployments?env=production')).filter((d) => d.environment === 'production' && d.latest_stage?.status === 'success');

let target;
if (env.DESTINO) {
  target = deployments.find((d) => d.id === env.DESTINO);
  if (!target) throw new Error(`deploy ${env.DESTINO} não encontrado entre os deploys de produção bem-sucedidos`);
} else {
  target = deployments
    .filter((d) => d.id !== current.id && Date.parse(d.created_on) < Date.parse(current.created_on))
    .sort((a, b) => Date.parse(b.created_on) - Date.parse(a.created_on))[0];
  if (!target) throw new Error('não há deploy de produção anterior ao atual');
}
if (target.id === current.id) throw new Error('o destino já é o deploy atual');

const commit = (d) => d.deployment_trigger?.metadata?.commit_hash ?? null;
console.log(`atual:   ${current.id} (commit ${commit(current)}, ${current.created_on})`);
console.log(`destino: ${target.id} (commit ${commit(target)}, ${target.created_on})`);
console.log(`motivo:  ${env.MOTIVO}`);
await cf(`/deployments/${target.id}/rollback`, { method: 'POST' });
console.log('rollback solicitado ao Cloudflare Pages');

// Verificação pública: o domínio passa a servir o release.json do commit de destino.
const wanted = commit(target);
// process.exitCode em vez de process.exit(): no Windows, sair com conexões do fetch ainda fechando aborta o Node.
let verified = false;
const tries = Number(env.TENTATIVAS ?? 30);
const wait = Number(env.ESPERA_MS ?? 10000);
for (let i = 0; i < tries; i++) {
  const served = await fetch(`${DOMINIO}/release.json`, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
  if (wanted && served?.commit?.startsWith(wanted.slice(0, 7))) {
    console.log(`verificado: ${DOMINIO} serve o commit ${served.commit}`);
    verified = true;
    break;
  }
  await new Promise((r) => setTimeout(r, wait));
}
if (!verified) {
  console.error(`o domínio não passou a servir o commit ${wanted} — confira o painel do Cloudflare Pages`);
  process.exitCode = 1;
}
