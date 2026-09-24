/**
 * The house style every cover shares, so the spiral reads as one set.
 * Light always comes from the top left, raised shapes cast a flat shadow down and right.
 */

/** Deep blue black used for dark shapes and shadows across the set. */
export const INK = '#15112e';

/** Warm off white for paper, cards and highlights. */
export const PAPER = '#fff8ee';

/** Sparkle accent that shows up on every cover. */
export const SPARKLE = '#fffbe6';

/** Flat offset shadow under raised shapes. */
export const DROP = { x: 10, y: 14, color: 'rgba(16, 10, 40, 0.28)' } as const;

/** Keep key shapes this far inside the edges, cards have rounded corners and bend. */
export const MARGIN = 56;

export interface Palette {
  /** Background gradient stops, top left to bottom right. */
  background: string[];
  /** Colours for the big shapes, loudest first. */
  shapes: string[];
  /** Dark accent used for silhouettes. */
  ink: string;
}

/** Palettes the generic painter picks from for projects without their own cover. */
export const FALLBACK_PALETTES: Palette[] = [
  { background: ['#fdf2e9', '#f4e3f1'], shapes: ['#ff8a3d', '#b57bff', '#ffcf4a', '#ff6f91'], ink: '#231942' },
  { background: ['#0d1b4c', '#2b1263'], shapes: ['#c6ff4f', '#3de0d0', '#ff6fb5', '#ffd166'], ink: '#070b24' },
  { background: ['#c9f7e4', '#8fd9ff'], shapes: ['#1f3bff', '#ff5e7e', '#ffd23f', '#12c4a1'], ink: '#0e1a40' },
  { background: ['#ff9a62', '#ff4f7b'], shapes: ['#ffe45e', '#2c1a5c', '#ffffff', '#6de2ff'], ink: '#2c1a5c' },
];
