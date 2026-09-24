import { CHAIR, type Vec3 } from '../layout';

/**
 * Where the character stands or sits in the room.
 * The character model faces +Z in its own space, so a rotation of PI turns it toward the desk.
 */
export interface Placement {
  position: Vec3;
  rotationY: number;
}

/**
 * Origin of the seated pose is the point where the seat meets the pelvis.
 * He sits a little forward of the chair centre so his short arms reach the keyboard with soft elbows.
 */
export const SEATED_PLACEMENT: Placement = {
  position: [CHAIR.position[0], CHAIR.seatHeight, CHAIR.position[2] - 0.08],
  rotationY: Math.PI,
};

/**
 * Origin of the standing pose is the floor between the feet. In front of the middle of the desk,
 * a step back from its edge, turned a little toward the left monitors and the about camera.
 */
export const STANDING_PLACEMENT: Placement = {
  position: [0.3, 0, 0.42],
  rotationY: Math.PI + 0.15,
};

/**
 * Room space points under the middle of each sneaker while seated. His legs are too short to reach the
 * floor from a standard seat, so his feet rest flat on an under-desk footrest whose top is at this height.
 */
export const SEATED_FOOT_REST: { left: Vec3; right: Vec3 } = {
  left: [CHAIR.position[0] - 0.1, 0.2, CHAIR.position[2] - 0.33],
  right: [CHAIR.position[0] + 0.1, 0.2, CHAIR.position[2] - 0.33],
};
