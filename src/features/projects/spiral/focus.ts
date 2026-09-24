import type { FocusSnapshot } from '../state/spiralStore';
import { projectAt } from './loop';

/** The panel opens once the spiral is this close to a card and this slow, in cards and cards per second. */
const PANEL_DISTANCE = 0.2;
const PANEL_SPEED = 1.5;

/** A card counts as settled once the settle value passes this. */
const SETTLED = 0.5;

/**
 * Which project the panel should describe and which one has locked into
 * focus. `value` is the looping card index, so every answer is a project
 * index. Writes into `out` so the render loop allocates nothing.
 */
export function readFocus(value: number, velocity: number, settle: number, count: number, out: FocusSnapshot) {
  const nearest = Math.round(value);
  const project = projectAt(nearest, count);
  const close = Math.abs(value - nearest) < PANEL_DISTANCE && Math.abs(velocity) < PANEL_SPEED;
  out.panel = close ? project : null;
  out.settled = settle > SETTLED ? project : null;
  return out;
}
