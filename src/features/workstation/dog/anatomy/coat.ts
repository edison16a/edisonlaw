import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { HEAD, PART_COUNT } from '../dimensions';
import { Field, transformShapes } from '../sdf/field';
import { bodyForms, bodyFur } from './body';
import { FACE, headForms, headFur, mouthCarves } from './head';
import { surfaceFrame } from '../sdf/trace';
import { neckForms } from './neck';
import { tailForms, tailFur } from './tail';

function restRotation() {
  const { yaw, pitch, tilt } = HEAD.rest;
  return new Quaternion().setFromEuler(new Euler(-pitch, yaw, tilt, 'YXZ'));
}

let crown: Vector3 | null = null;

/**
 * The point of the sculpted head that is highest once the head is turned into its resting pose, in
 * head space. Edison's palm rests there, so the head pivots there too. Found by tracing the skull in
 * a fan of directions around the resting up direction and keeping the highest hit.
 */
export function headCrown(): Vector3 {
  if (crown) return crown.clone();
  const field = new Field(headForms(), PART_COUNT);
  const up = new Vector3(0, 1, 0).applyQuaternion(restRotation().invert());
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

/** The head bone's resting matrix in dog space: on the crown contact, scaled up and turned. */
export function headBoneMatrix(out = new Matrix4()) {
  return out.compose(new Vector3(...HEAD.top), restRotation(), new Vector3(HEAD.scale, HEAD.scale, HEAD.scale));
}

/** Head space to dog space for the resting pose: the crown lands on the contact point. */
export function headRestMatrix(out = new Matrix4()) {
  return headBoneMatrix(out).multiply(new Matrix4().makeTranslation(headCrown().negate()));
}

/**
 * The whole coat as one sculpture: big forms first, fur details after them so broad blends never
 * soften them, and the mouth carved out last.
 */
export function coatField() {
  const headToDog = headRestMatrix();
  return new Field(
    [
      ...bodyForms(),
      ...neckForms(headToDog),
      ...transformShapes(headForms(), headToDog),
      ...tailForms(),
      ...bodyFur(),
      ...transformShapes(headFur(), headToDog),
      ...tailFur(),
      ...transformShapes(mouthCarves(), headToDog),
    ],
    PART_COUNT,
  );
}
