'use client';

import { useDisposable } from '../../useDisposable';
import { earGeometry } from '../geometry/earGeometry';
import { headGeometry } from '../geometry/headGeometry';
import { mergeParts } from '../geometry/merge';
import { useCharacterMaterials } from '../MaterialsContext';

/** Skull and ears as one mesh, centred on the head centre. */
export function Head() {
  const materials = useCharacterMaterials();
  const head = useDisposable(() => mergeParts([headGeometry(), earGeometry(1), earGeometry(-1)]));
  return <mesh geometry={head} material={materials.skin} castShadow receiveShadow />;
}
