'use client';

import { hairCapGeometry, undercutGeometry } from '../geometry/hairCap';
import { hairLocksGeometry } from '../geometry/hairLocks';
import { useGeometry } from '../geometry/useGeometry';
import { useCharacterMaterials } from '../MaterialsContext';

/** Jet black two block cut with a middle part, curtain bangs and a tapered nape. Centred on the head centre. */
export function Hair() {
  const materials = useCharacterMaterials();
  const cap = useGeometry(() => hairCapGeometry());
  const locks = useGeometry(hairLocksGeometry);
  const undercut = useGeometry(undercutGeometry);
  return (
    <group>
      <mesh geometry={cap} material={materials.hair} castShadow receiveShadow />
      <mesh geometry={locks} material={materials.hair} castShadow receiveShadow />
      <mesh geometry={undercut} material={materials.hairShort} receiveShadow />
    </group>
  );
}
