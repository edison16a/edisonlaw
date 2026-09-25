import { Vector3 } from 'three';
import { DOG_PAT_POINT, type Vec3 } from '../layout';
import { HEAD } from './dimensions';

/**
 * Where the dog sits in the about scene. Its origin is on the floor under the middle of its seat, and
 * it faces +Z in its own space.
 */
export interface DogPlacement {
  position: Vec3;
  rotationY: number;
}

/**
 * Sitting at Edison's left side, the side the about camera sees, turned halfway between the desk and the
 * camera, so the camera sees its chest and its folded left haunch from a little in front of side on,
 * with its seat behind his left heel. Its head turns a little further toward the camera, and the
 * position follows from the contract: the crown lands exactly on DOG_PAT_POINT, under his hand.
 */
const ROTATION_Y = Math.PI + 0.95;

const crown = new Vector3(...HEAD.top).applyAxisAngle(new Vector3(0, 1, 0), ROTATION_Y);

export const DOG_PLACEMENT: DogPlacement = {
  position: [DOG_PAT_POINT[0] - crown.x, 0, DOG_PAT_POINT[2] - crown.z],
  rotationY: ROTATION_Y,
};
