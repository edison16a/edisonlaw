import { describe, expect, it } from 'vitest';
import { cardPose, createPose, focusWeight, HELIX, helixLocal, helixPoint, tilt, type Point3 } from './geometry';

const point = (): Point3 => ({ x: 0, y: 0, z: 0 });
const length = (p: Point3) => Math.hypot(p.x, p.y, p.z);

describe('helix geometry', () => {
  it('keeps every strand point on the helix radius', () => {
    for (const u of [-2, -0.5, 0, 0.25, 3, 11.75]) {
      const p = helixLocal(u, 0, point());
      expect(Math.hypot(p.x, p.y)).toBeCloseTo(HELIX.radius, 6);
      expect(p.z).toBeCloseTo(-HELIX.depth - u * HELIX.pitch, 6);
    }
  });

  it('offsets the partner strand by the groove angle', () => {
    const a = helixLocal(1.3, 0, point());
    const b = helixLocal(1.3, 1, point());
    const angle = Math.atan2(a.x * b.y - a.y * b.x, a.x * b.x + a.y * b.y);
    expect(angle).toBeCloseTo(HELIX.groove, 6);
    expect(b.z).toBeCloseTo(a.z, 6);
  });

  it('tilts without stretching', () => {
    const p = { x: 1.2, y: -0.7, z: -4 };
    const before = length(p);
    expect(length(tilt(p))).toBeCloseTo(before, 6);
  });

  it('moves upcoming cards away from the camera and past cards toward it', () => {
    expect(helixPoint(3, 0, point()).z).toBeLessThan(helixPoint(1, 0, point()).z);
    expect(helixPoint(-1, 0, point()).z).toBeGreaterThan(helixPoint(0, 0, point()).z);
  });
});

describe('card pose', () => {
  it('puts the focused card flat in the focus slot at full size', () => {
    const pose = cardPose(0, createPose());
    expect(pose.x).toBeCloseTo(0, 6);
    expect(pose.y).toBeCloseTo(0, 6);
    expect(pose.z).toBeCloseTo(0, 6);
    expect(pose.rotationX).toBeCloseTo(0, 6);
    expect(pose.rotationY).toBeCloseTo(0, 6);
    expect(pose.scale).toBe(1);
    expect(pose.focus).toBe(1);
  });

  it('puts cards a full step away on the strand at ring scale', () => {
    for (const offset of [-1, 1, 2.5]) {
      const pose = cardPose(offset, createPose());
      const strand = helixPoint(offset, 0, point());
      expect(pose.x).toBeCloseTo(strand.x, 6);
      expect(pose.y).toBeCloseTo(strand.y, 6);
      expect(pose.z).toBeCloseTo(strand.z, 6);
      expect(pose.scale).toBeCloseTo(HELIX.ringScale, 6);
      expect(pose.focus).toBe(0);
    }
  });

  it('eases focus symmetrically and monotonically', () => {
    expect(focusWeight(0.5)).toBeCloseTo(0.5, 6);
    expect(focusWeight(-0.3)).toBeCloseTo(focusWeight(0.3), 6);
    let previous = 1;
    for (let offset = 0.05; offset <= 1; offset += 0.05) {
      const weight = focusWeight(offset);
      expect(weight).toBeLessThanOrEqual(previous);
      previous = weight;
    }
  });
});
