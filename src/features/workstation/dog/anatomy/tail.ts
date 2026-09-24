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
const CORE_RADII = [0.034, 0.029, 0.023, 0.016];

const tail = (tone: number, blend: number) => ({ tone, blend, part: PART.tail });

export function tailForms(): Shape[] {
  const shapes: Shape[] = [];
  for (let i = 1; i < TAIL_PATH.length; i++) {
    shapes.push(cone(TAIL_PATH[i - 1], TAIL_PATH[i], CORE_RADII[i - 1], CORE_RADII[i], tail(TONE.coat, i === 1 ? 0.045 : 0.02)));
  }
  return shapes;
}

/** Plume locks: where along the tail they grow (0 root, 1 tip), how far they hang, and how far back they run. */
const PLUME = [
  { at: 0.08, drop: 0.05, run: 0.075, width: 0.026 },
  { at: 0.34, drop: 0.058, run: 0.09, width: 0.029 },
  { at: 0.62, drop: 0.05, run: 0.085, width: 0.026 },
];

/** The flag: long cream locks hanging from the underside and streaming back past the tip. */
export function tailFur(): Shape[] {
  const curve = new CatmullRomCurve3(TAIL_PATH.map(([x, y, z]) => new Vector3(x, y, z)));
  const point = new Vector3();
  const plume = PLUME.flatMap(({ at, drop, run, width }) => {
    curve.getPointAt(at, point);
    const root: Vec3 = [point.x, point.y - 0.012, point.z];
    return flatLock({
      path: [root, [root[0], root[1] - drop * 0.6, root[2] - run * 0.4], [root[0], root[1] - drop, root[2] - run]],
      width,
      flatness: 0.55,
      facing: [1, 0, 0],
      tones: [TONE.light, TONE.cream],
      blend: 0.018,
      part: PART.tail,
      segments: 6,
    });
  });
  // The tip flicks on past the end of the tail.
  const [tip, beforeTip] = [TAIL_PATH[TAIL_PATH.length - 1], TAIL_PATH[TAIL_PATH.length - 2]];
  const end = flatLock({
    path: [beforeTip, tip, [tip[0], tip[1] + 0.002, tip[2] - 0.055]],
    width: 0.021,
    flatness: 0.6,
    facing: [1, 0, 0],
    tones: [TONE.coat, TONE.light],
    blend: 0.012,
    part: PART.tail,
    segments: 5,
  });
  return [...plume, ...end];
}
