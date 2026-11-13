/**
 * Tabela de preços do Delivery (COM-VITRINE-001 §3): individual e pacote de 3, economia calculada, composição dos
 * pacotes, tabela única em qualquer data (V-01), preços previstos de Monitor e AI (V-06) e ausência de alegações de
 * "50%" na comunicação. Importa src/precos.ts — o mesmo código que a página usa (Node lê TypeScript sem compilação:
 * type stripping). A conferência visual nos três navegadores fica em scripts/homologacao.mjs.
 *
 * Os valores esperados são digitados de propósito: se a tabela mudar sem nova aprovação, o teste falha.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PACKAGE_SIZE, PLANNED_RECURRING_PRICES, PREVIOUS_PRICE_TABLE, PRICE_TABLE, brl, composePackages, priceFacts, todayInBrazil } from '../../src/precos.ts';

test('tabela da COM-VITRINE-001: simples R$ 650 / R$ 1.500 o pacote; média R$ 1.400 / R$ 3.500 o pacote', () => {
  assert.deepEqual(PRICE_TABLE, { simples: { individual: 650, pacote: 1500 }, media: { individual: 1400, pacote: 3500 } });
  assert.equal(PACKAGE_SIZE, 3);
  const s = priceFacts('simples');
  const m = priceFacts('media');
  assert.deepEqual([s.individualLabel, s.packageLabel, m.individualLabel, m.packageLabel], ['R$ 650', 'R$ 1.500', 'R$ 1.400', 'R$ 3.500']);
});

test('economia do pacote calculada contra três individuais da tabela nova: R$ 450 e R$ 700', () => {
  const s = priceFacts('simples');
  const m = priceFacts('media');
  assert.deepEqual([s.threeIndividualLabel, s.savingsLabel], ['R$ 1.950', 'R$ 450']);
  assert.deepEqual([m.threeIndividualLabel, m.savingsLabel], ['R$ 4.200', 'R$ 700']);
  for (const f of [s, m]) {
    assert.equal(f.savings, f.individual * 3 - f.package, 'economia = 3 × individual − pacote');
    assert.ok(f.package < f.threeIndividual, 'o pacote nunca custa mais que três individuais');
  }
  assert.equal(brl(1234567), 'R$ 1.234.567');
});

test('composição (V-03): pacotes de 3 enquanto houver 3, o restante individual; 6 = dois pacotes', () => {
  const expected = { 0: [0, 0], 1: [0, 1], 2: [0, 2], 3: [1, 0], 4: [1, 1], 5: [1, 2], 6: [2, 0], 7: [2, 1], 20: [6, 2] };
  for (const [n, [packages, singles]] of Object.entries(expected)) assert.deepEqual(composePackages(Number(n)), { packages, singles }, `${n} automações`);
});

test('tabela única em qualquer data (V-01): nenhum retorno automático à tabela anterior', () => {
  // o preço não recebe data nem estado da campanha
  assert.equal(priceFacts.length, 1);
  const src = (f) => readFileSync(f, 'utf8');
  for (const f of ['src/sections/Pricing.tsx', 'src/sections/Simulator.tsx', 'src/content.ts', 'src/config.ts']) {
    assert.doesNotMatch(src(f), /PREVIOUS_PRICE_TABLE|\.standard|\.launch|standardLabel|launchLabel/, `${f} não usa a tabela anterior`);
  }
  // a tabela anterior continua existindo só para os compromissos já assumidos (V-02)
  assert.deepEqual(PREVIOUS_PRICE_TABLE, { simples: { standard: 1500, launch: 1000 }, media: { standard: 3500, launch: 2800 } });
  assert.match(src('scripts/comercial/regras-delivery.mjs'), /PREVIOUS_PRICE_TABLE/);
});

test('preços previstos de Monitor e AI (V-06): R$ 75 por automação/mês e R$ 100 por empresa/mês', () => {
  assert.deepEqual(PLANNED_RECURRING_PRICES, { monitor: { mensal: 75, unidade: 'automação' }, ai: { mensal: 100, unidade: 'empresa' } });
});

test('fuso de Brasília', () => {
  // 31/12 às 23h30 em São Paulo ainda é 31/12, embora já seja 01/01 em UTC
  assert.equal(todayInBrazil(new Date('2027-01-01T02:30:00Z')), '2026-12-31');
  assert.equal(todayInBrazil(new Date('2026-11-01T03:00:00Z')), '2026-11-01');
});

// --------------------------------------------------------------------------- comunicação (itens 6 a 8)
const root = resolve('.');
const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
/** O que vai para a página ou é o texto comercial para aprovação (gerado do código). */
const published = [...walk(join(root, 'src')), join(root, 'index.html'), join(root, 'publicacao.json'), join(root, 'docs/com-001/05-texto-comercial.md')];
const FORBIDDEN_50 = [/50\s?%\s*de\s+desconto/i, /desconto\s+(?:universal\s+)?de\s+50/i, /promo[cç][aã]o\s+de\s+50/i, /metade\s+do\s+pre[cç]o/i, /pela\s+metade/i, /[−-]\s?50\s?%/, /todas\s+as\s+automa[cç][oõ]es/i];

test('nenhuma alegação de 50% de desconto nem desconto universal (item 6)', () => {
  const hits = [];
  for (const file of published) {
    const text = readFileSync(file, 'utf8');
    for (const re of FORBIDDEN_50) for (const m of text.matchAll(new RegExp(re.source, `${re.flags.replace('g', '')}g`))) hits.push(`${file.slice(root.length + 1)}: "${m[0]}"`);
  }
  assert.deepEqual(hits, []);
});

test('nenhum preço digitado no código e nenhuma comparação com a tabela anterior no texto comercial', () => {
  const src = walk(join(root, 'src')).map((f) => readFileSync(f, 'utf8')).join('\n');
  assert.doesNotMatch(src, /R\$\s?\d/, 'nenhum preço digitado no código — todos vêm de PRICE_TABLE');
  const text = readFileSync(join(root, 'docs/com-001/05-texto-comercial.md'), 'utf8');
  assert.doesNotMatch(text, /~~R\$/, 'nenhum preço riscado');
  assert.doesNotMatch(text, /R\$ 1\.000|R\$ 2\.800/, 'sem os preços de lançamento anteriores');
  assert.match(text, /\*\*R\$ 650\*\* — por automação \| \*\*R\$ 1\.500\*\* — pacote de 3 automações da mesma categoria · Economia de R\$ 450/);
  assert.match(text, /\*\*R\$ 1\.400\*\* — por automação \| \*\*R\$ 3\.500\*\* — pacote de 3 automações da mesma categoria · Economia de R\$ 700/);
});

test('nenhum percentual de desconto no código nem nos cartões (V-07)', () => {
  const files = walk(join(root, 'src')).filter((f) => /\.(ts|tsx)$/.test(f));
  const hits = files.flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/−\s?\d+(?:[.,]\d+)?\s?%|discount\s*:/g)].map((m) => `${f.slice(root.length + 1)}: "${m[0]}"`));
  assert.deepEqual(hits, []);
  const pricing = readFileSync(join(root, 'src/sections/Pricing.tsx'), 'utf8');
  assert.doesNotMatch(pricing, /data-price="(?:percentual|padrao|lancamento)"|<s[ >]/, 'sem percentual, preço padrão riscado ou preço de lançamento');
  assert.match(pricing, /data-price="individual"/);
  assert.match(pricing, /data-price="pacote"/);
  assert.match(pricing, /data-price="economia"/);
});

test('condição 50/50 preservada e separada do desconto (item 7); sem categoria complexa na vitrine (COM-VITRINE-001, V-04)', () => {
  const content = readFileSync(join(root, 'src/content.ts'), 'utf8');
  // Gatilhos do pagamento decididos na COM-008-B (AUD-16): aprovação/formalização e homologação/aceite formal
  assert.match(content, /'Pagamento de 50% após a aprovação da proposta e a formalização da contratação, e 50% após a homologação e o aceite formal\. No pacote de 3, os percentuais incidem sobre o valor do pacote, e o vencimento do saldo é definido na proposta e no contrato'/);
  // COM-VITRINE-001: o texto público não anuncia as propostas contratuais DP-01 a DP-05 (saldo por aceite, rateio, etc.)
  assert.doesNotMatch(content.match(/'Pagamento de 50%[^']*'/)[0], /um sexto|1\/6|por aceite|valor de referência|centavos/i);
  // a frase do pagamento é única e nunca fala em desconto: 50/50 é condição de pagamento
  const payment = content.match(/'Pagamento de 50%[^']*'/g) ?? [];
  assert.equal(payment.length, 1);
  assert.doesNotMatch(payment[0], /desconto|economia|lançamento/i);
  assert.doesNotMatch(content, /negotiated: \{ label: 'Sob orçamento'/);
  assert.doesNotMatch(content, /desconto de lançamento aplicável/);
  assert.doesNotMatch(content, /A automação complexa tem orçamento individual/);
});
