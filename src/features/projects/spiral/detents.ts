/**
 * One detent per card, like the notches of a wheel. Pure, so it is unit tested.
 */

/**
 * The card that takes over the focus slot while the index moves from
 * `previous` to `next`, or null while the same card holds it. A card takes
 * over halfway between two cards, so a turn of one card crosses exactly one
 * detent in either direction.
 */
export function detentCrossed(previous: number, next: number): number | null {
  const from = Math.round(previous);
  const to = Math.round(next);
  return from === to ? null : to;
}
