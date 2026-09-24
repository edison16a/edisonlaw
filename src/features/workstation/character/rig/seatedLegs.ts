import { Quaternion, Vector3 } from 'three';
import { BODY } from '../dimensions';
import type { LimbGoal } from './limbs';
import type { LimbName, Side } from './types';

/**
 * His feet do not reach the floor from the chair, so seated his thighs rest on the seat and his shins
 * hang back under its front edge, the feet dangling with the toes relaxed downward, the way a short
 * person sits on a tall chair. Angles in radians: `splay` turns the thigh out, `tuck` swings the shin
 * back from vertical, `point` lowers the toes from square to the shin and `turn` turns them out.
 * One foot is tucked further back than the other, so the pose does not look mirrored.
 */
const LEGS: Record<LimbName, { splay: number; tuck: number; point: number; turn: number }> = {
  left: { splay: 0.08, tuck: 0.3, point: 0.36, turn: 0.1 },
  right: { splay: 0.05, tuck: 0.58, point: 0.42, turn: 0.04 },
};
/** How far the thighs tip down from level toward the knees, resting on the seat. */
const THIGH_PITCH = 0.07;
/** How far the shin swings each way at full swing. */
const SWING = 0.1;

const X_AXIS = new Vector3(1, 0, 0);
const Y_AXIS = new Vector3(0, 1, 0);
const thigh = new Vector3();
const shin = new Vector3();
const pitch = new Quaternion();

/**
 * A seated leg hanging from the seat. The goal is in his own space and assumes the pelvis sits level at
 * its seated height, as the seated pose keeps it.
 * `swing`, from -1 to 1, swings the shin forward and back from its resting tuck.
 */
export function hangingLeg(side: Side, name: LimbName, swing: number, out: LimbGoal) {
  const leg = LEGS[name];
  const tuck = leg.tuck + SWING * swing;
  const level = Math.cos(THIGH_PITCH);
  thigh.set(side * Math.sin(leg.splay) * level, -Math.sin(THIGH_PITCH), Math.cos(leg.splay) * level);
  shin.set(0, -Math.cos(tuck), -Math.sin(tuck));
  out.target
    .set(side * BODY.hip.x, BODY.seatedPelvisHeight + BODY.hip.y, 0)
    .addScaledVector(thigh, BODY.thigh)
    .addScaledVector(shin, BODY.shin);
  // The knee points along the thigh, forward over the seat's edge.
  out.pole.copy(thigh);
  out.rotation.setFromAxisAngle(Y_AXIS, side * leg.turn).multiply(pitch.setFromAxisAngle(X_AXIS, tuck + leg.point));
}
