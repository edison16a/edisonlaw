import { CurvePath, LineCurve3, QuadraticBezierCurve3, Vector3 } from 'three';

/**
 * Turns a polyline into a smooth path with rounded corners, for bent tubes like the chair frame.
 * `radius` is how far before each corner the bend starts.
 */
export function roundedPath(points: Vector3[], radius: number) {
  const path = new CurvePath<Vector3>();
  let start = points[0].clone();

  for (let i = 1; i < points.length - 1; i++) {
    const previous = points[i - 1];
    const corner = points[i];
    const next = points[i + 1];
    const bend = Math.min(radius, corner.distanceTo(previous) / 2, corner.distanceTo(next) / 2);
    const enter = corner.clone().addScaledVector(corner.clone().sub(previous).normalize(), -bend);
    const leave = corner.clone().addScaledVector(next.clone().sub(corner).normalize(), bend);
    path.add(new LineCurve3(start, enter));
    path.add(new QuadraticBezierCurve3(enter, corner.clone(), leave));
    start = leave;
  }

  path.add(new LineCurve3(start, points[points.length - 1].clone()));
  return path;
}
