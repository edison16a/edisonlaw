import { blankBlock, createGrid, drawTranscript, type TermBlock } from '../../draw/terminal';
import { terminalWindow } from '../../draw/window';
import type { PainterFactory } from '../../types';
import { promptBlock, promptFooter, sayBlock, spinnerBlock, toolBlock, userBlock } from './blocks';
import { SESSION_STILL_TIME, sessionView, type SessionView } from './playback';
import { CLAUDE_THEME as T } from './theme';
import { welcomeBlock } from './welcome';

const FONT_SIZE = 14;
const LINE_HEIGHT = 20;
const PADDING = 18;

function transcript(view: SessionView, cols: number): TermBlock[] {
  const blocks: TermBlock[] = [welcomeBlock(), blankBlock()];
  for (const item of view.items) {
    if (item.kind === 'user') blocks.push(userBlock(item.text));
    else if (item.kind === 'say') blocks.push(sayBlock(item.text, cols));
    else blocks.push(toolBlock(item.name, item.target, item.result, item.done, view.pulse));
    blocks.push(blankBlock());
  }
  if (view.working) {
    const { verb, seconds, frame, shimmer } = view.working;
    blocks.push(spinnerBlock(verb, seconds, frame, shimmer), blankBlock());
  }
  blocks.push(promptBlock(view.prompt, view.cursor), promptFooter(view.prompt));
  return blocks;
}

/** Claude Code in a terminal, working through a change to the project spiral on a loop. */
export const claudeCode: PainterFactory = () => ({
  stillTime: SESSION_STILL_TIME,
  frameKey: (time) => sessionView(time).key,
  paint(ctx, time) {
    const area = terminalWindow(ctx, {
      title: 'Spiral Motion Weight',
      background: T.background,
      bar: T.bar,
      titleColor: T.dim,
      icon: { glyph: 'star', color: T.orange },
    });
    const grid = createGrid(
      ctx,
      { x: area.x + PADDING, y: area.y + 10, w: area.w - PADDING * 2, h: area.h - 12 },
      FONT_SIZE,
      LINE_HEIGHT,
    );
    drawTranscript(ctx, grid, transcript(sessionView(time), grid.cols));
  },
});
