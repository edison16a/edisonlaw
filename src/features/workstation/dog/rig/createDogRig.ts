import { Bone, Euler, Group, Matrix4, Quaternion, Vector3 } from 'three';
import { headBoneMatrix, headPivot } from '../anatomy/headPose';
import { EAR } from '../anatomy/ear';
import { TAIL_PATH } from '../anatomy/tail';
import { JOINTS } from '../dimensions';

/**
 * The dog's bones. The coat is skinned to them; eyes, nose, lips and ears ride on them.
 * The head hangs from the root rather than the spine, so when the body leans or breathes the head
 * stays under Edison's hand and the neck gives instead.
 */
export interface DogRig {
  root: Bone;
  /** Upper body, pivoting between the hips, so it leans and rocks over the haunches with the paws planted. */
  body: Bone;
  /** Rib cage, scaled to breathe. */
  chest: Bone;
  /** Root to tip. Each turns about the upright, so the tail sweeps across the floor. */
  tail: Bone[];
  /** Pivots in the middle of the crown's curve, so the crown stays under Edison's hand. */
  head: Bone;
  /** Head space origin in the head bone's space: face parts go under a group moved by this. */
  headOrigin: Vector3;
  /** Left then right. */
  ears: [Bone, Bone];
  /** Left then right. Scaled on Y to blink. */
  eyes: [Group, Group];
  /** Every skinned bone, in skin index order. */
  bones: Bone[];
  /** Inverse of each bone's resting matrix in dog space, in skin index order. */
  restInverses: Matrix4[];
  /** Resting rotations of the ears, which the pose offsets. */
  rest: { ears: [Quaternion, Quaternion] };
}

/** Skin indices of the bones, matching `DogRig.bones`. */
export const BONE = { root: 0, body: 1, chest: 2, head: 3, tail: 4 } as const;
export const TAIL_BONES = TAIL_PATH.length - 1;

function bone(name: string, position: readonly number[] = [0, 0, 0]) {
  const b = new Bone();
  b.name = name;
  b.position.fromArray(position);
  return b;
}

const offset = (from: readonly number[], to: readonly number[]) => to.map((value, i) => value - from[i]);

export function createDogRig(): DogRig {
  const root = bone('dogRoot');
  const body = bone('dogBody', JOINTS.hips);
  const chest = bone('dogChest', offset(JOINTS.hips, JOINTS.chest));
  root.add(body);
  body.add(chest);

  // Tail joints along its centre line; the last point is the tip and needs no bone. The tail lies on
  // the floor, so it hangs from the root and stays put when the body leans.
  const tail: Bone[] = [];
  let parent: Bone = root;
  let from: readonly number[] = [0, 0, 0];
  for (let i = 0; i < TAIL_BONES; i++) {
    const joint = bone(`dogTail${i}`, offset(from, TAIL_PATH[i]));
    parent.add(joint);
    tail.push(joint);
    parent = joint;
    from = TAIL_PATH[i];
  }

  // The head bone sits on the pivot below the crown contact; everything on the head is placed from it.
  const head = bone('dogHead');
  headBoneMatrix().decompose(head.position, head.quaternion, head.scale);
  root.add(head);
  const pivot = headPivot();

  const ears = ([1, -1] as const).map((side) => {
    const ear = bone(side === 1 ? 'dogEarLeft' : 'dogEarRight', offset(pivot.toArray(), [EAR.root[0] * side, EAR.root[1], EAR.root[2]]));
    ear.quaternion.copy(earRestRotation(side));
    head.add(ear);
    return ear;
  }) as [Bone, Bone];

  const eyes: [Group, Group] = [new Group(), new Group()];
  eyes[0].name = 'dogEyeLeft';
  eyes[1].name = 'dogEyeRight';

  const bones = [root, body, chest, head, ...tail];
  // The root has no parent yet, so world matrices are in dog space: exactly the bind pose.
  root.updateMatrixWorld(true);
  const restInverses = bones.map((b) => b.matrixWorld.clone().invert());
  const rest = { ears: [ears[0].quaternion.clone(), ears[1].quaternion.clone()] as [Quaternion, Quaternion] };
  return { root, body, chest, tail, head, headOrigin: pivot.negate(), ears, eyes, bones, restInverses, rest };
}

/** Resting hang of an ear in head space. Mirrored for the right ear. */
export function earRestRotation(side: 1 | -1, out = new Quaternion()) {
  const [x, y, z] = EAR.rest;
  // Mirroring across X flips the sense of rotations about Y and Z.
  return out.setFromEuler(new Euler(x, y * side, z * side, 'YXZ'));
}
