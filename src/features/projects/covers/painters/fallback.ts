import { darken, lighten, rgba } from '../color';
import { confetti, dotGrid, loopRibbon, sparkles } from '../draw/decor';
import { contactShadow } from '../draw/glow';
import { paintBackground, sphere } from '../draw/gradients';
import { fill, raised } from '../draw/paint';
import { circle, roundRect, star } from '../draw/shapes';
import { FALLBACK_PALETTES } from '../palette';
import { jitter, pick, range } from '../random';
import type { Scene } from '../types';

/** Generic seeded composition for projects without their own painter: a big sun, a star and a ribbon. */
export function paintFallback({ ctx, w, h, random }: Scene) {
  const palette = pick(random, FALLBACK_PALETTES);
  const [main, second, third, fourth] = palette.shapes;
  paintBackground(ctx, w, h, palette.background, range(random, 20, 60));

  // Quarter disc anchored in a corner, echoing the big shapes in the reference cards.
  const corner = random() < 0.5 ? 0 : w;
  fill(ctx, circle(corner, h + 30, range(random, 220, 280)), rgba(second, 0.85));

  const cx = w * 0.5 + jitter(random, 70);
  const cy = h * 0.5 + jitter(random, 30);
  const radius = range(random, 170, 200);
  contactShadow(ctx, cx + 20, cy + radius * 0.95, radius * 0.9, 26, 0.3, palette.ink);
  raised(ctx, circle(cx, cy, radius), sphere(ctx, cx, cy, radius, [lighten(main, 0.35), main, darken(main, 0.25)]));

  loopRibbon(ctx, [48, cy + jitter(random, 80)], [w - 48, cy + jitter(random, 80)], 46, rgba(fourth, 0.9), 12);

  const starX = cx + range(random, 40, 110);
  const starY = cy + radius * 0.6;
  raised(ctx, star(starX, starY, 92, 50, 7, range(random, 0, Math.PI)), palette.ink);

  ctx.save();
  ctx.translate(cx + radius + 90, cy - radius * 0.55);
  ctx.rotate(range(random, -0.5, 0.5));
  raised(ctx, roundRect(-50, -50, 100, 100, 24), third);
  ctx.restore();

  dotGrid(ctx, 96, 96, 5, 4, 20, 3.5, rgba(palette.ink, 0.5));
  confetti(ctx, random, { x: 80, y: 80, w: w - 160, h: h - 160 }, 14, [second, third, fourth]);
  sparkles(ctx, [
    { x: cx - radius * 0.9, y: cy - radius * 0.9, r: 26 },
    { x: w - 120, y: h - 110, r: 18 },
  ]);
}
