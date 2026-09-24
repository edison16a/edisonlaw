import { CatmullRomCurve3, Vector3 } from 'three';
import type { Vec3 } from '../../layout';
import { JOINTS, PART, TONE } from '../dimensions';
import type { Shape } from '../sdf/field';
import { cone, flatLock } from './sculpt';

/**
 * The tail in dog space, carried happily just above the back with a soft upward curve,
 * and its plume: long cream feathering hanging from the underside like a flag.
 */

/** Centre line from the root to the tip. The wag bones sit on these points. */
export const TAIL_PATH: Vec3[] = [JOINTS.tail, [0, 0.395, -0.262], [0, 0.43, -0.318], [0, 0.448, -0.37]];

/** Radius of the tail core at each point of the path. */
const CORE_RADII = [0.037, 0.031, 0.025, 0.018];

const tail = (tone: number, blend: number) => ({ tone, blend, part: PART.tail });

export function tailForms(): Shape[] {
  const shapes: Shape[] = [];
  for (let i = 1; i < TAIL_PATH.length; i++) {
    shapes.push(cone(TAIL_PATH[i - 1], TAIL_PATH[i], CORE_RADII[i - 1], CORE_RADII[i], tail(TONE.coat, i === 1 ? 0.045 : 0.02)));
  }
  return shapes;
}

/** Where plume locks grow along the tail (0 root, 1 tip) and how long each one streams back. */
const PLUME = [
  { at: 0.04, length: 0.1 },
  { at: 0.24, length: 0.11 },
  { at: 0.44, length: 0.105 },
  { at: 0.64, length: 0.095 },
  { at: 0.84, length: 0.08 },
];

/** How far below the line of the tail the plume streams, in radians. */
const PLUME_DROP = 0.5;

/**
 * The flag: long cream locks laid along the underside like shingles, each starting further out and
 * streaming back past the one before, so together they make one feathered plume.
 */
export function tailFur(): Shape[] {
  const curve = new CatmullRomCurve3(TAIL_PATH.map(([x, y, z]) => new Vector3(x, y, z)));
  const point = new Vector3();
  const along = new Vector3();
  const below = new Vector3();
  const stream = new Vector3();
  const plume = PLUME.flatMap(({ at, length }) => {
    curve.getPointAt(at, point);
    curve.getTangentAt(at, along);
    // Square to the tail in its upright plane, on the underside.
    below.set(0, -along.z, along.y);
    if (below.y > 0) below.negate();
    stream.copy(along).multiplyScalar(Math.cos(PLUME_DROP)).addScaledVector(below, Math.sin(PLUME_DROP));
    const at0 = point.clone().addScaledVector(below, 0.01);
    const at1 = at0.clone().addScaledVector(stream, length * 0.5).addScaledVector(below, length * 0.06);
    const at2 = at0.clone().addScaledVector(stream, length).addScaledVector(below, length * 0.18);
    return flatLock({
      path: [at0.toArray(), at1.toArray(), at2.toArray()],
      width: 0.027,
      flatness: 0.5,
      facing: [1, 0, 0],
      tones: [TONE.light, TONE.cream],
      blend: 0.016,
      part: PART.tail,
      segments: 6,
    });
  });
  // The tip flicks on past the end of the tail.
  const [tip, beforeTip] = [TAIL_PATH[TAIL_PATH.length - 1], TAIL_PATH[TAIL_PATH.length - 2]];
  const end = flatLock({
    path: [beforeTip, tip, [tip[0], tip[1] + 0.002, tip[2] - 0.055]],
    width: 0.022,
    flatness: 0.6,
    facing: [1, 0, 0],
    tones: [TONE.coat, TONE.light],
    blend: 0.012,
    part: PART.tail,
    segments: 5,
  });
  return [...plume, ...end];
}
