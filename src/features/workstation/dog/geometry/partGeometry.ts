import { BufferGeometry, Color, Float32BufferAttribute, Uint32BufferAttribute, Vector3 } from 'three';
import { createFieldSample, type Field } from '../sdf/field';
import { meshField } from '../sdf/surfaceNets';
import { toneColor } from './paint';

/** A small rigid part (ear, nose, tongue) as plain arrays. */
export interface PartData {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  /** Coat colours from the field's tones, for furry parts. */
  colors?: Float32Array;
}

/** Meshes a small sculpture, optionally painting it with the coat gradient from its tones. */
export function meshPart(field: Field, cell: number, painted = false): PartData {
  const mesh = meshField(field, { cell });
  if (!painted) return { positions: mesh.positions, normals: mesh.normals, indices: mesh.indices };
  const count = mesh.positions.length / 3;
  const colors = new Float32Array(count * 3);
  const sample = createFieldSample(field.partCount);
  const point = new Vector3();
  const color = new Color();
  for (let n = 0; n < count; n++) {
    point.fromArray(mesh.positions, n * 3);
    field.sample(point.x, point.y, point.z, sample, mesh.shapesAt[n]);
    toneColor(sample.tone + 0.15 * Math.max(0, -mesh.normals[n * 3 + 1]), color).toArray(colors, n * 3);
  }
  return { positions: mesh.positions, normals: mesh.normals, indices: mesh.indices, colors };
}

/** A geometry for a part, mirrored across X when `mirror` is set (the right ear from the left). */
export function partGeometry(data: PartData, mirror = false) {
  const geometry = new BufferGeometry();
  if (mirror) {
    const positions = data.positions.slice();
    const normals = data.normals.slice();
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] = -positions[i];
      normals[i] = -normals[i];
    }
    // Mirroring turns the triangles inside out, so swap two corners of each.
    const indices = data.indices.slice();
    for (let t = 0; t < indices.length; t += 3) [indices[t + 1], indices[t + 2]] = [indices[t + 2], indices[t + 1]];
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
    geometry.setIndex(new Uint32BufferAttribute(indices, 1));
  } else {
    geometry.setAttribute('position', new Float32BufferAttribute(data.positions, 3));
    geometry.setAttribute('normal', new Float32BufferAttribute(data.normals, 3));
    geometry.setIndex(new Uint32BufferAttribute(data.indices, 1));
  }
  if (data.colors) geometry.setAttribute('color', new Float32BufferAttribute(data.colors, 3));
  geometry.computeBoundingSphere();
  return geometry;
}
