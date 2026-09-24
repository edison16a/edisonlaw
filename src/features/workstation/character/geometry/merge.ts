import { Float32BufferAttribute, type BufferGeometry, type Color } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** Merges parts that share a material into one geometry, so they cost one draw call, and frees the parts. */
export function mergeParts(parts: BufferGeometry[]) {
  const merged = mergeGeometries(parts);
  for (const part of parts) part.dispose();
  if (!merged) throw new Error('Character parts must have matching attributes to be merged.');
  return merged;
}

/** Gives every vertex of a geometry one colour, for meshes whose material tints by vertex colour. */
export function paintSolid(geometry: BufferGeometry, color: Color) {
  const count = geometry.getAttribute('position').count;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) colors.set([color.r, color.g, color.b], i * 3);
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  return geometry;
}
