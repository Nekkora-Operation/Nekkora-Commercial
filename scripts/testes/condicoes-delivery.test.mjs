/**
 * NEKKORA-COM-CONTRACT-001 — cenários obrigatórios das condições comerciais C-01 a C-12.
 *
 * Duas camadas: (1) as regras executáveis de scripts/comercial/regras-delivery.mjs, que traduzem o contrato-base; (2) a
 * coerência entre as minutas, os textos públicos (src/content.ts) e os bloqueios de produção. Nenhum teste aprova nada:
 * eles verificam que as diretrizes estão refletidas e que nenhuma aprovação foi presumida.
 */
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  diaEmBrasilia,
  encargosDeAtraso,
  inicioMinimoDoDesenvolvimento,
  parcelas,
  periodosDeReclamacao,
  precoDaAutomacao,
  precosDaProposta,
  propostaAceitavel,
  resultadoDaDesistencia,
  situacaoDaHomologacao,
  somarDiasUteis,
  tratamentoDaSolicitacao,
  ultimoDiaDeAceite,
  validarAlteracaoDePrazo,
  validarCronograma,
  vencimentoDaParcela,
} from '../comercial/regras-delivery.mjs';

const ler = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
/** Markdown quebra frases em linhas: compara com os espaços normalizados. */
const doc = (p) => ler(p).replace(/\s+/g, ' ');
const CONTRATO = doc('docs/comercial/contrato-base-delivery.md');
const PROPOSTA = doc('docs/comercial/proposta-modelo-delivery.md');
const GARANTIA = doc('docs/comercial/termo-garantia-delivery.md');
const COMPONENTES = doc('docs/comercial/anexo-componentes-delivery.md');
const B2B = doc('docs/comercial/anexo-b2b-delivery.md');
const REGULAMENTO = doc('docs/comercial/regulamento-campanha-lancamento.md');
const CONTENT = ler('src/content.ts');
const PUBLICACAO = JSON.parse(ler('publicacao.json'));

// Período sintético (não é o da publicação): os testes nunca dependem das datas reais nem as preenchem.
const PERIODO = { inicio: '2026-12-01', fim: '2027-01-31' };
const PRECO = 280_000; // R$ 2.800 (média, lançamento) em centavos

/* 1 ------------------------------------------------------------------ */
test('1. arrependimento legal: restituição integral de tudo o que foi pago, a qualquer título', () => {
  const r = resultadoDaDesistencia({ precoCentavos: PRECO, pagoANekkora: { desenvolvimento: 140_000, outros: 5_000 }, arrependimentoLegal: true });
  assert.equal(r.regra, 'arrependimento-legal');
  assert.equal(r.restituirCentavos, 145_000);
  assert.equal(r.cobrarAteCentavos, 0);
  assert.equal(r.aceite, false);
  // Contrato: canal, confirmação imediata, sem termo final diferente do legal, sem início antecipado
  assert.match(CONTRATO, /contato@nekkora\.com/);
  assert.match(CONTRATO, /confirmação imediata/);
  assert.match(CONTRATO, /não extingue/);
  assert.match(CONTRATO, /não há início antecipado/);
  assert.doesNotMatch(PROPOSTA, /salvo se você pedir|salvo pedido expresso/i, 'C-02: sem início antecipado a pedido do cliente');
});

test('1b. espera de 7 dias: o desenvolvimento só começa no 8º dia após a assinatura', () => {
  assert.equal(inicioMinimoDoDesenvolvimento('2026-12-10'), '2026-12-18');
  const ok = { assinatura: '2026-12-10', escopo: 'x', precoCentavos: PRECO, homologacaoPrevista: '2027-01-08', dependencias: [], criteriosDeAceite: ['a'] };
  assert.equal(validarCronograma({ ...ok, inicioPrevisto: '2026-12-17' }).valido, false);
  assert.equal(validarCronograma({ ...ok, inicioPrevisto: '2026-12-18' }).valido, true);
});

/* 2 ------------------------------------------------------------------ */
test('2. desistência após o início e antes da conclusão: reembolso integral do pago pelo desenvolvimento', () => {
  for (const evidencias of [{}, { conclusaoComprovada: true }, { conclusaoComprovada: true, disponibilizadaParaHomologacao: true, defeitoPendente: true }]) {
    const r = resultadoDaDesistencia({ precoCentavos: PRECO, pagoANekkora: { desenvolvimento: 140_000 }, evidencias });
    assert.equal(r.regra, 'C-03');
    assert.equal(r.restituirCentavos, 140_000, 'sem apuração por horas ou marcos');
    assert.equal(r.cobrarAteCentavos, 0);
    assert.match(r.despesasPagasDiretamenteATerceiros, /fora do reembolso/);
  }
  assert.match(CONTRATO, /inclusive se o trabalho já\s+tiver começado/);
  assert.doesNotMatch(PROPOSTA, /marcos concluídos|% do preço/i, 'C-03 supersede os marcos de cancelamento');
});

/* 3 ------------------------------------------------------------------ */
test('3. desistência após conclusão e disponibilização: cobrança sujeita a revisão jurídica, sem aceite fictício', () => {
  const evidencias = { conclusaoComprovada: true, disponibilizadaParaHomologacao: true };
  const r = resultadoDaDesistencia({ precoCentavos: PRECO, pagoANekkora: { desenvolvimento: 140_000 }, evidencias });
  assert.equal(r.regra, 'C-04');
  assert.equal(r.cobrarAteCentavos, 140_000, 'até 100% do preço, abatido o já pago');
  assert.equal(r.exigibilidade, 'depende-de-revisao-juridica');
  assert.equal(r.aceite, false);
  assert.equal(resultadoDaDesistencia({ precoCentavos: PRECO, pagoANekkora: { desenvolvimento: 140_000 }, evidencias: { ...evidencias, contestacaoPendente: true } }).exigibilidade, 'suspensa-ate-analise-da-contestacao');
  // Motivo atribuível à Nekkora ou arrependimento legal nunca caem na C-04
  assert.equal(resultadoDaDesistencia({ precoCentavos: PRECO, pagoANekkora: { desenvolvimento: 140_000 }, evidencias, motivoAtribuivelANekkora: true }).regra, 'vicio-ou-descumprimento');
  assert.equal(resultadoDaDesistencia({ precoCentavos: PRECO, pagoANekkora: { desenvolvimento: 140_000 }, evidencias, arrependimentoLegal: true }).regra, 'arrependimento-legal');
  assert.match(CONTRATO, /Alternativa A — diretriz da titular/);
  assert.match(CONTRATO, /Alternativa B — conservadora/);
  assert.match(CONTRATO, /\*\*não\*\* é registrada como aceite/);
});

/* 4 ------------------------------------------------------------------ */
test('4. homologação sem resposta: dois lembretes e suspensão, sem cobrar a 2ª parcela', () => {
  const base = { disponibilizadaEm: '2026-12-01' };
  const prazo = somarDiasUteis('2026-12-01', 10); // 10 dias úteis
  assert.equal(prazo, '2026-12-15');
  let s = situacaoDaHomologacao({ ...base, hoje: '2026-12-10' });
  assert.equal(s.status, 'em-avaliacao');
  s = situacaoDaHomologacao({ ...base, hoje: '2026-12-16' });
  assert.deepEqual([s.status, s.proximaAcao], ['aguardando-cliente', '1º lembrete escrito']);
  s = situacaoDaHomologacao({ ...base, hoje: '2026-12-24', lembretesEnviados: ['2026-12-16'] });
  assert.equal(s.proximaAcao, '2º lembrete escrito');
  s = situacaoDaHomologacao({ ...base, hoje: '2027-01-05', lembretesEnviados: ['2026-12-16', '2026-12-24'] });
  assert.equal(s.status, 'homologacao-suspensa-aguardando-cliente');
  for (const x of [s, situacaoDaHomologacao({ ...base, hoje: '2027-06-01', lembretesEnviados: ['2026-12-16', '2026-12-24'] })]) {
    assert.equal(x.segundaParcelaExigivel, false, 'o silêncio nunca torna a 2ª parcela exigível');
    assert.equal(x.aceiteTacito, false);
  }
  assert.equal(situacaoDaHomologacao({ ...base, hoje: '2026-12-20', aceiteExpressoEm: '2026-12-19' }).segundaParcelaExigivel, true);
  assert.match(CONTRATO, /Homologação suspensa — aguardando cliente/);
  assert.match(CONTRATO, /Não existe aceite tácito/);
});

/* 5 ------------------------------------------------------------------ */
test('5. defeitos x ajustes de preferência x novas funcionalidades', () => {
  assert.deepEqual(tratamentoDaSolicitacao({ tipo: 'defeito', rodadasDePreferenciaJaUsadas: 99 }).incluido, true);
  assert.equal(tratamentoDaSolicitacao({ tipo: 'defeito' }).limiteDeRodadas, null);
  assert.equal(tratamentoDaSolicitacao({ tipo: 'preferencia', rodadasDePreferenciaJaUsadas: 1 }).incluido, true);
  assert.equal(tratamentoDaSolicitacao({ tipo: 'preferencia', rodadasDePreferenciaJaUsadas: 2 }).incluido, false);
  assert.match(tratamentoDaSolicitacao({ tipo: 'nova-funcionalidade' }).instrumento, /aditivo ou nova proposta/);
  assert.match(CONTRATO, /sem custo e sem limite de\s+rodadas/);
});

/* 6 ------------------------------------------------------------------ */
test('6. garantia contratual adicional não reduz a garantia legal', () => {
  const comum = { terminoDaExecucao: '2027-01-10', entregaDefinitiva: '2027-01-20', consumidor: true };
  const a = periodosDeReclamacao({ ...comum, contagemContratual: 'apos-prazo-legal' });
  const b = periodosDeReclamacao({ ...comum, contagemContratual: 'da-entrega-definitiva' });
  assert.deepEqual(a.legal, b.legal, 'o prazo legal não depende da opção contratual');
  assert.equal(a.legal.fim, '2027-04-10');
  assert.equal(a.contratual.inicio, a.legal.fim, 'opção (a): a cobertura começa quando a legal termina');
  assert.ok(b.contratual.fim <= a.legal.fim, 'opção (b) cabe dentro do prazo legal: não é "adicional" para consumidor');
  assert.match(GARANTIA, /não substitui, não reduz e não condiciona/);
  assert.match(GARANTIA, /vício oculto/);
  for (const t of [CONTENT, PROPOSTA, REGULAMENTO]) assert.doesNotMatch(t, /120 dias/, 'não anunciar 120 dias de garantia');
  assert.doesNotMatch(GARANTIA, /isent[ao] de (qualquer )?responsabilidade|não se responsabiliza por (sistemas|serviços) de terceiros/i);
});

/* 7 ------------------------------------------------------------------ */
test('7. código específico do cliente x componentes da Nekkora (Modelo A-R)', () => {
  assert.match(COMPONENTES, /pertencem ao CONTRATANTE \*\*a partir da quitação integral\*\*/);
  assert.match(COMPONENTES, /outro desenvolvedor que o CONTRATANTE contratar/);
  assert.match(COMPONENTES, /não revende, não sublicencia e não reutiliza/);
  assert.match(COMPONENTES, /ReceitaNet BX/);
  assert.match(COMPONENTES, /Repositório público não é software livre nem aberto/);
  assert.match(COMPONENTES, /LIC-01/);
  assert.match(COMPONENTES, /LIC-02/);
  assert.match(COMPONENTES, /não oferece alocação permanente/);
  for (const t of [CONTENT, PROPOSTA]) assert.doesNotMatch(t, /portal de (demandas|solicita)|assinatura mensal|painel de acompanhamento/i, 'nada futuro anunciado');
  assert.doesNotMatch(CONTENT + PROPOSTA, /código aberto|open source|software livre/i, 'o Framework não é anunciado como aberto');
});

/* 8 ------------------------------------------------------------------ */
test('8. várias automações: preços independentes, sem reclassificar o conjunto', () => {
  const r = precosDaProposta(
    [
      { nome: 'A', categoria: 'simples', recebidaEm: '2026-12-05T13:00:00Z' },
      { nome: 'B', categoria: 'simples', recebidaEm: '2026-12-05T13:00:00Z' },
      { nome: 'C', categoria: 'simples', recebidaEm: '2026-12-05T13:00:00Z' },
      { nome: 'D', categoria: 'complexa', recebidaEm: '2026-12-05T13:00:00Z' },
    ],
    PERIODO,
  );
  assert.deepEqual(r.itens.map((i) => i.categoria), ['simples', 'simples', 'simples', 'complexa']);
  assert.equal(r.totalCentavos, 3 * 100_000);
  assert.deepEqual(r.semValor, ['D']);
});

/* 9 ------------------------------------------------------------------ */
test('9. campanha no primeiro e no último dia (horário de Brasília)', () => {
  const p = (recebidaEm) => precoDaAutomacao({ categoria: 'media', recebidaEm, periodo: PERIODO });
  assert.equal(p('2026-12-01T03:05:00Z').regra, 'lancamento', '01/12 00:05 em Brasília');
  assert.equal(p('2026-12-01T02:59:00Z').regra, 'padrao', '30/11 23:59 em Brasília');
  assert.equal(p('2027-02-01T02:59:00Z').regra, 'lancamento', '31/01 23:59 em Brasília');
  assert.equal(p('2027-02-01T03:00:00Z').regra, 'padrao', '01/02 00:00 em Brasília');
  assert.equal(p('2026-12-15T12:00:00Z').centavos, 280_000);
  assert.equal(precoDaAutomacao({ categoria: 'complexa', recebidaEm: '2026-12-15T12:00:00Z', periodo: PERIODO }).centavos, null);
  assert.equal(precoDaAutomacao({ categoria: 'simples', recebidaEm: '2026-12-15T12:00:00Z', periodo: { inicio: null, fim: null } }).regra, 'padrao', 'sem datas aprovadas, sem preço de lançamento');
});

/* 10 ----------------------------------------------------------------- */
test('10. solicitação durante a campanha e proposta emitida depois do fim: mantém o preço de lançamento', () => {
  const recebidaEm = '2027-01-31T20:00:00Z';
  const emissao = '2027-02-05';
  assert.ok(emissao > PERIODO.fim);
  assert.equal(precoDaAutomacao({ categoria: 'simples', recebidaEm, periodo: PERIODO }).centavos, 100_000);
  assert.match(REGULAMENTO, /Proposta emitida depois do fim da campanha\*\* mantém o preço de lançamento/);
  assert.match(CONTENT, /mesmo que a proposta seja emitida depois do fim da campanha/);
});

/* 11 ----------------------------------------------------------------- */
test('11. validade de 7 dias corridos a partir da emissão', () => {
  assert.equal(ultimoDiaDeAceite('2027-02-05'), '2027-02-12');
  assert.equal(propostaAceitavel('2027-02-05', '2027-02-13T02:59:00Z'), true, '12/02 23:59 em Brasília');
  assert.equal(propostaAceitavel('2027-02-05', '2027-02-13T03:00:00Z'), false, '13/02 00:00 em Brasília');
  assert.match(CONTENT, /aceita em até 7 dias corridos da emissão/);
});

/* 12 ----------------------------------------------------------------- */
test('12. parcelas e encargos: multa única, juros simples pro rata, sem capitalização', () => {
  assert.deepEqual(parcelas(PRECO), { primeira: 140_000, segunda: 140_000 });
  assert.deepEqual(parcelas(100_001), { primeira: 50_001, segunda: 50_000 });
  assert.equal(vencimentoDaParcela('2026-11-13'), '2026-11-23', '5 dias úteis, com 15/11 (domingo) e 20/11 (feriado nacional)');
  const em30 = encargosDeAtraso({ valorCentavos: 140_000, vencimento: '2027-01-10', pagamentoEm: '2027-02-09' });
  assert.deepEqual([em30.diasDeAtraso, em30.multaCentavos, em30.jurosCentavos, em30.totalCentavos], [30, 2_800, 1_400, 144_200]);
  const em90 = encargosDeAtraso({ valorCentavos: 140_000, vencimento: '2027-01-10', pagamentoEm: '2027-04-10' });
  assert.equal(em90.jurosCentavos, 3 * 1_400, 'juros simples: 3 meses = 3 × 1%, não (1,01³ − 1)');
  assert.equal(em90.multaCentavos, 2_800, 'multa única');
  assert.equal(encargosDeAtraso({ valorCentavos: 140_000, vencimento: '2027-01-10', pagamentoEm: '2027-02-09', dispensa: true }).totalCentavos, 140_000);
  assert.equal(encargosDeAtraso({ valorCentavos: 140_000, vencimento: '2027-01-10', pagamentoEm: '2027-02-09', contestacaoPendente: true }).jurosCentavos, 0);
  assert.equal(encargosDeAtraso({ valorCentavos: 140_000, vencimento: '2027-01-10', pagamentoEm: '2027-02-09', limiteJurosMensal: 0.005 }).jurosCentavos, 700, 'teto legal menor prevalece');
  assert.match(CONTRATO, /\*\*Não há cancelamento automático\*\* por atraso/);
  assert.match(CONTRATO, /limitados ao\s+máximo permitido em lei/);
});

/* 13 ----------------------------------------------------------------- */
test('13. alteração de prazo só com motivo, comunicação e concordância escritas', () => {
  assert.equal(validarAlteracaoDePrazo({ motivo: 'dependência do cliente', comunicadaPorEscritoEm: '2027-01-02' }).valida, false);
  assert.deepEqual(validarAlteracaoDePrazo({ motivo: 'x', comunicadaPorEscritoEm: '2027-01-02', concordanciaEscritaEm: '2027-01-03' }), { valida: true, faltas: [] });
  assert.match(CONTRATO, /justificada, comunicada e acordada por escrito/);
  assert.match(CONTRATO, /a fila não deixa o início a critério exclusivo da Nekkora/);
  assert.doesNotMatch(CONTENT, /o início depende da fila/, 'C-12: texto público não deixa o início indeterminado');
  assert.match(CONTRATO, /Não há reuniões diárias obrigatórias/);
  assert.doesNotMatch(PROPOSTA + CONTENT, /reuniões diárias/i);
});

/* 14 ----------------------------------------------------------------- */
test('14. bloqueios de produção preservados: nenhuma aprovação presumida', () => {
  const a = PUBLICACAO.aprovacoes;
  for (const k of ['condicoesComerciais', 'textosComerciais', 'avisoDePrivacidade', 'publicacao']) assert.equal(a[k], false, `${k} continua false`);
  assert.equal(PUBLICACAO.avisoHomologacao, true);
  assert.deepEqual(PUBLICACAO.campanhaLancamento, { inicio: '2026-11-06', fim: '2027-01-06' }, 'datas históricas não alteradas');
  const portao = ler('scripts/verificar-publicacao.mjs');
  for (const id of ['PUB-19', 'PUB-17', 'PUB-09', 'PUB-18', 'PUB-10']) assert.match(portao, new RegExp(`need\\([^\\n]*'${id}'`), `${id} continua exigido`);
});

/* Coerência dos textos públicos com as decisões ------------------------ */
test('textos públicos coerentes com C-02, C-03, C-06, C-07 e C-12', () => {
  assert.match(CONTENT, /O desenvolvimento começa depois de 7 dias corridos da assinatura do contrato/);
  assert.match(CONTENT, /devolvemos integralmente o que pagou à Nekkora pelo desenvolvimento/);
  assert.match(CONTENT, /o silêncio não vale como aceite/);
  assert.match(CONTENT, /Garantia contratual de correção de defeitos, em termo escrito, além das garantias legais/);
  assert.doesNotMatch(CONTENT, /garantia adicional após a entrega, salvo se previstos/, 'a garantia contratual deixou de ser "não incluída"');
  assert.doesNotMatch(CONTENT, /retenção|multa por desistência|aceite tácito(?! )/i);
  assert.match(B2B, /Ter CNPJ \*\*não basta\*\*/);
  assert.equal(diaEmBrasilia('2026-11-06T02:00:00Z'), '2026-11-05');
});
