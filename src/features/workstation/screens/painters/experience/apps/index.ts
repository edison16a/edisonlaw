import { step } from '../../../anim/timeline';
import { fillRect } from '../../../draw/shapes';
import { SCREEN_HEIGHT, SCREEN_WIDTH, type PainterFactory } from '../../../types';
import { drawAppStore } from './appStore';
import { DOWNLOADS, EXTENSIONS } from './data';
import { drawWebStore } from './webStore';

const SPLIT = 716;
/** Seconds the downloads tooltip rests on each bar. */
const HOVER_STEP = 0.8;

function frame(time: number) {
  const tick = step(time, 1 / HOVER_STEP);
  return {
    hover: (22 + tick) % DOWNLOADS.length,
    users: EXTENSIONS[0].users + Math.floor(tick / 2),
    downloads: 1942 + Math.floor(tick / 3),
    key: String(tick),
  };
}

/** The developer consoles for Edison's Chrome extensions and the SafeEats iOS app. */
export const apps: PainterFactory = () => ({
  stillTime: 0,
  frameKey: (time) => frame(time).key,
  paint(ctx, time) {
    const { hover, users, downloads } = frame(time);
    drawWebStore(ctx, { x: 0, y: 0, w: SPLIT, h: SCREEN_HEIGHT }, users);
    fillRect(ctx, SPLIT, 0, 2, SCREEN_HEIGHT, '#000000');
    drawAppStore(ctx, { x: SPLIT + 2, y: 0, w: SCREEN_WIDTH - SPLIT - 2, h: SCREEN_HEIGHT }, hover, downloads);
  },
});
