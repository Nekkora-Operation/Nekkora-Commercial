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
