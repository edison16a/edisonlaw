/** A colour stop: plain colours are spread evenly, tuples pin an offset. */
export type Stop = string | readonly [offset: number, color: string];

function addStops(gradient: CanvasGradient, stops: readonly Stop[]) {
  const last = Math.max(1, stops.length - 1);
  stops.forEach((stop, index) => {
    if (typeof stop === 'string') gradient.addColorStop(index / last, stop);
    else gradient.addColorStop(stop[0], stop[1]);
  });
  return gradient;
}

export function linear(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  stops: readonly Stop[],
) {
  return addStops(ctx.createLinearGradient(x0, y0, x1, y1), stops);
}

export function radial(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, stops: readonly Stop[]) {
  return addStops(ctx.createRadialGradient(x, y, 0, x, y, radius), stops);
}

/**
 * Sphere style shading for a circle: a highlight toward the top left fading to `edge`.
 * Gives flat discs a little volume without leaving the flat look.
 */
export function sphere(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  [highlight, body, edge]: readonly [string, string, string],
) {
  const gradient = ctx.createRadialGradient(x - radius * 0.35, y - radius * 0.4, radius * 0.05, x, y, radius);
  gradient.addColorStop(0, highlight);
  gradient.addColorStop(0.45, body);
  gradient.addColorStop(1, edge);
  return gradient;
}

/** Fills the whole cover with a gradient running at `angle` degrees (0 is left to right, 90 is top to bottom). */
export function paintBackground(ctx: CanvasRenderingContext2D, w: number, h: number, stops: readonly Stop[], angle = 35) {
  const radians = (angle * Math.PI) / 180;
  const dx = Math.cos(radians);
  const dy = Math.sin(radians);
  const half = (Math.abs(dx) * w + Math.abs(dy) * h) / 2;
  ctx.fillStyle = linear(ctx, w / 2 - dx * half, h / 2 - dy * half, w / 2 + dx * half, h / 2 + dy * half, stops);
  ctx.fillRect(0, 0, w, h);
}
