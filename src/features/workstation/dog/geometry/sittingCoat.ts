import { Vector3 } from 'three';
import { smoothstep } from '@/lib/math';
import { coatField } from '../anatomy/coat';
import { headRestMatrix } from '../anatomy/headPose';
import { neckAxis } from '../anatomy/neck';
import { TAIL_PATH } from '../anatomy/tail';
import { BODY_RISE, JOINTS, PART, RIBS } from '../dimensions';
import { BONE, TAIL_BONES } from '../rig/createDogRig';
import type { Field } from '../sdf/field';
import { buildCoat, chainInfluences, COAT_CELL, pathParam, strongest, type Influence } from './coatGeometry';

/** Heights over which the seat, haunches and forelegs hand over from the planted root to the body, which leans. */
const PLANTED = { from: 0.08, to: 0.3 } as const;

/** The rib cage's own up and forward, sloping up with the sitting body. */
const RIB_UP = new Vector3(0, Math.cos(BODY_RISE), -Math.sin(BODY_RISE));
const RIB_FORWARD = new Vector3(0, Math.sin(BODY_RISE), Math.cos(BODY_RISE));
const CHEST = new Vector3(...JOINTS.chest);

/**
 * Bone weights from the part shares the field blended at this point. The seat, the haunches and the paws
 * stay planted on the root while the upper body leans, the rib cage breathes, the neck hands over from
 * the chest to the head along its length, and the tail passes smoothly from joint to joint.
 */
function influences(point: Vector3, parts: Float32Array, neck: { base: Vector3; direction: Vector3; length: number }) {
  const planted = 1 - smoothstep(PLANTED.from, PLANTED.to, point.y);
  const offset = point.clone().sub(CHEST);
  const dx = offset.x / RIBS[0];
  const dy = offset.dot(RIB_UP) / RIBS[1];
  const dz = offset.dot(RIB_FORWARD) / RIBS[2];
  const ribs = Math.exp(-(dx * dx + dy * dy + dz * dz) * 1.2) * (1 - planted);

  const along = point.clone().sub(neck.base).dot(neck.direction) / neck.length;
  const toHead = smoothstep(0.15, 0.95, along);

  const body = parts[PART.body] + parts[PART.neck] * (1 - toHead);
  const list: Influence[] = [
    { bone: BONE.root, weight: body * planted },
    { bone: BONE.chest, weight: body * ribs },
    { bone: BONE.body, weight: body * (1 - planted - ribs) },
    { bone: BONE.head, weight: parts[PART.head] + parts[PART.neck] * toHead },
  ];
  const tail = parts[PART.tail];
  if (tail > 1e-4) list.push(...chainInfluences(tail, pathParam(point, TAIL_PATH), BONE.tail, TAIL_BONES));
  return strongest(list);
}

/** Meshes the sitting dog's coat and paints it: colours, eye lid pigment, and skin weights. */
export function buildCoatData(cell = COAT_CELL, field: Field = coatField()) {
  const headToDog = headRestMatrix();
  const neck = neckAxis(headToDog);
  return buildCoat({ field, headToDog, weigh: (point, parts) => influences(point, parts, neck) }, cell);
}
