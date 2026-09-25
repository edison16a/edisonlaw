import { Matrix4, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { BONE, COAT_BOUNDS, createDogRig, TAIL_BONES } from '../rig/createDogRig';
import { hindLegs } from '../anatomy/legs';
import { PART_COUNT } from '../dimensions';
import { applyDogPose, createDogPose, dogPose } from '../rig/dogPose';
import { Field } from '../sdf/field';
import { buildCoatData } from './sittingCoat';
import { buildDogData } from './dogData';

/** Edges not shared by exactly one triangle each way: holes, and pinches where two sheets touch. */
function openEdges(indices: ArrayLike<number>) {
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

describe('buildCoatData', () => {
  // A coarse grid keeps the test quick; the painting and skinning rules are the same at any size.
  const data = buildCoatData(0.012);
  const count = data.positions.length / 3;

  it('gives every vertex bone weights that add up to one', () => {
    const boneCount = BONE.tail + TAIL_BONES;
    for (let n = 0; n < count; n++) {
      let total = 0;
      for (let slot = 0; slot < 4; slot++) {
        total += data.skinWeights[n * 4 + slot];
        expect(data.skinIndices[n * 4 + slot]).toBeLessThan(boneCount);
      }
      expect(total).toBeCloseTo(1, 5);
    }
  });

  it('plants the paws on the root and hands the head to the head bone', () => {
    let lowest = 0;
    let highest = 0;
    for (let n = 1; n < count; n++) {
      if (data.positions[n * 3 + 1] < data.positions[lowest * 3 + 1]) lowest = n;
      if (data.positions[n * 3 + 1] > data.positions[highest * 3 + 1]) highest = n;
    }
    expect(data.skinIndices[lowest * 4]).toBe(BONE.root);
    expect(data.skinIndices[highest * 4]).toBe(BONE.head);
  });

  it('paints colours within range', () => {
    for (const value of data.colors) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });
});

describe('the built dog', () => {
  // Full detail, as the page builds it: slow, but the only way to catch a pinch in the real sculpture.
  const data = buildDogData();

  it('meshes the coat and every part as closed surfaces, with no holes or pinches', () => {
    expect(data.coat.positions.length / 3).toBeGreaterThan(20000);
    for (const part of [data.coat, data.ear, data.nose]) expect(openEdges(part.indices)).toBe(0);
  }, 60000);

  /** Calls `visit` with every `stride`th coat vertex, skinned to the idle pose at each of `times`. */
  function throughIdle(times: number[], stride: number, visit: (posed: Vector3, index: number) => void) {
    const { coat } = data;
    const rig = createDogRig();
    const pose = createDogPose();
    const skin = rig.bones.map(() => new Matrix4());
    const rest = new Vector3();
    const posed = new Vector3();
    const part = new Vector3();
    for (const t of times) {
      applyDogPose(rig, dogPose(t, 1, 53, pose));
      rig.root.updateMatrixWorld(true);
      rig.bones.forEach((bone, index) => skin[index].multiplyMatrices(bone.matrixWorld, rig.restInverses[index]));
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
  }

  const idle = Array.from({ length: 80 }, (_, i) => i * 0.5);

  it('stays inside its culling bounds through the whole idle', () => {
    throughIdle(idle, 5, (posed) => expect(posed.distanceTo(COAT_BOUNDS.center)).toBeLessThan(COAT_BOUNDS.radius - 0.02));
  }, 60000);

  it('sweeps its tail along the floor and clear of its haunch', () => {
    const { coat } = data;
    const legs = new Field(hindLegs(), PART_COUNT);
    // The part of the tail lying on the floor, from its third joint on.
    const onFloor = (n: number) => coat.skinIndices[n * 4] >= BONE.tail + 2;
    let checked = 0;
    throughIdle(idle, 1, (posed, n) => {
      if (!onFloor(n)) return;
      checked++;
      expect(posed.y).toBeGreaterThan(-0.004);
      expect(legs.distance(posed.x, posed.y, posed.z)).toBeGreaterThan(0.01);
    });
    expect(checked / idle.length).toBeGreaterThan(500);
  }, 60000);
});
