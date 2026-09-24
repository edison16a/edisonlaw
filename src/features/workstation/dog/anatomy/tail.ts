import { CatmullRomCurve3, Vector3 } from 'three';
import type { Vec3 } from '../../layout';
import { JOINTS, PART, TONE } from '../dimensions';
import type { Shape } from '../sdf/field';
import { cone, flatLock } from './sculpt';

/**
 * The tail in dog space, long and carried happily level with the back in a soft upward curve, and its
 * plume: long cream feathering hanging from the underside like a flag.
 */

/** Centre line from the root to the tip. The wag bones sit on these points. */
export const TAIL_PATH: Vec3[] = [JOINTS.tail, [0, 0.508, -0.338], [0, 0.54, -0.405], [0, 0.562, -0.474], [0, 0.566, -0.54]];

/** Radius of the tail core at each point of the path. */
const CORE_RADII = [0.035, 0.029, 0.024, 0.019, 0.014];

const tail = (tone: number, blend: number) => ({ tone, blend, part: PART.tail });

export function tailForms(): Shape[] {
  const shapes: Shape[] = [];
  for (let i = 1; i < TAIL_PATH.length; i++) {
    shapes.push(cone(TAIL_PATH[i - 1], TAIL_PATH[i], CORE_RADII[i - 1], CORE_RADII[i], tail(i === 1 ? TONE.coat : TONE.saddle + 0.1, i === 1 ? 0.045 : 0.018)));
  }
  return shapes;
}

/** Where plume locks grow along the tail (0 root, 1 tip) and how long each one streams back. */
const PLUME = [
  { at: 0.05, length: 0.09 },
  { at: 0.2, length: 0.12 },
  { at: 0.35, length: 0.13 },
  { at: 0.5, length: 0.13 },
  { at: 0.65, length: 0.12 },
  { at: 0.8, length: 0.1 },
];

/** How far below the line of the tail the plume streams, in radians. */
const PLUME_DROP = 0.55;

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
    const at0 = point.clone().addScaledVector(below, 0.006);
    const at1 = at0.clone().addScaledVector(stream, length * 0.5).addScaledVector(below, length * 0.05);
    const at2 = at0.clone().addScaledVector(stream, length).addScaledVector(below, length * 0.12);
    // A long middle lock, and a shorter one lying on each side of it, so the plume has body.
    const middle = flatLock({
      path: [at0.toArray(), at1.toArray(), at2.toArray()],
      width: 0.026,
      flatness: 0.55,
      facing: [1, 0, 0],
      tones: [TONE.light, TONE.cream],
      blend: 0.016,
      part: PART.tail,
      segments: 6,
    });
    const sides = ([1, -1] as const).flatMap((side) => {
      const shift = new Vector3(side * 0.012, 0, 0);
      return flatLock({
        path: [at0.clone().add(shift).toArray(), at1.clone().add(shift).lerp(at0, 0.2).toArray(), at2.clone().add(shift).lerp(at0, 0.25).toArray()],
        width: 0.02,
        flatness: 0.55,
        facing: [side, -0.3, 0],
        tones: [TONE.light - 0.1, TONE.cream - 0.08],
        blend: 0.014,
        part: PART.tail,
        segments: 5,
      });
    });
    return [...middle, ...sides];
  });
  // The tip flicks on past the end of the tail.
  const [tip, beforeTip] = [TAIL_PATH[TAIL_PATH.length - 1], TAIL_PATH[TAIL_PATH.length - 2]];
  const end = flatLock({
    path: [beforeTip, tip, [tip[0], tip[1] - 0.006, tip[2] - 0.06]],
    width: 0.02,
    flatness: 0.6,
    facing: [1, 0, 0],
    tones: [TONE.coat, TONE.light],
    blend: 0.012,
    part: PART.tail,
    segments: 5,
  });
  return [...plume, ...end];
}
