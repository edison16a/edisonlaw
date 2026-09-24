import { siApple } from 'simple-icons';
import { Shape, ShapeGeometry } from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

/** Simple Icons draw every mark in a 24 unit box with Y pointing down. */
const VIEWBOX = 24;

/**
 * Flat Apple logo facing +Y, centred on the origin and `height` tall, with the leaf toward -Z.
 * Traced from the Simple Icons path, so it is a clean vector outline rather than a texture.
 */
export function createAppleLogoGeometry(height: number, curveDivisions = 10) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX} ${VIEWBOX}"><path d="${siApple.path}"/></svg>`;
  const shapes = new SVGLoader()
    .parse(svg)
    .paths.flatMap((path) => path.toShapes())
    // Flip Y so the logo stands upright, rebuilding each outline so its triangles still face the viewer.
    .map((shape) => {
      const { shape: outline, holes } = shape.extractPoints(curveDivisions);
      const flipped = new Shape(outline.map((point) => point.clone().setY(-point.y)));
      flipped.holes = holes.map((hole) => new Shape(hole.map((point) => point.clone().setY(-point.y))));
      return flipped;
    });

  const geometry = new ShapeGeometry(shapes);
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const scale = height / (box.max.y - box.min.y);
  geometry.translate(-(box.min.x + box.max.x) / 2, -(box.min.y + box.max.y) / 2, 0);
  geometry.scale(scale, scale, 1);
  // Lay it down: the face turns from +Z to +Y and the leaf from +Y to -Z.
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}
