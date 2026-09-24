import type { AgentStep } from '../../anim/agentSession';

/**
 * The Claude Code session the left monitor plays on a loop, working in this very repo.
 * It ends with /clear, which brings back the welcome screen the loop starts on.
 */

export interface DiffLine {
  number: number;
  sign: ' ' | '+' | '-';
  code: string;
  /** Characters of `code` that changed, drawn with a stronger background. */
  changed?: [number, number];
}

export interface ToolResult {
  summary: string;
  /** Dim text after the summary. */
  note?: string;
  diff?: DiffLine[];
  /** Command output under the summary line. */
  output?: { text: string; pass?: boolean }[];
}

export interface ToolCall {
  name: string;
  target: string;
  result: ToolResult;
}

const SPIRAL = 'src/features/projects/spiral';

export const SESSION: AgentStep<ToolCall>[] = [
  { kind: 'idle', seconds: 1.4 },
  { kind: 'type', text: 'make the spiral feel weightier' },
  { kind: 'think', seconds: 2.2, verb: 'Pondering' },
  {
    kind: 'act',
    seconds: 1.4,
    action: {
      name: 'Read',
      target: `${SPIRAL}/useSpiralMotion.ts`,
      result: { summary: 'Read 64 lines', note: '(ctrl+o to expand)' },
    },
  },
  {
    kind: 'say',
    text: "It chases the scroll with a stiff spring and no mass, so it stops dead. I'll add mass and soften the spring.",
  },
  {
    kind: 'act',
    seconds: 1.8,
    action: {
      name: 'Update',
      target: `${SPIRAL}/useSpiralMotion.ts`,
      result: {
        summary: `Updated ${SPIRAL}/useSpiralMotion.ts with 3 additions and 1 removal`,
        diff: [
          { number: 27, sign: ' ', code: '  const velocity = useRef(0);' },
          { number: 28, sign: '-', code: '  const stiffness = 12;', changed: [20, 22] },
          { number: 28, sign: '+', code: '  const stiffness = 5.5;', changed: [20, 23] },
          { number: 29, sign: '+', code: '  const mass = 1.6;' },
          { number: 30, sign: '+', code: '  const damping = 0.82;' },
        ],
      },
    },
  },
  { kind: 'think', seconds: 1.6, verb: 'Percolating' },
  {
    kind: 'act',
    seconds: 3,
    action: {
      name: 'Bash',
      target: `npx vitest run ${SPIRAL}`,
      result: {
        summary: 'RUN  v4.0.8 /Users/edison/code/edisonlaw',
        output: [
          { text: 'layout.test.ts (6 tests) 41ms', pass: true },
          { text: 'useSpiralMotion.test.ts (3 tests) 18ms', pass: true },
          { text: 'Test Files  2 passed (2)' },
        ],
      },
    },
  },
  {
    kind: 'say',
    text: 'Done. The spiral now carries momentum and settles with a slight overshoot, and slow scrolls still land cleanly on each card. Give it a scroll and tell me if it wants more weight.',
  },
  { kind: 'idle', seconds: 4.5 },
  { kind: 'type', text: '/clear' },
];

/** Shown under the prompt while a slash command is typed. */
export const SLASH_COMMANDS = [
  { name: '/clear', hint: 'Clear conversation history and free up context' },
  { name: '/compact', hint: 'Clear conversation history but keep a summary in context' },
  { name: '/config', hint: 'Open config panel' },
  { name: '/cost', hint: 'Show the total cost and duration of the current session' },
];
