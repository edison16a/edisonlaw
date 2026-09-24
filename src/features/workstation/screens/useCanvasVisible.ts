'use client';

import { useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import { useInView } from '@/lib/hooks/useInView';

/** True while the surrounding R3F canvas element is on screen. */
export function useCanvasVisible() {
  const element = useThree((state) => state.gl.domElement);
  const ref = useMemo(() => ({ current: element }), [element]);
  return useInView(ref);
}
