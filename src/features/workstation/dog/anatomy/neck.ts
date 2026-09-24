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

/** Radius of the neck at the withers, halfway up the crest, and where it meets the head. */
const RADII = { base: 0.08, crest: 0.062, head: 0.046 } as const;

/**
 * A strong, arched neck from the withers and the chest up into the head wherever the head rests, so the
 * join is sculpted for the resting pose. It meets the head low and behind, between the ears, so the ears
 * hang clear of it. `headToDog` places head space in dog space.
 */
export function neckForms(headToDog: Matrix4): Shape[] {
  const nape = new Vector3(...FACE.nape).applyMatrix4(headToDog);
  const throat = new Vector3(...FACE.throat).applyMatrix4(headToDog);
  // The crest of the neck arches a little above the straight line from the withers to the nape.
  const crest = new Vector3(...BASE).lerp(nape, 0.5).add(new Vector3(0, 0.012, -0.006));
  return [
    cone(BASE, crest.toArray(), RADII.base, RADII.crest, neck(TONE.coat, 0.05)),
    cone(crest.toArray(), nape.toArray(), RADII.crest, RADII.head, neck(TONE.coat, 0.04)),
    cone(THROAT_BASE, throat.toArray(), 0.07, RADII.head, neck(TONE.light, 0.045)),
    // Fills the fork between the crest and the throat, so the neck is one full column.
    ellipsoid(new Vector3(...BASE).lerp(throat, 0.35).toArray(), [0.058, 0.058, 0.058], neck(TONE.coat + 0.1, 0.04)),
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

/** A ring round the neck: its centre, and unit directions down the neck, to its left and to its front. */
interface Ring {
  center: Vector3;
  down: Vector3;
  side: Vector3;
  front: Vector3;
}

/** The ring round the neck `along` of the way from the withers to the back of the head. */
function ringAt(headToDog: Matrix4, along: number): Ring {
  const base = new Vector3(...BASE);
  const nape = new Vector3(...FACE.nape).applyMatrix4(headToDog);
  const up = nape.clone().sub(base).normalize();
  const side = new Vector3(1, 0, 0).addScaledVector(up, -up.x).normalize();
  return { center: base.lerp(nape, along), down: up.clone().negate(), side, front: new Vector3().crossVectors(side, up) };
}

interface RingLock {
  /** Angle round the neck from its front toward its left, in degrees. */
  angle: number;
  /** How far out from the middle of the neck the lock grows. */
  radius: number;
  /** How far the lock reaches up the neck from the ring, and down it. */
  up: number;
  down: number;
  width: number;
}

/** One lock of a ring round the neck, lying down the neck and bellying out a little as it falls. */
function ringLock({ center, down, side, front }: Ring, { angle, radius, up, down: fall, width }: RingLock): Shape[] {
  const radians = (angle * Math.PI) / 180;
  const out = front.clone().multiplyScalar(Math.cos(radians)).addScaledVector(side, Math.sin(radians));
  const frontness = Math.max(0, Math.cos(radians)) ** 2;
  const at = (grow: number, along: number): Vec3 => center.clone().addScaledVector(out, radius + grow).addScaledVector(down, along).toArray();
  return flatLock({
    path: [at(0, -up), at(0.012, (fall - up) / 2), at(0.018, fall)],
    width,
    flatness: 0.4,
    facing: out.clone().addScaledVector(down, -0.3).toArray(),
    tones: [TONE.coat + 0.25 * frontness, TONE.light + 0.3 * frontness],
    blend: 0.018,
    part: PART.neck,
    segments: 5,
  });
}

/**
 * The ruff: a collar of broad locks round the base of the neck, draping over the shoulders and into the
 * frill on the chest, and shorter locks higher up lapping over it, so the head sits in a full mane that
 * is lighter toward the throat. Each ring follows the neck's own line. `headToDog` places head space in
 * dog space.
 */
export function neckFur(headToDog: Matrix4): Shape[] {
  const collar = ringAt(headToDog, 0.1);
  const mane = ringAt(headToDog, 0.42);
  return [
    ...COLLAR.map((angle) => ringLock(collar, { angle, radius: RADII.base - 0.004, up: 0.06, down: 0.07, width: 0.034 })).flat(),
    ...MANE.map((angle) => ringLock(mane, { angle, radius: RADII.crest - 0.004, up: 0.035, down: 0.05, width: 0.028 })).flat(),
  ];
}
