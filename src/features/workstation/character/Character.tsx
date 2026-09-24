'use client';

import { useState } from 'react';
import { CharacterBody } from './CharacterBody';
import { CharacterMaterialsProvider } from './MaterialsContext';
import { HeldMug } from './parts/Mug';
import { createRig } from './rig/createRig';
import { useCharacterMotion, type CharacterPose } from './rig/useCharacterMotion';

export type { CharacterPose };

export interface CharacterProps {
  pose: CharacterPose;
  /** False freezes the idle animation, for reduced motion. */
  animate?: boolean;
}

/** Each pose gets its own seed, so its idle motion has its own rhythm. */
const SEEDS: Record<CharacterPose, number> = { seated: 11, standing: 29 };

/**
 * Edison as a chibi 3D character, built procedurally. In his own space he faces +Z.
 * Seated, the origin is where his pelvis meets the seat; standing, it is the floor between his feet.
 * Place him with SEATED_PLACEMENT or STANDING_PLACEMENT from ./placement.
 */
export function Character({ pose, animate = true }: CharacterProps) {
  const [rig] = useState(createRig);
  useCharacterMotion(rig, { pose, animate, seed: SEEDS[pose] });

  return (
    <CharacterMaterialsProvider>
      <group name={`edison-${pose}`}>
        <CharacterBody rig={rig} rightHand={pose === 'standing' ? <HeldMug /> : null} />
      </group>
    </CharacterMaterialsProvider>
  );
}
