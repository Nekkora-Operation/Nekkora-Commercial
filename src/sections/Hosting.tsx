import { IconBox, SectionHeader, type IconName } from 'nekkora-lib';
import { HostingScene } from '../illustrations/Scenes';

const FEATURES: [IconName, string, string][] = [
  ['server', 'Ambiente preparado', 'Máquinas e agentes configurados para rodar suas automações com estabilidade.'],
  ['shield', 'Segurança e controle', 'Acessos organizados e credenciais tratadas com cuidado, num ambiente controlado.'],
  ['layers', 'Organização e padrão', 'Cada automação no seu lugar, com versões e agendas sob controle.'],
  ['clock', 'Execução no horário certo', 'Agendamentos e filas gerenciados pela Nekkora, sem depender de alguém lembrar.'],
];

export function Hosting() {
  return (
    <section id="hospedagem" className="section" aria-labelledby="hospedagem-title">
      <div className="wrap split split--reverse">
        <div className="stack" style={{ gap: 28 }}>
          <SectionHeader
            titleId="hospedagem-title"
            eyebrow="Hospedagem de automações"
            title="Não somos só software. Também operamos a execução."
            description="Você não precisa manter servidores, máquinas ou agendas por conta própria. Sua automação roda num ambiente preparado e operado pela Nekkora, com estrutura pensada para isso."
          />
          <ul className="features features--2">
            {FEATURES.map(([icon, title, text]) => (
              <li key={title} className="feature">
                <IconBox icon={icon} tone="accent" variant="soft" size="md" />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="split__visual">
          <HostingScene />
        </div>
      </div>
    </section>
  );
}
