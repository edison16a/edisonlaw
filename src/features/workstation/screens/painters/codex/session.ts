import type { AgentStep } from '../../anim/agentSession';
import type { DiffLine } from '../../draw/diff';

/**
 * The Codex session the centre monitor plays by default: a reduced motion fix for the
 * experience timeline. It ends with /new, which brings back the start screen.
 */

export type CodexAction =
  | { kind: 'explore'; lines: { verb: string; text: string }[] }
  | { kind: 'plan'; steps: { text: string; done: boolean }[] }
  | { kind: 'edit'; path: string; added: number; removed: number; diff: DiffLine[] }
  | { kind: 'run'; command: string; output: string[] }
  | { kind: 'worked'; label: string };

const PLAN = ['Find where the timeline animates', 'Add a reduced motion branch', 'Run the linter'];
const plan = (done: number): CodexAction => ({
  kind: 'plan',
  steps: PLAN.map((text, index) => ({ text, done: index < done })),
});

export const SESSION: AgentStep<CodexAction>[] = [
  { kind: 'idle', seconds: 1.4 },
  { kind: 'type', text: 'add a reduced motion fallback to the experience timeline' },
  { kind: 'think', seconds: 2 },
  { kind: 'say', text: "I'll check how the timeline animates before changing anything." },
  {
    kind: 'act',
    seconds: 2.4,
    action: {
      kind: 'explore',
      lines: [
        { verb: 'Search', text: 'prefers-reduced-motion in src' },
        { verb: 'Read', text: 'ExperienceSection.tsx, useTimelineProgress.ts' },
        { verb: 'Search', text: 'useReducedMotion in src/lib' },
      ],
    },
  },
  { kind: 'act', seconds: 0.9, action: plan(1) },
  { kind: 'think', seconds: 1.6 },
  {
    kind: 'act',
    seconds: 1.8,
    action: {
      kind: 'edit',
      path: 'src/features/experience/ExperienceSection.tsx',
      added: 3,
      removed: 1,
      diff: [
        { number: 21, sign: ' ', code: '  const progress = useTimelineProgress(ref);' },
        { number: 22, sign: '+', code: '  const reduced = useReducedMotion();' },
        { number: 23, sign: '+', code: '  const eased = reduced ? progress : smooth(progress);' },
        { number: 24, sign: '-', code: '  return <Timeline progress={smooth(progress)} />;' },
        { number: 24, sign: '+', code: '  return <Timeline progress={eased} instant={reduced} />;' },
      ],
    },
  },
  { kind: 'act', seconds: 2.6, action: { kind: 'run', command: 'npm run lint', output: ['> edisonlaw@0.1.0 lint', '> eslint .'] } },
  { kind: 'act', seconds: 0.6, action: plan(3) },
  { kind: 'act', seconds: 0.3, action: { kind: 'worked', label: 'Worked for 13s' } },
  {
    kind: 'say',
    text: 'The timeline now respects reduced motion. When the system asks for less motion, the dots fill instantly and the line draws without easing. Lint passes.',
  },
  { kind: 'idle', seconds: 4.5 },
  { kind: 'type', text: '/new' },
];

export const COMMANDS = [
  { name: '/init', hint: 'create an AGENTS.md file with instructions for Codex' },
  { name: '/status', hint: 'show current session configuration' },
  { name: '/model', hint: 'choose what model and reasoning effort to use' },
];
