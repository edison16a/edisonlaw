import { Vector3 } from 'three';
import type { Vec3 } from '../../layout';
import { TONE } from '../dimensions';

/**
 * Measurements of the sleeping dog in metres, in its own space: +Y up, origin on the floor in the middle
 * of the curl, +Z the way its face looks and +X to the right as seen from there. It lies curled nose to
 * tail like a donut, on its right side with its left flank up: the rump at the right, the back round
 * behind, the chest at the left, the head resting on the floor at the front left, and the tail wrapped
 * round the front past its hind paws.
 */

/** How far the body rolls from lying flat on its side toward its belly, in radians, so the back rises a little. */
const ROLL = 0.45;

/**
 * A point round the curl: `angle` in degrees from +X round toward the back (-Z), `radius` out from the
 * middle, at `height` above the floor. The spine runs round the curl the same way, from the rump at about
 * -30 to the chest at about 190.
 */
export function onCurl(angle: number, radius: number, height: number): Vec3 {
  const a = (angle * Math.PI) / 180;
  return [radius * Math.cos(a), height, -radius * Math.sin(a)];
}

/** The body's own axes at `angle` round the curl: forward along it toward the head, dorsal out and a little up, left up and in. */
export function curlFrame(angle: number) {
  const a = (angle * Math.PI) / 180;
  const forward = new Vector3(-Math.sin(a), 0, -Math.cos(a));
  const out = new Vector3(Math.cos(a), 0, -Math.sin(a));
  const dorsal = out.multiplyScalar(Math.cos(ROLL)).add(new Vector3(0, Math.sin(ROLL), 0));
  const left = new Vector3().crossVectors(dorsal, forward);
  return { forward, dorsal, left };
}

/** One piece of the torso round the curl: its half sizes across the flank, from back to belly, and along the body. */
export interface TorsoPiece {
  angle: number;
  radius: number;
  height: number;
  radii: Vec3;
  tone: number;
}

/**
 * The torso as overlapping pieces round the curl, from the rump to the forechest, so it bends in one smooth
 * sweep: a round pelvis, a narrower loin, the deep rib cage and the chest.
 */
export const TORSO: TorsoPiece[] = [
  { angle: -26, radius: 0.12, height: 0.108, radii: [0.1, 0.106, 0.088], tone: TONE.coat },
  { angle: 10, radius: 0.125, height: 0.106, radii: [0.092, 0.098, 0.084], tone: TONE.coat },
  { angle: 46, radius: 0.128, height: 0.108, radii: [0.096, 0.102, 0.086], tone: TONE.coat },
  { angle: 82, radius: 0.128, height: 0.114, radii: [0.108, 0.118, 0.09], tone: TONE.coat },
  { angle: 118, radius: 0.125, height: 0.117, radii: [0.115, 0.125, 0.092], tone: TONE.coat },
  { angle: 154, radius: 0.12, height: 0.115, radii: [0.112, 0.122, 0.088], tone: TONE.coat },
  { angle: 184, radius: 0.11, height: 0.108, radii: [0.096, 0.104, 0.074], tone: TONE.coat + 0.1 },
];

/** Angle round the curl of the middle of the rib cage. */
export const RIBS_ANGLE = 122;
/** Half sizes of the rib cage around JOINTS.chest, across the flank, from back to belly and along the body. */
export const RIBS: Vec3 = [0.12, 0.13, 0.13];

/** Where each bone pivots, in dog space. */
export const JOINTS = {
  /** Middle of the rib cage, which swells with each breath. */
  chest: onCurl(RIBS_ANGLE, 0.125, 0.117),
  /** Root of the tail, low at the end of the rump. */
  tail: [0.108, 0.09, 0.112] as Vec3,
} as const;

/**
 * Where the head rests. The head is sculpted in head space (see anatomy/head.ts) and turns about its
 * atlas, where the skull meets the neck.
 */
export const HEAD_REST = {
  /** The atlas in head space: low at the back of the skull, between the ears. */
  atlas: [0, -0.078, -0.046] as Vec3,
  /** Where the atlas lies on the floor plan in dog space, as X and Z. Its height follows from the chin resting on the floor. */
  at: [-0.118, 0.15] as const,
  /** Height of the lowest point of the head above the floor: resting on the rug, sunk into it a hair. */
  chin: 0.012,
  /**
   * Resting turn of the head in radians: the nose turned in toward the tail, so it shows three quarters on
   * from the front, the muzzle level along the floor, and the crown tipped a little toward the tail.
   */
  rest: { yaw: 0.62, pitch: 0.02, tilt: 0.12 },
  /**
   * How the ears lie, left then right, in radians swung out from the cheek, turned face forward and swung
   * back. The right ear, on the outside of the curl facing the camera, lies open so its feathered back
   * shows rather than its edge; the left one lies closer, against the curl.
   */
  ears: [
    { out: 0.3, turn: 0.14, back: -0.25 },
    { out: 0.62, turn: 0.25, back: 0.1 },
  ],
} as const;
