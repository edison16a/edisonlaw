'use client';

import { ExtrudeGeometry, MeshStandardMaterial } from 'three';
import { roundedRectShape } from '../geometry/shapes';
import { createFibreTexture } from '../materials/canvasTextures';
import { withEdgeFade } from '../materials/edgeFade';
import { useDisposable } from '../useDisposable';

/** Concentric bands from the outside in, dimmed versions of the reference's orange and mustard. */
const BANDS = [
  { inset: 0, color: '#5c2c15' },
  { inset: 0.16, color: '#7a5822' },
  { inset: 0.3, color: '#5c2c15' },
  { inset: 0.42, color: '#6f5426' },
];
const SIZE = { width: 3.3, depth: 2.4, radius: 0.34 };
const LAYER_HEIGHT = 0.004;
/** The rug's faces are mapped in metres, so this many fibre tiles cover one metre. */
const FIBRE_REPEAT = 3.5;

/** Layered wool rug under the chair, like the reference's striped mat. */
export function Rug() {
  const parts = useDisposable(() => {
    const fibre = createFibreTexture();
    fibre.repeat.set(FIBRE_REPEAT, FIBRE_REPEAT);
    const layers = BANDS.map(({ inset, color }) => {
      const shape = roundedRectShape(SIZE.width - inset * 2, SIZE.depth - inset * 2, Math.max(0.08, SIZE.radius - inset));
      const geometry = new ExtrudeGeometry(shape, {
        depth: LAYER_HEIGHT,
        bevelEnabled: true,
        bevelThickness: 0.003,
        bevelSize: 0.012,
        bevelSegments: 3,
        curveSegments: 10,
      });
      const material = withEdgeFade(new MeshStandardMaterial({ color, map: fibre, roughness: 1 }));
      return { geometry, material };
    });
    return { fibre, layers };
  });

  return (
    <group position={[-0.35, 0, 1.05]} rotation-x={-Math.PI / 2}>
      {parts.layers.map(({ geometry, material }, index) => (
        <mesh key={index} geometry={geometry} material={material} position-z={index * LAYER_HEIGHT * 0.8} />
      ))}
    </group>
  );
}
