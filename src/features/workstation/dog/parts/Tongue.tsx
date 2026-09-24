'use client';

import { useDisposable } from '../../useDisposable';
import { partGeometry, type PartData } from '../geometry/partGeometry';
import { useDogMaterials } from '../MaterialsContext';

/** The tongue, in jaw space so it rides the panting jaw. */
export function Tongue({ data }: { data: PartData }) {
  const materials = useDogMaterials();
  const geometry = useDisposable(() => partGeometry(data));
  return <mesh geometry={geometry} material={materials.tongue} />;
}
