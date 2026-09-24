'use client';

import { useSyncExternalStore } from 'react';
import type { StageVariant } from '../types';

/** `?capture=work` or `?capture=about` renders that stage full screen for scripts/capture-renders.mjs. */
export const CAPTURE_PARAM = 'capture';

function readCaptureVariant(): StageVariant | null {
  const value = new URLSearchParams(window.location.search).get(CAPTURE_PARAM);
  return value === 'work' || value === 'about' ? value : null;
}

const subscribe = () => () => {};

/** The variant being captured, or null on a normal visit. */
export function useCaptureVariant() {
  return useSyncExternalStore(subscribe, readCaptureVariant, () => null);
}
