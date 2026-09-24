'use client';

import type { RefObject } from 'react';
import { motion, useScroll } from 'motion/react';
import { experience } from '@/content/experience';
import { TimelineEntry } from './TimelineEntry';

interface TimelineProps {
  listRef: RefObject<HTMLOListElement | null>;
  /** Index of the entry being read, or -1 before the first. */
  active: number;
}

/** Vertical rail with a white fill that follows the scroll, and a dot per entry. */
export function Timeline({ listRef, active }: TimelineProps) {
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 50%', 'end 50%'] });

  return (
    <div className="relative">
      <div aria-hidden="true" className="absolute top-2 bottom-2 left-[7px] w-px bg-grey-800">
        <motion.div className="h-full w-full origin-top bg-white" style={{ scaleY: scrollYProgress }} />
      </div>
      <ol ref={listRef} className="relative flex flex-col gap-20 sm:gap-24">
        {experience.map((entry, index) => (
          <TimelineEntry key={entry.id} entry={entry} current={index === Math.max(active, 0)} reached={index <= active} />
        ))}
      </ol>
    </div>
  );
}
