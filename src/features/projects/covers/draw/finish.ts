import { createCanvas } from './canvas';
import { createGrainTile } from './grain';

export interface FinishOptions {
  /** Darkening in the corners, 0 to 1. */
  vignette?: number;
  /** Soft light across the top left, 0 to 1. */
  sheen?: number;
  /** Opacity of the strongest grain speck, 0 to 1. */
  grain?: number;
}

const layers = new Map<string, HTMLCanvasElement>();

/** Grain, sheen and vignette baked into one transparent layer, built once per option set. */
function finishLayer(w: number, h: number, { vignette = 0.3, sheen = 0.08, grain = 0.16 }: FinishOptions) {
  const key = [w, h, vignette, sheen, grain].join(':');
  const cached = layers.get(key);
  if (cached) return cached;

  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const pattern = ctx.createPattern(createGrainTile(grain), 'repeat');
  if (pattern) {
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, w, h);
  }

  const light = ctx.createLinearGradient(0, 0, w * 0.7, h);
  light.addColorStop(0, `rgba(255, 255, 255, ${sheen})`);
  light.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, w, h);

  const corners = ctx.createRadialGradient(w / 2, h / 2, h * 0.45, w / 2, h / 2, Math.hypot(w, h) * 0.58);
  corners.addColorStop(0, 'rgba(0, 0, 0, 0)');
  corners.addColorStop(1, `rgba(0, 0, 0, ${vignette})`);
  ctx.fillStyle = corners;
  ctx.fillRect(0, 0, w, h);

  layers.set(key, canvas);
  return canvas;
}

/** Last pass every cover gets, so the whole set shares the same light and texture. */
export function finishCover(ctx: CanvasRenderingContext2D, w: number, h: number, options: FinishOptions = {}) {
  ctx.drawImage(finishLayer(w, h, options), 0, 0, w, h);
}
