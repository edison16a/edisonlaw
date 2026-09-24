import { PerspectiveCamera, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { CLEARANCE, focusCardRect, shiftForPanel } from './anchor';
import { cardBend } from './appearance';
import { bendCardPoint } from './cardHit';
import { cardPose, createPose, SPIRAL, sweepOffset } from './geometry';
import { CAMERA, frameCamera } from './lens';

/**
 * Pushes points on the card, from 0 to 1 across and up, through a real
 * three.js camera framed the way the canvas frames it, with the vertex shader's bend and sweep.
 */
function projectWithThree(width: number, height: number, shift: number, lift: number) {
  const camera = new PerspectiveCamera(CAMERA.fov, width / height, 0.1, 40);
  camera.position.set(0, 0, CAMERA.z);
  frameCamera(camera, width, height, shift, lift);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();

  const pose = cardPose(0, 1, 0, createPose());
  const curvature = cardBend(0, pose.focus) / SPIRAL.radius;
  return (u: number, v: number) => {
    const local = bendCardPoint(u, v, curvature, 0, new Vector3());
    const world = local.multiplyScalar(pose.scale).add(new Vector3(pose.x, pose.y, pose.z));
    const view = world.clone().applyMatrix4(camera.matrixWorldInverse);
    view.x += sweepOffset(world.y, pose.y, pose.focus);
    const clip = view.applyMatrix4(camera.projectionMatrix);
    return { x: ((clip.x + 1) / 2) * width, y: ((1 - clip.y) / 2) * height };
  };
}

describe('focusCardRect', () => {
  it('matches what a three.js camera draws, on wide and tall stages', () => {
    for (const [width, height, shift, lift] of [
      [1440, 836, 167, 0],
      [768, 960, 0, 192],
      [1920, 1016, 173, 0],
    ]) {
      const ours = focusCardRect(width, height, shift, lift);
      const project = projectWithThree(width, height, shift, lift);
      expect(ours.left).toBeCloseTo(project(0, 0.5).x, 1);
      expect(ours.right).toBeCloseTo(project(1, 0.5).x, 1);
      expect(ours.top).toBeCloseTo(project(1, 1).y, 1);
      expect(ours.bottom).toBeCloseTo(project(1, 0).y, 1);
    }
  });

  it('is a true rectangle once the card has settled flat', () => {
    const project = projectWithThree(1440, 836, 167, 0);
    for (const u of [0, 1]) {
      const column = [0, 0.5, 1].map((v) => project(u, v).x);
      expect(column[0]).toBeCloseTo(column[1], 3);
      expect(column[2]).toBeCloseTo(column[1], 3);
    }
    for (const v of [0, 1]) {
      const row = [0, 0.5, 1].map((u) => project(u, v).y);
      expect(row[0]).toBeCloseTo(row[1], 3);
      expect(row[2]).toBeCloseTo(row[1], 3);
    }
  });

  it('sits in the middle of the stage with no shift', () => {
    const rect = focusCardRect(1440, 836, 0, 0);
    expect((rect.left + rect.right) / 2).toBeCloseTo(720, 0);
    expect(Math.abs((rect.top + rect.bottom) / 2 - 418)).toBeLessThan(16);
    expect(rect.right - rect.left).toBeGreaterThan(400);
  });

  it('slides exactly as far as the scene does for the panel', () => {
    const still = focusCardRect(1440, 836, 0, 0);
    const moved = focusCardRect(1440, 836, 160, 90);
    expect(moved.left).toBeCloseTo(still.left - 160, 6);
    expect(moved.right).toBeCloseTo(still.right - 160, 6);
    expect(moved.top).toBeCloseTo(still.top - 90, 6);
  });
});

describe('shiftForPanel', () => {
  it('keeps the preferred shift when the card already clears the panel', () => {
    expect(shiftForPanel(1440, 836, 1022, 167)).toBe(167);
    expect(shiftForPanel(1920, 1016, 1392, 173)).toBe(173);
  });

  it('slides further when the card would come too close to the panel', () => {
    const shift = shiftForPanel(1024, 704, 640, 20);
    expect(shift).toBeGreaterThan(20);
    expect(focusCardRect(1024, 704, shift, 0).right).toBeCloseTo(640 - CLEARANCE.panel, 6);
  });

  it('fits the card between the stage edge and the panel on a tall and narrow tablet', () => {
    const shift = shiftForPanel(1024, 1302, 688, 134);
    const card = focusCardRect(1024, 1302, shift, 0);
    expect(card.right).toBeLessThanOrEqual(688 - CLEARANCE.panel + 1e-6);
    expect(card.left).toBeGreaterThanOrEqual(CLEARANCE.edge);
  });

  it('never pushes the card off the left of the stage', () => {
    const shift = shiftForPanel(1024, 1302, 300, 134);
    expect(focusCardRect(1024, 1302, shift, 0).left).toBeCloseTo(CLEARANCE.edge, 6);
  });
});
