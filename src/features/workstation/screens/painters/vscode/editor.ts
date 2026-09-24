import { DARK_MODERN, toSpans, tokenize } from '../../draw/syntax';
import { clipped, fillRect, strokeRound, type Rect } from '../../draw/shapes';
import { cellX, createGrid, drawSpans, rowY, type TerminalGrid } from '../../draw/terminal';
import { text } from '../../draw/text';
import type { EditorView } from './playback';
import { INDENT, SCROLL_TOP, SUGGEST_AT } from './source';
import { drawSuggest, suggestHeight } from './suggest';
import { VSCODE_THEME as T } from './theme';

/** The code area: gutter, highlighted code, indent guides, caret, minimap and scrollbar. */

const FONT_SIZE = 14;
const LINE_HEIGHT = 21;
const GUTTER = 50;
/** Gap between the gutter and the first column of code. */
const CODE_INSET = 8;
const MINIMAP = 56;
const SCROLLBAR = 10;
/** Minimap scale: pixels per character and per line. */
const MINI_CHAR = 0.6;
const MINI_LINE = 3;

/** Lines changed on this branch, shown as a bar in the gutter. */
const MODIFIED_LINES = new Set([28, 29]);

function indentOf(line: string) {
  return line.length - line.trimStart().length;
}

function drawIndentGuides(ctx: CanvasRenderingContext2D, grid: TerminalGrid, lines: string[], row: number, index: number) {
  // Blank lines borrow the indent of the next line with code, like VS Code.
  let source = index;
  while (source < lines.length && !lines[source].trim()) source++;
  const depth = Math.floor(indentOf(lines[source] ?? '') / 2);
  for (let level = 0; level < depth; level++) {
    fillRect(ctx, cellX(grid, level * 2), rowY(grid, row), 1, grid.cellHeight, T.indentGuide);
  }
}

function drawMinimap(ctx: CanvasRenderingContext2D, area: Rect, tokens: ReturnType<typeof tokenize>, visibleRows: number) {
  const left = area.x + area.w - SCROLLBAR - MINIMAP;
  const top = area.y + 2;
  ctx.globalAlpha = 0.65;
  tokens.forEach((line, row) => {
    let col = 0;
    for (const token of line) {
      const length = token.text.length;
      if (token.text.trim()) {
        ctx.fillStyle = DARK_MODERN[token.kind];
        ctx.fillRect(left + 8 + col * MINI_CHAR, top + row * MINI_LINE, length * MINI_CHAR, 2);
      }
      col += length;
    }
  });
  ctx.globalAlpha = 1;
  fillRect(ctx, left, top + SCROLL_TOP * MINI_LINE, MINIMAP, visibleRows * MINI_LINE, 'rgba(121,121,121,0.18)');
  fillRect(ctx, left, area.y, 1, area.h, 'rgba(0,0,0,0.25)');
}

function drawScrollbar(ctx: CanvasRenderingContext2D, area: Rect, total: number, visibleRows: number) {
  const x = area.x + area.w - SCROLLBAR;
  fillRect(ctx, x, area.y, 1, area.h, '#262626');
  const scale = area.h / Math.max(total + visibleRows - 3, visibleRows);
  fillRect(ctx, x + 2, area.y + SCROLL_TOP * scale, SCROLLBAR - 4, visibleRows * scale, 'rgba(121,121,121,0.4)');
}

export function drawEditor(ctx: CanvasRenderingContext2D, area: Rect, view: EditorView) {
  fillRect(ctx, area.x, area.y, area.w, area.h, T.editor);
  const grid = createGrid(
    ctx,
    { x: area.x + GUTTER + CODE_INSET, y: area.y + 4, w: area.w - GUTTER - CODE_INSET - MINIMAP - SCROLLBAR, h: area.h - 4 },
    FONT_SIZE,
    LINE_HEIGHT,
  );
  const tokens = tokenize(view.lines, 'tsx');
  const { caret } = view;

  for (let row = 0; row < grid.rows; row++) {
    const index = SCROLL_TOP + row;
    if (index >= view.lines.length) break;
    const top = rowY(grid, row);
    const middle = top + grid.cellHeight / 2 + 1;
    const current = index === caret.line;

    if (current) strokeRound(ctx, area.x + GUTTER, top, area.w - GUTTER - MINIMAP - SCROLLBAR, grid.cellHeight, 0, T.lineHighlight, 2);
    if (index === view.selectedLine) {
      fillRect(ctx, cellX(grid, INDENT.length), top, (view.lines[index].length - INDENT.length) * grid.cellWidth, grid.cellHeight, T.textSelection);
    }
    text(ctx, String(index + 1), area.x + GUTTER - 14, middle, {
      size: FONT_SIZE - 1,
      color: current ? T.text : T.faint,
      align: 'right',
    });
    // Git change bars: green for the line being written, blue for earlier edits on the branch.
    const added = index === view.inserted;
    const modified = !added && MODIFIED_LINES.has(index - (view.inserted !== -1 && index > view.inserted ? 1 : 0));
    if (added || modified) fillRect(ctx, area.x + GUTTER - 6, top, 3, grid.cellHeight, added ? '#2ea043' : T.accent);

    // Long lines stop at the minimap, the way the editor viewport clips them.
    clipped(ctx, { x: area.x + GUTTER, y: top, w: area.w - GUTTER - MINIMAP - SCROLLBAR, h: grid.cellHeight }, () => {
      drawIndentGuides(ctx, grid, view.lines, row, index);
      drawSpans(ctx, grid, 0, row, toSpans(tokens[index]), T.text);
    });
  }

  const caretRow = caret.line - SCROLL_TOP;
  if (caret.visible) fillRect(ctx, Math.round(cellX(grid, caret.col)), rowY(grid, caretRow) + 1, 2, grid.cellHeight - 2, T.caret);
  drawMinimap(ctx, area, tokens, grid.rows);
  drawScrollbar(ctx, area, view.lines.length, grid.rows);

  if (view.suggest) {
    // The list opens under the caret, or above it when the editor has no room below, as in VS Code.
    const x = cellX(grid, INDENT.length + SUGGEST_AT.length) - 28;
    const height = suggestHeight(view.suggest);
    const below = rowY(grid, caretRow + 1) + 2;
    const y = below + height <= area.y + area.h ? below : rowY(grid, caretRow) - height - 2;
    drawSuggest(ctx, view.suggest, x, y, FONT_SIZE - 1);
  }
}
