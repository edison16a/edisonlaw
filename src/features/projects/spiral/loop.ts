/**
 * The spiral's card index runs on forever in both directions, so the projects
 * loop with no first or last card. These helpers map the index back onto the
 * list and step along it. Pure, so it is unit tested.
 */

/** Furthest quick presses can queue up ahead of the card passing the slot, so a burst of clicks stays readable. */
export const MAX_LEAD = 3;

/** The project at card `index`. A continuous index counts as its nearest card. */
export function projectAt(index: number, count: number) {
  if (count < 1) return 0;
  const card = Math.round(index);
  return ((card % count) + count) % count;
}

/**
 * The card one press in `direction` (1 for next, -1 for previous) sends the
 * spiral to. It counts on from the card the spiral is already heading for, so
 * quick presses queue up, and a press the other way turns it round smoothly.
 * The queue never runs more than `maxLead` cards from the card passing the
 * slot right now at `value`.
 */
export function stepTarget(target: number, value: number, direction: 1 | -1, maxLead = MAX_LEAD) {
  const here = Math.round(value);
  const next = Math.round(target) + direction;
  return Math.min(here + maxLead, Math.max(here - maxLead, next));
}
