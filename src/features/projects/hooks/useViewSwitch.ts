'use client';

import { useCallback, type RefObject } from 'react';
import { useLenis } from 'lenis/react';
import { useSpiralStore, type SpiralMode } from '../state/spiralStore';

/** The pressed word of the view toggle. */
const TOGGLE_TARGET = '[data-view-toggle] [aria-pressed="true"]';
/** The spiral stage or the photo strip, whichever opened the project. */
const OPEN_TARGET = '[data-focus-on-open]';

/**
 * Switching between spiral and list, or opening a project from a list row,
 * swaps the whole view. Each switch returns the page to the top of Projects
 * and hands keyboard focus to the matching control in the new view, since the
 * one that had it is gone.
 */
export function useViewSwitch(section: RefObject<HTMLElement | null>) {
  const lenis = useLenis();
  const chooseMode = useSpiralStore((state) => state.chooseMode);
  const openInSpiral = useSpiralStore((state) => state.openInSpiral);

  const toTop = useCallback(() => {
    if (lenis) lenis.scrollTo('#projects', { immediate: true, force: true });
    else section.current?.scrollIntoView();
  }, [lenis, section]);

  const focusSoon = useCallback(
    (selector: string) => {
      requestAnimationFrame(() => section.current?.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true }));
    },
    [section],
  );

  const changeMode = useCallback(
    (next: SpiralMode) => {
      toTop();
      chooseMode(next);
      focusSoon(TOGGLE_TARGET);
    },
    [chooseMode, focusSoon, toTop],
  );

  const openProject = useCallback(
    (index: number) => {
      toTop();
      openInSpiral(index);
      focusSoon(OPEN_TARGET);
    },
    [focusSoon, openInSpiral, toTop],
  );

  return { changeMode, openProject };
}
