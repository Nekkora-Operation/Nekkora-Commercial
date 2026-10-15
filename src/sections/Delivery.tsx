import { Button, Card, Icon, IconBox, SectionHeader, Text } from 'nekkora-lib';
import { DELIVERY } from '../content';
import { DeliveryScene } from '../illustrations/Scenes';

export function Delivery() {
  const { applications } = DELIVERY;
  return (
    <section id="delivery" className="section" aria-labelledby="delivery-title">
      <div className="wrap stack" style={{ gap: 56 }}>
        <div className="split">
          <div className="stack" style={{ gap: 28 }}>
            <SectionHeader titleId="delivery-title" eyebrow={DELIVERY.eyebrow} title={DELIVERY.title} description={DELIVERY.description} />
            <ul className="features features--2">
              {DELIVERY.features.map((f) => (
                <li key={f.title} className="feature">
                  <IconBox icon={f.icon} tone="accent" variant="soft" size="md" />
                  <div>
                    <h3>{f.title}</h3>
                    <p>{f.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="note">
              <Icon name="info" size="sm" />
              <span>{DELIVERY.licenses}</span>
            </p>
          </div>
          <div className="split__visual">
            <DeliveryScene />
          </div>
        </div>

        <Card className="examples" variant="outlined" padding="lg" aria-labelledby="exemplos-title">
          <div className="examples__head">
            <Text id="exemplos-title" variant="h4" as="h3">
              {applications.title}
            </Text>
            <Text variant="body-sm" color="secondary">
              {applications.caption}
            </Text>
          </div>
          <ul className="examples__list">
            {applications.items.map((item) => (
              <li key={item}>
                <Icon name="workflow" size="sm" />
                {item}
              </li>
            ))}
          </ul>
          <div>
            <Button variant="outline" rightIcon="arrow-right" href="#contato">
              {DELIVERY.cta}
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
