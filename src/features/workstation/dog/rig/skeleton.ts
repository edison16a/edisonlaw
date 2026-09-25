import { Bone, Euler, Group, Quaternion, type Matrix4, type Sphere, type Vector3 } from 'three';
import { EAR } from '../anatomy/ear';

/**
 * What every pose of the dog has on its rig, and what the parts it wears need: the skinned coat, and
 * the face parts and ears riding the head.
 */
export interface DogSkeleton {
  root: Bone;
  head: Bone;
  /** Head space origin in the head bone's space: face parts go under a group moved by this. */
  headOrigin: Vector3;
  /** Left then right. */
  ears: [Bone, Bone];
  /** Left then right, each seated on the skull by the face layout. */
  eyes: [Group, Group];
  /** Upper lids inside each eye, left then right, for a pose that closes its eyes (see parts/Lids). */
  lids?: [Group, Group];
  /** The catch lights of each eye, left then right, which a pose with lids hides as they close. */
  shines?: [Group, Group];
  /** The line each shut eye leaves on the face, left then right, which a pose with lids shows in place of the eye. */
  creases?: [Group, Group];
  /** Every skinned bone, in skin index order. */
  bones: Bone[];
  /** Inverse of each bone's resting matrix in dog space, in skin index order. */
  restInverses: Matrix4[];
  /** Loose bounds of the posed coat in dog space, for culling. */
  coatBounds: Sphere;
}

export function bone(name: string, position: readonly number[] = [0, 0, 0]) {
  const b = new Bone();
  b.name = name;
  b.position.fromArray(position);
  return b;
}

export const offset = (from: readonly number[], to: readonly number[]) => to.map((value, i) => value - from[i]);

/** Resting hang of an ear in head space. Mirrored for the right ear. */
export function earRestRotation(side: 1 | -1, out = new Quaternion()) {
  const [x, y, z] = EAR.rest;
  // Mirroring across X flips the sense of rotations about Y and Z.
  return out.setFromEuler(new Euler(x, y * side, z * side, 'YXZ'));
}

/** Both ears, hung on the head bone from their roots. `pivot` is where the head bone sits, in head space. */
export function hangEars(head: Bone, pivot: Vector3): [Bone, Bone] {
  return ([1, -1] as const).map((side) => {
    const ear = bone(side === 1 ? 'dogEarLeft' : 'dogEarRight', offset(pivot.toArray(), [EAR.root[0] * side, EAR.root[1], EAR.root[2]]));
    ear.quaternion.copy(earRestRotation(side));
    head.add(ear);
    return ear;
  }) as [Bone, Bone];
}

/** A named pair of groups, left then right. */
export function groupPair(left: string, right: string): [Group, Group] {
  const pair: [Group, Group] = [new Group(), new Group()];
  pair[0].name = left;
  pair[1].name = right;
  return pair;
}

/**
 * A chain of joints along a centre line in dog space, hung from `parent`, which sits at the dog space
 * origin: one joint per point but the last, which is the tip. Each is placed from the one before, so the
 * chain rests exactly on the line.
 */
export function boneChain(parent: Bone, path: readonly (readonly number[])[], name: string) {
  const chain: Bone[] = [];
  let from: readonly number[] = [0, 0, 0];
  let current = parent;
  for (let i = 0; i < path.length - 1; i++) {
    const joint = bone(`${name}${i}`, offset(from, path[i]));
    current.add(joint);
    chain.push(joint);
    current = joint;
    from = path[i];
  }
  return chain;
}

/** Binds the rig: with the root not yet in a scene, world matrices are in dog space, exactly the bind pose. */
export function restInversesOf(root: Bone, bones: Bone[]) {
  root.updateMatrixWorld(true);
  return bones.map((b) => b.matrixWorld.clone().invert());
}
