import { ExtrudeGeometry, Path } from 'three';
import { roundedRectShape } from './shapes';

export interface FrameRingOptions {
  width: number;
  height: number;
  /** Width of the moulding on each side. */
  border: number;
  depth: number;
  radius: number;
  bevel: number;
}

/**
 * A picture or board frame: a rounded rectangle with a rounded opening, extruded toward +Z with softly
 * bevelled edges. Its back face sits at z = 0 and its outer size matches `width` by `height`.
 */
export function createFrameRingGeometry({ width, height, border, depth, radius, bevel }: FrameRingOptions) {
  const outer = roundedRectShape(width - bevel * 2, height - bevel * 2, Math.max(0.001, radius - bevel));
  // The bevel closes the opening in by its size, so the opening is cut that much larger.
  const opening = roundedRectShape(width - border * 2 + bevel * 2, height - border * 2 + bevel * 2, Math.max(0.001, radius * 0.4 + bevel));
  outer.holes.push(new Path(opening.getPoints(8)));
  const geometry = new ExtrudeGeometry(outer, {
    depth: depth - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 10,
  });
  geometry.translate(0, 0, bevel);
  geometry.computeVertexNormals();
  return geometry;
}
