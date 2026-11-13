#!/usr/bin/env node
/**
 * Impressões digitais do conteúdo comercial (COM-VITRINE-001 §12, decisão da titular de 12/11/2026, forma b).
 *
 * As flags aprovacoes.textosComerciais (PUB-17) e aprovacoes.condicoesComerciais (PUB-19) vêm da v1.0.0 e não bastam:
 * a aprovação passa a valer para UM conteúdo, identificado por uma impressão SHA-256 que o portão
 * (scripts/verificar-publicacao.mjs) recalcula a partir dos arquivos e compara com a aprovada em
 * publicacao.json → impressoesDeConteudo.{textosComerciais,condicoesComerciais}, exigindo também o registro expresso da
 * titular em $origem. Como na tabela de preços (PUB-14), só o hash não é aprovação.
 *
 * Para nenhuma mudança escapar por estar em outro arquivo, as impressões cobrem PASTAS INTEIRAS, não trechos escolhidos:
 * todo arquivo de src/ (textos, componentes que decidem o que aparece, estilos que escondem ou mostram, preços), além dos
 * documentos de cada item. Arquivo novo, removido ou renomeado muda a impressão. Comentário ou formatação também mudam:
 * a proteção prefere pedir uma nova aprovação a deixar passar uma mudança.
 *
 * - PUB-17 (textos comerciais): src/**, index.html, public/** e vite.config.ts (o que monta a página).
 * - PUB-19 (condições comerciais): src/** (condições exibidas: regras da campanha, pacotes, notas, simulador) e os
 *   documentos das condições oferecidas — regulamento da campanha e histórico das condições comerciais.
 *
 * Fora das impressões, de propósito:
 * - publicacao.json: guarda as próprias aprovações e os registros ($origem), que não podem entrar no que aprovam; os
 *   valores de configuração exibidos (canais, datas, serviços, endereço) têm verificação própria no portão.
 * - contrato-base, anexos, proposta-modelo e procedimento operacional: são instrumentos de contratação, com aprovação
 *   própria antes da primeira contratação (DP-01 a DP-05, revisão jurídica). Aprovar PUB-19 não os aprova.
 *
 * Texto é comparado com fim de linha normalizado (CRLF = LF) e sem BOM; os demais arquivos, byte a byte.
 *
 *   node scripts/comercial/impressao-conteudo.mjs          # lista os arquivos de cada item e as duas impressões
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = resolve(fileURLToPath(new URL('../..', import.meta.url)));

export const ITENS = {
  textosComerciais: { id: 'PUB-17', fontes: ['src', 'index.html', 'public', 'vite.config.ts'] },
  condicoesComerciais: {
    id: 'PUB-19',
    fontes: ['src', 'docs/comercial/regulamento-campanha-lancamento.md', 'docs/comercial/condicoes-comerciais-minuta.md'],
  },
};

const TEXTO = /\.(ts|tsx|js|mjs|cjs|jsx|json|css|html|md|txt|xml|svg|webmanifest)$/i;
const sha = (b) => createHash('sha256').update(b).digest('hex');

function arquivos(raiz, fonte) {
  const abs = join(raiz, fonte);
  if (!existsSync(abs)) return [{ caminho: fonte, ausente: true }];
  if (!statSync(abs).isDirectory()) return [{ caminho: fonte }];
  return readdirSync(abs, { recursive: true })
    .map((f) => join(fonte, f))
    .filter((f) => statSync(join(raiz, f)).isFile())
    .map((f) => ({ caminho: f }));
}

/** Lista canônica de um item: "sha256  caminho" por arquivo, em ordem, precedida do nome do item. */
export function listaCanonica(item, raiz = RAIZ) {
  const { id, fontes } = ITENS[item];
  const linhas = fontes
    .flatMap((f) => arquivos(raiz, f))
    .map(({ caminho, ausente }) => ({ caminho, ausente, p: relative(raiz, join(raiz, caminho)).split('\\').join('/') }))
    .sort((a, b) => (a.p < b.p ? -1 : a.p > b.p ? 1 : 0))
    .map(({ caminho, ausente, p }) => {
      if (ausente) return `AUSENTE  ${p}`;
      const bruto = readFileSync(join(raiz, caminho));
      const conteudo = TEXTO.test(p) ? bruto.toString('utf8').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n') : bruto;
      return `${sha(conteudo)}  ${p}`;
    });
  return [`nekkora-impressao-conteudo v1 ${id} ${item}`, ...linhas].join('\n') + '\n';
}

export const impressaoDoConteudo = (item, raiz = RAIZ) => `sha256:${sha(listaCanonica(item, raiz))}`;

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  for (const item of Object.keys(ITENS)) {
    console.log(listaCanonica(item));
    console.log(`${ITENS[item].id} ${item}: ${impressaoDoConteudo(item)}\n`);
  }
}
