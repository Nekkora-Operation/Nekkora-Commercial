import { Card, IconBox, Logo, SectionHeader } from 'nekkora-lib';
import { DIFFERENTIALS } from '../content';

export function Differentials() {
  return (
    <section id="diferenciais" className="section" aria-labelledby="diferenciais-title">
      <div className="wrap stack">
        <SectionHeader titleId="diferenciais-title" eyebrow={DIFFERENTIALS.eyebrow} title={DIFFERENTIALS.title} description={DIFFERENTIALS.description} />
        <ul className="cards cards--3 plain-list">
          {DIFFERENTIALS.items.map((item) => (
            <li key={item.title}>
              <Card className="service-card" variant="surface" padding="md">
                <IconBox icon={item.icon} tone="primary" size="md" />
                <h3 style={{ fontSize: 'var(--nk-font-size-lg)' }}>{item.title}</h3>
                <p>{item.text}</p>
              </Card>
            </li>
          ))}
        </ul>
        <div className="manifesto">
          <Logo variant="symbol" size={52} title="Símbolo da Nekkora" />
          <p>
            {DIFFERENTIALS.manifesto.lead} <em>{DIFFERENTIALS.manifesto.accent}</em>
          </p>
        </div>
      </div>
    </section>
  );
}
