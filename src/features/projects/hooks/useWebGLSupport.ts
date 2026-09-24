'use client';

import { useSyncExternalStore } from 'react';

let supported: boolean | null = null;

/** Asks the browser for a WebGL 2 context once and remembers the answer. */
function detect() {
  if (supported === null) {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2');
      supported = context !== null;
      context?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      supported = false;
    }
  }
  return supported;
}

const noop = () => () => {};

/** True when the spiral can render. Assumed true on the server and during hydration. */
export function useWebGLSupport() {
  return useSyncExternalStore(noop, detect, () => true);
}
