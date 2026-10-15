import { Badge, Button, Card, Icon, Text } from 'nekkora-lib';
import { HERO } from '../content';
import { NekoPeek } from '../illustrations/Scenes';

/**
 * Jornada de uma automação — ilustração sem dados (substitui o painel com números fictícios da V1).
 * Marcada com data-demo e com o selo "Ilustração" visível (X-11, X-12).
 */
function JourneyPanel() {
  const { journey } = HERO;
  return (
    <div className="journey-panel" data-demo="jornada">
      <NekoPeek className="journey-panel__peek" />
      <Card className="journey-panel__card" variant="surface" padding="md" aria-labelledby="journey-title">
        <div className="journey-panel__bar">
          <Text id="journey-title" variant="body-sm" weight="semibold" as="h2" style={{ flex: 1, margin: 0 }}>
            {journey.title}
          </Text>
          <Badge tone="neutral" variant="outline" size="sm" icon="eye">
            {journey.label}
          </Badge>
        </div>
        <ol className="journey-panel__steps">
          {journey.steps.map((step, i) => (
            <li key={step}>
              <span className="journey-panel__num" aria-hidden="true">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="journey-panel__exec">
          <Icon name="server" size="sm" />
          <span>{journey.execution}</span>
        </p>
      </Card>
    </div>
  );
}

export function Hero() {
  return (
    <section id="inicio" className="hero" aria-labelledby="hero-title">
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <Badge tone="accent" size="md" icon="sakura" style={{ alignSelf: 'flex-start' }}>
            {HERO.badge}
          </Badge>
          <h1 id="hero-title" className="hero__title">
            {HERO.titleLead} <em>{HERO.titleAccent}</em>
          </h1>
          <p className="hero__lead">{HERO.lead}</p>
          <div className="hero__ctas">
            <Button size="lg" rightIcon="arrow-right" href="#contato">
              {HERO.primaryCta}
            </Button>
            <Button size="lg" variant="secondary" href="#como-funciona">
              {HERO.secondaryCta}
            </Button>
          </div>
          <ul className="hero__pillars" aria-label="Princípios da contratação">
            {HERO.points.map((p) => (
              <li key={p.label}>
                <Icon name={p.icon} size="sm" />
                {p.label}
              </li>
            ))}
          </ul>
        </div>
        <JourneyPanel />
      </div>
    </section>
  );
}
