'use client';

import { useDisposable } from '../../useDisposable';
import { partGeometry, type PartData } from '../geometry/partGeometry';
import { useDogMaterials } from '../MaterialsContext';

/** One floppy ear, in its ear bone's space. The right ear is the left one mirrored. */
export function Ear({ data, side }: { data: PartData; side: 1 | -1 }) {
  const materials = useDogMaterials();
  const geometry = useDisposable(() => partGeometry(data, side === -1));
  return <mesh geometry={geometry} material={materials.ear} />;
}
