'use client';

import { useEffect, useState } from 'react';
import { INTRO_INDEX, projectAt } from '../spiral/loop';
import { resetSpiralMotion, spiralMotion } from '../state/spiralMotion';

/**
 * Where the spiral opens. The first time it is the intro, halfway before the
 * first project. If the stage comes back later in the visit, after a resize
 * for example, it opens on the card it was showing. Returns the project to
 * load first.
 */
export function useOpeningCard(count: number) {
  const [opening] = useState(() => (spiralMotion.introAt === null ? Math.round(spiralMotion.target) : INTRO_INDEX));

  useEffect(() => {
    resetSpiralMotion(opening);
  }, [opening]);

  return projectAt(opening, count);
}
