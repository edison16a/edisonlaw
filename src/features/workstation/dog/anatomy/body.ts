import type { Vec3 } from '../../layout';
import { JOINTS, PART, PAWS, RIBS, TONE } from '../dimensions';
import type { Shape } from '../sdf/field';
import { ball, bothSides, cone, ellipsoid, flatLock, sided } from './sculpt';

/**
 * The torso and legs in dog space: a deep rib cage reaching down to the elbows, a level back, a gentle
 * tuck at the loin and a round croup, on long straight forelegs and well bent hind legs with neat round
 * paws. Grown proportions, softened into clay.
 */

const body = (tone: number, blend: number) => ({ tone, blend, part: PART.body });

function torso(): Shape[] {
  return [
    // Rib cage, deepest just behind the elbows.
    ellipsoid(JOINTS.chest, RIBS, body(TONE.coat, 0)),
    // Loin, narrower and tucked up underneath.
    ellipsoid([0, 0.432, -0.1], [0.082, 0.08, 0.12], body(TONE.coat, 0.07)),
    // Croup and hindquarters.
    ellipsoid([0, 0.424, -0.212], [0.09, 0.088, 0.09], body(TONE.coat, 0.06)),
    // Level topline from the withers to the croup.
    cone([0, 0.466, 0.13], [0, 0.458, -0.232], 0.052, 0.052, body(TONE.saddle, 0.06)),
    // Withers, the rise over the shoulder blades.
    ellipsoid([0, 0.478, 0.13], [0.07, 0.048, 0.078], body(TONE.saddle, 0.05)),
    // Forechest, the breast bone pushing forward between the shoulders.
    ellipsoid([0, 0.372, 0.224], [0.076, 0.094, 0.07], body(TONE.light, 0.06)),
    // Brisket, the lowest line of the chest between and behind the forelegs.
    ellipsoid([0, 0.3, 0.115], [0.07, 0.042, 0.1], body(TONE.light, 0.05)),
  ];
}

/** Toes across the front of a paw, as soft knuckle bumps. */
function toes(center: Vec3, side: number): Shape[] {
  const [x, , z] = center;
  return [-1.5, -0.5, 0.5, 1.5].map((slot) =>
    ball([x + side * slot * 0.0165, 0.016 - Math.abs(slot) * 0.001, z + 0.029 - Math.abs(slot) * 0.0055], 0.0125, body(TONE.light, 0.008)),
  );
}

function frontLeg(side: 1 | -1): Shape[] {
  const point = sided([0.078, 0.36, 0.212], side);
  const elbow = sided([0.074, 0.284, 0.15], side);
  const wrist = sided([0.068, 0.074, 0.17], side);
  const ankle = sided([0.067, 0.036, 0.186], side);
  const paw: Vec3 = [PAWS.front[0] * side, 0.025, PAWS.front[1]];
  return [
    // Shoulder blade, sloping back from the point of the shoulder toward the withers.
    ellipsoid(sided([0.072, 0.41, 0.16], side), [0.046, 0.1, 0.064], body(TONE.coat, 0.05), [0, 1, -0.6]),
    cone(point, elbow, 0.05, 0.042, body(TONE.coat, 0.04)),
    cone(elbow, wrist, 0.037, 0.029, body(TONE.light, 0.03)),
    cone(wrist, ankle, 0.029, 0.028, body(TONE.light, 0.015)),
    ellipsoid(paw, [0.035, 0.025, 0.043], body(TONE.light, 0.018)),
    ...toes(paw, side),
  ];
}

function rearLeg(side: 1 | -1): Shape[] {
  const stifle = sided([0.078, 0.274, -0.15], side);
  const hock = sided([0.074, 0.12, -0.268], side);
  const ankle = sided([0.072, 0.036, -0.246], side);
  const paw: Vec3 = [PAWS.rear[0] * side, 0.025, PAWS.rear[1]];
  return [
    // Thigh, full and muscled, running from the hip down and forward to the stifle.
    ellipsoid(sided([0.075, 0.36, -0.198], side), [0.058, 0.108, 0.08], body(TONE.coat, 0.05), [0, 0.86, -0.5]),
    // The flank, a soft web of skin from the belly to the stifle, so the knee never reads as a knob.
    ellipsoid(sided([0.056, 0.325, -0.118], side), [0.042, 0.042, 0.052], body(TONE.coat + 0.05, 0.045)),
    cone(stifle, hock, 0.045, 0.03, body(TONE.coat, 0.03)),
    cone(hock, ankle, 0.03, 0.028, body(TONE.light, 0.015)),
    ellipsoid(paw, [0.034, 0.025, 0.041], body(TONE.light, 0.018)),
    ...toes(paw, side),
  ];
}

const lock = (path: Vec3[], width: number, flatness: number, facing: Vec3, blend: number, tones: [number, number] = [TONE.light, TONE.cream]) =>
  flatLock({ path, width, flatness, facing, tones, blend, part: PART.body, segments: 5 });

/**
 * The cream frill down the front of the chest: a soft bib over the breast bone that hangs a little below
 * the brisket between the forelegs, with broad locks lying down it. Every lock ends on the bib, since a
 * thin tip hanging free reads as a drip rather than as fur.
 */
function frill(): Shape[] {
  // Thick enough, and melted in softly enough, that their edges never form a crease down the chest.
  const locks = [-0.03, 0, 0.03].flatMap((x) =>
    flatLock({
      path: [
        [x, 0.44, 0.28],
        [x * 1.1, 0.36, 0.302],
        [x * 1.1, 0.29, 0.29],
      ],
      width: 0.032,
      flatness: 0.46,
      facing: [x * 8, 0.15, 1],
      tones: [TONE.light + 0.05, TONE.cream],
      blend: 0.04,
      part: PART.body,
      segments: 7,
    }),
  );
  return [ellipsoid([0, 0.34, 0.258], [0.062, 0.092, 0.042], body(TONE.light + 0.16, 0.04)), ...locks];
}

/** Feathering: long cream fur down the backs of the forelegs and on the britches. */
function feathering(side: 1 | -1): Shape[] {
  return [
    // A fringe down the back of each foreleg, from the elbow to a rounded tip above the wrist.
    ...lock(
      [
        [0.07 * side, 0.27, 0.124],
        [0.07 * side, 0.2, 0.124],
        [0.068 * side, 0.14, 0.138],
      ],
      0.021,
      0.5,
      [side * 0.3, 0, -1],
      0.014,
    ),
    // Britches: soft cream fur lying down the backs of the thighs.
    ...lock(
      [
        [0.068 * side, 0.43, -0.276],
        [0.072 * side, 0.365, -0.288],
        [0.068 * side, 0.315, -0.262],
      ],
      0.028,
      0.34,
      [side * 0.8, 0, -1],
      0.02,
      [TONE.coat + 0.1, TONE.light + 0.18],
    ),
  ];
}

/** Big forms: torso and legs. */
export function bodyForms(): Shape[] {
  return [...torso(), ...bothSides(frontLeg), ...bothSides(rearLeg)];
}

/** Fur details, added after every big form so broad blends never soften them. */
export function bodyFur(): Shape[] {
  return [...frill(), ...bothSides(feathering)];
}
