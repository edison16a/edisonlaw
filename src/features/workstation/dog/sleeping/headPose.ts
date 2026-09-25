import { Matrix4, Vector3 } from 'three';
import { FACE, headForms } from '../anatomy/head';
import { headTurn } from '../anatomy/headPose';
import { HEAD, PART_COUNT } from '../dimensions';
import { Field } from '../sdf/field';
import { furthestAlong } from '../sdf/trace';
import { HEAD_REST } from './dimensions';

/**
 * Where the sleeping dog's head rests: head space is sculpted around the skull, and these matrices turn,
 * scale and seat it so the head lies on the floor at the front of the curl, its lowest point just on
 * the rug. The head turns about its atlas, where the skull meets the neck.
 */

/** The resting turn of the head, from HEAD_REST. */
const restRotation = () => headTurn(HEAD_REST.rest);

let drop: number | null = null;

/**
 * How far below the atlas the head reaches in its resting turn, in dog space: the skull traced from
 * inside in a fan of directions round straight down, keeping the lowest hit.
 */
function headDrop() {
  if (drop !== null) return drop;
  const down = new Vector3(0, -1, 0).applyQuaternion(restRotation().invert());
  const lowest = furthestAlong(new Field(headForms(), PART_COUNT), FACE.core, down, 60, 2);
  drop = lowest.sub(new Vector3(...HEAD_REST.atlas)).dot(down) * HEAD.scale;
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
