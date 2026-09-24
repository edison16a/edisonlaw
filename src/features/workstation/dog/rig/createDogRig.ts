import { Bone, Euler, Group, Matrix4, Quaternion, Vector3 } from 'three';
import { headBoneMatrix, headCrown } from '../anatomy/coat';
import { EAR } from '../anatomy/ear';
import { FACE } from '../anatomy/head';
import { TAIL_PATH } from '../anatomy/tail';
import { JOINTS } from '../dimensions';

/**
 * The dog's bones. The coat is skinned to them; eyes, nose, ears and tongue ride on them.
 * The head hangs from the root rather than the spine, so when the body leans or breathes the head
 * stays under Edison's hand and the neck gives instead.
 */
export interface DogRig {
  root: Bone;
  /** Torso, pivoting on the floor under its middle so a lean keeps the paws planted. */
  body: Bone;
  /** Rib cage, scaled to breathe. */
  chest: Bone;
  /** Root to tip. */
  tail: Bone[];
  /** Pivots on the crown contact point. */
  head: Bone;
  /** Head space origin in the head bone's space: face parts go under a group moved by this. */
  headOrigin: Vector3;
  jaw: Bone;
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
export const BONE = { root: 0, body: 1, chest: 2, head: 3, jaw: 4, tail: 5 } as const;
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
  const body = bone('dogBody');
  const chest = bone('dogChest', JOINTS.chest);
  root.add(body);
  body.add(chest);

  // Tail joints along its centre line; the last point is the tip and needs no bone.
  const tail: Bone[] = [];
  let parent: Bone = body;
  let from: readonly number[] = [0, 0, 0];
  for (let i = 0; i < TAIL_BONES; i++) {
    const joint = bone(`dogTail${i}`, offset(from, TAIL_PATH[i]));
    parent.add(joint);
    tail.push(joint);
    parent = joint;
    from = TAIL_PATH[i];
  }

  // The head bone sits on the crown contact; everything on the head is placed relative to the crown.
  const head = bone('dogHead');
  headBoneMatrix().decompose(head.position, head.quaternion, head.scale);
  root.add(head);
  const crown = headCrown();
  const jaw = bone('dogJaw', offset(crown.toArray(), FACE.jawHinge));
  head.add(jaw);

  const ears = ([1, -1] as const).map((side) => {
    const ear = bone(side === 1 ? 'dogEarLeft' : 'dogEarRight', offset(crown.toArray(), [EAR.root[0] * side, EAR.root[1], EAR.root[2]]));
    ear.quaternion.copy(earRestRotation(side));
    head.add(ear);
    return ear;
  }) as [Bone, Bone];

  const eyes: [Group, Group] = [new Group(), new Group()];
  eyes[0].name = 'dogEyeLeft';
  eyes[1].name = 'dogEyeRight';

  const bones = [root, body, chest, head, jaw, ...tail];
  // The root has no parent yet, so world matrices are in dog space: exactly the bind pose.
  root.updateMatrixWorld(true);
  const restInverses = bones.map((b) => b.matrixWorld.clone().invert());
  const rest = { ears: [ears[0].quaternion.clone(), ears[1].quaternion.clone()] as [Quaternion, Quaternion] };
  return { root, body, chest, tail, head, headOrigin: crown.negate(), jaw, ears, eyes, bones, restInverses, rest };
}

/** Resting hang of an ear in head space. Mirrored for the right ear. */
export function earRestRotation(side: 1 | -1, out = new Quaternion()) {
  const [x, y, z] = EAR.rest;
  // Mirroring across X flips the sense of rotations about Y and Z.
  return out.setFromEuler(new Euler(x, y * side, z * side, 'YXZ'));
}
