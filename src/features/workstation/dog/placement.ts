import { Vector3 } from 'three';
import { DOG_PAT_POINT, type Vec3 } from '../layout';
import { HEAD } from './dimensions';

/**
 * Where the dog stands in the about scene. Its origin is on the floor under the middle of its body,
 * and it faces +Z in its own space.
 */
export interface DogPlacement {
  position: Vec3;
  rotationY: number;
}

/**
 * Facing the desk alongside Edison, on his left, the side the about camera sees, turned a little further
 * toward the left monitors than he is, so the camera sees its whole length side on. Its head turns back
 * toward the camera, and the position follows from the contract: the crown lands exactly on
 * DOG_PAT_POINT, under his hand.
 */
const ROTATION_Y = Math.PI + 0.36;

const crown = new Vector3(...HEAD.top).applyAxisAngle(new Vector3(0, 1, 0), ROTATION_Y);

export const DOG_PLACEMENT: DogPlacement = {
  position: [DOG_PAT_POINT[0] - crown.x, 0, DOG_PAT_POINT[2] - crown.z],
  rotationY: ROTATION_Y,
};
