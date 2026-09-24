import { Vector3, type Matrix4 } from 'three';
import { PART, TONE } from '../dimensions';
import type { Shape } from '../sdf/field';
import { FACE } from './head';
import { cone } from './sculpt';

const neck = (tone: number, blend: number) => ({ tone, blend, part: PART.neck });

/** Where the neck leaves the withers, in dog space. */
const BASE = [0, 0.33, 0.075] as const;
/** Where the throat meets the underside of the head, in head space. */
const THROAT = [0, -0.165, 0.025] as const;

/**
 * A short, thick neck from the withers and the chest up into the head wherever the head rests,
 * so the join is sculpted for the resting pose. `headToDog` places head space in dog space.
 */
export function neckForms(headToDog: Matrix4): Shape[] {
  const nape = new Vector3(...FACE.nape).applyMatrix4(headToDog).toArray();
  const throat = new Vector3(...THROAT).applyMatrix4(headToDog).toArray();
  return [cone(BASE, nape, 0.086, 0.07, neck(TONE.coat, 0.05)), cone([0, 0.28, 0.13], throat, 0.066, 0.05, neck(TONE.light, 0.045))];
}

/** The line the neck skin hands over along, from the withers to the back of the head. */
export function neckAxis(headToDog: Matrix4) {
  const base = new Vector3(...BASE);
  const toNape = new Vector3(...FACE.nape).applyMatrix4(headToDog).sub(base);
  const length = toNape.length();
  return { base, direction: toNape.divideScalar(length), length };
}
