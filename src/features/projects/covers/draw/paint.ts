import { DROP } from '../palette';

/** Fill and stroke helpers that keep canvas state from leaking between shapes. */

export type Style = string | CanvasGradient | CanvasPattern;

interface StrokeOptions {
  cap?: CanvasLineCap;
  join?: CanvasLineJoin;
  dash?: number[];
  alpha?: number;
}

/** Runs `draw` between save and restore. */
export function layer(ctx: CanvasRenderingContext2D, draw: () => void) {
  ctx.save();
  draw();
  ctx.restore();
}

export function fill(ctx: CanvasRenderingContext2D, path: Path2D, style: Style, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = style;
  ctx.fill(path);
  ctx.restore();
}

export function stroke(ctx: CanvasRenderingContext2D, path: Path2D, style: Style, width: number, options: StrokeOptions = {}) {
  ctx.save();
  ctx.globalAlpha *= options.alpha ?? 1;
  ctx.strokeStyle = style;
  ctx.lineWidth = width;
  ctx.lineCap = options.cap ?? 'round';
  ctx.lineJoin = options.join ?? 'round';
  if (options.dash) ctx.setLineDash(options.dash);
  ctx.stroke(path);
  ctx.restore();
}

interface ShadowOptions {
  x?: number;
  y?: number;
  color?: string;
}

/** The flat offset shadow every raised shape casts. */
export function dropShadow(ctx: CanvasRenderingContext2D, path: Path2D, { x = DROP.x, y = DROP.y, color = DROP.color }: ShadowOptions = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.fill(path);
  ctx.restore();
}

/** Fills `path` on top of its drop shadow. */
export function raised(ctx: CanvasRenderingContext2D, path: Path2D, style: Style, shadow: ShadowOptions = {}) {
  dropShadow(ctx, path, shadow);
  fill(ctx, path, style);
}

/** Runs `draw` clipped to `path`. */
export function clipped(ctx: CanvasRenderingContext2D, path: Path2D, draw: () => void) {
  ctx.save();
  ctx.clip(path);
  draw();
  ctx.restore();
}
