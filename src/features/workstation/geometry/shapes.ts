import { Shape } from 'three';

/** Rectangle with rounded corners, centred on the origin. */
export function roundedRectShape(width: number, height: number, radius: number) {
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);
  const shape = new Shape();
  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

/**
 * Closed polygon with every corner rounded. `radius` is how far before each corner the curve starts,
 * either one value for all corners or one per corner, and is capped at half of the shorter adjacent side.
 */
export function roundedPolygonShape(points: [number, number][], radius: number | number[]) {
  const shape = new Shape();
  const count = points.length;
  const at = (index: number) => points[(index + count) % count];
  const cornerRadius = (index: number) => (Array.isArray(radius) ? radius[index] : radius);

  for (let i = 0; i < count; i++) {
    const [px, py] = at(i - 1);
    const [cx, cy] = at(i);
    const [nx, ny] = at(i + 1);
    const toPrevious = Math.hypot(px - cx, py - cy);
    const toNext = Math.hypot(nx - cx, ny - cy);
    const r = Math.min(cornerRadius(i), toPrevious / 2, toNext / 2);
    const enterX = cx + ((px - cx) / toPrevious) * r;
    const enterY = cy + ((py - cy) / toPrevious) * r;
    const leaveX = cx + ((nx - cx) / toNext) * r;
    const leaveY = cy + ((ny - cy) / toNext) * r;
    if (i === 0) shape.moveTo(enterX, enterY);
    else shape.lineTo(enterX, enterY);
    shape.quadraticCurveTo(cx, cy, leaveX, leaveY);
  }
  shape.closePath();
  return shape;
}
