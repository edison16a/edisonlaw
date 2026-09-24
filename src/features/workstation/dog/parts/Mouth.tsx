'use client';

import { SphereGeometry } from 'three';
import { useDisposable } from '../../useDisposable';
import { MOUTH_LINER } from '../anatomy/face';
import { useDogMaterials } from '../MaterialsContext';

/** The dark inside of the open mouth, just within the carved opening. Head space. */
export function Mouth() {
  const materials = useDogMaterials();
  const geometry = useDisposable(() => new SphereGeometry(1, 28, 16));
  return <mesh geometry={geometry} material={materials.mouth} position={MOUTH_LINER.center} scale={MOUTH_LINER.radii} />;
}
