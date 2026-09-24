import type { Experience } from '@/content/types';
import { formatDateRange } from '@/lib/format';
import { cn } from '@/lib/cn';

/** Dates with a drawn rule between them instead of a dash character. */
export function DateRange({ entry, className }: { entry: Pick<Experience, 'start' | 'end' | 'dateLabel'>; className?: string }) {
  const [start, end] = formatDateRange(entry);
  return (
    <span className={cn('inline-flex items-center gap-2 font-mono text-xs text-grey-400', className)}>
      <span>{start}</span>
      {end && (
        <>
          <span aria-hidden="true" className="h-px w-3 bg-grey-600" />
          <span className="sr-only">to</span>
          <span>{end}</span>
        </>
      )}
    </span>
  );
}
