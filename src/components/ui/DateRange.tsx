import type { Experience } from '@/content/types';
import { describeDateRange } from '@/lib/format';
import { cn } from '@/lib/cn';

/** Dates written out with a word between them, for example "May 2026 to Present". */
export function DateRange({ entry, className }: { entry: Pick<Experience, 'start' | 'end' | 'dateLabel'>; className?: string }) {
  return <span className={cn('font-mono text-xs text-grey-400', className)}>{describeDateRange(entry)}</span>;
}
