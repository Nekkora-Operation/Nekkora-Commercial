import { Badge, Button, Icon, SectionHeader } from 'nekkora-lib';
import { whatsappUrl } from '../config';
import { StudioScene } from '../illustrations/Scenes';

const BENEFITS = [
  'Acelera a estruturação da automação',
  'Ajuda a documentar o processo, passo a passo',
  'Deixa claro o que será desenvolvido, antes de desenvolver',
  'Reduz retrabalho e idas e vindas',
  'Cria uma base organizada para escalar novas automações',
];

export function Studio() {
  return (
    <section id="studio" className="section" aria-labelledby="studio-title">
      <div className="wrap split">
        <div className="stack" style={{ gap: 28 }}>
          <SectionHeader
            titleId="studio-title"
            eyebrow="Studio · a porta de entrada"
            title="Transforme uma necessidade em automação, com clareza desde o início"
            description="O Studio é onde o seu processo ganha forma: você estrutura a automação, entende cada etapa e documenta o que precisa ser feito. Menos tempo em levantamento, mais velocidade para chegar à automação certa."
          />
          <div className="chips">
            <Badge tone="accent" variant="solid" icon="clock">
              Menos tempo no levantamento
            </Badge>
            <Badge tone="primary" variant="solid" icon="eye">
              Mais clareza
            </Badge>
            <Badge tone="info" variant="solid" icon="play">
              Mais velocidade
            </Badge>
          </div>
          <ul className="checklist">
            {BENEFITS.map((b) => (
              <li key={b}>
                <Icon name="check-circle" size="md" />
                {b}
              </li>
            ))}
          </ul>
          <div>
            <Button variant="outline" rightIcon="arrow-right" href={whatsappUrl('Olá! Quero conhecer o Studio da Nekkora.')}>
              Quero conhecer o Studio
            </Button>
          </div>
        </div>
        <div className="split__visual">
          <StudioScene />
        </div>
      </div>
    </section>
  );
}
