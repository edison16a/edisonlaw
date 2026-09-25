'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { createRgbClock, type RgbClock } from './rgbClock';

const RgbClockContext = createContext<RgbClock | null>(null);

interface RgbClockProviderProps {
  /** False freezes the hue, for reduced motion. */
  animate: boolean;
  children: ReactNode;
}

export function RgbClockProvider({ animate, children }: RgbClockProviderProps) {
  const [clock] = useState(() => createRgbClock(!animate));

  useEffect(() => {
    clock.setFrozen(!animate);
  }, [clock, animate]);

  return <RgbClockContext.Provider value={clock}>{children}</RgbClockContext.Provider>;
}

export function useRgbClock() {
  const clock = useContext(RgbClockContext);
  if (!clock) throw new Error('useRgbClock must be used inside RgbClockProvider');
  return clock;
}
