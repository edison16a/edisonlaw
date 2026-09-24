import type { Random } from '../types';
import { jitter } from '../random';
import { polyline, smoothClosed, type Point } from './paths';

/** Path2D builders for the flat shapes the covers are made of. */

export type Corners = number | readonly [topLeft: number, topRight: number, bottomRight: number, bottomLeft: number];

export function roundRect(x: number, y: number, w: number, h: number, corners: Corners) {
  const limit = Math.min(w, h) / 2;
  const [tl, tr, br, bl] = (typeof corners === 'number' ? [corners, corners, corners, corners] : corners).map((r) =>
    Math.min(r, limit),
  );
  const path = new Path2D();
  path.moveTo(x + tl, y);
  path.arcTo(x + w, y, x + w, y + h, tr);
  path.arcTo(x + w, y + h, x, y + h, br);
  path.arcTo(x, y + h, x, y, bl);
  path.arcTo(x, y, x + w, y, tl);
  path.closePath();
  return path;
}

/** Fully rounded capsule. */
export const pill = (x: number, y: number, w: number, h: number) => roundRect(x, y, w, h, Math.min(w, h) / 2);

export function circle(x: number, y: number, radius: number) {
  const path = new Path2D();
  path.arc(x, y, radius, 0, Math.PI * 2);
  return path;
}

export function ellipse(x: number, y: number, rx: number, ry: number, rotation = 0) {
  const path = new Path2D();
  path.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
  return path;
}

/** Annulus between two radii, handy for rims and target rings. */
export function ring(x: number, y: number, outer: number, inner: number) {
  const path = new Path2D();
  path.arc(x, y, outer, 0, Math.PI * 2);
  path.moveTo(x + inner, y);
  path.arc(x, y, inner, 0, Math.PI * 2, true);
  return path;
}

export const polygon = (points: readonly Point[]) => polyline(points, true);

export function regularPolygon(x: number, y: number, radius: number, sides: number, rotation = -Math.PI / 2) {
  const points: Point[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = rotation + (i / sides) * Math.PI * 2;
    points.push([x + Math.cos(angle) * radius, y + Math.sin(angle) * radius]);
  }
  return polyline(points, true);
}

export function star(x: number, y: number, outer: number, inner: number, spikes = 5, rotation = -Math.PI / 2) {
  const points: Point[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = rotation + (i / (spikes * 2)) * Math.PI * 2;
    points.push([x + Math.cos(angle) * radius, y + Math.sin(angle) * radius]);
  }
  return polyline(points, true);
}

/** Four point sparkle with concave sides. */
export function sparkle(x: number, y: number, radius: number) {
  const k = radius * 0.16;
  const path = new Path2D();
  path.moveTo(x, y - radius);
  path.quadraticCurveTo(x + k, y - k, x + radius, y);
  path.quadraticCurveTo(x + k, y + k, x, y + radius);
  path.quadraticCurveTo(x - k, y + k, x - radius, y);
  path.quadraticCurveTo(x - k, y - k, x, y - radius);
  path.closePath();
  return path;
}

interface BlobOptions {
  /** Number of control points around the outline. */
  points?: number;
  /** How far each point may stray from the circle, as a fraction of the radius. */
  wobble?: number;
  /** Vertical squash, 1 keeps it round. */
  squash?: number;
}

/** Organic closed shape around a centre. */
export function blob(x: number, y: number, radius: number, random: Random, { points = 8, wobble = 0.2, squash = 1 }: BlobOptions = {}) {
  const outline: Point[] = [];
  const offset = random() * Math.PI * 2;
  for (let i = 0; i < points; i++) {
    const angle = offset + (i / points) * Math.PI * 2;
    const r = radius * (1 + jitter(random, wobble));
    outline.push([x + Math.cos(angle) * r, y + Math.sin(angle) * r * squash]);
  }
  return smoothClosed(outline);
}

/** Classic map pin whose tip touches (x, y). `radius` is the size of the round head. */
export function mapPin(x: number, y: number, radius: number) {
  const headY = y - radius * 2.1;
  // Angle between straight down and the point where the side lines touch the head.
  const spread = Math.acos(1 / 2.1);
  const path = new Path2D();
  path.moveTo(x, y);
  path.arc(x, headY, radius, Math.PI / 2 + spread, Math.PI / 2 - spread);
  path.closePath();
  return path;
}
