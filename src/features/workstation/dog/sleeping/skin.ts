import { Vector3 } from 'three';
import { smoothstep } from '@/lib/math';
import { headForms, headFur } from '../anatomy/head';
import { neckAxis } from '../anatomy/neck';
import { PART, PART_COUNT } from '../dimensions';
import { buildCoat, chainInfluences, COAT_CELL, pathParam, strongest, type Influence } from '../geometry/coatGeometry';
import { Field, transformShapes } from '../sdf/field';
import { SLEEPING_NECK, sleepingCoatField } from './coat';
import { curlFrame, JOINTS, RIBS, RIBS_ANGLE } from './dimensions';
import { headRestMatrix } from './headPose';
import { SLEEP_BONE, SLEEP_TAIL_BONES } from './rig';
import { TAIL_PATH } from './tail';

const CHEST = new Vector3(...JOINTS.chest);
/**
 * A lighter, narrower dark rim round the eyes than the sitting dog's: shut, each eye is a golden lid with
 * a dark lash line (see parts/Lids), and a wide dark rim round it would read as an open eye.
 */
const LIDS = { inner: 1.02, outer: 1.28, strength: 0.18 };
const { left: RIB_LEFT, dorsal: RIB_DORSAL, forward: RIB_FORWARD } = curlFrame(RIBS_ANGLE);

/**
 * How far from the skull a point may be and still follow the head. The skull's soft blend reaches out to
 * the haunch and the chest it lies beside, and those must stay put when the head lifts.
 */
const HEAD_REACH = { full: 0.004, none: 0.02 } as const;
/**
 * How far out from the line of the neck the neck still hands over to the head: past its ruff and throat,
 * a sliver of neck blended into the body stays with the body.
 */
const NECK_REACH = { full: 0.1, none: 0.13 } as const;

interface SkinFrame {
  neck: { base: Vector3; direction: Vector3; length: number };
  /** The head alone, in dog space. */
  head: Field;
}

/**
 * Bone weights from the part shares the field blended at this point. The body lies still on the root but
 * for the rib cage, which breathes; the neck hands over from the body to the head along its length, so
 * the head can lift off the floor; the head's own share fades out a little way from the skull; and the
 * tail passes smoothly from joint to joint.
 */
function influences(point: Vector3, parts: Float32Array, { neck, head }: SkinFrame) {
  const offset = point.clone().sub(CHEST);
  const dx = offset.dot(RIB_LEFT) / RIBS[0];
  const dy = offset.dot(RIB_DORSAL) / RIBS[1];
  const dz = offset.dot(RIB_FORWARD) / RIBS[2];
  const ribs = Math.exp(-(dx * dx + dy * dy + dz * dz) * 1.2);

  const fromNeck = point.clone().sub(neck.base);
  const along = fromNeck.dot(neck.direction);
  const radial = fromNeck.addScaledVector(neck.direction, -along).length();
  const toHead = smoothstep(0.1, 0.9, along / neck.length) * (1 - smoothstep(NECK_REACH.full, NECK_REACH.none, radial));

  const reach = 1 - smoothstep(HEAD_REACH.full, HEAD_REACH.none, head.distance(point.x, point.y, point.z));
  const onHead = parts[PART.head] * reach + parts[PART.neck] * toHead;
  const body = parts[PART.body] + parts[PART.neck] * (1 - toHead) + parts[PART.head] * (1 - reach);
  const list: Influence[] = [
    { bone: SLEEP_BONE.root, weight: body * (1 - ribs) },
    { bone: SLEEP_BONE.chest, weight: body * ribs },
    { bone: SLEEP_BONE.head, weight: onHead },
  ];
  const tail = parts[PART.tail];
  if (tail > 1e-4) list.push(...chainInfluences(tail, pathParam(point, TAIL_PATH), SLEEP_BONE.tail, SLEEP_TAIL_BONES));
  return strongest(list);
}

/** Meshes the sleeping dog's coat and paints it: colours, eye lid pigment, and skin weights. */
export function buildSleepingCoat(cell = COAT_CELL) {
  const headToDog = headRestMatrix();
  const frame: SkinFrame = {
    neck: neckAxis(headToDog, SLEEPING_NECK),
    head: new Field([...transformShapes(headForms(), headToDog), ...transformShapes(headFur(), headToDog)], PART_COUNT),
  };
  return buildCoat({ field: sleepingCoatField(), headToDog, weigh: (point, parts) => influences(point, parts, frame), lids: LIDS }, cell);
}
