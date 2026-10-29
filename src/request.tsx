import { createContext, useContext, type MouseEvent } from 'react';

/** Tipo de solicitação (NEKKORA-COM-008-C §8, AUD-25): automação nova, hospedagem de uma existente ou infraestrutura. */
export type Demand = 'automacao' | 'hospedagem' | 'infraestrutura';

/**
 * Como o diálogo abre: o tipo de solicitação já marcado (o CTA do Hosting abre com a hospedagem) e, vindo do simulador,
 * o resumo da simulação — que só entra na mensagem se o visitante marcar a opção (NEKKORA-CALC-001 §3.8).
 */
export type RequestOptions = { demand?: Demand; simulation?: string | null };

/** Abre o diálogo "Solicitar avaliação" (modelo C, etapa 2). Fornecido pelo App. */
export const RequestDialogContext = createContext<(options?: RequestOptions) => void>(() => {});

/**
 * Props para os CTAs que abrem o diálogo. O href="#contato" continua como destino de reserva (abrir em nova aba,
 * script indisponível); o clique normal abre o diálogo.
 */
export function useRequestTrigger(options?: RequestOptions) {
  const open = useContext(RequestDialogContext);
  return {
    href: '#contato',
    'aria-haspopup': 'dialog' as const,
    onClick: (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      open(options);
    },
  };
}
