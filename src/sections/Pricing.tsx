import { Badge, Card, Icon, IconBox, Link, SectionHeader } from 'nekkora-lib';
import { isLaunchActive } from '../config';
import { PRICING } from '../content';
import { useRequestTrigger } from '../request';

/**
 * Preços do Delivery (tabela oficial de 22/10/2026 no layout do mockup "modelo C"). Único bloco em que valores e
 * percentuais podem aparecer: marcado com data-pricing e verificado por scripts/homologacao.mjs
 * (precos-so-no-bloco-de-precos). Os atributos data-price expõem cada valor à homologação.
 */
export function Pricing() {
  const trigger = useRequestTrigger();
  // Avaliado no carregamento da página: fora do período aprovado, só o preço padrão (COM-RELEASE-003-R1 §3.7, item 10).
  const launch = isLaunchActive();
  return (
    <section id="precos" className="section" aria-labelledby="precos-title" data-pricing="delivery">
      <div className="wrap stack">
        <SectionHeader titleId="precos-title" align="center" eyebrow={PRICING.eyebrow} title={PRICING.title} description={PRICING.description} />
        {launch && (
          <p className="launch-strip">
            <Badge tone="accent" variant="solid" size="md" icon="star">
              {PRICING.launch.badge}
            </Badge>
            <strong>{PRICING.launch.text}</strong>
            <span className="launch-strip__condition">{PRICING.launch.condition}</span>
          </p>
        )}
        <ul className="cards cards--3 cards--poster plain-list">
          {PRICING.tiers.map((t) => (
            <li key={t.title}>
              <Card className="offer-card" variant={t.variant} padding="lg">
                <span className="price-overline">{t.overline}</span>
                <h3>{t.title}</h3>
                <p className="offer-card__fit">{t.fit}</p>
                <div className="price" data-price-tier={'price' in t && t.price ? t.price.tier : 'complexa'}>
                  {'price' in t && t.price ? (
                    launch ? (
                      <>
                        <span className="price__from">
                          <span className="nk-visually-hidden">{PRICING.srFrom} </span>
                          <s data-price="padrao">{t.price.standardLabel}</s>
                        </span>
                        <span className="price__row">
                          <span className="nk-visually-hidden">{PRICING.srTo} </span>
                          <span className="price__value" data-price="lancamento">
                            {t.price.launchLabel}
                          </span>
                          {/* solid, não soft: o soft de sucesso sobre o card claro do Sage Light fica em 4,25:1 (P-LIB-07) */}
                          <Badge tone="success" variant="solid" size="sm">
                            <span className="nk-visually-hidden">{PRICING.srPercent} </span>
                            <span data-price="percentual">−{t.price.percentLabel}</span>
                          </Badge>
                        </span>
                        <span className="price__savings" data-price="economia">
                          {PRICING.savings(t.price.savingsLabel)}
                        </span>
                        <span className="price__unit">{PRICING.launchUnit}</span>
                      </>
                    ) : (
                      <>
                        <span className="price__row">
                          <span className="price__value" data-price="padrao">
                            {t.price.standardLabel}
                          </span>
                        </span>
                        <span className="price__unit">{PRICING.unit}</span>
                      </>
                    )
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
                  <Link arrow {...trigger}>
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
        <div className="cards cards--2 cards--poster">
          <div className="poster-tile" data-criteria>
            <h3 className="poster-tile__title">{PRICING.criteria.title}</h3>
            <ul className="checklist checklist--sm">
              {PRICING.criteria.items.map((item) => (
                <li key={item}>
                  <Icon name="arrow-right" size="sm" color="var(--nk-color-accent)" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="poster-tile__text">{PRICING.criteria.note}</p>
          </div>
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
        <p className="center-note">{PRICING.hostingNote}</p>
      </div>
    </section>
  );
}
