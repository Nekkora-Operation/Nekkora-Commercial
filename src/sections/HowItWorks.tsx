import { SectionHeader } from 'nekkora-lib';
import { HOW_IT_WORKS } from '../content';

export function HowItWorks() {
  return (
    <section id="como-funciona" className="section" aria-labelledby="como-title">
      <div className="wrap stack">
        <SectionHeader titleId="como-title" align="center" eyebrow={HOW_IT_WORKS.eyebrow} title={HOW_IT_WORKS.title} />
        <ol className="cards cards--3 cards--poster plain-list">
          {HOW_IT_WORKS.steps.map((s, i) => (
            <li key={s.title} className="poster-tile">
              <span className="poster-num" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="poster-tile__title">{s.title}</h3>
              <p className="poster-tile__text">{s.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
