import { cellX, drawCellBox, drawSpans, lineWeight, rowY, span, type Span, type TermBlock, type TerminalGrid } from '../../draw/terminal';
import { wrapWords } from '../../draw/text';
import { CLAUDE_THEME as T } from './theme';

/**
 * The welcome box Claude Code opens with: version in the border, the pixel mascot on the left,
 * tips and recent activity on the right.
 */

const ROWS = 11;
const VERSION = ' Claude Code v2.1.14 ';
const TIP = 'Run /init to create a CLAUDE.md file with instructions for Claude';
const RECENT = [
  ['2h ago', 'Tune the timeline dot sounds'],
  ['5h ago', 'Paint the monitor screens'],
  ['1d ago', 'Add a still for phones'],
];

/**
 * The mascot in half cell pixels, the way the terminal draws it with quadrant block characters.
 * Two gaps in the second row are the eyes, the last row is the legs.
 */
const MASCOT = [
  '...############...',
  '...##.######.##...',
  '.################.',
  '...############...',
  '....#.#....#.#....',
];

function drawMascot(ctx: CanvasRenderingContext2D, grid: TerminalGrid, centerX: number, top: number) {
  const pixelW = grid.cellWidth / 2;
  const pixelH = grid.cellHeight / 2;
  const left = Math.round(centerX - (MASCOT[0].length * pixelW) / 2);
  ctx.fillStyle = T.orange;
  MASCOT.forEach((line, y) => {
    for (let x = 0; x < line.length; x++) {
      if (line[x] !== '#') continue;
      const px = Math.floor(left + x * pixelW);
      const py = Math.floor(top + y * pixelH);
      ctx.fillRect(px, py, Math.ceil(left + (x + 1) * pixelW) - px, Math.ceil(top + (y + 1) * pixelH) - py);
    }
  });
}

function centered(ctx: CanvasRenderingContext2D, grid: TerminalGrid, center: number, row: number, value: string, color: string, weight = 400) {
  drawSpans(ctx, grid, Math.round(center - value.length / 2), row, [span(value, color, { weight })], color);
}

/** Orange rule through the middle of `row`, the width of the right column. */
function rule(ctx: CanvasRenderingContext2D, grid: TerminalGrid, col: number, row: number, cols: number) {
  const weight = lineWeight(grid);
  ctx.fillStyle = T.orange;
  ctx.fillRect(cellX(grid, col), Math.round(rowY(grid, row) + grid.cellHeight / 2 - weight / 2), cols * grid.cellWidth, weight);
}

export function welcomeBlock(): TermBlock {
  return {
    rows: ROWS,
    draw(ctx, grid, row) {
      const cols = grid.cols;
      drawCellBox(ctx, grid, 0, row, cols, ROWS, T.orange);

      // Version label sits in the top border.
      ctx.fillStyle = T.background;
      ctx.fillRect(cellX(grid, 3), rowY(grid, row), VERSION.length * grid.cellWidth, grid.cellHeight);
      drawSpans(ctx, grid, 3, row, [span(VERSION, T.orange)], T.orange);

      const split = Math.floor(cols * 0.4);
      const center = split / 2;
      centered(ctx, grid, center, row + 2, 'Welcome back Edison!', T.text, 700);
      drawMascot(ctx, grid, cellX(grid, center), rowY(grid, row + 4) + grid.cellHeight * 0.25);
      centered(ctx, grid, center, row + 8, 'Opus 4.5, Claude Max', T.dim);
      centered(ctx, grid, center, row + 9, '~/code/edisonlaw', T.dim);

      // Divider between the two columns.
      const weight = lineWeight(grid);
      const dividerX = Math.round(cellX(grid, split) + grid.cellWidth / 2 - weight / 2);
      ctx.fillStyle = T.orange;
      ctx.fillRect(dividerX, rowY(grid, row + 1), weight, grid.cellHeight * (ROWS - 2));

      // The right column wraps and clips to its width, like the terminal lays it out.
      const right = split + 2;
      const width = cols - right - 2;
      const line = (at: number, spans: Span[]) => drawSpans(ctx, grid, right, row + at, spans, T.text);
      line(1, [span('Tips for getting started', T.orange, { weight: 700 })]);
      wrapWords(TIP, width)
        .slice(0, 2)
        .forEach((part, index) => line(2 + index, [span(part, T.text)]));
      rule(ctx, grid, right, row + 4, width);
      line(5, [span('Recent activity', T.orange, { weight: 700 })]);
      RECENT.forEach(([when, what], index) => line(6 + index, [span(when.padEnd(8), T.dim), span(what.slice(0, width - 8), T.text)]));
      line(9, [span('/resume for more', T.dim)]);
    },
  };
}
