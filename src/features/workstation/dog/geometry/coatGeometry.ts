import { BufferGeometry, Color, Float32BufferAttribute, Uint16BufferAttribute, Uint32BufferAttribute, Vector3, type Matrix4 } from 'three';
import { smoothstep } from '@/lib/math';
import type { Vec3 } from '../../layout';
import { EYE_RADII, faceLayout } from '../anatomy/face';
import { HEAD } from '../dimensions';
import { DOG_PALETTE } from '../materials';
import { createFieldSample, type Field } from '../sdf/field';
import { meshField } from '../sdf/surfaceNets';
import { toneColor } from './paint';

/** Grid cell for the coat, in metres. Fine enough for the smallest fur clumps and the lips. */
export const COAT_CELL = 0.005;

/** Everything the coat mesh needs, as plain arrays so it can be built once and reused. */
export interface CoatData {
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  skinIndices: Uint16Array;
  skinWeights: Float32Array;
  indices: Uint32Array;
}

export interface Influence {
  bone: number;
  weight: number;
}

/** Dark lids painted round each eye: full pigment within `inner` eye widths of its centre, none past `outer`. */
export interface LidPaint {
  inner: number;
  outer: number;
  strength: number;
}

const LIDS: LidPaint = { inner: 1.1, outer: 1.42, strength: 0.6 };

/** How one pose's coat is built: its sculpture, where its head rests, and how each point is skinned. */
export interface CoatRecipe {
  field: Field;
  /** Head space to dog space in the resting pose, to find the eyes. */
  headToDog: Matrix4;
  /** Bone weights at a coat point, from the share of each part the field blended there. */
  weigh(point: Vector3, parts: Float32Array): Influence[];
  lids?: LidPaint;
}

const pigment = new Color(DOG_PALETTE.pigment);

/** The four strongest influences, scaled to add up to one. Pass every weight worth keeping. */
export function strongest(list: Influence[]) {
  const kept = list
    .filter(({ weight }) => weight > 1e-4)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 4);
  const total = kept.reduce((sum, item) => sum + item.weight, 0) || 1;
  return kept.map(({ bone, weight }) => ({ bone, weight: weight / total }));
}

/** How far along a centre line a point lies, in joint units: 0 at the first point, 1 at the second and so on. */
export function pathParam(point: Vector3, path: readonly Vec3[]) {
  let best = Infinity;
  let param = 0;
  const a = new Vector3();
  const b = new Vector3();
  const nearest = new Vector3();
  for (let i = 0; i < path.length - 1; i++) {
    a.fromArray(path[i]);
    b.fromArray(path[i + 1]).sub(a);
    const t = Math.min(1, Math.max(0, nearest.copy(point).sub(a).dot(b) / b.lengthSq()));
    const distance = nearest.copy(a).addScaledVector(b, t).distanceToSquared(point);
    if (distance < best) {
      best = distance;
      param = i + t;
    }
  }
  return param;
}

/**
 * Hands `share` of a point `param` joints along a chain of `count` bones, the first of them `first`,
 * smoothly from joint to joint.
 */
export function chainInfluences(share: number, param: number, first: number, count: number): Influence[] {
  const list: Influence[] = [];
  let previous = 1;
  for (let joint = 1; joint <= count; joint++) {
    const next = joint < count ? 1 - smoothstep(joint - 0.35, joint + 0.35, param) : 0;
    list.push({ bone: first + joint - 1, weight: share * (previous - next) });
    previous = next;
  }
  return list;
}

/** Meshes a coat sculpture and paints it: colours, eye lid pigment, and skin weights. */
export function buildCoat({ field, headToDog, weigh, lids = LIDS }: CoatRecipe, cell = COAT_CELL): CoatData {
  const mesh = meshField(field, { cell });
  const count = mesh.positions.length / 3;
  const colors = new Float32Array(count * 3);
  const skinIndices = new Uint16Array(count * 4);
  const skinWeights = new Float32Array(count * 4);

  const eyes = faceLayout().eyes.map((eye) => new Vector3(...eye.position).applyMatrix4(headToDog));
  const lidInner = EYE_RADII[0] * lids.inner * HEAD.scale;
  const lidOuter = EYE_RADII[0] * lids.outer * HEAD.scale;
  const sample = createFieldSample(field.partCount);
  const point = new Vector3();
  const color = new Color();

  for (let n = 0; n < count; n++) {
    point.fromArray(mesh.positions, n * 3);
    const ny = mesh.normals[n * 3 + 1];
    field.sample(point.x, point.y, point.z, sample, mesh.shapesAt[n]);

    // Lighter underneath and a touch deeper along the top, like sun bleached fur.
    const tone = sample.tone + 0.2 * Math.max(0, -ny) - 0.08 * Math.max(0, ny);
    toneColor(tone, color);

    // Dark lids round each eye, softened outward so they read as a soulful rim rather than a ring.
    let rim = 0;
    for (const eye of eyes) rim = Math.max(rim, smoothstep(lidOuter, lidInner, eye.distanceTo(point)));
    color.lerp(pigment, rim * lids.strength);
    color.toArray(colors, n * 3);

    weigh(point, sample.parts).forEach(({ bone, weight }, slot) => {
      skinIndices[n * 4 + slot] = bone;
      skinWeights[n * 4 + slot] = weight;
    });
  }

  return { positions: mesh.positions, normals: mesh.normals, colors, skinIndices, skinWeights, indices: mesh.indices };
}

/** A fresh geometry over the built arrays. The arrays are shared, so building it is cheap. */
export function coatGeometry(data: CoatData) {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(data.positions, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(data.normals, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(data.colors, 3));
  geometry.setAttribute('skinIndex', new Uint16BufferAttribute(data.skinIndices, 4));
  geometry.setAttribute('skinWeight', new Float32BufferAttribute(data.skinWeights, 4));
  geometry.setIndex(new Uint32BufferAttribute(data.indices, 1));
  geometry.computeBoundingSphere();
  return geometry;
}
