import { SCREEN_HEIGHT, SCREEN_WIDTH } from './types';

/**
 * Painters lay out in SCREEN_WIDTH by SCREEN_HEIGHT and the canvas is painted at a multiple of
 * that, so text and lines are drawn at the full resolution instead of being scaled up afterwards.
 */

export interface ScreenResolution {
  /** Canvas pixels per layout pixel. */
  scale: number;
  width: number;
  height: number;
}

/** 2560 by 1440 on high density displays, 1920 by 1080 on the rest. */
export function screenResolution(devicePixelRatio: number): ScreenResolution {
  const scale = devicePixelRatio >= 2 ? 2 : 1.5;
  return { scale, width: SCREEN_WIDTH * scale, height: SCREEN_HEIGHT * scale };
}

/**
 * Canvas pixels per layout pixel of the screen `ctx` paints. Shadows and filters are measured in
 * canvas pixels whatever the transform, so painters multiply their sizes by this.
 */
export function pixelScale(ctx: CanvasRenderingContext2D): number {
  return ctx.canvas.width / SCREEN_WIDTH;
}
