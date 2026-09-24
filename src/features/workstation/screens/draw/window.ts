import { drawGlyph, type Glyph } from './glyphs';
import { circle, fillRect, hline, type Rect } from './shapes';
import { measure, text } from './text';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../types';

/** macOS window colours for the close, minimise and zoom buttons. */
const TRAFFIC = ['#ff5f57', '#febc2e', '#28c840'];

interface ChromeOptions {
  title: string;
  background: string;
  bar: string;
  titleColor: string;
  border?: string;
  barHeight?: number;
  /** Symbol drawn before the title, like the star Claude Code puts in the tab title. */
  icon?: { glyph: Glyph; color: string };
}

/** The three window buttons, centred on `y`, starting at `x`. */
export function trafficLights(ctx: CanvasRenderingContext2D, x: number, y: number, radius = 6.5, gap = 21) {
  TRAFFIC.forEach((color, index) => circle(ctx, x + index * gap, y, radius, color));
}

/**
 * A full screen terminal window: title bar with window buttons and a centred title.
 * Returns the content area under the bar.
 */
export function terminalWindow(ctx: CanvasRenderingContext2D, options: ChromeOptions): Rect {
  const barHeight = options.barHeight ?? 38;
  fillRect(ctx, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, options.background);
  fillRect(ctx, 0, 0, SCREEN_WIDTH, barHeight, options.bar);
  hline(ctx, 0, barHeight - 1, SCREEN_WIDTH, options.border ?? 'rgba(255,255,255,0.06)');
  trafficLights(ctx, 22, barHeight / 2);
  const titleStyle = { size: 14, weight: 500, family: 'sans', color: options.titleColor, align: 'center' } as const;
  const iconWidth = options.icon ? 20 : 0;
  const titleX = SCREEN_WIDTH / 2 + iconWidth / 2;
  text(ctx, options.title, titleX, barHeight / 2 + 1, titleStyle);
  if (options.icon) {
    const left = titleX - measure(ctx, options.title, titleStyle) / 2 - iconWidth / 2 - 2;
    drawGlyph(ctx, options.icon.glyph, left, barHeight / 2, 18, options.icon.color);
  }
  return { x: 0, y: barHeight, w: SCREEN_WIDTH, h: SCREEN_HEIGHT - barHeight };
}
