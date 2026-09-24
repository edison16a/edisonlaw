'use client';

import { useDisposable } from '../../useDisposable';
import { hairCapGeometry, undercutGeometry } from '../geometry/hairCap';
import { hairLocksGeometry } from '../geometry/hairLocks';
import { mergeParts } from '../geometry/merge';
import { addAroundTangents } from '../geometry/tangents';
import { useCharacterMaterials } from '../MaterialsContext';

/** Jet black two block cut with a middle part, curtain bangs and a tapered nape. Centred on the head centre. */
export function Hair() {
  const materials = useCharacterMaterials();
  const long = useDisposable(() => addAroundTangents(mergeParts([hairCapGeometry(), hairLocksGeometry()])));
  const undercut = useDisposable(undercutGeometry);
  return (
    <group>
      <mesh geometry={long} material={materials.hair} castShadow receiveShadow />
      <mesh geometry={undercut} material={materials.hairShort} receiveShadow />
    </group>
  );
}
