import { Link, Logo } from 'nekkora-lib';
import { CHANNELS } from '../config';
import { CONTACT_COPY } from '../content';
import { WhatsappButton } from '../whatsapp';

/**
 * Contato (NEKKORA-COM-CANAIS-001, titular, 12/11/2026): o WhatsApp é o único canal público de atendimento comercial.
 * Sem formulário, sem envio por e-mail e sem agendamento: a página só abre a conversa, com uma mensagem inicial que o
 * visitante pode editar — nada é enviado sem que ele toque em enviar no WhatsApp. LinkedIn e Instagram aparecem como
 * redes institucionais, não como canais de atendimento. O e-mail continua só onde a lei pede (identificação do
 * fornecedor no rodapé e canal dos direitos no aviso de privacidade).
 */
export function Contact() {
  const social = [
    CHANNELS.linkedin && { href: CHANNELS.linkedin, icon: 'linkedin' as const, label: 'LinkedIn' },
    CHANNELS.instagram && { href: CHANNELS.instagram, icon: 'instagram' as const, label: 'Instagram' },
  ].filter((s): s is { href: string; icon: 'linkedin' | 'instagram'; label: string } => Boolean(s));
  return (
    <section id="contato" className="section section--band" aria-labelledby="contato-title">
      <div className="wrap contact" data-contact-status={CHANNELS.whatsapp ? 'configurado' : 'pendente'}>
        <div className="contact__poster">
          <Logo variant="symbol" size={44} aria-hidden="true" />
          <h2 id="contato-title" className="contact__title">
            {CONTACT_COPY.title}
          </h2>
          <p className="contact__lead">{CONTACT_COPY.description}</p>
          {CHANNELS.whatsapp ? (
            <>
              <div className="contact__ctas">
                <WhatsappButton context="geral" size="lg" pill>
                  {CONTACT_COPY.cta}
                </WhatsappButton>
              </div>
              <p className="contact__note">{CONTACT_COPY.note}</p>
            </>
          ) : (
            <span className="contact__caption">{CONTACT_COPY.pendingCaption}</span>
          )}
          {social.length > 0 && (
            <div className="contact__direct" data-redes-institucionais="">
              <span className="contact__caption">{CONTACT_COPY.socialTitle}</span>
              <div className="contact__channels">
                {social.map((s) => (
                  <Link key={s.label} href={s.href} variant="default" leftIcon={s.icon} external>
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
