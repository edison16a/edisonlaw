'use client';

import type { Vec3 } from '../../layout';
import { useDisposable } from '../../useDisposable';
import { lipGeometry } from '../geometry/lipGeometry';
import { useDogMaterials } from '../MaterialsContext';

/** The dark line of the closed mouth. Head space. */
export function Lips({ line }: { line: Vec3[] }) {
  const materials = useDogMaterials();
  const geometry = useDisposable(() => lipGeometry(line));
  return <mesh geometry={geometry} material={materials.lips} />;
}
