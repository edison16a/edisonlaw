import { diffCodeSpans } from '../../draw/diff';
import {
  cellX,
  drawCellBox,
  drawLine,
  drawSpans,
  glyphSpan,
  lineWeight,
  linesBlock,
  rowY,
  span,
  type Line,
  type Span,
  type TermBlock,
} from '../../draw/terminal';
import { wrapWords } from '../../draw/text';
import { COMMANDS, type CodexAction } from './session';
import { CODEX_THEME as T } from './theme';

/** Codex transcript pieces, all monochrome: bullets, elbows, a plan checklist and a composer. */

const HEADER_COLS = 60;

export function headerBlock(): TermBlock {
  return {
    rows: 6,
    draw(ctx, grid, row) {
      drawCellBox(ctx, grid, 0, row, HEADER_COLS, 6, T.border);
      drawSpans(ctx, grid, 2, row + 1, [span('>_ ', T.dim), span('OpenAI Codex', T.bright, { weight: 700 }), span(' (v0.58.0)', T.dim)], T.text);
      drawSpans(ctx, grid, 2, row + 3, [span('model:     ', T.dim), span('gpt-5.1-codex high'), span('   /model to change', T.dim)], T.text);
      drawSpans(ctx, grid, 2, row + 4, [span('directory: ', T.dim), span('~/code/edisonlaw')], T.text);
    },
  };
}

export function introBlock(): TermBlock {
  const lines: Line[] = [
    { spans: [span('  To get started, describe a task or try one of these commands:', T.dim)] },
    { spans: [] },
    ...COMMANDS.map((command) => ({ spans: [span(`  ${command.name.padEnd(10)}`, T.text), span(command.hint, T.dim)] })),
  ];
  return linesBlock(lines, T.text);
}

export function userBlock(message: string): TermBlock {
  return linesBlock([{ spans: [span('› ', T.bright, { weight: 700 }), span(message, T.text)], bg: T.band }], T.text);
}

export function sayBlock(message: string, cols: number): TermBlock {
  const lines = wrapWords(message, cols - 4).map<Line>((line, index) => ({
    spans: index === 0 ? [glyphSpan('bullet', T.text), span(line)] : [span(`  ${line}`)],
  }));
  return linesBlock(lines, T.text);
}

/** "  └ " before the first child line, plain indent after it. */
const child = (index: number): Span[] => (index === 0 ? [span('  '), glyphSpan('elbow', T.faint)] : [span('    ')]);

function heading(title: string, detail: string, running: boolean, pulse: boolean): Line {
  const bullet = running ? (pulse ? T.text : T.faint) : T.text;
  return { spans: [glyphSpan('bullet', bullet), span(title, T.bright, { weight: 700 }), span(detail ? ` ${detail}` : '', T.text)] };
}

function planBlock(steps: { text: string; done: boolean }[]): TermBlock {
  return {
    rows: steps.length + 1,
    draw(ctx, grid, row) {
      drawLine(ctx, grid, row, heading('Updated Plan', '', false, false), T.text);
      steps.forEach((item, index) => {
        const mark = glyphSpan(item.done ? 'check' : 'square', item.done ? T.dim : T.text);
        const start = drawSpans(ctx, grid, 0, row + 1 + index, [...child(index), mark], T.text);
        const end = drawSpans(ctx, grid, start, row + 1 + index, [span(item.text, item.done ? T.dim : T.text)], T.text);
        if (item.done) {
          // Finished steps are struck through, the way Codex marks them.
          const weight = lineWeight(grid) * 0.7;
          ctx.fillStyle = T.dim;
          ctx.fillRect(cellX(grid, start), Math.round(rowY(grid, row + 1 + index) + grid.cellHeight / 2), (end - start) * grid.cellWidth, weight);
        }
      });
    },
  };
}

function workedBlock(label: string): TermBlock {
  return {
    rows: 1,
    draw(ctx, grid, row) {
      const weight = lineWeight(grid) * 0.7;
      const y = Math.round(rowY(grid, row) + grid.cellHeight / 2 - weight / 2);
      ctx.fillStyle = T.faint;
      ctx.fillRect(cellX(grid, 0), y, grid.cellWidth * 1.5, weight);
      const end = drawSpans(ctx, grid, 2, row, [span(label, T.dim)], T.dim);
      ctx.fillStyle = T.faint;
      ctx.fillRect(cellX(grid, end + 1), y, (grid.cols - end - 1) * grid.cellWidth, weight);
    },
  };
}

export function actionBlock(action: CodexAction, done: boolean, progress: number, pulse: boolean): TermBlock {
  const running = !done;
  switch (action.kind) {
    case 'explore': {
      const shown = done ? action.lines.length : Math.ceil(progress * action.lines.length);
      const lines = action.lines.slice(0, shown).map<Line>((line, index) => ({
        spans: [...child(index), span(line.verb, T.text, { weight: 600 }), span(` ${line.text}`, T.dim)],
      }));
      return linesBlock([heading(running ? 'Exploring' : 'Explored', '', running, pulse), ...lines], T.text);
    }
    case 'plan':
      return planBlock(action.steps);
    case 'edit': {
      const code = diffCodeSpans(action.diff, { add: T.addBg, remove: T.background });
      const lines = action.diff.map<Line>((line, index) => {
        const color = line.sign === '+' ? T.bright : line.sign === '-' ? T.faint : T.dim;
        const tinted = code[index].map((part) => ({ ...part, color }));
        return {
          spans: [span(`${String(line.number).padStart(4)} ${line.sign} `, T.faint), ...tinted],
          bg: line.sign === '+' ? T.addBg : undefined,
          indent: 2,
        };
      });
      const stats = span(` (+${action.added} -${action.removed})`, T.dim);
      const title = heading(running ? 'Editing' : 'Edited', action.path, running, pulse);
      return linesBlock([{ spans: [...title.spans, stats] }, ...(done ? lines : [])], T.text);
    }
    case 'run': {
      const output = done ? action.output.map<Line>((text, index) => ({ spans: [...child(index), span(text, T.dim)] })) : [];
      return linesBlock([heading(running ? 'Running' : 'Ran', action.command, running, pulse), ...output], T.text);
    }
    case 'worked':
      return workedBlock(action.label);
  }
}

/** A bullet, then "Working (12s, esc to interrupt)" with a bright sweep through the word. */
export function statusBlock(verb: string, seconds: number, frame: number, shimmer: number): TermBlock {
  const letters = [...verb].map((letter, index) => {
    const distance = Math.abs(index - shimmer);
    return span(letter, distance < 1.2 ? T.bright : distance < 2.6 ? '#bdbdbd' : T.dim, { weight: 600 });
  });
  const bullet = glyphSpan(frame % 4 < 2 ? 'bullet' : 'ring', T.text);
  return linesBlock([{ spans: [bullet, ...letters, span(` (${seconds}s, esc to interrupt)`, T.faint)] }], T.text);
}

export function composerBlock(value: string, cursor: boolean): TermBlock {
  return {
    rows: 3,
    draw(ctx, grid, row) {
      // The band runs edge to edge, past the grid padding.
      ctx.fillStyle = T.band;
      ctx.fillRect(0, rowY(grid, row), ctx.canvas.width, grid.cellHeight * 3);
      const at = drawSpans(ctx, grid, 0, row + 1, [span('› ', T.bright, { weight: 700 }), span(value, T.text)], T.text);
      if (cursor) {
        ctx.fillStyle = T.text;
        ctx.fillRect(cellX(grid, at), rowY(grid, row + 1) + 2, grid.cellWidth, grid.cellHeight - 4);
      }
      if (!value) drawSpans(ctx, grid, at + 1, row + 1, [span('Ask Codex to do anything', T.faint)], T.faint);
    },
  };
}

const NEW_CHAT = { name: '/new', hint: 'start a new chat during a conversation' };

export function footerBlock(value: string): TermBlock {
  return {
    rows: 1,
    draw(ctx, grid, row) {
      if (value.startsWith('/') && NEW_CHAT.name.startsWith(value)) {
        drawSpans(ctx, grid, 2, row, [span(NEW_CHAT.name.padEnd(10), T.bright, { weight: 600 }), span(NEW_CHAT.hint, T.dim)], T.text);
        return;
      }
      drawSpans(ctx, grid, 2, row, [span('? for shortcuts', T.faint)], T.faint);
      const context = '100% context left';
      drawSpans(ctx, grid, grid.cols - context.length, row, [span(context, T.faint)], T.faint);
    },
  };
}
