import { clamp } from '@/lib/math';

/** Helpers for scripted loops: steps laid end to end, cursor blink and stepped clocks. */

export interface Segment<T> {
  item: T;
  start: number;
  end: number;
}

export interface Timeline<T> {
  segments: Segment<T>[];
  /** Seconds from the first step to the end of the last one. */
  duration: number;
}

/** Lays `items` end to end, each lasting `durationOf(item)` seconds. */
export function layOut<T>(items: T[], durationOf: (item: T) => number): Timeline<T> {
  let at = 0;
  const segments = items.map((item) => {
    const start = at;
    at += durationOf(item);
    return { item, start, end: at };
  });
  return { segments, duration: at };
}

/** 0 before the segment, 1 after it, linear in between. */
export const progressOf = (segment: Segment<unknown>, time: number) =>
  clamp((time - segment.start) / Math.max(1e-6, segment.end - segment.start));

/** Index of the segment playing at `time`, or the last one once the timeline has ended. */
export function activeIndex(timeline: Timeline<unknown>, time: number) {
  const index = timeline.segments.findIndex((segment) => time < segment.end);
  return index === -1 ? timeline.segments.length - 1 : index;
}

/** Terminal style cursor blink, on for the first half of each period. */
export const blinkOn = (time: number, period = 1.1) => time % period < period * 0.55;

/** Integer tick of a clock running at `rate` steps per second. */
export const step = (time: number, rate: number) => Math.floor(time * rate);

/** Wraps `time` into one loop of `length` seconds. */
export const loopTime = (time: number, length: number) => ((time % length) + length) % length;
