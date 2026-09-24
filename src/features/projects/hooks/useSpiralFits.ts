'use client';

import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { useWebGLSupport } from '@/lib/hooks/useWebGLSupport';
import { useSpiralStore } from '../state/spiralStore';

/**
 * Screens with room for the spiral stage. A phone turned on its side is wide
 * enough but far too short for the stage and its panel, so it gets the photo
 * carousel like any other phone.
 */
export const STAGE_QUERY = '(min-width: 768px) and (min-height: 521px)';
/** The opposite of STAGE_QUERY: screens that get the carousel whatever WebGL can do. */
export const CAROUSEL_QUERY = '(max-width: 767px), (max-height: 520px)';

/**
 * Classes that let CSS choose between the stage and the carousel before the
 * client knows the screen. They must match STAGE_QUERY.
 */
export const STAGE_ONLY = 'max-md:hidden [@media(max-height:520px)]:hidden';
export const CAROUSEL_ONLY = '[@media(min-width:768px)_and_(min-height:521px)]:hidden';

/**
 * True when the spiral fits the screen, WebGL is there to draw it and it has not failed this visit.
 * Assumed true on the server.
 */
export function useSpiralFits() {
  const roomy = useMediaQuery(STAGE_QUERY, true);
  const webgl = useWebGLSupport();
  const failed = useSpiralStore((state) => state.spiralFailed);
  return roomy && webgl && !failed;
}
