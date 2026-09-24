import { PART_COUNT } from '../dimensions';
import { Field } from '../sdf/field';
import { surfaceFrame } from '../sdf/trace';
import { FACE, headForms } from './head';

/** Eye ellipsoid half sizes: wide, tall and shallow, big and round for a chibi face. */
export const EYE_RADII = [0.0155, 0.0175, 0.0085] as const;

/** The pupil: a smaller dark ellipsoid set forward in the eye, so a ring of brown iris shows round it. */
export const PUPIL = { radii: [0.0098, 0.0112, 0.0066] as const, forward: 0.0025 } as const;

/** The inside of the open mouth: a dark liner just within the carved opening, in head space. */
export const MOUTH_LINER = { center: [0, -0.1665, 0.112] as const, radii: [0.029, 0.0105, 0.027] as const } as const;

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
