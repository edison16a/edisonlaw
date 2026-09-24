import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../types';

/**
 * Apps on the monitors run zoomed in, like a desktop app's zoom setting, so their text still reads
 * when the monitor shows the canvas at a fifth of its size or less. A zoomed painter lays out in
 * this smaller logical view, 800 by 450, and calls `zoomIn` first so it fills the canvas.
 */
export const VIEW_ZOOM = 1.6;
export const VIEW_WIDTH = SCREEN_WIDTH / VIEW_ZOOM;
export const VIEW_HEIGHT = SCREEN_HEIGHT / VIEW_ZOOM;

export function zoomIn(ctx: CanvasRenderingContext2D) {
  ctx.scale(VIEW_ZOOM, VIEW_ZOOM);
}
