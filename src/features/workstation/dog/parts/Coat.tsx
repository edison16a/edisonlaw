'use client';

import { useMemo } from 'react';
import { Matrix4, Skeleton, SkinnedMesh } from 'three';
import { useDisposable } from '../../useDisposable';
import { COAT_BOUNDS, coatGeometry, type CoatData } from '../geometry/coatGeometry';
import { useDogMaterials } from '../MaterialsContext';
import type { DogRig } from '../rig/createDogRig';

/**
 * The whole furry body as one skinned mesh, bound to the rig in its resting pose.
 * Render it directly under the rig's root: dog space is then both its bind space and its local space.
 */
export function Coat({ rig, data }: { rig: DogRig; data: CoatData }) {
  const materials = useDogMaterials();
  const geometry = useDisposable(() => coatGeometry(data));
  const skeleton = useDisposable(() => new Skeleton(rig.bones, rig.restInverses));
  const mesh = useMemo(() => {
    const skinned = new SkinnedMesh(geometry, materials.coat);
    skinned.name = 'dogCoat';
    skinned.bind(skeleton, new Matrix4());
    skinned.boundingSphere = COAT_BOUNDS.clone();
    return skinned;
  }, [geometry, materials.coat, skeleton]);

  return <primitive object={mesh} />;
}
