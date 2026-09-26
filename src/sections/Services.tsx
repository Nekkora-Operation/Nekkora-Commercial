import { Card, Icon, IconBox, Link, SectionHeader, type IconName } from 'nekkora-lib';

interface Service {
  icon: IconName;
  title: string;
  description: string;
  value: string;
  href: string;
}

const SERVICES: Service[] = [
  {
    icon: 'studio',
    title: 'Studio',
    description: 'Estruture e documente automações com mais clareza e velocidade.',
    value: 'Menos tempo no levantamento',
    href: '#studio',
  },
  {
    icon: 'server',
    title: 'Hospedagem',
    description: 'Execute automações em ambiente preparado e operado pela Nekkora.',
    value: 'Sem infraestrutura para cuidar',
    href: '#hospedagem',
  },
  {
    icon: 'pulse',
    title: 'Monitoramento',
    description: 'Acompanhe execuções, falhas e eventos com visibilidade operacional.',
    value: 'Você sabe o que está acontecendo',
    href: '#monitoramento',
  },
  {
    icon: 'headset',
    title: 'Suporte operacional',
    description: 'Conte com acompanhamento para sustentar sua operação com segurança.',
    value: 'Gente próxima, não um chamado perdido',
    href: '#suporte',
  },
];

export function Services() {
  return (
    <section id="entrega" className="section" aria-labelledby="entrega-title">
      <div className="wrap stack">
        <SectionHeader
          titleId="entrega-title"
          align="center"
          eyebrow="O que a Nekkora entrega"
          title="Da ideia à operação sustentada, num só lugar"
          description="Não paramos na entrega do robô. Ajudamos a estruturar, colocamos para rodar, acompanhamos e sustentamos."
        />
        <ul className="cards cards--4" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {SERVICES.map((s) => (
            <li key={s.title}>
              <Card className="service-card" variant="surface" padding="lg" interactive>
                <IconBox icon={s.icon} tone="accent" size="lg" />
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                <div className="service-card__value">
                  <Icon name="check-circle" size="sm" />
                  {s.value}
                </div>
                <Link href={s.href} arrow size="sm">
                  Saiba mais
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
