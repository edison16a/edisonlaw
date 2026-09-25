'use client';

import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { useWebGLSupport } from '@/lib/hooks/useWebGLSupport';
import { useSpiralStore } from '../state/spiralStore';

/**
 * Screens with room for the spiral stage. A phone turned on its side is wide
 * enough but far too short for the stage and its panel, so it gets the photo
 * carousel like any other phone. Below 1024 px wide the panel stacks under
 * the spiral, which then needs a taller screen, or the details would run
 * into the focused card, so shorter windows that narrow get the carousel too.
 */
export const STAGE_QUERY = '(min-width: 1024px) and (min-height: 521px), (min-width: 768px) and (min-height: 700px)';
/** The opposite of STAGE_QUERY: screens that get the carousel whatever WebGL can do. */
export const CAROUSEL_QUERY = '(max-width: 767px), (max-height: 520px), (max-width: 1023px) and (max-height: 699px)';

/**
 * Classes that let CSS choose between the stage and the carousel before the
 * client knows the screen. They must match STAGE_QUERY.
 */
export const STAGE_ONLY =
  'max-md:hidden [@media(max-height:520px)]:hidden [@media(max-width:1023px)_and_(max-height:699px)]:hidden';
export const CAROUSEL_ONLY =
  '[@media(min-width:1024px)_and_(min-height:521px)]:hidden [@media(min-width:768px)_and_(min-height:700px)]:hidden';

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
