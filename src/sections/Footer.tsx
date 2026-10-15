import { Link, Logo } from 'nekkora-lib';
import { CHANNELS, PREVIEW_NOTICE, hasAnyChannel, whatsappUrl } from '../config';
import { FOOTER } from '../content';

export function Footer() {
  const year = new Date().getFullYear();
  const wa = whatsappUrl();
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__grid">
          <div className="footer__brand">
            {/* Sem a tagline oficial: "OBSERVE" seria lido como monitoramento incluído (B-01). */}
            <Logo size={30} title="Nekkora" />
            <p>{FOOTER.tagline}</p>
          </div>
          <nav className="footer__col" aria-label="Soluções">
            <h3>Soluções</h3>
            <ul>
              <li><Link href="#delivery" variant="subtle">Nekkora Delivery</Link></li>
              <li><Link href="#hosting" variant="subtle">Nekkora Hosting</Link></li>
              <li><Link href="#combinado" variant="subtle">Delivery + Hosting</Link></li>
            </ul>
          </nav>
          <nav className="footer__col" aria-label="Contratação">
            <h3>Contratação</h3>
            <ul>
              <li><Link href="#como-funciona" variant="subtle">Como funciona</Link></li>
              <li><Link href="#diferenciais" variant="subtle">Diferenciais</Link></li>
              <li><Link href="#transparencia" variant="subtle">Transparência</Link></li>
              <li><Link href="#contato" variant="subtle">Solicitar avaliação</Link></li>
            </ul>
          </nav>
          <div className="footer__col">
            <h3>Contato</h3>
            {hasAnyChannel ? (
              <ul>
                {wa && <li><Link href={wa} variant="subtle" leftIcon="whatsapp">WhatsApp</Link></li>}
                {CHANNELS.email && <li><Link href={`mailto:${CHANNELS.email}`} variant="subtle" leftIcon="mail">E-mail</Link></li>}
                {CHANNELS.instagram && <li><Link href={CHANNELS.instagram} variant="subtle" leftIcon="instagram">Instagram</Link></li>}
                {CHANNELS.linkedin && <li><Link href={CHANNELS.linkedin} variant="subtle" leftIcon="linkedin">LinkedIn</Link></li>}
              </ul>
            ) : (
              <p className="footer__muted">{FOOTER.pendingChannels}</p>
            )}
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {year} Nekkora. Todos os direitos reservados.</span>
          {PREVIEW_NOTICE && <span className="footer__preview">{FOOTER.preview}</span>}
          <span>{FOOTER.signature}</span>
        </div>
      </div>
    </footer>
  );
}
