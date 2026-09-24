/** Small path and fill helpers shared by every painter. */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
}

export function fillRound(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, color: string | CanvasGradient) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = color;
  ctx.fill();
}

export function strokeRound(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string,
  lineWidth = 1,
) {
  // Half pixel inset keeps one pixel strokes on the pixel grid.
  const inset = lineWidth % 2 === 1 ? 0.5 : 0;
  roundRectPath(ctx, x + inset, y + inset, w - inset * 2, h - inset * 2, r);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

export function fillRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string | CanvasGradient) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

/** Crisp one pixel horizontal line. */
export function hline(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, Math.round(y), w, 1);
}

export function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string | CanvasGradient) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

export function ring(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, lineWidth = 1.5) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

/** Runs `paint` with drawing clipped to a rectangle. */
export function clipped(ctx: CanvasRenderingContext2D, rect: Rect, paint: () => void) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  paint();
  ctx.restore();
}
