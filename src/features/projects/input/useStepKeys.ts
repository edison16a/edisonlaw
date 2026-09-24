'use client';

import { useEffect, type RefObject } from 'react';
import { stepSpiral } from './steering';

const STEPS: Partial<Record<string, 1 | -1>> = { ArrowRight: 1, ArrowLeft: -1 };

/** Share of the stage that has to be on screen for the arrow keys to turn the spiral. */
const ON_SCREEN = 0.5;

/** Fields and editors keep their own arrow keys. */
function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

function isOnScreen(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  return rect.height > 0 && visible >= rect.height * ON_SCREEN;
}

/**
 * The left and right arrow keys turn the spiral one project at a time while
 * most of the stage is on screen and no text field has focus. Up, down and the
 * other scrolling keys are left to the page. The arrow buttons carry
 * data-step, 1 or -1, so focus has somewhere to go when the panel changes.
 */
export function useStepKeys(stage: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const direction = STEPS[event.key];
      if (!direction || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const node = stage.current;
      if (!node || isEditable(event.target) || !isOnScreen(node)) return;
      event.preventDefault();
      stepSpiral(direction);
      // A focused link in the panel leaves with its project, so focus moves to the arrow for this direction.
      if (event.target instanceof HTMLAnchorElement && node.contains(event.target)) {
        node.querySelector<HTMLElement>(`[data-step="${direction}"]`)?.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [stage]);
}
