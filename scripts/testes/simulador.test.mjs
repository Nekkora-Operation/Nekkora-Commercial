/**
 * Simulador de Investimento — Nekkora Delivery (NEKKORA-CALC-001, COM-VITRINE-001 §8): cálculo com pacotes de 3,
 * tabela única em qualquer data e proteções, sobre o MESMO código da página (src/precos.ts, carregado pelo Node com type
 * stripping). A interface — teclado, celular, armazenamento, rede e formulário — é homologada em navegador real por
 * scripts/homologacao-simulador.mjs.
 *
 * Os números esperados abaixo são digitados de propósito: se a tabela mudar, o teste falha em vez de aceitar o novo
 * valor.
 */
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EMPTY_QUANTITIES, MAX_QUANTITY, PRICE_TABLE, campaignState, priceFacts, sanitizeQuantity, simulate, todayInBrazil } from '../../src/precos.ts';

const PERIOD = { inicio: '2026-11-01', fim: '2026-12-31' };
const view = (r) => r.lines.map((l) => [l.tier, l.quantity, l.packages, l.singles, l.totalLabel]);

test('1. quantidade zero: nada a calcular, nenhum valor', () => {
  const r = simulate(EMPTY_QUANTITIES);
  assert.equal(r.total, 0);
  assert.equal(r.estimate, 0);
  assert.equal(r.savings, 0);
  assert.equal(r.packages, 0);
  assert.deepEqual(EMPTY_QUANTITIES, { simples: 0, media: 0 }, 'quantidade inicial é zero, só simples e média');
});

test('2. quantidade única: uma simples e uma média, iguais aos cartões, sem economia', () => {
  const s = simulate({ simples: 1 });
  assert.deepEqual([s.estimateLabel, s.savings, s.packages], ['R$ 650', 0, 0]);
  const m = simulate({ media: 1 });
  assert.deepEqual([m.estimateLabel, m.savings, m.packages], ['R$ 1.400', 0, 0]);
});

test('3. exemplo de homologação (4 simples + 1 média): R$ 3.550, sem pacotes R$ 4.000, economia R$ 450', () => {
  const r = simulate({ simples: 4, media: 1 });
  assert.equal(r.total, 5);
  assert.deepEqual([r.estimateLabel, r.individualTotalLabel, r.savingsLabel, r.packages], ['R$ 3.550', 'R$ 4.000', 'R$ 450', 1]);
  assert.deepEqual(view(r), [
    ['simples', 4, 1, 1, 'R$ 2.150'],
    ['media', 1, 0, 1, 'R$ 1.400'],
  ]);
});

test('4. pacotes (V-03): 3 = um pacote; 4 e 5 = pacote + avulsas; 6 = dois pacotes; categorias não se misturam', () => {
  assert.deepEqual([simulate({ simples: 3 }).estimateLabel, simulate({ simples: 3 }).savingsLabel], ['R$ 1.500', 'R$ 450']);
  assert.deepEqual([simulate({ media: 3 }).estimateLabel, simulate({ media: 3 }).savingsLabel], ['R$ 3.500', 'R$ 700']);
  assert.deepEqual(view(simulate({ media: 4 })), [['simples', 0, 0, 0, 'R$ 0'], ['media', 4, 1, 1, 'R$ 4.900']]);
  assert.deepEqual(view(simulate({ media: 5 })), [['simples', 0, 0, 0, 'R$ 0'], ['media', 5, 1, 2, 'R$ 6.300']]);
  const six = simulate({ media: 6 });
  assert.deepEqual([six.estimateLabel, six.individualTotalLabel, six.savingsLabel, six.packages], ['R$ 7.000', 'R$ 8.400', 'R$ 1.400', 2]);
  // 2 simples + 1 média não formam pacote misto
  const mixed = simulate({ simples: 2, media: 1 });
  assert.deepEqual([mixed.estimateLabel, mixed.savings, mixed.packages], ['R$ 2.700', 0, 0]);
});

test('5. coerência para qualquer combinação: economia = individual − estimativa, nunca negativa, sempre abaixo de 50%', () => {
  for (let s = 0; s <= MAX_QUANTITY; s++) {
    for (let m = 0; m <= MAX_QUANTITY; m++) {
      const r = simulate({ simples: s, media: m });
      assert.equal(r.individualTotal, s * 650 + m * 1400, `${s}+${m}: total individual`);
      assert.equal(r.savings, r.individualTotal - r.estimate);
      assert.equal(r.savings, Math.floor(s / 3) * 450 + Math.floor(m / 3) * 700, `${s}+${m}: economia = pacotes × economia do pacote`);
      assert.ok(r.savings >= 0 && (r.individualTotal === 0 || r.savings / r.individualTotal < 0.5), `${s}+${m}: sem desconto universal de 50%`);
    }
  }
});

test('6. sem categoria complexa (V-04): entrada "complexa" é ignorada e não gera valor', () => {
  const r = simulate({ complexa: 3 });
  assert.deepEqual([r.total, r.estimate, Object.keys(r.quantities).join()], [0, 0, 'simples,media']);
  assert.ok(!r.lines.some((l) => l.tier === 'complexa'));
  assert.ok(!('complexa' in PRICE_TABLE));
  const ui = readFileSync('src/sections/Simulator.tsx', 'utf8');
  assert.doesNotMatch(ui, /complexa/i);
  const content = readFileSync('src/content.ts', 'utf8');
  const block = content.slice(content.indexOf('export const SIMULATOR'), content.indexOf('/* Como funciona'));
  assert.doesNotMatch(block, /complexa|sob orçamento/i);
});

test('7. tabela única (V-01): a simulação não depende da data nem da campanha', () => {
  assert.equal(simulate.length, 1, 'simulate recebe só as quantidades');
  assert.doesNotMatch(readFileSync('src/sections/Simulator.tsx', 'utf8'), /isLaunchActive|launchState|campaign/);
});

test('9–12. situação da campanha no fuso de Brasília (só a comunicação promocional): vigente, futura, encerrada e pendente', () => {
  assert.equal(campaignState(PERIOD, '2026-11-01'), 'vigente', 'primeiro dia');
  assert.equal(campaignState(PERIOD, '2026-12-31'), 'vigente', 'último dia');
  assert.equal(campaignState(PERIOD, '2026-10-31'), 'futura');
  assert.equal(campaignState(PERIOD, '2027-01-01'), 'encerrada');
  assert.equal(campaignState({ inicio: null, fim: null }, '2026-11-15'), 'pendente');
  assert.equal(campaignState({ inicio: '2026-11-01', fim: null }, '2026-11-15'), 'pendente', 'uma data só não abre a campanha');
  assert.equal(campaignState(PERIOD, todayInBrazil(new Date('2027-01-01T02:30:00Z'))), 'vigente');
  assert.equal(campaignState(PERIOD, todayInBrazil(new Date('2027-01-01T03:00:00Z'))), 'encerrada');
  assert.equal(campaignState(PERIOD, todayInBrazil(new Date('2026-11-01T02:59:00Z'))), 'futura');
  assert.equal(campaignState(PERIOD, todayInBrazil(new Date('2026-11-01T03:00:00Z'))), 'vigente');
});

test('12. datas pendentes: a faixa promocional só aparece como prévia de homologação, nunca sem o aviso', () => {
  const config = readFileSync('src/config.ts', 'utf8');
  assert.match(config, /state === 'vigente' \|\| \(state === 'pendente' && publicacao\.avisoHomologacao === true\)/);
  const content = readFileSync('src/content.ts', 'utf8');
  assert.match(content, /pendingDates: 'Prévia para revisão: as datas da campanha ainda não foram definidas\. Nenhuma solicitação é elegível antes do início oficial\.'/);
});

test('9–11. campanha aprovada em publicacao.json (06/11/2026 a 06/01/2027): estados nas bordas, mesmos preços em todas', () => {
  const { campanhaLancamento } = JSON.parse(readFileSync('publicacao.json', 'utf8'));
  for (const [at, state] of [
    ['2026-11-05T23:30:00-03:00', 'futura'],
    ['2026-11-06T00:30:00-03:00', 'vigente'],
    ['2026-11-15T12:00:00-03:00', 'vigente'],
    ['2027-01-06T23:30:00-03:00', 'vigente'],
    ['2027-01-07T00:30:00-03:00', 'encerrada'],
  ]) {
    assert.equal(campaignState(campanhaLancamento, todayInBrazil(new Date(at))), state, at);
  }
  // depois de 06/01/2027 o preço continua o da tabela nova (V-01): nenhum retorno a R$ 1.500 / R$ 3.500 por automação
  assert.deepEqual([priceFacts('simples').individualLabel, priceFacts('media').individualLabel], ['R$ 650', 'R$ 1.400']);
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
  const r = simulate({ simples: '1e9', media: -5 });
  assert.deepEqual(r.quantities, { simples: 0, media: 0 });
  const max = simulate({ simples: 1e9, media: 1e9 });
  assert.deepEqual(max.quantities, { simples: MAX_QUANTITY, media: MAX_QUANTITY });
  assert.ok(Number.isSafeInteger(max.individualTotal) && Number.isSafeInteger(max.estimate), 'totais sem transbordamento');
  assert.equal(MAX_QUANTITY, 20);
});

test('16–17. sem armazenamento e sem envio: o simulador não usa storage, cookies nem rede', () => {
  const FORBIDDEN = /localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|navigator\.clipboard|window\.open/;
  for (const file of ['src/sections/Simulator.tsx', 'src/precos.ts']) assert.doesNotMatch(readFileSync(file, 'utf8'), FORBIDDEN, file);
});

test('19. calculadora e cartões usam a mesma fonte: nenhum preço digitado no simulador', () => {
  for (const tier of ['simples', 'media']) {
    const f = priceFacts(tier);
    assert.equal(simulate({ [tier]: 1 }).estimate, f.individual);
    assert.equal(simulate({ [tier]: 3 }).estimate, f.package);
    assert.equal(simulate({ [tier]: 3 }).savings, f.savings);
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
    condicoesComerciais: true, // titular, 11/11/2026 (PUB-19, commit e4bc72c)
    textosComerciais: true, // titular, 11/11/2026 (PUB-17, commit e4bc72c)
    avisoDePrivacidade: true, // titular, 11/11/2026 (PUB-09, commit e4bc72c)
    agendamento: true, // titular, 05/11/2026 (PUB-20)
    envioAutomatico: false,
    publicacao: true, // titular, 11/11/2026 (PUB-18, commit 2fdaed6)
  });
  assert.equal(pub.avisoHomologacao, false); // titular, 11/11/2026 (PUB-10)
  assert.deepEqual(pub.campanhaLancamento, {
    inicio: '2026-11-06',
    fim: '2027-01-06'
  });
  assert.equal(
    pub.controlador.nome,
    'NICOLLY OLIVEIRA DE CARVALHO DESENVOLVIMENTO DE SOFTWARE LTDA'
  );
  assert.equal(pub.envioAutomatico.endpoint, null, 'backend não ativado');
  // PUB-22: endereço comercial informado pela titular em 05/11/2026, com base no cartão CNPJ
  assert.equal(pub.fornecedor.endereco, 'Rua Pais Leme, 215, Conjunto 1713, Pinheiros, São Paulo/SP, CEP 05424-150');
});
