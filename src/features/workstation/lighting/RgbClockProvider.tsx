'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createRgbClock, type RgbClock } from './rgbClock';

const RgbClockContext = createContext<RgbClock | null>(null);

interface RgbClockProviderProps {
  /** False freezes the hue, for reduced motion. */
  animate: boolean;
  /** Each change fires one brightness pulse. */
  pulseKey?: number;
  children: ReactNode;
}

export function RgbClockProvider({ animate, pulseKey, children }: RgbClockProviderProps) {
  const [clock] = useState(() => createRgbClock(!animate));
  const lastKey = useRef(pulseKey);

  useEffect(() => {
    clock.setFrozen(!animate);
  }, [clock, animate]);

  useEffect(() => {
    if (pulseKey === lastKey.current) return;
    lastKey.current = pulseKey;
    clock.pulse();
  }, [clock, pulseKey]);

  return <RgbClockContext.Provider value={clock}>{children}</RgbClockContext.Provider>;
}

export function useRgbClock() {
  const clock = useContext(RgbClockContext);
  if (!clock) throw new Error('useRgbClock must be used inside RgbClockProvider');
  return clock;
}
