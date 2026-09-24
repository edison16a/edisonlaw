'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { sound, type LoopName } from '@/features/sound';
import { useInView } from '@/lib/hooks/useInView';

interface AmbientSectionProps {
  id: string;
  labelledBy: string;
  /** Ambient loop that plays while the middle of the viewport is inside the section. */
  loop: LoopName;
  className?: string;
  children: ReactNode;
}

/** A page section that owns its ambient sound. The content inside can stay server rendered. */
export function AmbientSection({ id, labelledBy, loop, className, children }: AmbientSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { rootMargin: '-30% 0px -30% 0px' });

  useEffect(() => {
    sound.setLoop(loop, inView);
    return () => sound.setLoop(loop, false);
  }, [loop, inView]);

  return (
    <section id={id} ref={ref} aria-labelledby={labelledBy} className={className}>
      {children}
    </section>
  );
}
