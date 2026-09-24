import { cellX, createGrid, drawSpans, rowY, span, type TerminalGrid } from '../../../draw/terminal';
import { terminalWindow } from '../../../draw/window';
import type { PainterFactory } from '../../../types';
import { binPanel, fluxPanel, iterationTable, runPanel } from './panels';
import { fluxAt, FIRST_ITERATION, formatFlux, MAX_ITERATIONS, runKey, runState, SEGMENTS, type RunState } from './run';
import { WESTPA_THEME as T } from './theme';
import { panel } from './tui';

const FONT_SIZE = 14;
const LINE_HEIGHT = 20;
const PADDING = 18;

function clock(iteration: number, offset: number) {
  const seconds = 14 * 3600 + 2 * 60 + 11 + (iteration - FIRST_ITERATION) * 291 + offset;
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(Math.floor(seconds / 3600) % 24)}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`;
}

function header(ctx: CanvasRenderingContext2D, grid: TerminalGrid, state: RunState) {
  ctx.fillStyle = T.header;
  ctx.fillRect(0, rowY(grid, 0), ctx.canvas.width, grid.cellHeight);
  const right = `iteration ${state.iteration} of ${MAX_ITERATIONS}   ${clock(state.iteration, Math.floor((state.segments / SEGMENTS) * 280))}`;
  drawSpans(ctx, grid, 0, 0, [span(' WESTPA ', T.background, { weight: 700, bg: T.magenta }), span('  dashboard  ', T.bright, { weight: 700 }), span('west.h5   ~/sims/barnase-barstar', '#9fb3c8')], T.bright);
  drawSpans(ctx, grid, grid.cols - right.length, 0, [span(right, T.bright)], T.bright);
}

function logLines(state: RunState) {
  const lines: [string, string][] = [];
  for (let iteration = state.iteration - 2; iteration < state.iteration; iteration++) {
    lines.push(
      [clock(iteration, 280), `iteration ${iteration} finished in 4m 51s, ${SEGMENTS} segments`],
      [clock(iteration, 280), `flux into bound state ${formatFlux(fluxAt(iteration))}`],
      [clock(iteration, 281), `resampled ${SEGMENTS} walkers across 23 bins`],
    );
  }
  lines.push([clock(state.iteration, 0), `propagating iteration ${state.iteration}`]);
  return lines.slice(-5);
}

function logPanel(ctx: CanvasRenderingContext2D, grid: TerminalGrid, row: number, state: RunState) {
  panel(ctx, grid, 0, row, grid.cols, 7, 'Log', T.yellow);
  logLines(state).forEach(([time, message], index) => {
    drawSpans(ctx, grid, 2, row + 1 + index, [span(`[${time}] `, T.dim), span('INFO  ', T.blue), span(message, T.text)], T.text);
  });
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
  ctx.fillRect(cellX(grid, col), rowY(grid, row) + grid.cellHeight / 2, (grid.cols - col) * grid.cellWidth, 1);
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
    iterationTable(ctx, grid, 0, 11, split, 13, state);
    binPanel(ctx, grid, split + 1, 11, grid.cols - split - 1, 13, state);
    logPanel(ctx, grid, 24, state);
    footer(ctx, grid, grid.rows - 1);
  },
});
