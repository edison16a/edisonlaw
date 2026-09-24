'use client';

import { useEffect, useState, type RefObject } from 'react';

interface Options {
  /** Grows the viewport box, so things can mount before they scroll in. */
  rootMargin?: string;
  threshold?: number;
}

/** True while the element intersects the (expanded) viewport. */
export function useInView<T extends Element>(ref: RefObject<T | null>, { rootMargin = '0px', threshold = 0 }: Options = {}) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin, threshold });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, rootMargin, threshold]);

  return inView;
}
