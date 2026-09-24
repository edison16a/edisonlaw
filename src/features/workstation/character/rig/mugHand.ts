import { Vector3 } from 'three';
import { lerp } from '@/lib/math';
import { BODY, HEAD_ABOVE_PELVIS, MUG } from '../dimensions';
import { aimRotation, jointFor, type LimbGoal } from './limbs';

/** Skull centre height when standing, the reference for everything the hand brings to the face. */
const HEAD_Y = BODY.standingPelvisHeight + HEAD_ABOVE_PELVIS;

/**
 * Mug centre positions and axes in his own space: held at the belly, cradled under the chin while he
 * thinks, and raised and tipped to his lips for a sip.
 */
const HOLD = {
  rest: { at: new Vector3(-0.07, 0.8, 0.178), axis: new Vector3(0.06, 1, 0.08).normalize() },
  think: { at: new Vector3(-0.034, HEAD_Y - 0.262, 0.212), axis: new Vector3(0.1, 1, -0.06).normalize() },
  sip: { at: new Vector3(-0.004, HEAD_Y - 0.103, 0.232), axis: new Vector3(0.03, 0.74, -0.67).normalize() },
} as const;

/** The back of the hand faces out to his right and a little back, so the fingers wrap the front. */
const OUTWARD = new Vector3(-1, 0.05, -0.3).normalize();
const MUG_IN_HAND = new Vector3(...MUG.centerInHand);

const point = new Vector3();
const axis = new Vector3();
const along = new Vector3();

/**
 * Right hand wrapped around the mug. `think` brings it up under the chin, `sip` to the lips and `tip`
 * tilts it to drink. The mug's axis runs along the thumb.
 */
export function mugHand(think: number, sip: number, tip: number, breath: number, out: LimbGoal) {
  point.lerpVectors(HOLD.rest.at, HOLD.think.at, think).lerp(HOLD.sip.at, sip);
  point.y += 0.004 * breath;
  axis.lerpVectors(HOLD.rest.axis, HOLD.think.axis, think).lerp(HOLD.sip.axis, tip).normalize();
  along.crossVectors(axis, OUTWARD);
  aimRotation(along, OUTWARD, out.rotation);
  jointFor(point, out.rotation, MUG_IN_HAND, out.target);
  // Elbow down by his side, lifting forward as the mug comes up.
  const raised = Math.max(think * 0.7, sip);
  out.pole.set(lerp(-1, -0.45, raised), -1, lerp(-0.45, 0.2, raised));
}

/** Finger curls around the mug, index to little, and how far the middle joints follow. */
export const MUG_GRIP = { curls: [0.95, 1.05, 1.1, 1.15], bend: 0.62, thumb: 0.45 } as const;
