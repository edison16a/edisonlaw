'use client';

import { ContactShadows } from '@react-three/drei';

/** Just above the top layer of the rug, so the shadow lies on it rather than under it. */
const HEIGHT = 0.02;

/**
 * Soft contact shadows under the desk, chair, tower and plant, baked in the first frames
 * and never updated, so they ground the furniture without a shadow map.
 */
export function GroundShadow() {
  return (
    <ContactShadows
      position={[0.1, HEIGHT, 0.3]}
      scale={[5.4, 3.6]}
      resolution={512}
      far={0.9}
      blur={2.6}
      opacity={0.75}
      color="#000000"
      frames={4}
    />
  );
}
