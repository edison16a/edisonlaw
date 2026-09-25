import { Vector3 } from 'three';
import type { Vec3 } from '../../layout';
import type { TailSpec } from '../anatomy/tail';
import { TONE } from '../dimensions';
import { JOINTS } from './dimensions';

/**
 * The sleeping dog's tail: it leaves the rump low at the front right of the curl, drops to the floor and
 * wraps round the front past the hind paws, its plume streaming out along the outside of the wrap and its
 * tip coming to rest beside the muzzle.
 */
export const TAIL_PATH: Vec3[] = [
  JOINTS.tail,
  [0.15, 0.05, 0.175],
  [0.15, 0.028, 0.258],
  [0.1, 0.026, 0.337],
  [0.02, 0.025, 0.386],
  [-0.07, 0.024, 0.39],
  [-0.15, 0.023, 0.355],
];

const [beforeTip, tip] = TAIL_PATH.slice(-2).map((point) => new Vector3(...point));

export const SLEEPING_TAIL: TailSpec = {
  path: TAIL_PATH,
  radii: [0.034, 0.03, 0.026, 0.023, 0.02, 0.017, 0.013],
  center: [0, 0, 0],
  flick: tip.clone().addScaledVector(tip.clone().sub(beforeTip).normalize(), 0.055).setY(0.018).toArray(),
  // Seen from above, lying in front of the face, a deep core would read as a stripe down the plume.
  coreTone: TONE.coat + 0.08,
};
