import { Card, IconBox, Logo, SectionHeader, type IconName } from 'nekkora-lib';

const ITEMS: [IconName, string, string][] = [
  ['layers', 'Produto e operação juntos', 'Studio, execução, monitoramento e suporte no mesmo ecossistema.'],
  ['studio', 'Studio como ponto de entrada', 'Todo projeto começa estruturado e documentado.'],
  ['server', 'Hospedagem das automações', 'Você não precisa manter infraestrutura própria.'],
  ['pulse', 'Observabilidade operacional', 'Execuções, falhas e eventos visíveis no dia a dia.'],
  ['headset', 'Suporte próximo', 'Pessoas que conhecem a sua operação, e não um atendimento genérico.'],
  ['refresh', 'Pensado para evoluir', 'Estrutura que cresce junto com o número de automações.'],
];

export function Differentials() {
  return (
    <section id="diferenciais" className="section" aria-labelledby="diferenciais-title">
      <div className="wrap stack">
        <SectionHeader
          titleId="diferenciais-title"
          eyebrow="Por que a Nekkora"
          title="Mais completo do que apenas desenvolver automações"
        />
        <ul className="cards cards--3" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {ITEMS.map(([icon, title, text]) => (
            <li key={title}>
              <Card className="service-card" variant="surface" padding="md">
                <IconBox icon={icon} tone="primary" size="md" />
                <h3 style={{ fontSize: 'var(--nk-font-size-lg)' }}>{title}</h3>
                <p>{text}</p>
              </Card>
            </li>
          ))}
        </ul>
        <div className="manifesto">
          <Logo variant="symbol" size={52} />
          <p>
            Não vendemos apenas automações. Entregamos <em>clareza, operação e continuidade.</em>
          </p>
        </div>
      </div>
    </section>
  );
}
