'use client';

import { DOG_PAT_POINT } from '../layout';
import { DOG_PLACEMENT } from './placement';

export interface DogProps {
  /** False freezes the idle animation, for reduced motion. */
  animate?: boolean;
}

/**
 * Placeholder golden retriever with the final props: a body and a head whose top sits at DOG_PAT_POINT.
 * The real model replaces the body of this component.
 */
export function Dog({ animate = true }: DogProps) {
  void animate;
  const [x, , z] = DOG_PLACEMENT.position;
  return (
    <group>
      <mesh position={[x, 0.3, z]} rotation-y={DOG_PLACEMENT.rotationY}>
        <capsuleGeometry args={[0.12, 0.3, 8, 16]} />
        <meshStandardMaterial color="#d49a4f" />
      </mesh>
      <mesh position={[DOG_PAT_POINT[0], DOG_PAT_POINT[1] - 0.09, DOG_PAT_POINT[2]]}>
        <sphereGeometry args={[0.09, 24, 16]} />
        <meshStandardMaterial color="#d49a4f" />
      </mesh>
    </group>
  );
}
