import { Euler, Matrix4, Quaternion, Sphere, Vector3, type Bone } from 'three';
import { bone, boneChain, groupPair, hangEars, restInversesOf, type DogSkeleton } from '../rig/skeleton';
import { SLEEPING_NECK } from './coat';
import { curlFrame, HEAD_REST, JOINTS, RIBS_ANGLE } from './dimensions';
import { headBoneMatrix } from './headPose';
import { TAIL_PATH } from './tail';

/**
 * The sleeping dog's bones. The body lies still on the root but for the rib cage, which breathes; the
 * head hangs from the root on its atlas and lifts by turning about the base of the neck, which gives
 * along its length; and the tail lies on the floor, each joint turning about the upright and lifting.
 */
export interface SleepingRig extends DogSkeleton {
  /** Rib cage, turned to its own axes so it can swell along them. */
  chest: Bone;
  /** Root to tip. */
  tail: Bone[];
  /** For each tail joint, the level axis square to the tail that lifts the rest of it off the floor. */
  tailLifts: Vector3[];
  lids: NonNullable<DogSkeleton['lids']>;
  shines: NonNullable<DogSkeleton['shines']>;
  /** Where the neck leaves the body, in dog space: lifting the head turns it about here. */
  neckBase: Vector3;
  /** Resting pose of the head bone and the ears, which the pose moves from. */
  rest: { headPosition: Vector3; headQuaternion: Quaternion; ears: [Quaternion, Quaternion] };
}

/** Skin indices of the bones, matching `SleepingRig.bones`. */
export const SLEEP_BONE = { root: 0, chest: 1, head: 2, tail: 3 } as const;
export const SLEEP_TAIL_BONES = TAIL_PATH.length - 1;

/**
 * Loose bounds of the posed coat in dog space, for culling: the whole curl, the head lifted to look up and
 * the tail swept out across the floor, with room to spare.
 */
export const SLEEPING_COAT_BOUNDS = new Sphere(new Vector3(0, 0.1, 0.07), 0.5);

export function createSleepingRig(): SleepingRig {
  const root = bone('dogRoot');
  const chest = bone('dogChest', JOINTS.chest);
  const { left, dorsal, forward } = curlFrame(RIBS_ANGLE);
  chest.quaternion.setFromRotationMatrix(new Matrix4().makeBasis(left, dorsal, forward));
  root.add(chest);

  const tail = boneChain(root, TAIL_PATH, 'dogTail');
  const up = new Vector3(0, 1, 0);
  const tailLifts = tail.map((_, i) =>
    new Vector3(...TAIL_PATH[i + 1]).sub(new Vector3(...TAIL_PATH[i])).setY(0).cross(up).normalize(),
  );

  const head = bone('dogHead');
  headBoneMatrix().decompose(head.position, head.quaternion, head.scale);
  root.add(head);
  const pivot = new Vector3(...HEAD_REST.atlas);
  const ears = hangEars(head, pivot);
  ears.forEach((ear, index) => {
    const side = index === 0 ? 1 : -1;
    const { out, turn, back } = HEAD_REST.ears[index];
    ear.quaternion.multiply(new Quaternion().setFromEuler(new Euler(back, -side * turn, side * out, 'YXZ')));
  });

  const bones = [root, chest, head, ...tail];
  const restInverses = restInversesOf(root, bones);
  return {
    root,
    chest,
    tail,
    tailLifts,
    head,
    headOrigin: pivot.negate(),
    ears,
    eyes: groupPair('dogEyeLeft', 'dogEyeRight'),
    lids: groupPair('dogLidLeft', 'dogLidRight'),
    shines: groupPair('dogShineLeft', 'dogShineRight'),
    bones,
    restInverses,
    coatBounds: SLEEPING_COAT_BOUNDS,
    neckBase: new Vector3(...SLEEPING_NECK.base),
    rest: {
      headPosition: head.position.clone(),
      headQuaternion: head.quaternion.clone(),
      ears: [ears[0].quaternion.clone(), ears[1].quaternion.clone()],
    },
  };
}
