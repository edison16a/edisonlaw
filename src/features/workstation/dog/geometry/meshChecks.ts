import { Matrix4, Vector3 } from 'three';
import type { DogSkeleton } from '../rig/skeleton';
import type { CoatData } from './coatGeometry';

/** Checks the dog's tests make on its built meshes. */

/** Edges not shared by exactly one triangle each way: holes, and pinches where two sheets touch. */
export function openEdges(indices: ArrayLike<number>) {
  const edges = new Map<string, number>();
  for (let t = 0; t < indices.length; t += 3) {
    for (let e = 0; e < 3; e++) {
      const key = `${indices[t + e]},${indices[t + ((e + 1) % 3)]}`;
      edges.set(key, (edges.get(key) ?? 0) + 1);
    }
  }
  let open = 0;
  for (const [key, count] of edges) {
    const [a, b] = key.split(',');
    if (count !== 1 || edges.get(`${b},${a}`) !== 1) open++;
  }
  return open;
}

/**
 * Calls `visit` with every `stride`th coat vertex skinned to the rig as it stands, in dog space, as the
 * GPU would draw it. Pose the rig first.
 */
export function skinCoat(coat: CoatData, rig: DogSkeleton, stride: number, visit: (posed: Vector3, index: number) => void) {
  rig.root.updateMatrixWorld(true);
  const skin = rig.bones.map((bone, index) => new Matrix4().multiplyMatrices(bone.matrixWorld, rig.restInverses[index]));
  const rest = new Vector3();
  const posed = new Vector3();
  const part = new Vector3();
  for (let n = 0; n < coat.positions.length / 3; n += stride) {
    rest.fromArray(coat.positions, n * 3);
    posed.set(0, 0, 0);
    for (let slot = 0; slot < 4; slot++) {
      const weight = coat.skinWeights[n * 4 + slot];
      if (weight > 0) posed.addScaledVector(part.copy(rest).applyMatrix4(skin[coat.skinIndices[n * 4 + slot]]), weight);
    }
    visit(posed, n);
  }
}
