import { drawGlyph, type Glyph } from './glyphs';
import type { Rect } from './shapes';
import { font } from './text';
import { SCREEN_WIDTH } from '../types';

/**
 * A character grid for terminal style screens. Everything lines up to cells, the way a real
 * terminal does, and a transcript is a list of blocks that scrolls once it overflows.
 */

export interface TerminalGrid {
  x: number;
  y: number;
  cols: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  fontSize: number;
}

export interface Span {
  text: string;
  color?: string;
  bg?: string;
  weight?: number;
  italic?: boolean;
  /** Draws a vector symbol centred in the first cell instead of the text. */
  glyph?: Glyph;
  arms?: number;
}

export interface Line {
  spans: Span[];
  /** Fills the row from `indent` to the right edge, like a diff line. */
  bg?: string;
  indent?: number;
}

/** A run of rows in a transcript. `draw` gets the row it starts at, which may be negative. */
export interface TermBlock {
  rows: number;
  draw(ctx: CanvasRenderingContext2D, grid: TerminalGrid, row: number): void;
}

export const span = (text: string, color?: string, extra: Omit<Span, 'text' | 'color'> = {}): Span => ({
  text,
  color,
  ...extra,
});

/** A symbol plus one blank cell after it, like "⏺ " in a terminal. */
export const glyphSpan = (glyph: Glyph, color: string, extra: Omit<Span, 'text' | 'color' | 'glyph'> = {}): Span => ({
  text: '  ',
  color,
  glyph,
  ...extra,
});

export function createGrid(ctx: CanvasRenderingContext2D, area: Rect, fontSize: number, lineHeight: number): TerminalGrid {
  ctx.font = font(fontSize);
  const cellWidth = ctx.measureText('0000000000').width / 10;
  return {
    x: area.x,
    y: area.y,
    cols: Math.floor(area.w / cellWidth),
    rows: Math.floor(area.h / lineHeight),
    cellWidth,
    cellHeight: lineHeight,
    fontSize,
  };
}

export const cellX = (grid: TerminalGrid, col: number) => grid.x + col * grid.cellWidth;
/** Width of box drawing lines, which get heavier with the font like the ones a terminal draws. */
export const lineWeight = (grid: TerminalGrid) => Math.max(1, grid.fontSize / 10);
export const rowY = (grid: TerminalGrid, row: number) => grid.y + row * grid.cellHeight;

/** Draws spans from (col, row) and returns the column after the last one. */
export function drawSpans(ctx: CanvasRenderingContext2D, grid: TerminalGrid, col: number, row: number, spans: Span[], color: string) {
  const top = rowY(grid, row);
  const middle = top + grid.cellHeight / 2 + 1;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  let at = col;
  for (const part of spans) {
    const x = cellX(grid, at);
    if (part.bg) {
      ctx.fillStyle = part.bg;
      ctx.fillRect(Math.floor(x), top, Math.ceil(part.text.length * grid.cellWidth), grid.cellHeight);
    }
    if (part.glyph) {
      drawGlyph(ctx, part.glyph, x + grid.cellWidth / 2, middle - 1, grid.fontSize, part.color ?? color, { arms: part.arms });
    } else if (part.text.trim()) {
      ctx.font = font(grid.fontSize, part.weight, 'mono', part.italic);
      ctx.fillStyle = part.color ?? color;
      ctx.fillText(part.text, x, middle);
    }
    at += part.text.length;
  }
  return at;
}

export function drawLine(ctx: CanvasRenderingContext2D, grid: TerminalGrid, row: number, line: Line, color: string) {
  const indent = line.indent ?? 0;
  if (line.bg) {
    ctx.fillStyle = line.bg;
    ctx.fillRect(Math.floor(cellX(grid, indent)), rowY(grid, row), Math.ceil((grid.cols - indent) * grid.cellWidth), grid.cellHeight);
  }
  return drawSpans(ctx, grid, indent, row, line.spans, color);
}

/** One row per line. */
export function linesBlock(lines: Line[], color: string): TermBlock {
  return {
    rows: lines.length,
    draw(ctx, grid, row) {
      lines.forEach((line, index) => drawLine(ctx, grid, row + index, line, color));
    },
  };
}

export const blankBlock = (rows = 1): TermBlock => ({ rows, draw() {} });

interface BoxOptions {
  radius?: number;
  lineWidth?: number;
}

/** Rounded box whose border runs through the centre of its edge cells, like ╭─╮ drawing. */
export function drawCellBox(
  ctx: CanvasRenderingContext2D,
  grid: TerminalGrid,
  col: number,
  row: number,
  cols: number,
  rows: number,
  color: string,
  { radius, lineWidth = lineWeight(grid) }: BoxOptions = {},
) {
  const left = cellX(grid, col) + grid.cellWidth / 2;
  const right = cellX(grid, col + cols - 1) + grid.cellWidth / 2;
  const top = rowY(grid, row) + grid.cellHeight / 2;
  const bottom = rowY(grid, row + rows - 1) + grid.cellHeight / 2;
  ctx.beginPath();
  ctx.roundRect(left, top, right - left, bottom - top, radius ?? grid.cellWidth * 0.9);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

/** Draws the blocks top down and scrolls so the last row stays in view. */
export function drawTranscript(ctx: CanvasRenderingContext2D, grid: TerminalGrid, blocks: TermBlock[]) {
  const total = blocks.reduce((sum, block) => sum + block.rows, 0);
  let row = -Math.max(0, total - grid.rows);
  ctx.save();
  ctx.beginPath();
  // Clip rows only, so full width bands can reach the window edges.
  ctx.rect(0, grid.y, SCREEN_WIDTH, grid.rows * grid.cellHeight);
  ctx.clip();
  for (const block of blocks) {
    if (row + block.rows > 0 && row < grid.rows) block.draw(ctx, grid, row);
    row += block.rows;
  }
  ctx.restore();
}

/** Returns `spans` with a background over characters [from, to), splitting spans at the edges. */
export function withBackground(spans: Span[], from: number, to: number, bg: string): Span[] {
  const result: Span[] = [];
  let at = 0;
  for (const part of spans) {
    const start = at;
    const end = at + part.text.length;
    at = end;
    if (part.glyph || end <= from || start >= to) {
      result.push(part);
      continue;
    }
    const cutA = Math.max(from, start) - start;
    const cutB = Math.min(to, end) - start;
    if (cutA > 0) result.push({ ...part, text: part.text.slice(0, cutA) });
    result.push({ ...part, text: part.text.slice(cutA, cutB), bg });
    if (cutB < part.text.length) result.push({ ...part, text: part.text.slice(cutB) });
  }
  return result;
}
