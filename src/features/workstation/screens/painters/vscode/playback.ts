import { activeIndex, blinkOn, layOut, loopTime } from '../../anim/timeline';
import { typedLength, typingDuration } from '../../anim/typing';
import { INDENT, INSERT_AFTER, SOURCE, SUGGESTIONS, SUGGEST_AT, TYPED_LINE } from './source';

/**
 * The editing loop: the caret opens a line, types it with IntelliSense accepting a completion
 * part way, saves, then selects the line, deletes it and saves again.
 */

const TYPE_RATE = 11;

/** Keystrokes. Accepting the completion lands several characters in one go. */
const ACCEPT_AFTER = `${SUGGEST_AT}setSc`;
const KEYS = [...ACCEPT_AFTER, 'alar', ...TYPED_LINE.slice(ACCEPT_AFTER.length + 4)];
/** One character per keystroke, so the typing rhythm helper can pace them. */
const KEY_PROXY = KEYS.map((key) => key[0]).join('');

type Phase = 'idle' | 'open' | 'type' | 'saved' | 'select' | 'deleted';

const TIMELINE = layOut<Phase>(['idle', 'open', 'type', 'saved', 'select', 'deleted'], (phase) => {
  if (phase === 'type') return typingDuration(KEY_PROXY, TYPE_RATE) + 0.7;
  return { idle: 1.6, open: 0.5, saved: 4, select: 0.7, deleted: 1.2 }[phase];
});

export interface Suggest {
  /** What has been typed of the member name. */
  partial: string;
  items: string[];
}

export interface EditorView {
  lines: string[];
  /** Index of the inserted line, or -1 when it is not in the file. */
  inserted: number;
  caret: { line: number; col: number; visible: boolean };
  selectedLine: number;
  suggest: Suggest | null;
  dirty: boolean;
  /** Saves so far in this loop, each one a hot reload line in the terminal. */
  saves: number;
  key: string;
}

function typedPrefix(elapsed: number) {
  return KEYS.slice(0, typedLength(KEY_PROXY, elapsed, TYPE_RATE)).join('');
}

function suggestFor(prefix: string): Suggest | null {
  if (!prefix.startsWith(SUGGEST_AT)) return null;
  const partial = prefix.slice(SUGGEST_AT.length);
  if (!/^\w*$/.test(partial) || partial === 'setScalar') return null;
  const items = SUGGESTIONS.filter((item) => item.toLowerCase().startsWith(partial.toLowerCase()));
  return items.length ? { partial, items } : null;
}

export function editorView(time: number): EditorView {
  const t = loopTime(time, TIMELINE.duration);
  const index = activeIndex(TIMELINE, t);
  const segment = TIMELINE.segments[index];
  const phase = segment.item;
  const elapsed = t - segment.start;

  let typed = '';
  if (phase === 'type') typed = typedPrefix(elapsed);
  else if (phase === 'saved' || phase === 'select') typed = TYPED_LINE;
  const hasLine = phase === 'open' || phase === 'type' || phase === 'saved' || phase === 'select';

  // Typing "(" auto closes it, so the ")" waits ahead of the caret until it is typed over.
  const unclosed = (typed.match(/\(/g)?.length ?? 0) > (typed.match(/\)/g)?.length ?? 0);
  const inserted = hasLine ? INSERT_AFTER + 1 : -1;
  const lines = hasLine ? [...SOURCE.slice(0, inserted), `${INDENT}${typed}${unclosed ? ')' : ''}`, ...SOURCE.slice(inserted)] : SOURCE;

  const caretLine = hasLine ? inserted : INSERT_AFTER;
  const caretCol = hasLine ? INDENT.length + typed.length : SOURCE[INSERT_AFTER].length;
  // The caret holds solid while keys are landing and blinks when idle.
  const typing = phase === 'type' && typed.length < TYPED_LINE.length;
  const visible = typing || phase === 'select' || blinkOn(elapsed, 1);
  const suggest = phase === 'type' ? suggestFor(typed) : null;
  const dirty = phase === 'open' || phase === 'type' || phase === 'deleted';

  return {
    lines,
    inserted,
    caret: { line: caretLine, col: caretCol, visible },
    selectedLine: phase === 'select' ? inserted : -1,
    suggest,
    dirty,
    saves: index >= 3 ? 1 : 0,
    key: [phase, typed.length, visible, dirty].join(':'),
  };
}

/** Just after saving the finished line. */
export const EDITOR_STILL_TIME = TIMELINE.segments[3].start + 0.4;
