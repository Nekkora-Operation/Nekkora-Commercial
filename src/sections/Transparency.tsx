import { Icon, IconBox, SectionHeader, type IconName } from 'nekkora-lib';
import { TRANSPARENCY } from '../content';

type Tone = 'success' | 'danger' | 'info';

function ListTile({ icon, tone, title, items, marker, markerColor, exclusion }: { icon: IconName; tone: Tone; title: string; items: string[]; marker: IconName; markerColor: string; exclusion?: boolean }) {
  return (
    <div className="poster-tile" data-exclusion={exclusion ? 'transparencia' : undefined}>
      <IconBox icon={icon} tone={tone} variant="solid" size="lg" />
      <h3 className="poster-tile__title poster-tile__title--lg">{title}</h3>
      <ul className="checklist checklist--sm">
        {items.map((item) => (
          <li key={item}>
            <Icon name={marker} size="sm" color={markerColor} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Transparency() {
  const { defined, excluded, dependencies } = TRANSPARENCY;
  return (
    <section id="transparencia" className="section" aria-labelledby="transparencia-title">
      <div className="wrap stack">
        <SectionHeader titleId="transparencia-title" align="center" eyebrow={TRANSPARENCY.eyebrow} title={TRANSPARENCY.title} description={TRANSPARENCY.description} />
        <div className="cards cards--3 cards--poster">
          <ListTile icon="file" tone="success" title={defined.title} items={defined.items} marker="check" markerColor="var(--nk-color-success)" />
          <ListTile icon="close" tone="danger" title={excluded.title} items={excluded.items} marker="minus" markerColor="var(--nk-color-danger-text)" exclusion />
          <ListTile icon="link" tone="info" title={dependencies.title} items={dependencies.items} marker="arrow-right" markerColor="var(--nk-color-info-text)" />
        </div>
      </div>
    </section>
  );
}
