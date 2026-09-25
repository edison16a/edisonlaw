import { CatmullRomCurve3, Vector3 } from 'three';
import type { Vec3 } from '../../layout';
import { flatLock } from '../anatomy/sculpt';
import type { TailSpec } from '../anatomy/tail';
import { PART, TONE } from '../dimensions';
import type { Shape } from '../sdf/field';
import { JOINTS } from './dimensions';

/**
 * The sleeping dog's tail: it leaves the rump low at the front right of the curl, drops to the floor and
 * wraps round the front past the hind paws, a full plume of feathering along the outside of the wrap, and
 * its tip comes to rest beside the muzzle.
 */
export const TAIL_PATH: Vec3[] = [
  JOINTS.tail,
  [0.15, 0.056, 0.175],
  [0.152, 0.037, 0.258],
  [0.102, 0.033, 0.337],
  [0.02, 0.03, 0.386],
  [-0.07, 0.026, 0.39],
  [-0.15, 0.022, 0.355],
];

/**
 * Radius of the core at each point of the path: fuller than the sitting dog's, since lying out along the
 * floor in front of the curl its whole length shows, and a golden's tail is thick with fur to the tip.
 */
const RADII = [0.04, 0.037, 0.034, 0.03, 0.026, 0.022, 0.018];

const [beforeTip, tip] = TAIL_PATH.slice(-2).map((point) => new Vector3(...point));

export const SLEEPING_TAIL: TailSpec = {
  path: TAIL_PATH,
  radii: RADII,
  center: [0, 0, 0],
  flick: tip.clone().addScaledVector(tip.clone().sub(beforeTip).normalize(), 0.04).setY(0.02).toArray(),
  // Seen from above, lying in front of the face, a deep core would read as a stripe down the plume, and
  // a golden's tail is lighter than its back all along.
  coreTone: TONE.coat + 0.14,
};

/** Where the plume's locks grow along the tail (0 root, 1 tip), how far each streams, and how wide it is. */
const PLUME = [
  { at: 0.18, length: 0.058, width: 0.022 },
  { at: 0.25, length: 0.066, width: 0.024 },
  { at: 0.32, length: 0.072, width: 0.025 },
  { at: 0.39, length: 0.076, width: 0.026 },
  { at: 0.46, length: 0.078, width: 0.026 },
  { at: 0.53, length: 0.078, width: 0.026 },
  { at: 0.6, length: 0.075, width: 0.025 },
  { at: 0.67, length: 0.07, width: 0.024 },
  { at: 0.74, length: 0.064, width: 0.023 },
  { at: 0.81, length: 0.056, width: 0.021 },
  { at: 0.88, length: 0.048, width: 0.019 },
];

/** How far out of the line of the tail each lock streams toward the tip, in radians. */
const SPREAD = 0.5;
const UP = new Vector3(0, 1, 0);

/** Radius of the core at `at` along the tail, 0 root to 1 tip. */
function radiusAt(at: number) {
  const x = at * (RADII.length - 1);
  const i = Math.min(RADII.length - 2, Math.floor(x));
  return RADII[i] + (RADII[i + 1] - RADII[i]) * (x - i);
}

/**
 * The plume: soft, rounded locks of cream feathering grown from the upper outside of the tail, each
 * streaming out and on toward the tip and drooping to the floor, so together they make one full, fluffy
 * fringe that stands off the rug along the outside of the wrap. A rounded tuft finishes the tip.
 */
export function sleepingTailFur(): Shape[] {
  const curve = new CatmullRomCurve3(TAIL_PATH.map((point) => new Vector3(...point)));
  const center = new Vector3(...SLEEPING_TAIL.center);
  const point = new Vector3();
  const along = new Vector3();
  const plume = PLUME.flatMap(({ at, length, width }) => {
    const radius = radiusAt(at);
    curve.getPointAt(at, point);
    curve.getTangentAt(at, along);
    along.setY(0).normalize();
    // Square to the tail across the floor, away from the middle of the curl.
    const out = new Vector3(along.z, 0, -along.x);
    if (out.dot(point.clone().sub(center)) < 0) out.negate();
    const stream = along.clone().multiplyScalar(Math.cos(SPREAD)).addScaledVector(out, Math.sin(SPREAD));
    const root = point.clone().addScaledVector(out, radius * 0.55).addScaledVector(UP, radius * 0.35);
    const middle = root.clone().addScaledVector(stream, length * 0.5).setY(point.y + radius * 0.1);
    const end = root.clone().addScaledVector(stream, length).addScaledVector(out, -length * 0.1).setY(0.014);
    return flatLock({
      path: [root.toArray(), middle.toArray(), end.toArray()],
      width,
      flatness: 0.55,
      facing: out.clone().multiplyScalar(0.5).add(UP).toArray(),
      tones: [TONE.light - 0.04, TONE.cream],
      blend: 0.02,
      part: PART.tail,
      segments: 5,
    });
  });
  const tuft = flatLock({
    path: [beforeTip.toArray(), tip.toArray(), SLEEPING_TAIL.flick],
    width: 0.025,
    flatness: 0.78,
    facing: [0, 1, 0],
    tones: [TONE.light, TONE.cream],
    blend: 0.014,
    part: PART.tail,
    segments: 5,
  });
  return [...plume, ...tuft];
}
