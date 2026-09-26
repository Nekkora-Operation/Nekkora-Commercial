import { SectionHeader, Steps } from 'nekkora-lib';

export function HowItWorks() {
  return (
    <section id="como-funciona" className="section section--band" aria-labelledby="como-title">
      <div className="wrap stack">
        <SectionHeader
          titleId="como-title"
          eyebrow="Como funciona"
          title="Uma jornada clara, do primeiro contato à operação contínua"
          description="Cada etapa tem dono, entregável e acompanhamento. Você sabe onde está e o que vem depois."
        />
        <div className="journey">
          <Steps
            items={[
              {
                icon: 'message',
                title: 'Entendemos sua necessidade',
                description: 'Conversamos sobre o processo, as regras e o resultado esperado.',
              },
              {
                icon: 'studio',
                title: 'Estruturamos no Studio',
                description: 'O processo vira desenho e documentação, prontos para desenvolver.',
              },
              {
                icon: 'server',
                title: 'Executamos a automação',
                description: 'A automação roda em ambiente preparado e operado pela Nekkora.',
              },
              {
                icon: 'pulse',
                title: 'Monitoramos a operação',
                description: 'Acompanhamos execuções, falhas e eventos no dia a dia.',
              },
              {
                icon: 'headset',
                title: 'Apoiamos a sustentação',
                description: 'Tratamos incidentes e evoluímos a automação com você.',
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
