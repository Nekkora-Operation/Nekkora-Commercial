import { Badge, Card, Icon, Link, SectionHeader } from 'nekkora-lib';
import { SOLUTIONS } from '../content';

export function Solutions() {
  return (
    <section id="solucoes" className="section section--band section--tight-top" aria-labelledby="solucoes-title">
      <div className="wrap stack">
        <SectionHeader titleId="solucoes-title" align="center" size="lg" eyebrow={SOLUTIONS.eyebrow} title={SOLUTIONS.title} />
        <ul className="cards cards--2 cards--poster plain-list">
          {SOLUTIONS.cards.map((s) => (
            <li key={s.id}>
              <Card className="offer-card" variant={s.variant} padding="lg">
                <span className="poster-num" aria-hidden="true">
                  {s.number}
                </span>
                <div className="offer-card__head">
                  <h3>{s.name}</h3>
                  <Badge tone={s.stageTone} variant="soft" size="sm">
                    {s.stage}
                  </Badge>
                </div>
                <p className="offer-card__summary">{s.summary}</p>
                <ul className="checklist checklist--sm">
                  {s.items.map((item) => (
                    <li key={item}>
                      <Icon name="check" size="sm" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href={s.href} arrow>
                  {s.cta}
                </Link>
              </Card>
            </li>
          ))}
        </ul>
        <p className="center-note">{SOLUTIONS.note}</p>
      </div>
    </section>
  );
}
