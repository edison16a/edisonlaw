import { gridLines, lineChart, scaleOf, stackedBars } from '../../../draw/charts';
import { circle, fillRect, fillRound, strokeRound, type Rect } from '../../../draw/shapes';
import { text } from '../../../draw/text';
import { pill } from '../../../draw/widgets';
import { card } from './card';
import { DAYS, KPIS, KPI_TRENDS, REVENUE, USAGE, USAGE_MAX } from './data';
import { OPTAGON_THEME as T } from './theme';

const USAGE_COLORS = [T.violet, T.teal, T.slate];

/** The chart covers the 30 days up to Sep 24, starting on Aug 26. */
function dayLabel(index: number) {
  const day = 26 + index;
  return day > 31 ? `Sep ${day - 31}` : `Aug ${day}`;
}

export function drawKpis(ctx: CanvasRenderingContext2D, area: Rect, liveHours: string) {
  const gap = 16;
  const width = (area.w - gap * 3) / 4;
  KPIS.forEach((kpi, index) => {
    const rect = { x: area.x + index * (width + gap), y: area.y, w: width, h: area.h };
    card(ctx, rect);
    text(ctx, kpi.label, rect.x + 18, rect.y + 24, { size: 12.5, family: 'sans', color: T.muted });
    const value = index === 2 ? liveHours : kpi.value;
    text(ctx, value, rect.x + 18, rect.y + 55, { size: 27, weight: 700, family: 'sans', color: T.text });
    pill(ctx, kpi.delta, rect.x + 18, rect.y + 82, { bg: 'rgba(45,212,191,0.12)', color: T.teal, size: 11 });
    const trend = KPI_TRENDS[index];
    lineChart(ctx, { x: rect.x + rect.w - 96, y: rect.y + 58, w: 78, h: 30 }, trend, scaleOf(trend), {
      color: index === 2 ? T.violet : T.teal,
      width: 1.8,
      fill: index === 2 ? 'rgba(139,124,246,0.25)' : 'rgba(45,212,191,0.2)',
    });
  });
}

function legend(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ['GPU hours', 'CPU hours', 'Storage'].forEach((label, index) => {
    const at = x + index * 104;
    fillRound(ctx, at, y - 5, 10, 10, 3, USAGE_COLORS[index]);
    text(ctx, label, at + 16, y + 1, { size: 12, family: 'sans', color: T.muted });
  });
}

/** Stacked daily usage with a hover tooltip on `hover`. */
export function drawUsage(ctx: CanvasRenderingContext2D, rect: Rect, hover: number) {
  card(ctx, rect, 'Metered usage');
  legend(ctx, rect.x + rect.w - 330, rect.y + 25);
  const plot = { x: rect.x + 52, y: rect.y + 56, w: rect.w - 72, h: rect.h - 90 };
  gridLines(ctx, plot, 4, T.grid);
  for (let i = 0; i <= 4; i++) {
    const label = `${(USAGE_MAX * (1 - i / 4)).toFixed(0)}`;
    text(ctx, label, plot.x - 12, plot.y + (i / 4) * plot.h, { size: 11, family: 'sans', color: T.faint, align: 'right' });
  }
  ['Aug 26', 'Sep 3', 'Sep 11', 'Sep 19', 'Sep 24'].forEach((label, index) => {
    text(ctx, label, plot.x + (index / 4) * plot.w, plot.y + plot.h + 18, { size: 11, family: 'sans', color: T.faint, align: 'center' });
  });

  const slot = plot.w / DAYS;
  fillRect(ctx, plot.x + hover * slot, plot.y, slot, plot.h, 'rgba(255,255,255,0.04)');
  stackedBars(ctx, plot, USAGE, USAGE_MAX, USAGE_COLORS, 0.35);

  const [gpu, cpu, storage] = USAGE[hover];
  const tipW = 168;
  const tipX = Math.min(plot.x + (hover + 0.5) * slot + 14, plot.x + plot.w - tipW);
  const tipY = plot.y + 8;
  fillRound(ctx, tipX, tipY, tipW, 92, 8, '#171d28');
  strokeRound(ctx, tipX, tipY, tipW, 92, 8, '#2a3344');
  text(ctx, dayLabel(hover), tipX + 14, tipY + 18, { size: 12, weight: 600, family: 'sans', color: T.text });
  [gpu, cpu, storage].forEach((value, index) => {
    const y = tipY + 40 + index * 18;
    circle(ctx, tipX + 18, y, 4, USAGE_COLORS[index]);
    text(ctx, ['GPU', 'CPU', 'Storage'][index], tipX + 30, y + 1, { size: 12, family: 'sans', color: T.muted });
    text(ctx, value.toFixed(0), tipX + tipW - 14, y + 1, { size: 12, weight: 600, family: 'sans', color: T.text, align: 'right' });
  });
}

export function drawRevenue(ctx: CanvasRenderingContext2D, rect: Rect) {
  card(ctx, rect, 'Revenue');
  text(ctx, '$48,210', rect.x + 18, rect.y + 62, { size: 26, weight: 700, family: 'sans', color: T.text });
  text(ctx, 'this month, Stripe', rect.x + 130, rect.y + 64, { size: 12, family: 'sans', color: T.muted });
  const plot = { x: rect.x + 18, y: rect.y + 86, w: rect.w - 36, h: 86 };
  gridLines(ctx, plot, 3, T.grid, [3, 4]);
  lineChart(ctx, plot, REVENUE, scaleOf(REVENUE), { color: T.teal, width: 2.2, fill: 'rgba(45,212,191,0.28)' });

  const rows = [
    ['Invoices paid', '98.6%'],
    ['Failed payments', '3'],
    ['Metered events', '1.2M'],
  ];
  rows.forEach(([label, value], index) => {
    const y = rect.y + 192 + index * 22;
    text(ctx, label, rect.x + 18, y, { size: 12.5, family: 'sans', color: T.muted });
    text(ctx, value, rect.x + rect.w - 18, y, { size: 12.5, weight: 600, family: 'sans', color: T.text, align: 'right' });
  });
}
