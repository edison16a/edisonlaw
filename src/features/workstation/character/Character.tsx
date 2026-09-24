'use client';

/**
 * Placeholder mannequin with the final props and proportions.
 * The real model replaces the body of this component.
 */
export interface CharacterProps {
  pose: 'seated' | 'standing';
  /** False freezes the idle animation, for reduced motion. */
  animate?: boolean;
}

export function Character({ pose }: CharacterProps) {
  const seated = pose === 'seated';
  return (
    <group>
      <mesh position={[0, seated ? 0.24 : 0.78, 0]}>
        <capsuleGeometry args={[0.16, 0.26, 8, 16]} />
        <meshStandardMaterial color="#1d3a8a" />
      </mesh>
      <mesh position={[0, seated ? 0.62 : 1.18, 0]}>
        <sphereGeometry args={[0.21, 32, 16]} />
        <meshStandardMaterial color="#e9c2a6" />
      </mesh>
    </group>
  );
}
