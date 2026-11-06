/**
 * Regras operacionais das condições comerciais do Nekkora Delivery (NEKKORA-COM-CONTRACT-001).
 *
 * Tradução executável das diretrizes C-01 a C-12 da titular, na redação proposta em
 * docs/comercial/contrato-base-delivery.md. Serve para TESTAR que as regras são coerentes entre si e para apoiar a
 * operação (prazos, reembolso, encargos). NÃO é cláusula contratual, NÃO decide casos concretos e NÃO substitui a
 * revisão jurídica: onde a exigibilidade depende de avaliação jurídica, a função devolve essa condição em vez de
 * presumir o resultado.
 *
 * Sem dependências além de src/precos.ts (tabela oficial, lida sem alteração). Valores em CENTAVOS (inteiros).
 * Datas como 'AAAA-MM-DD' no calendário de Brasília. Contagem de prazos: exclui o dia do começo e inclui o do
 * vencimento (CC art. 132), salvo regra própria indicada.
 */
import { PRICE_TABLE, campaignState } from '../../src/precos.ts';

/* ------------------------------------------------------------------ */
/* Calendário                                                         */
/* ------------------------------------------------------------------ */

/**
 * Feriados nacionais fixos em lei federal (1/1, 21/4, 1/5, 7/9, 12/10, 2/11, 15/11, 20/11, 25/12). Feriados estaduais,
 * municipais e religiosos (ex.: Sexta-feira Santa, Corpus Christi, 9/7 e 25/1 em São Paulo) e pontos facultativos NÃO
 * estão aqui: a cobrança e a proposta sempre trazem a data explícita, e o operador pode passar feriados extras.
 */
const FERIADOS_FIXOS = ['01-01', '04-21', '05-01', '09-07', '10-12', '11-02', '11-15', '11-20', '12-25'];

const paraData = (iso) => new Date(`${iso}T12:00:00Z`);
const paraIso = (d) => d.toISOString().slice(0, 10);
const somarUmDia = (iso) => {
  const d = paraData(iso);
  d.setUTCDate(d.getUTCDate() + 1);
  return paraIso(d);
};

export function ehDiaUtil(iso, feriadosExtras = []) {
  const dia = paraData(iso).getUTCDay();
  return dia !== 0 && dia !== 6 && !FERIADOS_FIXOS.includes(iso.slice(5)) && !feriadosExtras.includes(iso);
}

/** Último dia de um prazo de N dias corridos contado de `inicio` (exclui o dia do começo). */
export function somarDiasCorridos(inicio, n) {
  const d = paraData(inicio);
  d.setUTCDate(d.getUTCDate() + n);
  return paraIso(d);
}

/** Último dia de um prazo de N dias úteis contado de `inicio` (exclui o dia do começo). */
export function somarDiasUteis(inicio, n, feriadosExtras = []) {
  let iso = inicio;
  let restantes = n;
  while (restantes > 0) {
    iso = somarUmDia(iso);
    if (ehDiaUtil(iso, feriadosExtras)) restantes -= 1;
  }
  return iso;
}

/** Dia do calendário de Brasília em que um instante ocorreu (ex.: recebimento de um e-mail). */
export const diaEmBrasilia = (instante) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(instante));

/* ------------------------------------------------------------------ */
/* C-10 — campanha, classificação e validade da proposta               */
/* ------------------------------------------------------------------ */

export const VALIDADE_PROPOSTA_DIAS = 7;

/**
 * Preço de uma automação conforme a data de RECEBIMENTO da solicitação (não a da proposta) e a categoria registrada
 * na proposta com os critérios publicados. Período `{ inicio, fim }` aprovado pela titular (nunca calculado aqui).
 * Complexa: sempre orçamento individual, sem desconto automático.
 */
export function precoDaAutomacao({ categoria, recebidaEm, periodo }) {
  if (categoria === 'complexa') return { categoria, centavos: null, regra: 'orcamento-individual', campanha: false };
  if (!(categoria in PRICE_TABLE)) throw new Error(`categoria desconhecida: ${categoria}`);
  const dia = diaEmBrasilia(recebidaEm);
  const vigente = Boolean(periodo?.inicio && periodo?.fim) && campaignState(periodo, dia) === 'vigente';
  const { standard, launch } = PRICE_TABLE[categoria];
  return { categoria, centavos: (vigente ? launch : standard) * 100, regra: vigente ? 'lancamento' : 'padrao', campanha: vigente, diaDoRecebimento: dia };
}

/** Várias automações: cada uma com categoria e preço próprios; a soma nunca reclassifica nenhuma delas. */
export function precosDaProposta(automacoes, periodo) {
  const itens = automacoes.map((a) => ({ nome: a.nome, ...precoDaAutomacao({ ...a, periodo }) }));
  const precificados = itens.filter((i) => i.centavos != null);
  return { itens, totalCentavos: precificados.reduce((s, i) => s + i.centavos, 0), semValor: itens.filter((i) => i.centavos == null).map((i) => i.nome) };
}

/** Último dia em que a proposta pode ser aceita: 7 dias corridos a partir da emissão (inclusive o último). */
export const ultimoDiaDeAceite = (emissao) => somarDiasCorridos(emissao, VALIDADE_PROPOSTA_DIAS);
export const propostaAceitavel = (emissao, aceiteEm) => diaEmBrasilia(aceiteEm) <= ultimoDiaDeAceite(emissao);

/* ------------------------------------------------------------------ */
/* C-02 / C-12 — início do desenvolvimento e cronograma                 */
/* ------------------------------------------------------------------ */

export const ESPERA_INICIAL_DIAS = 7;

/** Primeiro dia em que o desenvolvimento pode começar: depois de transcorridos 7 dias corridos da assinatura. */
export const inicioMinimoDoDesenvolvimento = (assinatura) => somarUmDia(somarDiasCorridos(assinatura, ESPERA_INICIAL_DIAS));

/** Cada automação: escopo, preço, início e homologação previstos, dependências e critérios de aceite (C-12). */
export function validarCronograma({ assinatura, inicioPrevisto, homologacaoPrevista, dependencias, criteriosDeAceite, precoCentavos, escopo }) {
  const faltas = [];
  if (!escopo) faltas.push('escopo próprio');
  if (!Number.isInteger(precoCentavos) || precoCentavos <= 0) faltas.push('preço próprio');
  if (!inicioPrevisto) faltas.push('data prevista de início');
  else if (inicioPrevisto < inicioMinimoDoDesenvolvimento(assinatura)) faltas.push(`início antes de ${inicioMinimoDoDesenvolvimento(assinatura)} (7 dias da assinatura, C-02)`);
  if (!homologacaoPrevista || (inicioPrevisto && homologacaoPrevista <= inicioPrevisto)) faltas.push('data prevista de disponibilização para homologação, depois do início');
  if (!Array.isArray(dependencias)) faltas.push('dependências informadas (lista, mesmo vazia)');
  if (!Array.isArray(criteriosDeAceite) || criteriosDeAceite.length === 0) faltas.push('critérios objetivos de aceite');
  return { valido: faltas.length === 0, faltas };
}

/** Mudança de cronograma: motivo, comunicação escrita e concordância escrita do cliente (C-12). */
export function validarAlteracaoDePrazo({ motivo, comunicadaPorEscritoEm, concordanciaEscritaEm }) {
  const faltas = [];
  if (!motivo) faltas.push('motivo');
  if (!comunicadaPorEscritoEm) faltas.push('comunicação por escrito');
  if (!concordanciaEscritaEm) faltas.push('concordância escrita do cliente');
  return { valida: faltas.length === 0, faltas };
}

/* ------------------------------------------------------------------ */
/* C-02 / C-03 / C-04 — desistência, reembolso e cobrança               */
/* ------------------------------------------------------------------ */

/**
 * Resultado de um pedido de desistência. Entradas (centavos):
 *   precoCentavos; pagoANekkora { desenvolvimento, outros }; despesas pagas pelo cliente direto a terceiros não entram.
 *   arrependimentoLegal: o pedido está dentro de um direito legal de arrependimento (avaliado caso a caso, C-02);
 *   motivoAtribuivelANekkora: defeito, descumprimento ou atraso da Nekkora (CDC art. 20 / CC art. 475);
 *   evidencias { conclusaoComprovada, disponibilizadaParaHomologacao, defeitoPendente, contestacaoPendente }.
 * Nunca registra aceite: a desistência após a conclusão (C-04) não é aceite e não transforma silêncio em nada.
 */
export function resultadoDaDesistencia({ precoCentavos, pagoANekkora = {}, arrependimentoLegal = false, motivoAtribuivelANekkora = false, evidencias = {} }) {
  const dev = pagoANekkora.desenvolvimento ?? 0;
  const outros = pagoANekkora.outros ?? 0;
  const base = { aceite: false, despesasPagasDiretamenteATerceiros: 'fora do reembolso da Nekkora (C-03), salvo culpa da Nekkora' };
  if (arrependimentoLegal) {
    return { ...base, regra: 'arrependimento-legal', restituirCentavos: dev + outros, cobrarAteCentavos: 0, prazo: 'imediato, com atualização monetária (CDC art. 49, parágrafo único)' };
  }
  if (motivoAtribuivelANekkora) {
    return { ...base, regra: 'vicio-ou-descumprimento', restituirAteCentavos: dev + outros, cobrarAteCentavos: 0, escolhaDoCliente: ['reexecução', 'restituição imediata', 'abatimento proporcional'], observacao: 'CDC art. 20; perdas e danos conforme a lei' };
  }
  const concluida = evidencias.conclusaoComprovada === true && evidencias.disponibilizadaParaHomologacao === true && evidencias.defeitoPendente !== true;
  if (!concluida) {
    return { ...base, regra: 'C-03', restituirCentavos: dev, cobrarAteCentavos: 0, observacao: 'reembolso integral do que foi pago pelo desenvolvimento, mesmo com o trabalho iniciado; sem apuração por horas ou marcos' };
  }
  return {
    ...base,
    regra: 'C-04',
    restituirCentavos: 0,
    cobrarAteCentavos: Math.max(precoCentavos - dev, 0),
    exigibilidade: evidencias.contestacaoPendente ? 'suspensa-ate-analise-da-contestacao' : 'depende-de-revisao-juridica',
    entregaAposQuitacao: true,
    observacao: 'cobrança do preço do serviço concluído, não multa nem retenção; garantias legais e contratual preservadas',
  };
}

/* ------------------------------------------------------------------ */
/* C-06 — homologação                                                   */
/* ------------------------------------------------------------------ */

export const PRAZO_HOMOLOGACAO_DIAS_UTEIS = 10;
export const RODADAS_DE_PREFERENCIA = 2;

/**
 * Situação da homologação em `hoje`. `intervaloLembretesDiasUteis` é PROPOSTA do agente (padrão 5), a confirmar pela
 * titular. Só o aceite expresso conclui a homologação e torna exigível a 2ª parcela; o silêncio nunca.
 */
export function situacaoDaHomologacao({ disponibilizadaEm, hoje, aceiteExpressoEm = null, ultimaManifestacaoEm = null, lembretesEnviados = [], intervaloLembretesDiasUteis = 5, feriadosExtras = [] }) {
  if (aceiteExpressoEm) return { status: 'aceita', segundaParcelaExigivel: true };
  const referencia = ultimaManifestacaoEm && ultimaManifestacaoEm > disponibilizadaEm ? ultimaManifestacaoEm : disponibilizadaEm;
  const prazoFinal = somarDiasUteis(referencia, PRAZO_HOMOLOGACAO_DIAS_UTEIS, feriadosExtras);
  const base = { prazoFinal, segundaParcelaExigivel: false, aceiteTacito: false };
  if (hoje <= prazoFinal) return { ...base, status: ultimaManifestacaoEm ? 'em-correcao-ou-reavaliacao' : 'em-avaliacao' };
  const enviados = lembretesEnviados.filter((d) => d > referencia).sort();
  if (enviados.length === 0) return { ...base, status: 'aguardando-cliente', proximaAcao: '1º lembrete escrito' };
  const proximo = somarDiasUteis(enviados[enviados.length - 1], intervaloLembretesDiasUteis, feriadosExtras);
  if (enviados.length === 1) return { ...base, status: 'aguardando-cliente', proximaAcao: hoje > proximo ? '2º lembrete escrito' : `aguardar até ${proximo}` };
  if (hoje <= proximo) return { ...base, status: 'aguardando-cliente', proximaAcao: `aguardar até ${proximo}` };
  return { ...base, status: 'homologacao-suspensa-aguardando-cliente', proximaAcao: 'registrar a suspensão por escrito; não cobrar a 2ª parcela' };
}

/** Defeito × ajuste de preferência × nova funcionalidade (C-06 / C-08). */
export function tratamentoDaSolicitacao({ tipo, rodadasDePreferenciaJaUsadas = 0 }) {
  if (tipo === 'defeito') return { incluido: true, custo: 0, limiteDeRodadas: null, instrumento: 'correção' };
  if (tipo === 'preferencia') {
    return rodadasDePreferenciaJaUsadas < RODADAS_DE_PREFERENCIA
      ? { incluido: true, custo: 0, rodada: rodadasDePreferenciaJaUsadas + 1, instrumento: 'ajuste dentro do escopo' }
      : { incluido: false, instrumento: 'aditivo ou nova proposta, com orçamento aprovado antes da execução' };
  }
  if (tipo === 'nova-funcionalidade') return { incluido: false, instrumento: 'aditivo ou nova proposta, com orçamento aprovado antes da execução' };
  throw new Error(`tipo desconhecido: ${tipo}`);
}

/* ------------------------------------------------------------------ */
/* C-07 — garantia legal × cobertura contratual                         */
/* ------------------------------------------------------------------ */

export const COBERTURA_CONTRATUAL_DIAS = 30;

/**
 * Períodos de reclamação. O legal (cliente consumidor, serviço durável: 90 dias do término da execução, CDC art. 26,
 * II e §1º) é calculado SEM depender da opção contratual. A contagem dos 30 dias contratuais está pendente de revisão
 * jurídica: 'apos-prazo-legal' (proposta do agente) ou 'da-entrega-definitiva'. Vício oculto: o prazo legal só começa
 * quando o defeito fica evidenciado (CDC art. 26, §3º) — não modelado como data.
 */
export function periodosDeReclamacao({ terminoDaExecucao, entregaDefinitiva, consumidor, contagemContratual }) {
  const legal = consumidor
    ? { inicio: terminoDaExecucao, fim: somarDiasCorridos(terminoDaExecucao, 90), base: 'CDC art. 26, II e §1º (interpretação: serviço durável)' }
    : { inicio: terminoDaExecucao, fim: null, base: 'Código Civil e contrato — revisão jurídica' };
  let contratual;
  if (contagemContratual === 'apos-prazo-legal' && legal.fim) contratual = { inicio: legal.fim, fim: somarDiasCorridos(legal.fim, COBERTURA_CONTRATUAL_DIAS) };
  else contratual = { inicio: entregaDefinitiva, fim: somarDiasCorridos(entregaDefinitiva, COBERTURA_CONTRATUAL_DIAS) };
  return { legal, contratual, vicioOculto: 'prazo legal a partir da evidência do defeito (CDC art. 26, §3º)' };
}

/* ------------------------------------------------------------------ */
/* C-11 — parcelas e atraso                                             */
/* ------------------------------------------------------------------ */

export const PRAZO_PAGAMENTO_DIAS_UTEIS = 5;

export const parcelas = (precoCentavos) => {
  const primeira = Math.round(precoCentavos / 2);
  return { primeira, segunda: precoCentavos - primeira };
};

export const vencimentoDaParcela = (cobrancaEm, feriadosExtras = []) => somarDiasUteis(cobrancaEm, PRAZO_PAGAMENTO_DIAS_UTEIS, feriadosExtras);

/**
 * Encargos de atraso conforme a diretriz: multa única de 2% + juros SIMPLES de 1% ao mês pro rata die (mês de 30
 * dias), sem capitalização. `limiteJurosMensal` permite aplicar um teto legal menor (ex.: Lei de Usura para cliente que
 * não é pessoa jurídica — ver relatório CONTRACT-001, C-11). Contestação fundamentada pendente suspende a cobrança.
 */
export function encargosDeAtraso({ valorCentavos, vencimento, pagamentoEm, dispensa = false, contestacaoPendente = false, jurosMensal = 0.01, limiteJurosMensal = null, multa = 0.02 }) {
  const dias = Math.max(0, Math.round((paraData(pagamentoEm) - paraData(vencimento)) / 86_400_000));
  if (contestacaoPendente) return { diasDeAtraso: dias, multaCentavos: 0, jurosCentavos: 0, totalCentavos: valorCentavos, situacao: 'cobrança do valor controvertido suspensa até a análise' };
  if (dias === 0 || dispensa) return { diasDeAtraso: dias, multaCentavos: 0, jurosCentavos: 0, totalCentavos: valorCentavos, situacao: dias ? 'encargos dispensados' : 'em dia' };
  const taxa = limiteJurosMensal == null ? jurosMensal : Math.min(jurosMensal, limiteJurosMensal);
  const multaCentavos = Math.round(valorCentavos * multa);
  const jurosCentavos = Math.round((valorCentavos * taxa * dias) / 30);
  return { diasDeAtraso: dias, multaCentavos, jurosCentavos, totalCentavos: valorCentavos + multaCentavos + jurosCentavos, situacao: 'em atraso', capitalizacao: false };
}
