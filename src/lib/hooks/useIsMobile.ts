'use client';

import { useMediaQuery } from './useMediaQuery';

/** Phones and small tablets, where the 3D scenes fall back to lighter versions. */
export const MOBILE_QUERY = '(max-width: 767px)';

export function useIsMobile() {
  return useMediaQuery(MOBILE_QUERY);
}
