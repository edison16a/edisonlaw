import { CatmullRomCurve3, Vector3 } from 'three';
import type { Vec3 } from '../../layout';
import { JOINTS, PART, TONE } from '../dimensions';
import type { Shape } from '../sdf/field';
import { cone, flatLock } from './sculpt';

/**
 * The tail in dog space: it leaves the seat low at the back, drops to the floor and lies along it,
 * curling round the dog's left haunch, with its plume of long cream feathering spread flat on the floor
 * along the outside of the curl.
 */

/** Centre line from the root to the tip. The sweep bones sit on these points. */
export const TAIL_PATH: Vec3[] = [
  JOINTS.tail,
  [0.016, 0.068, -0.29],
  [0.068, 0.031, -0.305],
  [0.135, 0.027, -0.278],
  [0.18, 0.025, -0.215],
  [0.2, 0.024, -0.14],
  [0.2, 0.023, -0.062],
];

/** Radius of the tail core at each point of the path. */
const CORE_RADII = [0.034, 0.03, 0.026, 0.023, 0.02, 0.017, 0.013];

const tail = (tone: number, blend: number) => ({ tone, blend, part: PART.tail });

export function tailForms(): Shape[] {
  const shapes: Shape[] = [];
  for (let i = 1; i < TAIL_PATH.length; i++) {
    shapes.push(cone(TAIL_PATH[i - 1], TAIL_PATH[i], CORE_RADII[i - 1], CORE_RADII[i], tail(i === 1 ? TONE.coat : TONE.saddle + 0.1, i === 1 ? 0.045 : 0.018)));
  }
  return shapes;
}

/** Where plume locks grow along the tail (0 root, 1 tip) and how far each one streams. */
const PLUME = [
  { at: 0.22, length: 0.1 },
  { at: 0.34, length: 0.12 },
  { at: 0.46, length: 0.13 },
  { at: 0.58, length: 0.13 },
  { at: 0.7, length: 0.12 },
  { at: 0.82, length: 0.1 },
];

/** How far out of the line of the tail the plume streams toward the tip, in radians. */
const PLUME_SPREAD = 0.42;
/** Middle of the seat on the floor, which the curl bends round. */
const SEAT: Vec3 = [0, 0, -0.12];

/**
 * The plume: long cream locks lying flat on the floor along the outside of the curl like shingles, each
 * streaming on toward the tip past the one before, so together they make one feathered flag.
 */
export function tailFur(): Shape[] {
  const curve = new CatmullRomCurve3(TAIL_PATH.map(([x, y, z]) => new Vector3(x, y, z)));
  const point = new Vector3();
  const along = new Vector3();
  const out = new Vector3();
  const stream = new Vector3();
  const plume = PLUME.flatMap(({ at, length }) => {
    curve.getPointAt(at, point);
    curve.getTangentAt(at, along);
    along.y = 0;
    along.normalize();
    // Square to the tail across the floor, away from the seat.
    out.set(along.z, 0, -along.x);
    if (out.dot(point.clone().sub(new Vector3(...SEAT))) < 0) out.negate();
    stream.copy(along).multiplyScalar(Math.cos(PLUME_SPREAD)).addScaledVector(out, Math.sin(PLUME_SPREAD));
    const root = point.clone().addScaledVector(out, 0.006).setY(0.022);
    // Each lock bends back toward the line of the tail as it goes, so the plume closes into one flag.
    const middle = root.clone().addScaledVector(stream, length * 0.5).addScaledVector(out, -length * 0.06).setY(0.019);
    const tip = root.clone().addScaledVector(stream, length).addScaledVector(out, -length * 0.16).setY(0.016);
    return flatLock({
      path: [root.toArray(), middle.toArray(), tip.toArray()],
      width: 0.028,
      flatness: 0.48,
      facing: [0, 1, 0],
      tones: [TONE.light, TONE.cream],
      blend: 0.014,
      part: PART.tail,
      segments: 5,
    });
  });
  // The tip flicks on past the end of the tail.
  const [tip, beforeTip] = [TAIL_PATH[TAIL_PATH.length - 1], TAIL_PATH[TAIL_PATH.length - 2]];
  const end = flatLock({
    path: [beforeTip, tip, [tip[0] + 0.004, 0.018, tip[2] + 0.055]],
    width: 0.019,
    flatness: 0.6,
    facing: [0, 1, 0],
    tones: [TONE.coat, TONE.light],
    blend: 0.012,
    part: PART.tail,
    segments: 5,
  });
  return [...plume, ...end];
}
