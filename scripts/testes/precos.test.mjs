/**
 * Tabela oficial de preços (COM-RELEASE-003-R1 §3.7): valores, descontos calculados, vigência pelas datas aprovadas e
 * ausência de alegações de "50%" na comunicação. Importa src/precos.ts — o mesmo código que a página usa (Node lê
 * TypeScript sem compilação: type stripping). A conferência visual nos três navegadores fica em scripts/homologacao.mjs.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRICE_TABLE, brl, discountPercent, launchActive, percentLabel, priceFacts, todayInBrazil } from '../../src/precos.ts';

test('tabela oficial de 22/10/2026 (itens 1 a 4)', () => {
  assert.deepEqual(PRICE_TABLE, { simples: { standard: 1500, launch: 1000 }, media: { standard: 3500, launch: 2800 } });
  const s = priceFacts('simples');
  const m = priceFacts('media');
  assert.equal(s.standardLabel, 'R$ 1.500');
  assert.equal(s.launchLabel, 'R$ 1.000');
  assert.equal(m.standardLabel, 'R$ 3.500');
  assert.equal(m.launchLabel, 'R$ 2.800');
});

test('descontos matematicamente corretos (item 5): R$ 500 = 33,33% e R$ 700 = 20%', () => {
  const s = priceFacts('simples');
  const m = priceFacts('media');
  assert.equal(s.savings, 500);
  assert.equal(s.savingsLabel, 'R$ 500');
  assert.equal(s.percentLabel, '33,33%');
  assert.equal(m.savings, 700);
  assert.equal(m.savingsLabel, 'R$ 700');
  assert.equal(m.percentLabel, '20%');
  // conferência independente: preço de lançamento = padrão × (1 − percentual), dentro do truncamento de 2 casas
  for (const f of [s, m]) {
    assert.ok(Math.abs(f.standard * (1 - f.percent / 100) - f.launch) < f.standard * 0.0001 + 0.5);
    assert.ok(f.percent <= ((f.standard - f.launch) / f.standard) * 100, 'o percentual nunca é arredondado para cima');
  }
  assert.equal(discountPercent(3, 2), 33.33);
  assert.equal(percentLabel(12.5), '12,5%');
  assert.equal(brl(1234567), 'R$ 1.234.567');
});

test('vigência controlada pelas datas aprovadas (item 10)', () => {
  const period = { inicio: '2026-11-01', fim: '2026-12-31' };
  assert.equal(launchActive(period, '2026-10-31'), false, 'antes do início: só o preço padrão');
  assert.equal(launchActive(period, '2026-11-01'), true, 'primeiro dia');
  assert.equal(launchActive(period, '2026-12-31'), true, 'último dia');
  assert.equal(launchActive(period, '2027-01-01'), false, 'depois do fim: só o preço padrão');
  assert.equal(launchActive({ inicio: null, fim: null }, '2026-10-22'), true, 'sem datas: exibido para revisão (o portão bloqueia a publicação)');
  // fuso de Brasília: 31/12 às 23h30 em São Paulo ainda é 31/12, embora já seja 01/01 em UTC
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

test('valores antigos (R$ 500 e R$ 1.400 como preço; R$ 1.000 e R$ 2.800 como preço padrão) não existem mais', () => {
  const src = walk(join(root, 'src')).map((f) => readFileSync(f, 'utf8')).join('\n');
  assert.doesNotMatch(src, /R\$\s?(?:500|1\.400|1\.000|2\.800)\b/, 'nenhum preço digitado no código — todos vêm de PRICE_TABLE');
  const text = readFileSync(join(root, 'docs/com-001/05-texto-comercial.md'), 'utf8');
  assert.doesNotMatch(text, /R\$ 1\.400/);
  assert.match(text, /~~R\$ 1\.500~~ \*\*R\$ 1\.000\*\*/);
  assert.match(text, /~~R\$ 3\.500~~ \*\*R\$ 2\.800\*\*/);
});

test('nenhum percentual de desconto digitado no código (COM-RELEASE-005 §3.4): o selo vem de priceFacts', () => {
  const files = walk(join(root, 'src')).filter((f) => /\.(ts|tsx)$/.test(f));
  const hits = files.flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/−\s?\d+(?:[.,]\d+)?\s?%|\bdiscount\s*:/g)].map((m) => `${f.slice(root.length + 1)}: "${m[0]}"`));
  assert.deepEqual(hits, []);
  const pricing = readFileSync(join(root, 'src/sections/Pricing.tsx'), 'utf8');
  assert.match(pricing, /<span data-price="percentual">−\{t\.price\.percentLabel\}<\/span>/);
  assert.match(pricing, /<s data-price="padrao">\{t\.price\.standardLabel\}<\/s>/);
});

test('condição 50/50 preservada e separada do desconto (item 7); complexa sob orçamento, sem desconto (item 8)', () => {
  const content = readFileSync(join(root, 'src/content.ts'), 'utf8');
  // Gatilhos do pagamento decididos na COM-008-B (AUD-16): aprovação/formalização e homologação/aceite formal
  assert.match(content, /'Pagamento de 50% após a aprovação da proposta e a formalização da contratação, e 50% após a homologação e o aceite formal'/);
  // a frase do pagamento é única e nunca fala em desconto: 50/50 é condição de pagamento
  const payment = content.match(/'Pagamento de 50%[^']*'/g) ?? [];
  assert.equal(payment.length, 1);
  assert.doesNotMatch(payment[0], /desconto|economia|lançamento/i);
  assert.match(content, /negotiated: \{ label: 'Sob orçamento', unit: 'dimensionada na avaliação · orçamento individual' \}/);
  assert.doesNotMatch(content, /desconto de lançamento aplicável/);
  assert.match(content, /A automação complexa tem orçamento individual\./);
});
