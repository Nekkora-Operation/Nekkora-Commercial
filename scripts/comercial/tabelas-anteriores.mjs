/**
 * Tabelas de preços ANTERIORES do Nekkora Delivery — histórico dos compromissos já assumidos
 * (NEKKORA-COM-ECOSYSTEM-001, titular, 20/11/2026: o Delivery deixa de existir como produto comercial independente e sai
 * da página; os documentos históricos e os compromissos anteriores são preservados).
 *
 * NUNCA vão para a página: src/ não importa este arquivo, e scripts/verificar-precos-artefato.mjs confere que nenhuma
 * delas está no bundle. Servem a scripts/comercial/regras-delivery.mjs e aos testes das condições do Delivery.
 *
 * - CAMPANHA_DE_LANCAMENTO (aprovada em 22/10/2026): preço padrão e de lançamento por categoria; rege as solicitações
 *   recebidas de 06/11/2026 até a véspera das novas condições (V-02).
 * - VITRINE_DELIVERY (COM-VITRINE-001, aprovada em 12/11/2026, PUB-14 sha256:95a612f7…f35): individual e pacote de 3
 *   da mesma categoria; rege as solicitações recebidas de 12/11/2026 até a vigência da nova estratégia.
 */
export const CAMPANHA_DE_LANCAMENTO = Object.freeze({
  simples: Object.freeze({ standard: 1500, launch: 1000 }),
  media: Object.freeze({ standard: 3500, launch: 2800 }),
});

export const VITRINE_DELIVERY = Object.freeze({
  simples: Object.freeze({ individual: 650, pacote: 1500 }),
  media: Object.freeze({ individual: 1400, pacote: 3500 }),
});

/** Quantidade de automações da mesma categoria em um pacote (V-03). */
export const PACKAGE_SIZE = 3;

/** Situação da campanha de lançamento numa data (AAAA-MM-DD, fuso de Brasília). */
export function campaignState({ inicio, fim }, today) {
  if (inicio == null || fim == null) return 'pendente';
  if (today < inicio) return 'futura';
  return today <= fim ? 'vigente' : 'encerrada';
}

/** Data de hoje (AAAA-MM-DD) no fuso de Brasília. */
export const todayInBrazil = (now = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
