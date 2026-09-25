import { Matrix4, Quaternion, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { PART_COUNT } from '../dimensions';
import { Field } from '../sdf/field';
import { EYE_RADII, faceLayout } from './face';
import { headForms } from './head';

describe('faceLayout', () => {
  const face = faceLayout();
  const head = new Field(headForms(), PART_COUNT);

  it('lays the line of each shut eye on the skull, just clear of it', () => {
    face.creases.forEach((line, index) => {
      const { position, quaternion } = face.eyes[index];
      const eyeToHead = new Matrix4().compose(new Vector3(...position), new Quaternion(...quaternion), new Vector3(1, 1, 1));
      for (const point of line) {
        const p = new Vector3(...point).applyMatrix4(eyeToHead);
        const distance = head.distance(p.x, p.y, p.z);
        expect(distance).toBeGreaterThan(0);
        expect(distance).toBeLessThan(0.0015);
      }
    });
  });

  it('draws each shut eye as a crescent across the eye, sagging below its middle', () => {
    for (const line of face.creases) {
      const [first, middle, last] = [line[0], line[(line.length - 1) / 2], line[line.length - 1]];
      expect(Math.abs(last[0] - first[0])).toBeGreaterThan(EYE_RADII[0] * 2);
      expect(middle[1]).toBeLessThan(0);
      expect(middle[1]).toBeLessThan(Math.min(first[1], last[1]));
    }
  });

  it('closes both eyes alike, mirrored across the face', () => {
    const [left, right] = face.creases;
    left.forEach(([x, y, z], i) => {
      const [mx, my, mz] = right[right.length - 1 - i];
      expect(mx).toBeCloseTo(-x, 5);
      expect(my).toBeCloseTo(y, 5);
      expect(mz).toBeCloseTo(z, 5);
    });
  });
});
