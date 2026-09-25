import type { Vec3 } from '../../layout';
import { BODY_RISE, JOINTS, PART, PART_COUNT, RIBS, TONE } from '../dimensions';
import { Field, type Shape } from '../sdf/field';
import { bodyFeathering, frill } from './bodyFur';
import { frontLegs, hindLegs } from './legs';
import { cone, ellipsoid } from './sculpt';

/**
 * The torso in dog space, sitting up: a deep rib cage held high and sloping up to the withers, the back
 * curving down over the loin to a round seat on the floor, the forechest pushed forward over straight
 * forelegs, and the belly tucked between folded haunches. Grown proportions, softened into clay.
 */

const body = (tone: number, blend: number) => ({ tone, blend, part: PART.body });

/** Up and forward for a form risen `angle` radians from level, front end up. */
function risen(angle: number): [up: Vec3, forward: Vec3] {
  return [
    [0, Math.cos(angle), -Math.sin(angle)],
    [0, Math.sin(angle), Math.cos(angle)],
  ];
}

function torso(): Shape[] {
  return [
    // Rib cage, sloping up from the loin to the withers.
    ellipsoid(JOINTS.chest, RIBS, body(TONE.coat, 0), ...risen(BODY_RISE)),
    // Loin, narrower, curving down from the ribs toward the seat.
    ellipsoid([0, 0.25, -0.1], [0.084, 0.08, 0.1], body(TONE.coat, 0.07), ...risen(1.05)),
    // The seat: pelvis and rump resting on the floor between the haunches.
    ellipsoid([0, 0.122, -0.168], [0.094, 0.11, 0.096], body(TONE.coat, 0.06), ...risen(1.3)),
    // Back line from the withers down over the loin to the croup.
    cone([0, 0.49, 0.06], [0, 0.25, -0.19], 0.05, 0.052, body(TONE.saddle, 0.06)),
    // Withers, the rise over the shoulder blades at the base of the neck.
    ellipsoid([0, 0.5, 0.075], [0.068, 0.046, 0.074], body(TONE.saddle, 0.05), ...risen(0.5)),
    // Forechest, the breast bone pushing forward between the shoulders.
    ellipsoid([0, 0.41, 0.16], [0.076, 0.098, 0.064], body(TONE.light, 0.06), ...risen(0.2)),
    // Brisket, the lowest line of the chest, between and behind the elbows.
    ellipsoid([0, 0.29, 0.112], [0.07, 0.045, 0.082], body(TONE.light, 0.05), ...risen(0.55)),
    // Belly, tucked up between the thighs.
    ellipsoid([0, 0.19, -0.02], [0.07, 0.066, 0.085], body(TONE.light, 0.05), ...risen(0.9)),
  ];
}

/** Big forms: torso and legs. */
export function bodyForms(): Shape[] {
  return [...torso(), ...frontLegs(), ...hindLegs()];
}

/** Fur details, added after every big form so broad blends never soften them. */
export function bodyFur(): Shape[] {
  return [...frill(), ...bodyFeathering(new Field(bodyForms(), PART_COUNT))];
}
