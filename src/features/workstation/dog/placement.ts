import { Vector3 } from 'three';
import { DOG_PAT_POINT, type Vec3 } from '../layout';
import { TAIL_PATH } from './anatomy/tail';
import { HEAD, PAWS } from './dimensions';
import type { CoatLight } from './materials';
import type { ShadowLayout } from './parts/Shadow';

/**
 * Where the dog sits in the about scene. Its origin is on the floor under the middle of its seat, and
 * it faces +Z in its own space.
 */
export interface DogPlacement {
  position: Vec3;
  rotationY: number;
  /** Keeps the coat golden under coloured light where the dog lies. Without it the coat is lit as painted. */
  coatLight?: CoatLight;
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

/**
 * The sitting dog's contact shadow: a wide pool under the seat and haunches, a darker touch under each
 * paw and hock, and a faint trail under the tail, broad enough to cover its sweep.
 */
export const DOG_SHADOW: ShadowLayout = {
  area: { right: -0.2, left: 0.34, back: -0.42, front: 0.26 },
  spots: [
    { x: 0, z: -0.06, rx: 0.17, rz: 0.22, alpha: 0.46 },
    ...TAIL_PATH.slice(2).map(([x, , z]) => ({ x, z, rx: 0.05, rz: 0.05, alpha: 0.2 })),
    ...[1, -1].flatMap((side) => [
      ...[PAWS.front, PAWS.rear].map(([x, z]) => ({ x: x * side, z, rx: 0.05, rz: 0.058, alpha: 0.5 })),
      { x: PAWS.hock[0] * side, z: PAWS.hock[1], rx: 0.045, rz: 0.06, alpha: 0.4 },
    ]),
  ],
};
