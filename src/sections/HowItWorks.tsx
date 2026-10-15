import { Icon, SectionHeader, Steps, Text } from 'nekkora-lib';
import { HOW_IT_WORKS } from '../content';

export function HowItWorks() {
  const { timing } = HOW_IT_WORKS;
  return (
    <section id="como-funciona" className="section section--band" aria-labelledby="como-title">
      <div className="wrap stack">
        <SectionHeader titleId="como-title" eyebrow={HOW_IT_WORKS.eyebrow} title={HOW_IT_WORKS.title} description={HOW_IT_WORKS.description} />
        <div className="journey">
          <Steps items={HOW_IT_WORKS.steps} />
        </div>
        <div className="timing">
          <div className="timing__head">
            <Icon name="clock" size="md" />
            <Text id="prazo-title" variant="h4" as="h3">
              {timing.title}
            </Text>
          </div>
          <p>{timing.text}</p>
          <ul>
            {timing.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
