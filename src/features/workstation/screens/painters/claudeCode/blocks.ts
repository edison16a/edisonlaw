import { drawGlyph } from '../../draw/glyphs';
import { toSpans, tokenize } from '../../draw/syntax';
import {
  cellX,
  drawCellBox,
  drawLine,
  drawSpans,
  glyphSpan,
  linesBlock,
  rowY,
  span,
  withBackground,
  type Line,
  type Span,
  type TermBlock,
} from '../../draw/terminal';
import { wrapWords } from '../../draw/text';
import { SLASH_COMMANDS, type DiffLine, type ToolResult } from './session';
import { CLAUDE_THEME as T } from './theme';

/** Transcript pieces: the user's message, Claude's replies, tool calls, spinner and prompt. */

export function userBlock(message: string): TermBlock {
  return linesBlock([{ spans: [span('> ', T.dim), span(message, '#cfccc5')], bg: T.userBg }], T.text);
}

export function sayBlock(message: string, cols: number): TermBlock {
  const lines = wrapWords(message, cols - 4).map<Line>((line, index) => ({
    spans: index === 0 ? [glyphSpan('dot', T.text), span(line)] : [span(`  ${line}`)],
  }));
  return linesBlock(lines, T.text);
}

function diffLines(diff: DiffLine[]): Line[] {
  const tokens = tokenize(
    diff.map((line) => line.code),
    'tsx',
  );
  return diff.map((line, index) => {
    const bg = line.sign === '+' ? T.addBg : line.sign === '-' ? T.removeBg : undefined;
    const strong = line.sign === '+' ? T.addStrong : T.removeStrong;
    let code: Span[] = toSpans(tokens[index]);
    if (line.changed) code = withBackground(code, line.changed[0], line.changed[1], strong);
    const gutter = `${String(line.number).padStart(4)} ${line.sign} `;
    return { spans: [span(gutter, line.sign === ' ' ? T.faint : T.dim), ...code], bg, indent: 5 };
  });
}

function resultLines(result: ToolResult): Line[] {
  const lines: Line[] = [
    {
      spans: [
        span('  '),
        glyphSpan('elbow', T.dim),
        span(' '),
        span(result.summary, T.dim),
        ...(result.note ? [span(` ${result.note}`, T.faint)] : []),
      ],
    },
  ];
  result.output?.forEach((output) => {
    lines.push({
      spans: output.pass
        ? [span('     '), glyphSpan('check', T.green), span(output.text, T.dim)]
        : [span('     '), span(output.text, T.text, { weight: 600 })],
    });
  });
  if (result.diff) lines.push(...diffLines(result.diff));
  return lines;
}

/** A tool call. While it runs the dot blinks grey, then it turns green and the result shows. */
export function toolBlock(name: string, target: string, result: ToolResult, done: boolean, blink: boolean): TermBlock {
  const dotColor = done ? T.green : blink ? T.dim : T.faint;
  const call: Line = {
    spans: [glyphSpan('dot', dotColor), span(name, T.text, { weight: 700 }), span(`(${target})`, T.text)],
  };
  return linesBlock(done ? [call, ...resultLines(result)] : [call], T.text);
}

/** The ping pong star animation beside the spinner verb. */
const STAR_FRAMES = [
  { arms: 4, spread: 0.5 },
  { arms: 4, spread: 0.85 },
  { arms: 6, spread: 0.85 },
  { arms: 6, spread: 1 },
  { arms: 8, spread: 1 },
  { arms: 8, spread: 0.8 },
];

/** "✻ Pondering… (12s, esc to interrupt)" with a shimmer running through the verb. */
export function spinnerBlock(verb: string, seconds: number, frame: number, shimmer: number): TermBlock {
  return {
    rows: 1,
    draw(ctx, grid, row) {
      const cycle = STAR_FRAMES.length * 2 - 2;
      const index = frame % cycle;
      const star = STAR_FRAMES[index < STAR_FRAMES.length ? index : cycle - index];
      drawGlyph(ctx, 'star', cellX(grid, 0) + grid.cellWidth / 2, rowY(grid, row) + grid.cellHeight / 2, grid.fontSize, T.orange, star);
      const word = `${verb}…`;
      const letters = [...word].map((letter, i) => span(letter, Math.abs(i - shimmer) < 1.6 ? T.orangeLight : T.orange));
      drawSpans(ctx, grid, 2, row, [...letters, span(` (${seconds}s, esc to interrupt)`, T.dim)], T.dim);
    },
  };
}

/** The input box. An empty prompt shows a dim suggestion after the cursor. */
export function promptBlock(value: string, cursor: boolean): TermBlock {
  return {
    rows: 3,
    draw(ctx, grid, row) {
      drawCellBox(ctx, grid, 0, row, grid.cols, 3, T.promptBorder);
      const parts: Span[] = [span('> ', T.text), span(value, T.text)];
      const at = drawSpans(ctx, grid, 2, row + 1, parts, T.text);
      if (cursor) {
        ctx.fillStyle = T.text;
        ctx.fillRect(cellX(grid, at), rowY(grid, row + 1) + 2, grid.cellWidth, grid.cellHeight - 4);
      }
      if (!value) drawSpans(ctx, grid, at + 1, row + 1, [span('Try "write a test for useSpiralMotion.ts"', T.faint)], T.faint);
    },
  };
}

/** Hint line under the prompt, or the matching commands while a slash command is typed. */
export function promptFooter(value: string): TermBlock {
  if (!value.startsWith('/')) return linesBlock([{ spans: [span('  ? for shortcuts', T.faint)] }], T.faint);
  const matches = SLASH_COMMANDS.filter((command) => command.name.startsWith(value));
  return {
    rows: Math.max(1, matches.length),
    draw(ctx, grid, row) {
      matches.forEach((command, index) => {
        const color = index === 0 ? T.purple : T.dim;
        drawLine(ctx, grid, row + index, { spans: [span(`  ${command.name.padEnd(14)}`, color), span(command.hint, color)] }, color);
      });
    },
  };
}
