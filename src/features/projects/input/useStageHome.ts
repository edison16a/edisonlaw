'use client';

import { useState, type RefObject } from 'react';
import { useScrollFrame } from '@/lib/hooks/useScrollFrame';
import { isStageHome } from './stageHome';

/** Whether the stage fills the viewport, as React state for styling. Event handlers ask isStageHome directly. */
export function useStageHome(stage: RefObject<HTMLElement | null>) {
  const [home, setHome] = useState(false);
  useScrollFrame(() => setHome(isStageHome(stage.current)));
  return home;
}
