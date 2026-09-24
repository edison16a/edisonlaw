import { BufferGeometry, Color, Float32BufferAttribute, Sphere, Uint16BufferAttribute, Uint32BufferAttribute, Vector3 } from 'three';
import { smoothstep } from '@/lib/math';
import { coatField } from '../anatomy/coat';
import { headRestMatrix } from '../anatomy/headPose';
import { EYE_RADII, faceLayout } from '../anatomy/face';
import { neckAxis } from '../anatomy/neck';
import { TAIL_PATH } from '../anatomy/tail';
import { HEAD, JOINTS, PART, RIBS } from '../dimensions';
import { DOG_PALETTE } from '../materials';
import { toneColor } from './paint';
import { BONE, TAIL_BONES } from '../rig/createDogRig';
import { createFieldSample, type Field } from '../sdf/field';
import { meshField } from '../sdf/surfaceNets';

/**
 * Loose bounds of the posed coat in dog space, for culling, so three never skins every vertex on the CPU
 * to measure the pose. Wide enough for the nose, the tip of the wagging tail and the head lifted to look
 * up, with room to spare, so the dog is never culled while any of it is on screen.
 */
export const COAT_BOUNDS = new Sphere(new Vector3(0, 0.35, -0.03), 0.7);

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

/** Heights over which the legs hand over from the planted paws to the body, which leans. */
const PLANTED = { from: 0.06, to: 0.24 } as const;

/** Dark lids round each eye: full pigment within `inner` eye widths of its centre, none past `outer`. */
const LIDS = { inner: 1.1, outer: 1.42, strength: 0.6 } as const;

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

  const planted = 1 - smoothstep(PLANTED.from, PLANTED.to, point.y);
  const dx = point.x / RIBS[0];
  const dy = (point.y - JOINTS.chest[1]) / RIBS[1];
  const dz = (point.z - JOINTS.chest[2]) / RIBS[2];
  const ribs = Math.exp(-(dx * dx + dy * dy + dz * dz) * 1.2) * (1 - planted);

  const along = point.clone().sub(neck.base).dot(neck.direction) / neck.length;
  const toHead = smoothstep(0.15, 0.95, along);

  const body = parts[PART.body] + parts[PART.neck] * (1 - toHead);
  add(BONE.root, body * planted);
  add(BONE.chest, body * ribs);
  add(BONE.body, body * (1 - planted - ribs));
  add(BONE.head, parts[PART.head] + parts[PART.neck] * toHead);

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

/** Meshes the coat sculpture and paints it: colours, eye lid pigment, and skin weights. */
export function buildCoatData(cell = COAT_CELL, field: Field = coatField()): CoatData {
  const mesh = meshField(field, { cell });
  const count = mesh.positions.length / 3;
  const colors = new Float32Array(count * 3);
  const skinIndices = new Uint16Array(count * 4);
  const skinWeights = new Float32Array(count * 4);

  const headToDog = headRestMatrix();
  const eyes = faceLayout().eyes.map((eye) => new Vector3(...eye.position).applyMatrix4(headToDog));
  const neck = neckAxis(headToDog);
  const lidInner = EYE_RADII[0] * LIDS.inner * HEAD.scale;
  const lidOuter = EYE_RADII[0] * LIDS.outer * HEAD.scale;
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
    color.lerp(pigment, rim * LIDS.strength);
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
