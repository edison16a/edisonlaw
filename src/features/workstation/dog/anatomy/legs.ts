import { Vector3 } from 'three';
import type { Vec3 } from '../../layout';
import { PART, PAWS, TONE } from '../dimensions';
import type { Shape } from '../sdf/field';
import { ball, bothSides, cone, ellipsoid, sided } from './sculpt';

/**
 * The legs of the sitting dog in dog space: straight, upright forelegs under the chest, and hind legs
 * folded beneath it, each thigh a full round haunch lying along the floor from the hip to the stifle,
 * the gaskin running back down to a hock flat on the floor, and the rear pastern lying forward from
 * it to a paw beside the forepaws.
 */

const body = (tone: number, blend: number) => ({ tone, blend, part: PART.body });

/** Half sizes of a paw: across, height and length. */
const PAW_RADII: Vec3 = [0.034, 0.024, 0.041];

/** Toes across the front of a paw pointing along `along` on the floor, as soft knuckle bumps with their middles `height` up. */
function toes(center: Vec3, along: Vector3, height: number): Shape[] {
  const across = new Vector3(-along.z, 0, along.x);
  return [-1.5, -0.5, 0.5, 1.5].map((slot) => {
    const at = new Vector3(...center)
      .addScaledVector(along, 0.029 - Math.abs(slot) * 0.0055)
      .addScaledVector(across, slot * 0.0165)
      .setY(height - Math.abs(slot) * 0.001);
    return ball(at.toArray(), 0.0125, body(TONE.light, 0.008));
  });
}

export interface PawSpec {
  /** Which way the paw points across the floor: straight ahead, +Z, unless given. */
  toward?: Vec3;
  radii?: Vec3;
  /** Height of the middle knuckles above the floor: a little below the middle of the paw unless given. */
  knuckles?: number;
}

/** A paw lying on the floor, pointing along `toward`, with soft knuckle bumps across its front. */
export function paw(center: Vec3, { toward = [0, 0, 1], radii = PAW_RADII, knuckles = center[1] - 0.008 }: PawSpec = {}): Shape[] {
  const along = new Vector3(...toward).setY(0).normalize();
  return [ellipsoid(center, radii, body(TONE.light, 0.018), [0, 1, 0], along.toArray()), ...toes(center, along, knuckles)];
}

function frontLeg(side: 1 | -1): Shape[] {
  const point = sided([0.074, 0.39, 0.17], side);
  const elbow = sided([0.074, 0.28, 0.13], side);
  const wrist = sided([0.066, 0.074, 0.146], side);
  const ankle = sided([0.065, 0.036, 0.158], side);
  const pawAt: Vec3 = [PAWS.front[0] * side, 0.025, PAWS.front[1]];
  return [
    // Shoulder blade, sloping back from the point of the shoulder up to the withers.
    ellipsoid(sided([0.07, 0.44, 0.118], side), [0.046, 0.1, 0.062], body(TONE.coat, 0.05), [0, 1, -0.5]),
    cone(point, elbow, 0.05, 0.042, body(TONE.coat, 0.04)),
    // The forearm stands straight up from the paw.
    cone(elbow, wrist, 0.037, 0.029, body(TONE.light, 0.03)),
    cone(wrist, ankle, 0.029, 0.028, body(TONE.light, 0.015)),
    ...paw(pawAt, { radii: [0.035, 0.025, 0.043], knuckles: 0.016 }),
  ];
}

function hindLeg(side: 1 | -1): Shape[] {
  const stifle = sided([0.098, 0.12, 0.022], side);
  const hock = sided([PAWS.hock[0], 0.04, PAWS.hock[1]], side);
  const heel = sided([0.1, 0.03, 0.018], side);
  const pawAt: Vec3 = [PAWS.rear[0] * side, 0.024, PAWS.rear[1]];
  return [
    // The haunch: the thigh folded forward along the floor, one full round muscle from hip to stifle.
    ellipsoid(sided([0.08, 0.148, -0.062], side), [0.058, 0.098, 0.13], body(TONE.coat, 0.05), [0, 1, 0.3], [side * 0.12, -0.12, 1]),
    // Gaskin, from the stifle back down to the hock.
    cone(stifle, hock, 0.04, 0.028, body(TONE.coat, 0.03)),
    // Rear pastern, lying flat on the floor from the hock forward to the paw.
    cone(hock, heel, 0.027, 0.025, body(TONE.light, 0.015)),
    ...paw(pawAt, { knuckles: 0.016 }),
  ];
}

export const frontLegs = () => bothSides(frontLeg);
export const hindLegs = () => bothSides(hindLeg);
