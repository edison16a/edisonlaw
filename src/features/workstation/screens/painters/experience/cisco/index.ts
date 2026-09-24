import { step } from '../../../anim/timeline';
import { fillRect } from '../../../draw/shapes';
import { pill } from '../../../draw/widgets';
import { VIEW_HEIGHT, VIEW_WIDTH, zoomIn } from '../../../draw/view';
import type { PainterFactory } from '../../../types';
import { drawControls, drawParticipants, drawTitleBar, FeedCache } from './meeting';
import { drawSlide, SLIDE_HEIGHT, SLIDE_WIDTH } from './slide';
import { CISCO_THEME as T } from './theme';

const TITLE = 30;
const CONTROLS = 48;
const MARGIN = 12;
/** The slide is drawn at its design size and scaled to fill the stage beside the participants. */
const SLIDE_SCALE = 0.64;
/** Packets move at this frame rate. */
const RATE = 10;

function elapsed(time: number) {
  const seconds = 32 * 60 + 14 + Math.floor(time);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** A video meeting presenting a campus network design, from the Cisco program, zoomed in. */
export const cisco: PainterFactory = () => {
  const feeds = new FeedCache();

  return {
    stillTime: 2.3,
    frameKey: (time) => String(step(time, RATE)),
    paint(ctx, time) {
      const t = step(time, RATE) / RATE;
      zoomIn(ctx);
      fillRect(ctx, 0, 0, VIEW_WIDTH, VIEW_HEIGHT, T.background);
      drawTitleBar(ctx, TITLE, elapsed(t));
      const top = TITLE + MARGIN;
      const slideW = SLIDE_WIDTH * SLIDE_SCALE;
      const slideH = SLIDE_HEIGHT * SLIDE_SCALE;
      ctx.save();
      ctx.translate(MARGIN, top);
      ctx.scale(SLIDE_SCALE, SLIDE_SCALE);
      drawSlide(ctx, { x: 0, y: 0, w: SLIDE_WIDTH, h: SLIDE_HEIGHT }, t);
      ctx.restore();

      const speaker = Math.floor(t / 6) % 3;
      const pulse = (Math.sin(t * 7) + 1) / 2;
      const side = MARGIN + slideW + 10;
      drawParticipants(ctx, { x: side, y: top, w: VIEW_WIDTH - side - MARGIN, h: slideH }, feeds, speaker, pulse);
      drawControls(ctx, VIEW_HEIGHT - CONTROLS, CONTROLS);
      pill(ctx, 'You are sharing your screen', MARGIN, VIEW_HEIGHT - CONTROLS / 2, { bg: 'rgba(0,188,235,0.16)', color: T.cyan, size: 9.5, dot: T.cyan });
    },
    dispose() {
      feeds.dispose();
    },
  };
};
