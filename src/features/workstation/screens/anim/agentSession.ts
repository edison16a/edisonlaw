import { activeIndex, blinkOn, layOut, loopTime, progressOf, step } from './timeline';
import { streamedLength, typedLength, typingDuration } from './typing';

/**
 * Plays back a scripted coding agent session: the user types a prompt, the agent thinks,
 * streams replies and runs actions. Actions are opaque here, so each terminal app keeps its
 * own look for tool calls while sharing the timing.
 */

export type AgentStep<A> =
  | { kind: 'idle'; seconds: number }
  | { kind: 'type'; text: string }
  | { kind: 'think'; seconds: number; verb?: string }
  | { kind: 'say'; text: string }
  | { kind: 'act'; seconds: number; action: A };

export type AgentItem<A> =
  | { kind: 'user'; text: string }
  | { kind: 'say'; text: string }
  | { kind: 'act'; action: A; done: boolean; progress: number };

export interface AgentView<A> {
  items: AgentItem<A>[];
  /** Text in the input box. */
  prompt: string;
  /** Set while the agent works, from the moment the prompt is sent. */
  working: { verb: string; seconds: number; frame: number; shimmer: number } | null;
  cursor: boolean;
  /** Faster blink for running actions. */
  pulse: boolean;
  /** Changes whenever anything above changes. */
  key: string;
}

interface Pacing {
  /** Characters per second while the user types. */
  typeRate: number;
  /** Characters per second while a reply streams in. */
  streamRate: number;
  /** Beat between the last key and pressing enter. */
  submitPause?: number;
  /** Steps of the action progress that change the picture, for the frame key. */
  actionSteps?: number;
}

export interface AgentSession<A> {
  duration: number;
  view(time: number): AgentView<A>;
  /** Start time of the first step that matches, for picking still frames. */
  startOf(match: (item: AgentStep<A>) => boolean): number;
}

export function createAgentSession<A>(steps: AgentStep<A>[], pacing: Pacing): AgentSession<A> {
  const { typeRate, streamRate, submitPause = 0.45, actionSteps = 1 } = pacing;
  const timeline = layOut(steps, (item) => {
    if (item.kind === 'type') return typingDuration(item.text, typeRate) + submitPause;
    if (item.kind === 'say') return item.text.length / streamRate + 0.35;
    return item.seconds;
  });

  function view(time: number): AgentView<A> {
    const t = loopTime(time, timeline.duration);
    const index = activeIndex(timeline, t);
    const items: AgentItem<A>[] = [];
    let prompt = '';
    let sentAt = 0;
    let verb = 'Working';
    let progress = 0;

    for (let i = 0; i <= index; i++) {
      const segment = timeline.segments[i];
      const { item } = segment;
      const current = i === index;
      const elapsed = t - segment.start;
      if (item.kind === 'type') {
        if (current) {
          prompt = item.text.slice(0, typedLength(item.text, elapsed, typeRate));
          progress = prompt.length;
        } else {
          items.push({ kind: 'user', text: item.text });
          sentAt = segment.end;
        }
      } else if (item.kind === 'think') {
        verb = item.verb ?? verb;
      } else if (item.kind === 'say') {
        const shown = current ? streamedLength(item.text, elapsed, streamRate) : item.text.length;
        if (current) progress = shown;
        if (shown > 0) items.push({ kind: 'say', text: item.text.slice(0, shown) });
      } else if (item.kind === 'act') {
        const actProgress = current ? progressOf(segment, t) : 1;
        if (current) progress = Math.floor(actProgress * actionSteps);
        items.push({ kind: 'act', action: item.action, done: !current, progress: actProgress });
      }
    }

    const kind = timeline.segments[index].item.kind;
    const busy = kind === 'think' || kind === 'say' || kind === 'act';
    const working = busy
      ? { verb, seconds: Math.floor(t - sentAt), frame: step(t, 8), shimmer: (step(t, 14) % (verb.length + 10)) - 3 }
      : null;
    const cursor = blinkOn(t);
    const pulse = blinkOn(t, 0.5);
    const workingKey = working && `${working.seconds}.${working.frame}.${working.shimmer}`;
    const key = [index, progress, cursor, kind === 'act' && pulse, workingKey].join(':');
    return { items, prompt, working, cursor, pulse, key };
  }

  function startOf(match: (item: AgentStep<A>) => boolean) {
    return timeline.segments.find((segment) => match(segment.item))?.start ?? 0;
  }

  return { duration: timeline.duration, view, startOf };
}
