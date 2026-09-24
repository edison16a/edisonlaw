import { step } from '../../../anim/timeline';
import { drawIcon } from '../../../draw/icons';
import { fillRect, fillRound, strokeRound } from '../../../draw/shapes';
import { text } from '../../../draw/text';
import { VIEW_HEIGHT, VIEW_WIDTH, zoomIn } from '../../../draw/view';
import type { PainterFactory } from '../../../types';
import { COMPUTE_HOURS, DAYS } from './data';
import { drawKpis, drawRuns, drawUsage } from './panels';
import { drawSidebar, SIDEBAR_WIDTH } from './sidebar';
import { drawProjects } from './table';
import { OPTAGON_THEME as T } from './theme';

/** Seconds the hover tooltip rests on each bar. */
const HOVER_STEP = 0.9;
const STILL_HOVER = 24;
const MARGIN = 18;

function frame(time: number) {
  const hover = (STILL_HOVER + step(time, 1 / HOVER_STEP)) % DAYS;
  const hours = COMPUTE_HOURS + step(time, 1.5) * 3;
  return { hover, hours };
}

function header(ctx: CanvasRenderingContext2D, x: number) {
  text(ctx, 'Usage', x, 26, { size: 20, weight: 700, family: 'sans', color: T.text });
  text(ctx, 'Compute, storage and runs in this workspace', x, 45, { size: 11.5, family: 'sans', color: T.muted });
  const right = VIEW_WIDTH - MARGIN;
  fillRound(ctx, right - 64, 16, 64, 28, 7, T.teal);
  text(ctx, 'Export', right - 32, 31, { size: 12, weight: 600, family: 'sans', color: '#042f2e', align: 'center' });
  fillRound(ctx, right - 180, 16, 108, 28, 7, T.panel);
  strokeRound(ctx, right - 180, 16, 108, 28, 7, T.panelBorder);
  drawIcon(ctx, 'grid', right - 164, 30, 13, T.muted, 1.4);
  text(ctx, 'Last 30 days', right - 150, 31, { size: 12, family: 'sans', color: T.text });
}

/** The Backbond usage page for a demo workspace, zoomed in: KPIs, metered usage, runs and projects. */
export const optagon: PainterFactory = () => ({
  stillTime: 0,
  frameKey: (time) => {
    const { hover, hours } = frame(time);
    return `${hover}:${hours}`;
  },
  paint(ctx, time) {
    const { hover, hours } = frame(time);
    zoomIn(ctx);
    fillRect(ctx, 0, 0, VIEW_WIDTH, VIEW_HEIGHT, T.background);
    drawSidebar(ctx);
    const x = SIDEBAR_WIDTH + MARGIN;
    const w = VIEW_WIDTH - x - MARGIN;
    header(ctx, x);
    drawKpis(ctx, { x, y: 60, w, h: 80 }, hours.toLocaleString('en-US'));
    const chartsY = 150;
    const runsW = 184;
    drawUsage(ctx, { x, y: chartsY, w: w - runsW - 10, h: 156 }, hover);
    drawRuns(ctx, { x: x + w - runsW, y: chartsY, w: runsW, h: 156 });
    drawProjects(ctx, { x, y: 316, w, h: VIEW_HEIGHT - 316 - 14 });
  },
});
