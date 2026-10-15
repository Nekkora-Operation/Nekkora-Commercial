import { Card, Icon, IconBox, SectionHeader, Text } from 'nekkora-lib';
import { COMBINED } from '../content';

export function Combined() {
  return (
    <section id="combinado" className="section section--band" aria-labelledby="combinado-title">
      <div className="wrap stack">
        <SectionHeader titleId="combinado-title" align="center" eyebrow={COMBINED.eyebrow} title={COMBINED.title} description={COMBINED.description} />
        <ul className="cards cards--3 plain-list">
          {COMBINED.options.map((o) => (
            <li key={o.title}>
              <Card className="offer-card" variant="surface" padding="lg">
                <IconBox icon={o.icon} tone="primary" size="md" />
                <h3>{o.title}</h3>
                <p className="offer-card__summary">{o.text}</p>
                <p className="offer-card__fit">{o.fit}</p>
                {o.condition && (
                  <p className="offer-card__condition">
                    <Icon name="info" size="sm" />
                    <span>{o.condition}</span>
                  </p>
                )}
              </Card>
            </li>
          ))}
        </ul>
        <div className="limits" data-exclusion="combinado">
          <Text variant="h4" as="h3">
            {COMBINED.limits.title}
          </Text>
          <ul>
            {COMBINED.limits.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
