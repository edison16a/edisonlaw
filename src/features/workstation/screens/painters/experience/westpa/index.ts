import { cellX, createGrid, drawSpans, lineWeight, rowY, span, type TerminalGrid } from '../../../draw/terminal';
import { terminalWindow } from '../../../draw/window';
import { SCREEN_WIDTH, type PainterFactory } from '../../../types';
import { binPanel, fluxPanel, iterationTable, runPanel } from './panels';
import { FIRST_ITERATION, MAX_ITERATIONS, runKey, runState, SEGMENTS, type RunState } from './run';
import { WESTPA_THEME as T } from './theme';

/** Large enough to read on the monitor. The dashboard keeps the panels that fit at this size. */
const FONT_SIZE = 22;
const LINE_HEIGHT = 30;
const PADDING = 18;

function clock(iteration: number, offset: number) {
  const seconds = 14 * 3600 + 2 * 60 + 11 + (iteration - FIRST_ITERATION) * 291 + offset;
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(Math.floor(seconds / 3600) % 24)}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`;
}

function header(ctx: CanvasRenderingContext2D, grid: TerminalGrid, state: RunState) {
  ctx.fillStyle = T.header;
  ctx.fillRect(0, rowY(grid, 0), SCREEN_WIDTH, grid.cellHeight);
  const right = `iteration ${state.iteration} of ${MAX_ITERATIONS}   ${clock(state.iteration, Math.floor((state.segments / SEGMENTS) * 280))}`;
  drawSpans(ctx, grid, 0, 0, [span(' WESTPA ', T.background, { weight: 700, bg: T.magenta }), span('  dashboard  ', T.bright, { weight: 700 }), span('west.h5   ~/sims/barnase-barstar', '#9fb3c8')], T.bright);
  drawSpans(ctx, grid, grid.cols - right.length, 0, [span(right, T.bright)], T.bright);
}

function footer(ctx: CanvasRenderingContext2D, grid: TerminalGrid, row: number) {
  const keys = [
    ['q', 'quit'],
    ['p', 'pause'],
    ['r', 'refresh'],
    ['l', 'logs'],
    ['?', 'help'],
  ];
  let col = 0;
  for (const [key, label] of keys) {
    col = drawSpans(ctx, grid, col, row, [span(` ${key} `, T.background, { weight: 700, bg: T.cyan }), span(` ${label}   `, T.dim)], T.dim);
  }
  ctx.fillStyle = T.track;
  ctx.fillRect(cellX(grid, col), rowY(grid, row) + grid.cellHeight / 2, (grid.cols - col) * grid.cellWidth, lineWeight(grid) / 2);
}

/** The WESTPA CLI dashboard following a weighted ensemble run. */
export const westpa: PainterFactory = () => ({
  stillTime: 6,
  frameKey: (time) => runKey(runState(time)),
  paint(ctx, time) {
    const state = runState(time);
    const area = terminalWindow(ctx, { title: 'westpa dashboard', background: T.background, bar: T.bar, titleColor: T.dim });
    const grid = createGrid(ctx, { x: area.x + PADDING, y: area.y + 10, w: area.w - PADDING * 2, h: area.h - 12 }, FONT_SIZE, LINE_HEIGHT);
    const split = Math.floor(grid.cols * 0.52);
    header(ctx, grid, state);
    runPanel(ctx, grid, 0, 2, split, state);
    fluxPanel(ctx, grid, split + 1, 2, grid.cols - split - 1, state);
    iterationTable(ctx, grid, 0, 11, split, 10, state);
    binPanel(ctx, grid, split + 1, 11, grid.cols - split - 1, 10, state);
    footer(ctx, grid, grid.rows - 1);
  },
});
