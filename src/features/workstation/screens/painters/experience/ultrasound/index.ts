import { step } from '../../../anim/timeline';
import { circle, fillRect } from '../../../draw/shapes';
import { text, textRun } from '../../../draw/text';
import { pill } from '../../../draw/widgets';
import { VIEW_HEIGHT, VIEW_WIDTH, zoomIn } from '../../../draw/view';
import type { PainterFactory } from '../../../types';
import { drawMasks, drawScanAnnotations } from './overlay';
import { drawFindings, drawQuality, drawSegmentation } from './panel';
import { createScanFrames, SCAN_BOUNDS, type ScanFrames } from './scan';
import { ULTRASOUND_THEME as T } from './theme';

const HEADER = 34;
const MARGIN = 14;
/** The panel column starts just right of the fan's depth scale. */
const COLUMN_X = 522;
const SPECKLE_FRAMES = 3;
/** Live scan rate on screen, frames per second. */
const RATE = 5;
const SCORES = [0.87, 0.86, 0.87, 0.88, 0.87];
const LATENCIES = [142, 138, 147, 140, 144];

/** Small sine wave mark before the product name. */
function logo(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath();
  for (let i = 0; i <= 20; i++) {
    const px = x + i;
    const py = y + Math.sin(i / 2.5) * 5 * Math.exp(-Math.abs(i - 10) / 8);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.strokeStyle = T.cyan;
  ctx.lineWidth = 1.8;
  ctx.stroke();
}

function header(ctx: CanvasRenderingContext2D, frameNumber: number) {
  fillRect(ctx, 0, 0, VIEW_WIDTH, HEADER, T.panel);
  fillRect(ctx, 0, HEADER - 1, VIEW_WIDTH, 1, T.border);
  logo(ctx, 14, HEADER / 2);
  const after = textRun(ctx, 'Enhanced Ultrasound', 42, HEADER / 2 + 1, { size: 16, weight: 700, family: 'sans', color: T.text });
  text(ctx, 'Study 0142   Thyroid, right lobe', after + 16, HEADER / 2 + 1, { size: 12, family: 'sans', color: T.muted });
  const right = VIEW_WIDTH - MARGIN;
  pill(ctx, 'Cloud Run', right - 70, HEADER / 2, { bg: '#16202b', color: T.muted, size: 10 });
  circle(ctx, right - 150, HEADER / 2, 4, T.red);
  text(ctx, `LIVE  ${frameNumber}`, right - 141, HEADER / 2 + 1, { size: 11, weight: 600, family: 'mono', color: T.text });
}

/** Ultrasound quality scoring and SAM segmentation on a live looking thyroid scan, zoomed in. */
export const ultrasound: PainterFactory = () => {
  let scans: ScanFrames | null = null;

  return {
    stillTime: 0,
    frameKey: (time) => String(step(time, RATE)),
    paint(ctx, time) {
      const tick = step(time, RATE);
      scans ??= createScanFrames(SPECKLE_FRAMES);
      const current = scans.frame(tick);
      const frameNumber = 214 + tick;
      zoomIn(ctx);
      fillRect(ctx, 0, 0, VIEW_WIDTH, VIEW_HEIGHT, T.background);
      header(ctx, frameNumber);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(current, SCAN_BOUNDS.x, SCAN_BOUNDS.y, SCAN_BOUNDS.w, SCAN_BOUNDS.h);
      drawMasks(ctx, (tick % 6) / 6);
      drawScanAnnotations(ctx, frameNumber);

      const x = COLUMN_X;
      const w = VIEW_WIDTH - x - MARGIN;
      const slow = Math.floor(tick / 8);
      const top = HEADER + 12;
      drawQuality(ctx, { x, y: top, w, h: 140 }, SCORES[slow % SCORES.length]);
      drawSegmentation(ctx, { x, y: top + 150, w, h: 112 }, LATENCIES[slow % LATENCIES.length]);
      drawFindings(ctx, { x, y: top + 272, w, h: VIEW_HEIGHT - top - 272 - MARGIN });
    },
    dispose() {
      scans?.dispose();
      scans = null;
    },
  };
};
