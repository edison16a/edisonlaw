import { Matrix4, PerspectiveCamera, Quaternion, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { focusCardRect } from './anchor';
import { cardBend } from './appearance';
import { bendCardPoint, hitBentCard, type CardShape } from './cardHit';
import { cardPose, createPose, SPIRAL, sweepOffset } from './geometry';
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

/** The matrix and shape the canvas gives the card `offset` cards from the slot, at rest. */
function placedCard(offset: number, settle: number) {
  const pose = cardPose(offset, settle, 0, createPose());
  const matrix = new Matrix4().compose(
    new Vector3(pose.x, pose.y, pose.z),
    new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), pose.rotationY),
    new Vector3(pose.scale, pose.scale, pose.scale),
  );
  const shape: CardShape = { curvature: cardBend(0, pose.focus) / SPIRAL.radius, bow: 0, flat: pose.focus };
  return { matrix, shape };
}

/** Screen position, in device coordinates, of card point `u`, `v`, drawn the way the vertex shader draws it. */
function onScreen(camera: PerspectiveCamera, matrix: Matrix4, shape: CardShape, u: number, v: number) {
  const world = bendCardPoint(u, v, shape.curvature, shape.bow, new Vector3()).applyMatrix4(matrix);
  const view = world.clone().applyMatrix4(camera.matrixWorldInverse);
  view.x += sweepOffset(world.y, matrix.elements[13], shape.flat);
  return view.applyMatrix4(camera.projectionMatrix);
}

const toDevice = (x: number, y: number) => ({ x: (x / WIDTH) * 2 - 1, y: 1 - (y / HEIGHT) * 2 });

describe('hitBentCard', () => {
  const camera = framedCamera();
  const out = new Vector3();

  it('finds the flat focused card right up to the sides the arrows sit beside, top to bottom', () => {
    const { matrix, shape } = placedCard(0, 1);
    expect(shape.curvature).toBe(0);
    const rect = focusCardRect(WIDTH, HEIGHT, 0, 0);
    const hit = (x: number, y: number) => {
      const device = toDevice(x, y);
      return hitBentCard(device.x, device.y, matrix, camera, shape, out);
    };
    for (const y of [rect.top + 12, (rect.top + rect.bottom) / 2, rect.bottom - 12]) {
      expect(hit(rect.left + 2, y)).toBe(true);
      expect(hit(rect.right - 2, y)).toBe(true);
      expect(hit(rect.left - 2, y)).toBe(false);
      expect(hit(rect.right + 2, y)).toBe(false);
    }
  });

  it('follows the bend of a neighbour where the flat plane would not', () => {
    const { matrix, shape } = placedCard(1, 1);
    // Just inside the near edge of the bent card, which the flat plane places elsewhere on screen.
    // The far edge wraps round past where the cylinder turns away, out of sight behind the card.
    const inside = onScreen(camera, matrix, shape, 0.015, 0.5);
    const flat = onScreen(camera, matrix, { ...shape, curvature: 0 }, 0.015, 0.5);
    expect(Math.abs(inside.x - flat.x)).toBeGreaterThan(0.005);
    expect(hitBentCard(inside.x, inside.y, matrix, camera, shape, out)).toBe(true);
    // Just past the bent edge is a miss, although the flat plane would still reach there.
    const past = onScreen(camera, matrix, shape, -0.015, 0.5);
    expect(hitBentCard(past.x, past.y, matrix, camera, shape, out)).toBe(false);
  });

  it('returns the world point on the bent surface under the pointer', () => {
    const { matrix, shape } = placedCard(-1, 0);
    const target = bendCardPoint(0.3, 0.6, shape.curvature, 0, new Vector3()).applyMatrix4(matrix);
    const device = onScreen(camera, matrix, shape, 0.3, 0.6);
    expect(hitBentCard(device.x, device.y, matrix, camera, shape, out)).toBe(true);
    expect(out.distanceTo(target)).toBeLessThan(0.01);
  });

  it('follows the speed bow and the sideways shift of the lens', () => {
    const shifted = framedCamera(170);
    const { matrix, shape } = placedCard(0.4, 0);
    const bowed = { ...shape, bow: 0.12 };
    const device = onScreen(shifted, matrix, bowed, 0.98, 0.5);
    expect(hitBentCard(device.x, device.y, matrix, shifted, bowed, out)).toBe(true);
    expect(hitBentCard(device.x, device.y, matrix, shifted, shape, out)).toBe(false);
  });

  it('follows a card halfway between curved and flat', () => {
    const { matrix } = placedCard(0, 0.5);
    const half: CardShape = { curvature: cardBend(0, 0.5) / SPIRAL.radius, bow: 0, flat: 0.5 };
    for (const [u, v] of [
      [0.01, 0.02],
      [0.99, 0.98],
    ]) {
      const device = onScreen(camera, matrix, half, u, v);
      expect(hitBentCard(device.x, device.y, matrix, camera, half, out)).toBe(true);
    }
  });

  it('misses empty space', () => {
    const { matrix, shape } = placedCard(0, 1);
    expect(hitBentCard(0.98, 0.95, matrix, camera, shape, out)).toBe(false);
  });
});
