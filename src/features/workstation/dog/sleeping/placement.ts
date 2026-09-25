import { DOG_NAP } from '../../layout';
import type { ShadowLayout } from '../parts/Shadow';
import type { DogPlacement } from '../placement';
import { HEAD_REST } from './dimensions';
import { TAIL_PATH } from './tail';

/**
 * Where the dog sleeps in the work scene (see DOG_NAP in layout.ts). It lies in the violet spill of the
 * PC tower, which has red and blue in it but hardly any green, so a golden coat gives back mostly red
 * there and reads salmon pink, its rump magenta. Its coat is balanced against that light, a little less
 * red and blue, with a faint warm fill of its own, so it reads warm gold like the dog sitting at Edison's
 * side in the about scene, still shaded by the room.
 */
export const SLEEPING_PLACEMENT: DogPlacement = {
  position: DOG_NAP.position,
  rotationY: DOG_NAP.rotationY,
  coatLight: { balance: [0.82, 1, 0.72], fill: [0.04, 0.036, 0.028] },
};

/**
 * The sleeping dog's contact shadow: a wide pool under the curl, a darker core where it lies heaviest, a
 * soft touch under the head and a faint trail under the tail, broad enough to cover its swish.
 */
export const SLEEPING_SHADOW: ShadowLayout = {
  area: { right: -0.36, left: 0.36, back: -0.34, front: 0.46 },
  spots: [
    { x: 0, z: -0.01, rx: 0.3, rz: 0.29, alpha: 0.42 },
    { x: 0.01, z: -0.02, rx: 0.2, rz: 0.18, alpha: 0.35 },
    { x: HEAD_REST.at[0] + 0.02, z: HEAD_REST.at[1] + 0.12, rx: 0.08, rz: 0.13, alpha: 0.35 },
    ...TAIL_PATH.slice(2).map(([x, , z]) => ({ x, z, rx: 0.05, rz: 0.05, alpha: 0.2 })),
  ],
};
