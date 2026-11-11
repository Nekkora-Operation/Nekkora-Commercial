#!/usr/bin/env node
/**
 * Impressão digital da tabela de preços (COM-VITRINE-001 §9.3, PUB-14).
 *
 * A aprovação de preços passa a valer para UMA tabela: a titular aprova a impressão digital (SHA-256) da tabela em
 * src/precos.ts, gravada em publicacao.json → tabelaDePrecos.impressao. O portão (scripts/verificar-publicacao.mjs)
 * recalcula a impressão a partir do código e bloqueia o deploy se ela divergir da aprovada — mesmo com
 * aprovacoes.precos === true. Assim, nenhum preço novo usa uma aprovação anterior.
 *
 * Entram na impressão todos os valores que a página pode exibir: Delivery (individual e pacote), tamanho do pacote e
 * preços previstos de Monitor e AI. A tabela anterior (PREVIOUS_PRICE_TABLE) não entra: ela não é exibida e só rege
 * compromissos já assumidos.
 *
 *   node scripts/comercial/impressao-precos.mjs      # imprime a tabela canônica e a impressão, para o registro da titular
 */
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { PACKAGE_SIZE, PLANNED_RECURRING_PRICES, PRICE_TABLE } from '../../src/precos.ts';

/** JSON com chaves em ordem alfabética em todos os níveis: a mesma tabela sempre gera o mesmo texto. */
const canonical = (v) =>
  Array.isArray(v) ? `[${v.map(canonical).join(',')}]` : v && typeof v === 'object' ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`).join(',')}}` : JSON.stringify(v);

export const tabelaCanonica = (tabela = { delivery: PRICE_TABLE, tamanhoDoPacote: PACKAGE_SIZE, recorrentesPrevistos: PLANNED_RECURRING_PRICES }) => canonical(tabela);

export const impressaoDaTabela = (tabela) => `sha256:${createHash('sha256').update(tabelaCanonica(tabela)).digest('hex')}`;

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  console.log(tabelaCanonica());
  console.log(impressaoDaTabela());
}
