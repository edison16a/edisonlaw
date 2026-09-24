import { describe, expect, it } from 'vitest';
import { cardPose, createPose, FOCUS, focusWeight, isPastDeck, slotOffset, SPIRAL } from './geometry';

describe('slotOffset', () => {
  it('measures the distance from the index in cards', () => {
    expect(slotOffset(3, 1, 24)).toBe(2);
    expect(slotOffset(1, 3.5, 24)).toBe(-2.5);
  });

  it('wraps around the strand so it has no ends', () => {
    expect(slotOffset(23, 0, 24)).toBe(-1);
    expect(slotOffset(0, 23, 24)).toBe(1);
    for (const index of [-0.5, 0, 4.25, 11.5, 30]) {
      for (let slot = 0; slot < 24; slot++) {
        const offset = slotOffset(slot, index, 24);
        expect(offset).toBeGreaterThanOrEqual(-12);
        expect(offset).toBeLessThan(12);
      }
    }
  });
});

describe('isPastDeck', () => {
  it('marks the wrapped card beside the first project in the opening frame', () => {
    expect(isPastDeck(23, -0.5, 12)).toBe(true);
    expect(isPastDeck(0, -0.5, 12)).toBe(false);
  });

  it('marks the cards waiting after the last project', () => {
    expect(isPastDeck(12, 11, 12)).toBe(true);
    expect(isPastDeck(11, 11, 12)).toBe(false);
  });

  it('leaves the whole deck alone in the middle', () => {
    for (let slot = 0; slot < 12; slot++) expect(isPastDeck(slot, 5, 12)).toBe(false);
  });
});

describe('cardPose', () => {
  it('puts the card in the slot straight in front of the camera', () => {
    const pose = cardPose(0, 0, 0, createPose());
    expect(pose.x).toBeCloseTo(0, 6);
    expect(pose.z).toBeCloseTo(SPIRAL.radius, 6);
    expect(pose.y).toBeCloseTo(SPIRAL.focusHeight, 6);
    expect(pose.rotationY).toBeCloseTo(0, 6);
    expect(pose.facing).toBeCloseTo(1, 6);
    expect(pose.scale).toBe(1);
  });

  it('keeps every card on the radius, facing out from the axis', () => {
    for (const offset of [-3, -1.2, 0.5, 2, 5.5]) {
      const pose = cardPose(offset, 0, 0, createPose());
      expect(Math.hypot(pose.x, pose.z)).toBeCloseTo(SPIRAL.radius, 6);
      const normalX = Math.sin(pose.rotationY);
      const normalZ = Math.cos(pose.rotationY);
      expect(normalX * pose.x + normalZ * pose.z).toBeCloseTo(SPIRAL.radius, 6);
    }
  });

  it('waits upcoming cards above on the left and sinks passed cards to the right', () => {
    const next = cardPose(1, 0, 0, createPose());
    const previous = cardPose(-1, 0, 0, createPose());
    expect(next.x).toBeLessThan(0);
    expect(next.y).toBeGreaterThan(SPIRAL.focusHeight);
    expect(previous.x).toBeGreaterThan(0);
    expect(previous.y).toBeLessThan(SPIRAL.focusHeight);
  });

  it('turns cards away from the camera on the far side', () => {
    expect(cardPose(Math.PI / 2 / SPIRAL.step, 0, 0, createPose()).facing).toBeCloseTo(0, 6);
    expect(cardPose(4, 0, 0, createPose()).facing).toBeLessThan(0);
  });

  it('lifts and grows the settled card and leaves the rest alone', () => {
    const settled = cardPose(0, 1, 0, createPose());
    expect(settled.z).toBeCloseTo(SPIRAL.radius + FOCUS.lift, 6);
    expect(settled.scale).toBeCloseTo(FOCUS.scale, 6);
    expect(settled.focus).toBe(1);
    const neighbour = cardPose(1, 1, 0, createPose());
    expect(neighbour.scale).toBe(1);
    expect(neighbour.focus).toBe(0);
  });

  it('tucks the strand down and in while hidden', () => {
    const hidden = cardPose(0, 0, 1, createPose());
    expect(hidden.z).toBeCloseTo(SPIRAL.radius / 2, 6);
    expect(hidden.y).toBeLessThan(SPIRAL.focusHeight - 1);
  });
});

describe('focusWeight', () => {
  it('eases symmetrically and monotonically to zero at the reach', () => {
    expect(focusWeight(0)).toBe(1);
    expect(focusWeight(-0.2)).toBeCloseTo(focusWeight(0.2), 6);
    expect(focusWeight(FOCUS.reach)).toBe(0);
    let previous = 1;
    for (let offset = 0.05; offset <= 1; offset += 0.05) {
      expect(focusWeight(offset)).toBeLessThanOrEqual(previous);
      previous = focusWeight(offset);
    }
  });
});
