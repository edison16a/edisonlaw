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
}

function place(field: Field, direction: readonly [number, number, number], lift: number): FacePlacement {
  const { position, quaternion } = surfaceFrame(field, FACE.core, direction, lift);
  return { position: [position.x, position.y, position.z], quaternion: [quaternion.x, quaternion.y, quaternion.z, quaternion.w] };
}

/** Where the eyes, nose and lips sit on the sculpted head, found by tracing onto its surface. Plain numbers, so it can cross from a worker. */
export function faceLayout(): FaceLayout {
  const head = new Field(headForms(), PART_COUNT);
  const [ex, ey, ez] = FACE.eye;
  return {
    eyes: [place(head, [ex, ey, ez], -EYE_SINK), place(head, [-ex, ey, ez], -EYE_SINK)],
    nose: place(head, FACE.nose, -NOSE_SINK),
    lips: lipLine(),
  };
}
