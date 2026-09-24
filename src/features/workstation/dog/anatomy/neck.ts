import { Vector3, type Matrix4 } from 'three';
import type { Vec3 } from '../../layout';
import { PART, TONE } from '../dimensions';
import type { Shape } from '../sdf/field';
import { FACE } from './head';
import { cone, ellipsoid, flatLock } from './sculpt';

const neck = (tone: number, blend: number) => ({ tone, blend, part: PART.neck });

/** Where the neck leaves the withers, in dog space. */
const BASE: Vec3 = [0, 0.452, 0.17];
/** Where the throat leaves the forechest, in dog space. */
const THROAT_BASE: Vec3 = [0, 0.392, 0.246];

/**
 * A strong, arched neck from the withers and the chest up into the head wherever the head rests,
 * so the join is sculpted for the resting pose. `headToDog` places head space in dog space.
 */
export function neckForms(headToDog: Matrix4): Shape[] {
  const nape = new Vector3(...FACE.nape).applyMatrix4(headToDog);
  const throat = new Vector3(...FACE.throat).applyMatrix4(headToDog);
  // The crest of the neck arches a little above the straight line from the withers to the nape.
  const crest = new Vector3(...BASE).lerp(nape, 0.5).add(new Vector3(0, 0.012, -0.006));
  return [
    cone(BASE, crest.toArray(), 0.08, 0.07, neck(TONE.coat, 0.05)),
    cone(crest.toArray(), nape.toArray(), 0.07, 0.058, neck(TONE.coat, 0.04)),
    cone(THROAT_BASE, throat.toArray(), 0.07, 0.05, neck(TONE.light, 0.045)),
    // Fills the fork between the crest and the throat, so the neck is one full column.
    ellipsoid(new Vector3(...BASE).lerp(throat, 0.45).toArray(), [0.066, 0.07, 0.07], neck(TONE.coat + 0.1, 0.04)),
  ];
}

/** The line the neck skin hands over along, from the withers to the back of the head. */
export function neckAxis(headToDog: Matrix4) {
  const base = new Vector3(...BASE);
  const toNape = new Vector3(...FACE.nape).applyMatrix4(headToDog).sub(base);
  const length = toNape.length();
  return { base, direction: toNape.divideScalar(length), length };
}

/**
 * Angles round the neck, from its front toward the dog's left, where the collar locks grow. The front
 * is left to the frill on the chest, so the two never stack into scales.
 */
const COLLAR = [-125, -95, -65, 65, 95, 125];
/** The same for the shorter locks higher up the neck, which lap over the collar like shingles. */
const MANE = [-110, -75, 75, 110];

interface RingLock {
  /** Angle round the neck from its front, in radians. */
  angle: number;
  radius: number;
  /** Top and bottom of the lock, as heights. */
  top: number;
  bottom: number;
  width: number;
}

/** One lock of a ring round the neck, falling from `top` to `bottom` and bellying out as it falls. */
function ringLock(center: { y: number; z: number }, { angle, radius, top, bottom, width }: RingLock): Shape[] {
  const [sin, cos] = [Math.sin(angle), Math.cos(angle)];
  const front = Math.max(0, cos) ** 2;
  const at = (grow: number, y: number, lean: number): Vec3 => [sin * (radius + grow), y, center.z + cos * (radius + grow) + lean];
  return flatLock({
    path: [at(0, top, 0), at(0.014, (top + bottom) / 2, 0.012), at(0.02, bottom, 0.008)],
    width,
    flatness: 0.4,
    facing: [sin, 0.3, cos],
    tones: [TONE.coat + 0.25 * front, TONE.light + 0.3 * front],
    blend: 0.018,
    part: PART.neck,
    segments: 5,
  });
}

/**
 * The ruff: a collar of broad locks round the base of the neck, draping over the shoulders and into the
 * frill on the chest, and shorter locks higher up lapping over it, so the head sits in a full mane that
 * is lighter toward the throat. `headToDog` places head space in dog space.
 */
export function neckFur(headToDog: Matrix4): Shape[] {
  const [, y, z] = BASE;
  const collar = { y: y - 0.02, z: z + 0.035 };
  // Higher up, a third of the way from the withers toward the back of the head.
  const up = new Vector3(...BASE).lerp(new Vector3(...FACE.nape).applyMatrix4(headToDog), 0.35);
  const mane = { y: up.y, z: up.z + 0.03 };
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  return [
    ...COLLAR.flatMap((degrees) => {
      const front = Math.max(0, Math.cos(radians(degrees))) ** 2;
      return ringLock(collar, { angle: radians(degrees), radius: 0.084 + 0.012 * front, top: collar.y + 0.06, bottom: collar.y - 0.07, width: 0.034 });
    }),
    ...MANE.flatMap((degrees) => ringLock(mane, { angle: radians(degrees), radius: 0.068, top: mane.y + 0.04, bottom: mane.y - 0.05, width: 0.03 })),
  ];
}
