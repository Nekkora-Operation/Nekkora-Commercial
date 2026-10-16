import { Badge, Card, IconBox, Link, SectionHeader } from 'nekkora-lib';
import { PRICING } from '../content';

/**
 * Preços do Delivery (mockup "modelo C" da responsável). Único bloco em que valores e percentuais podem aparecer:
 * marcado com data-pricing e verificado por scripts/homologacao.mjs (precos-so-no-bloco-de-precos).
 */
export function Pricing() {
  return (
    <section id="precos" className="section" aria-labelledby="precos-title" data-pricing="delivery">
      <div className="wrap stack">
        <SectionHeader titleId="precos-title" align="center" eyebrow={PRICING.eyebrow} title={PRICING.title} description={PRICING.description} />
        <p className="launch-strip">
          <Badge tone="accent" variant="solid" size="md" icon="star">
            {PRICING.launch.badge}
          </Badge>
          <strong>{PRICING.launch.text}</strong>
          <span className="launch-strip__condition">{PRICING.launch.condition}</span>
        </p>
        <ul className="cards cards--3 cards--poster plain-list">
          {PRICING.tiers.map((t) => (
            <li key={t.title}>
              <Card className="offer-card" variant={t.variant} padding="lg">
                <span className="price-overline">{t.overline}</span>
                <h3>{t.title}</h3>
                <p className="offer-card__fit">{t.fit}</p>
                <div className="price">
                  {'price' in t && t.price ? (
                    <>
                      <span className="price__from">
                        <span className="nk-visually-hidden">{PRICING.srFrom} </span>
                        <s>{t.price.from}</s>
                      </span>
                      <span className="price__row">
                        <span className="nk-visually-hidden">{PRICING.srTo} </span>
                        <span className="price__value">{t.price.to}</span>
                        {/* solid, não soft: o soft de sucesso sobre o card claro do Sage Light fica em 4,25:1 (P-LIB-07) */}
                        <Badge tone="success" variant="solid" size="sm">
                          {t.price.discount}
                        </Badge>
                      </span>
                      <span className="price__unit">{t.price.unit}</span>
                    </>
                  ) : (
                    'negotiated' in t &&
                    t.negotiated && (
                      <>
                        <span className="price__negotiated">{t.negotiated.label}</span>
                        <span className="price__unit">{t.negotiated.unit}</span>
                      </>
                    )
                  )}
                </div>
                {'cta' in t && t.cta && (
                  <Link href="#contato" arrow>
                    {t.cta}
                  </Link>
                )}
              </Card>
            </li>
          ))}
        </ul>
        <div className="cards cards--2 cards--poster">
          {PRICING.notes.map((n) => (
            <div key={n.title} className="poster-tile poster-tile--row">
              <IconBox icon={n.icon} tone={n.tone} variant="soft" size="md" />
              <div>
                <h3 className="poster-tile__title">{n.title}</h3>
                <p className="poster-tile__text">{n.text}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="center-note">{PRICING.hostingNote}</p>
      </div>
    </section>
  );
}
