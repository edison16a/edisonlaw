import type { Vec3 } from '../../layout';
import { PART, TONE } from '../dimensions';
import type { Shape } from '../sdf/field';
import { bothSides, ellipsoid, flatLock } from './sculpt';

/** Fur on the sitting body in dog space: the cream bib, the foreleg fringes and the britches. */

const lock = (path: Vec3[], width: number, flatness: number, facing: Vec3, blend: number, tones: [number, number] = [TONE.light, TONE.cream]) =>
  flatLock({ path, width, flatness, facing, tones, blend, part: PART.body, segments: 5 });

/**
 * The cream frill down the front of the chest, which faces forward and up while it sits: a soft bib over
 * the breast bone that hangs a little below the brisket between the forelegs, with broad locks lying
 * down it. Every lock ends on the bib, since a thin tip hanging free reads as a drip rather than as fur.
 */
export function frill(): Shape[] {
  // Thick enough, and melted in softly enough, that their edges never form a crease down the chest.
  const locks = [-0.04, -0.014, 0.014, 0.04].flatMap((x) =>
    flatLock({
      path: [
        [x, 0.5, 0.18],
        [x * 1.12, 0.41, 0.222],
        [x * 1.05, 0.31, 0.21],
      ],
      width: 0.03,
      flatness: 0.46,
      facing: [x * 7, 0.2, 1],
      tones: [TONE.light + 0.14, TONE.cream + 0.04],
      blend: 0.036,
      part: PART.body,
      segments: 7,
    }),
  );
  return [ellipsoid([0, 0.39, 0.183], [0.07, 0.11, 0.044], { tone: TONE.cream - 0.06, blend: 0.045, part: PART.body }), ...locks];
}

/** Feathering: long cream fur down the backs of the forelegs and the britches on the haunches. */
function feathering(side: 1 | -1): Shape[] {
  return [
    // A fringe down the back of each foreleg, from the elbow to a rounded tip above the wrist.
    ...lock(
      [
        [0.07 * side, 0.27, 0.106],
        [0.07 * side, 0.2, 0.11],
        [0.068 * side, 0.14, 0.124],
      ],
      0.021,
      0.5,
      [side * 0.3, 0, -1],
      0.014,
    ),
    // Britches: soft lighter fur down the backs of the haunches, spreading onto the floor behind the seat.
    ...lock(
      [
        [0.088 * side, 0.18, -0.2],
        [0.098 * side, 0.115, -0.224],
        [0.098 * side, 0.06, -0.214],
      ],
      0.036,
      0.42,
      [side * 0.6, 0.1, -1],
      0.032,
      [TONE.coat + 0.12, TONE.light + 0.2],
    ),
  ];
}

export const bodyFeathering = () => bothSides(feathering);
