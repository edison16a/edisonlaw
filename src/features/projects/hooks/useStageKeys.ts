'use client';

import { useCallback, useRef, type KeyboardEvent } from 'react';
import { spiralMotion } from '../state/spiralMotion';
import { useScrollToCard } from './useScrollToCard';

const NEXT = new Set(['ArrowRight', 'ArrowDown']);
const PREVIOUS = new Set(['ArrowLeft', 'ArrowUp']);

/** A key press counts from the card the last press asked for while the spiral is still on its way. */
const CHAIN_MS = 1500;

/** Arrow keys move one card while the stage has keyboard focus. Home and End jump to the ends. */
export function useStageKeys(count: number) {
  const scrollToCard = useScrollToCard();
  const last = useRef({ card: 0, at: -Infinity });

  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const chained = event.timeStamp - last.current.at < CHAIN_MS;
      const here = chained ? last.current.card : Math.round(spiralMotion.target);
      let card: number;
      if (NEXT.has(event.key)) card = !chained && spiralMotion.target < 0 ? 0 : here + 1;
      else if (PREVIOUS.has(event.key)) card = here - 1;
      else if (event.key === 'Home') card = 0;
      else if (event.key === 'End') card = count - 1;
      else return;
      event.preventDefault();
      card = Math.min(count - 1, Math.max(0, card));
      last.current = { card, at: event.timeStamp };
      scrollToCard(card);
    },
    [count, scrollToCard],
  );
}
