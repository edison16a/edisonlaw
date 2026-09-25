import { Quaternion, Vector3 } from 'three';
import type { Vec3 } from '../../layout';
import { PART_COUNT } from '../dimensions';
import { Field } from '../sdf/field';
import { surfaceFrame } from '../sdf/trace';
import { FACE, headForms } from './head';
import { lipLine } from './lips';

/** Eye ellipsoid half sizes: a soft almond, a little wider than tall, and shallow. */
export const EYE_RADII = [0.0136, 0.0122, 0.0076] as const;

/** The pupil: a smaller dark ellipsoid set forward in the eye, so a ring of deep brown iris shows round it. */
export const PUPIL = { radii: [0.0089, 0.0082, 0.0057] as const, forward: 0.002 } as const;

/** How far each eye sinks into the skull, so the lids close round it. */
const EYE_SINK = 0.004;
/** How far the nose leather sinks into the end of the muzzle, so its edge melts into it. */
const NOSE_SINK = 0.0035;

/**
 * The line of a shut eye across the face, in eye space as shares of the eye's half sizes: a gentle
 * crescent from corner to corner, sagging below the middle of the eye and drooping a little toward the
 * outer corner, the way a sleeping dog's eye closes.
 */
const CREASE = { reach: 1.1, corners: -0.18, sag: 0.34, droop: 0.2, points: 11 } as const;
/** How far the line of a shut eye stands out of the skull, so it rides over the coat's triangles. */
const CREASE_STAND_OUT = 0.0008;

/** Where a face part sits in head space: its position, and a rotation with +Z out of the face. */
export interface FacePlacement {
  position: [number, number, number];
  quaternion: [number, number, number, number];
}

export interface FaceLayout {
  /** Left then right, seated on the skull. */
  eyes: [FacePlacement, FacePlacement];
  /** Front of the muzzle where the nose leather sits. */
  nose: FacePlacement;
  /** The line of the closed mouth, from the right corner to the left, on the surface. */
  lips: Vec3[];
  /** The line of each shut eye on the surface, left then right, in that eye's own space. */
  creases: [Vec3[], Vec3[]];
}

function place(field: Field, direction: readonly [number, number, number], lift: number): FacePlacement {
  const { position, quaternion } = surfaceFrame(field, FACE.core, direction, lift);
  return { position: [position.x, position.y, position.z], quaternion: [quaternion.x, quaternion.y, quaternion.z, quaternion.w] };
}

/**
 * The line of a shut eye, traced onto the skull straight in along the eye's axis and brought back into
 * the eye's own space. Each eye's X runs toward the head's left, so the outer corner is +X on the left
 * eye (`side` 1) and -X on the right.
 */
function creaseLine(field: Field, eye: FacePlacement, side: 1 | -1): Vec3[] {
  const turn = new Quaternion(...eye.quaternion);
  const toEye = turn.clone().invert();
  const origin = new Vector3(...eye.position);
  const inward = new Vector3(0, 0, -1).applyQuaternion(turn);
  const droop = -side * CREASE.droop;
  return Array.from({ length: CREASE.points }, (_, i) => {
    const u = (i / (CREASE.points - 1)) * 2 - 1;
    const x = u * CREASE.reach * EYE_RADII[0];
    const y = (CREASE.corners - CREASE.sag * (1 - u * u)) * EYE_RADII[1];
    const point = new Vector3(x * Math.cos(droop) - y * Math.sin(droop), x * Math.sin(droop) + y * Math.cos(droop), 0.03)
      .applyQuaternion(turn)
      .add(origin);
    for (let step = 0; step < 200; step++) {
      const d = field.distance(point.x, point.y, point.z);
      if (Math.abs(d) < 1e-7) break;
      point.addScaledVector(inward, d * 0.9);
    }
    const [px, py, pz] = point.addScaledVector(inward, -CREASE_STAND_OUT).sub(origin).applyQuaternion(toEye).toArray();
    return [px, py, pz];
  });
}

/** Where the eyes, nose and lips sit on the sculpted head, found by tracing onto its surface. Plain numbers, so it can cross from a worker. */
export function faceLayout(): FaceLayout {
  const head = new Field(headForms(), PART_COUNT);
  const [ex, ey, ez] = FACE.eye;
  const eyes: [FacePlacement, FacePlacement] = [place(head, [ex, ey, ez], -EYE_SINK), place(head, [-ex, ey, ez], -EYE_SINK)];
  return {
    eyes,
    nose: place(head, FACE.nose, -NOSE_SINK),
    lips: lipLine(),
    creases: [creaseLine(head, eyes[0], 1), creaseLine(head, eyes[1], -1)],
  };
}
