'use client';

import { useEffect, useState } from 'react';

interface Disposable {
  dispose(): void;
}

function isDisposable(value: object): value is Disposable {
  return typeof (value as Partial<Disposable>).dispose === 'function';
}

/** Frees `value` if it can be disposed, or everything disposable inside it when it is a plain array or object. */
function disposeAll(value: unknown) {
  if (typeof value !== 'object' || value === null) return;
  if (isDisposable(value)) value.dispose();
  else if (Array.isArray(value)) value.forEach(disposeAll);
  else if (Object.getPrototypeOf(value) === Object.prototype) Object.values(value).forEach(disposeAll);
}

/**
 * Builds GPU resources (geometries, materials, textures) once for the component's lifetime and frees
 * them on unmount. `build` may return one resource, or plain arrays and objects holding several.
 * Keep resources owned elsewhere out of the returned value, or they are freed too.
 * In development, strict mode runs the cleanup once early; three.js uploads the buffers again on the next frame.
 */
export function useDisposable<T>(build: () => T): T {
  const [value] = useState(build);
  useEffect(() => () => disposeAll(value), [value]);
  return value;
}
