import type { Vec3 } from '../../layout';
import { PART, TONE } from '../dimensions';
import type { Shape } from '../sdf/field';
import { bothSides, carve, cone, CUT, ellipsoid, flatLock, sided } from './sculpt';

/**
 * The head in head space: origin on the crown where Edison's hand rests, +Z toward the nose,
 * +Y up, +X the dog's left. A broad round skull with full cheeks, a short soft muzzle, a clear
 * stop between the brows, and an open, smiling mouth.
 */

const head = (tone: number, blend: number) => ({ tone, blend, part: PART.head });
const jaw = (tone: number, blend: number) => ({ tone, blend, part: PART.jaw });

/** Landmarks the face parts are built on, in head space. */
export const FACE = {
  /** Centre the eyes and nose are aimed from when finding the surface. */
  core: [0, -0.1, 0] as Vec3,
  /** Direction from the core to the left eye. */
  eye: [0.46, 0.14, 0.88] as Vec3,
  /** Direction from the core to the tip of the nose, straight ahead and a little up. */
  nose: [0, -0.03, 1] as Vec3,
  /** Hinge of the lower jaw, level with the mouth corners. */
  jawHinge: [0, -0.16, 0.035] as Vec3,
  /** Mouth opening: centre and half sizes of the carved slot, and the corners of the smile. */
  mouth: { center: [0, -0.1655, 0.118] as Vec3, radii: [0.03, 0.0112, 0.03] as Vec3 },
  mouthCorner: [0.03, -0.16, 0.088] as Vec3,
  /** Where the left ear hangs from, on the side of the skull above and behind the eye. */
  earRoot: [0.078, -0.046, -0.004] as Vec3,
  /** Back of the skull, where the neck joins. */
  nape: [0, -0.125, -0.05] as Vec3,
} as const;

function skull(): Shape[] {
  return [
    // Melts into the neck, which comes before it in the coat.
    ellipsoid([0, -0.094, -0.004], [0.097, 0.094, 0.092], head(TONE.coat, 0.04)),
    // Domed forehead over the eyes.
    ellipsoid([0, -0.06, 0.036], [0.072, 0.05, 0.058], head(TONE.coat, 0.035)),
    // Soft brow ridges that give the eyes their friendly lift.
    ...bothSides((side) => [ellipsoid(sided([0.035, -0.052, 0.076], side), [0.027, 0.016, 0.022], head(TONE.coat, 0.018))]),
    // Full round cheeks, the chibi part of the face.
    ...bothSides((side) => [ellipsoid(sided([0.058, -0.13, 0.04], side), [0.05, 0.047, 0.055], head(TONE.light, 0.035))]),
    // Throat under the jaw, filling into the neck.
    ellipsoid([0, -0.165, 0.02], [0.052, 0.035, 0.055], head(TONE.light, 0.035)),
  ];
}

function muzzle(): Shape[] {
  return [
    ellipsoid([0, -0.13, 0.086], [0.05, 0.043, 0.06], head(TONE.light, 0.035)),
    // Bridge of the nose, running from the stop to the nose leather.
    cone([0, -0.091, 0.062], [0, -0.104, 0.126], 0.029, 0.026, head(TONE.light, 0.03)),
    // Upper lips hanging over the sides of the mouth.
    ...bothSides((side) => [ellipsoid(sided([0.024, -0.151, 0.108], side), [0.03, 0.021, 0.04], head(TONE.light, 0.012))]),
    // Lower jaw and chin.
    ellipsoid([0, -0.179, 0.09], [0.031, 0.017, 0.043], jaw(TONE.cream, 0.01)),
  ];
}

/** Soft cream tufts behind the cheeks, where the ruff starts, lying back along the jaw line. */
function cheekFluff(): Shape[] {
  return bothSides((side) =>
    [0, 1].flatMap((row) =>
      flatLock({
        path: [
          sided([0.078 - row * 0.008, -0.118 - row * 0.022, 0.0 - row * 0.022], side),
          sided([0.09 - row * 0.008, -0.158 - row * 0.022, -0.02 - row * 0.022], side),
          sided([0.086 - row * 0.008, -0.192 - row * 0.022, -0.03 - row * 0.022], side),
        ],
        width: 0.024,
        flatness: 0.5,
        facing: [side, 0, -0.35],
        tones: [TONE.light, TONE.cream],
        blend: 0.016,
        part: PART.head,
        segments: 5,
      }),
    ),
  );
}

/** Skull and muzzle, in head space. */
export function headForms(): Shape[] {
  return [...skull(), ...muzzle()];
}

/** Soft locks falling from the back of the skull over the nape, so the head flows into the neck. */
function napeFur(): Shape[] {
  return [-0.048, 0, 0.048].flatMap((x) =>
    flatLock({
      path: [
        [x, -0.07, -0.088],
        [x * 1.1, -0.12, -0.104],
        [x * 1.15, -0.165, -0.098],
      ],
      width: 0.03,
      flatness: 0.42,
      facing: [x * 8, 0.2, -1],
      tones: [TONE.coat, TONE.coat + 0.15],
      blend: 0.02,
      part: PART.head,
      segments: 5,
    }),
  );
}

/** Fur tufts on the head, in head space. */
export function headFur(): Shape[] {
  return [...cheekFluff(), ...napeFur()];
}

/** The open mouth: a slot between the lips and the jaw that turns up into a smile at the corners. */
export function mouthCarves(): Shape[] {
  return [
    carve(ellipsoid(FACE.mouth.center, FACE.mouth.radii, CUT), 0.004),
    ...bothSides((side) => [carve(cone(sided([0.012, -0.1665, 0.11], side), sided(FACE.mouthCorner, side), 0.011, 0.0065, CUT), 0.006)]),
  ];
}
