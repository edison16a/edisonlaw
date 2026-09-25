/**
 * Pure layout math for the project spiral: one strand of cards wound around a
 * vertical axis like a spiral staircase. No three.js and no DOM, so it runs in
 * unit tests.
 *
 * The camera sits on +Z and looks at the axis. The focus slot is the step
 * nearest the camera. Upcoming cards wait below it on the right, and cards
 * that have passed rise away to the left, wrap behind the axis and come back
 * along the far side. So the strand moves left as it turns to the next card,
 * the way a swipe to the left and a scroll down both read.
 */

export interface Point3 {
  x: number;
  y: number;
  z: number;
}

export interface CardPose extends Point3 {
  /** Turn around the vertical axis so the card faces away from the axis. */
  rotationY: number;
  scale: number;
  /** 1 while the card sits locked in the focus slot. */
  focus: number;
}

/** World size of a card at scale 1. */
export const CARD_WIDTH = 1.7;
export const CARD_HEIGHT = 1;

export const SPIRAL = {
  /** Distance from the axis to the cards. */
  radius: 2,
  /**
   * Turn between neighbouring cards, in radians. A little under seven cards
   * per turn, with a clear gap of 0.18 round the cylinder between one card
   * and the next, so each card reads on its own.
   */
  step: 0.94,
  /**
   * Height climbed between neighbouring cards. The strand keeps close to its
   * slope as the cards spread along it, and the turns above and below stand
   * a little further apart, with clear space between them too.
   */
  rise: 0.6,
  /** Height of the focus slot. */
  focusHeight: 0.12,
  /** Cards on the strand. Every project appears twice, so the loop always has cards to show. */
  slots: 24,
  /** How far the strand sweeps right at the top and bottom, per unit of height squared. */
  sweep: 0.1,
} as const;

/**
 * Where a locked card moves to: pulled toward the camera, level with it and
 * grown, so the project in focus reads at a glance, close to a third bigger
 * than the cards on the strand.
 */
export const FOCUS = {
  lift: 0.5,
  scale: 1.3,
  height: 0.04,
  /** How far from the slot a card still counts as in focus, in cards. */
  reach: 0.5,
} as const;

/** How far a hidden spiral sinks, for the entrance. */
const HIDDEN_DROP = 1.5;

/**
 * Distance of `slot` from the continuous `index`, in cards, wrapped so the
 * strand has no ends: always in [-slots / 2, slots / 2).
 */
export function slotOffset(slot: number, index: number, slots: number = SPIRAL.slots) {
  const half = slots / 2;
  return ((((slot - index + half) % slots) + slots) % slots) - half;
}

/** Smoothest step, zero first and second derivatives at both ends. */
function smootherstep(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

/** How strongly the card `offset` cards from the slot is pulled into focus, before settling. */
export function focusWeight(offset: number) {
  return Math.max(0, 1 - smootherstep(Math.abs(offset) / FOCUS.reach));
}

/**
 * Full pose of the card `offset` cards from the focus slot. `settle` is 1 once
 * the spiral has come to rest on a card and `hidden` is 1 while the strand is
 * tucked away. Writes into `out` so the render loop allocates nothing.
 */
export function cardPose(offset: number, settle: number, hidden: number, out: CardPose) {
  const angle = Math.PI / 2 - offset * SPIRAL.step;
  const radius = SPIRAL.radius * (1 - hidden * 0.5);
  out.x = Math.cos(angle) * radius;
  out.z = Math.sin(angle) * radius;
  out.y = SPIRAL.focusHeight - offset * SPIRAL.rise - hidden * HIDDEN_DROP;
  out.rotationY = offset * SPIRAL.step;

  const focus = focusWeight(offset) * settle;
  out.z += FOCUS.lift * focus;
  out.y += (FOCUS.height - SPIRAL.focusHeight) * focus;
  out.scale = 1 + (FOCUS.scale - 1) * focus;
  out.focus = focus;
  return out;
}

/**
 * How far the strand's sweep pushes a point at height `y` to the right, for a
 * card whose centre sits at `centreY`. The sweep grows with height squared,
 * which leans a card's sides a little. A card in focus (`flat` 1) takes the
 * sweep of its centre everywhere, so it moves with the strand but stays a
 * true rectangle.
 */
export function sweepOffset(y: number, centreY: number, flat: number) {
  const squared = y * y + (centreY * centreY - y * y) * flat;
  return SPIRAL.sweep * squared;
}

export function createPose(): CardPose {
  return { x: 0, y: 0, z: 0, rotationY: 0, scale: 1, focus: 0 };
}
