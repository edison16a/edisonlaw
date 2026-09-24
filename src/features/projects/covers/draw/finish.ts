import { applyGrain } from './grain';

export interface FinishOptions {
  /** Darkening in the corners, 0 to 1. */
  vignette?: number;
  /** Soft light across the top left, 0 to 1. */
  sheen?: number;
  grain?: number;
}

/** Last pass every cover gets, so the whole set shares the same light and texture. */
export function finishCover(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  { vignette = 0.32, sheen = 0.14, grain = 0.12 }: FinishOptions = {},
) {
  ctx.save();

  const light = ctx.createLinearGradient(0, 0, w * 0.7, h);
  light.addColorStop(0, `rgba(255, 255, 255, ${sheen})`);
  light.addColorStop(0.55, 'rgba(255, 255, 255, 0)');
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, w, h);

  const corners = ctx.createRadialGradient(w / 2, h / 2, h * 0.45, w / 2, h / 2, Math.hypot(w, h) * 0.58);
  corners.addColorStop(0, 'rgba(0, 0, 0, 0)');
  corners.addColorStop(1, `rgba(0, 0, 0, ${vignette})`);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = corners;
  ctx.fillRect(0, 0, w, h);

  ctx.restore();
  applyGrain(ctx, w, h, grain);
}
