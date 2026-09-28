'use client';

import { CylinderGeometry } from 'three';
import { useDisposable } from '../../useDisposable';
import { TRUNK_SCALE } from '../dimensions';
import { useCharacterMaterials } from '../MaterialsContext';

/** Neck from inside the collar up into the skull, in the neck bone's space. */
export function Neck() {
  const materials = useCharacterMaterials();
  const neck = useDisposable(() => new CylinderGeometry(0.05, 0.055, 0.13 * TRUNK_SCALE[1], 24, 1, true));
  return <mesh geometry={neck} material={materials.body} position={[0, 0.02 * TRUNK_SCALE[1], 0]} castShadow />;
}
