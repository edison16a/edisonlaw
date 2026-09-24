import type { Vec3 } from '../../layout';
import { PART, TONE } from '../dimensions';
import type { Shape } from '../sdf/field';
import { bothSides, cone, ellipsoid, flatLock, sided } from './sculpt';

/**
 * The head in head space: origin near the crown where Edison's hand rests, +Z toward the nose, +Y up,
 * +X the dog's left. A broad, gently domed skull, a soft stop between the brows, a long deep muzzle,
 * and a closed mouth: full upper lips draping over a lower jaw set back beneath them, meeting in a
 * soft crease that lifts into a smile at the corners.
 */

const head = (tone: number, blend: number) => ({ tone, blend, part: PART.head });

/** Landmarks the face parts are built on, in head space. */
export const FACE = {
  /** Centre the eyes and nose are aimed from when finding the surface. */
  core: [0, -0.07, 0.02] as Vec3,
  /** Direction from the core to the left eye. */
  eye: [0.55, 0.36, 0.75] as Vec3,
  /** Direction from the core to the tip of the nose, straight ahead. */
  nose: [0, 0.02, 1] as Vec3,
  /** Middle of the lower jaw, and its half sizes. The lip line runs where the upper lips meet it. */
  chin: { center: [0, -0.123, 0.09] as Vec3, radii: [0.023, 0.012, 0.048] as Vec3 },
  /** Where the left ear hangs from, on the side of the skull above and behind the eye. */
  earRoot: [0.055, -0.026, -0.018] as Vec3,
  /** Back of the skull, where the neck joins. */
  nape: [0, -0.095, -0.068] as Vec3,
  /** Under the back of the jaw, where the throat joins. */
  throat: [0, -0.122, -0.004] as Vec3,
} as const;

function skull(): Shape[] {
  return [
    // Melts into the neck, which comes before it in the coat.
    ellipsoid([0, -0.05, -0.005], [0.064, 0.054, 0.066], head(TONE.coat, 0.03)),
    // Broad, gently domed forehead over the eyes.
    ellipsoid([0, -0.042, 0.03], [0.052, 0.04, 0.045], head(TONE.coat, 0.03)),
    // Soft brows that give the eyes their kind, thoughtful look.
    ...bothSides((side) => [ellipsoid(sided([0.027, -0.044, 0.06], side), [0.021, 0.013, 0.018], head(TONE.coat, 0.014))]),
    // Cheeks, full but flat enough for the ears to hang close.
    ...bothSides((side) => [ellipsoid(sided([0.043, -0.088, 0.03], side), [0.034, 0.036, 0.044], head(TONE.light, 0.03))]),
    // Throat under the jaw, filling into the neck.
    ellipsoid([0, -0.112, -0.005], [0.044, 0.034, 0.048], head(TONE.light, 0.03)),
  ];
}

/** The upper lips: the underside of the muzzle and the lips draping at its sides. */
export function upperLips(): Shape[] {
  return [
    ellipsoid([0, -0.086, 0.108], [0.035, 0.03, 0.062], head(TONE.light, 0.03)),
    ...bothSides((side) => [ellipsoid(sided([0.021, -0.103, 0.11], side), [0.024, 0.018, 0.05], head(TONE.light, 0.012))]),
  ];
}

/**
 * The lower jaw: its root grows softly out of the throat and cheeks, and the chin in front meets the
 * upper lips with only a hair of blend, so the line of the mouth stays a crease.
 */
export function lowerJaw(): Shape[] {
  return [
    ellipsoid([0, -0.128, 0.05], [0.03, 0.016, 0.032], head(TONE.light, 0.02)),
    ellipsoid(FACE.chin.center, FACE.chin.radii, head(TONE.light + 0.06, 0.004)),
  ];
}

function muzzle(): Shape[] {
  const [muzzleBody, ...lips] = upperLips();
  return [
    muzzleBody,
    // Bridge of the nose, running level from the stop to the nose leather.
    cone([0, -0.071, 0.064], [0, -0.076, 0.152], 0.027, 0.023, head(TONE.light - 0.08, 0.025)),
    ...lips,
  ];
}

/** Skull, muzzle and lower jaw, in head space. */
export function headForms(): Shape[] {
  return [...skull(), ...muzzle(), ...lowerJaw()];
}

/** Soft locks falling from the back of the skull over the nape, so the head flows into the neck. */
function napeFur(): Shape[] {
  return [-0.036, 0, 0.036].flatMap((x) =>
    flatLock({
      path: [
        [x, -0.03, -0.068],
        [x * 1.1, -0.07, -0.084],
        [x * 1.15, -0.108, -0.08],
      ],
      width: 0.026,
      flatness: 0.42,
      facing: [x * 8, 0.2, -1],
      tones: [TONE.coat, TONE.coat + 0.1],
      blend: 0.018,
      part: PART.head,
      segments: 5,
    }),
  );
}

/** Fur tufts on the head, in head space. */
export function headFur(): Shape[] {
  return napeFur();
}
