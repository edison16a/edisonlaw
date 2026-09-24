import { circle, fillRound } from './shapes';
import { measure, text } from './text';

/** Small dashboard pieces: pills, progress bars and avatars. */

interface PillOptions {
  bg: string;
  color: string;
  size?: number;
  /** Coloured dot before the label, like a status indicator. */
  dot?: string;
}

/** Rounded label. Returns its width. `y` is the vertical middle. */
export function pill(ctx: CanvasRenderingContext2D, label: string, x: number, y: number, { bg, color, size = 12, dot }: PillOptions) {
  const style = { size, weight: 600, family: 'sans', color } as const;
  const padding = size * 0.75;
  const dotSpace = dot ? size * 0.9 : 0;
  const width = measure(ctx, label, style) + padding * 2 + dotSpace;
  const height = size * 1.75;
  fillRound(ctx, x, y - height / 2, width, height, height / 2, bg);
  if (dot) circle(ctx, x + padding + size * 0.25, y, size * 0.25, dot);
  text(ctx, label, x + padding + dotSpace, y + 1, style);
  return width;
}

export function progressBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fraction: number, color: string, track: string) {
  fillRound(ctx, x, y, w, h, h / 2, track);
  if (fraction > 0) fillRound(ctx, x, y, Math.max(h, w * Math.min(1, fraction)), h, h / 2, color);
}

/** Round avatar with initials. */
export function avatar(ctx: CanvasRenderingContext2D, initials: string, x: number, y: number, radius: number, bg: string, color = '#ffffff') {
  circle(ctx, x, y, radius, bg);
  text(ctx, initials, x, y + 1, { size: radius * 0.8, weight: 600, family: 'sans', color, align: 'center' });
}
