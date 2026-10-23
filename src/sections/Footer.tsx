import { Link } from 'nekkora-lib';
import { PREVIEW_NOTICE } from '../config';
import { FOOTER } from '../content';

/**
 * Commit do build no aviso de homologação (COM-RELEASE-005 §3.3): a divergência de percentual veio de uma tela servida por
 * outra pasta/branch. Com o commit à vista, quem revisa confere se é a versão candidata — e vê quando é um servidor de
 * desenvolvimento ou um build com alterações não commitadas.
 */
const BUILD = __NEKKORA_BUILD__;
const buildLabel = BUILD.commit
  ? `${FOOTER.build} ${BUILD.commit.slice(0, 7)}${BUILD.arvoreLimpa ? '' : ` · ${FOOTER.dirty}`}${BUILD.servidor === 'desenvolvimento' ? ` · ${FOOTER.devServer}` : ''}`
  : null;

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
        {PREVIEW_NOTICE && (
          <span className="footer__preview">
            {FOOTER.preview}
            {buildLabel && (
              <>
                {' · '}
                <span data-build-commit={BUILD.commit!.slice(0, 7)}>{buildLabel}</span>
              </>
            )}
          </span>
        )}
        <span>{FOOTER.signature}</span>
      </div>
    </footer>
  );
}
