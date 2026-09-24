'use client';

import { useEffect, useState } from 'react';
import type { Project } from '@/content/types';
import { featuredIndex } from '../featured';
import { projectAt } from '../spiral/loop';
import { openingCard, placeSpiral } from '../state/spiralMotion';

/**
 * Where the spiral opens: on the featured project the first time, and on the
 * card it was showing if the stage comes back later in the visit, after a
 * resize for example. Returns that project, so its picture loads first.
 */
export function useOpeningCard(projects: Project[]) {
  const [opening] = useState(() => openingCard(featuredIndex(projects)));

  useEffect(() => {
    placeSpiral(opening);
  }, [opening]);

  return projectAt(opening, projects.length);
}
