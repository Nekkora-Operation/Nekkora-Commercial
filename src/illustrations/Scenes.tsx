import type { ReactNode } from 'react';
import { Neko } from './Neko';
import { P } from './palette';

interface SceneProps {
  /** Texto alternativo (descrição da ilustração). */
  label: string;
  className?: string;
}

function Scene({ label, className, children }: SceneProps & { children: ReactNode }) {
  return (
    <svg className={className} viewBox="0 0 480 360" role="img" aria-label={label} preserveAspectRatio="xMidYMid meet">
      <title>{label}</title>
      {children}
    </svg>
  );
}

/** Brilho radial de fundo, discreto. */
function Glow({ cx, cy, r, color = P.pink, opacity = 0.16, id }: { cx: number; cy: number; r: number; color?: string; opacity?: number; id: string }) {
  return (
    <>
      <defs>
        <radialGradient id={id}>
          <stop offset="0%" stopColor={color} stopOpacity={opacity} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
    </>
  );
}

function Screen({ x, y, w, h, children }: { x: number; y: number; w: number; h: number; children?: ReactNode }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="10" fill={P.panel} stroke={P.line} strokeWidth="2" />
      <circle cx={x + 12} cy={y + 11} r="2.6" fill={P.line} />
      <circle cx={x + 21} cy={y + 11} r="2.6" fill={P.line} />
      <circle cx={x + 30} cy={y + 11} r="2.6" fill={P.line} />
      {children}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Monitoramento: gato numa central de telas                          */
/* ------------------------------------------------------------------ */
export function ObservabilityScene({ className }: { className?: string }) {
  return (
    <Scene className={className} label="Gato de óculos numa central de monitoramento, com gráficos de execução, status e um alerta em destaque">
      <Glow id="g-obs" cx={240} cy={150} r={200} />
      {/* tela principal: execuções ao longo do dia */}
      <Screen x={118} y={26} w={244} h={150}>
        <path d="M134 150H346M134 122H346M134 94H346" stroke={P.line} strokeWidth="1" />
        <path d="M134 140L166 126L196 132L228 100L258 110L290 78L322 88L346 60V160H134Z" fill={P.pink} opacity="0.14" />
        <path d="M134 140L166 126L196 132L228 100L258 110L290 78L322 88L346 60" fill="none" stroke={P.pink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="346" cy="60" r="5" fill={P.pink} stroke={P.panel} strokeWidth="2" />
        <rect x="300" y="36" width="46" height="12" rx="6" fill={P.plum} />
      </Screen>
      {/* tela esquerda: volume por processo */}
      <Screen x={22} y={64} w={104} h={96}>
        <rect x="36" y="118" width="12" height="28" rx="3" fill={P.mauve} />
        <rect x="54" y="100" width="12" height="46" rx="3" fill={P.mauve} />
        <rect x="72" y="88" width="12" height="58" rx="3" fill={P.pink} />
        <rect x="90" y="108" width="12" height="38" rx="3" fill={P.mauve} />
        <rect x="108" y="124" width="10" height="22" rx="3" fill={P.mauve} opacity="0.7" />
      </Screen>
      {/* tela direita: status dos agentes */}
      <Screen x={354} y={64} w={104} h={96}>
        {[92, 112, 132].map((cy, i) => (
          <g key={cy}>
            <circle cx="372" cy={cy} r="5" fill={i === 2 ? P.red : P.green} />
            <rect x="384" y={cy - 4} width={i === 1 ? 44 : 58} height="8" rx="4" fill={P.line} />
          </g>
        ))}
      </Screen>
      {/* alerta */}
      <g>
        <circle cx="444" cy="54" r="17" fill={P.red} opacity="0.18" />
        <circle cx="444" cy="54" r="11" fill={P.red} />
        <path d="M444 48.5V55M444 59H444.01" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" />
      </g>
      {/* mesa */}
      <rect x="40" y="330" width="400" height="8" rx="4" fill={P.line} />
      <Neko x={168} y={164} scale={1.12} look={1} lookUp />
    </Scene>
  );
}

/* ------------------------------------------------------------------ */
/* Hospedagem: gato guardando o rack de servidores                    */
/* ------------------------------------------------------------------ */
export function HostingScene({ className }: { className?: string }) {
  const units = [58, 110, 162, 214, 266];
  return (
    <Scene className={className} label="Gato de óculos guardando um rack de servidores protegido por um escudo">
      <Glow id="g-host" cx={320} cy={180} r={190} />
      {/* rack */}
      <rect x="236" y="34" width="176" height="292" rx="14" fill={P.panel} stroke={P.line} strokeWidth="2" />
      {units.map((y, i) => (
        <g key={y}>
          <rect x="252" y={y} width="144" height="42" rx="7" fill={P.panel2} stroke={P.line} strokeWidth="1.5" />
          <circle cx="270" cy={y + 21} r="4.5" fill={i === 3 ? P.pink : P.green} />
          <circle cx="284" cy={y + 21} r="4.5" fill={P.green} opacity={i === 1 ? 0.35 : 1} />
          <path d={`M304 ${y + 15}H380M304 ${y + 21}H380M304 ${y + 27}H380`} stroke={P.line} strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
      <rect x="236" y="326" width="176" height="6" rx="3" fill={P.line} />
      {/* escudo */}
      <g transform="translate(74 30)">
        <path d="M44 0L0 16V46C0 72 18 92 44 102C70 92 88 72 88 46V16Z" fill={P.pinkDeep} />
        <path d="M44 10L10 22V46C10 66 24 82 44 90Z" fill="#FFFFFF" opacity="0.1" />
        <path d="M26 50L39 63L63 38" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* piso */}
      <rect x="30" y="330" width="420" height="8" rx="4" fill={P.line} />
      <Neko x={46} y={164} scale={1.12} look={1} />
    </Scene>
  );
}

/* ------------------------------------------------------------------ */
/* Delivery: gato analisando o fluxo (blueprint) e a documentação       */
/* ------------------------------------------------------------------ */
export function DeliveryScene({ className }: { className?: string }) {
  return (
    <Scene className={className} label="Gato de óculos analisando o fluxo de uma automação num quadro e um documento gerado ao lado">
      <Glow id="g-studio" cx={300} cy={140} r={200} />
      {/* quadro com grade */}
      <rect x="150" y="24" width="306" height="222" rx="14" fill={P.panel} stroke={P.line} strokeWidth="2" />
      <g stroke={P.line} strokeWidth="1" opacity="0.7">
        {[62, 100, 138, 176, 214].map((y) => <path key={y} d={`M162 ${y}H444`} />)}
        {[200, 250, 300, 350, 400].map((x) => <path key={x} d={`M${x} 36V234`} />)}
      </g>
      {/* fluxo */}
      <g fill="none" stroke={P.mauve} strokeWidth="2.5" strokeLinecap="round">
        <path d="M232 70H270" />
        <path d="M322 70H350V104" />
        <path d="M350 150V176H322" />
        <path d="M270 176H232" />
      </g>
      <rect x="176" y="56" width="56" height="28" rx="8" fill={P.plum2} />
      <rect x="270" y="56" width="52" height="28" rx="8" fill={P.pinkDeep} />
      <path d="M350 104L372 127L350 150L328 127Z" fill={P.plum} stroke={P.pink} strokeWidth="2" />
      <rect x="270" y="162" width="52" height="28" rx="8" fill={P.plum2} />
      <rect x="176" y="162" width="56" height="28" rx="8" fill={P.plum2} />
      <path d="M186 70H222M280 70H312M186 176H222M280 176H312" stroke={P.blush} strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" />
      {/* documento gerado */}
      <g transform="translate(360 150) rotate(4)">
        <rect width="104" height="136" rx="10" fill={P.cream} />
        <rect x="14" y="16" width="56" height="8" rx="4" fill={P.pinkDeep} />
        {[38, 52, 66, 80].map((y, i) => (
          <g key={y}>
            <path d={`M14 ${y + 4}L18 ${y + 8}L25 ${y}`} fill="none" stroke={P.green} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="32" y={y} width={i % 2 ? 44 : 58} height="7" rx="3.5" fill={P.mauve} opacity="0.45" />
          </g>
        ))}
        <rect x="14" y="102" width="76" height="20" rx="6" fill={P.plum2} opacity="0.2" />
      </g>
      {/* lupa */}
      <g transform="translate(118 196)">
        <circle cx="22" cy="22" r="18" fill={P.cream} fillOpacity="0.12" stroke={P.blush} strokeWidth="5" />
        <path d="M35 35L50 50" stroke={P.blush} strokeWidth="7" strokeLinecap="round" />
      </g>
      <rect x="20" y="330" width="440" height="8" rx="4" fill={P.line} />
      <Neko x={4} y={164} scale={1.12} look={1} lookUp />
    </Scene>
  );
}

/* ------------------------------------------------------------------ */
/* Suporte: gato atendendo, com mensagens e alertas resolvidos         */
/* ------------------------------------------------------------------ */
export function SupportScene({ className }: { className?: string }) {
  return (
    <Scene className={className} label="Gato de óculos com fone de atendimento, cercado de mensagens e alertas resolvidos">
      <Glow id="g-sup" cx={240} cy={200} r={200} />
      {/* mensagem do cliente */}
      <g>
        <path d="M30 58C30 50 36 44 44 44H164C172 44 178 50 178 58V96C178 104 172 110 164 110H70L48 126V110H44C36 110 30 104 30 96Z" fill={P.panel2} stroke={P.line} strokeWidth="2" />
        <rect x="48" y="62" width="100" height="9" rx="4.5" fill={P.mauve} opacity="0.7" />
        <rect x="48" y="80" width="70" height="9" rx="4.5" fill={P.mauve} opacity="0.45" />
      </g>
      {/* resposta da Nekkora */}
      <g>
        <path d="M300 128C300 120 306 114 314 114H436C444 114 450 120 450 128V162C450 170 444 176 436 176H432V192L412 176H314C306 176 300 170 300 162Z" fill={P.pinkDeep} />
        <rect x="318" y="131" width="104" height="9" rx="4.5" fill="#FFFFFF" opacity="0.85" />
        <rect x="318" y="149" width="72" height="9" rx="4.5" fill="#FFFFFF" opacity="0.55" />
      </g>
      {/* notificações resolvidas */}
      <g>
        <rect x="302" y="30" width="148" height="56" rx="12" fill={P.panel} stroke={P.line} strokeWidth="2" />
        <circle cx="328" cy="58" r="12" fill={P.green} opacity="0.2" />
        <path d="M322 58L326.5 62.5L334 54" fill="none" stroke={P.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="348" y="48" width="84" height="8" rx="4" fill={P.mauve} opacity="0.7" />
        <rect x="348" y="62" width="56" height="8" rx="4" fill={P.mauve} opacity="0.45" />
      </g>
      <g>
        <rect x="36" y="150" width="120" height="44" rx="12" fill={P.panel} stroke={P.line} strokeWidth="2" />
        <circle cx="58" cy="172" r="10" fill={P.amber} opacity="0.25" />
        <path d="M58 166V173M58 177H58.01" stroke={P.amber} strokeWidth="2.6" strokeLinecap="round" />
        <rect x="76" y="167" width="62" height="8" rx="4" fill={P.mauve} opacity="0.6" />
      </g>
      <rect x="40" y="330" width="400" height="8" rx="4" fill={P.line} />
      <Neko x={168} y={164} scale={1.12} headset />
    </Scene>
  );
}

/** Gato espiando por cima de um painel (usado no hero). */
export function NekoPeek({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 128 124" aria-hidden="true" focusable="false">
      <Neko peek look={-1} />
    </svg>
  );
}
