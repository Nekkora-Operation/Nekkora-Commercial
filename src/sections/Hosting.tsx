import { Icon, Logo } from 'nekkora-lib';
import { HOSTING } from '../content';
import { RequestButton } from '../atendimento';

/** Faixa pôster em acento sólido (modelo C). Texto branco sobre --nk-solid-accent; no Sakura Dark, tom mais fechado. */
export function Hosting() {
  return (
    <section id="hosting" className="hosting-band" aria-labelledby="hosting-title">
      <div className="wrap split">
        <div className="hosting-band__copy">
          <span className="hosting-band__eyebrow">{HOSTING.eyebrow}</span>
          <h2 id="hosting-title" className="hosting-band__title">
            {HOSTING.title}
          </h2>
          <p className="hosting-band__lead">{HOSTING.description}</p>
          <p className="hosting-band__notice">
            <Icon name="info" size="sm" />
            <span>
              <strong>{HOSTING.availability.title}</strong> {HOSTING.availability.text}
            </span>
          </p>
          <div>
            {/* NEKKORA-COM-ECOSYSTEM-001 §7: formulário de atendimento já com o Hosting marcado */}
            <RequestButton options={{ services: ['hosting'] }} size="lg" pill className="hosting-band__cta" data-atendimento-origem="hosting-faixa">
              {HOSTING.cta}
            </RequestButton>
          </div>
        </div>
        <div className="split__visual hosting-band__visual" aria-hidden="true">
          <Logo variant="symbol" size={120} tone="inverse" />
        </div>
      </div>
    </section>
  );
}
