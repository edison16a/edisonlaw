import { rgba } from '../../color';
import { linear } from '../../draw/gradients';
import { fill, stroke } from '../../draw/paint';
import { horizontalLink } from '../../draw/paths';
import { circle } from '../../draw/shapes';
import { chance, jitter } from '../../random';
import type { Random } from '../../types';

/**
 * Weighted ensemble walkers: every iteration a walker may split in two (halving its weight),
 * and when there are too many, the lightest neighbours merge back together.
 */

interface Walker {
  y: number;
  weight: number;
  /** Index of the walker it split from this iteration, so fresh siblings never merge straight back. */
  parent: number;
}

interface Segment {
  x0: number;
  y0: number;
  x1: number;
  /** The walker this line runs into. Merging repoints it at the survivor. */
  end: Walker;
  weight: number;
}

export const ITERATIONS = { x0: 96, step: 104, count: 8 } as const;
const TOP = 84;
const GAP = 40;

/** Lowest a walker may sit at `x`. The terminal window owns the lower left corner. */
const bottomAt = (x: number) => (x < 480 ? 352 : 556);
const MAX_WALKERS = 7;

/** Keeps walkers in order with a minimum gap, so lines never cross, and squeezes them into [TOP, bottom]. */
function settle(walkers: Walker[], bottom: number) {
  const room = bottom - TOP;
  const gap = Math.min(GAP, room / Math.max(1, walkers.length - 1));
  for (let j = 1; j < walkers.length; j++) walkers[j].y = Math.max(walkers[j].y, walkers[j - 1].y + gap);
  const first = walkers[0].y;
  const span = walkers[walkers.length - 1].y - first;
  if (span > room) {
    walkers.forEach((walker) => (walker.y = TOP + ((walker.y - first) * room) / span));
    return;
  }
  const shift = Math.max(0, TOP - first) - Math.max(0, first + span - bottom);
  walkers.forEach((walker) => (walker.y += shift));
}

/** Merges the lightest adjacent pair until the ensemble is back under the walker cap. */
function merge(walkers: Walker[], segments: Segment[]) {
  while (walkers.length > MAX_WALKERS) {
    let best = -1;
    let lightest = Infinity;
    for (let j = 0; j < walkers.length - 1; j++) {
      const combined = walkers[j].weight + walkers[j + 1].weight;
      if (walkers[j].parent !== walkers[j + 1].parent && combined < lightest) {
        best = j;
        lightest = combined;
      }
    }
    if (best < 0) return;
    const [a, b] = [walkers[best], walkers[best + 1]];
    const keep = a.weight >= b.weight ? a : b;
    const drop = keep === a ? b : a;
    keep.weight += drop.weight;
    // Lines that ended at the dropped walker now run into the survivor.
    segments.forEach((segment) => {
      if (segment.end === drop) segment.end = keep;
    });
    walkers.splice(walkers.indexOf(drop), 1);
  }
}

function simulate(random: Random) {
  const segments: Segment[] = [];
  let walkers: Walker[] = [{ y: 250, weight: 1, parent: 0 }];
  for (let i = 0; i < ITERATIONS.count; i++) {
    const x0 = ITERATIONS.x0 + i * ITERATIONS.step;
    const x1 = x0 + ITERATIONS.step;
    const next: Walker[] = [];
    walkers.forEach((walker, parent) => {
      const offsets = walker.weight > 0.1 && chance(random, 0.6) ? [-36, 36] : [0];
      offsets.forEach((offset) => {
        const end = { y: walker.y + offset + jitter(random, 18), weight: walker.weight / offsets.length, parent };
        segments.push({ x0, y0: walker.y, x1, end, weight: end.weight });
        next.push(end);
      });
    });
    merge(next, segments);
    settle(next, bottomAt(x1));
    walkers = next;
  }
  return segments;
}

const lineWidth = (weight: number) => 3 + 15 * Math.sqrt(weight);

export function paintTrajectories(ctx: CanvasRenderingContext2D, random: Random) {
  const segments = simulate(random);
  const end = ITERATIONS.x0 + ITERATIONS.count * ITERATIONS.step;
  const color = linear(ctx, ITERATIONS.x0, 0, end, 0, ['#39e3ff', '#5cffa4', '#ffe45c']);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  segments.forEach((segment) => {
    const path = horizontalLink([segment.x0, segment.y0], [segment.x1, segment.end.y]);
    stroke(ctx, path, rgba('#3fe6c8', 0.12), lineWidth(segment.weight) + 18);
  });
  ctx.restore();

  segments.forEach((segment) => {
    stroke(ctx, horizontalLink([segment.x0, segment.y0], [segment.x1, segment.end.y]), color, lineWidth(segment.weight));
  });

  // One ring per walker position, sized by the heaviest walker passing through it.
  const nodes = new Map<string, { x: number; y: number; weight: number }>();
  const touch = (x: number, y: number, weight: number) => {
    const key = `${x}:${Math.round(y)}`;
    const node = nodes.get(key);
    if (!node || node.weight < weight) nodes.set(key, { x, y, weight });
  };
  segments.forEach(({ x0, y0, x1, end, weight }) => {
    touch(x0, y0, weight);
    touch(x1, end.y, end.weight);
  });
  nodes.forEach(({ x, y, weight }) => {
    const radius = 5 + 7 * Math.sqrt(weight);
    fill(ctx, circle(x, y, radius), '#062230');
    stroke(ctx, circle(x, y, radius), color, 3.5);
  });
}
