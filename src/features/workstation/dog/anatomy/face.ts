import { PART_COUNT } from '../dimensions';
import { Field } from '../sdf/field';
import { surfaceFrame } from '../sdf/trace';
import { FACE, headForms } from './head';

/** Eye ellipsoid half sizes: wide, tall and shallow, big and round for a chibi face. */
export const EYE_RADII = [0.0155, 0.0175, 0.0085] as const;

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
}

function place(field: Field, direction: readonly [number, number, number], lift: number): FacePlacement {
  const { position, quaternion } = surfaceFrame(field, FACE.core, direction, lift);
  return { position: [position.x, position.y, position.z], quaternion: [quaternion.x, quaternion.y, quaternion.z, quaternion.w] };
}

/** Where the eyes and nose sit on the sculpted head, found by tracing onto its surface. Plain numbers, so it can cross from a worker. */
export function faceLayout(): FaceLayout {
  const head = new Field(headForms(), PART_COUNT);
  const [ex, ey, ez] = FACE.eye;
  return {
    eyes: [place(head, [ex, ey, ez], -0.0045), place(head, [-ex, ey, ez], -0.0045)],
    nose: place(head, FACE.nose, -0.004),
  };
}
