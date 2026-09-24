'use client';

import { MeshStandardMaterial } from 'three';
import { createSlabGeometry } from '../geometry/slab';
import { DESK_MAT } from '../layout';
import { createDeskMatTexture } from '../materials/canvasTextures';
import { useDisposable } from '../useDisposable';

/** Felt mat under the keyboard and mouse, with rounded corners and a stitched edge. */
export function DeskMat() {
  const { width, depth, thickness } = DESK_MAT;
  const parts = useDisposable(() => {
    const felt = createDeskMatTexture(width, depth);
    // The slab's top face is mapped in metres from its centre, so scale the texture to fit it once.
    felt.repeat.set(1 / width, 1 / depth);
    felt.offset.set(0.5, 0.5);
    return {
      geometry: createSlabGeometry({ width, depth, height: thickness, radius: 0.016, bevel: 0.0012, bevelSegments: 2 }),
      material: new MeshStandardMaterial({ map: felt, roughness: 0.95 }),
    };
  });
  const [x, top, z] = DESK_MAT.center;
  return <mesh geometry={parts.geometry} material={parts.material} position={[x, top - thickness, z]} />;
}
