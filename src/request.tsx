import { createContext, useContext, type MouseEvent } from 'react';

/** Abre o diálogo "Solicitar avaliação" (modelo C, etapa 2). Fornecido pelo App. */
export const RequestDialogContext = createContext<() => void>(() => {});

/**
 * Props para os CTAs que abrem o diálogo. O href="#contato" continua como destino de reserva (abrir em nova aba,
 * script indisponível); o clique normal abre o diálogo.
 */
export function useRequestTrigger() {
  const open = useContext(RequestDialogContext);
  return {
    href: '#contato',
    'aria-haspopup': 'dialog' as const,
    onClick: (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      open();
    },
  };
}
