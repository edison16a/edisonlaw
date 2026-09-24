import { step } from '../../../anim/timeline';
import { fillRect } from '../../../draw/shapes';
import { VIEW_HEIGHT, VIEW_WIDTH, zoomIn } from '../../../draw/view';
import type { PainterFactory } from '../../../types';
import { drawAppStore } from './appStore';
import { drawWebStore } from './webStore';

const SPLIT = 440;
/** Clock steps per second. */
const RATE = 1.25;
/** Steps for one full package upload, then it starts over. */
const UPLOAD_STEPS = 24;
/** Steps each screenshot stays selected. */
const SCREENSHOT_STEPS = 3;

function frame(time: number) {
  const tick = step(time, RATE);
  return {
    upload: (tick % UPLOAD_STEPS) / (UPLOAD_STEPS - 1),
    selected: Math.floor(tick / SCREENSHOT_STEPS) % 3,
    scan: (tick % 6) / 5,
    key: String(tick),
  };
}

/** The developer consoles for Edison's Chrome extensions and the SafeEats iOS app, zoomed in. */
export const apps: PainterFactory = () => ({
  stillTime: 8,
  frameKey: (time) => frame(time).key,
  paint(ctx, time) {
    const { upload, selected, scan } = frame(time);
    zoomIn(ctx);
    drawWebStore(ctx, { x: 0, y: 0, w: SPLIT, h: VIEW_HEIGHT }, upload);
    fillRect(ctx, SPLIT, 0, 2, VIEW_HEIGHT, '#000000');
    drawAppStore(ctx, { x: SPLIT + 2, y: 0, w: VIEW_WIDTH - SPLIT - 2, h: VIEW_HEIGHT }, selected, scan);
  },
});
