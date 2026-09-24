'use client';

import { useRef, type ReactNode } from 'react';
import { experience } from '@/content/experience';
import { WorkstationStage } from '@/features/workstation';
import { Timeline } from './Timeline';
import { useActiveEntry } from './useActiveEntry';
import { useDotSound } from './useDotSound';

/**
 * The timeline column and the pinned desk scene. They share the entry being read:
 * the centre monitor follows it and the RGB pulses on each new one.
 */
export function ExperienceTimeline({ header }: { header: ReactNode }) {
  const listRef = useRef<HTMLOListElement>(null);
  const active = useActiveEntry(listRef);
  const current = experience[Math.max(active, 0)];

  useDotSound(active);

  return (
    <>
      <div className="gutter pt-16 pb-24 lg:pt-[calc(var(--spacing-nav)+4rem)] lg:pb-[40vh]">
        {header}
        <Timeline listRef={listRef} active={active} />
      </div>
      <div className="order-first mt-nav aspect-[4/3] w-full lg:sticky lg:top-nav lg:order-none lg:mt-0 lg:aspect-auto lg:h-[calc(100dvh-var(--spacing-nav))]">
        <WorkstationStage variant="work" centerScreen={current.screen} pulseKey={Math.max(active, 0)} />
      </div>
    </>
  );
}
