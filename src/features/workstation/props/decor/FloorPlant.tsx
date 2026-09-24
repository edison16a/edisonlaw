'use client';

import { Color, DoubleSide, Float32BufferAttribute, LatheGeometry, MeshStandardMaterial, Vector2, type BufferGeometry } from 'three';
import { seededRandom } from '@/lib/math';
import { createLeafGeometry } from '../../geometry/leafGeometry';
import type { Vec3 } from '../../layout';
import { getMaterials } from '../../materials/materials';
import { useDisposable } from '../../useDisposable';

const POT_HEIGHT = 0.3;
const SOIL_Y = POT_HEIGHT - 0.03;
/** Leaf tones: the darker blade, the paler midrib and the lighter young tips. */
const BLADE = new Color('#2f6b22');
const RIB = new Color('#8cc46a');
const TIP = new Color('#5c9a3b');

/** Rounded pot profile, bottom to a rolled rim and down the inside, as radius and height pairs. */
const POT_PROFILE: [number, number][] = [
  [0, 0],
  [0.118, 0],
  [0.138, 0.008],
  [0.148, 0.03],
  [0.16, 0.2],
  [0.168, 0.268],
  [0.176, 0.29],
  [0.18, POT_HEIGHT - 0.004],
  [0.176, POT_HEIGHT],
  [0.166, POT_HEIGHT - 0.004],
  [0.158, POT_HEIGHT - 0.03],
  [0, POT_HEIGHT - 0.03],
];

/** Paints a leaf from its UVs: pale along the midrib, darker toward the edges, lighter toward the tip. */
function paintLeaf(geometry: BufferGeometry) {
  const uv = geometry.attributes.uv;
  const colors: number[] = [];
  const color = new Color();
  for (let i = 0; i < uv.count; i++) {
    const across = Math.abs(uv.getX(i) - 0.5) * 2;
    const along = uv.getY(i);
    color.copy(BLADE).lerp(TIP, along * 0.6).lerp(RIB, Math.max(0, 1 - across * 5) * 0.65);
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  return geometry;
}

interface LeafSpec {
  geometry: BufferGeometry;
  yaw: number;
  tilt: number;
}

/** A crown of big arching leaves around a few smaller upright ones in the middle. */
function createLeaves(): LeafSpec[] {
  const random = seededRandom(3);
  const outer = Array.from({ length: 9 }, (_, index) => ({
    geometry: paintLeaf(createLeafGeometry({ length: 0.42 + random() * 0.26, width: 0.15 + random() * 0.05, curl: 0.9 + random() * 0.7, segments: 18 })),
    yaw: (index / 9) * Math.PI * 2 + random() * 0.4,
    tilt: 0.12 + random() * 0.3,
  }));
  const inner = Array.from({ length: 5 }, (_, index) => ({
    geometry: paintLeaf(createLeafGeometry({ length: 0.26 + random() * 0.12, width: 0.1 + random() * 0.03, curl: 0.5 + random() * 0.4, segments: 14 })),
    yaw: (index / 5) * Math.PI * 2 + 0.3 + random() * 0.5,
    tilt: 0.02 + random() * 0.12,
  }));
  return [...outer, ...inner];
}

/** Big leafy plant in a pot, a toy like take on the reference's floor plant. */
export function FloorPlant({ position }: { position: Vec3 }) {
  const materials = getMaterials();
  const parts = useDisposable(() => ({
    pot: new LatheGeometry(POT_PROFILE.map(([r, y]) => new Vector2(r, y)), 56),
    leaves: createLeaves(),
    leafMaterial: new MeshStandardMaterial({ vertexColors: true, roughness: 0.5, side: DoubleSide }),
    soil: new MeshStandardMaterial({ color: '#1c140e', roughness: 1 }),
  }));

  return (
    <group position={position}>
      <mesh geometry={parts.pot} material={materials.whitePlastic} />
      <mesh material={parts.soil} position-y={SOIL_Y + 0.001} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.16, 40]} />
      </mesh>
      {parts.leaves.map(({ geometry, yaw, tilt }, index) => (
        <group key={index} position-y={SOIL_Y - 0.01} rotation-y={yaw}>
          <mesh geometry={geometry} material={parts.leafMaterial} rotation-x={tilt} />
        </group>
      ))}
    </group>
  );
}
