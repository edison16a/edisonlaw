import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { FACE, headForms } from '../anatomy/head';
import { HEAD, PART_COUNT } from '../dimensions';
import { Field } from '../sdf/field';
import { surfaceFrame } from '../sdf/trace';
import { HEAD_REST } from './dimensions';

/**
 * Where the sleeping dog's head rests: head space is sculpted around the skull, and these matrices turn,
 * scale and seat it so the head lies on the floor at the front of the curl, its lowest point just on
 * the rug. The head turns about its atlas, where the skull meets the neck.
 */

/** The resting turn of the head, from HEAD_REST. */
function restRotation(out = new Quaternion()) {
  const { yaw, pitch, tilt } = HEAD_REST.rest;
  return out.setFromEuler(new Euler(-pitch, yaw, tilt, 'YXZ'));
}

let drop: number | null = null;

/**
 * How far below the atlas the head reaches in its resting turn, in dog space: the skull traced from
 * inside in a fan of directions round straight down, keeping the lowest hit.
 */
function headDrop() {
  if (drop !== null) return drop;
  const field = new Field(headForms(), PART_COUNT);
  const down = new Vector3(0, -1, 0).applyQuaternion(restRotation().invert());
  const across = new Vector3(1, 0, 0).addScaledVector(down, -down.x).normalize();
  const along = new Vector3().crossVectors(down, across);
  const atlas = new Vector3(...HEAD_REST.atlas);
  const direction = new Vector3();
  let lowest = -Infinity;
  for (let ring = 0; ring <= 60; ring += 2) {
    const tilt = (ring * Math.PI) / 180;
    for (let step = 0; step < (ring === 0 ? 1 : 36); step++) {
      const turn = (step * Math.PI) / 18;
      direction
        .copy(down)
        .multiplyScalar(Math.cos(tilt))
        .addScaledVector(across, Math.sin(tilt) * Math.cos(turn))
        .addScaledVector(along, Math.sin(tilt) * Math.sin(turn));
      const { position } = surfaceFrame(field, FACE.core, direction.toArray());
      lowest = Math.max(lowest, position.sub(atlas).dot(down));
    }
  }
  drop = lowest * HEAD.scale;
  return drop;
}

/** The atlas in dog space, at rest. */
function restingAtlas() {
  const [x, z] = HEAD_REST.at;
  return new Vector3(x, HEAD_REST.chin + headDrop(), z);
}

/** The head bone's resting matrix in dog space: on the atlas, scaled up and turned. */
export function headBoneMatrix(out = new Matrix4()) {
  return out.compose(restingAtlas(), restRotation(), new Vector3(HEAD.scale, HEAD.scale, HEAD.scale));
}

/** Head space to dog space for the resting pose. */
export function headRestMatrix(out = new Matrix4()) {
  const [x, y, z] = HEAD_REST.atlas;
  return headBoneMatrix(out).multiply(new Matrix4().makeTranslation(-x, -y, -z));
}
