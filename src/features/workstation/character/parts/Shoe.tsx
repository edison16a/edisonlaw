'use client';

import { useDisposable } from '../../useDisposable';
import { BODY, SHOE_SCALE } from '../dimensions';
import { shoeGeometry } from '../geometry/shoeGeometry';
import { useCharacterMaterials } from '../MaterialsContext';

/** White sneaker with a pale sole and a thin dark stripe, in the foot bone's space before SHOE_SCALE. */
export function Shoe() {
  const materials = useCharacterMaterials();
  const shoe = useDisposable(() => shoeGeometry(BODY.ankle / SHOE_SCALE[1]));
  return <mesh geometry={shoe} material={materials.shoe} castShadow receiveShadow />;
}
