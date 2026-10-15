import { Card, CardHeader, Icon, SectionHeader, type IconName } from 'nekkora-lib';
import { TRANSPARENCY } from '../content';

function ListCard({ icon, iconTone, title, items, marker, exclusion }: { icon: IconName; iconTone: string; title: string; items: string[]; marker: IconName; exclusion?: boolean }) {
  return (
    <Card className="terms-card" variant="surface" padding="none" data-exclusion={exclusion ? 'transparencia' : undefined}>
      <CardHeader icon={icon} iconVariant="soft" title={title} divider />
      <ul className="terms-card__list">
        {items.map((item) => (
          <li key={item}>
            <Icon name={marker} size="sm" color={iconTone} />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function Transparency() {
  const { defined, excluded, dependencies, products } = TRANSPARENCY;
  return (
    <section id="transparencia" className="section section--band" aria-labelledby="transparencia-title">
      <div className="wrap stack">
        <SectionHeader titleId="transparencia-title" eyebrow={TRANSPARENCY.eyebrow} title={TRANSPARENCY.title} description={TRANSPARENCY.description} />
        <div className="cards cards--3">
          <ListCard icon="file" iconTone="var(--nk-color-success)" title={defined.title} items={defined.items} marker="check" />
          <ListCard icon="close" iconTone="var(--nk-color-danger-text)" title={excluded.title} items={excluded.items} marker="minus" exclusion />
          <ListCard icon="link" iconTone="var(--nk-color-info-text)" title={dependencies.title} items={dependencies.items} marker="arrow-right" />
        </div>
        <aside className="products-note" data-internal-products aria-labelledby="produtos-title">
          <Icon name="info" size="md" />
          <div>
            <h3 id="produtos-title">{products.title}</h3>
            <p>{products.text}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
