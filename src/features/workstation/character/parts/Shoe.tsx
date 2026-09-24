'use client';

import { useDisposable } from '../../useDisposable';
import { BODY } from '../dimensions';
import { shoeGeometry } from '../geometry/shoeGeometry';
import { useCharacterMaterials } from '../MaterialsContext';

/** White sneaker with a pale sole and a thin dark stripe, in the foot bone's space. */
export function Shoe() {
  const materials = useCharacterMaterials();
  const shoe = useDisposable(() => shoeGeometry(BODY.ankle));
  return <mesh geometry={shoe} material={materials.shoe} castShadow receiveShadow />;
}
