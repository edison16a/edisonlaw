'use client';

import { CylinderGeometry } from 'three';
import { useDisposable } from '../../useDisposable';
import { useCharacterMaterials } from '../MaterialsContext';

/** Short neck from inside the collar up into the skull, in the neck bone's space. */
export function Neck() {
  const materials = useCharacterMaterials();
  const neck = useDisposable(() => new CylinderGeometry(0.048, 0.052, 0.13, 24, 1, true));
  return <mesh geometry={neck} material={materials.body} position={[0, 0.02, 0.004]} castShadow />;
}
