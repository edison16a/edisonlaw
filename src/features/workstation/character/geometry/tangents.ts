import { Float32BufferAttribute, Vector3, type BufferGeometry } from 'three';

const UP = new Vector3(0, 1, 0);
const point = new Vector3();
const normal = new Vector3();
const around = new Vector3();

/**
 * Gives a head centred geometry tangents that run around the head, horizontally, for an anisotropic
 * highlight that wraps the hair like a ring. Needs normals first. Near the crown, where "around" has
 * no direction, the tangent falls back to his left.
 */
export function addAroundTangents(geometry: BufferGeometry) {
  const positions = geometry.getAttribute('position');
  const normals = geometry.getAttribute('normal');
  const tangents = new Float32Array(positions.count * 4);
  for (let i = 0; i < positions.count; i++) {
    point.fromBufferAttribute(positions, i);
    normal.fromBufferAttribute(normals, i);
    around.crossVectors(UP, point);
    if (around.lengthSq() < 1e-6) around.set(1, 0, 0);
    around.addScaledVector(normal, -around.dot(normal));
    if (around.lengthSq() < 1e-10) around.set(1, 0, 0).addScaledVector(normal, -normal.x);
    around.normalize();
    tangents.set([around.x, around.y, around.z, 1], i * 4);
  }
  geometry.setAttribute('tangent', new Float32BufferAttribute(tangents, 4));
  return geometry;
}
