'use client';

import { useDisposable } from '../../useDisposable';
import { fingerGeometries, palmGeometry, thumbGeometry } from '../geometry/handGeometry';
import { useCharacterMaterials } from '../MaterialsContext';
import type { ArmRig } from '../rig/types';

/**
 * A soft chibi hand in the hand bone's space: a lofted palm with a thumb pad, four stubby fingers that
 * bend at the knuckle and the middle joint, and a thumb.
 */
export function Hand({ arm }: { arm: ArmRig }) {
  const materials = useCharacterMaterials();
  const { palm, thumb, fingers } = useDisposable(() => ({
    palm: palmGeometry(arm.thumbSide),
    thumb: thumbGeometry(),
    fingers: arm.fingers.map((_, index) => fingerGeometries(index)),
  }));

  return (
    <group>
      <mesh geometry={palm} material={materials.body} castShadow />
      {arm.fingers.map((knuckle, index) => (
        <primitive key={knuckle.name} object={knuckle}>
          <mesh geometry={fingers[index].base} material={materials.body} />
          <primitive object={arm.fingerTips[index]}>
            <mesh geometry={fingers[index].tip} material={materials.body} />
          </primitive>
        </primitive>
      ))}
      <primitive object={arm.thumb}>
        <mesh geometry={thumb} material={materials.body} />
      </primitive>
    </group>
  );
}
