'use client';

import { DoubleSide, LatheGeometry, MeshStandardMaterial, Vector2 } from 'three';
import { seededRandom } from '@/lib/math';
import { createLeafGeometry } from '../../geometry/leafGeometry';
import type { Vec3 } from '../../layout';
import { getMaterials } from '../../materials/materials';
import { useDisposable } from '../../useDisposable';

const LEAF_COUNT = 9;
const POT_HEIGHT = 0.3;

/** Rounded pot profile, bottom to rim, as radius and height pairs. */
const POT_PROFILE: [number, number][] = [
  [0, 0],
  [0.12, 0],
  [0.145, 0.02],
  [0.16, 0.2],
  [0.168, 0.27],
  [0.176, POT_HEIGHT],
  [0.162, POT_HEIGHT],
  [0.152, POT_HEIGHT - 0.03],
];

/** Big leafy plant in a pot, a toy-like take on the reference's floor plant. */
export function FloorPlant({ position }: { position: Vec3 }) {
  const materials = getMaterials();

  const parts = useDisposable(() => {
    const random = seededRandom(3);
    const leaves = Array.from({ length: LEAF_COUNT }, (_, index) => {
      const length = 0.42 + random() * 0.26;
      return {
        geometry: createLeafGeometry({ length, width: 0.15 + random() * 0.05, curl: 0.9 + random() * 0.7 }),
        yaw: (index / LEAF_COUNT) * Math.PI * 2 + random() * 0.4,
        tilt: 0.12 + random() * 0.3,
      };
    });
    return {
      pot: new LatheGeometry(POT_PROFILE.map(([r, y]) => new Vector2(r, y)), 40),
      leaves,
      leafMaterial: new MeshStandardMaterial({ color: '#3f7f2c', roughness: 0.55, side: DoubleSide }),
    };
  });

  return (
    <group position={position}>
      <mesh geometry={parts.pot} material={materials.whitePlastic} />
      <mesh position-y={POT_HEIGHT - 0.03} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.152, 32]} />
        <meshStandardMaterial color="#1c140e" roughness={1} />
      </mesh>
      {parts.leaves.map(({ geometry, yaw, tilt }, index) => (
        <group key={index} position-y={POT_HEIGHT - 0.04} rotation-y={yaw}>
          <mesh geometry={geometry} material={parts.leafMaterial} rotation-x={tilt} />
        </group>
      ))}
    </group>
  );
}
