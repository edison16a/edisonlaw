import { text } from '../draw/text';
import { SCREEN_HEIGHT, SCREEN_WIDTH, type PainterFactory } from '../types';

/** Dark panel with the screen name, used until a screen has its own painter. */
export function placeholder(label: string): PainterFactory {
  return () => ({
    stillTime: 0,
    frameKey: () => label,
    paint(ctx) {
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      text(ctx, label, 64, 120, { size: 48, color: '#c9d1d9' });
    },
  });
}
