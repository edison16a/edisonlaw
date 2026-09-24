/**
 * Detents and snapping for the continuous card index. Pure, so it is unit tested.
 * A detent is a notch on the wheel: several per card, and the card boundary is one of them.
 */

/** Notches per card. Each one plays a soft tick as the spiral turns past it. */
export const DETENTS_PER_CARD = 4;

/**
 * Past this share of a card away from the last locked card, a snap moves on to
 * the next card in the direction of travel instead of settling back.
 */
export const SNAP_THRESHOLD = 0.08;

/**
 * The detent line crossed while moving from `previous` to `next`, as a count of
 * detents from card 0, or null when both sit between the same two lines.
 * When a frame jumps several lines, the one nearest `next` is returned.
 */
export function detentCrossed(previous: number, next: number, perCard = DETENTS_PER_CARD): number | null {
  const from = Math.floor(previous * perCard);
  const to = Math.floor(next * perCard);
  if (from === to) return null;
  return next > previous ? to : to + 1;
}

/** True when a detent line lands exactly on a card. */
export function isCardDetent(detent: number, perCard = DETENTS_PER_CARD) {
  return ((detent % perCard) + perCard) % perCard === 0;
}

/**
 * Card to settle on once scrolling stops at `position`, or null outside the
 * track so the visitor can always scroll in and out freely.
 * `anchor` is the card that was locked before the scroll started: moving even
 * a little away from it commits to the neighbour, like a detent wheel.
 */
export function snapTarget(position: number, anchor: number | null, count: number, threshold = SNAP_THRESHOLD) {
  if (count < 1 || position < 0 || position > count - 1) return null;
  const nearest = Math.round(position);
  let target = nearest;
  if (anchor !== null && nearest === anchor && Math.abs(position - anchor) >= threshold) {
    target = anchor + Math.sign(position - anchor);
  }
  return Math.min(count - 1, Math.max(0, target));
}

/** Nearest card to a continuous index, kept inside the deck. */
export function nearestCard(position: number, count: number) {
  return Math.min(count - 1, Math.max(0, Math.round(position)));
}
