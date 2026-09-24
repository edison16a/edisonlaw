'use client';

import { hairCapGeometry, undercutGeometry } from '../geometry/hairCap';
import { hairLocksGeometry } from '../geometry/hairLocks';
import { mergeParts } from '../geometry/merge';
import { useGeometry } from '../geometry/useGeometry';
import { useCharacterMaterials } from '../MaterialsContext';

/** Jet black two block cut with a middle part, curtain bangs and a tapered nape. Centred on the head centre. */
export function Hair() {
  const materials = useCharacterMaterials();
  const long = useGeometry(() => mergeParts([hairCapGeometry(), hairLocksGeometry()]));
  const undercut = useGeometry(undercutGeometry);
  return (
    <group>
      <mesh geometry={long} material={materials.hair} castShadow receiveShadow />
      <mesh geometry={undercut} material={materials.hairShort} receiveShadow />
    </group>
  );
}
