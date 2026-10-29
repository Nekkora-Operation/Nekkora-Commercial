/**
 * Simulador de Investimento — Nekkora Delivery (NEKKORA-CALC-001): cálculo, estados da campanha e proteções, sobre o
 * MESMO código da página (src/precos.ts, carregado pelo Node com type stripping). A interface — teclado, celular,
 * armazenamento, rede e formulário — é homologada em navegador real por scripts/homologacao-simulador.mjs.
 *
 * Os números esperados abaixo são digitados de propósito (exemplo obrigatório da missão): se a tabela mudar, o teste
 * falha em vez de aceitar o novo valor.
 */
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EMPTY_QUANTITIES, MAX_QUANTITY, PRICE_TABLE, campaignState, priceFacts, sanitizeQuantity, simulate, todayInBrazil } from '../../src/precos.ts';

const PERIOD = { inicio: '2026-11-01', fim: '2026-12-31' };

test('1. quantidade zero: nada a calcular, nenhum valor', () => {
  for (const launch of [true, false]) {
    const r = simulate(EMPTY_QUANTITIES, launch);
    assert.equal(r.total, 0);
    assert.equal(r.estimate, 0);
    assert.equal(r.savings, 0);
    assert.equal(r.percent, 0);
    assert.equal(r.partial, false);
  }
  assert.deepEqual(EMPTY_QUANTITIES, { simples: 0, media: 0, complexa: 0 }, 'quantidade inicial é zero');
});

test('2. quantidade única: uma simples e uma média, isoladas, iguais aos cartões', () => {
  const s = simulate({ simples: 1 }, true);
  assert.equal(s.estimateLabel, 'R$ 1.000');
  assert.equal(s.standardTotalLabel, 'R$ 1.500');
  assert.equal(s.savingsLabel, 'R$ 500');
  assert.equal(s.percentLabel, '33,33%');
  const m = simulate({ media: 1 }, true);
  assert.equal(m.estimateLabel, 'R$ 2.800');
  assert.equal(m.savingsLabel, 'R$ 700');
  assert.equal(m.percentLabel, '20%');
});

test('3–7. exemplo obrigatório (2 simples + 1 média): R$ 6.500 → R$ 4.800, economia R$ 1.700, 26,15%', () => {
  const r = simulate({ simples: 2, media: 1, complexa: 0 }, true);
  assert.equal(r.total, 3, 'múltiplas automações');
  assert.equal(r.standardTotal, 6500);
  assert.equal(r.standardTotalLabel, 'R$ 6.500', 'valores padrão');
  assert.equal(r.estimate, 4800);
  assert.equal(r.estimateLabel, 'R$ 4.800', 'valores promocionais');
  assert.equal(r.savings, 1700);
  assert.equal(r.savingsLabel, 'R$ 1.700', 'economia calculada');
  assert.equal(r.percent, 26.15);
  assert.equal(r.percentLabel, '26,15%', 'percentual equivalente, truncado');
  // 1.700 / 6.500 = 26,1538…%: truncado, nunca arredondado para cima
  assert.ok(r.percent <= (1700 / 6500) * 100 && (1700 / 6500) * 100 - r.percent < 0.01);
  assert.deepEqual(
    r.lines.map((l) => [l.tier, l.quantity, l.unitLabel, l.totalLabel]),
    [
      ['simples', 2, 'R$ 1.000', 'R$ 2.000'],
      ['media', 1, 'R$ 2.800', 'R$ 2.800'],
    ],
  );
});

test('4. fora da campanha: só o preço padrão, sem economia nem percentual', () => {
  const r = simulate({ simples: 2, media: 1 }, false);
  assert.equal(r.estimateLabel, 'R$ 6.500');
  assert.equal(r.savings, 0);
  assert.equal(r.percent, 0);
  assert.equal(r.launch, false);
  assert.deepEqual(r.lines.map((l) => l.unitLabel), ['R$ 1.500', 'R$ 3.500']);
});

test('7. o percentual equivalente é sempre truncado em duas casas, para qualquer combinação', () => {
  for (let s = 0; s <= MAX_QUANTITY; s++) {
    for (let m = 0; m <= MAX_QUANTITY; m++) {
      if (s + m === 0) continue;
      const r = simulate({ simples: s, media: m }, true);
      const exact = ((r.standardTotal - r.estimate) / r.standardTotal) * 100;
      assert.ok(r.percent <= exact + 1e-9, `${s}+${m}: ${r.percent} > ${exact}`);
      assert.ok(exact - r.percent < 0.01, `${s}+${m}: ${r.percent} vs ${exact}`);
      assert.equal(r.savings, r.standardTotal - r.estimate);
      assert.ok(r.percent < 50, 'nenhuma combinação chega a 50% (não há desconto universal de 50%)');
    }
  }
});

test('8. automações complexas: nenhum valor inventado; com outras, subtotal estimado', () => {
  const only = simulate({ complexa: 3 }, true);
  assert.equal(only.total, 3);
  assert.equal(only.pricedCount, 0);
  assert.equal(only.estimate, 0);
  assert.equal(only.partial, true);
  assert.equal(only.savings, 0);
  const mixed = simulate({ simples: 2, media: 1, complexa: 1 }, true);
  assert.equal(mixed.partial, true, 'o valor é subtotal, não o preço completo');
  assert.equal(mixed.estimate, 4800, 'a complexa não soma nada ao subtotal');
  assert.equal(mixed.standardTotal, 6500);
  assert.equal(mixed.percentLabel, '26,15%', 'percentual sobre o total calculável');
  assert.ok(!mixed.lines.some((l) => l.tier === 'complexa'), 'nenhuma linha com preço para a complexa');
  assert.ok(!('complexa' in PRICE_TABLE), 'a tabela não tem preço de complexa');
});

test('9–12. situação da campanha no fuso de Brasília: vigente, futura, encerrada e datas pendentes', () => {
  assert.equal(campaignState(PERIOD, '2026-11-01'), 'vigente', 'primeiro dia');
  assert.equal(campaignState(PERIOD, '2026-12-31'), 'vigente', 'último dia');
  assert.equal(campaignState(PERIOD, '2026-10-31'), 'futura');
  assert.equal(campaignState(PERIOD, '2027-01-01'), 'encerrada');
  assert.equal(campaignState({ inicio: null, fim: null }, '2026-11-15'), 'pendente');
  assert.equal(campaignState({ inicio: '2026-11-01', fim: null }, '2026-11-15'), 'pendente', 'uma data só não abre a campanha');
  // 31/12 às 23h30 em São Paulo ainda é vigente, embora já seja 01/01 em UTC; 01/11 começa à meia-noite de Brasília
  assert.equal(campaignState(PERIOD, todayInBrazil(new Date('2027-01-01T02:30:00Z'))), 'vigente');
  assert.equal(campaignState(PERIOD, todayInBrazil(new Date('2027-01-01T03:00:00Z'))), 'encerrada');
  assert.equal(campaignState(PERIOD, todayInBrazil(new Date('2026-11-01T02:59:00Z'))), 'futura');
  assert.equal(campaignState(PERIOD, todayInBrazil(new Date('2026-11-01T03:00:00Z'))), 'vigente');
});

test('12. datas pendentes: preço de lançamento só como prévia de homologação; nunca sem o aviso', () => {
  const config = readFileSync('src/config.ts', 'utf8');
  assert.match(config, /state === 'vigente' \|\| \(state === 'pendente' && publicacao\.avisoHomologacao === true\)/);
  const content = readFileSync('src/content.ts', 'utf8');
  assert.match(content, /pendente: 'Prévia para revisão: as datas da campanha ainda não foram definidas\. Nenhuma solicitação é elegível antes do início oficial\.'/);
  assert.match(content, /futura: 'Valores pelo preço padrão\. Os preços de lançamento ainda não estão em vigor\.'/);
  assert.match(content, /encerrada: 'Valores pelo preço padrão\. A campanha de lançamento foi encerrada\.'/);
  const pub = JSON.parse(readFileSync('publicacao.json', 'utf8'));
  assert.deepEqual(pub.campanhaLancamento, { inicio: null, fim: null }, 'as datas não foram preenchidas automaticamente');
});

test('13. proteção contra valores inválidos, negativos, transbordamento e excesso', () => {
  const cases = [
    [0, 0],
    [3, 3],
    ['7', 7],
    [' 4 ', 4],
    [-1, 0],
    ['-1', 0],
    [2.5, 0],
    ['2,5', 0],
    ['1e3', 0],
    ['abc', 0],
    ['', 0],
    [null, 0],
    [undefined, 0],
    [NaN, 0],
    [Infinity, 0],
    [-Infinity, 0],
    [Number.MAX_SAFE_INTEGER, MAX_QUANTITY],
    [1e308, MAX_QUANTITY],
    ['999999', MAX_QUANTITY],
    ['9999999', 0],
    [MAX_QUANTITY + 1, MAX_QUANTITY],
    [{}, 0],
    [[], 0],
    [true, 0],
  ];
  for (const [input, expected] of cases) assert.equal(sanitizeQuantity(input), expected, JSON.stringify(input));
  const r = simulate({ simples: '1e9', media: -5, complexa: 'x' }, true);
  assert.deepEqual(r.quantities, { simples: 0, media: 0, complexa: 0 });
  const max = simulate({ simples: 1e9, media: 1e9, complexa: 1e9 }, true);
  assert.deepEqual(max.quantities, { simples: MAX_QUANTITY, media: MAX_QUANTITY, complexa: MAX_QUANTITY });
  assert.ok(Number.isSafeInteger(max.standardTotal) && Number.isSafeInteger(max.estimate), 'totais sem transbordamento');
  assert.equal(MAX_QUANTITY, 20);
});

test('16–17. sem armazenamento e sem envio: o simulador não usa storage, cookies nem rede', () => {
  const FORBIDDEN = /localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|navigator\.clipboard|window\.open/;
  for (const file of ['src/sections/Simulator.tsx', 'src/precos.ts']) assert.doesNotMatch(readFileSync(file, 'utf8'), FORBIDDEN, file);
});

test('19. calculadora e cartões usam a mesma fonte: nenhum preço digitado no simulador', () => {
  for (const tier of ['simples', 'media']) {
    const f = priceFacts(tier);
    assert.equal(simulate({ [tier]: 1 }, true).estimate, f.launch);
    assert.equal(simulate({ [tier]: 1 }, false).estimate, f.standard);
    assert.equal(simulate({ [tier]: 1 }, true).savings, f.savings);
    assert.equal(simulate({ [tier]: 1 }, true).percent, f.percent);
  }
  const ui = readFileSync('src/sections/Simulator.tsx', 'utf8');
  assert.doesNotMatch(ui, /R\$\s?\d|\d+(?:[.,]\d+)?\s?%/, 'nenhum valor nem percentual digitado no componente');
  assert.match(ui, /from '\.\.\/precos'/);
  const content = readFileSync('src/content.ts', 'utf8');
  const block = content.slice(content.indexOf('export const SIMULATOR'), content.indexOf('/* Como funciona'));
  assert.doesNotMatch(block, /R\$\s?\d|\d+(?:[.,]\d+)?\s?%/, 'nenhum valor nem percentual nos textos do simulador');
  assert.doesNotMatch(block, /\bROI\b|horas economizadas|economize|retorno sobre/i, 'sem ROI nem promessa de horas economizadas');
  assert.match(
    block,
    /'Esta simulação é uma estimativa baseada nas categorias selecionadas\. A classificação, o escopo e o investimento definitivo serão confirmados na avaliação e registrados em proposta comercial\.'/,
  );
});

test('20. controles de publicação preservados: aprovações, aviso de homologação e campanha intocados', () => {
  const pub = JSON.parse(readFileSync('publicacao.json', 'utf8'));
  assert.deepEqual(pub.aprovacoes, {
    precos: true,
    condicoesComerciais: false,
    textosComerciais: false,
    avisoDePrivacidade: false,
    agendamento: false,
    envioAutomatico: false,
    publicacao: false,
  });
  assert.equal(pub.avisoHomologacao, true);
  assert.deepEqual(pub.campanhaLancamento, { inicio: null, fim: null });
  assert.equal(pub.controlador.nome, null, 'razão social não inventada');
  assert.equal(pub.envioAutomatico.endpoint, null, 'backend não ativado');
});
