import { Badge, Button, Card, Icon, Text, type IconName } from 'nekkora-lib';
import { whatsappUrl } from '../config';
import { NekoPeek } from '../illustrations/Scenes';

const PILLARS: [IconName, string][] = [
  ['studio', 'Studio'],
  ['server', 'Hospedagem'],
  ['pulse', 'Monitoramento'],
  ['headset', 'Suporte'],
];

/** Painel ilustrativo de operação (mock), montado com componentes da nekkora-lib. */
function OpsPanel() {
  return (
    <div className="ops-panel">
      <NekoPeek className="ops-panel__peek" />
      <Card className="ops-panel__card" variant="surface" padding="md" aria-label="Exemplo de painel de operação da Nekkora">
        <div className="ops-panel__bar">
          <span className="ops-panel__dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <Text variant="body-sm" weight="semibold" style={{ flex: 1 }}>
            Operação · hoje
          </Text>
          <Badge tone="success" variant="solid" size="sm" dot>
            Tudo operacional
          </Badge>
        </div>

        <div className="ops-panel__stats">
          <div className="ops-stat">
            <strong>156</strong>
            <span>Execuções</span>
          </div>
          <div className="ops-stat">
            <strong>98,1%</strong>
            <span>Sucesso</span>
          </div>
          <div className="ops-stat">
            <strong>3/3</strong>
            <span>Agentes</span>
          </div>
        </div>

        <svg className="ops-panel__chart" viewBox="0 0 320 72" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 58L32 50L64 54L96 36L128 42L160 26L192 32L224 18L256 24L288 12L320 16V72H0Z" fill="var(--nk-color-accent)" opacity="0.14" />
          <path
            d="M0 58L32 50L64 54L96 36L128 42L160 26L192 32L224 18L256 24L288 12L320 16"
            fill="none"
            stroke="var(--nk-color-accent)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <ul className="ops-list">
          <li>
            <Icon name="download" size="sm" color="var(--nk-color-text-secondary)" />
            <span>Download de Faturas</span>
            <time>10:24</time>
            <Badge tone="success" variant="solid" size="sm">
              Concluído
            </Badge>
          </li>
          <li>
            <Icon name="mail" size="sm" color="var(--nk-color-text-secondary)" />
            <span>Leitura de E-mails</span>
            <time>10:31</time>
            <Badge tone="info" variant="solid" size="sm">
              Em execução
            </Badge>
          </li>
          <li>
            <Icon name="alert" size="sm" color="var(--nk-color-warning)" />
            <span>Falha detectada e reprocessada</span>
            <time>09:58</time>
            <Badge tone="warning" variant="solid" size="sm">
              Tratada
            </Badge>
          </li>
        </ul>
      </Card>
    </div>
  );
}

export function Hero() {
  return (
    <section id="inicio" className="hero" aria-labelledby="hero-title">
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <Badge tone="accent" size="md" icon="sakura" style={{ alignSelf: 'flex-start' }}>
            Automação · Hospedagem · Monitoramento · Suporte
          </Badge>
          <h1 id="hero-title" className="hero__title">
            Automação com clareza, <em>operação com confiança.</em>
          </h1>
          <p className="hero__lead">
            Da estruturação da automação à hospedagem, monitoramento e suporte operacional. Tudo num só ecossistema, com
            quem acompanha a sua operação de perto.
          </p>
          <div className="hero__ctas">
            <Button size="lg" leftIcon="whatsapp" href={whatsappUrl()}>
              Falar no WhatsApp
            </Button>
            <Button size="lg" variant="secondary" rightIcon="arrow-right" href="#studio">
              Conhecer o Studio
            </Button>
          </div>
          <ul className="hero__pillars" aria-label="Pilares da Nekkora">
            {PILLARS.map(([icon, label]) => (
              <li key={label}>
                <Icon name={icon} size="sm" />
                {label}
              </li>
            ))}
          </ul>
        </div>
        <OpsPanel />
      </div>
    </section>
  );
}
