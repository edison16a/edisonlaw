import { Vector3 } from 'three';
import { CHAIR } from '../../layout';
import { footOnSurface } from './feet';
import type { LimbGoal } from './limbs';
import type { LimbName, Side } from './types';

/**
 * Seated, his feet rest flat on the floor a little in front of the seat, knees apart and over the ankles,
 * the way a grown man sits at a desk. Distances in metres in his own space, whose origin is the seat:
 * `x` out to his side, `z` forward, `turn` turns the toes out in radians. One foot sits a little further
 * forward than the other, so the pose does not look mirrored.
 */
const FEET: Record<LimbName, { x: number; z: number; turn: number }> = {
  left: { x: 0.15, z: 0.5, turn: 0.14 },
  right: { x: -0.13, z: 0.44, turn: -0.08 },
};
/** How far the heel of the tapping foot lifts at the top of a tap, rolling over the ball of the foot. */
const HEEL_LIFT = 0.12;

const sole = new Vector3();

/**
 * A seated leg with its foot planted on the floor in front of the chair. The goal is in his own space and
 * assumes the pelvis sits level at its seated height, as the seated pose keeps it. `tap`, from -1 to 1,
 * lifts the heel on its upswing, a restless tap while he thinks.
 */
export function seatedLeg(side: Side, name: LimbName, tap: number, out: LimbGoal) {
  const foot = FEET[name];
  footOnSurface(sole.set(foot.x, -CHAIR.seatHeight, foot.z), foot.turn, HEEL_LIFT * Math.max(0, tap), out);
  // The knee points forward over the toes and a little out.
  out.pole.set(side * 0.25, 0.4, 1);
}
