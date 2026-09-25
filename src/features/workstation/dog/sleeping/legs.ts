import { Vector3 } from 'three';
import type { Vec3 } from '../../layout';
import { ball, cone, ellipsoid, flatLock } from '../anatomy/sculpt';
import { PART, PART_COUNT, TONE } from '../dimensions';
import { Field, type Shape } from '../sdf/field';
import { torsoForms } from './body';

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
  /** Which way the broad outer face of the haunch looks. */
  face: Vec3;
}

const HIND: { upper: HindLeg; lower: HindLeg } = {
  upper: {
    hip: [0.125, 0.175, -0.03],
    stifle: [0.08, 0.14, 0.074],
    hock: [0.15, 0.06, 0.09],
    paw: [0.075, 0.03, 0.1],
    haunch: [0.088, 0.064, 0.118],
    face: [0, 1, 0.55],
  },
  lower: {
    hip: [0.12, 0.08, -0.02],
    stifle: [0.07, 0.06, 0.07],
    hock: [0.17, 0.035, 0.05],
    paw: [0.12, 0.028, 0.1],
    haunch: [0.07, 0.05, 0.1],
    face: [0, 1, 0],
  },
};

/** Elbow, wrist and paw of each foreleg, folded back under the chest. */
const FORE = {
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

function hindLeg({ hip, stifle, hock, paw: pawAt, haunch, face }: HindLeg): Shape[] {
  const thigh = new Vector3(...stifle).sub(new Vector3(...hip));
  const middle = new Vector3(...hip).addScaledVector(thigh, 0.48).toArray();
  return [
    // The haunch: one full round muscle from the hip to the stifle, lying on the flank.
    ellipsoid(middle, haunch, body(TONE.coat, 0.05), face, thigh.toArray()),
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

/**
 * Where the britches grow, as angles round the curl in degrees: along the outside of the haunch and the
 * rump on the side toward the camera, down to the root of the tail.
 */
const BRITCHES = [-2, -16, -30, -44];

/** Where a line in from `outside` toward `inside` first meets `sculpt`, sunk `sink` into it. */
function onBody(sculpt: Field, outside: Vector3, inside: Vector3, sink: number) {
  const point = outside.clone();
  const direction = inside.clone().sub(outside).normalize();
  for (let i = 0; i < 200; i++) {
    const distance = sculpt.distance(point.x, point.y, point.z);
    if (distance < 1e-5) break;
    point.addScaledVector(direction, distance * 0.9);
  }
  return point.addScaledVector(direction, sink);
}

/**
 * Britches: long cream feathering on the back of the upper haunch and the rump, which lie toward the camera
 * in the curl. Each lock is laid onto `sculpt` (the torso and legs by default) from high on the
 * haunch down to the rug, over a soft cream pad, like the reference's fluffy hind quarters.
 */
export function britches(sculpt: Field = new Field([...torsoForms(), ...legForms()], PART_COUNT)): Shape[] {
  const outAt = (angle: number) => new Vector3(Math.cos((angle * Math.PI) / 180), 0, -Math.sin((angle * Math.PI) / 180));
  const lay = (out: Vector3, height: number, sink: number) =>
    onBody(sculpt, out.clone().multiplyScalar(0.5).setY(height), out.clone().multiplyScalar(0.08).setY(height), sink);
  // A soft cream pad under the locks, so the back of the haunch reads lighter as a whole.
  const middle = outAt(-24);
  const pad = ellipsoid(lay(middle, 0.09, 0.03).toArray(), [0.1, 0.07, 0.035], body(TONE.light + 0.12, 0.04), [0, 1, 0], middle.toArray());
  const locks = BRITCHES.flatMap((angle) => {
    const out = outAt(angle);
    // Down the haunch to the floor, where the tip spreads out on the rug instead of hanging free.
    const tip = lay(out, 0.03, 0.012).addScaledVector(out, 0.016).setY(0.014);
    return flatLock({
      path: [lay(out, 0.2, 0.008).toArray(), lay(out, 0.12, 0.006).toArray(), tip.toArray()],
      width: 0.042,
      flatness: 0.36,
      facing: out.clone().setY(0.3).toArray(),
      tones: [TONE.coat + 0.14, TONE.cream],
      blend: 0.03,
      part: PART.body,
      segments: 5,
    });
  });
  return [pad, ...locks];
}
