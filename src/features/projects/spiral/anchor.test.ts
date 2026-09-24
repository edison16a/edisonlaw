import { PerspectiveCamera, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { focusCardRect } from './anchor';
import { cardBend } from './appearance';
import { CARD_HEIGHT, CARD_WIDTH, cardPose, createPose, SPIRAL } from './geometry';
import { CAMERA, frameCamera } from './lens';

/** The same corners pushed through a real three.js camera, framed the way the canvas frames it. */
function projectWithThree(width: number, height: number, shift: number, lift: number) {
  const camera = new PerspectiveCamera(CAMERA.fov, width / height, 0.1, 40);
  camera.position.set(0, 0, CAMERA.z);
  frameCamera(camera, width, height, shift, lift);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();

  const pose = cardPose(0, 1, 0, createPose());
  const curvature = cardBend(0, pose.focus) / SPIRAL.radius;
  const angle = (CARD_WIDTH / 2) * curvature;
  const xs: number[] = [];
  const ys: number[] = [];
  for (const side of [-1, 1]) {
    for (const end of [-1, 1]) {
      const local = new Vector3(side * (Math.sin(angle) / curvature), end * (CARD_HEIGHT / 2), (Math.cos(angle) - 1) / curvature);
      const world = local.multiplyScalar(pose.scale).add(new Vector3(pose.x, pose.y, pose.z));
      const view = world.clone().applyMatrix4(camera.matrixWorldInverse);
      view.x += SPIRAL.sweep * world.y * world.y;
      const clip = view.applyMatrix4(camera.projectionMatrix);
      xs.push(((clip.x + 1) / 2) * width);
      ys.push(((1 - clip.y) / 2) * height);
    }
  }
  return { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) };
}

describe('focusCardRect', () => {
  it('matches what a three.js camera draws, on wide and tall stages', () => {
    for (const [width, height, shift, lift] of [
      [1440, 836, 167, 0],
      [768, 960, 0, 192],
      [1920, 1016, 173, 0],
    ]) {
      const ours = focusCardRect(width, height, shift, lift);
      const three = projectWithThree(width, height, shift, lift);
      expect(ours.left).toBeCloseTo(three.left, 1);
      expect(ours.right).toBeCloseTo(three.right, 1);
      expect(ours.top).toBeCloseTo(three.top, 1);
      expect(ours.bottom).toBeCloseTo(three.bottom, 1);
    }
  });

  it('sits near the middle of the stage with no shift, nudged a little right by the sweep', () => {
    const rect = focusCardRect(1440, 836, 0, 0);
    const middle = (rect.left + rect.right) / 2;
    expect(middle).toBeGreaterThan(720);
    expect(middle).toBeLessThan(736);
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
