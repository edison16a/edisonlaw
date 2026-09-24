import { lighten, rgba } from '../../color';
import { contactShadow } from '../../draw/glow';
import { linear, radial } from '../../draw/gradients';
import { clipped, fill, stroke } from '../../draw/paint';
import type { Point } from '../../draw/paths';
import { circle, ellipse } from '../../draw/shapes';
import { jitter, range } from '../../random';
import type { Random } from '../../types';

/** The petri dish: glass walls, pink culture medium and a small neuron network, seen from above at an angle. */

export const DISH = { x: 512, y: 452, rx: 228, ry: 112, wall: 22 } as const;

const MEDIUM = '#ff7396';
const CELL = '#fff3f7';
const NUCLEUS = '#a3124f';

const SOMAS: Point[] = [
  [-128, -30],
  [4, -124],
  [128, -48],
  [62, 92],
  [-82, 104],
  [170, 96],
];

const AXONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [0, 4],
  [2, 3],
  [3, 4],
  [2, 5],
  [0, 3],
];

/** Neurons drawn flat in dish space. The caller squashes that space into the dish ellipse. */
function paintNeurons(ctx: CanvasRenderingContext2D, random: Random) {
  const axons = new Path2D();
  AXONS.forEach(([a, b]) => {
    const [x0, y0] = SOMAS[a];
    const [x1, y1] = SOMAS[b];
    axons.moveTo(x0, y0);
    axons.quadraticCurveTo((x0 + x1) / 2 + jitter(random, 40), (y0 + y1) / 2 + jitter(random, 40), x1, y1);
  });
  stroke(ctx, axons, rgba(CELL, 0.75), 4);

  const dendrites = new Path2D();
  SOMAS.forEach(([x, y]) => {
    const branches = 5;
    for (let i = 0; i < branches; i++) {
      const angle = (i / branches) * Math.PI * 2 + jitter(random, 0.4);
      const length = range(random, 26, 44);
      const ex = x + Math.cos(angle) * length;
      const ey = y + Math.sin(angle) * length;
      dendrites.moveTo(x, y);
      dendrites.lineTo(ex, ey);
      [-0.5, 0.5].forEach((fork) => {
        dendrites.moveTo(ex, ey);
        dendrites.lineTo(ex + Math.cos(angle + fork) * length * 0.45, ey + Math.sin(angle + fork) * length * 0.45);
      });
    }
  });
  stroke(ctx, dendrites, CELL, 5);

  SOMAS.forEach(([x, y]) => {
    fill(ctx, circle(x, y, 26), rgba(CELL, 0.28));
    fill(ctx, circle(x, y, 16), CELL);
    fill(ctx, circle(x + 2, y + 1, 7), NUCLEUS);
  });
}

export function paintDish(ctx: CanvasRenderingContext2D, random: Random) {
  const { x, y, rx, ry, wall } = DISH;
  contactShadow(ctx, x + 18, y + wall + 16, rx + 30, ry * 0.7, 0.4, '#0a3b3a');

  // Glass wall: the lower half of a second ellipse shows as the dish side.
  fill(ctx, ellipse(x, y + wall, rx, ry), linear(ctx, x - rx, 0, x + rx, 0, ['#d7fff6', '#ffffff', '#b7efe4']));
  fill(ctx, ellipse(x, y + wall, rx, ry), rgba('#0b5a55', 0.12));
  fill(ctx, ellipse(x, y, rx, ry), '#f4fffc');

  const inner = ellipse(x, y + 4, rx - 12, ry - 8);
  fill(ctx, inner, radial(ctx, x - 40, y - 20, rx, [lighten(MEDIUM, 0.45), MEDIUM, '#e0406e']));
  clipped(ctx, inner, () => {
    ctx.save();
    ctx.translate(x, y + 4);
    ctx.scale(1, (ry - 8) / (rx - 12));
    paintNeurons(ctx, random);
    ctx.restore();
    // Ripples where the droplet lands.
    [26, 50, 78].forEach((radius, index) => {
      stroke(ctx, ellipse(x, y + 2, radius, radius * 0.48), rgba('#ffffff', 0.7 - index * 0.2), 3);
    });
  });

  stroke(ctx, ellipse(x, y, rx - 4, ry - 3), rgba('#ffffff', 0.9), 5);
  stroke(ctx, ellipse(x, y, rx, ry), rgba('#0b5a55', 0.25), 2);
  // Glass glint on the near rim.
  const glint = new Path2D();
  glint.ellipse(x, y, rx - 4, ry - 3, 0, Math.PI * 0.62, Math.PI * 0.86);
  stroke(ctx, glint, '#ffffff', 7);
}
