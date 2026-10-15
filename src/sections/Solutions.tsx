import { Badge, Card, Icon, IconBox, Link, SectionHeader } from 'nekkora-lib';
import { SOLUTIONS } from '../content';

export function Solutions() {
  return (
    <section id="solucoes" className="section" aria-labelledby="solucoes-title">
      <div className="wrap stack">
        <SectionHeader
          titleId="solucoes-title"
          align="center"
          eyebrow={SOLUTIONS.eyebrow}
          title={SOLUTIONS.title}
          description={SOLUTIONS.description}
        />
        <ul className="cards cards--2 plain-list">
          {SOLUTIONS.cards.map((s) => (
            <li key={s.id}>
              <Card className="offer-card" variant="surface" padding="lg">
                <div className="offer-card__head">
                  <IconBox icon={s.icon} tone="accent" size="lg" />
                  <Badge tone={s.stageTone} variant="soft" size="sm">
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
                <Link href={s.href} arrow>
                  {s.cta}
                </Link>
              </Card>
            </li>
          ))}
        </ul>
        <p className="note">
          <Icon name="info" size="sm" />
          <span>
            {SOLUTIONS.note}{' '}
            <Link href="#combinado" size="sm">
              {SOLUTIONS.noteLink}
            </Link>
          </span>
        </p>
      </div>
    </section>
  );
}
