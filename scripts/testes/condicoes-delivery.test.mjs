/**
 * NEKKORA-COM-CONTRACT-001 — cenários obrigatórios das condições comerciais C-01 a C-12, e os 30 cenários da R1
 * (C-03, C-04, C-06, C-07, C-10, C-11), no fim do arquivo.
 *
 * Duas camadas: (1) as regras executáveis de scripts/comercial/regras-delivery.mjs, que traduzem o contrato-base; (2) a
 * coerência entre as minutas, os textos públicos (src/content.ts) e os bloqueios de produção. Nenhum teste aprova nada:
 * eles verificam que as diretrizes estão refletidas e que nenhuma aprovação foi presumida.
 */
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { PREVIOUS_PRICE_TABLE } from '../../src/precos.ts';
import {
  atendimentoDaGarantia,
  classificarAutomacao,
  cronogramaDaHomologacao,
  diaEmBrasilia,
  prazoDaRestituicao,
  regimeDaContratacao,
  encargosDeAtraso,
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
const CONSUMIDOR = { enquadramento: 'consumidor' };
const CONCLUIDA = { conclusaoComprovada: true, criteriosDeAceiteCumpridos: true, disponibilizadaParaHomologacaoEm: '2027-01-05' };
const ANEXO_B2B_COMPLETO = { atividadeEconomicaPropria: true, automacaoComoInsumo: true, estruturaParaNegociar: true, justificativaAssinadaEAceita: true };
const DESISTENCIA = { desistenciaExpressaEm: '2027-01-10' };

/* 1 ------------------------------------------------------------------ */
test('1. arrependimento legal: restituição integral de tudo o que foi pago, a qualquer título', () => {
  const r = resultadoDaDesistencia({ ...CONSUMIDOR, precoCentavos: PRECO, pagoANekkora: { desenvolvimento: 140_000, outros: 5_000 }, arrependimentoLegal: true });
  assert.equal(r.regra, 'arrependimento-legal');
  assert.equal(r.restituirCentavos, 145_000);
  assert.equal(r.cobrancaAdicionalCentavos, 0);
  assert.equal(r.aceite, false);
  // Contrato: canal, confirmação imediata, sem termo final diferente do legal
  assert.match(CONTRATO, /contato@nekkora\.com/);
  assert.match(CONTRATO, /confirmação imediata/);
  assert.match(CONTRATO, /não extingue/);
  assert.match(CONTRATO, /nem reduz a restituição do item 3\.4/);
});

test('1b. sem espera fixa (titular, 09/11/2026): o início é a data da proposta, nunca antes da assinatura', () => {
  const ok = { assinatura: '2026-12-10', escopo: 'x', precoCentavos: PRECO, homologacaoPrevista: '2027-01-08', dependencias: [], criteriosDeAceite: ['a'] };
  assert.equal(validarCronograma({ ...ok, inicioPrevisto: '2026-12-09' }).valido, false, 'antes da assinatura');
  assert.equal(validarCronograma({ ...ok, inicioPrevisto: '2026-12-11' }).valido, true, 'antes do antigo 8º dia');
  assert.equal(validarCronograma({ ...ok, inicioPrevisto: '2026-12-18' }).valido, true);
  assert.equal(validarCronograma({ ...ok, inicioPrevisto: undefined }).valido, false, 'a proposta continua exigindo a data de início');
  assert.equal(validarCronograma({ ...ok, inicioPrevisto: '2027-01-08' }).valido, false, 'homologação continua depois do início');
  for (const doc of [CONTRATO, PROPOSTA, ler('docs/comercial/procedimento-operacional-delivery.md')]) {
    assert.doesNotMatch(doc, /só começa depois de (transcorridos )?7 dias|8º dia após a assinatura|≥ 8º dia/);
    assert.doesNotMatch(doc, /início imediato garantido|24 ?horas|24h/i, 'sem promessa de início imediato nem atendimento 24 h');
  }
  assert.match(CONTRATO, /Não há prazo de espera obrigatório/);
  assert.match(CONTRATO, /não é promessa de início imediato/);
  assert.match(PROPOSTA, /\*\*Início previsto\*\*/);
  assert.equal(ultimoDiaDeAceite('2026-12-10'), '2026-12-17', 'o prazo de 7 dias para aceitar a proposta não muda');
});

/* 2 ------------------------------------------------------------------ */
test('2. desistência após o início e antes da conclusão: reembolso integral do pago pelo desenvolvimento', () => {
  for (const evidencias of [{}, { conclusaoComprovada: true }, { ...CONCLUIDA, defeitoPendente: true }]) {
    const r = resultadoDaDesistencia({ ...CONSUMIDOR, ...DESISTENCIA, precoCentavos: PRECO, pagoANekkora: { desenvolvimento: 140_000 }, evidencias });
    assert.equal(r.regra, 'C-03');
    assert.equal(r.restituirCentavos, 140_000, 'sem apuração por horas ou marcos');
    assert.equal(r.cobrancaAdicionalCentavos, 0);
    assert.match(r.despesasPagasDiretamenteATerceiros, /fora do reembolso/);
  }
  assert.match(CONTRATO, /inclusive se o trabalho já\s+tiver começado/);
  assert.doesNotMatch(PROPOSTA, /marcos concluídos|% do preço/i, 'C-03 supersede os marcos de cancelamento');
});

/* 3 ------------------------------------------------------------------ */
test('3. desistência durante a homologação: 50% do valor pago, sem cobrança adicional nem aceite (titular, 09/11/2026)', () => {
  const comum = { ...DESISTENCIA, precoCentavos: PRECO, pagoANekkora: { desenvolvimento: 140_000 }, evidencias: CONCLUIDA };
  const c = resultadoDaDesistencia({ ...comum, ...CONSUMIDOR });
  const b = resultadoDaDesistencia({ ...comum, enquadramento: 'b2b-nao-consumerista', anexoB2B: ANEXO_B2B_COMPLETO });
  for (const r of [c, b]) {
    assert.deepEqual([r.regra, r.restituirCentavos, r.retidoCentavos, r.cobrancaAdicionalCentavos], ['C-04-homologacao', 70_000, 70_000, 0], 'mesma regra nos dois regimes');
    assert.equal(r.situacaoDaRetencao, 'depende-de-revisao-juridica');
    assert.equal(r.aceite, false);
    assert.deepEqual(r.entrega.entregaveis, []);
  }
  assert.equal(resultadoDaDesistencia({ ...comum, ...CONSUMIDOR, evidencias: { ...CONCLUIDA, contestacaoPendente: true } }).situacaoDaRetencao, 'suspensa-ate-analise-da-contestacao');
  // Motivo atribuível à Nekkora ou arrependimento legal nunca caem na C-04
  assert.equal(resultadoDaDesistencia({ ...comum, ...CONSUMIDOR, motivoAtribuivelANekkora: true }).regra, 'vicio-ou-descumprimento');
  assert.equal(resultadoDaDesistencia({ ...comum, ...CONSUMIDOR, arrependimentoLegal: true }).regra, 'arrependimento-legal');
  assert.match(CONTRATO, /Desistência durante a homologação \(C-04\)/);
  assert.match(CONTRATO, /\*\*não\*\* é registrada como aceite/);
  assert.match(CONTRATO, /sujeita à revisão jurídica \(JUR-03\)/);
  assert.match(B2B, /a regra é a \*\*mesma\*\* do contrato-base/);
  for (const t of [CONTRATO, PROPOSTA, B2B, COMPONENTES]) assert.doesNotMatch(t, /saldo máximo pretendido|valor validamente apurado|Reserva das etapas finais|até 90% do valor/i);
});

/* 4 ------------------------------------------------------------------ */
test('4. homologação sem resposta: lembretes no 5º e no 9º dia útil e suspensão, sem cobrar a 2ª parcela', () => {
  const base = { disponibilizadaEm: '2026-12-01' };
  assert.equal(somarDiasUteis('2026-12-01', 10), '2026-12-15');
  assert.deepEqual(cronogramaDaHomologacao('2026-12-01'), { dataBase: '2026-12-01', primeiroLembrete: '2026-12-08', segundoLembrete: '2026-12-14', prazoFinal: '2026-12-15', suspensao: '2026-12-16' });
  assert.equal(situacaoDaHomologacao({ ...base, hoje: '2026-12-07' }).status, 'em-avaliacao');
  const s = situacaoDaHomologacao({ ...base, hoje: '2026-12-16', lembretesEnviados: ['2026-12-08', '2026-12-14'] });
  assert.equal(s.status, 'homologacao-suspensa-aguardando-cliente');
  for (const x of [s, situacaoDaHomologacao({ ...base, hoje: '2027-06-01', lembretesEnviados: ['2026-12-08', '2026-12-14'], suspensaoRegistradaEm: '2026-12-16' })]) {
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
  const E = { valorCentavos: 140_000, vencimento: '2027-01-10', enquadramento: 'b2b-nao-consumerista' };
  const em30 = encargosDeAtraso({ ...E, pagamentoEm: '2027-02-09' });
  assert.deepEqual([em30.diasDeAtraso, em30.multaCentavos, em30.jurosCentavos, em30.totalCentavos], [30, 2_800, 1_400, 144_200]);
  const em90 = encargosDeAtraso({ ...E, pagamentoEm: '2027-04-10' });
  assert.equal(em90.jurosCentavos, 3 * 1_400, 'juros simples: 3 meses = 3 × 1%, não (1,01³ − 1)');
  assert.equal(em90.multaCentavos, 2_800, 'multa única');
  assert.equal(encargosDeAtraso({ ...E, pagamentoEm: '2027-02-09', dispensa: true }).totalCentavos, 140_000);
  assert.equal(encargosDeAtraso({ ...E, pagamentoEm: '2027-02-09', contestacaoPendente: true }).jurosCentavos, 0);
  const teto = { taxaMensal: 0.005, baseNormativa: 'exemplo sintético de teste', periodoDeReferencia: '2027-01' };
  assert.equal(encargosDeAtraso({ ...E, enquadramento: 'consumidor', pagamentoEm: '2027-02-09', tetoLegal: teto }).jurosCentavos, 700, 'teto legal menor prevalece');
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
  // PUB-17, PUB-19 e PUB-09: aprovações expressas da titular em 11/11/2026 (commit e4bc72c), cada uma com registro em
  // $origem. PUB-18 (publicação) e PUB-10 (aviso de homologação desligado): autorizações expressas da titular em
  // 11/11/2026 (commit 2fdaed6), também registradas em $origem.
  for (const k of ['condicoesComerciais', 'textosComerciais', 'avisoDePrivacidade']) {
    assert.equal(a[k], true, `${k} aprovada`);
    assert.match(PUBLICACAO.$origem[`aprovacoes.${k}`], /Titular, 11\/11\/2026 .*e4bc72c.*sem parecer jurídico externo/, `${k}: registro da aprovação`);
  }
  assert.equal(a.publicacao, true, 'publicacao (PUB-18) autorizada');
  const pub18 = PUBLICACAO.$origem['aprovacoes.publicacao'];
  for (const t of ['Titular, 11/11/2026', 'commit 2fdaed6', 'sem Bookings, envio automático, gateway de pagamento ou contratação automática', 'F5, aguardando resposta da Microsoft', 'minuta contratual a validar antes da primeira contratação', 'A autorização não comprova conformidade jurídica'])
    assert.ok(pub18.includes(t), `PUB-18 registra: ${t}`);
  assert.match(PUBLICACAO.$origem['aprovacoes.condicoesComerciais'], /Não abrange a minuta contratual nem a cláusula de retenção de 50%/);
  const pv = PUBLICACAO.$origem['aprovacoes.avisoDePrivacidade'];
  for (const t of ['Esta aprovação interna não constitui demonstração de conformidade jurídica.', 'Pendência F5 preservada', 'Nenhum mecanismo do art. 33 da LGPD está comprovado', 'A decisão de 06/11/2026 permanece válida.'])
    assert.ok(pv.includes(t), `PUB-09 registra: ${t}`);
  assert.equal(PUBLICACAO.avisoHomologacao, false, 'PUB-10: aviso de homologação desligado');
  assert.match(PUBLICACAO.$origem.avisoHomologacao, /Titular, 11\/11\/2026 .*PUB-10/);
  assert.deepEqual(PUBLICACAO.agendamento, { url: null, obrigatorio: false }, 'V1 inicial sem Bookings');
  assert.equal(PUBLICACAO.envioAutomatico.endpoint, null, 'sem envio automático');
  assert.deepEqual(PUBLICACAO.campanhaLancamento, { inicio: '2026-11-06', fim: '2027-01-06' }, 'datas históricas não alteradas');
  const portao = ler('scripts/verificar-publicacao.mjs');
  for (const id of ['PUB-19', 'PUB-17', 'PUB-09', 'PUB-18', 'PUB-10']) assert.match(portao, new RegExp(`need\\([^\\n]*'${id}'`), `${id} continua exigido`);
});

/* Coerência dos textos públicos com as decisões ------------------------ */
test('textos públicos coerentes com C-02, C-03, C-06, C-07 e C-12', () => {
  // Titular, 09/11/2026 (PUB-19): os 7 dias da assinatura não aparecem como espera obrigatória; o início vem da fila e da
  // proposta. O prazo de 7 dias para aceitar a proposta é outra regra e continua.
  assert.doesNotMatch(CONTENT, /começa depois de 7 dias|dias corridos da assinatura/);
  assert.match(CONTENT, /Demandas organizadas em fila: cada proposta informa as datas previstas de início e de disponibilização para homologação/);
  assert.match(CONTENT, /aceita em até 7 dias corridos da emissão/);
  assert.match(CONTENT, /devolvemos integralmente o valor pago pelo desenvolvimento/);
  // GOLIVE-001 (10/11/2026, publicação sem parecer externo): a regra dos 50% na homologação (C-04) não aparece no site
  // enquanto a retenção não estiver fundamentada (JUR-03). O site remete à proposta e ao contrato, com os direitos legais.
  assert.doesNotMatch(CONTENT, /devolvemos 50%|50% do valor já pago/, 'cláusula pública da C-04 fora do site');
  assert.match(CONTENT, /'Cancelamento, reembolso e garantia conforme a proposta e o contrato, preservados os direitos previstos em lei'/);
  assert.match(CONTENT, /A desistência não inclui a entrega definitiva da automação/);
  assert.doesNotMatch(CONTENT, /juridicamente válid|validade jurídica (confirmada|garantida)/i, 'sem promessa de validade jurídica');
  assert.doesNotMatch(CONTENT, /50% do (valor|preço) (total|do contrato)/);
  assert.match(CONTENT, /o silêncio não vale como aceite/);
  assert.match(CONTENT, /Garantia contratual de correção de defeitos, em termo escrito, além das garantias legais/);
  assert.doesNotMatch(CONTENT, /garantia adicional após a entrega, salvo se previstos/, 'a garantia contratual deixou de ser "não incluída"');
  assert.doesNotMatch(CONTENT, /retenção|multa por desistência|aceite tácito(?! )/i);
  assert.match(B2B, /Ter CNPJ \*\*não basta\*\*/);
  assert.equal(diaEmBrasilia('2026-11-06T02:00:00Z'), '2026-11-05');
});

/* =================================================================== */
/* NEKKORA-COM-CONTRACT-001-R1 — 30 cenários das decisões complementares */
/* =================================================================== */

const SIMPLES = 100_000; // R$ 1.000 (simples, lançamento)
const MEDIA = 280_000; // R$ 2.800 (média, lançamento)
const desistir = (o) => resultadoDaDesistencia({ ...DESISTENCIA, evidencias: CONCLUIDA, ...o });
const consumidor = (preco, pago, extra = {}) => desistir({ ...CONSUMIDOR, precoCentavos: preco, pagoANekkora: { desenvolvimento: pago }, ...extra });

/* C-04 (titular, 09/11/2026) ------------------------------------------ */
test('R1-1. desistência antes da conclusão → reembolso integral (C-03)', () => {
  const r = consumidor(SIMPLES, 50_000, { evidencias: { conclusaoComprovada: true } });
  assert.deepEqual([r.regra, r.restituirCentavos, r.cobrancaAdicionalCentavos], ['C-03', 50_000, 0]);
});

test('R1-2. exemplo da titular: contrato de R$ 2.000, entrada de R$ 1.000 → devolução de R$ 500', () => {
  const r = consumidor(200_000, 100_000);
  assert.deepEqual([r.regra, r.baseDeCalculoCentavos, r.restituirCentavos, r.retidoCentavos], ['C-04-homologacao', 100_000, 50_000, 50_000]);
  for (const t of [CONTRATO, PROPOSTA]) assert.match(t, /R\$ 2\.000/);
});

test('R1-3. a base é o valor PAGO, nunca o preço do contrato', () => {
  for (const [preco, pago, devolve] of [[SIMPLES, 50_000, 25_000], [MEDIA, 140_000, 70_000], [MEDIA, 280_000, 140_000], [MEDIA, 0, 0]]) {
    const r = consumidor(preco, pago);
    assert.equal(r.restituirCentavos, devolve, `preço ${preco}, pago ${pago}`);
    assert.equal(r.restituirCentavos + r.retidoCentavos, pago, 'retido + devolvido = pago');
    assert.equal(r.cobrancaAdicionalCentavos, 0, 'nunca cobra a diferença do preço');
  }
  assert.equal(consumidor(MEDIA, 100_001).restituirCentavos, 50_001, 'centavo ímpar a favor do cliente');
});

test('R1-4. CNPJ sem enquadramento demonstrado não muda nada; enquadramento continua obrigatório', () => {
  assert.throws(() => regimeDaContratacao({ cnpj: '00.000.000/0001-00' }), /enquadramento explícito obrigatório/);
  assert.throws(() => resultadoDaDesistencia({ precoCentavos: MEDIA, cnpj: '00.000.000/0001-00' }), /o CNPJ não define/);
  const r = desistir({ enquadramento: 'b2b-nao-consumerista', anexoB2B: { atividadeEconomicaPropria: true }, precoCentavos: MEDIA, pagoANekkora: { desenvolvimento: 140_000 } });
  assert.equal(r.regime, 'consumidor');
  assert.equal(r.restituirCentavos, 70_000);
  assert.ok(r.faltasDoAnexoB2B.length === 3);
  assert.match(B2B, /Ter CNPJ \*\*não basta\*\*/);
});

test('R1-5. transição: a homologação começa na disponibilização formal registrada, não na conclusão interna', () => {
  const semData = consumidor(MEDIA, 140_000, { evidencias: { conclusaoComprovada: true, criteriosDeAceiteCumpridos: true } });
  assert.deepEqual([semData.regra, semData.restituirCentavos], ['C-03', 140_000], 'concluída internamente, sem disponibilização: reembolso integral');
  const booleano = consumidor(MEDIA, 140_000, { evidencias: { conclusaoComprovada: true, criteriosDeAceiteCumpridos: true, disponibilizadaParaHomologacao: true } });
  assert.equal(booleano.regra, 'C-03', 'sem a DATA registrada, não vale');
  const antes = consumidor(MEDIA, 140_000, { desistenciaExpressaEm: '2027-01-04' });
  assert.equal(antes.regra, 'C-03', 'desistência antes da data de disponibilização');
  const noDia = consumidor(MEDIA, 140_000, { desistenciaExpressaEm: '2027-01-05' });
  assert.deepEqual([noDia.regra, noDia.disponibilizadaParaHomologacaoEm], ['C-04-homologacao', '2027-01-05']);
  assert.match(CONTRATO, /A conclusão interna da Nekkora, sozinha, \*\*não basta\*\*/);
});

test('R1-6. após o aceite formal, a C-04 não se aplica: valem as condições dessa etapa e a lei', () => {
  const r = consumidor(MEDIA, 140_000, { evidencias: { ...CONCLUIDA, aceiteFormalEm: '2027-01-08' } });
  assert.deepEqual([r.regra, r.restituirCentavos, r.cobrancaAdicionalCentavos], ['apos-aceite-formal', null, 0]);
  assert.match(r.observacao, /cláusulas 6, 12 e 13/);
  assert.equal(consumidor(MEDIA, 140_000, { evidencias: { ...CONCLUIDA, aceiteFormalEm: '2027-01-12' } }).regra, 'C-04-homologacao', 'desistência antes do aceite');
});

test('R1-7. arrependimento legal aplicável → restituição integral, mesmo durante a homologação', () => {
  const r = consumidor(MEDIA, 140_000, { arrependimentoLegal: true, pagoANekkora: { desenvolvimento: 140_000, outros: 3_000 }, pedidoValidoEm: '2026-12-18' });
  assert.deepEqual([r.regra, r.restituirCentavos], ['arrependimento-legal', 143_000]);
  assert.equal(r.prazo.tipo, 'imediato-legal');
});

test('R1-8. contestação fundamentada pendente → retenção suspensa; prazo de 10 dias úteis após as evidências', () => {
  const r = consumidor(MEDIA, 140_000, { evidencias: { ...CONCLUIDA, contestacaoPendente: true, comunicadasAoClienteEm: '2027-01-11' } });
  assert.equal(r.situacaoDaRetencao, 'suspensa-ate-analise-da-contestacao');
  assert.equal(r.prazoDeContestacao, '2027-01-25');
  assert.match(consumidor(MEDIA, 140_000).proximaAcao, /enviar as evidências/);
});

test('R1-9. defeito, critério de aceite não cumprido ou entrega incompleta → nunca a retenção da C-04', () => {
  for (const ev of [{ defeitoPendente: true }, { obrigacaoTecnicaPendente: true }, { criteriosDeAceiteCumpridos: false }, { disponibilizadaParaHomologacaoEm: undefined }]) {
    const r = consumidor(MEDIA, 140_000, { evidencias: { ...CONCLUIDA, ...ev } });
    assert.deepEqual([r.regra, r.restituirCentavos, r.cobrancaAdicionalCentavos], ['C-03', 140_000, 0], JSON.stringify(ev));
  }
});

test('R1-10. desistência durante a homologação: nada é entregue nem transferido sem quitação integral', () => {
  const r = consumidor(MEDIA, 140_000);
  assert.deepEqual([r.entrega.encerraContratacao, r.entrega.entregaDefinitiva, r.entrega.entregaveis, r.entrega.transferenciaDeDireitos], [true, false, [], false]);
  assert.match(CONTRATO, /encerra o desenvolvimento e a contratação daquela automação/);
  assert.match(CONTRATO, /pode concluir normalmente a contratação, com homologação, aceite formal e pagamento integral/);
  assert.match(CONTRATO, /esta redação não presume a sua validade/);
  // Sem desistência, a conclusão normal continua possível: o silêncio não encerra nada
  assert.equal(resultadoDaDesistencia({ ...CONSUMIDOR, precoCentavos: MEDIA, pagoANekkora: { desenvolvimento: 140_000 }, evidencias: CONCLUIDA }).regra, 'sem-desistencia-expressa');
  assert.match(COMPONENTES, /homologação \(contrato-base, cláusulas 9 e 10\), nada é entregue/);
  assert.doesNotMatch(CONTRATO, /A única outra hipótese de cobrança do saldo/);
});

test('R1-11. silêncio do cliente → jamais aceite nem desistência', () => {
  const r = resultadoDaDesistencia({ ...CONSUMIDOR, precoCentavos: MEDIA, pagoANekkora: { desenvolvimento: 140_000 }, evidencias: CONCLUIDA });
  assert.deepEqual([r.regra, r.desistencia, r.aceite, r.cobrancaAdicionalCentavos, r.restituirCentavos], ['sem-desistencia-expressa', false, false, 0, 0]);
  const h = situacaoDaHomologacao({ disponibilizadaEm: '2026-12-01', hoje: '2028-01-01', suspensaoRegistradaEm: '2026-12-16' });
  assert.deepEqual([h.aceiteTacito, h.desistenciaPresumida, h.cancelamentoAutomatico, h.segundaParcelaExigivel], [false, false, false, false]);
});

/* C-03 / C-06 / C-07 -------------------------------------------------- */
test('R1-12. reembolso voluntário em até 5 dias úteis; arrependimento legal continua imediato', () => {
  const op = prazoDaRestituicao({ pedidoValidoEm: '2026-12-18' });
  assert.deepEqual([op.tipo, op.ate], ['operacional', '2026-12-28'], '5 dias úteis, com o Natal');
  assert.match(op.ressalva, /prevalece a regra legal mais favorável/);
  const leg = prazoDaRestituicao({ pedidoValidoEm: '2026-12-18', arrependimentoLegal: true });
  assert.deepEqual([leg.tipo, leg.ate, leg.atualizacaoMonetaria], ['imediato-legal', '2026-12-18', true]);
  assert.equal(consumidor(MEDIA, 140_000, { evidencias: {}, pedidoValidoEm: '2026-12-18' }).prazo.ate, '2026-12-28');
  assert.equal(consumidor(MEDIA, 140_000, { pedidoValidoEm: '2026-12-18' }).prazo.ate, '2026-12-28', 'C-04: mesmo prazo de 5 dias úteis');
  assert.match(CONTRATO, /até \*\*5 dias úteis\*\*/);
  assert.match(CONTRATO, /não autoriza postergar/);
});

test('R1-13. 1º lembrete de homologação no 5º dia útil (com feriado informado)', () => {
  assert.equal(cronogramaDaHomologacao('2026-12-01').primeiroLembrete, '2026-12-08');
  assert.equal(cronogramaDaHomologacao('2026-12-01', ['2026-12-08']).primeiroLembrete, '2026-12-09', 'feriado local informado');
  assert.equal(situacaoDaHomologacao({ disponibilizadaEm: '2026-12-01', hoje: '2026-12-08' }).proximaAcao, '1º lembrete escrito (5º dia útil)');
  assert.match(CONTRATO, /5º dia útil/);
});

test('R1-14. 2º lembrete no 9º dia útil', () => {
  assert.equal(cronogramaDaHomologacao('2026-12-01').segundoLembrete, '2026-12-14');
  assert.equal(situacaoDaHomologacao({ disponibilizadaEm: '2026-12-01', hoje: '2026-12-14', lembretesEnviados: ['2026-12-08'] }).proximaAcao, '2º lembrete escrito (9º dia útil)');
  assert.match(CONTRATO, /9º dia útil/);
});

test('R1-15. suspensão no dia útil seguinte ao 10º, sem aceite tácito (fim de semana no meio)', () => {
  const b = { disponibilizadaEm: '2026-12-04', lembretesEnviados: ['2026-12-11', '2026-12-17'] };
  assert.equal(cronogramaDaHomologacao('2026-12-04').prazoFinal, '2026-12-18');
  assert.equal(situacaoDaHomologacao({ ...b, hoje: '2026-12-18' }).status, 'em-avaliacao', 'o 10º dia útil vai até o fim');
  assert.equal(situacaoDaHomologacao({ ...b, hoje: '2026-12-19' }).status, 'prazo-inicial-encerrado');
  const s = situacaoDaHomologacao({ ...b, hoje: '2026-12-21' });
  assert.equal(s.status, 'homologacao-suspensa-aguardando-cliente');
  assert.match(s.proximaAcao, /registrar a suspensão e enviar comunicação escrita/);
  assert.deepEqual([s.aceiteTacito, s.segundaParcelaExigivel], [false, false]);
});

test('R1-16. 30 dias corridos de suspensão → pedido de reprogramação formal, sem cancelamento automático', () => {
  const b = { disponibilizadaEm: '2026-12-01', suspensaoRegistradaEm: '2026-12-16' };
  const antes = situacaoDaHomologacao({ ...b, hoje: '2027-01-14' });
  assert.equal(antes.reprogramacaoEm, '2027-01-15');
  assert.match(antes.proximaAcao, /aguardar/);
  const depois = situacaoDaHomologacao({ ...b, hoje: '2027-01-15' });
  assert.equal(depois.status, 'homologacao-suspensa-aguardando-cliente');
  assert.match(depois.proximaAcao, /reprogramação formal \(sem cancelamento automático\)/);
  assert.equal(depois.cancelamentoAutomatico, false);
  assert.match(CONTRATO, /reprogramação formal/);
});

test('R1-17. correções com redisponibilização: nova data-base só com comunicação escrita', () => {
  const b = { disponibilizadaEm: '2026-12-01', manifestacaoEm: '2026-12-05' };
  assert.equal(situacaoDaHomologacao({ ...b, hoje: '2026-12-07' }).status, 'em-correcao');
  const ok = situacaoDaHomologacao({ ...b, hoje: '2026-12-11', redisponibilizacoes: [{ em: '2026-12-10', comunicadaEm: '2026-12-10' }] });
  assert.deepEqual([ok.status, ok.cronograma.dataBase, ok.cronograma.prazoFinal], ['em-avaliacao', '2026-12-10', '2026-12-24']);
  const silenciosa = situacaoDaHomologacao({ ...b, hoje: '2026-12-11', redisponibilizacoes: [{ em: '2026-12-10' }] });
  assert.equal(silenciosa.cronograma.dataBase, '2026-12-01', 'sem comunicação, o prazo não é reiniciado');
  assert.match(silenciosa.alertas[0], /NÃO foi reiniciado/);
  assert.match(CONTRATO, /nova data-base/);
});

test('R1-18. garantia: confirmação do recebimento em até 2 dias úteis', () => {
  assert.equal(atendimentoDaGarantia({ solicitadaEm: '2027-01-08' }).confirmarRecebimentoAte, '2027-01-12');
  assert.equal(atendimentoDaGarantia({ solicitadaEm: '2027-01-09T02:00:00Z' }).solicitadaEm, '2027-01-08', 'dia em Brasília');
  assert.match(GARANTIA, /até \*\*2 dias úteis\*\*/);
});

test('R1-19. garantia: diagnóstico inicial em até 5 dias úteis; correção com previsão própria, sem prazo máximo universal', () => {
  const g = atendimentoDaGarantia({ solicitadaEm: '2027-01-08' });
  assert.equal(g.diagnosticoInicialAte, '2027-01-15');
  assert.equal(g.prazoMaximoDeCorrecao, null);
  assert.match(g.previsaoDeCorrecao, /depois do diagnóstico/);
  assert.match(GARANTIA, /até \*\*5 dias úteis\*\*/);
  assert.match(GARANTIA, /não são prazo máximo de correção/);
});

test('R1-20. garantia contratual não reduz nem substitui a legal', () => {
  const c = { terminoDaExecucao: '2027-01-10', entregaDefinitiva: '2027-01-20', consumidor: true };
  const a = periodosDeReclamacao({ ...c, contagemContratual: 'apos-prazo-legal' });
  const b = periodosDeReclamacao({ ...c, contagemContratual: 'da-entrega-definitiva' });
  assert.deepEqual(a.legal, b.legal);
  assert.equal(a.contratual.adicionalAoLegal, true);
  assert.equal(b.contratual.adicionalAoLegal, false, 'contar da entrega sobrepõe-se ao prazo legal: não é adicional');
  assert.equal(a.contratual.termoInicial, 'depende-de-revisao-juridica');
  assert.match(GARANTIA, /não substitui, não reduz e não condiciona/);
  assert.match(GARANTIA, /mera sobreposição/);
  for (const t of [CONTENT, PROPOSTA, REGULAMENTO]) assert.doesNotMatch(t, /120 dias/, 'o termo só cita "120 dias" para proibir o anúncio');
});

/* C-10 / C-11 --------------------------------------------------------- */
test('R1-21. esforço de até 8 horas → simples', () => {
  for (const h of [1, 8]) assert.equal(classificarAutomacao({ horasEstimadas: h }).categoria, 'simples');
  assert.match(REGULAMENTO, /até 8 horas/);
});

test('R1-22. esforço acima de 8 até 16 horas → média', () => {
  for (const h of [8.5, 12, 16]) assert.equal(classificarAutomacao({ horasEstimadas: h }).categoria, 'media');
  assert.match(REGULAMENTO, /acima de 8 até 16 horas/);
});

test('R1-23. esforço acima de 16 horas → complexa', () => {
  assert.deepEqual([classificarAutomacao({ horasEstimadas: 16.5 }).categoria, classificarAutomacao({ horasEstimadas: 16.5 }).fundamento], ['complexa', 'esforco-estimado']);
  assert.throws(() => classificarAutomacao({ horasEstimadas: 0 }), /número positivo/);
  assert.match(REGULAMENTO, /acima de 16 horas/);
});

test('R1-24. risco excepcional demonstrado → complexa fundamentada; incompleto → recusado', () => {
  const ok = classificarAutomacao({ horasEstimadas: 10, riscoExcepcional: { justificativaTecnica: 'sistema legado instável sem ambiente de teste', fatosVerificaveis: ['3 indisponibilidades na avaliação'], informadoAoClienteAntesDoAceite: true } });
  assert.deepEqual([ok.categoria, ok.fundamento], ['complexa', 'risco-excepcional-justificado']);
  const semPrevia = classificarAutomacao({ horasEstimadas: 10, riscoExcepcional: { justificativaTecnica: 'x', fatosVerificaveis: ['y'] } });
  assert.equal(semPrevia.categoria, 'media', 'a exceção não serve para negar o preço promocional');
  assert.ok(semPrevia.excecaoRecusada.includes('informação prévia ao cliente, antes do aceite'));
  assert.match(REGULAMENTO, /não pode ser usada para negar o preço promocional/);
});

test('R1-25. contagem de APIs ou sistemas, sozinha, não eleva a categoria', () => {
  const r = classificarAutomacao({ horasEstimadas: 6, fatos: { sistemas: 3, apis: 2 } });
  assert.equal(r.categoria, 'simples');
  assert.deepEqual(r.fatosRegistrados, { sistemas: 3, apis: 2 });
  assert.match(REGULAMENTO, /contagem isolada/);
  assert.match(CONTENT, /Esforço técnico estimado/);
});

test('R1-26. preços promocionais e padrão da oferta anterior preservados (V-02); complexa sem desconto', () => {
  assert.deepEqual(PREVIOUS_PRICE_TABLE, { simples: { standard: 1500, launch: 1000 }, media: { standard: 3500, launch: 2800 } });
  assert.equal(precoDaAutomacao({ categoria: classificarAutomacao({ horasEstimadas: 8 }).categoria, recebidaEm: '2026-12-15T12:00:00Z', periodo: PERIODO }).centavos, 100_000);
  assert.equal(precoDaAutomacao({ categoria: classificarAutomacao({ horasEstimadas: 20 }).categoria, recebidaEm: '2026-12-15T12:00:00Z', periodo: PERIODO }).centavos, null);
});

test('R1-27. datas da campanha não alteradas nem inferidas', () => {
  // Decisão da titular de 09/11/2026 (D2/PUB-13): manter o período já gravado. Mudar as datas exige nova autorização.
  assert.deepEqual(PUBLICACAO.campanhaLancamento, { inicio: '2026-11-06', fim: '2027-01-06' }, 'datas mantidas pela titular intactas');
  assert.match(REGULAMENTO, /De \*\*06\/11\/2026 a 06\/01\/2027\*\*/, 'regulamento com as datas mantidas');
  assert.match(REGULAMENTO, /mantidas pela titular em 09\/11\/2026/);
  assert.doesNotMatch(REGULAMENTO, /Datas fixas pendentes/, 'regulamento sem a pendência antiga');
  assert.doesNotMatch(ler('scripts/comercial/regras-delivery.mjs'), /20\d\d-\d\d-\d\d/, 'nenhuma data fixa nas regras');
});

test('R1-28. juros simples sem capitalização; resultado sempre indicativo e sem presumir 1% a.m. fora do B2B', () => {
  const E = { valorCentavos: 140_000, vencimento: '2027-01-10', pagamentoEm: '2027-04-10' };
  const pf = encargosDeAtraso({ ...E, enquadramento: 'pf-nao-consumidor' });
  assert.equal(pf.jurosCentavos, 4_200, '3 meses × 1%, simples');
  assert.equal(pf.natureza, 'indicativo-pendente');
  assert.match(pf.pendencias[0], /teto legal de juros não confirmado/);
  const b2b = encargosDeAtraso({ ...E, enquadramento: 'b2b-nao-consumerista' });
  assert.deepEqual([b2b.natureza, b2b.juridicamenteConfirmado, b2b.capitalizacao], ['indicativo', false, false]);
  assert.throws(() => encargosDeAtraso({ ...E }), /enquadramento explícito/);
  assert.throws(() => encargosDeAtraso({ ...E, enquadramento: 'consumidor', tetoLegal: { taxaMensal: 0.004 } }), /base normativa e período de referência/);
});

test('R1-29. atualização monetária aplicada uma vez, sem duplicidade', () => {
  const E = { valorCentavos: 140_000, vencimento: '2027-01-10', pagamentoEm: '2027-02-09', enquadramento: 'b2b-nao-consumerista' };
  const ipca = { indice: 'IPCA', fatorAcumulado: 1.01, baseNormativa: 'CC art. 389, parágrafo único (exemplo sintético)', periodoDeReferencia: '2027-01' };
  const r = encargosDeAtraso({ ...E, atualizacao: ipca });
  assert.deepEqual([r.correcaoCentavos, r.multaCentavos, r.jurosCentavos, r.totalCentavos], [1_400, 2_828, 1_414, 145_642]);
  assert.equal(r.totalCentavos - r.correcaoCentavos - r.multaCentavos - r.jurosCentavos, E.valorCentavos, 'cada componente conta uma vez');
  assert.equal(encargosDeAtraso(E).atualizacaoMonetaria, 'nao-aplicada');
  assert.throws(() => encargosDeAtraso({ ...E, atualizacao: { ...ipca, indice: 'Selic' } }), /duplicidade/);
  assert.throws(() => encargosDeAtraso({ ...E, atualizacao: { indice: 'IPCA', fatorAcumulado: 1.01 } }), /base normativa/);
  assert.match(CONTRATO, /sem cumulação indevida/);
});

test('R1-30. portão de produção (execução real): tabela, textos e condições da COM-VITRINE-001 aprovadas pela titular; falta só a data de início (PUB-13)', () => {
  const r = spawnSync(process.execPath, [new URL('../verificar-publicacao.mjs', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')], { encoding: 'utf8' });
  // As aprovações da V1.0.0 (PUB-17/19/09 e PUB-10/18 em 11/11/2026) continuam gravadas; PUB-09/10/18 não são
  // acusadas. Titular, 12/11/2026: PUB-14, V-01, PUB-17 e PUB-19 aprovadas por impressão + registro próprio (commit
  // cf0e733). A data de início das novas condições (PUB-13) só é registrada no dia da publicação: o portão BLOQUEIA.
  const saida = r.stdout + r.stderr;
  assert.notEqual(r.status, 0, 'publicação bloqueada');
  for (const id of ['PUB-09', 'PUB-18', 'PUB-10']) assert.doesNotMatch(saida, new RegExp(`${id} —`), `${id} não pendente`);
  assert.match(saida, /- PUB-13 — data de início das novas condições/);
  assert.match(saida, /- PUB-13 — registro da data de início ausente ou divergente/);
  const ids = [...new Set([...saida.matchAll(/- ((?:PUB|V)-\d+) —/g)].map((m) => m[1]))].sort();
  assert.deepEqual(ids, ['PUB-13'], 'só a data de início, além das de build');
});

test('V-02. compromissos anteriores preservados; tabela da vitrine a partir da data de início; pacotes na proposta', () => {
  const NOVAS = { inicio: '2026-12-10' };
  // antes da data de início: oferta anterior (lançamento), com a tabela da vitrine só como sugestão
  const antes = precoDaAutomacao({ categoria: 'simples', recebidaEm: '2026-12-09T15:00:00Z', periodo: PERIODO, novasCondicoes: NOVAS });
  assert.deepEqual([antes.regra, antes.centavos], ['lancamento', 100_000]);
  assert.deepEqual(antes.condicaoMaisFavoravel, { centavos: 65_000, regra: 'tabela-vitrine', aplicada: false }, 'proposta ao cliente, nunca aplicada sozinha');
  // a partir da data de início: tabela da vitrine; complexa em avaliação individual
  const depois = precoDaAutomacao({ categoria: 'media', recebidaEm: '2026-12-10T03:00:00Z', periodo: PERIODO, novasCondicoes: NOVAS });
  assert.deepEqual([depois.regra, depois.centavos], ['tabela-vitrine', 140_000]);
  assert.equal(precoDaAutomacao({ categoria: 'complexa', recebidaEm: '2026-12-11T12:00:00Z', periodo: PERIODO, novasCondicoes: NOVAS }).regra, 'avaliacao-individual');
  // sem a data, só a regra anterior (nenhuma sugestão)
  const semData = precoDaAutomacao({ categoria: 'simples', recebidaEm: '2026-12-15T12:00:00Z', periodo: PERIODO });
  assert.deepEqual([semData.regra, semData.centavos, semData.condicaoMaisFavoravel], ['lancamento', 100_000, undefined]);
  // proposta: 4 simples + 1 média na tabela da vitrine → 1 pacote de 3 simples + 1 simples + 1 média; a anterior à parte
  const r = precosDaProposta(
    [
      ...['A', 'B', 'C', 'D'].map((nome) => ({ nome, categoria: 'simples', recebidaEm: '2026-12-12T12:00:00Z' })),
      { nome: 'E', categoria: 'media', recebidaEm: '2026-12-12T12:00:00Z' },
      { nome: 'F', categoria: 'simples', recebidaEm: '2026-12-05T12:00:00Z' },
    ],
    PERIODO,
    NOVAS,
  );
  assert.deepEqual(r.pacotes, [{ numero: 1, categoria: 'simples', nomes: ['A', 'B', 'C'], centavos: 150_000 }]);
  assert.equal(r.totalCentavos, 150_000 + 65_000 + 140_000 + 100_000, 'pacote + avulsa + média + oferta anterior');
  // categorias não se misturam: 2 simples + 1 média não formam pacote
  const misto = precosDaProposta(
    [
      { nome: 'A', categoria: 'simples', recebidaEm: '2026-12-12T12:00:00Z' },
      { nome: 'B', categoria: 'simples', recebidaEm: '2026-12-12T12:00:00Z' },
      { nome: 'C', categoria: 'media', recebidaEm: '2026-12-12T12:00:00Z' },
    ],
    PERIODO,
    NOVAS,
  );
  assert.deepEqual([misto.pacotes.length, misto.totalCentavos], [0, 65_000 * 2 + 140_000]);
});
