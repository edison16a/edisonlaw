import { BufferGeometry, Color, Float32BufferAttribute, Uint16BufferAttribute, Uint32BufferAttribute, Vector3 } from 'three';
import { smoothstep } from '@/lib/math';
import { coatField, headRestMatrix } from '../anatomy/coat';
import { faceLayout } from '../anatomy/face';
import { neckAxis } from '../anatomy/neck';
import { TAIL_PATH } from '../anatomy/tail';
import { HEAD, JOINTS, PART } from '../dimensions';
import { DOG_PALETTE } from '../materials';
import { toneColor } from './paint';
import { BONE, TAIL_BONES } from '../rig/createDogRig';
import { createFieldSample, type Field } from '../sdf/field';
import { meshField } from '../sdf/surfaceNets';

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

const pigment = new Color(DOG_PALETTE.pigment);
const mouth = new Color(DOG_PALETTE.mouth);

/** Positions along the tail path, in joint units: 0 at the root, 1 at the second joint and so on. */
function tailParam(point: Vector3) {
  let best = Infinity;
  let param = 0;
  const a = new Vector3();
  const b = new Vector3();
  for (let i = 0; i < TAIL_PATH.length - 1; i++) {
    a.fromArray(TAIL_PATH[i]);
    b.fromArray(TAIL_PATH[i + 1]).sub(a);
    const t = Math.min(1, Math.max(0, point.clone().sub(a).dot(b) / b.lengthSq()));
    const distance = a.clone().addScaledVector(b, t).distanceToSquared(point);
    if (distance < best) {
      best = distance;
      param = i + t;
    }
  }
  return param;
}

interface Influence {
  bone: number;
  weight: number;
}

/**
 * Bone weights from the part shares the field blended at this point. Paws stay planted on the root,
 * the rib cage breathes, the neck hands over from the chest to the head along its length, and the
 * tail passes smoothly from joint to joint.
 */
function influences(point: Vector3, parts: Float32Array, neck: { base: Vector3; direction: Vector3; length: number }) {
  const list: Influence[] = [];
  const add = (bone: number, weight: number) => {
    if (weight > 1e-4) list.push({ bone, weight });
  };

  const planted = 1 - smoothstep(0.05, 0.2, point.y);
  const dx = point.x / 0.11;
  const dy = (point.y - JOINTS.chest[1]) / 0.12;
  const dz = (point.z - JOINTS.chest[2]) / 0.13;
  const ribs = Math.exp(-(dx * dx + dy * dy + dz * dz) * 1.2) * (1 - planted);

  const along = point.clone().sub(neck.base).dot(neck.direction) / neck.length;
  const toHead = smoothstep(0.15, 0.95, along);

  const body = parts[PART.body] + parts[PART.neck] * (1 - toHead);
  add(BONE.root, body * planted);
  add(BONE.chest, body * ribs);
  add(BONE.body, body * (1 - planted - ribs));
  add(BONE.head, parts[PART.head] + parts[PART.neck] * toHead);
  add(BONE.jaw, parts[PART.jaw]);

  const tail = parts[PART.tail];
  if (tail > 1e-4) {
    const u = tailParam(point);
    let previous = 1;
    for (let joint = 1; joint <= TAIL_BONES; joint++) {
      const next = joint < TAIL_BONES ? 1 - smoothstep(joint - 0.35, joint + 0.35, u) : 0;
      add(BONE.tail + joint - 1, tail * (previous - next));
      previous = next;
    }
  }

  list.sort((a, b) => b.weight - a.weight);
  const kept = list.slice(0, 4);
  const total = kept.reduce((sum, item) => sum + item.weight, 0) || 1;
  return kept.map(({ bone, weight }) => ({ bone, weight: weight / total }));
}

/** Meshes the coat sculpture and paints it: colours, lip and eye rim pigment, and skin weights. */
export function buildCoatData(cell = COAT_CELL, field: Field = coatField()): CoatData {
  const mesh = meshField(field, { cell });
  const count = mesh.positions.length / 3;
  const colors = new Float32Array(count * 3);
  const skinIndices = new Uint16Array(count * 4);
  const skinWeights = new Float32Array(count * 4);

  const carves = field.shapes.flatMap((shape, index) => (shape.carve ? [index] : []));
  const headToDog = headRestMatrix();
  const eyes = faceLayout().eyes.map((eye) => new Vector3(...eye.position).applyMatrix4(headToDog));
  const neck = neckAxis(headToDog);
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

    let cut = Infinity;
    for (const index of carves) cut = Math.min(cut, field.shapeDistance(index, point.x, point.y, point.z));
    const inside = smoothstep(0.0026, 0.0008, cut);
    const lip = smoothstep(0.0048, 0.0026, cut) * (1 - inside);
    // A faint shadow of dark lashes round each eye, too soft to read as a ring.
    let rim = 0;
    for (const eye of eyes) rim = Math.max(rim, smoothstep(0.022 * HEAD.scale, 0.0175 * HEAD.scale, eye.distanceTo(point)));
    color.lerp(pigment, Math.max(lip * 0.9, rim * 0.35)).lerp(mouth, inside);
    color.toArray(colors, n * 3);

    influences(point, sample.parts, neck).forEach(({ bone, weight }, slot) => {
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
