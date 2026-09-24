'use client';

import { useRef } from 'react';
import { experience } from '@/content/experience';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { WorkstationStage } from '@/features/workstation';
import { useInView } from '@/lib/hooks/useInView';
import { Timeline } from './Timeline';
import { useActiveEntry } from './useActiveEntry';
import { useExperienceSounds } from './useExperienceSounds';

/**
 * Timeline on the left, desk scene pinned on the right.
 * The centre monitor follows the entry being read and the RGB pulses on each new one.
 */
export function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const active = useActiveEntry(listRef);
  const inView = useInView(sectionRef, { rootMargin: '-30% 0px -30% 0px' });
  const current = experience[Math.max(active, 0)];

  useExperienceSounds(active, inView);

  return (
    <section
      id="experience"
      ref={sectionRef}
      aria-labelledby="experience-title"
      className="relative flex flex-col border-t border-grey-900 lg:grid lg:grid-cols-2"
    >
      <div className="gutter pt-16 lg:pt-[calc(var(--spacing-nav)+4rem)] pb-[40vh]">
        <SectionHeader
          id="experience-title"
          title="Work Experience"
          lead="Startups, research labs and open source, newest first."
          className="mb-20"
        />
        <Timeline listRef={listRef} active={active} />
      </div>
      <div className="order-first mt-nav aspect-[4/3] w-full lg:sticky lg:mt-0 lg:top-nav lg:order-none lg:aspect-auto lg:h-[calc(100dvh-var(--spacing-nav))]">
        <WorkstationStage variant="work" centerScreen={current.screen} pulseKey={Math.max(active, 0)} />
      </div>
    </section>
  );
}
