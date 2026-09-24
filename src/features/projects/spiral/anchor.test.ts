import { PerspectiveCamera, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { ARROW, focusCardRect, shiftForPanel } from './anchor';
import { cardBend } from './appearance';
import { CARD_HEIGHT, CARD_WIDTH, cardPose, createPose, SPIRAL } from './geometry';
import { CAMERA, frameCamera } from './lens';

/**
 * Pushes points on the card, in its own units from its centre, through a real
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
  const angle = (CARD_WIDTH / 2) * curvature;
  return (side: number, end: number) => {
    const local = new Vector3(side * (Math.sin(angle) / curvature), end * (CARD_HEIGHT / 2), (Math.cos(angle) - 1) / curvature);
    const world = local.multiplyScalar(pose.scale).add(new Vector3(pose.x, pose.y, pose.z));
    const view = world.clone().applyMatrix4(camera.matrixWorldInverse);
    view.x += SPIRAL.sweep * world.y * world.y;
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
      expect(ours.left).toBeCloseTo(project(-1, 0).x, 1);
      expect(ours.right).toBeCloseTo(project(1, 0).x, 1);
      expect(ours.top).toBeCloseTo(project(1, 1).y, 1);
      expect(ours.bottom).toBeCloseTo(project(1, -1).y, 1);
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
  /** Where the arrows land, from their inner sides out, for a given shift. */
  const arrowsAt = (width: number, height: number, shift: number) => {
    const card = focusCardRect(width, height, shift, 0);
    return { left: card.left - ARROW.gap - ARROW.size, right: card.right + ARROW.gap + ARROW.size };
  };

  it('keeps the preferred shift when the arrows already clear the panel', () => {
    expect(shiftForPanel(1440, 836, 1022, 167)).toBe(167);
    expect(shiftForPanel(1920, 1016, 1392, 173)).toBe(173);
  });

  it('slides further on a short screen so the next arrow clears the panel', () => {
    const shift = shiftForPanel(1440, 536, 783, 167);
    expect(shift).toBeGreaterThan(167);
    expect(arrowsAt(1440, 536, shift).right).toBeCloseTo(783 - ARROW.margin, 6);
  });

  it('fits both arrows on a tall and narrow tablet with the panel beside the card', () => {
    const shift = shiftForPanel(1024, 1302, 688, 134);
    const arrows = arrowsAt(1024, 1302, shift);
    expect(arrows.right).toBeLessThanOrEqual(688 - ARROW.margin + 1e-6);
    expect(arrows.left).toBeGreaterThanOrEqual(ARROW.margin);
  });

  it('never pushes the previous arrow off the stage', () => {
    const shift = shiftForPanel(1024, 1302, 300, 134);
    expect(arrowsAt(1024, 1302, shift).left).toBeCloseTo(ARROW.margin, 6);
  });
});
