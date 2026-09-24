import { activeIndex, blinkOn, layOut, loopTime, step } from '../../anim/timeline';
import { streamedLength, typedLength, typingDuration } from '../../anim/typing';
import { SESSION, type SessionStep, type ToolResult } from './session';

/** Turns the scripted session into what the terminal shows at a moment of the loop. */

const TYPE_RATE = 13;
const STREAM_RATE = 70;
const SUBMIT_PAUSE = 0.45;

function durationOf(item: SessionStep) {
  switch (item.kind) {
    case 'type':
      return typingDuration(item.text, TYPE_RATE) + SUBMIT_PAUSE;
    case 'say':
      return item.text.length / STREAM_RATE + 0.35;
    default:
      return item.seconds;
  }
}

const TIMELINE = layOut(SESSION, durationOf);

export type TranscriptItem =
  | { kind: 'user'; text: string }
  | { kind: 'say'; text: string }
  | { kind: 'tool'; name: string; target: string; result: ToolResult; done: boolean };

export interface SessionView {
  items: TranscriptItem[];
  prompt: string;
  /** Set while Claude works, from the moment the prompt is sent. */
  working: { verb: string; seconds: number; frame: number; shimmer: number } | null;
  cursor: boolean;
  /** Running tool dots pulse faster than the cursor. */
  pulse: boolean;
  key: string;
}

export function sessionView(time: number): SessionView {
  const t = loopTime(time, TIMELINE.duration);
  const index = activeIndex(TIMELINE, t);
  const items: TranscriptItem[] = [];
  let prompt = '';
  let sentAt = 0;
  let verb = 'Thinking';
  let progress = 0;

  for (let i = 0; i <= index; i++) {
    const { item, start, end } = TIMELINE.segments[i];
    const current = i === index;
    const elapsed = t - start;
    if (item.kind === 'type') {
      if (current) {
        prompt = item.text.slice(0, typedLength(item.text, elapsed, TYPE_RATE));
        progress = prompt.length;
      } else {
        items.push({ kind: 'user', text: item.text });
        sentAt = end;
      }
    } else if (item.kind === 'think') {
      verb = item.verb;
    } else if (item.kind === 'say') {
      const shown = current ? streamedLength(item.text, elapsed, STREAM_RATE) : item.text.length;
      if (current) progress = shown;
      if (shown > 0) items.push({ kind: 'say', text: item.text.slice(0, shown) });
    } else if (item.kind === 'tool') {
      items.push({ kind: 'tool', name: item.name, target: item.target, result: item.result, done: !current });
    }
  }

  const kind = TIMELINE.segments[index].item.kind;
  const busy = kind === 'think' || kind === 'say' || kind === 'tool';
  const working = busy
    ? { verb, seconds: Math.floor(t - sentAt), frame: step(t, 8), shimmer: (step(t, 14) % (verb.length + 10)) - 3 }
    : null;
  const cursor = blinkOn(t);
  const pulse = blinkOn(t, 0.5);
  const key = [index, progress, cursor, kind === 'tool' && pulse, working && `${working.seconds}.${working.frame}.${working.shimmer}`].join(':');
  return { items, prompt, working, cursor, pulse, key };
}

/**
 * The still frame: the diff has just landed and Claude is still working, with the welcome box
 * still in view above it.
 */
export const SESSION_STILL_TIME = (() => {
  const index = SESSION.findIndex((item) => item.kind === 'tool' && item.name === 'Bash');
  return TIMELINE.segments[index - 1].start + 0.5;
})();
