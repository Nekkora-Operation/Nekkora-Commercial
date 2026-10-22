import { Link } from 'nekkora-lib';
import { PREVIEW_NOTICE } from '../config';
import { FOOTER } from '../content';

/** Rodapé enxuto do modelo C. Os canais confirmados aparecem no bloco de contato, logo acima. */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="wrap footer__bottom">
        <span>© {year} Nekkora. Todos os direitos reservados.</span>
        <Link href="#privacidade" variant="subtle" size="sm">
          {FOOTER.privacy}
        </Link>
        {PREVIEW_NOTICE && <span className="footer__preview">{FOOTER.preview}</span>}
        <span>{FOOTER.signature}</span>
      </div>
    </footer>
  );
}
