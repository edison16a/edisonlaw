'use client';

import { useMemo } from 'react';
import { Matrix4, Skeleton, SkinnedMesh, Sphere, Vector3 } from 'three';
import { useDisposable } from '../../useDisposable';
import { coatGeometry, type CoatData } from '../geometry/coatGeometry';
import { useDogMaterials } from '../MaterialsContext';
import type { DogRig } from '../rig/createDogRig';

/** Loose bounds for culling, so three never skins every vertex on the CPU to measure the pose. */
const BOUNDS = new Sphere(new Vector3(0, 0.3, 0), 0.62);

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
    skinned.boundingSphere = BOUNDS.clone();
    return skinned;
  }, [geometry, materials.coat, skeleton]);

  return <primitive object={mesh} />;
}
