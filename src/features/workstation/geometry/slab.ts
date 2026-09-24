import { ExtrudeGeometry } from 'three';
import { roundedRectShape } from './shapes';

export interface SlabOptions {
  width: number;
  depth: number;
  height: number;
  /** Corner radius seen from above. */
  radius: number;
  /** Radius of the rounding along the top and bottom edges. */
  bevel: number;
  /** Smoothness of the plan corners and of the edge rounding. */
  curveSegments?: number;
  bevelSegments?: number;
}

/**
 * Flat slab with rounded corners in plan and softly rounded top and bottom edges, the shape of a
 * desktop, a shelf, a laptop or a Mac mini. Origin at the middle of the bottom face, Y up.
 */
export function createSlabGeometry({ width, depth, height, radius, bevel, curveSegments = 12, bevelSegments = 4 }: SlabOptions) {
  // The bevel grows the outline by `bevel` on every side, so the plan is drawn that much smaller.
  const plan = roundedRectShape(width - bevel * 2, depth - bevel * 2, Math.max(0.0005, radius - bevel));
  const geometry = new ExtrudeGeometry(plan, {
    depth: Math.max(0.0001, height - bevel * 2),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments,
    curveSegments,
  });
  // Extruded along +Z; stand it up so the extrusion runs along +Y with the plan in XZ.
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, bevel, 0);
  geometry.computeVertexNormals();
  return geometry;
}
