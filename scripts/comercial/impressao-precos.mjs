#!/usr/bin/env node
/**
 * Impressão digital da tabela de preços (COM-VITRINE-001 §9.3, PUB-14).
 *
 * A aprovação de preços passa a valer para UMA tabela: a titular aprova a impressão digital (SHA-256) da tabela em
 * src/precos.ts, gravada em publicacao.json → tabelaDePrecos.impressao. O portão (scripts/verificar-publicacao.mjs)
 * recalcula a impressão a partir do código e bloqueia o deploy se ela divergir da aprovada — mesmo com
 * aprovacoes.precos === true. Assim, nenhum preço novo usa uma aprovação anterior.
 *
 * Entram na impressão todos os valores que a página pode exibir (NEKKORA-COM-ECOSYSTEM-001): Nekkora AI Piloto (por
 * automação), Nekkora Monitor (por automação/mês) e Nekkora Hosting (hora-máquina Windows e Linux), e os limites do
 * simulador. As tabelas anteriores (Delivery e campanha de lançamento, scripts/comercial/tabelas-anteriores.mjs) não
 * entram: não são exibidas e só regem compromissos já assumidos.
 *
 *   node scripts/comercial/impressao-precos.mjs      # imprime a tabela canônica e a impressão, para o registro da titular
 */
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { PRICE_TABLE, SIM_LIMITS } from '../../src/precos.ts';

/** JSON com chaves em ordem alfabética em todos os níveis: a mesma tabela sempre gera o mesmo texto. */
const canonical = (v) =>
  Array.isArray(v) ? `[${v.map(canonical).join(',')}]` : v && typeof v === 'object' ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`).join(',')}}` : JSON.stringify(v);

export const tabelaCanonica = (tabela = { ecossistema: PRICE_TABLE, limitesDoSimulador: SIM_LIMITS }) => canonical(tabela);

export const impressaoDaTabela = (tabela) => `sha256:${createHash('sha256').update(tabelaCanonica(tabela)).digest('hex')}`;

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  console.log(tabelaCanonica());
  console.log(impressaoDaTabela());
}
