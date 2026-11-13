/**
 * Tabela de preços do Nekkora Delivery — COM-VITRINE-001 (diretrizes da titular de 11/11/2026; aprovação definitiva
 * pendente: PUB-14, docs/release/COM-VITRINE-001.md §11).
 *
 * Fonte única dos números: a página, os testes (scripts/testes/precos.test.mjs e simulador.test.mjs) e a homologação
 * leem os valores daqui, e a economia do pacote é CALCULADA — nunca digitada — para não divergir da tabela.
 *
 * - Preço por automação (individual) ou por pacote de 3 automações da MESMA categoria; nenhuma mensalidade.
 * - A economia do pacote é sempre contra três unidades individuais desta tabela, nunca contra a tabela anterior.
 * - A tabela vale durante a campanha e depois dela (V-01): a data não muda o preço; a campanha só controla a comunicação
 *   promocional. Não existe retorno automático aos preços anteriores.
 * - Automação complexa não faz parte da vitrine (V-04): não há preço, pacote nem campo para ela.
 *
 * Sem imports: o arquivo é carregado direto pelo Node nos testes (type stripping).
 */
export const PRICE_TABLE = {
  simples: { individual: 650, pacote: 1500 },
  media: { individual: 1400, pacote: 3500 },
} as const;

/** Quantidade de automações da mesma categoria em um pacote (V-03). */
export const PACKAGE_SIZE = 3;

export type PricedTier = keyof typeof PRICE_TABLE;

/**
 * Preços previstos dos serviços recorrentes (V-06), exibidos só com o estado "Em preparação": sem checkout, assinatura
 * ou contratação. Valores e condições definitivos dependem da disponibilização comercial.
 */
export const PLANNED_RECURRING_PRICES = {
  monitor: { mensal: 75, unidade: 'automação' },
  ai: { mensal: 100, unidade: 'empresa' },
} as const;

/**
 * Tabela ANTERIOR (campanha de lançamento, aprovada em 22/10/2026), mantida só para os compromissos já assumidos:
 * solicitações recebidas de 06/11/2026 até a véspera do início das novas condições conservam o preço de lançamento
 * (V-02; scripts/comercial/regras-delivery.mjs). NÃO é exibida na página.
 */
export const PREVIOUS_PRICE_TABLE = {
  simples: { standard: 1500, launch: 1000 },
  media: { standard: 3500, launch: 2800 },
} as const;

/** brl(1500) → "R$" + 1.500: inteiro, separador de milhar com ponto, sem centavos (como no mockup). */
export const brl = (n: number) => `R$ ${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

/** Valores de um cartão: individual, pacote de 3, três individuais e a economia do pacote (calculada). */
export function priceFacts(tier: PricedTier) {
  const { individual, pacote } = PRICE_TABLE[tier];
  const threeIndividual = individual * PACKAGE_SIZE;
  return {
    individual,
    package: pacote,
    threeIndividual,
    savings: threeIndividual - pacote,
    individualLabel: brl(individual),
    packageLabel: brl(pacote),
    threeIndividualLabel: brl(threeIndividual),
    savingsLabel: brl(threeIndividual - pacote),
  };
}

/** Quantas automações viram pacote e quantas ficam no preço individual: pacotes de 3 enquanto houver 3 (V-03). */
export function composePackages(quantity: number) {
  return { packages: Math.floor(quantity / PACKAGE_SIZE), singles: quantity % PACKAGE_SIZE };
}

/** Data de hoje (AAAA-MM-DD) no fuso de Brasília — a campanha vale por datas do calendário brasileiro. */
export const todayInBrazil = (now: Date = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);

/**
 * Situação da campanha de lançamento (NEKKORA-COM-008-C §3.6), comparando datas AAAA-MM-DD do fuso de Brasília. Desde
 * a COM-VITRINE-001 controla só a comunicação promocional (faixa e regras), nunca o preço:
 *   'pendente'  datas não aprovadas (PUB-13): o portão bloqueia a publicação;
 *   'futura'    antes do início;
 *   'vigente'   do início ao fim, inclusive;
 *   'encerrada' depois do fim.
 */
export type CampaignState = 'pendente' | 'futura' | 'vigente' | 'encerrada';

export function campaignState(period: { inicio: string | null; fim: string | null }, today: string): CampaignState {
  const { inicio, fim } = period;
  if (inicio == null || fim == null) return 'pendente';
  if (today < inicio) return 'futura';
  return today <= fim ? 'vigente' : 'encerrada';
}

/* ---------------------------------------------------------------------------------------------------------------- */
/* Simulador de investimento (NEKKORA-CALC-001, COM-VITRINE-001 §8)                                                 */
/* ---------------------------------------------------------------------------------------------------------------- */

/** Quantidade máxima por categoria na simulação. Acima disso, a conversa é direta com a Nekkora. */
export const MAX_QUANTITY = 20;

export type Quantities = Record<PricedTier, number>;
export type QuantityTier = PricedTier;
export const EMPTY_QUANTITIES: Quantities = { simples: 0, media: 0 };

/**
 * Quantidade válida a partir do que o visitante digitou (ou de qualquer valor): só inteiros de 0 a MAX_QUANTITY.
 * Texto com algo além de dígitos, número negativo, fracionário, NaN ou infinito vira 0; acima do limite, o limite.
 */
export function sanitizeQuantity(value: unknown): number {
  let n: number;
  if (typeof value === 'number') n = value;
  else if (typeof value === 'string' && /^\s*\d{1,6}\s*$/.test(value)) n = Number(value);
  else return 0;
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) return 0;
  return Math.min(n, MAX_QUANTITY);
}

const PRICED_TIERS = Object.keys(PRICE_TABLE) as PricedTier[];

export const sanitizeQuantities = (q: Partial<Record<string, unknown>>): Quantities => ({
  simples: sanitizeQuantity(q.simples),
  media: sanitizeQuantity(q.media),
});

/**
 * Resultado da simulação: por categoria, pacotes de 3 enquanto houver 3 e o restante no preço individual (V-03); sem
 * pacote misto. A economia é a diferença entre o total no preço individual e o total com pacotes — uma diferença entre
 * preços comerciais da mesma tabela, nunca economia operacional. Qualquer outra entrada (inclusive "complexa") é
 * ignorada: a vitrine não tem essa categoria.
 */
export function simulate(input: Partial<Record<string, unknown>>) {
  const quantities = sanitizeQuantities(input);
  const lines = PRICED_TIERS.map((tier) => {
    const { individual, pacote } = PRICE_TABLE[tier];
    const quantity = quantities[tier];
    const { packages, singles } = composePackages(quantity);
    const total = packages * pacote + singles * individual;
    return {
      tier,
      quantity,
      packages,
      singles,
      individualLabel: brl(individual),
      packageLabel: brl(pacote),
      total,
      totalLabel: brl(total),
    };
  });
  const individualTotal = PRICED_TIERS.reduce((s, t) => s + quantities[t] * PRICE_TABLE[t].individual, 0);
  const estimate = lines.reduce((s, l) => s + l.total, 0);
  return {
    quantities,
    total: quantities.simples + quantities.media,
    packages: lines.reduce((s, l) => s + l.packages, 0),
    lines,
    individualTotal,
    individualTotalLabel: brl(individualTotal),
    estimate,
    estimateLabel: brl(estimate),
    savings: individualTotal - estimate,
    savingsLabel: brl(individualTotal - estimate),
  };
}

export type Simulation = ReturnType<typeof simulate>;
