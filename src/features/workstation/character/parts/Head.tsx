'use client';

import { useMemo } from 'react';
import { Euler, Quaternion } from 'three';
import { earGeometry } from '../geometry/earGeometry';
import { headGeometry } from '../geometry/headGeometry';
import { surfaceFrame } from '../geometry/headShape';
import { useGeometry } from '../geometry/useGeometry';
import { useCharacterMaterials } from '../MaterialsContext';

/** Ears sit a little below eye level, turned slightly forward and tipped back. */
const EAR = { theta: 102, phi: 91, lift: -0.006, flare: 0.32, tilt: 0.2 } as const;

function useEarFrames() {
  return useMemo(
    () =>
      ([1, -1] as const).map((side) => {
        const { position, quaternion } = surfaceFrame(EAR.theta, side * EAR.phi, EAR.lift);
        // The ear's local X points forward on his right and backward on his left, hence the side sign.
        const turn = new Quaternion().setFromEuler(new Euler(0, -side * EAR.flare, -side * EAR.tilt));
        return { side, position, quaternion: quaternion.multiply(turn) };
      }),
    [],
  );
}

/** Skull and ears, centred on the head centre. */
export function Head() {
  const materials = useCharacterMaterials();
  const skull = useGeometry(headGeometry);
  const ear = useGeometry(earGeometry);
  const ears = useEarFrames();

  return (
    <group>
      <mesh geometry={skull} material={materials.skin} castShadow receiveShadow />
      {ears.map(({ side, position, quaternion }) => (
        <mesh key={side} geometry={ear} material={materials.skin} position={position} quaternion={quaternion} castShadow />
      ))}
    </group>
  );
}
