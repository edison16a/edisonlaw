import { WHEEL_LEAD } from '../spiral/loop';

/** Mouse travel in pixels before a press becomes a drag. A shorter one is still a click on a card. */
export const DRAG_SLOP = 6;
/** Seconds of the drag's speed at release that carry on as a fling. */
const FLING_TIME = 0.14;
/** Share of a card a drag has to cover to move on, so a short drag turns one card like a swipe. */
const NUDGE = 0.1;
/** A drag that sets off this close to a card counts as setting off from it. */
const ON_CARD = 0.1;
/** Only the mouse's last this many milliseconds count toward its speed at release. */
const SPEED_WINDOW = 90;
/** A mouse that sat still this many milliseconds before letting go was not flicked. */
const STILL = 50;

export interface DragSample {
  /** Pointer x in CSS pixels. */
  x: number;
  /** Time in milliseconds. */
  time: number;
}

/**
 * Pixels the mouse travels to turn the spiral one card on a `width` by
 * `height` stage. Close to the gap between two cards on screen, so the card
 * under the mouse stays under it.
 */
export function cardSpan(width: number, height: number) {
  return Math.max(120, Math.min(width * 0.32, height * 0.5));
}

/**
 * Where the spiral is while the mouse drags it `dx` pixels from where the
 * press began at card `start`. A drag to the left brings in the next card, the
 * way the strand moves and a swipe reads.
 */
export function dragTarget(start: number, dx: number, span: number) {
  return start - dx / span;
}

/**
 * The mouse's speed at release in pixels per millisecond, from the samples in
 * the last moments of the drag. A mouse that stopped before letting go has no
 * speed. Pure, so it is unit tested.
 */
export function releaseSpeed(samples: DragSample[], now: number) {
  const recent = samples.filter((sample) => now - sample.time <= SPEED_WINDOW);
  if (recent.length < 2 || now - recent[recent.length - 1].time > STILL) return 0;
  const first = recent[0];
  const last = recent[recent.length - 1];
  return last.time > first.time ? (last.x - first.x) / (last.time - first.time) : 0;
}

/**
 * The whole card the spiral comes to rest on when the mouse lets go at
 * `target`, having set off from `start`. A flick at `speed` pixels per
 * millisecond carries it on, at most WHEEL_LEAD cards past the card at `value`
 * right now. A drag or flick worth a little of a card moves on one, so a
 * deliberate pull never springs back.
 */
export function releaseTarget(start: number, target: number, value: number, speed: number, span: number) {
  const flung = target - (speed * 1000 * FLING_TIME) / span;
  let card = Math.round(flung);
  const pulled = flung - start;
  // At least the next whole card past the start that way, even from between two cards.
  if (pulled >= NUDGE) card = Math.max(card, Math.floor(start + ON_CARD) + 1);
  if (pulled <= -NUDGE) card = Math.min(card, Math.ceil(start - ON_CARD) - 1);
  const here = Math.round(value);
  return Math.min(here + WHEEL_LEAD, Math.max(here - WHEEL_LEAD, card));
}
