import { SPARKLE } from '../palette';
import { range } from '../random';
import type { Random } from '../types';
import { fill, stroke } from './paint';
import { smoothOpen, type Point } from './paths';
import { circle, roundRect, sparkle } from './shapes';

/** The small playful accents shared by every cover: sparkles, dots, loops and confetti. */

export interface Spark {
  x: number;
  y: number;
  r: number;
  color?: string;
}

export function sparkles(ctx: CanvasRenderingContext2D, items: readonly Spark[]) {
  items.forEach(({ x, y, r, color = SPARKLE }) => fill(ctx, sparkle(x, y, r), color));
}

/** Evenly spaced dots, like a halftone swatch. */
export function dotGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cols: number,
  rows: number,
  gap: number,
  radius: number,
  color: string,
) {
  const path = new Path2D();
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = x + col * gap;
      const cy = y + row * gap;
      path.moveTo(cx + radius, cy);
      path.arc(cx, cy, radius, 0, Math.PI * 2);
    }
  }
  fill(ctx, path, color);
}

/** Loose hand drawn line with a loop in it, the ribbon motif of the set. */
export function loopRibbon(ctx: CanvasRenderingContext2D, from: Point, to: Point, loopRadius: number, color: string, width: number) {
  const [x0, y0] = from;
  const [x1, y1] = to;
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  const points: Point[] = [
    [x0, y0],
    [mx - loopRadius * 1.6, my + loopRadius * 0.3],
    [mx + loopRadius * 0.2, my + loopRadius],
    [mx + loopRadius * 0.9, my - loopRadius * 0.2],
    [mx, my - loopRadius * 0.9],
    [mx - loopRadius * 0.6, my - loopRadius * 0.1],
    [mx + loopRadius * 1.8, my + loopRadius * 0.2],
    [x1, y1],
  ];
  stroke(ctx, smoothOpen(points), color, width);
}

/** Scattered little rectangles and dots inside a box. */
export function confetti(
  ctx: CanvasRenderingContext2D,
  random: Random,
  box: { x: number; y: number; w: number; h: number },
  count: number,
  colors: readonly string[],
) {
  for (let i = 0; i < count; i++) {
    const x = range(random, box.x, box.x + box.w);
    const y = range(random, box.y, box.y + box.h);
    const color = colors[i % colors.length];
    if (i % 3 === 0) {
      fill(ctx, circle(x, y, range(random, 3, 6)), color);
      continue;
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(range(random, 0, Math.PI));
    fill(ctx, roundRect(-9, -3, 18, 6, 3), color);
    ctx.restore();
  }
}
