import { Card, Icon, SectionHeader } from 'nekkora-lib';
import { ECOSYSTEM_START } from '../config';
import { PRICING } from '../content';
import { Simulator } from './Simulator';

/**
 * Preços do ecossistema (NEKKORA-COM-ECOSYSTEM-001 §2 e §4): AI Piloto, Monitor e Hosting, sem pacote nem desconto.
 * Único bloco em que valores podem aparecer: marcado com data-pricing e verificado por scripts/homologacao.mjs
 * (precos-so-no-bloco-de-precos). Os atributos data-price expõem cada valor à homologação.
 */
export function Pricing() {
  return (
    <section id="precos" className="section" aria-labelledby="precos-title" data-pricing="ecossistema">
      <div className="wrap stack">
        <SectionHeader titleId="precos-title" align="center" eyebrow={PRICING.eyebrow} title={PRICING.title} description={PRICING.description} />
        {/* §11: vigência gravada pela titular; sem ela, prévia (o portão bloqueia a publicação, PUB-13) */}
        <p className="center-note validity-note" data-vigencia={ECOSYSTEM_START ? 'definida' : 'pendente'}>
          {PRICING.validity}
        </p>
        <ul className="cards cards--3 cards--poster plain-list price-cards">
          {PRICING.cards.map((c) => (
            <li key={c.id}>
              <Card className="offer-card" variant={c.id === 'ai' ? 'raised' : 'surface'} padding="lg" data-price-servico={c.id}>
                <span className="price-overline">{c.overline}</span>
                <h3>{c.title}</h3>
                <div className="price">
                  {c.rows.map((r) => (
                    <span key={r.id} className="price__line">
                      {r.prefix && <span className="price__from">{r.prefix}</span>}
                      <span className="price__value" data-price={r.id}>
                        {r.value}
                      </span>
                      <span className="price__unit">{r.unit}</span>
                    </span>
                  ))}
                </div>
                <p className="offer-card__fit">{c.note}</p>
              </Card>
            </li>
          ))}
        </ul>
        {/* §4: logo abaixo dos cartões, no mesmo bloco data-pricing (preços só aparecem aqui) */}
        <Simulator />
        <div className="poster-tile" data-conditions>
          <h3 className="poster-tile__title">{PRICING.conditions.title}</h3>
          <ul className="checklist checklist--sm">
            {PRICING.conditions.items.map((item) => (
              <li key={item}>
                <Icon name="check" size="sm" color="var(--nk-color-success-text, var(--nk-color-success))" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
