'use client';

import { CylinderGeometry } from 'three';
import { useGeometry } from '../geometry/useGeometry';
import { useCharacterMaterials } from '../MaterialsContext';

/** Short neck from inside the collar up into the skull, in the neck bone's space. */
export function Neck() {
  const materials = useCharacterMaterials();
  const neck = useGeometry(() => new CylinderGeometry(0.048, 0.052, 0.13, 24, 1, true));
  return <mesh geometry={neck} material={materials.body} position={[0, 0.02, 0.004]} castShadow />;
}
