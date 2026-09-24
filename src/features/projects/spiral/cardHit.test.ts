import { Matrix4, PerspectiveCamera, Quaternion, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { focusCardRect } from './anchor';
import { cardBend } from './appearance';
import { bendCardPoint, hitBentCard } from './cardHit';
import { cardPose, createPose, SPIRAL } from './geometry';
import { CAMERA, frameCamera } from './lens';

const WIDTH = 1440;
const HEIGHT = 836;

function framedCamera(shift = 0) {
  const camera = new PerspectiveCamera(CAMERA.fov, WIDTH / HEIGHT, 0.1, 40);
  camera.position.set(0, 0, CAMERA.z);
  frameCamera(camera, WIDTH, HEIGHT, shift, 0);
  camera.updateMatrixWorld();
  return camera;
}

/** The matrix and bend the canvas gives the card `offset` cards from the slot. */
function placedCard(offset: number, settle: number) {
  const pose = cardPose(offset, settle, 0, createPose());
  const matrix = new Matrix4().compose(
    new Vector3(pose.x, pose.y, pose.z),
    new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), pose.rotationY),
    new Vector3(pose.scale, pose.scale, pose.scale),
  );
  return { matrix, curvature: cardBend(0, pose.focus) / SPIRAL.radius };
}

/** Screen position, in device coordinates, of card point `u`, `v`, drawn the way the vertex shader draws it. */
function onScreen(camera: PerspectiveCamera, matrix: Matrix4, curvature: number, u: number, v: number, bow = 0) {
  const world = bendCardPoint(u, v, curvature, bow, new Vector3()).applyMatrix4(matrix);
  const view = world.clone().applyMatrix4(camera.matrixWorldInverse);
  view.x += SPIRAL.sweep * world.y * world.y;
  return view.applyMatrix4(camera.projectionMatrix);
}

const toDevice = (x: number, y: number) => ({ x: (x / WIDTH) * 2 - 1, y: 1 - (y / HEIGHT) * 2 });

describe('hitBentCard', () => {
  const camera = framedCamera();
  const out = new Vector3();

  it('finds the focused card right up to the sides the arrows sit beside', () => {
    const { matrix, curvature } = placedCard(0, 1);
    const rect = focusCardRect(WIDTH, HEIGHT, 0, 0);
    const middle = (rect.top + rect.bottom) / 2;
    const hit = (x: number) => {
      const device = toDevice(x, middle);
      return hitBentCard(device.x, device.y, matrix, camera, curvature, 0, out);
    };
    expect(hit(rect.left + 2)).toBe(true);
    expect(hit(rect.right - 2)).toBe(true);
    expect(hit(rect.left - 2)).toBe(false);
    expect(hit(rect.right + 2)).toBe(false);
  });

  it('follows the bend of a neighbour where the flat plane would not', () => {
    const { matrix, curvature } = placedCard(1, 1);
    // Just inside the far edge of the bent card, which the flat plane places elsewhere on screen.
    const inside = onScreen(camera, matrix, curvature, 0.985, 0.5);
    const flat = onScreen(camera, matrix, 0, 0.985, 0.5);
    expect(Math.abs(inside.x - flat.x)).toBeGreaterThan(0.005);
    expect(hitBentCard(inside.x, inside.y, matrix, camera, curvature, 0, out)).toBe(true);
    // Just past the bent edge is a miss, although the flat plane would still reach there.
    const past = onScreen(camera, matrix, curvature, 1.015, 0.5);
    expect(hitBentCard(past.x, past.y, matrix, camera, curvature, 0, out)).toBe(false);
  });

  it('returns the world point on the bent surface under the pointer', () => {
    const { matrix, curvature } = placedCard(-1, 0);
    const target = bendCardPoint(0.3, 0.6, curvature, 0, new Vector3()).applyMatrix4(matrix);
    const device = onScreen(camera, matrix, curvature, 0.3, 0.6);
    expect(hitBentCard(device.x, device.y, matrix, camera, curvature, 0, out)).toBe(true);
    expect(out.distanceTo(target)).toBeLessThan(0.01);
  });

  it('follows the speed bow and the sideways shift of the lens', () => {
    const shifted = framedCamera(170);
    const { matrix, curvature } = placedCard(0.4, 0);
    const bow = 0.12;
    const device = onScreen(shifted, matrix, curvature, 0.98, 0.5, bow);
    expect(hitBentCard(device.x, device.y, matrix, shifted, curvature, bow, out)).toBe(true);
    expect(hitBentCard(device.x, device.y, matrix, shifted, curvature, 0, out)).toBe(false);
  });

  it('misses empty space', () => {
    const { matrix, curvature } = placedCard(0, 1);
    expect(hitBentCard(0.98, 0.95, matrix, camera, curvature, 0, out)).toBe(false);
  });
});
