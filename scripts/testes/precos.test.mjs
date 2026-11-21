/**
 * Tabela de preços do ecossistema (NEKKORA-COM-ECOSYSTEM-001 §2): AI Piloto, Monitor e Hosting, sem pacote nem
 * desconto, e ausência das tabelas do Delivery na página. Importa src/precos.ts — o mesmo código que a página usa (Node
 * lê TypeScript sem compilação: type stripping). A conferência visual nos três navegadores fica em scripts/homologacao.mjs.
 *
 * Os valores esperados são digitados de propósito: se a tabela mudar sem nova aprovação, o teste falha.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRICE_TABLE, brl } from '../../src/precos.ts';
import { CAMPANHA_DE_LANCAMENTO, VITRINE_DELIVERY } from '../comercial/tabelas-anteriores.mjs';

const root = resolve('.');
const semComentarios = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
const fontes = readdirSync(join(root, 'src'), { recursive: true })
  .filter((f) => /\.(ts|tsx|css)$/.test(f) && !/\.d\.ts$/.test(f))
  .map((f) => [f, readFileSync(join(root, 'src', f), 'utf8')]);

test('tabela da titular (20/11/2026): AI a partir de R$ 100 por automação; Monitor R$ 75 por automação/mês; Hosting Windows R$ 25 e Linux R$ 12 por hora-máquina', () => {
  assert.deepEqual(PRICE_TABLE, { ai: { porAutomacao: 100 }, monitor: { porAutomacaoMes: 75 }, hosting: { windowsPorHora: 25, linuxPorHora: 12 } });
  assert.deepEqual([brl(100), brl(75), brl(25), brl(12), brl(1500), brl(1234567)], ['R$ 100', 'R$ 75', 'R$ 25', 'R$ 12', 'R$ 1.500', 'R$ 1.234.567']);
});

test('sem pacote nem desconto (§3): nenhuma estrutura de pacote, economia ou percentual na tabela nem no código da página', () => {
  assert.doesNotMatch(JSON.stringify(PRICE_TABLE), /pacote|package|desconto|discount|economia|savings/i);
  for (const [f, t] of fontes) {
    const codigo = semComentarios(t);
    assert.doesNotMatch(codigo, /priceFacts|composePackages|PACKAGE_SIZE|savings|Economia de|pacote de 3/i, f);
    // sinal de menos tipográfico (U+2212), o dos selos de desconto; o hífen aparece em CSS/JS (rootMargin '-35%')
    assert.doesNotMatch(codigo, /−\s?\d+(?:[.,]\d+)?\s?%|\d+\s?% de desconto|desconto de \d/i, `${f}: nenhum percentual de desconto`);
  }
});

test('o Delivery saiu da página: nenhuma tabela, categoria, campanha ou nome do Delivery em src/', () => {
  for (const [f, t] of fontes) {
    const codigo = semComentarios(t);
    assert.doesNotMatch(codigo, /tabelas-anteriores|PREVIOUS_PRICE_TABLE|VITRINE_DELIVERY|CAMPANHA_DE_LANCAMENTO/, `${f}: tabelas históricas fora da página`);
    assert.doesNotMatch(codigo, /Nekkora Delivery|Automação simples|Automação média|automações simples|automações médias|Campanha de lançamento|isLaunchActive|LAUNCH_PERIOD/, f);
  }
  // os valores do Delivery não aparecem digitados nem montados em src/ (a página só usa a tabela nova)
  for (const tabela of [VITRINE_DELIVERY, CAMPANHA_DE_LANCAMENTO]) {
    for (const v of Object.values(tabela).flatMap((x) => Object.values(x))) {
      for (const [f, t] of fontes) assert.ok(!semComentarios(t).includes(brl(v)), `${f}: ${brl(v)} do Delivery`);
    }
  }
});

test('nenhum preço digitado no código da página: valores só de src/precos.ts', () => {
  for (const [f, t] of fontes) {
    if (f === 'precos.ts') continue;
    assert.doesNotMatch(semComentarios(t), /R\$\s?\d/, `${f}: valor digitado`);
  }
});

test('AI em piloto (§2.1): "a partir de", sem mensalidade obrigatória, sem promessa de conclusão instantânea nem compatibilidade universal', () => {
  const content = readFileSync(join(root, 'src/content.ts'), 'utf8');
  assert.match(content, /prefix: 'A partir de', value: brl\(PRICE_TABLE\.ai\.porAutomacao\)/);
  assert.match(content, /'Sem mensalidade obrigatória'/);
  assert.match(content, /'Sem promessa de conclusão instantânea nem de compatibilidade com qualquer processo'/);
  assert.doesNotMatch(semComentarios(content), /instantâne[oa](?! nem)|garantimos|100% compatível|qualquer sistema|imediat/i);
});
