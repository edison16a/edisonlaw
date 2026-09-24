import type { Vec3 } from '../layout';

/**
 * Where the dog stands in the about scene. Its origin is on the floor under the middle of its body.
 * It stands on Edison's left, the side the about camera sees, with its head under his hand
 * at DOG_PAT_POINT (see layout.ts).
 */
export interface DogPlacement {
  position: Vec3;
  rotationY: number;
}

export const DOG_PLACEMENT: DogPlacement = {
  position: [0.7, 0, 0.78],
  rotationY: Math.PI,
};
