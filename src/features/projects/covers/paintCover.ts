import type { Project } from '@/content/types';
import { hashString, seededRandom } from '@/lib/math';
import { createCanvas } from './draw/canvas';
import { finishCover } from './draw/finish';
import { painterFor } from './painters';

/** Size every generated cover is designed and painted at (16:10). */
export const COVER_WIDTH = 1024;
export const COVER_HEIGHT = 640;

/**
 * Paints the full colour cover art for a project onto `ctx`, filling `width` by `height`.
 * The art is deterministic per project id. Other aspect ratios are scaled to fill and centre cropped.
 */
export function paintCover(ctx: CanvasRenderingContext2D, project: Project, width = COVER_WIDTH, height = COVER_HEIGHT) {
  const scale = Math.max(width / COVER_WIDTH, height / COVER_HEIGHT);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.clip();
  ctx.translate((width - COVER_WIDTH * scale) / 2, (height - COVER_HEIGHT * scale) / 2);
  ctx.scale(scale, scale);

  const random = seededRandom(hashString(project.id));
  painterFor(project.id)({ ctx, w: COVER_WIDTH, h: COVER_HEIGHT, random });
  finishCover(ctx, COVER_WIDTH, COVER_HEIGHT);
  ctx.restore();
}

/** A fresh canvas with the project's cover painted on it. */
export function createCoverCanvas(project: Project, width = COVER_WIDTH, height = COVER_HEIGHT) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (ctx) paintCover(ctx, project, width, height);
  return canvas;
}
