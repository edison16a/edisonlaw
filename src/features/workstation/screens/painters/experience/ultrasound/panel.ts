import { ringGauge } from '../../../draw/charts';
import { fillRound, strokeRound, type Rect } from '../../../draw/shapes';
import { text } from '../../../draw/text';
import { pill, pillWidth, progressBar } from '../../../draw/widgets';
import { ULTRASOUND_THEME as T } from './theme';

/** The right hand column: quality score, segmentation details and the finding. */

const BADGE_SIZE = 10;

function card(ctx: CanvasRenderingContext2D, rect: Rect, title: string) {
  fillRound(ctx, rect.x, rect.y, rect.w, rect.h, 8, T.panel);
  strokeRound(ctx, rect.x, rect.y, rect.w, rect.h, 8, T.border);
  text(ctx, title, rect.x + 14, rect.y + 20, { size: 14, weight: 700, family: 'sans', color: T.text });
}

/** A pill in the card's top right corner. */
function badge(ctx: CanvasRenderingContext2D, rect: Rect, label: string, color: string, bg: string, dot = false) {
  const x = rect.x + rect.w - 14 - pillWidth(ctx, label, BADGE_SIZE, dot);
  pill(ctx, label, x, rect.y + 20, { bg, color, size: BADGE_SIZE, dot: dot ? color : undefined });
}

const SUB_SCORES = [
  { label: 'Gain', value: 0.91 },
  { label: 'Depth', value: 0.84 },
  { label: 'Focus', value: 0.88 },
  { label: 'Artifacts', value: 0.76 },
];

export function drawQuality(ctx: CanvasRenderingContext2D, rect: Rect, score: number) {
  card(ctx, rect, 'Image quality');
  badge(ctx, rect, 'Diagnostic', T.green, 'rgba(74,222,128,0.14)', true);
  const cx = rect.x + 56;
  const cy = rect.y + 84;
  ringGauge(ctx, cx, cy, 33, 8, score, T.green, '#1c2530');
  text(ctx, score.toFixed(2), cx, cy - 3, { size: 20, weight: 700, family: 'sans', color: T.text, align: 'center' });
  text(ctx, 'score', cx, cy + 15, { size: 10, family: 'sans', color: T.muted, align: 'center' });

  const x = rect.x + 108;
  const barWidth = rect.x + rect.w - 14 - x;
  SUB_SCORES.forEach((item, index) => {
    const y = rect.y + 44 + index * 23;
    text(ctx, item.label, x, y, { size: 11.5, family: 'sans', color: T.muted });
    text(ctx, item.value.toFixed(2), rect.x + rect.w - 14, y, { size: 11.5, weight: 600, family: 'sans', color: T.text, align: 'right' });
    progressBar(ctx, x, y + 9, barWidth, 4, item.value, item.value < 0.8 ? T.amber : T.green, '#1c2530');
  });
}

export function drawSegmentation(ctx: CanvasRenderingContext2D, rect: Rect, latency: number) {
  card(ctx, rect, 'Segmentation');
  badge(ctx, rect, 'SAM 3', T.cyan, 'rgba(34,211,238,0.14)');
  const rows = [
    ['Prompts', '3 points, 1 box'],
    ['Mask IoU', '0.93'],
    ['Nodule area', '1.84 cm²'],
    ['Inference', `${latency} ms on L4`],
  ];
  rows.forEach(([label, value], index) => {
    const y = rect.y + 44 + index * 19;
    text(ctx, label, rect.x + 14, y, { size: 11.5, family: 'sans', color: T.muted });
    text(ctx, value, rect.x + rect.w - 14, y, { size: 11.5, weight: 600, family: 'sans', color: T.text, align: 'right' });
  });
}

export function drawFindings(ctx: CanvasRenderingContext2D, rect: Rect) {
  card(ctx, rect, 'Findings');
  badge(ctx, rect, 'TI-RADS 3', T.amber, 'rgba(251,191,36,0.14)');
  text(ctx, 'Solid nodule, 14 by 9 mm.', rect.x + 14, rect.y + 45, { size: 12, family: 'sans', color: T.text });
  text(ctx, 'Follow up scan in 12 months.', rect.x + 14, rect.y + 63, { size: 11.5, family: 'sans', color: T.muted });

  // Review actions along the bottom of the card.
  const buttonY = rect.y + rect.h - 34;
  fillRound(ctx, rect.x + 14, buttonY, 86, 24, 6, T.green);
  text(ctx, 'Approve', rect.x + 57, buttonY + 13, { size: 11.5, weight: 600, family: 'sans', color: '#052e16', align: 'center' });
  strokeRound(ctx, rect.x + 108, buttonY, 64, 24, 6, T.border, 1.2);
  text(ctx, 'Flag', rect.x + 140, buttonY + 13, { size: 11.5, weight: 600, family: 'sans', color: T.text, align: 'center' });
}
