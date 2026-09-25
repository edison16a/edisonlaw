import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { HEAD, PART_COUNT } from '../dimensions';
import { Field } from '../sdf/field';
import { furthestAlong } from '../sdf/trace';
import { FACE, headForms } from './head';

/**
 * Where the head rests: head space is sculpted around the skull, and these matrices turn, scale and
 * seat it so the point Edison's palm touches lands exactly on HEAD.top. The head turns about the middle
 * of its crown's curve, below that point, so the crown stays in his palm however it turns.
 */

/** A turn of the head as a rotation: yaw about the upright, then pitch with the nose up positive, then tilt. */
export function headTurn({ yaw, pitch, tilt }: { yaw: number; pitch: number; tilt: number }) {
  return new Quaternion().setFromEuler(new Euler(-pitch, yaw, tilt, 'YXZ'));
}

const restRotation = () => headTurn(HEAD.rest);

/** Out of the crown toward Edison's palm, in dog space: up, leaning toward him behind its right shoulder. */
function towardPalm() {
  const from = new Vector3(-Math.cos(HEAD.contactFrom), 0, -Math.sin(HEAD.contactFrom));
  return new Vector3(0, Math.cos(HEAD.contactLean), 0).addScaledVector(from, Math.sin(HEAD.contactLean));
}

let crown: Vector3 | null = null;

/**
 * Where Edison's palm meets the sculpted head in its resting pose, in head space: the point that sticks
 * out furthest toward the palm, which faces down and leans in from his side (HEAD.contactLean). Found by
 * tracing the skull in a fan of directions and keeping the best hit.
 */
function headCrown(): Vector3 {
  crown ??= furthestAlong(new Field(headForms(), PART_COUNT), FACE.core, towardPalm().applyQuaternion(restRotation().invert()), 30);
  return crown.clone();
}

/**
 * Where the head pivots, in head space: the middle of the crown's curve, HEAD.pivotDepth straight in
 * from the contact. The skull is near enough a ball there that turning about it leaves the crown where
 * it was, so the palm stays on it through every look and tilt.
 */
export function headPivot(): Vector3 {
  const inward = towardPalm().applyQuaternion(restRotation().invert());
  return headCrown().addScaledVector(inward, -HEAD.pivotDepth);
}

/** The head bone's resting matrix in dog space: on the pivot below the crown contact, scaled up and turned. */
export function headBoneMatrix(out = new Matrix4()) {
  const pivot = new Vector3(...HEAD.top).addScaledVector(towardPalm(), -HEAD.pivotDepth * HEAD.scale);
  return out.compose(pivot, restRotation(), new Vector3(HEAD.scale, HEAD.scale, HEAD.scale));
}

/** Head space to dog space for the resting pose: the crown lands on the contact point. */
export function headRestMatrix(out = new Matrix4()) {
  return headBoneMatrix(out).multiply(new Matrix4().makeTranslation(headPivot().negate()));
}
