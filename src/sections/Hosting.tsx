import { Alert, Button, Icon, IconBox, SectionHeader, Text } from 'nekkora-lib';
import { HOSTING } from '../content';
import { useMediaQuery } from '../hooks';
import { HostingScene } from '../illustrations/Scenes';

type Service = (typeof HOSTING.services)[number];

/** Desktop e tablet: catálogo completo, sempre expandido. */
function ServiceCard({ s }: { s: Service }) {
  return (
    <li className="service-item">
      <IconBox icon={s.icon} tone="accent" variant="soft" size="sm" />
      <h4>{s.title}</h4>
      <p>{s.text}</p>
      <p className="service-item__terms">
        <span>{HOSTING.termsLabel}:</span> {s.terms}
      </p>
    </li>
  );
}

/**
 * Celular: acordeão nativo (<details>/<summary>), operável por teclado (Tab + Enter/Espaço) e lido como botão
 * expansível. O resumo mostra o título E a condição comercial ("Como é contratado"), que nunca fica recolhida;
 * só a definição do serviço abre ao expandir.
 */
function ServiceAccordionItem({ s }: { s: Service }) {
  return (
    <li className="service-item service-item--accordion">
      <details>
        <summary>
          <IconBox icon={s.icon} tone="accent" variant="soft" size="sm" />
          <span className="service-item__summary">
            <span className="service-item__title">{s.title}</span>
            <span className="service-item__terms">
              <span>{HOSTING.termsLabel}:</span> {s.terms}
            </span>
          </span>
          <Icon name="chevron-down" size="sm" className="service-item__chevron" />
        </summary>
        <p className="service-item__definition">{s.text}</p>
      </details>
    </li>
  );
}

export function Hosting() {
  const compact = useMediaQuery('(max-width: 640px)');
  return (
    <section id="hosting" className="section" aria-labelledby="hosting-title">
      <div className="wrap stack" style={{ gap: 48 }}>
        <div className="split split--reverse">
          <div className="stack" style={{ gap: 24 }}>
            <SectionHeader titleId="hosting-title" eyebrow={HOSTING.eyebrow} title={HOSTING.title} description={HOSTING.description} />
            <Alert tone="info" title={HOSTING.availability.title} live="off">
              {HOSTING.availability.text}
            </Alert>
            <div>
              <Button variant="outline" rightIcon="arrow-right" href="#contato">
                {HOSTING.cta}
              </Button>
            </div>
          </div>
          <div className="split__visual">
            <HostingScene />
          </div>
        </div>

        <div className="stack" style={{ gap: 20 }}>
          <Text variant="h3" as="h3">
            {HOSTING.catalogTitle}
          </Text>
          {compact && <p className="note">{HOSTING.accordionHint}</p>}
          <ul className={compact ? 'service-accordion plain-list' : 'cards cards--4 plain-list'} data-hosting-catalog={compact ? 'acordeao' : 'expandido'}>
            {HOSTING.services.map((s) => (compact ? <ServiceAccordionItem key={s.title} s={s} /> : <ServiceCard key={s.title} s={s} />))}
          </ul>
        </div>
      </div>
    </section>
  );
}
