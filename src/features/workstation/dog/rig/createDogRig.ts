import { Sphere, Vector3, type Bone, type Quaternion } from 'three';
import { headBoneMatrix, headPivot } from '../anatomy/headPose';
import { TAIL_PATH } from '../anatomy/tail';
import { JOINTS } from '../dimensions';
import { bone, boneChain, groupPair, hangEars, offset, restInversesOf, type DogSkeleton } from './skeleton';

/**
 * The sitting dog's bones. The coat is skinned to them; eyes, nose, lips and ears ride on them.
 * The head hangs from the root rather than the spine, so when the body leans or breathes the head
 * stays under Edison's hand and the neck gives instead.
 */
export interface DogRig extends DogSkeleton {
  /** Upper body, pivoting between the hips, so it leans and rocks over the haunches with the paws planted. */
  body: Bone;
  /** Rib cage, scaled to breathe. */
  chest: Bone;
  /** Root to tip. Each turns about the upright, so the tail sweeps across the floor. */
  tail: Bone[];
  /** Resting rotations of the ears, which the pose offsets. */
  rest: { ears: [Quaternion, Quaternion] };
}

/** Skin indices of the bones, matching `DogRig.bones`. */
export const BONE = { root: 0, body: 1, chest: 2, head: 3, tail: 4 } as const;
export const TAIL_BONES = TAIL_PATH.length - 1;

/**
 * Loose bounds of the posed coat in dog space, for culling, so three never skins every vertex on the CPU
 * to measure the pose. Wide enough for the nose, the plume swept across the floor and the head lifted to
 * look up, with room to spare, so the dog is never culled while any of it is on screen.
 */
export const COAT_BOUNDS = new Sphere(new Vector3(0.04, 0.36, 0), 0.62);

export function createDogRig(): DogRig {
  const root = bone('dogRoot');
  const body = bone('dogBody', JOINTS.hips);
  const chest = bone('dogChest', offset(JOINTS.hips, JOINTS.chest));
  root.add(body);
  body.add(chest);

  // The tail lies on the floor, so it hangs from the root and stays put when the body leans.
  const tail = boneChain(root, TAIL_PATH, 'dogTail');

  // The head bone sits on the pivot below the crown contact; everything on the head is placed from it.
  const head = bone('dogHead');
  headBoneMatrix().decompose(head.position, head.quaternion, head.scale);
  root.add(head);
  const pivot = headPivot();
  const ears = hangEars(head, pivot);

  const bones = [root, body, chest, head, ...tail];
  const restInverses = restInversesOf(root, bones);
  const rest = { ears: [ears[0].quaternion.clone(), ears[1].quaternion.clone()] as [Quaternion, Quaternion] };
  const eyes = groupPair('dogEyeLeft', 'dogEyeRight');
  return { root, body, chest, tail, head, headOrigin: pivot.negate(), ears, eyes, bones, restInverses, rest, coatBounds: COAT_BOUNDS };
}
