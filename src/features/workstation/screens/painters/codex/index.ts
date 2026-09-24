import { createAgentSession, type AgentView } from '../../anim/agentSession';
import { blankBlock, createGrid, drawTranscript, type TermBlock } from '../../draw/terminal';
import { terminalWindow } from '../../draw/window';
import type { PainterFactory } from '../../types';
import { actionBlock, composerBlock, footerBlock, headerBlock, introBlock, sayBlock, statusBlock, userBlock } from './blocks';
import { SESSION, type CodexAction } from './session';
import { CODEX_THEME as T } from './theme';

const FONT_SIZE = 14;
const LINE_HEIGHT = 20;
const PADDING = 18;

const session = createAgentSession(SESSION, { typeRate: 14, streamRate: 70, actionSteps: 6 });

/** The still frame: the plan is up and Codex is working, with the header still in view. */
const STILL_TIME = session.startOf((item) => item.kind === 'think' && item.seconds === 1.6) + 0.6;

function transcript(view: AgentView<CodexAction>, cols: number): TermBlock[] {
  const blocks: TermBlock[] = [headerBlock(), blankBlock(), introBlock(), blankBlock()];
  for (const item of view.items) {
    if (item.kind === 'user') blocks.push(userBlock(item.text));
    else if (item.kind === 'say') blocks.push(sayBlock(item.text, cols));
    else blocks.push(actionBlock(item.action, item.done, item.progress, view.pulse));
    blocks.push(blankBlock());
  }
  if (view.working) {
    const { verb, seconds, frame, shimmer } = view.working;
    blocks.push(statusBlock(verb, seconds, frame, shimmer), blankBlock());
  }
  blocks.push(composerBlock(view.prompt, view.cursor), footerBlock(view.prompt));
  return blocks;
}

/** The Codex CLI in a terminal, fixing reduced motion on the experience timeline in a loop. */
export const codex: PainterFactory = () => ({
  stillTime: STILL_TIME,
  frameKey: (time) => session.view(time).key,
  paint(ctx, time) {
    const area = terminalWindow(ctx, { title: 'codex', background: T.background, bar: T.bar, titleColor: T.dim });
    const grid = createGrid(
      ctx,
      { x: area.x + PADDING, y: area.y + 10, w: area.w - PADDING * 2, h: area.h - 12 },
      FONT_SIZE,
      LINE_HEIGHT,
    );
    drawTranscript(ctx, grid, transcript(session.view(time), grid.cols));
  },
});
