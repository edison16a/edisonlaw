'use client';

import { useRef } from 'react';
import { cn } from '@/lib/cn';
import { FLAT, useEqualizer } from './useEqualizer';

const BARS = 4;

/** Four thin bars: gently moving while sound is on, a flat row of dots while it is off. */
export function EqualizerBars({ active }: { active: boolean }) {
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  useEqualizer(bars, active);

  return (
    <span aria-hidden="true" className="flex h-3.5 items-center gap-[3px]">
      {Array.from({ length: BARS }, (_, index) => (
        <span
          key={index}
          ref={(node) => {
            bars.current[index] = node;
          }}
          style={{ transform: `scaleY(${FLAT})` }}
          className={cn(
            'h-full w-[2px] rounded-full transition-colors duration-500 will-change-transform',
            active ? 'bg-white' : 'bg-grey-300 group-hover:bg-white',
          )}
        />
      ))}
    </span>
  );
}
