/**
 * The spiral's card index runs on forever in both directions, so the twelve
 * projects loop with no first or last card. These helpers map the index back
 * onto the list. Pure, so it is unit tested.
 */

/** Where the spiral waits before the visitor first moves it: halfway between the last project and the first. */
export const INTRO_INDEX = -0.5;

/** The project at card `index`. A continuous index counts as its nearest card. */
export function projectAt(index: number, count: number) {
  if (count < 1) return 0;
  const card = Math.round(index);
  return ((card % count) + count) % count;
}

/** The card nearest `from` that shows `project`, going forward on a tie. */
export function nearestCardOf(project: number, from: number, count: number) {
  const base = Math.round(from);
  if (count < 1) return base;
  const ahead = (((project - base) % count) + count) % count;
  return ahead > count / 2 ? base + ahead - count : base + ahead;
}

/**
 * The card one step from `index` in `direction` (1 or -1). From a whole card
 * that is its neighbour, and from between two cards it is the one in that direction.
 */
export function stepFrom(index: number, direction: 1 | -1) {
  const EPSILON = 1e-6;
  return direction > 0 ? Math.floor(index + EPSILON) + 1 : Math.ceil(index - EPSILON) - 1;
}
