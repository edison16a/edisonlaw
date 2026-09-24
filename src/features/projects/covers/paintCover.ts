import type { Project } from '@/content/types';
import { hashString, seededRandom } from '@/lib/math';

/** Size every generated cover is painted at (16:10). */
export const COVER_WIDTH = 1024;
export const COVER_HEIGHT = 640;

/**
 * Paints the full colour cover art for a project onto `ctx`.
 * Placeholder painter: a seeded gradient with the project name.
 */
export function paintCover(ctx: CanvasRenderingContext2D, project: Project, width = COVER_WIDTH, height = COVER_HEIGHT) {
  const random = seededRandom(hashString(project.id));
  const hue = Math.floor(random() * 360);
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, `hsl(${hue} 70% 55%)`);
  gradient.addColorStop(1, `hsl(${(hue + 60) % 360} 70% 30%)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#fff';
  ctx.font = `700 ${Math.round(height * 0.1)}px sans-serif`;
  ctx.fillText(project.name, width * 0.06, height * 0.9);
}
