import { rgba } from '../../color';
import { linear } from '../../draw/gradients';
import { fill, raised, stroke } from '../../draw/paint';
import { pill, roundRect } from '../../draw/shapes';
import { chevronGlyph, textBars, windowDots } from '../../draw/ui';

/** A small terminal window with progress bars and a bin histogram, the CLI dashboard itself. */

const PANEL = { x: 72, y: 392, w: 392, h: 196 } as const;
const TEXT = '#8fb6c4';
const ACCENT = '#5cffa4';

export function paintTerminal(ctx: CanvasRenderingContext2D) {
  const { x, y, w, h } = PANEL;
  const body = roundRect(x, y, w, h, 18);
  raised(ctx, body, rgba('#021017', 0.92), { color: 'rgba(0, 0, 0, 0.4)' });
  stroke(ctx, body, rgba('#5ce1ff', 0.28), 2);
  fill(ctx, roundRect(x, y, w, 34, [18, 18, 0, 0]), rgba('#0d2c38', 0.9));
  windowDots(ctx, x + 22, y + 17, 5.5, ['#ff5f6d', '#ffc24b', '#4fe38b']);

  const left = x + 26;
  stroke(ctx, chevronGlyph(left + 4, y + 60, 12), ACCENT, 3.5);
  textBars(ctx, left + 22, y + 55, [[54, 88, 40]], { height: 9, gap: 9, leading: 0, color: TEXT });

  // Progress rows: a short label, a track and a filled share.
  [0.82, 0.56, 0.34].forEach((share, row) => {
    const rowY = y + 86 + row * 26;
    fill(ctx, pill(left, rowY, 44, 9), rgba(TEXT, 0.7));
    fill(ctx, pill(left + 58, rowY - 2, 190, 13), rgba('#ffffff', 0.08));
    fill(ctx, pill(left + 58, rowY - 2, 190 * share, 13), linear(ctx, left + 58, 0, left + 248, 0, ['#39e3ff', ACCENT]));
  });

  // Bin population histogram on the right.
  const heights = [26, 44, 70, 92, 64, 48, 30, 18];
  heights.forEach((height, index) => {
    const barX = x + 290 + index * 11;
    fill(ctx, roundRect(barX, y + 164 - height, 7, height, 2), index === 3 ? '#ffe45c' : rgba(ACCENT, 0.8));
  });

  fill(ctx, pill(left, y + 166, 36, 9), rgba(TEXT, 0.5));
  fill(ctx, roundRect(left + 46, y + 160, 12, 20, 2), ACCENT);
}
