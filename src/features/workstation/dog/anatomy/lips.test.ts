import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { PART_COUNT } from '../dimensions';
import { Field } from '../sdf/field';
import { headForms } from './head';
import { lipLine } from './lips';

describe('lipLine', () => {
  const line = lipLine().map((point) => new Vector3(...point));
  const head = new Field(headForms(), PART_COUNT);

  it('rides just clear of the head all along the mouth', () => {
    for (const point of line) {
      const distance = head.distance(point.x, point.y, point.z);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(0.003);
    }
  });

  it('runs unbroken from one corner of the mouth to the other, the same on both sides', () => {
    for (let i = 1; i < line.length; i++) expect(line[i].distanceTo(line[i - 1])).toBeLessThan(0.02);
    for (let i = 0; i < line.length; i++) {
      const mirror = line[line.length - 1 - i];
      expect(line[i].x).toBeCloseTo(-mirror.x, 9);
      expect(line[i].y).toBeCloseTo(mirror.y, 9);
      expect(line[i].z).toBeCloseTo(mirror.z, 9);
    }
    // It passes under the nose in the middle, and lifts toward the corners in a smile.
    const middle = line[(line.length - 1) / 2];
    expect(middle.x).toBeCloseTo(0, 9);
    expect(line[0].y).toBeGreaterThan(middle.y);
  });
});
