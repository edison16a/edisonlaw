import { Vector3, type Matrix4 } from 'three';
import { PART, TONE } from '../dimensions';
import type { Shape } from '../sdf/field';
import { FACE } from './head';
import { cone, flatLock } from './sculpt';

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

/** Angles round the neck, from its front toward the dog's left, where the mane locks grow. */
const MANE = [-80, -45, -15, 15, 45, 80];

/**
 * A soft mane round the base of the neck: broad locks draping from the neck over the shoulders and
 * the top of the bib, so the head sits in a collar of fur.
 */
export function neckFur(): Shape[] {
  const [, y, z] = BASE;
  return MANE.flatMap((degrees) => {
    const angle = (degrees * Math.PI) / 180;
    const [sin, cos] = [Math.sin(angle), Math.cos(angle)];
    const front = Math.max(0, cos) ** 2;
    return flatLock({
      path: [
        [sin * 0.078, y + 0.05, z + cos * 0.078],
        [sin * 0.094, y + 0.005, z + cos * 0.094 + 0.006],
        [sin * 0.1, y - 0.035, z + cos * 0.098 + 0.01],
      ],
      width: 0.03,
      flatness: 0.4,
      facing: [sin, 0.35, cos],
      tones: [TONE.coat + 0.2 * front, TONE.light + 0.25 * front],
      blend: 0.016,
      part: PART.neck,
      segments: 5,
    });
  });
}
