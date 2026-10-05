'use client';

import type { RefObject } from 'react';
import { experience } from '@/content/experience';
import { TimelineEntry } from './TimelineEntry';

interface TimelineProps {
  listRef: RefObject<HTMLOListElement | null>;
  /** Index of the entry being read, or -1 before the first. */
  active: number;
}

/** The jobs, one under another. The one being read is brightest. */
export function Timeline({ listRef, active }: TimelineProps) {
  return (
    <ol ref={listRef} className="flex flex-col gap-20 sm:gap-24">
      {experience.map((entry, index) => (
        <TimelineEntry key={entry.id} entry={entry} current={index === Math.max(active, 0)} />
      ))}
    </ol>
  );
}
