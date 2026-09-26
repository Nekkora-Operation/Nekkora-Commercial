import { IconBox, SectionHeader, type IconName } from 'nekkora-lib';
import { SupportScene } from '../illustrations/Scenes';

const ITEMS: [IconName, string, string][] = [
  ['message', 'Atendimento consultivo e operacional', 'Conversa direta com quem conhece a sua automação.'],
  ['eye', 'Acompanhamento contínuo', 'Olhamos a operação com você, não só quando algo quebra.'],
  ['alert', 'Ajuda nos incidentes', 'Analisamos a falha, corrigimos e explicamos o que aconteceu.'],
  ['refresh', 'Continuidade e evolução', 'Ajustes e melhorias conforme o seu processo muda.'],
];

export function Support() {
  return (
    <section id="suporte" className="section" aria-labelledby="suporte-title">
      <div className="wrap split">
        <div className="stack" style={{ gap: 28 }}>
          <SectionHeader
            titleId="suporte-title"
            eyebrow="Suporte operacional"
            title="Suporte próximo, operação assistida"
            description="Um serviço contínuo e especializado para sustentar a sua operação: acompanhamento, análise de falhas, sustentação e evolução."
          />
          <ul className="features">
            {ITEMS.map(([icon, title, text]) => (
              <li key={title} className="feature">
                <IconBox icon={icon} tone="accent" variant="soft" size="md" />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ul>
          <blockquote className="quote">Você não precisa resolver tudo sozinho: a sua operação tem alguém olhando por ela.</blockquote>
        </div>
        <div className="split__visual">
          <SupportScene />
        </div>
      </div>
    </section>
  );
}
