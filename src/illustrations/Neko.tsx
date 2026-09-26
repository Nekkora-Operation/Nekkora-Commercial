import { P } from './palette';

export interface NekoProps {
  x?: number;
  y?: number;
  scale?: number;
  /** Para onde as pupilas olham: -1 esquerda · 0 frente · 1 direita. */
  look?: -1 | 0 | 1;
  /** Olhar levemente para cima. */
  lookUp?: boolean;
  /** Fone de atendimento (suporte). */
  headset?: boolean;
  /** Só a cabeça e as patinhas (espiando por cima de algo). */
  peek?: boolean;
}

/**
 * Mascote da Nekkora: gato de óculos Cat-Eye (o mesmo desenho do símbolo da marca).
 * Coordenadas internas: cabeça numa caixa de 128×128, busto até y≈150.
 */
export function Neko({ x = 0, y = 0, scale = 1, look = 0, lookUp = false, headset = false, peek = false }: NekoProps) {
  const dx = look * 3.2;
  const dy = lookUp ? -2.5 : 0;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* corpo */}
      {!peek && (
        <>
          <path d="M12 152C12 120 34 104 64 104C94 104 116 120 116 152Z" fill={P.plum} />
          <path d="M46 152C48 128 56 116 64 116C72 116 80 128 82 152Z" fill={P.plum2} opacity="0.55" />
        </>
      )}

      {/* cabeça */}
      <path
        d="M14 62L30 16L52 38Q64 34 76 38L98 16L114 62C118 92 94 112 64 112C34 112 10 92 14 62Z"
        fill={P.plum2}
        stroke={P.plum2}
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <path d="M30 28L24 46L40 38Z" fill={P.pink} opacity="0.45" stroke={P.pink} strokeOpacity="0.45" strokeWidth="3" strokeLinejoin="round" />
      <path d="M98 28L104 46L88 38Z" fill={P.pink} opacity="0.45" stroke={P.pink} strokeOpacity="0.45" strokeWidth="3" strokeLinejoin="round" />

      {/* bigodes */}
      <path d="M36 90L14 86M36 96L15 98M92 90L114 86M92 96L113 98" stroke={P.blush} strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />

      {/* óculos Cat-Eye */}
      <g stroke={P.pink} strokeWidth="5" strokeLinejoin="round">
        <path d="M29.9 64.9L26 50.5L38.9 55.9Z" fill={P.pink} />
        <path d="M98.1 64.9L102 50.5L89.1 55.9Z" fill={P.pink} />
        <circle cx="44" cy="70" r="15" fill={P.cream} />
        <circle cx="84" cy="70" r="15" fill={P.cream} />
      </g>
      <path d="M59 68Q64 63 69 68" fill="none" stroke={P.pink} strokeWidth="5" strokeLinecap="round" />
      <ellipse cx={44 + dx} cy={71 + dy} rx="3.4" ry="7.2" fill={P.ink} />
      <ellipse cx={84 + dx} cy={71 + dy} rx="3.4" ry="7.2" fill={P.ink} />
      <circle cx={46 + dx} cy={66.5 + dy} r="1.6" fill="#FFFFFF" />
      <circle cx={86 + dx} cy={66.5 + dy} r="1.6" fill="#FFFFFF" />

      {/* focinho */}
      <path d="M60.5 88.5H67.5L64 93Z" fill={P.pink} stroke={P.pink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M58 97Q61 100 64 96.5Q67 100 70 97" fill="none" stroke={P.pink} strokeOpacity="0.8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

      {/* fone de atendimento */}
      {headset && (
        <g>
          <path d="M17 62C15 2 113 2 111 62" fill="none" stroke={P.blush} strokeWidth="5" strokeLinecap="round" />
          <rect x="10" y="56" width="14" height="24" rx="6" fill={P.pink} />
          <rect x="104" y="56" width="14" height="24" rx="6" fill={P.pink} />
          <path d="M17 80C17 94 30 102 46 101" fill="none" stroke={P.blush} strokeWidth="3" strokeLinecap="round" />
          <circle cx="48" cy="101" r="4" fill={P.pink} />
        </g>
      )}

      {/* patinhas (modo espiando) */}
      {peek && (
        <g fill={P.plum2}>
          <rect x="24" y="104" width="26" height="16" rx="8" />
          <rect x="78" y="104" width="26" height="16" rx="8" />
          <path d="M32 113V118M38 113V118M86 113V118M92 113V118" stroke={P.bg} strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}
