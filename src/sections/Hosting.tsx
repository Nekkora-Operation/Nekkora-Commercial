import { Alert, Button, IconBox, SectionHeader, Text } from 'nekkora-lib';
import { HOSTING } from '../content';
import { HostingScene } from '../illustrations/Scenes';

export function Hosting() {
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
          <ul className="cards cards--4 plain-list">
            {HOSTING.services.map((s) => (
              <li key={s.title} className="service-item">
                <IconBox icon={s.icon} tone="accent" variant="soft" size="sm" />
                <h4>{s.title}</h4>
                <p>{s.text}</p>
                <p className="service-item__terms">
                  <span>{HOSTING.termsLabel}:</span> {s.terms}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
