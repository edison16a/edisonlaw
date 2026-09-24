'use client';

import { useDisposable } from '../../useDisposable';
import type { FacePlacement } from '../anatomy/face';
import { partGeometry, type PartData } from '../geometry/partGeometry';
import { useDogMaterials } from '../MaterialsContext';

/** The glossy black nose leather on the front of the muzzle. Head space. */
export function Nose({ data, frame }: { data: PartData; frame: FacePlacement }) {
  const materials = useDogMaterials();
  const geometry = useDisposable(() => partGeometry(data));
  return <mesh geometry={geometry} material={materials.nose} position={frame.position} quaternion={frame.quaternion} />;
}
