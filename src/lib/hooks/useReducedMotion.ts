'use client';

import { useMediaQuery } from './useMediaQuery';

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function useReducedMotion() {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}
