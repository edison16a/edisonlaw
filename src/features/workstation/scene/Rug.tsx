'use client';

import { useEffect, useMemo } from 'react';
import { ExtrudeGeometry, MeshStandardMaterial } from 'three';
import { roundedRectShape } from '../geometry/shapes';
import { withEdgeFade } from '../materials/edgeFade';

/** Concentric bands from the outside in, dimmed versions of the reference's orange and mustard. */
const BANDS = [
  { inset: 0, color: '#6e3417' },
  { inset: 0.16, color: '#8f6524' },
  { inset: 0.3, color: '#6e3417' },
  { inset: 0.42, color: '#846229' },
];
const SIZE = { width: 3.3, depth: 2.4, radius: 0.34 };
const LAYER_HEIGHT = 0.004;

/** Layered rug under the chair, like the reference's striped mat. */
export function Rug() {
  const layers = useMemo(
    () =>
      BANDS.map(({ inset, color }) => {
        const shape = roundedRectShape(SIZE.width - inset * 2, SIZE.depth - inset * 2, Math.max(0.08, SIZE.radius - inset));
        const geometry = new ExtrudeGeometry(shape, {
          depth: LAYER_HEIGHT,
          bevelEnabled: true,
          bevelThickness: 0.003,
          bevelSize: 0.012,
          bevelSegments: 3,
          curveSegments: 10,
        });
        const material = withEdgeFade(new MeshStandardMaterial({ color, roughness: 1 }));
        return { geometry, material };
      }),
    [],
  );

  useEffect(
    () => () => {
      for (const { geometry, material } of layers) {
        geometry.dispose();
        material.dispose();
      }
    },
    [layers],
  );

  return (
    <group position={[-0.35, 0, 1.05]} rotation-x={-Math.PI / 2}>
      {layers.map(({ geometry, material }, index) => (
        <mesh key={index} geometry={geometry} material={material} position-z={index * LAYER_HEIGHT * 0.8} />
      ))}
    </group>
  );
}
