import { describe, expect, it } from 'vitest';
import { Field } from './field';
import { Ellipsoid, RoundCone, Sphere } from './primitives';
import { meshField, type SurfaceMesh } from './surfaceNets';

/** Every edge of a closed, consistently wound mesh is used once in each direction. */
function openEdges(mesh: SurfaceMesh) {
  const edges = new Map<string, number>();
  const { indices } = mesh;
  for (let t = 0; t < indices.length; t += 3) {
    for (let e = 0; e < 3; e++) {
      const a = indices[t + e];
      const b = indices[t + ((e + 1) % 3)];
      const key = `${a},${b}`;
      edges.set(key, (edges.get(key) ?? 0) + 1);
    }
  }
  let open = 0;
  for (const [key, count] of edges) {
    const [a, b] = key.split(',');
    if (count !== 1 || edges.get(`${b},${a}`) !== 1) open++;
  }
  return open;
}

/** Signed volume from the triangles, positive when they face outward. */
function volume(mesh: SurfaceMesh) {
  const { positions: p, indices } = mesh;
  let sum = 0;
  for (let t = 0; t < indices.length; t += 3) {
    const [a, b, c] = [indices[t] * 3, indices[t + 1] * 3, indices[t + 2] * 3];
    sum +=
      p[a] * (p[b + 1] * p[c + 2] - p[b + 2] * p[c + 1]) -
      p[a + 1] * (p[b] * p[c + 2] - p[b + 2] * p[c]) +
      p[a + 2] * (p[b] * p[c + 1] - p[b + 1] * p[c]);
  }
  return sum / 6;
}

describe('meshField', () => {
  it('meshes a sphere as a closed outward surface lying on the sphere', () => {
    const field = new Field([{ primitive: new Sphere([0.01, 0.02, -0.01], 0.1), blend: 0, tone: 0, part: 0 }], 1);
    const mesh = meshField(field, { cell: 0.01 });
    expect(openEdges(mesh)).toBe(0);
    expect(volume(mesh) / ((4 / 3) * Math.PI * 0.001)).toBeGreaterThan(0.99);
    for (let n = 0; n < mesh.positions.length; n += 3) {
      const x = mesh.positions[n] - 0.01;
      const y = mesh.positions[n + 1] - 0.02;
      const z = mesh.positions[n + 2] + 0.01;
      const r = Math.hypot(x, y, z);
      expect(Math.abs(r - 0.1)).toBeLessThan(1e-4);
      // Normals point straight out.
      expect((mesh.normals[n] * x + mesh.normals[n + 1] * y + mesh.normals[n + 2] * z) / r).toBeGreaterThan(0.999);
    }
  });

  it('keeps a blended and carved sculpture closed', () => {
    const field = new Field(
      [
        { primitive: new Ellipsoid([0, 0, 0], [0.12, 0.07, 0.09]), blend: 0, tone: 0, part: 0 },
        { primitive: new RoundCone([0.05, 0, 0], [0.16, 0.1, 0.02], 0.04, 0.025), blend: 0.03, tone: 1, part: 1 },
        { primitive: new Sphere([-0.12, 0.02, 0], 0.035), blend: 0.02, carve: true, tone: 0, part: 0 },
      ],
      2,
    );
    const mesh = meshField(field, { cell: 0.006 });
    expect(mesh.indices.length).toBeGreaterThan(1000);
    expect(openEdges(mesh)).toBe(0);
    expect(volume(mesh)).toBeGreaterThan(0);
  });
});
