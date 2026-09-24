import type { FocusSnapshot } from '../state/spiralStore';
import { nearestCard } from './detents';
import { firstIndex } from './track';

/** The panel opens once the spiral is this close to a card and this slow, in cards and cards per second. */
const PANEL_DISTANCE = 0.2;
const PANEL_SPEED = 1.5;

/** A card counts as settled once the settle value passes this. */
const SETTLED = 0.5;

/** How far past the start of the track, in cards, the spiral still counts as in the intro. */
const INTRO_MARGIN = 0.25;

/**
 * Which card is nearest, which one the panel should describe and which one has
 * locked into focus. Writes into `out` so the render loop allocates nothing.
 */
export function readFocus(value: number, velocity: number, settle: number, count: number, out: FocusSnapshot) {
  const nearest = nearestCard(value, count);
  const close = Math.abs(value - nearest) < PANEL_DISTANCE && Math.abs(velocity) < PANEL_SPEED;
  out.focused = nearest;
  out.panel = close ? nearest : null;
  out.settled = settle > SETTLED ? nearest : null;
  out.inIntro = value < firstIndex() + INTRO_MARGIN;
  return out;
}
