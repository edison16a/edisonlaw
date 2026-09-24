import { step } from '../../../anim/timeline';
import { fillRect } from '../../../draw/shapes';
import { pill } from '../../../draw/widgets';
import { SCREEN_HEIGHT, SCREEN_WIDTH, type PainterFactory } from '../../../types';
import { drawControls, drawParticipants, drawTitleBar } from './meeting';
import { drawSlide, SLIDE_HEIGHT, SLIDE_WIDTH } from './slide';
import { CISCO_THEME as T } from './theme';

const TITLE = 44;
const CONTROLS = 76;
/** Packets move at this frame rate. */
const RATE = 10;

function elapsed(time: number) {
  const seconds = 32 * 60 + 14 + Math.floor(time);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** A video meeting presenting a campus network design, from the Cisco program. */
export const cisco: PainterFactory = () => ({
  stillTime: 2.3,
  frameKey: (time) => String(step(time, RATE)),
  paint(ctx, time) {
    const t = step(time, RATE) / RATE;
    fillRect(ctx, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, T.background);
    drawTitleBar(ctx, TITLE, elapsed(t));
    const slide = { x: 16, y: TITLE + 12, w: SLIDE_WIDTH, h: SLIDE_HEIGHT };
    drawSlide(ctx, slide, t);
    pill(ctx, 'You are sharing your screen', slide.x + slide.w / 2 - 96, slide.y + slide.h + 28, { bg: 'rgba(0,188,235,0.16)', color: T.cyan, size: 12, dot: T.cyan });

    const speaker = Math.floor(t / 6) % 3;
    const pulse = (Math.sin(t * 7) + 1) / 2;
    const side = slide.x + slide.w + 14;
    drawParticipants(ctx, { x: side, y: TITLE + 12, w: SCREEN_WIDTH - side - 16, h: SCREEN_HEIGHT - TITLE - CONTROLS - 24 }, speaker, pulse);
    drawControls(ctx, SCREEN_HEIGHT - CONTROLS, CONTROLS);
  },
});
