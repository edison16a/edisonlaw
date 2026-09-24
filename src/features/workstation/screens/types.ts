import type { ExperienceScreen } from '@/content/types';

/** Everything a monitor can show. The three apps plus one picture per experience entry. */
export type ScreenId = 'claude-code' | 'codex' | 'vscode' | ExperienceScreen;

/**
 * Size every screen is laid out at, 16:9 to match the monitor panels. The canvas is painted at a
 * multiple of it (see resolution), so painters work in these units whatever the real resolution.
 */
export const SCREEN_WIDTH = 1280;
export const SCREEN_HEIGHT = 720;

/**
 * Paints one screen as a pure function of time, so the scheduler can skip frames that would
 * not change and the still frame is just a well chosen moment of the loop.
 */
export interface ScreenPainter {
  /** Moment of the loop, in seconds, that reads as a complete picture on its own. */
  readonly stillTime: number;
  /** Cheap fingerprint of what `paint` would draw at `time`. Equal keys mean equal pixels. */
  frameKey(time: number): string;
  /** Draws the full frame. The context is scaled so the frame is SCREEN_WIDTH by SCREEN_HEIGHT units. */
  paint(ctx: CanvasRenderingContext2D, time: number): void;
  /** Frees anything the painter allocated, such as offscreen canvases. */
  dispose?(): void;
}

export type PainterFactory = () => ScreenPainter;
