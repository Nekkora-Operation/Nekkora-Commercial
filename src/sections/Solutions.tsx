import { Badge, Card, Icon, IconBox, SectionHeader } from 'nekkora-lib';
import { RequestButton } from '../atendimento';
import { SOLUTIONS } from '../content';

/** Catálogo do ecossistema (NEKKORA-COM-ECOSYSTEM-001 §2 e §3): três produtos independentes, com o estado real de cada um. */
export function Solutions() {
  return (
    <section id="solucoes" className="section section--band section--tight-top" aria-labelledby="solucoes-title">
      <div className="wrap stack">
        <SectionHeader titleId="solucoes-title" align="center" size="lg" eyebrow={SOLUTIONS.eyebrow} title={SOLUTIONS.title} description={SOLUTIONS.description} />
        <ul className="cards cards--3 cards--poster plain-list">
          {SOLUTIONS.cards.map((s) => (
            <li key={s.id}>
              <Card className="offer-card" variant={s.id === 'ai' ? 'raised' : 'surface'} padding="lg" data-servico={s.id}>
                <div className="offer-card__head">
                  <IconBox icon={s.icon} tone="accent" variant="soft" size="md" />
                  <Badge tone={s.id === 'ai' ? 'accent' : 'info'} variant="soft" size="sm" data-estado={s.id}>
                    {s.stage}
                  </Badge>
                </div>
                <h3>{s.name}</h3>
                <p className="offer-card__summary">{s.summary}</p>
                <ul className="checklist checklist--sm">
                  {s.items.map((item) => (
                    <li key={item}>
                      <Icon name="check" size="sm" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div>
                  <RequestButton options={{ services: [s.id] }} variant="secondary" data-atendimento-origem={s.id}>
                    {s.cta}
                  </RequestButton>
                </div>
              </Card>
            </li>
          ))}
        </ul>
        <p className="center-note">{SOLUTIONS.note}</p>
      </div>
    </section>
  );
}
