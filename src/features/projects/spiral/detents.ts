/**
 * Detents for the continuous card index. Pure, so it is unit tested. A detent
 * is a notch on the wheel: several per card, and the card boundary is one of them.
 */

/** Notches per card. Each one plays a soft tick as the spiral turns past it. */
const DETENTS_PER_CARD = 4;

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
