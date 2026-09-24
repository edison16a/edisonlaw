import { describe, expect, it } from 'vitest';
import { BONE, TAIL_BONES } from '../rig/createDogRig';
import { buildCoatData } from './coatGeometry';

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
