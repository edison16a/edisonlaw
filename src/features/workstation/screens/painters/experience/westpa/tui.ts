import { cellX, drawCellBox, drawSpans, rowY, span, type TerminalGrid } from '../../../draw/terminal';
import { WESTPA_THEME as T } from './theme';

/** rich style building blocks: titled panels, progress bars and a spinner, all on the cell grid. */

export function panel(ctx: CanvasRenderingContext2D, grid: TerminalGrid, col: number, row: number, cols: number, rows: number, title: string, color: string) {
  drawCellBox(ctx, grid, col, row, cols, rows, T.border, { radius: grid.cellWidth * 0.8, lineWidth: 1.2 });
  const label = ` ${title} `;
  ctx.fillStyle = T.background;
  ctx.fillRect(cellX(grid, col + 2), rowY(grid, row), label.length * grid.cellWidth, grid.cellHeight);
  drawSpans(ctx, grid, col + 2, row, [span(label, color, { weight: 700 })], color);
}

/** A thick line bar across `cols` cells, filled to `fraction`. */
export function bar(ctx: CanvasRenderingContext2D, grid: TerminalGrid, col: number, row: number, cols: number, fraction: number, color: string) {
  const x = cellX(grid, col);
  const y = Math.round(rowY(grid, row) + grid.cellHeight / 2 - 2);
  const width = cols * grid.cellWidth;
  ctx.fillStyle = T.track;
  ctx.fillRect(x, y, width, 4);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, Math.round(width * Math.min(1, fraction)), 4);
}

/** Eight dots around a circle with one lit, like rich's dots spinner. */
export function spinner(ctx: CanvasRenderingContext2D, grid: TerminalGrid, col: number, row: number, frame: number, color: string) {
  const cx = cellX(grid, col) + grid.cellWidth / 2;
  const cy = rowY(grid, row) + grid.cellHeight / 2;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const lit = (i - frame + 8) % 8;
    ctx.globalAlpha = lit === 0 ? 1 : lit < 3 ? 0.55 : 0.2;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(angle) * 5, cy + Math.sin(angle) * 5, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
