import { CHAIR, type Vec3 } from '../layout';

/**
 * Where the character stands or sits in the room.
 * The character model faces +Z in its own space, so a rotation of PI turns it toward the desk.
 */
export interface Placement {
  position: Vec3;
  rotationY: number;
}

/** Origin of the seated pose is the point where the seat meets the pelvis. */
export const SEATED_PLACEMENT: Placement = {
  position: [CHAIR.position[0], CHAIR.seatHeight, CHAIR.position[2] + 0.02],
  rotationY: Math.PI,
};

/** Origin of the standing pose is the floor between the feet. */
export const STANDING_PLACEMENT: Placement = {
  position: [0.62, 0, 0.5],
  rotationY: Math.PI + 0.55,
};
