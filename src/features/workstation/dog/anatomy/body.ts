import type { Vec3 } from '../../layout';
import { JOINTS, PART, TONE } from '../dimensions';
import type { Shape } from '../sdf/field';
import { ball, bothSides, cone, ellipsoid, flatLock, sided } from './sculpt';

/**
 * The torso and legs in dog space: a deep rounded chest, a level back, a soft tuck at the loin and a
 * round rump, on short sturdy legs with big round paws. Chibi proportions: compact and plump.
 */

const body = (tone: number, blend: number) => ({ tone, blend, part: PART.body });

function torso(): Shape[] {
  const [, chestY, chestZ] = JOINTS.chest;
  return [
    // Rib cage, deepest just behind the front legs.
    ellipsoid([0, chestY, chestZ], [0.106, 0.113, 0.12], body(TONE.coat, 0)),
    // Loin, a little narrower and tucked up underneath.
    ellipsoid([0, 0.3, -0.06], [0.092, 0.088, 0.1], body(TONE.coat, 0.06)),
    // Rump.
    ellipsoid([0, 0.296, -0.138], [0.097, 0.094, 0.088], body(TONE.coat, 0.055)),
    // Level topline from the withers to the croup.
    cone([0, 0.35, 0.07], [0, 0.337, -0.162], 0.058, 0.058, body(TONE.saddle, 0.055)),
    // Withers, the rise over the shoulders.
    ellipsoid([0, 0.356, 0.08], [0.08, 0.05, 0.07], body(TONE.saddle, 0.045)),
    // Breast bone, pushing the chest forward between the front legs.
    ellipsoid([0, 0.266, 0.14], [0.074, 0.08, 0.062], body(TONE.light, 0.05)),
  ];
}

/** Toes across the front of a paw, as soft knuckle bumps. */
function toes(center: Vec3, side: number): Shape[] {
  const [x, , z] = center;
  return [-1.5, -0.5, 0.5, 1.5].map((slot) =>
    ball([x + side * slot * 0.0175, 0.017 - Math.abs(slot) * 0.001, z + 0.03 - Math.abs(slot) * 0.0055], 0.0132, body(TONE.light, 0.008)),
  );
}

function frontLeg(side: 1 | -1): Shape[] {
  const shoulder = sided([0.07, 0.29, 0.085], side);
  const elbow = sided([0.068, 0.18, 0.066], side);
  const wrist = sided([0.064, 0.066, 0.094], side);
  const ankle = sided([0.064, 0.034, 0.104], side);
  const paw: Vec3 = [0.064 * side, 0.026, 0.118];
  return [
    cone(shoulder, elbow, 0.052, 0.043, body(TONE.coat, 0.045)),
    cone(elbow, wrist, 0.039, 0.033, body(TONE.coat, 0.02)),
    cone(wrist, ankle, 0.033, 0.031, body(TONE.light, 0.012)),
    ellipsoid(paw, [0.038, 0.026, 0.044], body(TONE.light, 0.016)),
    ...toes(paw, side),
  ];
}

function rearLeg(side: 1 | -1): Shape[] {
  const stifle = sided([0.077, 0.175, -0.108], side);
  const hock = sided([0.072, 0.08, -0.178], side);
  const ankle = sided([0.07, 0.034, -0.158], side);
  const paw: Vec3 = [0.07 * side, 0.026, -0.14];
  return [
    // Thigh, full and rounded, leaning forward toward the stifle.
    ellipsoid(sided([0.07, 0.25, -0.145], side), [0.058, 0.096, 0.08], body(TONE.coat, 0.045), [0, 1, -0.28]),
    cone(stifle, hock, 0.046, 0.033, body(TONE.coat, 0.025)),
    cone(hock, ankle, 0.033, 0.03, body(TONE.light, 0.012)),
    ellipsoid(paw, [0.037, 0.026, 0.042], body(TONE.light, 0.016)),
    ...toes(paw, side),
  ];
}

/**
 * The fluffy cream bib on the front of the chest: a soft puff with one lock pointing down the middle
 * and two sweeping back along the sides, so it reads as fur flowing off the chest, not as lumps.
 */
function ruff(): Shape[] {
  const lock = (path: Vec3[], width: number, facing: Vec3) =>
    flatLock({ path, width, flatness: 0.45, facing, tones: [TONE.light, TONE.cream], blend: 0.02, part: PART.body, segments: 5 });
  return [
    ellipsoid([0, 0.285, 0.17], [0.08, 0.09, 0.055], body(TONE.light + 0.12, 0.045)),
    ...lock(
      [
        [0, 0.262, 0.208],
        [0, 0.228, 0.216],
        [0, 0.202, 0.204],
      ],
      0.03,
      [0, -0.2, 1],
    ),
    ...bothSides((side) =>
      lock(
        [
          [0.05 * side, 0.282, 0.19],
          [0.07 * side, 0.248, 0.168],
          [0.078 * side, 0.218, 0.14],
        ],
        0.026,
        [side, -0.2, 0.6],
      ),
    ),
  ];
}

/** Feathering: longer cream fur down the backs of the forelegs and on the britches. */
function feathering(side: 1 | -1): Shape[] {
  const x = 0.068 * side;
  const lock = (path: Vec3[], width: number, facing: Vec3) =>
    flatLock({ path, width, flatness: 0.5, facing, tones: [TONE.light, TONE.cream], blend: 0.014, part: PART.body, segments: 5 });
  return [
    // A soft fringe down the back of each foreleg, lying along it and ending in a rounded tip.
    ...lock(
      [
        [x, 0.175, 0.02],
        [x, 0.13, 0.034],
        [x * 0.98, 0.092, 0.05],
      ],
      0.019,
      [side * 0.3, 0, -1],
    ),
    // Britches: full cream fur on the backs of the thighs, following the curve of the thigh down.
    ...lock(
      [
        [x * 1.02, 0.3, -0.2],
        [x * 1.04, 0.25, -0.222],
        [x * 1.02, 0.2, -0.205],
      ],
      0.03,
      [side * 0.8, 0, -1],
    ),
    ...lock(
      [
        [x * 0.9, 0.245, -0.205],
        [x * 0.92, 0.2, -0.214],
        [x * 0.9, 0.165, -0.196],
      ],
      0.022,
      [side * 0.6, 0, -1],
    ),
  ];
}

/** Big forms: torso and legs. */
export function bodyForms(): Shape[] {
  return [...torso(), ...bothSides(frontLeg), ...bothSides(rearLeg)];
}

/** Fur details, added after every big form so broad blends never soften them. */
export function bodyFur(): Shape[] {
  return [...ruff(), ...bothSides(feathering)];
}
