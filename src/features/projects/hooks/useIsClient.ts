'use client';

import { useSyncExternalStore } from 'react';

const noop = () => () => {};

/** False during the server render and hydration, true afterwards. */
export function useIsClient() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
