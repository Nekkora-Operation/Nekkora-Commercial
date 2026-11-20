import { Badge, Button } from 'nekkora-lib';
import { HERO } from '../content';
import { RequestButton } from '../atendimento';

export function Hero() {
  return (
    <section id="inicio" className="hero" aria-labelledby="hero-title">
      <div className="wrap hero__center">
        <Badge tone="accent" variant="solid" size="md" icon="sakura">
          {HERO.badge}
        </Badge>
        <h1 id="hero-title" className="hero__title">
          {HERO.titleLead} <em>{HERO.titleAccent}</em>
        </h1>
        <p className="hero__lead">{HERO.lead}</p>
        <div className="hero__ctas">
          {/* NEKKORA-COM-ECOSYSTEM-001 §7: abre o formulário de atendimento, que leva ao WhatsApp */}
          <RequestButton size="lg" pill data-atendimento-origem="topo">
            {HERO.primaryCta}
          </RequestButton>
          <Button size="lg" pill variant="secondary" href="#como-funciona">
            {HERO.secondaryCta}
          </Button>
        </div>
        <ul className="hero__pillars plain-list" aria-label={HERO.pillarsLabel}>
          {HERO.points.map((p) => (
            <li key={p.label}>
              <Badge tone="neutral" variant="outline" size="md" icon={p.icon}>
                {p.label}
              </Badge>
            </li>
          ))}
        </ul>
        <div className="hero__arch" aria-hidden="true" />
      </div>
    </section>
  );
}
