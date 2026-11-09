/**
 * Regras operacionais das condições comerciais do Nekkora Delivery (NEKKORA-COM-CONTRACT-001 e R1).
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

/**
 * Cada automação: escopo, preço, início e homologação previstos, dependências e critérios de aceite (C-12).
 * Sem espera fixa depois da assinatura (titular, 09/11/2026, C-02 alterada): o início é a data da proposta, conforme a
 * fila, e só não pode ser anterior à assinatura.
 */
export function validarCronograma({ assinatura, inicioPrevisto, homologacaoPrevista, dependencias, criteriosDeAceite, precoCentavos, escopo }) {
  const faltas = [];
  if (!escopo) faltas.push('escopo próprio');
  if (!Number.isInteger(precoCentavos) || precoCentavos <= 0) faltas.push('preço próprio');
  if (!inicioPrevisto) faltas.push('data prevista de início');
  else if (assinatura && inicioPrevisto < assinatura) faltas.push(`início antes da assinatura (${assinatura})`);
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
/* C-10 — classificação por esforço técnico estimado (R1)               */
/* ------------------------------------------------------------------ */

/**
 * Parâmetros iniciais aprovados pela titular (CONTRACT-001-R1, C-10): esforço técnico ESTIMADO de UMA automação, não
 * tempo de espera na fila. Simples: até 8 h · Média: acima de 8 até 16 h · Complexa: acima de 16 h.
 */
export const LIMITES_DE_ESFORCO_HORAS = Object.freeze({ simples: 8, media: 16 });

/**
 * Classificação inicial. `fatos` (sistemas, integrações, regras, volume, dependências, estabilidade, infraestrutura,
 * licenciamento, riscos, testes) são REGISTRADOS e fundamentam a estimativa de horas, mas nunca mudam a categoria por
 * contagem isolada (ex.: duas APIs simples não tornam a automação complexa). A única elevação fora das horas é a
 * complexa por `riscoExcepcional`, que exige justificativa técnica, fatos verificáveis e informação ao cliente antes do
 * aceite; incompleto, a exceção é recusada e vale a categoria pelo esforço (não serve para negar o preço promocional).
 */
export function classificarAutomacao({ horasEstimadas, fatos = {}, riscoExcepcional = null }) {
  if (typeof horasEstimadas !== 'number' || !Number.isFinite(horasEstimadas) || horasEstimadas <= 0) {
    throw new Error('horasEstimadas: número positivo obrigatório (estimativa justificada por fatos observáveis)');
  }
  const porEsforco = horasEstimadas <= LIMITES_DE_ESFORCO_HORAS.simples ? 'simples' : horasEstimadas <= LIMITES_DE_ESFORCO_HORAS.media ? 'media' : 'complexa';
  const base = { horasEstimadas, categoriaPorEsforco: porEsforco, fatosRegistrados: fatos, referencia: 'esforço técnico estimado da automação, não tempo de fila' };
  if (!riscoExcepcional || porEsforco === 'complexa') return { ...base, categoria: porEsforco, fundamento: 'esforco-estimado' };
  const faltas = [];
  if (!riscoExcepcional.justificativaTecnica) faltas.push('justificativa técnica excepcional');
  if (!Array.isArray(riscoExcepcional.fatosVerificaveis) || riscoExcepcional.fatosVerificaveis.length === 0) faltas.push('fatos verificáveis');
  if (riscoExcepcional.informadoAoClienteAntesDoAceite !== true) faltas.push('informação prévia ao cliente, antes do aceite');
  if (faltas.length) return { ...base, categoria: porEsforco, fundamento: 'esforco-estimado', excecaoRecusada: faltas };
  return { ...base, categoria: 'complexa', fundamento: 'risco-excepcional-justificado', justificativa: riscoExcepcional.justificativaTecnica, fatosVerificaveis: riscoExcepcional.fatosVerificaveis };
}

/* ------------------------------------------------------------------ */
/* C-01 — enquadramento jurídico (explícito, nunca pelo CNPJ)           */
/* ------------------------------------------------------------------ */

export const ENQUADRAMENTOS = Object.freeze(['consumidor', 'b2b-nao-consumerista']);
/** Os quatro itens cumulativos do Anexo B2B §1. */
export const CRITERIOS_DO_ANEXO_B2B = Object.freeze(['atividadeEconomicaPropria', 'automacaoComoInsumo', 'estruturaParaNegociar', 'justificativaAssinadaEAceita']);

/**
 * O enquadramento é DECLARADO na proposta, nunca inferido (ter CNPJ não basta). 'b2b-nao-consumerista' só vale com os
 * quatro itens do Anexo B2B; faltando qualquer um, o regime é o do contrato-base (consumidor).
 */
export function regimeDaContratacao({ enquadramento, anexoB2B = {} } = {}) {
  if (!ENQUADRAMENTOS.includes(enquadramento)) {
    throw new Error(`enquadramento explícito obrigatório (${ENQUADRAMENTOS.join(' | ')}); o CNPJ não define o regime`);
  }
  if (enquadramento === 'consumidor') return { regime: 'consumidor', b2bValido: false };
  const faltas = CRITERIOS_DO_ANEXO_B2B.filter((k) => anexoB2B[k] !== true);
  if (faltas.length) return { regime: 'consumidor', b2bValido: false, faltas, observacao: 'Anexo B2B incompleto: vale o contrato-base (na dúvida, consumidor)' };
  return { regime: 'b2b-nao-consumerista', b2bValido: true };
}

/* ------------------------------------------------------------------ */
/* C-02 / C-03 / C-04 — desistência, reembolso e cobrança               */
/* ------------------------------------------------------------------ */

export const PRAZO_REEMBOLSO_DIAS_UTEIS = 5;
/** C-04 consumidor: parcela do preço reservada, NA PROPOSTA, às etapas de homologação assistida e entrega. */
export const RESERVA_ETAPAS_FINAIS_PERCENTUAL = 10;
export const PRAZO_CONTESTACAO_DIAS_UTEIS = 10;

export const reservaDasEtapasFinais = (precoCentavos) => Math.round((precoCentavos * RESERVA_ETAPAS_FINAIS_PERCENTUAL) / 100);

/**
 * Prazo de restituição (C-03, R1). Arrependimento legal: imediato, com atualização monetária (CDC art. 49, p.ú.) —
 * o prazo operacional de 5 dias úteis NUNCA o posterga. Demais casos: até 5 dias úteis do pedido válido.
 */
export function prazoDaRestituicao({ pedidoValidoEm, arrependimentoLegal = false, feriadosExtras = [] }) {
  const comum = { confirmarERegistrarOPedido: true, comprovanteDeDevolucao: true };
  if (arrependimentoLegal) return { ...comum, tipo: 'imediato-legal', ate: pedidoValidoEm, atualizacaoMonetaria: true, base: 'CDC art. 49, parágrafo único' };
  return {
    ...comum,
    tipo: 'operacional',
    ate: pedidoValidoEm ? somarDiasUteis(pedidoValidoEm, PRAZO_REEMBOLSO_DIAS_UTEIS, feriadosExtras) : null,
    ressalva: 'se a lei exigir restituição imediata ou atualização, prevalece a regra legal mais favorável',
  };
}

/** Entregáveis do desenvolvimento concluído, disponibilizados após a quitação do valor validamente apurado (C-04, 1.4). */
export const ENTREGAVEIS_APOS_DESISTENCIA = Object.freeze([
  'código-fonte específico concluído',
  'documentação técnica prevista na proposta',
  'relatório de testes técnicos por critério de aceite',
  'Anexo de Componentes preenchido (licença dos componentes preexistentes)',
]);
/** Etapas não executadas por causa da desistência (cobertas pela reserva de 10% no regime consumidor). */
export const ETAPAS_NAO_EXECUTADAS = Object.freeze(['homologação assistida', 'entrega acompanhada']);

/**
 * Resultado de um pedido de desistência. Entradas (centavos):
 *   precoCentavos; enquadramento + anexoB2B (regimeDaContratacao); reservaNaPropostaCentavos (consumidor: a reserva
 *   das etapas finais que CONSTAVA da proposta — nunca fixada depois);
 *   pagoANekkora { desenvolvimento, outros } (despesas pagas pelo cliente direto a terceiros não entram);
 *   desistenciaExpressaEm (declaração escrita; sem ela não há desistência); pedidoValidoEm (prazo de restituição);
 *   arrependimentoLegal; motivoAtribuivelANekkora;
 *   evidencias { conclusaoComprovada, criteriosDeAceiteCumpridos, disponibilizadaParaHomologacao, defeitoPendente,
 *                obrigacaoTecnicaPendente, comunicadasAoClienteEm, contestacaoPendente }.
 * Na C-04 devolve TETOS PRETENDIDOS, nunca valor autorizado: `exigibilidade` é 'depende-de-revisao-juridica' (ou
 * suspensa por contestação) e `autorizadoParaFaturamento` é sempre false. Nunca registra aceite.
 */
export function resultadoDaDesistencia({
  precoCentavos,
  enquadramento,
  anexoB2B,
  reservaNaPropostaCentavos = null,
  pagoANekkora = {},
  desistenciaExpressaEm = null,
  pedidoValidoEm = null,
  arrependimentoLegal = false,
  motivoAtribuivelANekkora = false,
  evidencias = {},
  feriadosExtras = [],
}) {
  const { regime, ...enq } = regimeDaContratacao({ enquadramento, anexoB2B });
  const dev = pagoANekkora.desenvolvimento ?? 0;
  const outros = pagoANekkora.outros ?? 0;
  const base = {
    regime,
    ...(enq.faltas ? { faltasDoAnexoB2B: enq.faltas } : {}),
    aceite: false,
    autorizadoParaFaturamento: false,
    despesasPagasDiretamenteATerceiros: 'fora do reembolso da Nekkora (C-03), salvo culpa da Nekkora',
  };
  if (!desistenciaExpressaEm && !arrependimentoLegal) {
    return { ...base, regra: 'sem-desistencia-expressa', desistencia: false, restituirCentavos: 0, saldoMaximoPretendidoCentavos: 0, observacao: 'o silêncio não é aceite nem desistência: o contrato segue (homologação: situacaoDaHomologacao)' };
  }
  if (arrependimentoLegal) {
    return { ...base, regra: 'arrependimento-legal', desistencia: true, restituirCentavos: dev + outros, saldoMaximoPretendidoCentavos: 0, prazo: prazoDaRestituicao({ pedidoValidoEm, arrependimentoLegal: true }) };
  }
  if (motivoAtribuivelANekkora) {
    return { ...base, regra: 'vicio-ou-descumprimento', desistencia: true, restituirAteCentavos: dev + outros, saldoMaximoPretendidoCentavos: 0, escolhaDoCliente: ['reexecução', 'restituição imediata', 'abatimento proporcional'], observacao: 'CDC art. 20; perdas e danos conforme a lei' };
  }
  const e = evidencias;
  const concluida = e.conclusaoComprovada === true && e.criteriosDeAceiteCumpridos === true && e.disponibilizadaParaHomologacao === true && e.defeitoPendente !== true && e.obrigacaoTecnicaPendente !== true;
  if (!concluida) {
    return {
      ...base,
      regra: 'C-03',
      desistencia: true,
      restituirCentavos: dev,
      saldoMaximoPretendidoCentavos: 0,
      prazo: prazoDaRestituicao({ pedidoValidoEm, feriadosExtras }),
      observacao: 'reembolso integral do que foi pago pelo desenvolvimento, mesmo com o trabalho iniciado; defeito ou entrega incompleta nunca levam à C-04',
    };
  }
  let tetoPretendidoCentavos;
  let reservaCentavos = 0;
  if (regime === 'consumidor') {
    const minima = reservaDasEtapasFinais(precoCentavos);
    if (!Number.isInteger(reservaNaPropostaCentavos) || reservaNaPropostaCentavos < minima) {
      return { ...base, regra: 'C-04-sem-reserva-previa', desistencia: true, restituirCentavos: null, saldoMaximoPretendidoCentavos: 0, exigibilidade: 'depende-de-revisao-juridica', observacao: `a proposta não reservou ${RESERVA_ETAPAS_FINAIS_PERCENTUAL}% às etapas finais: a reserva não pode ser fixada depois da desistência; não cobrar e consultar` };
    }
    reservaCentavos = reservaNaPropostaCentavos;
    tetoPretendidoCentavos = precoCentavos - reservaCentavos;
  } else {
    tetoPretendidoCentavos = precoCentavos;
  }
  return {
    ...base,
    regra: regime === 'consumidor' ? 'C-04-consumidor' : 'C-04-b2b',
    desistencia: true,
    tetoPretendidoCentavos,
    reservaNaoCobravelCentavos: reservaCentavos,
    saldoMaximoPretendidoCentavos: Math.max(tetoPretendidoCentavos - dev, 0),
    restituirCentavos: Math.max(dev - tetoPretendidoCentavos, 0),
    exigibilidade: e.contestacaoPendente ? 'suspensa-ate-analise-da-contestacao' : 'depende-de-revisao-juridica',
    prazoDeContestacao: e.comunicadasAoClienteEm ? somarDiasUteis(e.comunicadasAoClienteEm, PRAZO_CONTESTACAO_DIAS_UTEIS, feriadosExtras) : null,
    ...(e.comunicadasAoClienteEm ? {} : { proximaAcao: `enviar as evidências ao cliente; ${PRAZO_CONTESTACAO_DIAS_UTEIS} dias úteis para contestar` }),
    entrega: { entregaveis: ENTREGAVEIS_APOS_DESISTENCIA, etapasNaoExecutadas: ETAPAS_NAO_EXECUTADAS, exigeAReserva: false },
    ...(regime === 'b2b-nao-consumerista' ? { obrigacoesPendentes: 'relação dos 100% com homologação e entrega não executadas: depende de revisão jurídica' } : {}),
    observacao: 'teto pretendido do preço do serviço concluído, não multa, retenção nem presunção de aceite; garantias legais preservadas',
  };
}

/**
 * Liberação dos entregáveis após a desistência (C-04, 1.4): basta quitar o valor VALIDAMENTE APURADO (até o teto
 * pretendido, depois da contestação e da revisão jurídica). No regime consumidor, a reserva das etapas não executadas
 * nunca é condição para receber o que já foi remunerado.
 */
export function entregaAposQuitacao({ resultado, valorApuradoCentavos, pagoCentavos, contestacaoPendente = false }) {
  if (!resultado?.regra?.startsWith('C-04-') || resultado.tetoPretendidoCentavos == null) throw new Error('só se aplica a resultado C-04 com teto');
  if (valorApuradoCentavos > resultado.tetoPretendidoCentavos) throw new Error('valor apurado acima do teto pretendido');
  const quitado = !contestacaoPendente && pagoCentavos >= valorApuradoCentavos;
  return {
    liberar: quitado,
    entregaveis: quitado ? ENTREGAVEIS_APOS_DESISTENCIA : [],
    exigeAReserva: false,
    transferencia: 'repositório ou arquivo indicado pelo cliente, com instruções escritas e registro do envio; prazo [!] decisão da titular',
    propriedadeIntelectual: 'Anexo de Componentes (C-09): código específico do cliente a partir da quitação do valor apurado',
  };
}

/* ------------------------------------------------------------------ */
/* C-06 — homologação (R1: lembretes no 5º e no 9º dia útil)            */
/* ------------------------------------------------------------------ */

export const PRAZO_HOMOLOGACAO_DIAS_UTEIS = 10;
export const LEMBRETES_HOMOLOGACAO_DIAS_UTEIS = Object.freeze([5, 9]);
export const REPROGRAMACAO_APOS_SUSPENSAO_DIAS = 30;
export const RODADAS_DE_PREFERENCIA = 2;

/** Datas da homologação a partir de uma data-base (disponibilização ou redisponibilização comunicada). */
export function cronogramaDaHomologacao(dataBase, feriadosExtras = []) {
  return {
    dataBase,
    primeiroLembrete: somarDiasUteis(dataBase, LEMBRETES_HOMOLOGACAO_DIAS_UTEIS[0], feriadosExtras),
    segundoLembrete: somarDiasUteis(dataBase, LEMBRETES_HOMOLOGACAO_DIAS_UTEIS[1], feriadosExtras),
    prazoFinal: somarDiasUteis(dataBase, PRAZO_HOMOLOGACAO_DIAS_UTEIS, feriadosExtras),
    suspensao: somarDiasUteis(dataBase, PRAZO_HOMOLOGACAO_DIAS_UTEIS + 1, feriadosExtras),
  };
}

/**
 * Situação da homologação em `hoje`. Só o aceite expresso conclui a homologação e torna exigível a 2ª parcela.
 * Redisponibilização só muda a data-base quando a nova data foi COMUNICADA por escrito (`comunicadaEm`); sem isso, o
 * prazo não é reiniciado em silêncio e a função alerta. Nunca: aceite tácito, desistência presumida, cancelamento
 * automático.
 */
export function situacaoDaHomologacao({
  disponibilizadaEm,
  hoje,
  redisponibilizacoes = [],
  aceiteExpressoEm = null,
  manifestacaoEm = null,
  lembretesEnviados = [],
  suspensaoRegistradaEm = null,
  feriadosExtras = [],
}) {
  const nunca = { aceiteTacito: false, desistenciaPresumida: false, cancelamentoAutomatico: false };
  if (aceiteExpressoEm) return { ...nunca, status: 'aceita', segundaParcelaExigivel: true };
  const validas = redisponibilizacoes.filter((r) => r.em && r.comunicadaEm && r.em <= hoje).sort((a, b) => (a.em < b.em ? -1 : 1));
  const dataBase = validas.length ? validas[validas.length - 1].em : disponibilizadaEm;
  const alertas = redisponibilizacoes
    .filter((r) => r.em && !r.comunicadaEm && r.em > dataBase)
    .map((r) => `redisponibilização de ${r.em} sem comunicação escrita da nova data-base: o prazo NÃO foi reiniciado`);
  const c = cronogramaDaHomologacao(dataBase, feriadosExtras);
  const base = { ...nunca, cronograma: c, segundaParcelaExigivel: false, alertas };
  if (manifestacaoEm && manifestacaoEm >= dataBase) {
    return { ...base, status: 'em-correcao', proximaAcao: 'corrigir e redisponibilizar, comunicando por escrito a nova data-base' };
  }
  const enviados = lembretesEnviados.filter((d) => d > dataBase).length;
  if (hoje < c.primeiroLembrete) return { ...base, status: 'em-avaliacao', proximaAcao: `1º lembrete escrito em ${c.primeiroLembrete}, se não houver resposta conclusiva` };
  if (hoje < c.segundoLembrete) return { ...base, status: 'em-avaliacao', proximaAcao: enviados >= 1 ? `2º lembrete escrito em ${c.segundoLembrete}` : '1º lembrete escrito (5º dia útil)' };
  if (hoje <= c.prazoFinal) return { ...base, status: 'em-avaliacao', proximaAcao: enviados >= 2 ? `aguardar até o fim de ${c.prazoFinal}` : enviados === 1 ? '2º lembrete escrito (9º dia útil)' : '1º e 2º lembretes escritos em atraso' };
  if (hoje < c.suspensao) return { ...base, status: 'prazo-inicial-encerrado', proximaAcao: `registrar a suspensão em ${c.suspensao}` };
  const status = 'homologacao-suspensa-aguardando-cliente';
  if (!suspensaoRegistradaEm) return { ...base, status, proximaAcao: 'registrar a suspensão e enviar comunicação escrita ao cliente; não cobrar a 2ª parcela' };
  const reprogramacaoEm = somarDiasCorridos(suspensaoRegistradaEm, REPROGRAMACAO_APOS_SUSPENSAO_DIAS);
  if (hoje < reprogramacaoEm) return { ...base, status, reprogramacaoEm, proximaAcao: `aguardar o cliente; pedir reprogramação em ${reprogramacaoEm}` };
  return { ...base, status, reprogramacaoEm, proximaAcao: 'solicitar por escrito a reprogramação formal (sem cancelamento automático)' };
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
export const GARANTIA_CONFIRMACAO_DIAS_UTEIS = 2;
export const GARANTIA_DIAGNOSTICO_DIAS_UTEIS = 5;

/**
 * Períodos de reclamação. O legal (cliente consumidor, serviço durável: 90 dias do término da execução, CDC art. 26,
 * II e §1º) é calculado SEM depender da opção contratual. O termo inicial dos 30 dias contratuais está pendente de
 * revisão jurídica: 'apos-prazo-legal' (proposta do agente) ou 'da-entrega-definitiva'. `adicionalAoLegal` indica se a
 * cobertura contratual de fato acrescenta tempo ao prazo legal. Vício oculto: o prazo legal só começa quando o defeito
 * fica evidenciado (CDC art. 26, §3º) — não modelado como data e nunca reduzido.
 */
export function periodosDeReclamacao({ terminoDaExecucao, entregaDefinitiva, consumidor, contagemContratual }) {
  const legal = consumidor
    ? { inicio: terminoDaExecucao, fim: somarDiasCorridos(terminoDaExecucao, 90), base: 'CDC art. 26, II e §1º (interpretação: serviço durável)' }
    : { inicio: terminoDaExecucao, fim: null, base: 'Código Civil e contrato — revisão jurídica' };
  let contratual;
  if (contagemContratual === 'apos-prazo-legal' && legal.fim) contratual = { inicio: legal.fim, fim: somarDiasCorridos(legal.fim, COBERTURA_CONTRATUAL_DIAS) };
  else contratual = { inicio: entregaDefinitiva, fim: somarDiasCorridos(entregaDefinitiva, COBERTURA_CONTRATUAL_DIAS) };
  contratual.adicionalAoLegal = legal.fim ? contratual.fim > legal.fim : null;
  contratual.termoInicial = 'depende-de-revisao-juridica';
  return { legal, contratual, vicioOculto: 'prazo legal a partir da evidência do defeito (CDC art. 26, §3º)' };
}

/**
 * Metas contratuais propostas de atendimento da garantia (C-07, R1): confirmar o recebimento em até 2 dias úteis e
 * fazer o diagnóstico inicial em até 5 dias úteis da solicitação. NÃO são prazo máximo de correção: a previsão de
 * correção é informada caso a caso depois do diagnóstico, e os direitos legais (ex.: CDC art. 20) continuam valendo.
 */
export function atendimentoDaGarantia({ solicitadaEm, feriadosExtras = [] }) {
  const dia = solicitadaEm.includes('T') ? diaEmBrasilia(solicitadaEm) : solicitadaEm;
  return {
    solicitadaEm: dia,
    confirmarRecebimentoAte: somarDiasUteis(dia, GARANTIA_CONFIRMACAO_DIAS_UTEIS, feriadosExtras),
    diagnosticoInicialAte: somarDiasUteis(dia, GARANTIA_DIAGNOSTICO_DIAS_UTEIS, feriadosExtras),
    previsaoDeCorrecao: 'informada por escrito depois do diagnóstico, específica do caso',
    prazoMaximoDeCorrecao: null,
    natureza: 'metas contratuais de atendimento e diagnóstico; não limitam direitos legais',
    registro: ['defeito', 'evidências', 'medidas tomadas', 'resolução'],
  };
}

/* ------------------------------------------------------------------ */
/* C-11 — parcelas, atraso e atualização monetária                      */
/* ------------------------------------------------------------------ */

export const PRAZO_PAGAMENTO_DIAS_UTEIS = 5;
export const ENQUADRAMENTOS_DE_ENCARGOS = Object.freeze(['consumidor', 'pf-nao-consumidor', 'b2b-nao-consumerista']);

export const parcelas = (precoCentavos) => {
  const primeira = Math.round(precoCentavos / 2);
  return { primeira, segunda: precoCentavos - primeira };
};

export const vencimentoDaParcela = (cobrancaEm, feriadosExtras = []) => somarDiasUteis(cobrancaEm, PRAZO_PAGAMENTO_DIAS_UTEIS, feriadosExtras);

const exigirFonte = (nome, o, campos) => {
  const faltas = campos.filter((c) => o[c] == null || o[c] === '');
  if (faltas.length) throw new Error(`${nome}: informe ${faltas.join(', ')} (base normativa e período de referência verificáveis)`);
};

/**
 * Encargos de atraso — resultado SEMPRE indicativo (`juridicamenteConfirmado: false`). Diretriz: multa única de 2% +
 * juros SIMPLES de 1% ao mês pro rata die (mês de 30 dias), sem capitalização.
 *   enquadramento: explícito (consumidor | pf-nao-consumidor | b2b-nao-consumerista). Fora do B2B, sem `tetoLegal`
 *     confirmado o resultado é 'indicativo-pendente' (Lei de Usura × taxa legal da Lei 14.905/2024; 1% a.m. não é
 *     presumido permitido).
 *   tetoLegal { taxaMensal, baseNormativa, periodoDeReferencia }: teto calculado, só com fonte verificável.
 *   atualizacao { indice, fatorAcumulado, baseNormativa, periodoDeReferencia }: correção do principal UMA vez; multa e
 *     juros incidem sobre o principal atualizado. Índice que já embute juros (Selic) é recusado: cumulá-lo com juros
 *     de mora seria duplicidade (CC art. 406, §1º).
 * Arredondamento: cada componente ao centavo mais próximo (proposta ⚖). Contestação pendente suspende a cobrança.
 */
export function encargosDeAtraso({ valorCentavos, vencimento, pagamentoEm, enquadramento, tetoLegal = null, atualizacao = null, dispensa = false, contestacaoPendente = false, jurosMensal = 0.01, multa = 0.02 }) {
  if (!ENQUADRAMENTOS_DE_ENCARGOS.includes(enquadramento)) throw new Error(`enquadramento explícito obrigatório (${ENQUADRAMENTOS_DE_ENCARGOS.join(' | ')})`);
  if (tetoLegal) exigirFonte('tetoLegal', tetoLegal, ['taxaMensal', 'baseNormativa', 'periodoDeReferencia']);
  if (atualizacao) {
    exigirFonte('atualizacao', atualizacao, ['indice', 'fatorAcumulado', 'baseNormativa', 'periodoDeReferencia']);
    if (/selic/i.test(atualizacao.indice)) throw new Error('duplicidade: a Selic já embute juros; não usar como índice de atualização junto com juros de mora');
  }
  const dias = Math.max(0, Math.round((paraData(pagamentoEm) - paraData(vencimento)) / 86_400_000));
  const comum = { diasDeAtraso: dias, enquadramento, juridicamenteConfirmado: false, capitalizacao: false };
  const zero = { correcaoCentavos: 0, multaCentavos: 0, jurosCentavos: 0, totalCentavos: valorCentavos };
  if (contestacaoPendente) return { ...comum, ...zero, situacao: 'cobrança do valor controvertido suspensa até a análise' };
  if (dias === 0 || dispensa) return { ...comum, ...zero, situacao: dias ? 'encargos dispensados' : 'em dia' };
  const pendencias = [];
  if (enquadramento !== 'b2b-nao-consumerista' && !tetoLegal) pendencias.push('teto legal de juros não confirmado para a relação (Lei de Usura × taxa legal, Lei 14.905/2024)');
  const taxa = tetoLegal ? Math.min(jurosMensal, tetoLegal.taxaMensal) : jurosMensal;
  const principal = atualizacao ? Math.round(valorCentavos * atualizacao.fatorAcumulado) : valorCentavos;
  const correcaoCentavos = principal - valorCentavos;
  const multaCentavos = Math.round(principal * multa);
  const jurosCentavos = Math.round((principal * taxa * dias) / 30);
  return {
    ...comum,
    situacao: 'em atraso',
    natureza: pendencias.length ? 'indicativo-pendente' : 'indicativo',
    pendencias,
    atualizacaoMonetaria: atualizacao ? { indice: atualizacao.indice, periodoDeReferencia: atualizacao.periodoDeReferencia } : 'nao-aplicada',
    taxaMensalAplicada: taxa,
    correcaoCentavos,
    multaCentavos,
    jurosCentavos,
    totalCentavos: principal + multaCentavos + jurosCentavos,
  };
}
