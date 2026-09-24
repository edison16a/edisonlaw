/** Open and closed path builders for curves, lines and metro style routes. */

export type Point = readonly [number, number];

/** Adds a Catmull-Rom spline through `points` to `path` as cubic Béziers. */
function addSpline(path: Path2D, points: readonly Point[], closed: boolean, tension: number) {
  const count = points.length;
  const at = (index: number) => (closed ? points[(index + count) % count] : points[Math.max(0, Math.min(count - 1, index))]);
  const segments = closed ? count : count - 1;
  for (let i = 0; i < segments; i++) {
    const [x0, y0] = at(i - 1);
    const [x1, y1] = at(i);
    const [x2, y2] = at(i + 1);
    const [x3, y3] = at(i + 2);
    const k = tension / 6;
    path.bezierCurveTo(x1 + (x2 - x0) * k, y1 + (y2 - y0) * k, x2 - (x3 - x1) * k, y2 - (y3 - y1) * k, x2, y2);
  }
}

/** Smooth closed curve through every point. */
export function smoothClosed(points: readonly Point[], tension = 1) {
  const path = new Path2D();
  path.moveTo(points[0][0], points[0][1]);
  addSpline(path, points, true, tension);
  path.closePath();
  return path;
}

/** Smooth open curve through every point. */
export function smoothOpen(points: readonly Point[], tension = 1) {
  const path = new Path2D();
  path.moveTo(points[0][0], points[0][1]);
  addSpline(path, points, false, tension);
  return path;
}

export function polyline(points: readonly Point[], closed = false) {
  const path = new Path2D();
  points.forEach(([x, y], index) => (index === 0 ? path.moveTo(x, y) : path.lineTo(x, y)));
  if (closed) path.closePath();
  return path;
}

/** Straight segments with rounded corners, like lines on a transit map. */
export function roundedPolyline(points: readonly Point[], radius: number) {
  const path = new Path2D();
  path.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length - 1; i++) {
    path.arcTo(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], radius);
  }
  const [x, y] = points[points.length - 1];
  path.lineTo(x, y);
  return path;
}

/** S shaped link between two points that leaves and arrives horizontally. */
export function horizontalLink(from: Point, to: Point, path = new Path2D()) {
  const mid = (from[0] + to[0]) / 2;
  path.moveTo(from[0], from[1]);
  path.bezierCurveTo(mid, from[1], mid, to[1], to[0], to[1]);
  return path;
}
