import { useEffect, useRef } from 'react';

/**
 * Desafio antiautomação (Cloudflare Turnstile, COM-RELEASE-005 §5.5) — só no envio automático e só com a chave do site
 * em publicacao.json. O script é carregado sob demanda, na etapa de confirmação: quem não envia nada não fala com a
 * Cloudflare. Modo "managed": na maioria das vezes não pede interação; quando pede, o próprio widget é acessível por
 * teclado e leitor de tela. A CSP libera https://challenges.cloudflare.com só nos builds com a chave (cabecalhos.mjs).
 */
type Turnstile = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let loading: Promise<Turnstile> | null = null;

function loadTurnstile(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise<Turnstile>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile')));
    s.onerror = () => {
      loading = null;
      s.remove();
      reject(new Error('turnstile'));
    };
    document.head.appendChild(s);
  });
  return loading;
}

/**
 * Widget do desafio. `onToken(token | null)`: token válido, expirado ou com erro. `resetKey` muda → desafio refeito
 * (o token vale uma vez; depois de uma recusa, é preciso outro).
 */
export function Challenge({ siteKey, onToken, onUnavailable, resetKey }: { siteKey: string; onToken: (t: string | null) => void; onUnavailable: () => void; resetKey: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const handlers = useRef({ onToken, onUnavailable });
  handlers.current = { onToken, onUnavailable };

  useEffect(() => {
    let cancelled = false;
    loadTurnstile()
      .then((t) => {
        if (cancelled || !ref.current) return;
        widget.current = t.render(ref.current, {
          sitekey: siteKey,
          language: 'pt-br',
          appearance: 'interaction-only',
          callback: (token: string) => handlers.current.onToken(token),
          'expired-callback': () => handlers.current.onToken(null),
          'error-callback': () => {
            handlers.current.onToken(null);
            handlers.current.onUnavailable();
          },
        });
      })
      .catch(() => !cancelled && handlers.current.onUnavailable());
    return () => {
      cancelled = true;
      if (widget.current) window.turnstile?.remove(widget.current);
      widget.current = null;
    };
  }, [siteKey]);

  useEffect(() => {
    if (resetKey > 0 && widget.current) {
      handlers.current.onToken(null);
      window.turnstile?.reset(widget.current);
    }
  }, [resetKey]);

  return <div ref={ref} className="request__challenge" data-testid="desafio" />;
}
