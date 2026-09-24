import type { Project } from '@/content/types';
import { COVER_HEIGHT, COVER_WIDTH, paintCover } from '../covers/paintCover';
import { scheduleIdle } from './idleQueue';

/**
 * Painted cover art for projects without a photo, shared by the spiral
 * textures and the phone carousel. Painted once on idle, then reused.
 */
export interface PaintedCover {
  canvas: HTMLCanvasElement;
  /** Resolves once the art is on the canvas. */
  ready: Promise<void>;
  painted: boolean;
}

const cache = new Map<string, PaintedCover>();

/**
 * The shared painted cover for `project`, queued for painting if it is new.
 * Lower `priority` paints sooner, so the card in focus goes first.
 */
export function getPaintedCover(project: Project, priority = 0): PaintedCover {
  const cached = cache.get(project.id);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = COVER_WIDTH;
  canvas.height = COVER_HEIGHT;
  const entry: PaintedCover = { canvas, painted: false, ready: Promise.resolve() };
  entry.ready = new Promise<void>((resolve) => {
    scheduleIdle(() => {
      const ctx = canvas.getContext('2d');
      if (ctx) paintCover(ctx, project, COVER_WIDTH, COVER_HEIGHT);
      entry.painted = true;
      resolve();
    }, priority);
  });
  cache.set(project.id, entry);
  return entry;
}

/** Copies a painted cover into a smaller visible canvas. */
export function drawCoverInto(target: HTMLCanvasElement, cover: PaintedCover) {
  const ctx = target.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(cover.canvas, 0, 0, target.width, target.height);
}
