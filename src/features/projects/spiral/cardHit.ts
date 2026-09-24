import { Vector3, Vector4, type Camera, type Intersection, type Matrix4, type Mesh, type Raycaster } from 'three';
import type { CardUniforms } from './cardMaterial';
import { CARD_HEIGHT, CARD_WIDTH, sweepOffset } from './geometry';

/**
 * Hit testing that follows the card the canvas draws. The vertex shader bends
 * each flat plane round the cylinder, bows it with speed and sweeps the strand
 * sideways, so three.js's own test against the flat plane misses near the
 * edges of a bent card. This bends a grid the same way, projects it to the
 * screen and looks for the pointer among its triangles. A card settled in
 * focus has no bend or bow and takes the sweep of its centre, just as drawn.
 */

/** Grid cells across and up the card. The chords stay well under a pixel from the bent surface. */
const COLUMNS = 16;
const ROWS = 6;
const POINTS = (COLUMNS + 1) * (ROWS + 1);

/** Screen positions and world positions of the grid, reused for every card and every test. */
const screen = new Float32Array(POINTS * 2);
const world = new Float32Array(POINTS * 3);
const local = new Vector3();
const view = new Vector3();
const clip = new Vector4();
const pointer = new Vector3();
const shape: CardShape = { curvature: 0, bow: 0, flat: 0 };

/** Card point `u`, `v` (0 to 1 across and up) bent like the vertex shader bends it, in the card's own units. */
export function bendCardPoint(u: number, v: number, curvature: number, bow: number, out: Vector3) {
  const x = (u - 0.5) * CARD_WIDTH;
  out.set(x, (v - 0.5) * CARD_HEIGHT, 0);
  if (Math.abs(curvature) > 0.0001) {
    const angle = x * curvature;
    out.x = Math.sin(angle) / curvature;
    out.z = (Math.cos(angle) - 1) / curvature;
  }
  out.x += Math.sin(v * Math.PI) * bow;
  return out;
}

/** How the vertex shader shapes one card: its bend, speed bow and how flat it has settled. */
export interface CardShape {
  curvature: number;
  bow: number;
  flat: number;
}

/** Bends and projects the grid for one card. Returns false if any point falls behind the camera. */
function projectGrid(matrixWorld: Matrix4, camera: Camera, { curvature, bow, flat }: CardShape) {
  const centreY = matrixWorld.elements[13];
  for (let row = 0; row <= ROWS; row++) {
    for (let column = 0; column <= COLUMNS; column++) {
      const index = row * (COLUMNS + 1) + column;
      bendCardPoint(column / COLUMNS, row / ROWS, curvature, bow, local).applyMatrix4(matrixWorld);
      world[index * 3] = local.x;
      world[index * 3 + 1] = local.y;
      world[index * 3 + 2] = local.z;
      view.copy(local).applyMatrix4(camera.matrixWorldInverse);
      view.x += sweepOffset(local.y, centreY, flat);
      clip.set(view.x, view.y, view.z, 1).applyMatrix4(camera.projectionMatrix);
      if (clip.w <= 0) return false;
      screen[index * 2] = clip.x / clip.w;
      screen[index * 2 + 1] = clip.y / clip.w;
    }
  }
  return true;
}

/**
 * If the point `x`, `y` lies in the screen triangle of grid points `a`, `b`
 * and `c`, writes the world point under it to `out` and returns true.
 */
function hitTriangle(x: number, y: number, a: number, b: number, c: number, out: Vector3) {
  const ax = screen[a * 2];
  const ay = screen[a * 2 + 1];
  const abx = screen[b * 2] - ax;
  const aby = screen[b * 2 + 1] - ay;
  const acx = screen[c * 2] - ax;
  const acy = screen[c * 2 + 1] - ay;
  const area = abx * acy - aby * acx;
  if (Math.abs(area) < 1e-12) return false;
  const s = ((x - ax) * acy - (y - ay) * acx) / area;
  const t = (abx * (y - ay) - aby * (x - ax)) / area;
  if (s < 0 || t < 0 || s + t > 1) return false;
  const r = 1 - s - t;
  out.set(
    world[a * 3] * r + world[b * 3] * s + world[c * 3] * t,
    world[a * 3 + 1] * r + world[b * 3 + 1] * s + world[c * 3 + 1] * t,
    world[a * 3 + 2] * r + world[b * 3 + 2] * s + world[c * 3 + 2] * t,
  );
  return true;
}

/**
 * Where the pointer at `x`, `y` in normalized device coordinates lands on a
 * card placed by `matrixWorld` and drawn through `camera` in this shape.
 * Writes the world point to `out` and returns true, or returns false for a miss.
 */
export function hitBentCard(x: number, y: number, matrixWorld: Matrix4, camera: Camera, shape: CardShape, out: Vector3) {
  if (!projectGrid(matrixWorld, camera, shape)) return false;
  for (let row = 0; row < ROWS; row++) {
    for (let column = 0; column < COLUMNS; column++) {
      const a = row * (COLUMNS + 1) + column;
      const b = a + 1;
      const c = a + COLUMNS + 2;
      const d = a + COLUMNS + 1;
      if (hitTriangle(x, y, a, b, c, out) || hitTriangle(x, y, a, c, d, out)) return true;
    }
  }
  return false;
}

/**
 * A raycast for a card's mesh that tests the bent card on screen instead of
 * the flat plane. Hidden cards never catch the pointer.
 */
export function bentCardRaycast(mesh: Mesh, uniforms: CardUniforms) {
  return (raycaster: Raycaster, intersects: Intersection[]) => {
    const camera = raycaster.camera as Camera | null;
    if (!mesh.visible || !camera) return;
    // Every point on a picking ray lands on the same spot on screen, so one step along it finds the pointer.
    pointer.copy(raycaster.ray.origin).add(raycaster.ray.direction).project(camera);
    shape.curvature = uniforms.uCurvature.value;
    shape.bow = uniforms.uBow.value;
    shape.flat = uniforms.uFlat.value;
    const point = new Vector3();
    if (!hitBentCard(pointer.x, pointer.y, mesh.matrixWorld, camera, shape, point)) return;
    intersects.push({ distance: raycaster.ray.origin.distanceTo(point), point, object: mesh });
  };
}
