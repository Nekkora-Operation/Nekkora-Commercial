#!/usr/bin/env node
/**
 * Proteções do environment "production" (COM-RELEASE-003-B): antes de deploy ou rollback, confere pela API do GitHub
 * que o environment exige revisor humano e que só a branch main pode usá-lo. Fecha em caso de dúvida: environment
 * ausente, API inacessível, nenhum revisor, sem restrição de branches ou qualquer política além de exatamente "main"
 * bloqueiam.
 *
 *   GH_TOKEN=… GITHUB_REPOSITORY=dono/repo node scripts/verificar-environment.mjs [--environment production]
 *
 * Usa só leitura: GET /environments/{nome} e GET /environments/{nome}/deployment-branch-policies. Segundo a
 * documentação do GitHub, "Anyone with read access to the repository can use this endpoint", então basta o
 * GITHUB_TOKEN com contents: read (o CI do PR roda esta mesma verificação com essa permissão para comprová-lo).
 */
import { pathToFileURL } from 'node:url';

const API = 'https://api.github.com';

/** Analisa as respostas da API. Retorna { problemas, revisores, branches, autoRevisao }. */
export function avaliarEnvironment(env, politicas) {
  const problemas = [];
  const revisores = (env.protection_rules ?? [])
    .filter((r) => r.type === 'required_reviewers')
    .flatMap((r) => r.reviewers ?? [])
    .map((r) => r.reviewer?.login ?? r.reviewer?.name ?? r.reviewer?.slug)
    .filter(Boolean);
  const autoRevisao = !(env.protection_rules ?? []).some((r) => r.type === 'required_reviewers' && r.prevent_self_review);
  if (!revisores.length) problemas.push('sem revisor obrigatório');

  const dbp = env.deployment_branch_policy;
  let branches = [];
  if (!dbp) {
    problemas.push('sem restrição de branches (use só main)');
  } else if (dbp.protected_branches || !dbp.custom_branch_policies) {
    problemas.push('restrição por "protected branches" em vez de política explícita só para main');
  } else {
    const lista = politicas?.branch_policies ?? [];
    branches = lista.map((p) => `${p.type ?? 'branch'}:${p.name}`);
    if (!lista.length) problemas.push('política de branches vazia');
    else if (!lista.every((p) => (p.type ?? 'branch') === 'branch' && p.name === 'main')) problemas.push(`políticas além de main: ${branches.join(', ')}`);
  }
  return { problemas, revisores, branches, autoRevisao };
}

async function obter(url, token, fetchImpl) {
  const res = await fetchImpl(url, {
    headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`GET ${url.replace(API, '')}: HTTP ${res.status}`);
  return res.json();
}

/** Consulta a API e avalia; erro de acesso vira problema (nunca libera). */
export async function verificarEnvironment({ repo, nome = 'production', token, fetchImpl = fetch }) {
  const base = `${API}/repos/${repo}/environments/${encodeURIComponent(nome)}`;
  let env;
  try {
    env = await obter(base, token, fetchImpl);
  } catch (e) {
    return { problemas: [`environment ${nome} inacessível ou inexistente (${e.message})`], revisores: [], branches: [], autoRevisao: false };
  }
  let politicas = null;
  if (env.deployment_branch_policy?.custom_branch_policies) {
    try {
      politicas = await obter(`${base}/deployment-branch-policies?per_page=100`, token, fetchImpl);
    } catch (e) {
      return { problemas: [`políticas de branches inacessíveis (${e.message})`], revisores: [], branches: [], autoRevisao: false };
    }
  }
  return avaliarEnvironment(env, politicas);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const argv = process.argv.slice(2);
  const i = argv.indexOf('--environment');
  const nome = i >= 0 ? argv[i + 1] : 'production';
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo) {
    console.log('::error::GITHUB_REPOSITORY ausente');
    process.exit(1);
  }
  // exitCode em vez de exit(): sair com conexões HTTP abertas aborta o Node no Windows
  const r = await verificarEnvironment({ repo, nome, token: process.env.GH_TOKEN });
  if (r.problemas.length) {
    console.log(`::error::environment ${nome}: ${r.problemas.join('; ')}`);
    process.exitCode = 1;
  } else {
    console.log(`::notice::environment ${nome} protegido: revisores ${r.revisores.join(', ')}; branches ${r.branches.join(', ')}`);
    if (r.autoRevisao) console.log(`::notice::environment ${nome}: o próprio autor do disparo pode aprovar (prevent_self_review desligado)`);
  }
}
