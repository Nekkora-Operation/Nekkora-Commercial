#!/usr/bin/env node
/**
 * PUB-18 no deploy (COM-VITRINE-001, titular, 12/11/2026): a autorização de publicação vale para UM commit homologado.
 * O registro da titular não pode citar o SHA do commit que o contém (dependência circular); por isso cita o commit
 * HOMOLOGADO (H, com a configuração definitiva, inclusive a PUB-13), e o commit selecionado para o deploy (C — o de
 * autorização ou o merge dele na main) precisa:
 *   1. ter em publicacao.json a autorização: publicacaoAutorizada.commit = H (SHA completo) e
 *      publicacaoAutorizada.versao = version do package.json de C;
 *   2. H existir no repositório e ser ancestral de C;
 *   3. ter a MESMA árvore de H em todos os arquivos, exceto publicacao.json (comparação de árvores, não de commits:
 *      commits intermediários e conteúdo trazido por merge aparecem na diferença);
 *   4. em publicacao.json, diferir de H só na própria autorização (publicacaoAutorizada e
 *      $origem["publicacaoAutorizada"]).
 * O portão (scripts/verificar-publicacao.mjs, no job de deploy) confere a data e o texto do registro, a versão do
 * package.json e a do artefato; o workflow confere que o artefato é o de C.
 *
 *   node scripts/verificar-autorizacao-release.mjs --commit <SHA a publicar>
 *
 * Só lê o histórico do git (precisa de checkout com fetch-depth: 0).
 */
import { execFileSync } from 'node:child_process';
import { isDeepStrictEqual } from 'node:util';
import { pathToFileURL } from 'node:url';

const CHAVE = 'publicacaoAutorizada';
const SHA = /^[0-9a-f]{40}$/;

/** publicacao.json sem a autorização (o que precisa ser idêntico entre H e C). */
function semAutorizacao(pub) {
  const { [CHAVE]: _a, $origem = {}, ...resto } = pub ?? {};
  const { [CHAVE]: _r, ...origem } = $origem;
  return { ...resto, $origem: origem };
}

/**
 * Analisa os dados já lidos do git. Retorna a lista de problemas (vazia = autorização confere).
 * @param {{ commit: string, publicacaoEmC: object|null, versaoEmC: string|null, existeH: boolean, descende: boolean,
 *   arquivos: string[], publicacaoEmH: object|null }} dados
 */
export function analisar({ commit, publicacaoEmC, versaoEmC, existeH, descende, arquivos, publicacaoEmH }) {
  const autorizacao = publicacaoEmC?.[CHAVE];
  const h = autorizacao?.commit;
  if (!SHA.test(h ?? '')) return [`publicacao.json de ${commit} sem ${CHAVE}.commit (SHA completo do commit homologado)`];
  const problemas = [];
  if (h === commit) problemas.push('o commit homologado não pode ser o próprio commit publicado (a autorização vem depois da homologação)');
  if (!versaoEmC || autorizacao.versao !== versaoEmC) problemas.push(`versão autorizada ${autorizacao.versao ?? '(ausente)'} diferente da do package.json de ${commit} (${versaoEmC ?? 'ausente'})`);
  if (!existeH) return [...problemas, `commit homologado ${h} não existe no repositório`];
  if (!descende) problemas.push(`${commit} não descende do commit homologado ${h}`);
  const outros = (arquivos ?? []).filter((a) => a !== 'publicacao.json');
  if (outros.length) problemas.push(`conteúdo diferente do homologado fora de publicacao.json: ${outros.join(', ')}`);
  if (publicacaoEmH == null) problemas.push(`publicacao.json ausente no commit homologado ${h}`);
  else if (!isDeepStrictEqual(semAutorizacao(publicacaoEmH), semAutorizacao(publicacaoEmC)))
    problemas.push('publicacao.json diferente do homologado além da própria autorização (publicacaoAutorizada)');
  return problemas;
}

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const ok = (...args) => {
  try {
    git(...args);
    return true;
  } catch {
    return false;
  }
};
const lerJson = (rev, arquivo) => {
  try {
    return JSON.parse(git('show', `${rev}:${arquivo}`));
  } catch {
    return null;
  }
};

/** Lê do git tudo o que analisar() precisa. */
export function coletar(commit) {
  const publicacaoEmC = lerJson(commit, 'publicacao.json');
  const versaoEmC = lerJson(commit, 'package.json')?.version ?? null;
  const h = publicacaoEmC?.[CHAVE]?.commit;
  const dados = { commit, publicacaoEmC, versaoEmC, existeH: false, descende: false, arquivos: [], publicacaoEmH: null };
  if (!SHA.test(h ?? '')) return dados;
  dados.existeH = ok('cat-file', '-e', `${h}^{commit}`);
  if (!dados.existeH) return dados;
  dados.descende = ok('merge-base', '--is-ancestor', h, commit);
  // árvores completas de H e C (inclui o que entrou por commits intermediários ou por merge)
  dados.arquivos = git('diff', '--no-renames', '--name-only', h, commit).split('\n').filter(Boolean);
  dados.publicacaoEmH = lerJson(h, 'publicacao.json');
  return dados;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const i = process.argv.indexOf('--commit');
  const informado = i >= 0 ? process.argv[i + 1] : null;
  let commit = null;
  try {
    commit = informado && git('rev-parse', '--verify', `${informado}^{commit}`).trim();
  } catch {}
  if (!SHA.test(commit ?? '')) {
    console.error(`commit não encontrado: ${informado ?? '(informe --commit <SHA>)'}`);
    process.exit(2);
  }
  const dados = coletar(commit);
  const problemas = analisar(dados);
  if (problemas.length) {
    console.log(`AUTORIZAÇÃO DE PUBLICAÇÃO NÃO CONFERE (PUB-18) — ${problemas.length} problema(s):`);
    for (const p of problemas) console.log(`  - ${p}`);
    process.exit(1);
  }
  const { commit: h, versao } = dados.publicacaoEmC[CHAVE];
  console.log(`PUB-18 confere: ${commit} (versão ${versao}) descende do commit homologado ${h} e só difere dele pela autorização.`);
}
