/**
 * Cores das ilustrações — variáveis CSS derivadas dos tokens do tema ativo (definidas em styles.css, bloco
 * "Paleta das ilustrações"). Assim as cenas e o mascote acompanham Midnight Blue, Sage Light ou qualquer tema.
 */
export const P = {
  bg: 'var(--ill-bg)',
  panel: 'var(--ill-panel)',
  panel2: 'var(--ill-panel2)',
  line: 'var(--ill-line)',
  plum: 'var(--ill-plum)',
  plum2: 'var(--ill-plum2)',
  mauve: 'var(--ill-mauve)',
  pink: 'var(--ill-pink)',
  pinkDeep: 'var(--ill-pink-deep)',
  blush: 'var(--ill-blush)',
  cream: 'var(--ill-cream)',
  ink: 'var(--ill-ink)',
  green: 'var(--ill-green)',
  red: 'var(--ill-red)',
  violet: 'var(--ill-violet)',
  amber: 'var(--ill-amber)',
  /** Mascote: cabeça, corpo e aro dos óculos (nos temas claros o aro fica escuro sobre o gato claro). */
  catHead: 'var(--ill-cat-head)',
  catBody: 'var(--ill-cat-body)',
  catFrame: 'var(--ill-cat-frame)',
} as const;
