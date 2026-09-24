'use client';

import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { useSpiralStore, type SpiralMode } from './spiralStore';

/** The mode on screen: the visitor's pick, or list by default when they prefer reduced motion. */
export function useSpiralMode(): SpiralMode {
  const chosen = useSpiralStore((state) => state.chosenMode);
  const reducedMotion = useReducedMotion();
  return chosen ?? (reducedMotion ? 'list' : 'spiral');
}
