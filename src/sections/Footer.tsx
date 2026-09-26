import { Link, Logo } from 'nekkora-lib';
import { CONTACT, whatsappUrl } from '../config';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__grid">
          <div className="footer__brand">
            <Logo size={30} tagline />
            <p>Automação com clareza, operação com confiança. Estruturamos, hospedamos, monitoramos e sustentamos as suas automações.</p>
          </div>
          <nav className="footer__col" aria-label="Produto">
            <h3>Produto</h3>
            <ul>
              <li><Link href="#studio" variant="subtle">Studio</Link></li>
              <li><Link href="#hospedagem" variant="subtle">Hospedagem</Link></li>
              <li><Link href="#monitoramento" variant="subtle">Monitoramento</Link></li>
              <li><Link href="#suporte" variant="subtle">Suporte</Link></li>
            </ul>
          </nav>
          <nav className="footer__col" aria-label="Empresa">
            <h3>Empresa</h3>
            <ul>
              <li><Link href="#entrega" variant="subtle">O que entregamos</Link></li>
              <li><Link href="#como-funciona" variant="subtle">Como funciona</Link></li>
              <li><Link href="#diferenciais" variant="subtle">Diferenciais</Link></li>
              <li><Link href="#contato" variant="subtle">Contato</Link></li>
            </ul>
          </nav>
          <div className="footer__col">
            <h3>Fale com a gente</h3>
            <ul>
              <li><Link href={whatsappUrl()} variant="subtle" leftIcon="whatsapp">WhatsApp</Link></li>
              <li><Link href={`mailto:${CONTACT.email}`} variant="subtle" leftIcon="mail">E-mail</Link></li>
              <li><Link href={CONTACT.instagram} variant="subtle" leftIcon="instagram">Instagram</Link></li>
              <li><Link href={CONTACT.linkedin} variant="subtle" leftIcon="linkedin">LinkedIn</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {year} Nekkora. Todos os direitos reservados.</span>
          <span>Neko (猫) observa. A Nekkora opera.</span>
        </div>
      </div>
    </footer>
  );
}
