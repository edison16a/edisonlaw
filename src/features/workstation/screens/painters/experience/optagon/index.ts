import { step } from '../../../anim/timeline';
import { drawIcon } from '../../../draw/icons';
import { fillRect, fillRound, strokeRound } from '../../../draw/shapes';
import { text } from '../../../draw/text';
import { SCREEN_HEIGHT, SCREEN_WIDTH, type PainterFactory } from '../../../types';
import { COMPUTE_HOURS, DAYS } from './data';
import { drawKpis, drawRevenue, drawUsage } from './panels';
import { drawSidebar, SIDEBAR_WIDTH } from './sidebar';
import { drawOrganizations } from './table';
import { OPTAGON_THEME as T } from './theme';

/** Seconds the hover tooltip rests on each bar. */
const HOVER_STEP = 0.9;
const STILL_HOVER = 24;

function frame(time: number) {
  const hover = (STILL_HOVER + step(time, 1 / HOVER_STEP)) % DAYS;
  const hours = COMPUTE_HOURS + step(time, 1.5) * 3;
  return { hover, hours };
}

function header(ctx: CanvasRenderingContext2D, x: number) {
  text(ctx, 'Usage and billing', x, 38, { size: 21, weight: 700, family: 'sans', color: T.text });
  text(ctx, 'Metering, invoices and plans across every organization', x, 60, { size: 12.5, family: 'sans', color: T.muted });
  const right = SCREEN_WIDTH - 28;
  fillRound(ctx, right - 96, 24, 96, 34, 8, T.teal);
  text(ctx, 'Export', right - 48, 42, { size: 13, weight: 600, family: 'sans', color: '#042f2e', align: 'center' });
  fillRound(ctx, right - 244, 24, 136, 34, 8, T.panel);
  strokeRound(ctx, right - 244, 24, 136, 34, 8, T.panelBorder);
  drawIcon(ctx, 'grid', right - 224, 41, 15, T.muted, 1.4);
  text(ctx, 'Last 30 days', right - 206, 42, { size: 13, family: 'sans', color: T.text });
}

/** The Backbond admin page: KPIs, metered usage, revenue and organizations. */
export const optagon: PainterFactory = () => ({
  stillTime: 0,
  frameKey: (time) => {
    const { hover, hours } = frame(time);
    return `${hover}:${hours}`;
  },
  paint(ctx, time) {
    const { hover, hours } = frame(time);
    fillRect(ctx, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, T.background);
    drawSidebar(ctx);
    const x = SIDEBAR_WIDTH + 28;
    const w = SCREEN_WIDTH - x - 28;
    header(ctx, x);
    drawKpis(ctx, { x, y: 82, w, h: 102 }, hours.toLocaleString('en-US'));
    const chartsY = 198;
    const revenueW = 352;
    drawUsage(ctx, { x, y: chartsY, w: w - revenueW - 16, h: 258 }, hover);
    drawRevenue(ctx, { x: x + w - revenueW, y: chartsY, w: revenueW, h: 258 });
    drawOrganizations(ctx, { x, y: 470, w, h: SCREEN_HEIGHT - 470 - 18 });
  },
});
