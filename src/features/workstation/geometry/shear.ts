import { Matrix4, type BufferGeometry } from 'three';

const shear = new Matrix4();

/**
 * Leans a geometry by moving each vertex sideways in proportion to its height, so a leg can splay outward
 * while its top and bottom faces stay level: flush under the desk and flat on the floor.
 * `x` and `z` are the sideways travel per metre of height. Normals follow through the shear matrix.
 */
export function shearAlongY<T extends BufferGeometry>(geometry: T, x: number, z: number): T {
  return geometry.applyMatrix4(shear.makeShear(0, 0, x, z, 0, 0));
}
