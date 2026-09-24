'use client';

import { useEffect, type RefObject } from 'react';
import { nearestCardOf, stepFrom } from '../spiral/loop';
import { spiralMotion } from '../state/spiralMotion';
import { isStageHome } from './stageHome';
import { spinTo } from './steering';

const NEXT = new Set(['ArrowRight', 'ArrowDown']);
const PREVIOUS = new Set(['ArrowLeft', 'ArrowUp']);

/** A key press counts from the card the last press asked for while the spiral is still on its way. */
const CHAIN_MS = 1500;
/** Furthest held keys can run ahead of the cards, so a long press spins steadily instead of racing off. */
const MAX_LEAD = 6;

/** Fields and editors keep their own arrow keys. */
function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

/**
 * Arrow keys move one card at a time, forever in either direction. They work
 * whenever the stage surface has focus, and anywhere on the page while the
 * stage fills the viewport, so the page never moves for them there. Home, on
 * the focused surface, returns to the first project. PageDown, Space and End
 * are left alone, so they still scroll on to Work Experience.
 */
export function useSpinKeys(stage: RefObject<HTMLElement | null>, surface: RefObject<HTMLElement | null>, count: number) {
  useEffect(() => {
    let last = { card: 0, at: -Infinity };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const onSurface = event.target === surface.current;
      if (!onSurface && (isEditable(event.target) || !isStageHome(stage.current))) return;

      const chained = event.timeStamp - last.at < CHAIN_MS;
      const from = chained ? last.card : spiralMotion.target;
      let card: number;
      if (NEXT.has(event.key)) card = stepFrom(from, 1);
      else if (PREVIOUS.has(event.key)) card = stepFrom(from, -1);
      else if (event.key === 'Home' && onSurface) card = nearestCardOf(0, spiralMotion.value, count);
      else return;

      event.preventDefault();
      const here = Math.round(spiralMotion.value);
      card = Math.min(here + MAX_LEAD, Math.max(here - MAX_LEAD, card));
      last = { card, at: event.timeStamp };
      spinTo(card);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [stage, surface, count]);
}
