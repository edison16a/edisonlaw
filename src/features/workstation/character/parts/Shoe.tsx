'use client';

import { useEffect, useMemo } from 'react';
import { BODY } from '../dimensions';
import { shoeGeometries } from '../geometry/shoeGeometry';
import { useCharacterMaterials } from '../MaterialsContext';

/** White sneaker with a pale sole and a thin dark stripe, in the foot bone's space. */
export function Shoe() {
  const materials = useCharacterMaterials();
  const shoe = useMemo(() => shoeGeometries(BODY.ankle), []);

  useEffect(
    () => () => {
      shoe.upper.dispose();
      shoe.sole.dispose();
      shoe.stripe.dispose();
    },
    [shoe],
  );

  return (
    <group>
      <mesh geometry={shoe.upper} material={materials.shoe} castShadow receiveShadow />
      <mesh geometry={shoe.sole} material={materials.sole} castShadow receiveShadow />
      <mesh geometry={shoe.stripe} material={materials.shoeAccent} />
    </group>
  );
}
