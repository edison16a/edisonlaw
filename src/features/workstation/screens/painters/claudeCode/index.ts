import { createAgentSession, type AgentView } from '../../anim/agentSession';
import { blankBlock, createGrid, drawTranscript, type TermBlock } from '../../draw/terminal';
import { terminalWindow } from '../../draw/window';
import type { PainterFactory } from '../../types';
import { promptBlock, promptFooter, sayBlock, spinnerBlock, toolBlock, userBlock } from './blocks';
import { SESSION, type ToolCall } from './session';
import { CLAUDE_THEME as T } from './theme';
import { welcomeBlock } from './welcome';

/** Large enough to read on the monitor, which shows the canvas at a fifth of its size or less. */
const FONT_SIZE = 26;
const LINE_HEIGHT = 36;
const PADDING = 24;

const session = createAgentSession(SESSION, { typeRate: 13, streamRate: 70 });

/**
 * The still frame: the diff has just landed and Claude is still working, with the welcome box
 * still in view above it.
 */
const STILL_TIME = session.startOf((item) => item.kind === 'think' && item.verb === 'Percolating') + 0.5;

function transcript(view: AgentView<ToolCall>, cols: number): TermBlock[] {
  const blocks: TermBlock[] = [welcomeBlock(), blankBlock()];
  for (const item of view.items) {
    if (item.kind === 'user') blocks.push(userBlock(item.text));
    else if (item.kind === 'say') blocks.push(sayBlock(item.text, cols));
    else blocks.push(toolBlock(item.action, item.done, view.pulse, cols));
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
  stillTime: STILL_TIME,
  frameKey: (time) => session.view(time).key,
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
    drawTranscript(ctx, grid, transcript(session.view(time), grid.cols));
  },
});
