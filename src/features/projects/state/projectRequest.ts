import { moveSpiralTo } from '../input/steering';
import { projectAt } from '../spiral/loop';
import { spiralMotion } from './spiralMotion';

type Mover = (index: number) => void;

/** The carousel's way of moving, while it is on screen. The spiral has none, so it needs no entry. */
let carousel: Mover | null = null;

/** The carousel hands over its mover while mounted, and takes it back with the returned function. */
export function registerCarousel(move: Mover) {
  carousel = move;
  return () => {
    if (carousel === move) carousel = null;
  };
}

/** Brings project `index` of `count` into focus on whichever of the spiral or carousel is showing. */
export function showProject(index: number, count: number) {
  if (carousel) return carousel(index);
  const target = Math.round(spiralMotion.target);
  let step = index - projectAt(target, count);
  // Take the shorter way round the loop.
  if (step > count / 2) step -= count;
  if (step < -count / 2) step += count;
  moveSpiralTo(target + step);
}
