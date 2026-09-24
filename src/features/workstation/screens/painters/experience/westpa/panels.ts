import { lineChart } from '../../../draw/charts';
import { smooth } from '../../../draw/series';
import { cellX, drawSpans, rowY, span, type TerminalGrid } from '../../../draw/terminal';
import { BINS, binCounts, fluxAt, MAX_ITERATIONS, rowFor, SEGMENTS, type RunState } from './run';
import { WESTPA_THEME as T } from './theme';
import { bar, panel, spinner } from './tui';

/** The dashboard panels. Each takes its top left cell and size. */

export function runPanel(ctx: CanvasRenderingContext2D, grid: TerminalGrid, col: number, row: number, cols: number, state: RunState) {
  panel(ctx, grid, col, row, cols, 9, 'Run', T.magenta);
  const x = col + 2;
  const barCols = cols - 34;
  const done = state.iteration - 1;
  drawSpans(ctx, grid, x, row + 1, [span('Iterations', T.dim)], T.dim);
  bar(ctx, grid, x + 12, row + 1, barCols, done / MAX_ITERATIONS, T.magenta);
  drawSpans(ctx, grid, x + 13 + barCols, row + 1, [span(`${done}/${MAX_ITERATIONS}`.padStart(8), T.text), span(`  ${Math.round((done / MAX_ITERATIONS) * 100)}%`, T.magenta)], T.text);
  drawSpans(ctx, grid, x, row + 2, [span('Segments', T.dim)], T.dim);
  bar(ctx, grid, x + 12, row + 2, barCols, state.segments / SEGMENTS, T.cyan);
  const segments = `${state.segments}/${SEGMENTS}`.padStart(8);
  drawSpans(ctx, grid, x + 13 + barCols, row + 2, [span(segments, T.text), span(`  ${Math.round((state.segments / SEGMENTS) * 100)}%`.padEnd(6), T.cyan)], T.text);

  const hours = Math.floor(state.elapsedMinutes / 60);
  const eta = (MAX_ITERATIONS - done) * 5;
  drawSpans(ctx, grid, x, row + 4, [span('Walltime    ', T.dim), span(`${hours}h ${state.elapsedMinutes % 60}m`, T.text), span('      ETA  ', T.dim), span(`${Math.floor(eta / 60)}h ${eta % 60}m`, T.yellow)], T.text);
  drawSpans(ctx, grid, x, row + 5, [span('Workers     ', T.dim), span('32/32 busy', T.green), span('   zmq, 4 nodes', T.dim)], T.text);
  drawSpans(ctx, grid, x, row + 6, [span('Status', T.dim)], T.dim);
  spinner(ctx, grid, x + 12, row + 6, state.spinner, state.resampling ? T.yellow : T.cyan);
  const status = state.resampling ? 'resampling walkers across bins' : `propagating iteration ${state.iteration}`;
  drawSpans(ctx, grid, x + 14, row + 6, [span(status, state.resampling ? T.yellow : T.text)], T.text);
  drawSpans(ctx, grid, x, row + 7, [span('Simulated   ', T.dim), span('1.84 μs aggregate, 2 ps per segment', T.text)], T.text);
}

export function fluxPanel(ctx: CanvasRenderingContext2D, grid: TerminalGrid, col: number, row: number, cols: number, state: RunState) {
  panel(ctx, grid, col, row, cols, 9, 'Flux into bound state', T.green);
  const values = smooth(
    Array.from({ length: state.iteration - 1 }, (_, index) => fluxAt(index + 1)),
    4,
  );
  const plot = { x: cellX(grid, col + 9), y: rowY(grid, row + 1) + 6, w: (cols - 12) * grid.cellWidth, h: grid.cellHeight * 6 - 12 };
  ['3e-07', '2e-07', '1e-07'].forEach((label, index) => {
    drawSpans(ctx, grid, col + 2, row + 1 + index * 2, [span(label.padStart(6), T.dim)], T.dim);
  });
  ctx.fillStyle = T.track;
  for (let i = 0; i <= 3; i++) ctx.fillRect(plot.x, Math.round(plot.y + (i / 3) * plot.h), plot.w, 1);
  const scaled = { ...plot, w: plot.w * (values.length / MAX_ITERATIONS) };
  lineChart(ctx, scaled, values, { min: 0, max: 3.4e-7 }, { color: T.green, width: 1.6, fill: 'rgba(126,231,135,0.18)' });
  drawSpans(ctx, grid, col + 9, row + 7, [span('0'), span('iteration'.padStart(Math.floor((cols - 12) / 2) + 4), T.dim)], T.dim);
  drawSpans(ctx, grid, col + cols - 6, row + 7, [span(String(MAX_ITERATIONS), T.dim)], T.dim);
}

const COLUMNS = ['iter', 'segs', 'bins', 'min weight', 'max weight', 'flux', 'time'];
const WIDTHS = [6, 6, 6, 12, 12, 11, 9];

export function iterationTable(ctx: CanvasRenderingContext2D, grid: TerminalGrid, col: number, row: number, cols: number, rows: number, state: RunState) {
  panel(ctx, grid, col, row, cols, rows, 'Iterations', T.cyan);
  const x = col + 2;
  let at = x;
  COLUMNS.forEach((label, index) => {
    drawSpans(ctx, grid, at, row + 1, [span(label.padStart(WIDTHS[index]), T.cyan, { weight: 700 })], T.cyan);
    at += WIDTHS[index] + 2;
  });
  ctx.fillStyle = T.border;
  ctx.fillRect(cellX(grid, x), Math.round(rowY(grid, row + 2) + grid.cellHeight / 2), (at - x) * grid.cellWidth, 1);

  const visible = rows - 4;
  for (let i = 0; i < visible; i++) {
    const iteration = state.iteration - visible + 1 + i;
    const y = row + 3 + i;
    const current = iteration === state.iteration;
    if (current) {
      ctx.fillStyle = 'rgba(86,212,221,0.08)';
      ctx.fillRect(cellX(grid, col + 1), rowY(grid, y), (cols - 2) * grid.cellWidth, grid.cellHeight);
    }
    const data = rowFor(iteration);
    const cells = current
      ? [String(iteration), String(state.segments), '...', '...', '...', '...', 'running']
      : [String(iteration), String(SEGMENTS), String(data.bins), data.minWeight, data.maxWeight, data.flux, data.time];
    let cellAt = x;
    cells.forEach((value, index) => {
      const color = current ? (index === 6 ? T.yellow : T.bright) : index === 5 ? T.green : T.text;
      drawSpans(ctx, grid, cellAt, y, [span(value.padStart(WIDTHS[index]), color)], color);
      cellAt += WIDTHS[index] + 2;
    });
  }
}

function mix(a: number[], b: number[], t: number) {
  return `rgb(${a.map((value, index) => Math.round(value + (b[index] - value) * t)).join(',')})`;
}

export function binPanel(ctx: CanvasRenderingContext2D, grid: TerminalGrid, col: number, row: number, cols: number, rows: number, state: RunState) {
  panel(ctx, grid, col, row, cols, rows, 'Bin occupancy', T.blue);
  drawSpans(ctx, grid, col + 2, row + 1, [span('walkers per bin, pcoord RMSD to bound pose (Å)', T.dim)], T.dim);
  const counts = binCounts(state.iteration);
  const left = cellX(grid, col + 3);
  const width = (cols - 6) * grid.cellWidth;
  const bottom = rowY(grid, row + rows - 2) - 2;
  const height = grid.cellHeight * (rows - 5);
  const slot = width / BINS;
  counts.forEach((count, bin) => {
    const h = (count / 10) * height;
    ctx.fillStyle = bin < 2 ? T.green : mix([86, 212, 221], [210, 168, 255], bin / BINS);
    ctx.fillRect(Math.round(left + bin * slot + 2), Math.round(bottom - h), Math.round(slot - 4), Math.round(h));
  });
  ctx.fillStyle = T.border;
  ctx.fillRect(left, bottom + 1, width, 1);
  drawSpans(ctx, grid, col + 3, row + rows - 2, [span('0.5 Å  bound', T.dim)], T.dim);
  drawSpans(ctx, grid, col + cols - 19, row + rows - 2, [span('unbound  18.0 Å', T.dim)], T.dim);
}
