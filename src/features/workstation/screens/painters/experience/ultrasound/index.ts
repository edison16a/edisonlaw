import { step } from '../../../anim/timeline';
import { circle, fillRect } from '../../../draw/shapes';
import { text, textRun } from '../../../draw/text';
import { pill } from '../../../draw/widgets';
import { SCREEN_HEIGHT, SCREEN_WIDTH, type PainterFactory } from '../../../types';
import { drawMasks, drawScanAnnotations } from './overlay';
import { drawFindings, drawFrames, drawQuality, drawSegmentation } from './panel';
import { renderScanFrames, SCAN_BOUNDS } from './scan';
import { ULTRASOUND_THEME as T } from './theme';

const HEADER = 50;
const SPECKLE_FRAMES = 3;
/** Live scan rate on screen, frames per second. */
const RATE = 5;
const SCORES = [0.87, 0.86, 0.87, 0.88, 0.87];
const LATENCIES = [142, 138, 147, 140, 144];

/** Small sine wave mark before the product name. */
function logo(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) {
    const px = x + i;
    const py = y + Math.sin(i / 3) * 6 * Math.exp(-Math.abs(i - 12) / 10);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.strokeStyle = T.cyan;
  ctx.lineWidth = 2.2;
  ctx.stroke();
}

function header(ctx: CanvasRenderingContext2D, frameNumber: number) {
  fillRect(ctx, 0, 0, SCREEN_WIDTH, HEADER, T.panel);
  fillRect(ctx, 0, HEADER - 1, SCREEN_WIDTH, 1, T.border);
  logo(ctx, 22, HEADER / 2);
  const after = textRun(ctx, 'Enhanced Ultrasound', 56, HEADER / 2 + 1, { size: 15, weight: 700, family: 'sans', color: T.text });
  text(ctx, 'Study 0142   Thyroid, right lobe   Quality review', after + 24, HEADER / 2 + 1, { size: 13, family: 'sans', color: T.muted });
  const right = SCREEN_WIDTH - 20;
  pill(ctx, 'Cloud Run, us-west1', right - 170, HEADER / 2, { bg: '#16202b', color: T.muted, size: 11 });
  circle(ctx, right - 262, HEADER / 2, 5, T.red);
  text(ctx, `LIVE  ${frameNumber}`, right - 250, HEADER / 2 + 1, { size: 12, weight: 600, family: 'mono', color: T.text });
}

/** Ultrasound quality scoring and SAM segmentation, on a live looking thyroid scan. */
export const ultrasound: PainterFactory = () => {
  let frames: HTMLCanvasElement[] | null = null;
  const scanFrames = () => (frames ??= renderScanFrames(SPECKLE_FRAMES));

  return {
    stillTime: 0,
    frameKey: (time) => String(step(time, RATE)),
    paint(ctx, time) {
      const tick = step(time, RATE);
      const images = scanFrames();
      const frameNumber = 214 + tick;
      fillRect(ctx, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, T.background);
      header(ctx, frameNumber);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(images[tick % images.length], SCAN_BOUNDS.x, SCAN_BOUNDS.y, SCAN_BOUNDS.w, SCAN_BOUNDS.h);
      drawMasks(ctx, (tick % 6) / 6);
      drawScanAnnotations(ctx, frameNumber);

      const x = 836;
      const w = SCREEN_WIDTH - x - 20;
      const slow = Math.floor(tick / 8);
      drawQuality(ctx, { x, y: HEADER + 16, w, h: 192 }, SCORES[slow % SCORES.length]);
      drawSegmentation(ctx, { x, y: HEADER + 220, w, h: 150 }, LATENCIES[slow % LATENCIES.length]);
      drawFrames(ctx, { x, y: HEADER + 382, w, h: 150 }, images, 2);
      drawFindings(ctx, { x, y: HEADER + 544, w, h: SCREEN_HEIGHT - HEADER - 562 });
    },
    dispose() {
      frames?.forEach((canvas) => {
        canvas.width = 0;
        canvas.height = 0;
      });
      frames = null;
    },
  };
};
