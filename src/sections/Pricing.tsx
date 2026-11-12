import { Badge, Card, Icon, IconBox, Link, SectionHeader } from 'nekkora-lib';
import { NEW_CONDITIONS_START, isLaunchActive, launchState } from '../config';
import { PLANNED_SERVICES, PRICING } from '../content';
import { useRequestTrigger } from '../request';
import { Simulator } from './Simulator';

/**
 * Preços do Delivery (COM-VITRINE-001: individual e pacote de 3, no layout do mockup "modelo C"). Único bloco em que
 * valores podem aparecer: marcado com data-pricing e verificado por scripts/homologacao.mjs
 * (precos-so-no-bloco-de-precos). Os atributos data-price expõem cada valor à homologação. A campanha (faixa e regras)
 * controla só a comunicação promocional; os valores não mudam com a data. Só simples e média (V-04): demandas fora das
 * modalidades seguem pelos canais gerais, com avaliação individual, sem terceira categoria.
 */
export function Pricing() {
  // V-04: demandas fora das categorias seguem como solicitação de automação (Delivery), pela jornada existente
  const trigger = useRequestTrigger({ demand: 'automacao' });
  // Avaliado no carregamento da página: fora do período aprovado, só o preço padrão (COM-RELEASE-003-R1 §3.7, item 10).
  const launch = isLaunchActive();
  // Sem datas aprovadas, os preços de lançamento só aparecem como prévia de homologação — e a faixa diz isso.
  const preview = launch && launchState() === 'pendente';
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
            {preview && (
              <span className="launch-strip__preview" data-campanha="pendente">
                {PRICING.launch.pendingDates}
              </span>
            )}
            {/* COM-VITRINE-001 (V-02): sem a data de início, os valores novos não aparecem como já vigentes */}
            {!NEW_CONDITIONS_START && (
              <span className="launch-strip__preview" data-novas-condicoes="pendente">
                {PRICING.launch.pendingStart}
              </span>
            )}
          </p>
        )}
        {/* NEKKORA-COM-CONTRACT-001 (C-10): regras completas da campanha, só com datas aprovadas e campanha em vigor */}
        {launch && !preview && PRICING.launch.rules && (
          <details className="campaign-rules" data-campanha-regras>
            <summary>{PRICING.launch.rules.title}</summary>
            <ul className="checklist checklist--sm">
              {PRICING.launch.rules.items.map((item) => (
                <li key={item}>
                  <Icon name="arrow-right" size="sm" color="var(--nk-color-accent)" />
                  {item}
                </li>
              ))}
            </ul>
          </details>
        )}
        <ul className="cards cards--2 cards--poster plain-list price-cards">
          {PRICING.tiers.map((t) => (
            <li key={t.title}>
              <Card className="offer-card" variant={t.variant} padding="lg">
                <span className="price-overline">{t.overline}</span>
                <h3>{t.title}</h3>
                <p className="offer-card__fit">{t.fit}</p>
                {/* COM-VITRINE-001 (V-07): individual, pacote de 3 e economia calculada — iguais em qualquer data */}
                <div className="price" data-price-tier={t.price.tier}>
                  <span className="price__row">
                    <span className="price__value" data-price="individual">
                      {t.price.individualLabel}
                    </span>
                  </span>
                  <span className="price__unit">{PRICING.unit}</span>
                  <span className="price__package">
                    <strong data-price="pacote">{t.price.packageLabel}</strong> <span>{PRICING.packageUnit}</span>
                  </span>
                  <span className="price__savings">
                    <span data-price="economia">{PRICING.savings(t.price.savingsLabel)}</span> <span className="price__unit">{PRICING.savingsBasis}</span>
                  </span>
                </div>
              </Card>
            </li>
          ))}
        </ul>
        {/* COM-VITRINE-001 (V-04): demandas fora das modalidades, pelos canais gerais — sem terceira categoria */}
        <p className="center-note other-demand" data-outras-demandas>
          {PRICING.other.text}{' '}
          <Link arrow {...trigger}>
            {PRICING.other.cta}
          </Link>
        </p>
        {/* NEKKORA-CALC-001: logo abaixo dos cartões, no mesmo bloco data-pricing (preços só aparecem aqui) */}
        <Simulator />
        <div className="cards cards--3 cards--poster price-notes">
          {PRICING.notes.map((n) => (
            <div key={n.title} className="poster-tile poster-tile--row" data-nota={n.title === 'A automação é sua' ? 'titularidade' : undefined}>
              <IconBox icon={n.icon} tone={n.tone} variant="soft" size="md" />
              <div>
                <h3 className="poster-tile__title">{n.title}</h3>
                <p className="poster-tile__text">{n.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="cards cards--2 cards--poster">
          <div className="poster-tile" data-criteria id="criterios-categoria" tabIndex={-1}>
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
        {/* COM-VITRINE-001 (V-06): Monitor e AI em preparação, valores previstos e o aviso; sem contratação */}
        <div className="poster-tile planned" id="servicos-em-preparacao" data-servicos-previstos tabIndex={-1}>
          <h3 className="poster-tile__title">{PLANNED_SERVICES.title}</h3>
          <ul className="cards cards--2 plain-list planned__list">
            {PLANNED_SERVICES.items.map((s) => (
              <li key={s.id} className="planned__item" data-servico={s.id}>
                <span className="planned__head">
                  <strong>{s.name}</strong>
                  <Badge tone="info" variant="soft" size="sm">
                    {PLANNED_SERVICES.status}
                  </Badge>
                </span>
                <span className="planned__price">
                  <strong data-preco-previsto={s.id}>{s.price}</strong> <span className="price__unit">{s.unit}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="poster-tile__text" data-aviso-previstos>
            {PLANNED_SERVICES.notice} {PLANNED_SERVICES.note}
          </p>
        </div>
        <p className="center-note">{PRICING.hostingNote}</p>
      </div>
    </section>
  );
}
