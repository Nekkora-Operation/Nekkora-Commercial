/**
 * Catálogo dos quatro serviços (COM-VITRINE-001, etapa 4 — V-06): Delivery com contratação assistida, Monitor e AI em
 * preparação, Hosting sob avaliação e orçamento. Monitor e AI sem contratação, checkout, assinatura, lista de espera ou
 * integração com a Platform; valores previstos só no bloco de preços, calculados de src/precos.ts, com o aviso
 * aprovado. A conferência na página renderizada, nos três navegadores, fica em scripts/homologacao.mjs.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PLANNED_RECURRING_PRICES, brl } from '../../src/precos.ts';

const root = resolve('.');
const semComentarios = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const content = semComentarios(readFileSync(join(root, 'src/content.ts'), 'utf8'));
const solutions = semComentarios(readFileSync(join(root, 'src/sections/Solutions.tsx'), 'utf8'));
const pricing = semComentarios(readFileSync(join(root, 'src/sections/Pricing.tsx'), 'utf8'));
const bloco = (inicio, fim) => content.slice(content.indexOf(inicio), content.indexOf(fim));
const catalogo = bloco('export const SOLUTIONS', 'export const PLANNED_SERVICES');
const previstos = bloco('export const PLANNED_SERVICES', 'export const PRICING');

test('etapa 4. quatro serviços, nesta ordem, com o estado de cada um', () => {
  const nomes = [...catalogo.matchAll(/name: '([^']+)',\s*stage: '([^']+)'/g)].map((m) => [m[1], m[2]]);
  assert.deepEqual(nomes, [
    ['Nekkora Delivery', 'Contratação assistida'],
    ['Nekkora Monitor', 'Em preparação'],
    ['Nekkora AI', 'Em preparação'],
    ['Nekkora Hosting', 'Sob avaliação e orçamento'],
  ]);
  assert.doesNotMatch(content, /Nekkora Development/);
});

test('etapa 4. Monitor e AI: em preparação, sem contratação, checkout, assinatura ou lista de espera', () => {
  for (const id of ['monitor', 'ai']) {
    const card = catalogo.slice(catalogo.indexOf(`id: '${id}'`), catalogo.indexOf('},', catalogo.indexOf(`id: '${id}'`)));
    assert.match(card, /stage: 'Em preparação'/);
    assert.match(card, /'Ainda não disponível para contratação'/);
    assert.match(card, /href: '#servicos-em-preparacao'/, 'o único link leva aos valores previstos, nunca a uma contratação');
  }
  assert.doesNotMatch(catalogo + previstos, /contrat(e|ar) agora|assin(e|ar|atura)|checkout|comprar|teste grátis|lista de espera|cadastr/i);
  // nenhuma alegação proibida para o Monitor (X-05..X-08) nem de resultado para a AI (X-03, X-11)
  assert.doesNotMatch(catalogo, /monitoramento contínuo|24 ?h|24 horas|SLA|alta disponibilidade|precisão|produtividade|economi/i);
  // nenhum valor no catálogo (X-01: preços só no bloco data-pricing)
  assert.doesNotMatch(catalogo, /R\$|brl\(|PLANNED_RECURRING_PRICES/);
  assert.doesNotMatch(solutions, /R\$|PLANNED_SERVICES|data-pricing/);
});

test('etapa 4 (V-06). valores previstos calculados de src/precos.ts, com o aviso, dentro do bloco de preços', () => {
  assert.equal(brl(PLANNED_RECURRING_PRICES.monitor.mensal), 'R$ 75');
  assert.equal(brl(PLANNED_RECURRING_PRICES.ai.mensal), 'R$ 100');
  assert.match(previstos, /price: brl\(PLANNED_RECURRING_PRICES\.monitor\.mensal\), unit: 'por automação\/mês, previsto'/);
  assert.match(previstos, /price: brl\(PLANNED_RECURRING_PRICES\.ai\.mensal\), unit: 'por empresa\/mês, previsto'/);
  assert.match(previstos, /notice: 'Valores e condições definitivos dependem da disponibilização comercial\.'/);
  assert.doesNotMatch(previstos, /R\$ ?\d/, 'nenhum valor digitado');
  // o bloco fica dentro da seção data-pricing e não tem botão, link nem formulário
  const sec = pricing.slice(pricing.indexOf('data-servicos-previstos'), pricing.indexOf('PRICING.hostingNote'));
  assert.ok(pricing.indexOf('data-pricing="delivery"') < pricing.indexOf('data-servicos-previstos'));
  assert.doesNotMatch(sec, /<Link|<a |<button|<form|<input|trigger/);
});

test('etapa 4. sem integração operacional com a Platform, Monitor ou AI no código da página', () => {
  const src = readdirSync(join(root, 'src'), { recursive: true }).filter((f) => /\.(ts|tsx|js)$/.test(f));
  for (const f of src) {
    const t = readFileSync(join(root, 'src', f), 'utf8');
    assert.doesNotMatch(t, /fetch\([^)]*(platform|monitor|\/ai\b)/i, f);
    assert.doesNotMatch(t, /https?:\/\/[^'"\s]*(platform|monitor)\./i, f);
  }
});
