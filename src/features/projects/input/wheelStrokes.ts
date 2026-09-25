/**
 * Splits a stream of wheel events into strokes, so each stroke can turn the
 * spiral exactly one project. A stroke is one mouse wheel notch, or one
 * trackpad swipe together with its whole momentum tail. Pure, so it is unit
 * tested with made up event streams.
 *
 * A new stroke starts after the wheel has been idle for a moment, on every
 * notch of a mouse wheel, when a trackpad swipe turns round, and when a fresh
 * swipe speeds up again while the last one is still gliding to a stop. The
 * last two hold even straight after a notch.
 */

import { notchesIn } from './wheelNotches';
import type { WheelSample } from './wheelSample';

export interface StrokeRead {
  /** True when the wheel had gone idle before this event. */
  idle: boolean;
  /** True when this event starts a new stroke. */
  begins: boolean;
  /**
   * The projects this event asks to turn: positive on, negative back, 0 for
   * none. It is 1 or -1, except for a few wheel notches merged into one event.
   */
  step: number;
}

/**
 * Quiet for this long, in milliseconds, and the next event starts a new
 * gesture. Long enough that a busy moment on the page, after which the browser
 * hands over the waiting events as one, does not read as a pause.
 */
export const IDLE_GAP = 200;
/** Pixels of travel before a trackpad stroke turns the spiral, so a brush of the pad does nothing. */
const COMMIT = 4;
/** A single event this big straight after a pause is a mouse wheel notch, in pixels. */
const NOTCH = 40;
/**
 * Small events that follow a notch closer together than this, in
 * milliseconds, are a trackpad's stream. Further apart, they are what is left
 * of the notch.
 */
const NOTCH_GAP = 25;
/** Pixels of travel against a trackpad stroke that turn it round into a new one. */
const FLIP = 10;
/**
 * A stroke has to slow to this share of its top speed before a rise counts as
 * a fresh swipe. Then the speed has to climb to RISE times its lowest point
 * since, and by at least MIN_RISE pixels per millisecond.
 */
const DECAYED = 0.4;
const RISE = 2.5;
const MIN_RISE = 0.4;
/** Line and page sizes in pixels, so every event can be measured the same way. */
const LINE = 16;
const PAGE = 800;
/** Time between events is read as at least this, in milliseconds, when working out a speed. */
const FRAME_MIN = 8;

interface Stroke {
  /** A notch turns the spiral at once. A glide waits for COMMIT pixels of travel first. */
  kind: 'notch' | 'glide';
  /** Travel of one notch in pixels, from the event that started a notch stroke. */
  notch: number;
  /** The way the stroke turned the spiral, or 0 while a glide has not committed yet. */
  direction: -1 | 0 | 1;
  /** The axis the stroke committed along. */
  axis: 'x' | 'y';
  /** Travel so far, while a glide has not committed yet. */
  travelX: number;
  travelY: number;
  /** Travel against the stroke since it last moved its own way. */
  against: number;
  /** Top speed so far, and the lowest speed since then, in pixels per millisecond. */
  peak: number;
  trough: number;
}

const NONE = 0;

function unitOf(mode: number) {
  if (mode === 1) return LINE;
  if (mode === 2) return PAGE;
  return 1;
}

/** 1 for the next project, -1 for the previous one. Down and a swipe to the left both go on. */
function directionOf(value: number): -1 | 1 {
  return value > 0 ? 1 : -1;
}

export function createWheelStrokes() {
  let lastTime = -Infinity;
  let stroke: Stroke | null = null;

  const start = (kind: Stroke['kind'], notch = 0): Stroke => ({
    kind,
    notch,
    direction: NONE,
    axis: 'y',
    travelX: 0,
    travelY: 0,
    against: 0,
    peak: 0,
    trough: 0,
  });

  /** Commits `current` along its longer axis of travel and returns the step. */
  const commit = (current: Stroke, x: number, y: number, rate: number) => {
    current.axis = Math.abs(x) > Math.abs(y) ? 'x' : 'y';
    current.direction = directionOf(current.axis === 'x' ? x : y);
    current.peak = rate;
    current.trough = rate;
    return current.direction;
  };

  /** True when a committed glide turns round or speeds up again, which starts a new stroke. */
  const breaksOff = (current: Stroke, x: number, y: number, rate: number) => {
    const along = current.axis === 'x' ? x : y;
    if (along !== 0 && directionOf(along) !== current.direction) {
      current.against += Math.abs(along);
      return current.against >= FLIP;
    }
    if (along !== 0) current.against = 0;
    const fresh =
      current.trough <= current.peak * DECAYED && rate >= current.trough * RISE && rate - current.trough >= MIN_RISE;
    if (fresh) return true;
    if (rate > current.peak) {
      current.peak = rate;
      current.trough = rate;
    } else {
      current.trough = Math.min(current.trough, rate);
    }
    return false;
  };

  return {
    /** Reads one wheel event and says whether it starts a stroke and which step it asks for. */
    read(sample: WheelSample): StrokeRead {
      const gap = sample.time - lastTime;
      lastTime = sample.time;
      const idle = gap >= IDLE_GAP;
      const unit = unitOf(sample.mode);
      const x = sample.dx * unit;
      const y = sample.dy * unit;
      const size = Math.max(Math.abs(x), Math.abs(y));
      if (idle) stroke = null;
      if (size === 0) return { idle, begins: false, step: NONE };
      const rate = size / Math.min(IDLE_GAP, Math.max(FRAME_MIN, gap));

      // Lines and pages only come from mouse wheels, and so does a big jump out of a pause.
      if (sample.mode !== 0 || (stroke === null && size >= NOTCH)) {
        stroke = start('notch', size);
        return { idle, begins: true, step: commit(stroke, x, y, rate) };
      }
      if (stroke?.kind === 'notch') {
        // A stroke that began with a few notches merged into one event learns the size of one here.
        if (size >= NOTCH && notchesIn(stroke.notch, size) > 1) stroke.notch = size;
        // After that, an event of whole notches is the wheel again. However quick the
        // spin, every notch counts, and so does each of a few merged into one event.
        const notches = notchesIn(size, stroke.notch);
        if (notches > 0) {
          stroke = start('notch', stroke.notch);
          return { idle, begins: true, step: commit(stroke, x, y, rate) * notches };
        }
      }

      let begins = false;
      if (stroke === null) {
        stroke = start('glide');
        begins = true;
      } else if (stroke.direction !== NONE && breaksOff(stroke, x, y, rate)) {
        // This holds after a notch too. A busy page can hand over the start of a swipe
        // as one big event that reads like a notch, and the next swipe must still count.
        const turned = stroke.against >= FLIP;
        stroke = start('glide');
        begins = true;
        // A turn has already travelled far enough the other way, so it counts at once.
        if (turned) return { idle, begins, step: commit(stroke, x, y, rate) };
      } else if (stroke.kind === 'notch') {
        // Small events a moment after a notch belong to it. Anything else is a trackpad
        // swipe: a steady stream, or one a busy page handed over as a few big uneven
        // events. It glides on from here.
        if (gap < NOTCH_GAP || size >= NOTCH) stroke.kind = 'glide';
        return { idle, begins, step: NONE };
      }

      if (stroke.direction !== NONE) return { idle, begins, step: NONE };
      stroke.travelX += x;
      stroke.travelY += y;
      if (Math.max(Math.abs(stroke.travelX), Math.abs(stroke.travelY)) < COMMIT) return { idle, begins, step: NONE };
      return { idle, begins, step: commit(stroke, stroke.travelX, stroke.travelY, rate) };
    },
  };
}

export type WheelStrokes = ReturnType<typeof createWheelStrokes>;
