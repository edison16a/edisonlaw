import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { HEAD, PART_COUNT } from '../dimensions';
import { Field } from '../sdf/field';
import { surfaceFrame } from '../sdf/trace';
import { FACE, headForms } from './head';

/**
 * Where the head rests: head space is sculpted around the skull, and these matrices turn, scale and
 * seat it so the point Edison's palm touches lands exactly on HEAD.top. The head turns about the middle
 * of its crown's curve, below that point, so the crown stays in his palm however it turns.
 */

function restRotation() {
  const { yaw, pitch, tilt } = HEAD.rest;
  return new Quaternion().setFromEuler(new Euler(-pitch, yaw, tilt, 'YXZ'));
}

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
export function headCrown(): Vector3 {
  if (crown) return crown.clone();
  const field = new Field(headForms(), PART_COUNT);
  const up = towardPalm().applyQuaternion(restRotation().invert());
  const across = new Vector3(1, 0, 0).addScaledVector(up, -up.x).normalize();
  const along = new Vector3().crossVectors(up, across);
  const direction = new Vector3();
  let best = -Infinity;
  const found = new Vector3();
  for (let ring = 0; ring <= 30; ring++) {
    const tilt = (ring * Math.PI) / 180;
    for (let step = 0; step < (ring === 0 ? 1 : 36); step++) {
      const turn = (step * Math.PI) / 18;
      direction
        .copy(up)
        .multiplyScalar(Math.cos(tilt))
        .addScaledVector(across, Math.sin(tilt) * Math.cos(turn))
        .addScaledVector(along, Math.sin(tilt) * Math.sin(turn));
      const { position } = surfaceFrame(field, FACE.core, direction.toArray());
      const height = position.dot(up);
      if (height > best) {
        best = height;
        found.copy(position);
      }
    }
  }
  crown = found;
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
