import { ringGauge } from '../../../draw/charts';
import { fillRound, strokeRound, type Rect } from '../../../draw/shapes';
import { text } from '../../../draw/text';
import { pill, progressBar } from '../../../draw/widgets';
import { SCAN_BOUNDS } from './scan';
import { ULTRASOUND_THEME as T } from './theme';

/** The right hand column: quality score, segmentation details and recent frames. */

function card(ctx: CanvasRenderingContext2D, rect: Rect, title: string) {
  fillRound(ctx, rect.x, rect.y, rect.w, rect.h, 10, T.panel);
  strokeRound(ctx, rect.x, rect.y, rect.w, rect.h, 10, T.border);
  text(ctx, title, rect.x + 18, rect.y + 24, { size: 14, weight: 600, family: 'sans', color: T.text });
}

const SUB_SCORES = [
  { label: 'Gain', value: 0.91 },
  { label: 'Depth', value: 0.84 },
  { label: 'Focus', value: 0.88 },
  { label: 'Artifacts', value: 0.76 },
];

export function drawQuality(ctx: CanvasRenderingContext2D, rect: Rect, score: number) {
  card(ctx, rect, 'Image quality');
  pill(ctx, 'Diagnostic', rect.x + rect.w - 104, rect.y + 24, { bg: 'rgba(74,222,128,0.12)', color: T.green, size: 11, dot: T.green });
  const cx = rect.x + 82;
  const cy = rect.y + 116;
  ringGauge(ctx, cx, cy, 50, 10, score, T.green, '#1c2530');
  text(ctx, score.toFixed(2), cx, cy - 4, { size: 26, weight: 700, family: 'sans', color: T.text, align: 'center' });
  text(ctx, 'score', cx, cy + 20, { size: 11.5, family: 'sans', color: T.muted, align: 'center' });

  SUB_SCORES.forEach((item, index) => {
    const y = rect.y + 66 + index * 30;
    const x = rect.x + 170;
    text(ctx, item.label, x, y, { size: 12.5, family: 'sans', color: T.muted });
    text(ctx, item.value.toFixed(2), rect.x + rect.w - 18, y, { size: 12.5, weight: 600, family: 'sans', color: T.text, align: 'right' });
    progressBar(ctx, x, y + 10, rect.w - 188, 5, item.value, item.value < 0.8 ? T.amber : T.green, '#1c2530');
  });
}

export function drawSegmentation(ctx: CanvasRenderingContext2D, rect: Rect, latency: number) {
  card(ctx, rect, 'Segmentation');
  pill(ctx, 'SAM 3', rect.x + rect.w - 74, rect.y + 24, { bg: 'rgba(34,211,238,0.12)', color: T.cyan, size: 11 });
  const rows = [
    ['Prompts', '3 points, 1 box'],
    ['Mask IoU', '0.93'],
    ['Nodule area', '1.84 cm²'],
    ['Inference', `${latency} ms on L4`],
  ];
  rows.forEach(([label, value], index) => {
    const y = rect.y + 56 + index * 24;
    text(ctx, label, rect.x + 18, y, { size: 13, family: 'sans', color: T.muted });
    text(ctx, value, rect.x + rect.w - 18, y, { size: 13, weight: 600, family: 'sans', color: T.text, align: 'right' });
  });
}

export function drawFrames(ctx: CanvasRenderingContext2D, rect: Rect, frames: HTMLCanvasElement[], active: number) {
  card(ctx, rect, 'Recent frames');
  const scores = ['0.81', '0.85', '0.87', '0.86'];
  const gap = 10;
  const w = (rect.w - 36 - gap * 3) / 4;
  const h = w * (SCAN_BOUNDS.h / SCAN_BOUNDS.w);
  scores.forEach((score, index) => {
    const x = rect.x + 18 + index * (w + gap);
    const y = rect.y + 44;
    fillRound(ctx, x, y, w, h, 6, '#000000');
    ctx.drawImage(frames[index % frames.length], x + 2, y + 2, w - 4, h - 4);
    strokeRound(ctx, x, y, w, h, 6, index === active ? T.cyan : T.border, index === active ? 2 : 1);
    text(ctx, score, x + w / 2, y + h + 14, { size: 11.5, family: 'sans', color: index === active ? T.text : T.muted, align: 'center' });
  });
}

export function drawFindings(ctx: CanvasRenderingContext2D, rect: Rect) {
  card(ctx, rect, 'Findings');
  pill(ctx, 'TI-RADS 3', rect.x + rect.w - 98, rect.y + 24, { bg: 'rgba(251,191,36,0.12)', color: T.amber, size: 11 });
  text(ctx, 'Solid nodule, 14 by 9 mm, smooth margins.', rect.x + 18, rect.y + 54, { size: 13, family: 'sans', color: T.text });
  text(ctx, 'Follow up scan in 12 months.', rect.x + 18, rect.y + 76, { size: 13, family: 'sans', color: T.muted });
}
