import { rgba } from '../color';

/** Soft light and soft shade, both built from radial gradients so they stay cheap. */

/** Roughly Gaussian falloff so glows never show a hard rim. */
function falloff(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, alpha: number) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, rgba(color, alpha));
  gradient.addColorStop(0.2, rgba(color, alpha * 0.72));
  gradient.addColorStop(0.45, rgba(color, alpha * 0.32));
  gradient.addColorStop(0.7, rgba(color, alpha * 0.09));
  gradient.addColorStop(1, rgba(color, 0));
  return gradient;
}

/** Additive light around a point. */
export function glow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  alpha = 1,
  mode: GlobalCompositeOperation = 'lighter',
) {
  ctx.save();
  ctx.globalCompositeOperation = mode;
  ctx.fillStyle = falloff(ctx, x, y, radius, color, alpha);
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
}

/** Soft elliptical shadow under something resting on a surface. */
export function contactShadow(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, alpha = 0.35, color = '#000000') {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, ry / rx);
  ctx.fillStyle = falloff(ctx, 0, 0, rx, color, alpha);
  ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
  ctx.restore();
}
