import { Vector3 } from 'three';
import type { Vec3 } from '../../layout';
import { ball, cone, ellipsoid, flatLock } from '../anatomy/sculpt';
import { PART, TONE } from '../dimensions';
import type { Shape } from '../sdf/field';

/**
 * The folded legs of the curled dog in dog space. It lies on its right side, so its left legs lie on
 * top: the upper haunch lies on the flank with the hind leg drawn forward into the middle of the curl,
 * and the forelegs are folded under the chest with their paws tucked beside the neck. The right legs lie
 * beneath them, only the right hind paw showing beside the left one.
 */

const body = (tone: number, blend: number) => ({ tone, blend, part: PART.body });

/** Joints of a folded hind leg: hip, stifle, hock and the middle of the paw. */
interface HindLeg {
  hip: Vec3;
  stifle: Vec3;
  hock: Vec3;
  paw: Vec3;
  /** Half sizes of the haunch: across, thickness and length. */
  haunch: Vec3;
}

export const HIND: { upper: HindLeg; lower: HindLeg } = {
  upper: {
    hip: [0.12, 0.19, -0.03],
    stifle: [0.095, 0.15, 0.08],
    hock: [0.175, 0.06, 0.1],
    paw: [0.13, 0.03, 0.18],
    haunch: [0.085, 0.062, 0.115],
  },
  lower: {
    hip: [0.12, 0.08, -0.02],
    stifle: [0.08, 0.06, 0.08],
    hock: [0.18, 0.035, 0.06],
    paw: [0.175, 0.028, 0.16],
    haunch: [0.07, 0.05, 0.1],
  },
};

/** Elbow, wrist and paw of each foreleg, folded back under the chest. */
export const FORE = {
  upper: { elbow: [-0.13, 0.06, -0.02] as Vec3, wrist: [-0.07, 0.04, -0.01] as Vec3, paw: [-0.03, 0.028, -0.03] as Vec3 },
  lower: { elbow: [-0.14, 0.04, -0.03] as Vec3, wrist: [-0.08, 0.03, -0.03] as Vec3, paw: [-0.04, 0.024, -0.05] as Vec3 },
} as const;

/** Soft knuckles across the front of a paw that points along `toward`. */
function toes(paw: Vec3, toward: Vector3): Shape[] {
  const along = toward.clone().setY(0).normalize();
  const across = new Vector3(-along.z, 0, along.x);
  return [-1.5, -0.5, 0.5, 1.5].map((slot) => {
    const at = new Vector3(...paw)
      .addScaledVector(along, 0.029 - Math.abs(slot) * 0.0055)
      .addScaledVector(across, slot * 0.0165)
      .setY(paw[1] - 0.008 - Math.abs(slot) * 0.001);
    return ball(at.toArray(), 0.0125, body(TONE.light, 0.008));
  });
}

function paw(center: Vec3, from: Vec3): Shape[] {
  const toward = new Vector3(...center).sub(new Vector3(...from));
  return [ellipsoid(center, [0.034, 0.024, 0.041], body(TONE.light, 0.018), [0, 1, 0], toward.clone().setY(0).toArray()), ...toes(center, toward)];
}

function hindLeg({ hip, stifle, hock, paw: pawAt, haunch }: HindLeg): Shape[] {
  const thigh = new Vector3(...stifle).sub(new Vector3(...hip));
  const middle = new Vector3(...hip).addScaledVector(thigh, 0.48).toArray();
  return [
    // The haunch: one full round muscle from the hip to the stifle, lying on the flank.
    ellipsoid(middle, haunch, body(TONE.coat, 0.05), [0, 1, 0], thigh.toArray()),
    // Gaskin, from the stifle back to the hock.
    cone(stifle, hock, 0.038, 0.027, body(TONE.coat, 0.03)),
    // Rear pastern, from the hock forward to the paw.
    cone(hock, pawAt, 0.026, 0.024, body(TONE.light, 0.015)),
    ...paw(pawAt, hock),
  ];
}

function foreleg({ elbow, wrist, paw: pawAt }: { elbow: Vec3; wrist: Vec3; paw: Vec3 }): Shape[] {
  return [cone(elbow, wrist, 0.036, 0.028, body(TONE.light, 0.03)), cone(wrist, pawAt, 0.028, 0.026, body(TONE.light, 0.015)), ...paw(pawAt, wrist)];
}

export function legForms(): Shape[] {
  return [...hindLeg(HIND.lower), ...foreleg(FORE.lower), ...foreleg(FORE.upper), ...hindLeg(HIND.upper)];
}

/** Britches: soft lighter fur down the back of the upper haunch, from the hip round toward the hock. */
export function britches(): Shape[] {
  const { hip, stifle, hock } = HIND.upper;
  const back = new Vector3(...hock).sub(new Vector3(...stifle)).normalize();
  const start = new Vector3(...hip).addScaledVector(back, 0.05).setY(hip[1] + 0.02);
  return flatLock({
    path: [start.toArray(), start.clone().addScaledVector(back, 0.05).setY(0.12).toArray(), new Vector3(...hock).addScaledVector(back, -0.01).setY(0.08).toArray()],
    width: 0.034,
    flatness: 0.42,
    facing: [back.x, 0.6, back.z],
    tones: [TONE.coat + 0.12, TONE.light + 0.2],
    blend: 0.03,
    part: PART.body,
    segments: 5,
  });
}
