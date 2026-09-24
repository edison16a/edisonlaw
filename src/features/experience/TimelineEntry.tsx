'use client';

import { motion } from 'motion/react';
import type { Experience } from '@/content/types';
import { DateRange } from '@/components/ui/DateRange';
import { TagList } from '@/components/ui/Tag';
import { cn } from '@/lib/cn';

interface TimelineEntryProps {
  entry: Experience;
  /** The entry the reader is on right now. */
  current: boolean;
  /** The rail has reached this entry, so its dot is filled. */
  reached: boolean;
}

/** One job on the timeline: dates, role, company, summary and tags. */
export function TimelineEntry({ entry, current, reached }: TimelineEntryProps) {
  return (
    <motion.li
      data-entry
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
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
          current ? 'opacity-100' : 'opacity-50',
        )}
      >
        <DateRange entry={entry} />
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl leading-tight font-bold sm:text-[1.7rem]">{entry.role}</h3>
          <p className="text-grey-300">
            {entry.company}
            {entry.context && <span className="text-grey-500">, {entry.context}</span>}
          </p>
        </div>
        <p className="max-w-xl leading-relaxed text-grey-300">{entry.summary}</p>
        {entry.earlier && (
          <div className="max-w-xl border-l border-grey-800 pl-4 text-sm leading-relaxed text-grey-400">
            <p className="mb-1 font-mono text-[11px] tracking-wider text-grey-500 uppercase">Earlier</p>
            <p>
              <span className="text-grey-200">{entry.earlier.role}.</span> {entry.earlier.summary}
            </p>
          </div>
        )}
        <TagList items={entry.tags} className="pt-1" />
      </div>
    </motion.li>
  );
}
