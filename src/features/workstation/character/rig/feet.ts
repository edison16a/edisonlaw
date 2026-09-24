import { Quaternion, Vector3 } from 'three';
import { BODY } from '../dimensions';
import { jointFor, type LimbGoal } from './limbs';

/** Points under the sneaker in the foot bone's space: the middle of the sole and the ball of the foot. */
const SOLE_MIDDLE = new Vector3(0, -BODY.ankle, 0.046);
const BALL = new Vector3(0, -BODY.ankle, 0.088);
const X_AXIS = new Vector3(1, 0, 0);
const Y_AXIS = new Vector3(0, 1, 0);

const turned = new Quaternion();
const lift = new Quaternion();
const ankle = new Vector3();
const ball = new Vector3();

/**
 * A foot on a flat surface with the middle of its sole at `sole` (character space), toes turned out by
 * `turn` radians. `heelLift` raises the heel by rolling over the ball of the foot, which stays put.
 */
export function footOnSurface(sole: Vector3, turn: number, heelLift: number, out: LimbGoal) {
  turned.setFromAxisAngle(Y_AXIS, turn);
  jointFor(sole, turned, SOLE_MIDDLE, ankle);
  ball.copy(BALL).applyQuaternion(turned).add(ankle);
  out.rotation.copy(turned).multiply(lift.setFromAxisAngle(X_AXIS, heelLift));
  jointFor(ball, out.rotation, BALL, out.target);
}
