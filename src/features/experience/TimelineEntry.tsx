'use client';

import { motion } from 'motion/react';
import type { Experience } from '@/content/types';
import { DateRange } from '@/components/ui/DateRange';
import { cn } from '@/lib/cn';
import { EASE_OUT_EXPO } from '@/lib/easing';

interface TimelineEntryProps {
  entry: Experience;
  /** The entry the reader is on right now. */
  current: boolean;
  /** The rail has reached this entry, so its dot is filled. */
  reached: boolean;
}

/** One job on the timeline: dates, role, company and a few bullet points. */
/** Short points with small round markers, indented so wrapped lines line up with the text. */
function BulletList({ points, className }: { points: string[]; className?: string }) {
  return (
    <ul className={cn('flex max-w-xl list-disc flex-col gap-1.5 pl-5 leading-relaxed marker:text-grey-400', className)}>
      {points.map((point) => (
        <li key={point}>{point}</li>
      ))}
    </ul>
  );
}

export function TimelineEntry({ entry, current, reached }: TimelineEntryProps) {
  return (
    <motion.li
      data-entry
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
      className="relative pl-10 sm:pl-12"
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-1 left-0 size-[15px] rounded-full border transition-[background-color,border-color,box-shadow] duration-500',
          reached ? 'border-white bg-white' : 'border-grey-600 bg-black',
          current && 'shadow-[0_0_0_6px_rgba(255,255,255,0.08)]',
        )}
      />
      <div
        className={cn(
          'flex flex-col gap-3 transition-opacity duration-700 ease-out-expo',
          current ? 'opacity-100' : 'opacity-70',
        )}
      >
        <DateRange entry={entry} />
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl leading-tight font-bold sm:text-[1.7rem]">{entry.role}</h3>
          <p className="text-grey-200">
            {entry.company}
            {entry.context && <>, {entry.context}</>}
          </p>
        </div>
        <BulletList points={entry.points} className="text-grey-200" />
      </div>
    </motion.li>
  );
}
