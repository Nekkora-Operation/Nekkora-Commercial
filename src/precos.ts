/**
 * Tabela de preços do ecossistema Nekkora — NEKKORA-COM-ECOSYSTEM-001 (decisão da titular de 20/11/2026; aprovação
 * pendente: PUB-14, impressão em scripts/comercial/impressao-precos.mjs).
 *
 * Fonte única dos números: a página, o simulador, os testes e a homologação leem os valores daqui. Três produtos
 * independentes, sem pacote nem desconto (nenhum desconto sem aprovação específica):
 *
 * - Nekkora AI — Piloto: a partir de R$ 100 por automação solicitada (valor inicial; sem mensalidade obrigatória).
 * - Nekkora Monitor: R$ 75 por automação monitorada, por mês (proposta de cobrança mensal).
 * - Nekkora Hosting: R$ 25 por hora-máquina Windows e R$ 12 por hora-máquina Linux.
 *
 * A tabela do Nekkora Delivery (COM-VITRINE-001) e a da campanha de lançamento saíram da página; ficam só em
 * scripts/comercial/tabelas-anteriores.mjs, para os compromissos já assumidos.
 *
 * Sem imports: o arquivo é carregado direto pelo Node nos testes (type stripping).
 */
export const PRICE_TABLE = {
  ai: { porAutomacao: 100 },
  monitor: { porAutomacaoMes: 75 },
  hosting: { windowsPorHora: 25, linuxPorHora: 12 },
} as const;

/** brl(1500) → "R$ 1.500": inteiro, separador de milhar com ponto, sem centavos (todos os preços são inteiros). */
export const brl = (n: number) => `R$ ${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

/* ---------------------------------------------------------------------------------------------------------------- */
/* Simulador de investimento (NEKKORA-COM-ECOSYSTEM-001 §4)                                                          */
/* ---------------------------------------------------------------------------------------------------------------- */

/** Entradas do simulador: automações no AI Piloto e no Monitor, horas-máquina Windows e Linux. */
export type SimField = 'ai' | 'monitor' | 'windows' | 'linux';
export const SIM_FIELDS: SimField[] = ['ai', 'monitor', 'windows', 'linux'];

/**
 * Limites de cada campo (titular, 20/11/2026: provisórios e exclusivamente de simulação, sem efeito comercial): até 50
 * automações por serviço e até 744 horas-máquina
 * por sistema (31 dias × 24 h, uma máquina o mês inteiro). Acima disso, a conversa é direta com a Nekkora. Horas
 * inteiras: o critério definitivo de cobrança do Hosting (fração de hora, arredondamento) será formalizado pela titular;
 * sem franquia mínima (titular, 20/11/2026).
 */
export const SIM_LIMITS: Record<SimField, number> = { ai: 50, monitor: 50, windows: 744, linux: 744 };

export type SimQuantities = Record<SimField, number>;
export const EMPTY_SIM: SimQuantities = { ai: 0, monitor: 0, windows: 0, linux: 0 };

/**
 * Quantidade válida a partir do que o visitante digitou (ou de qualquer valor): só inteiros de 0 ao limite do campo.
 * Texto com algo além de dígitos, número negativo, fracionário, NaN ou infinito vira 0; acima do limite, o limite.
 */
export function sanitizeQuantity(value: unknown, max: number): number {
  let n: number;
  if (typeof value === 'number') n = value;
  else if (typeof value === 'string' && /^\s*\d{1,6}\s*$/.test(value)) n = Number(value);
  else return 0;
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) return 0;
  return Math.min(n, max);
}

export const sanitizeSim = (q: Partial<Record<string, unknown>>): SimQuantities => ({
  ai: sanitizeQuantity(q.ai, SIM_LIMITS.ai),
  monitor: sanitizeQuantity(q.monitor, SIM_LIMITS.monitor),
  windows: sanitizeQuantity(q.windows, SIM_LIMITS.windows),
  linux: sanitizeQuantity(q.linux, SIM_LIMITS.linux),
});

/**
 * Resultado da simulação, com cada natureza de cobrança separada (§4):
 * - ai: investimento inicial estimado no AI Piloto (valor "a partir de", por automação);
 * - monitor: valor mensal estimado do Monitor (recorrente);
 * - hosting: investimento nas horas-máquina selecionadas (Windows + Linux);
 * - combined: investimento combinado estimado = AI + PRIMEIRO mês do Monitor + horas de Hosting. Nunca é uma
 *   mensalidade.
 * Qualquer outra entrada é ignorada.
 */
export function simulate(input: Partial<Record<string, unknown>>) {
  const q = sanitizeSim(input);
  const ai = q.ai * PRICE_TABLE.ai.porAutomacao;
  const monitor = q.monitor * PRICE_TABLE.monitor.porAutomacaoMes;
  const windows = q.windows * PRICE_TABLE.hosting.windowsPorHora;
  const linux = q.linux * PRICE_TABLE.hosting.linuxPorHora;
  const hosting = windows + linux;
  const combined = ai + monitor + hosting;
  return {
    quantities: q,
    empty: SIM_FIELDS.every((f) => q[f] === 0),
    ai,
    monitor,
    windows,
    linux,
    hosting,
    combined,
    labels: { ai: brl(ai), monitor: brl(monitor), windows: brl(windows), linux: brl(linux), hosting: brl(hosting), combined: brl(combined) },
  };
}

export type Simulation = ReturnType<typeof simulate>;
