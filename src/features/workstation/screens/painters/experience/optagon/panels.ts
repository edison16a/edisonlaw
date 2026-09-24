import { gridLines, lineChart, scaleOf, stackedBars } from '../../../draw/charts';
import { circle, fillRect, fillRound, strokeRound, type Rect } from '../../../draw/shapes';
import { measure, text } from '../../../draw/text';
import { pill, pillWidth } from '../../../draw/widgets';
import { card } from './card';
import { DAYS, KPIS, KPI_TRENDS, LIVE_KPI, RUNS_PER_DAY, USAGE, USAGE_MAX } from './data';
import { OPTAGON_THEME as T } from './theme';

const USAGE_COLORS = [T.violet, T.teal, T.slate];
const USAGE_LABELS = ['GPU', 'CPU', 'Storage'];

/** The chart covers the 30 days up to Sep 24, starting on Aug 26. */
function dayLabel(index: number) {
  const day = 26 + index;
  return day > 31 ? `Sep ${day - 31}` : `Aug ${day}`;
}

/** Four KPI cards: label, big value, and the change beside a trend line along the bottom. */
export function drawKpis(ctx: CanvasRenderingContext2D, area: Rect, liveHours: string) {
  const gap = 10;
  const width = (area.w - gap * 3) / 4;
  KPIS.forEach((kpi, index) => {
    const rect = { x: area.x + index * (width + gap), y: area.y, w: width, h: area.h };
    card(ctx, rect);
    text(ctx, kpi.label, rect.x + 14, rect.y + 18, { size: 11.5, family: 'sans', color: T.muted });
    const live = index === LIVE_KPI;
    text(ctx, live ? liveHours : kpi.value, rect.x + 14, rect.y + 41, { size: 23, weight: 700, family: 'sans', color: T.text });
    // The bottom row holds the change, then the trend line in the room left beside it.
    const deltaW = pillWidth(ctx, kpi.delta, 9);
    pill(ctx, kpi.delta, rect.x + 14, rect.y + 64, { bg: 'rgba(45,212,191,0.14)', color: T.teal, size: 9 });
    const trend = KPI_TRENDS[index];
    const trendX = rect.x + 14 + deltaW + 8;
    lineChart(ctx, { x: trendX, y: rect.y + 56, w: rect.x + rect.w - 14 - trendX, h: 15 }, trend, scaleOf(trend), {
      color: live ? T.violet : T.teal,
      width: 1.6,
      fill: live ? 'rgba(139,124,246,0.25)' : 'rgba(45,212,191,0.2)',
    });
  });
}

function legend(ctx: CanvasRenderingContext2D, right: number, y: number) {
  const style = { size: 11, family: 'sans', color: T.muted } as const;
  let x = right;
  [...USAGE_LABELS].reverse().forEach((label, reversed) => {
    const index = USAGE_LABELS.length - 1 - reversed;
    x -= measure(ctx, label, style);
    text(ctx, label, x, y + 1, style);
    fillRound(ctx, x - 13, y - 4, 8, 8, 2, USAGE_COLORS[index]);
    x -= 26;
  });
}

const TOOLTIP_WIDTH = 104;

function tooltip(ctx: CanvasRenderingContext2D, x: number, y: number, hover: number) {
  const width = TOOLTIP_WIDTH;
  fillRound(ctx, x, y, width, 66, 6, '#171d28');
  strokeRound(ctx, x, y, width, 66, 6, '#2a3344');
  text(ctx, dayLabel(hover), x + 10, y + 13, { size: 11, weight: 600, family: 'sans', color: T.text });
  USAGE[hover].forEach((value, index) => {
    const rowY = y + 29 + index * 14;
    circle(ctx, x + 13, rowY, 3, USAGE_COLORS[index]);
    text(ctx, USAGE_LABELS[index], x + 22, rowY + 1, { size: 10.5, family: 'sans', color: T.muted });
    text(ctx, value.toFixed(0), x + width - 10, rowY + 1, { size: 10.5, weight: 600, family: 'sans', color: T.text, align: 'right' });
  });
}

/** Stacked daily usage with a hover tooltip on `hover`. */
export function drawUsage(ctx: CanvasRenderingContext2D, rect: Rect, hover: number) {
  card(ctx, rect, 'Metered usage');
  legend(ctx, rect.x + rect.w - 14, rect.y + 20);
  const plot = { x: rect.x + 40, y: rect.y + 40, w: rect.w - 54, h: rect.h - 64 };
  gridLines(ctx, plot, 2, T.grid);
  for (let i = 0; i <= 2; i++) {
    const label = `${(USAGE_MAX * (1 - i / 2)).toFixed(0)}`;
    text(ctx, label, plot.x - 8, plot.y + (i / 2) * plot.h, { size: 10, family: 'sans', color: T.faint, align: 'right' });
  }
  const ticks = ['Aug 26', 'Sep 5', 'Sep 15', 'Sep 24'];
  ticks.forEach((label, index) => {
    // The end labels line up with the plot edges so they stay inside the card.
    const align = index === 0 ? 'left' : index === ticks.length - 1 ? 'right' : 'center';
    text(ctx, label, plot.x + (index / 3) * plot.w, plot.y + plot.h + 13, { size: 10, family: 'sans', color: T.faint, align });
  });

  const slot = plot.w / DAYS;
  fillRect(ctx, plot.x + hover * slot, plot.y, slot, plot.h, 'rgba(255,255,255,0.05)');
  stackedBars(ctx, plot, USAGE, USAGE_MAX, USAGE_COLORS, 0.3);
  // The tooltip sits right of the hovered day, and flips to its left near the end of the chart.
  const pointer = plot.x + (hover + 0.5) * slot;
  const tipX = pointer + 10 + TOOLTIP_WIDTH <= plot.x + plot.w ? pointer + 10 : pointer - 10 - TOOLTIP_WIDTH;
  tooltip(ctx, tipX, plot.y + 4, hover);
}

/** Runs finished per day, with two run health figures below. */
export function drawRuns(ctx: CanvasRenderingContext2D, rect: Rect) {
  card(ctx, rect, 'Runs');
  const valueStyle = { size: 22, weight: 700, family: 'sans', color: T.text } as const;
  text(ctx, KPIS[1].value, rect.x + 14, rect.y + 46, valueStyle);
  text(ctx, 'this month', rect.x + 22 + measure(ctx, KPIS[1].value, valueStyle), rect.y + 48, { size: 11, family: 'sans', color: T.muted });
  const plot = { x: rect.x + 14, y: rect.y + 62, w: rect.w - 28, h: 40 };
  gridLines(ctx, plot, 2, T.grid, [3, 4]);
  lineChart(ctx, plot, RUNS_PER_DAY, scaleOf(RUNS_PER_DAY), { color: T.teal, width: 2, fill: 'rgba(45,212,191,0.28)' });

  const rows = [
    ['Succeeded', '97.6%'],
    ['Median time', '14 min'],
  ];
  rows.forEach(([label, value], index) => {
    const y = rect.y + 120 + index * 17;
    text(ctx, label, rect.x + 14, y, { size: 11.5, family: 'sans', color: T.muted });
    text(ctx, value, rect.x + rect.w - 14, y, { size: 11.5, weight: 600, family: 'sans', color: T.text, align: 'right' });
  });
}
