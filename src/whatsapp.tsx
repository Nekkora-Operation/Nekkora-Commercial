import { Button, Link } from 'nekkora-lib';
import type { ComponentProps, ReactNode } from 'react';
import { WHATSAPP_MESSAGES, whatsappUrl, type WhatsappContext } from './config';

/** Completa o nome acessível dos links de WhatsApp: o destino abre em outra aba, fora da página. */
export const WHATSAPP_SR = '(abre o WhatsApp em outra aba)';

/** Link do WhatsApp com a mensagem inicial sugerida — o texto livre (simulação) entra depois da frase do contexto. */
export const whatsappHref = (context: WhatsappContext, extra?: string | null) =>
  whatsappUrl(extra ? `${WHATSAPP_MESSAGES[context]}\n\n${extra}` : WHATSAPP_MESSAGES[context]);

/** Atributos comuns: link comum, outra aba, sem opener e sem Referer; data-whatsapp identifica o contexto na homologação. */
const linkProps = (href: string, context: WhatsappContext) => ({
  href,
  target: '_blank',
  rel: 'noopener noreferrer',
  'data-whatsapp': context,
});

/**
 * CTA de atendimento (NEKKORA-COM-CANAIS-001): abre a conversa no WhatsApp com a mensagem do contexto. Sem número
 * confirmado em publicacao.json, não renderiza nada (o portão de publicação exige o número).
 */
export function WhatsappButton({
  context,
  extra,
  children,
  ...rest
}: { context: WhatsappContext; extra?: string | null; children: ReactNode } & Omit<ComponentProps<typeof Button>, 'href' | 'children'>) {
  const href = whatsappHref(context, extra);
  if (!href) return null;
  return (
    <Button leftIcon="whatsapp" {...rest} {...linkProps(href, context)}>
      {children}
      <span className="nk-visually-hidden"> {WHATSAPP_SR}</span>
    </Button>
  );
}

/** Versão em texto, para avisos e notas. */
export function WhatsappLink({ context, children }: { context: WhatsappContext; children: ReactNode }) {
  const href = whatsappHref(context);
  if (!href) return null;
  return (
    <Link leftIcon="whatsapp" {...linkProps(href, context)}>
      {children}
      <span className="nk-visually-hidden"> {WHATSAPP_SR}</span>
    </Link>
  );
}
