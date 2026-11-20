/**
 * Simulador de investimento (NEKKORA-COM-ECOSYSTEM-001 §4): quatro entradas que começam em zero, nenhum produto
 * obrigatório, fórmulas por produto, cobranças separadas (inicial, mensal e por hora), combinado que não é mensalidade e
 * proteção contra valores inválidos. Importa src/precos.ts — o mesmo código que a página usa. As jornadas no navegador
 * ficam em scripts/homologacao-simulador.mjs.
 */
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EMPTY_SIM, PRICE_TABLE, SIM_FIELDS, SIM_LIMITS, sanitizeQuantity, sanitizeSim, simulate } from '../../src/precos.ts';

test('1. tudo em zero: nada selecionado, nenhum valor', () => {
  assert.deepEqual(EMPTY_SIM, { ai: 0, monitor: 0, windows: 0, linux: 0 });
  assert.deepEqual(SIM_FIELDS, ['ai', 'monitor', 'windows', 'linux']);
  const s = simulate({});
  assert.equal(s.empty, true);
  assert.deepEqual([s.ai, s.monitor, s.hosting, s.combined], [0, 0, 0, 0]);
});

test('2. fórmulas por produto: AI × R$ 100, Monitor × R$ 75, Windows × R$ 25, Linux × R$ 12', () => {
  assert.deepEqual([simulate({ ai: 3 }).ai, simulate({ ai: 3 }).labels.ai], [300, 'R$ 300']);
  assert.deepEqual([simulate({ monitor: 2 }).monitor, simulate({ monitor: 2 }).labels.monitor], [150, 'R$ 150']);
  assert.deepEqual([simulate({ windows: 10 }).windows, simulate({ windows: 10 }).hosting], [250, 250]);
  assert.deepEqual([simulate({ linux: 5 }).linux, simulate({ linux: 5 }).hosting], [60, 60]);
  for (const n of [0, 1, 7, 50]) {
    assert.equal(simulate({ ai: n }).ai, n * PRICE_TABLE.ai.porAutomacao);
    assert.equal(simulate({ monitor: n }).monitor, n * PRICE_TABLE.monitor.porAutomacaoMes);
    assert.equal(simulate({ windows: n }).windows, n * PRICE_TABLE.hosting.windowsPorHora);
    assert.equal(simulate({ linux: n }).linux, n * PRICE_TABLE.hosting.linuxPorHora);
  }
});

test('3. produtos independentes (§3): cada combinação de AI, Monitor e Hosting, inclusive cada um sozinho', () => {
  const base = { ai: 3, monitor: 2, windows: 10, linux: 5 };
  const combos = [['ai'], ['monitor'], ['windows', 'linux'], ['ai', 'monitor'], ['ai', 'windows'], ['monitor', 'linux'], ['ai', 'monitor', 'windows', 'linux']];
  for (const campos of combos) {
    const input = Object.fromEntries(campos.map((c) => [c, base[c]]));
    const s = simulate(input);
    assert.equal(s.empty, false, campos.join('+'));
    for (const f of SIM_FIELDS) assert.equal(s.quantities[f], input[f] ?? 0, `${campos.join('+')}: ${f}`);
    assert.equal(s.combined, s.ai + s.monitor + s.hosting, `${campos.join('+')}: combinado`);
  }
});

test('4. exemplo completo: 3 AI + 2 Monitor + 10 h Windows + 5 h Linux = R$ 300 + R$ 150/mês + R$ 310 = R$ 760 (primeiro mês do Monitor)', () => {
  const s = simulate({ ai: 3, monitor: 2, windows: 10, linux: 5 });
  assert.deepEqual(s.labels, { ai: 'R$ 300', monitor: 'R$ 150', windows: 'R$ 250', linux: 'R$ 60', hosting: 'R$ 310', combined: 'R$ 760' });
});

test('5. cobranças separadas e combinado que não é mensalidade (textos do simulador)', () => {
  const content = readFileSync('src/content.ts', 'utf8');
  const block = content.slice(content.indexOf('export const SIMULATOR'), content.indexOf('/* Como funciona'));
  assert.match(block, /ai: 'Investimento inicial estimado no AI Piloto'/);
  assert.match(block, /aiValue: \(v: string\) => `a partir de \$\{v\}`/);
  assert.match(block, /monitor: 'Valor mensal estimado do Monitor'/);
  assert.match(block, /monitorValue: \(v: string\) => `\$\{v\} por mês`/);
  assert.match(block, /hosting: 'Hosting para as horas selecionadas'/);
  assert.match(block, /combined: 'Investimento combinado estimado'/);
  assert.match(block, /primeiro mês do Monitor .*Não é uma mensalidade\./);
  assert.match(block, /Não é proposta nem contratação/);
  assert.doesNotMatch(block, /mensalidade de|total mensal|por mês: R\$/i);
  assert.doesNotMatch(block, /R\$\s?\d|\d+(?:[.,]\d+)?\s?%/, 'nenhum valor nem percentual digitado nos textos do simulador');
  assert.doesNotMatch(block, /\bROI\b|horas economizadas|economize|retorno sobre|desconto/i);
});

test('6. valores inválidos, negativos, fracionários, não finitos e excessivos', () => {
  for (const v of [-1, -0.5, 1.5, NaN, Infinity, -Infinity, '1e3', '2.5', '-3', '3a', '', ' ', null, undefined, {}, [], true]) {
    assert.equal(sanitizeQuantity(v, 50), 0, `inválido: ${String(v)}`);
  }
  assert.equal(sanitizeQuantity('7', 50), 7);
  assert.equal(sanitizeQuantity(' 12 ', 50), 12);
  assert.equal(sanitizeQuantity(1e9, 50), 50);
  assert.equal(sanitizeQuantity('999999', 744), 744);
  assert.deepEqual(SIM_LIMITS, { ai: 50, monitor: 50, windows: 744, linux: 744 });
  const max = simulate({ ai: 1e9, monitor: 1e9, windows: 1e9, linux: 1e9 });
  assert.deepEqual(max.quantities, SIM_LIMITS);
  assert.ok(Number.isSafeInteger(max.combined), 'sem transbordamento');
  assert.equal(max.combined, 50 * 100 + 50 * 75 + 744 * 25 + 744 * 12);
  // entradas desconhecidas (como as categorias do Delivery) são ignoradas
  assert.deepEqual(sanitizeSim({ simples: 3, media: 2, complexa: 1 }), EMPTY_SIM);
  assert.equal(simulate({ simples: 3 }).empty, true);
});

test('7. sem armazenamento e sem envio: o simulador não usa storage, cookies nem rede', () => {
  const FORBIDDEN = /localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|navigator\.clipboard|window\.open/;
  for (const file of ['src/sections/Simulator.tsx', 'src/precos.ts']) assert.doesNotMatch(readFileSync(file, 'utf8'), FORBIDDEN, file);
});

test('8. calculadora e cartões usam a mesma fonte: nenhum preço digitado no componente', () => {
  const ui = readFileSync('src/sections/Simulator.tsx', 'utf8');
  assert.doesNotMatch(ui, /R\$\s?\d|\d+(?:[.,]\d+)?\s?%/);
  assert.match(ui, /from '\.\.\/precos'/);
  // começa em zero e a estimativa acompanha as quantidades (sem valor desatualizado)
  assert.match(ui, /const ZERO: Record<SimField, string> = \{ ai: '0', monitor: '0', windows: '0', linux: '0' \};/);
  assert.match(ui, /useState<Record<SimField, string>>\(ZERO\)/);
});

test('9. controles de publicação preservados: aprovações, aviso de homologação e campanha histórica intocados', () => {
  const pub = JSON.parse(readFileSync('publicacao.json', 'utf8'));
  assert.deepEqual(pub.aprovacoes, {
    precos: true,
    condicoesComerciais: true, // titular, 11/11/2026 (PUB-19, commit e4bc72c)
    textosComerciais: true, // titular, 11/11/2026 (PUB-17, commit e4bc72c)
    avisoDePrivacidade: true, // titular, 11/11/2026 (PUB-09, commit e4bc72c)
    agendamento: true, // titular, 05/11/2026 (PUB-20; histórico, sem Bookings na página)
    envioAutomatico: false,
    publicacao: true, // titular, 11/11/2026 (PUB-18, commit 2fdaed6)
  });
  assert.equal(pub.avisoHomologacao, false); // titular, 11/11/2026 (PUB-10)
  assert.deepEqual(pub.campanhaLancamento, { inicio: '2026-11-06', fim: '2027-01-06' });
  assert.equal(pub.controlador.nome, 'NICOLLY OLIVEIRA DE CARVALHO DESENVOLVIMENTO DE SOFTWARE LTDA');
  assert.equal(pub.envioAutomatico.endpoint, null, 'backend não ativado');
  // PUB-22: endereço comercial informado pela titular em 05/11/2026, com base no cartão CNPJ
  assert.equal(pub.fornecedor.endereco, 'Rua Pais Leme, 215, Conjunto 1713, Pinheiros, São Paulo/SP, CEP 05424-150');
});
