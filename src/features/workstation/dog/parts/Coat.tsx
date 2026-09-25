'use client';

import { useMemo } from 'react';
import { Matrix4, Skeleton, SkinnedMesh } from 'three';
import { useDisposable } from '../../useDisposable';
import { coatGeometry, type CoatData } from '../geometry/coatGeometry';
import { useDogMaterials } from '../MaterialsContext';
import type { DogSkeleton } from '../rig/skeleton';

/**
 * The whole furry body as one skinned mesh, bound to the rig in its resting pose.
 * Render it directly under the rig's root: dog space is then both its bind space and its local space.
 */
export function Coat({ rig, data }: { rig: DogSkeleton; data: CoatData }) {
  const materials = useDogMaterials();
  const geometry = useDisposable(() => coatGeometry(data));
  const skeleton = useDisposable(() => new Skeleton(rig.bones, rig.restInverses));
  const mesh = useMemo(() => {
    const skinned = new SkinnedMesh(geometry, materials.coat);
    skinned.name = 'dogCoat';
    skinned.bind(skeleton, new Matrix4());
    skinned.boundingSphere = rig.coatBounds.clone();
    return skinned;
  }, [geometry, materials.coat, skeleton, rig.coatBounds]);

  return <primitive object={mesh} />;
}
