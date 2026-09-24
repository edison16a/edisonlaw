'use client';

import { MeshStandardMaterial } from 'three';
import { SEATED_FOOT_REST } from '../character/placement';
import { createSlabGeometry } from '../geometry/slab';
import { createRibTexture } from '../materials/canvasTextures';
import { getMaterials } from '../materials/materials';
import { useDisposable } from '../useDisposable';

const WIDTH = 0.42;
const DEPTH = 0.24;
const PLATE = 0.03;
const LEG = { width: 0.03, inset: 0.035 };

/**
 * Under-desk footrest for the seated pose. His legs are too short to reach the floor from the chair,
 * so his sneakers rest on this plate, whose ribbed rubber top sits at SEATED_FOOT_REST height.
 */
export function Footrest() {
  const materials = getMaterials();
  const { left, right } = SEATED_FOOT_REST;
  const top = left[1];
  const legHeight = top - PLATE;

  const parts = useDisposable(() => {
    const ribs = createRibTexture();
    // The slab's top face is mapped in metres from its centre.
    ribs.repeat.set(1 / WIDTH, 1 / DEPTH);
    ribs.offset.set(0.5, 0.5);
    return {
      plate: createSlabGeometry({ width: WIDTH, depth: DEPTH, height: PLATE, radius: 0.02, bevel: 0.008 }),
      leg: createSlabGeometry({ width: LEG.width, depth: DEPTH * 0.86, height: legHeight, radius: 0.01, bevel: 0.004 }),
      rubber: new MeshStandardMaterial({ color: '#2a2a2e', map: ribs, roughness: 0.9 }),
    };
  });

  return (
    <group position={[(left[0] + right[0]) / 2, 0, left[2]]}>
      <mesh geometry={parts.plate} material={parts.rubber} position-y={legHeight} />
      {[-1, 1].map((side) => (
        <mesh key={side} geometry={parts.leg} material={materials.darkPlastic} position-x={side * (WIDTH / 2 - LEG.inset)} />
      ))}
    </group>
  );
}
