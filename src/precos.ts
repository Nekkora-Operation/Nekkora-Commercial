/**
 * Tabela oficial de preços do Nekkora Delivery (COM-RELEASE-003-R1, decisão da titular de 22/10/2026) [PR-01] [PR-02].
 *
 * Fonte única dos números: a página, os testes (scripts/testes/precos.test.mjs) e a homologação leem os valores
 * daqui, e a economia e o percentual são CALCULADOS — nunca digitados — para não divergirem da tabela. Automação
 * complexa não tem número: fica sob orçamento, sem desconto automático [PR-03].
 *
 * Sem imports: o arquivo é carregado direto pelo Node nos testes (type stripping).
 */
export const PRICE_TABLE = {
  simples: { standard: 1500, launch: 1000 },
  media: { standard: 3500, launch: 2800 },
} as const;

export type PricedTier = keyof typeof PRICE_TABLE;

/** R$ 1.500 — inteiro, separador de milhar com ponto, sem centavos (como no mockup). */
export const brl = (n: number) => `R$ ${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

/**
 * Percentual de desconto truncado em duas casas (33,333…% → 33,33%): o arredondamento nunca anuncia um desconto
 * maior que o real.
 */
export const discountPercent = (standard: number, launch: number) => Math.floor(((standard - launch) / standard) * 10000) / 100;

/** 33,33% · 20% — vírgula decimal, sem zeros à direita. */
export const percentLabel = (p: number) => `${String(p).replace('.', ',')}%`;

export function priceFacts(tier: PricedTier) {
  const { standard, launch } = PRICE_TABLE[tier];
  const percent = discountPercent(standard, launch);
  return {
    standard,
    launch,
    savings: standard - launch,
    percent,
    standardLabel: brl(standard),
    launchLabel: brl(launch),
    savingsLabel: brl(standard - launch),
    percentLabel: percentLabel(percent),
  };
}

/** Data de hoje (AAAA-MM-DD) no fuso de Brasília — a campanha vale por datas do calendário brasileiro. */
export const todayInBrazil = (now: Date = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);

/**
 * A campanha de lançamento está em vigor? Com as datas aprovadas (PUB-13), só entre o início e o fim, inclusive;
 * fora do período a página mostra apenas o preço padrão. Sem datas, a página mantém os preços de lançamento para
 * revisão — e scripts/verificar-publicacao.mjs bloqueia a publicação até as datas existirem.
 */
export function launchActive(period: { inicio: string | null; fim: string | null }, today: string): boolean {
  const { inicio, fim } = period;
  if (inicio == null || fim == null) return true;
  return inicio <= today && today <= fim;
}

/**
 * Situação da campanha de lançamento (NEKKORA-COM-008-C §3.6), comparando datas AAAA-MM-DD do fuso de Brasília:
 *   'pendente'  datas não aprovadas (PUB-13): preços de lançamento só como prévia de homologação; o portão bloqueia;
 *   'futura'    antes do início: só o preço padrão (nenhum desconto ainda disponível);
 *   'vigente'   do início ao fim, inclusive;
 *   'encerrada' depois do fim: só o preço padrão.
 */
export type CampaignState = 'pendente' | 'futura' | 'vigente' | 'encerrada';

export function campaignState(period: { inicio: string | null; fim: string | null }, today: string): CampaignState {
  const { inicio, fim } = period;
  if (inicio == null || fim == null) return 'pendente';
  if (today < inicio) return 'futura';
  return today <= fim ? 'vigente' : 'encerrada';
}

/* ---------------------------------------------------------------------------------------------------------------- */
/* Simulador de investimento (NEKKORA-CALC-001)                                                                     */
/* ---------------------------------------------------------------------------------------------------------------- */

/** Quantidade máxima por categoria na simulação. Acima disso, a conversa é direta com a Nekkora. */
export const MAX_QUANTITY = 20;

export type Quantities = { simples: number; media: number; complexa: number };
export type QuantityTier = keyof Quantities;
export const EMPTY_QUANTITIES: Quantities = { simples: 0, media: 0, complexa: 0 };

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

export const sanitizeQuantities = (q: Partial<Record<QuantityTier, unknown>>): Quantities => ({
  simples: sanitizeQuantity(q.simples),
  media: sanitizeQuantity(q.media),
  complexa: sanitizeQuantity(q.complexa),
});

const PRICED_TIERS = Object.keys(PRICE_TABLE) as PricedTier[];

/**
 * Resultado da simulação. Só as categorias com preço (simples e média) entram nos totais; a complexa fica sob
 * orçamento, sem valor inventado. Com ela, o total é um SUBTOTAL ESTIMADO (`partial`), nunca o preço completo.
 *
 * Com a campanha em vigor (`launch`), o investimento é o de lançamento; a economia é a diferença entre os preços
 * comerciais (padrão − lançamento), não uma economia operacional, e o percentual equivalente é calculado sobre o
 * total calculável, truncado em duas casas para não superestimar o benefício. Sem campanha: só o preço padrão.
 */
export function simulate(input: Partial<Record<QuantityTier, unknown>>, launch: boolean) {
  const quantities = sanitizeQuantities(input);
  const lines = PRICED_TIERS.map((tier) => {
    const unit = launch ? PRICE_TABLE[tier].launch : PRICE_TABLE[tier].standard;
    const quantity = quantities[tier];
    return { tier, quantity, unit, unitLabel: brl(unit), total: quantity * unit, totalLabel: brl(quantity * unit) };
  });
  const standardTotal = PRICED_TIERS.reduce((s, t) => s + quantities[t] * PRICE_TABLE[t].standard, 0);
  const launchTotal = PRICED_TIERS.reduce((s, t) => s + quantities[t] * PRICE_TABLE[t].launch, 0);
  const pricedCount = quantities.simples + quantities.media;
  const estimate = launch ? launchTotal : standardTotal;
  const savings = launch ? standardTotal - launchTotal : 0;
  const percent = launch && standardTotal > 0 ? discountPercent(standardTotal, launchTotal) : 0;
  return {
    quantities,
    total: pricedCount + quantities.complexa,
    pricedCount,
    complexCount: quantities.complexa,
    /** Há automação complexa: o valor é o subtotal estimado das demais, não o preço completo da contratação. */
    partial: quantities.complexa > 0,
    launch,
    lines,
    standardTotal,
    standardTotalLabel: brl(standardTotal),
    estimate,
    estimateLabel: brl(estimate),
    savings,
    savingsLabel: brl(savings),
    percent,
    percentLabel: percentLabel(percent),
  };
}

export type Simulation = ReturnType<typeof simulate>;
