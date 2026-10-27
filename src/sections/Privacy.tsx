import { IconBox, SectionHeader } from 'nekkora-lib';
import { PRIVACY } from '../content';

/** Aviso de privacidade (COM-RELEASE-002 §5.4): o que a página coleta, o que vai para o canal (WhatsApp ou e-mail) e os direitos. */
export function Privacy() {
  return (
    <section id="privacidade" className="section" aria-labelledby="privacidade-title">
      <div className="wrap stack">
        <SectionHeader titleId="privacidade-title" align="center" eyebrow={PRIVACY.eyebrow} title={PRIVACY.title} description={PRIVACY.description} />
        <ul className="cards cards--2 cards--poster plain-list privacy">
          {PRIVACY.items.map((item) => (
            <li key={item.title} className="poster-tile poster-tile--row">
              <IconBox icon={item.icon} tone="neutral" variant="soft" size="md" />
              <div>
                <h3 className="poster-tile__title">{item.title}</h3>
                <p className="poster-tile__text">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
