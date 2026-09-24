'use client';

import { useEffect, useState } from 'react';
import type { BufferGeometry } from 'three';

/** Builds a geometry once for the component's lifetime and frees its GPU buffers on unmount. */
export function useGeometry<T extends BufferGeometry>(build: () => T) {
  const [geometry] = useState(build);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}
