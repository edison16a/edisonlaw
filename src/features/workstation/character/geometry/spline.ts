/**
 * Smooth periodic curve through (x, y) control points, x in degrees over one full turn.
 * Cubic Hermite with finite difference tangents, so it passes through every point with no overshoot spikes.
 */
export function periodicSpline(points: readonly (readonly [number, number])[], period = 360) {
  const sorted = [...points].sort((a, b) => a[0] - b[0]);
  const count = sorted.length;

  const at = (index: number): [number, number] => {
    const wrapped = ((index % count) + count) % count;
    const turns = Math.floor(index / count);
    return [sorted[wrapped][0] + turns * period, sorted[wrapped][1]];
  };

  const tangent = (index: number) => {
    const [x0, y0] = at(index - 1);
    const [x1, y1] = at(index + 1);
    return (y1 - y0) / (x1 - x0);
  };

  return (x: number) => {
    const start = sorted[0][0];
    const local = ((((x - start) % period) + period) % period) + start;
    let index = count - 1;
    for (let i = 0; i < count - 1; i++) {
      if (local < sorted[i + 1][0]) {
        index = i;
        break;
      }
    }
    const [x0, y0] = at(index);
    const [x1, y1] = at(index + 1);
    const span = x1 - x0;
    const s = (local - x0) / span;
    const s2 = s * s;
    const s3 = s2 * s;
    return (
      (2 * s3 - 3 * s2 + 1) * y0 +
      (s3 - 2 * s2 + s) * span * tangent(index) +
      (-2 * s3 + 3 * s2) * y1 +
      (s3 - s2) * span * tangent(index + 1)
    );
  };
}

/** Mirrors control points given for x >= 0 onto negative x, for shapes symmetric about x = 0. */
export function mirrored(points: readonly (readonly [number, number])[]) {
  const result: [number, number][] = points.map(([x, y]) => [x, y]);
  for (const [x, y] of points) if (x > 0 && x < 180) result.push([-x, y]);
  return result;
}
