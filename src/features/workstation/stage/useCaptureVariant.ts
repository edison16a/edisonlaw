'use client';

import { useSyncExternalStore } from 'react';
import type { StageVariant } from '../types';

/**
 * Capture mode exists only for scripts/capture-renders.mjs. It works in development, and in a
 * production build only when built with NEXT_PUBLIC_CAPTURE=1, so the live site ignores the query.
 * Both values are inlined at build time, which drops the branch from normal builds.
 */
const CAPTURE_ENABLED = process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_CAPTURE === '1';

/** `?capture=work` or `?capture=about` renders that stage full screen. */
const CAPTURE_PARAM = 'capture';

function readCaptureVariant(): StageVariant | null {
  if (!CAPTURE_ENABLED) return null;
  const value = new URLSearchParams(window.location.search).get(CAPTURE_PARAM);
  return value === 'work' || value === 'about' ? value : null;
}

const subscribe = () => () => {};

/** The variant being captured, or null on a normal visit. */
export function useCaptureVariant() {
  return useSyncExternalStore(subscribe, readCaptureVariant, () => null);
}
