import type { Experience, YearMonth } from '@/content/types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatYearMonth({ year, month }: YearMonth) {
  return `${MONTHS[month - 1]} ${year}`;
}

/**
 * Returns the two ends of an entry's date range, or a single label.
 * The UI draws the separator itself, so no dash characters end up in the text.
 */
export function formatDateRange(entry: Pick<Experience, 'start' | 'end' | 'dateLabel'>): string[] {
  if (entry.dateLabel) return [entry.dateLabel];
  const start = formatYearMonth(entry.start);
  if (entry.end === 'present') return [start, 'Present'];
  const end = formatYearMonth(entry.end);
  return start === end ? [start] : [start, end];
}

/** Plain text version for screen readers and metadata, for example "Jun 2024 to Jul 2024". */
export function describeDateRange(entry: Pick<Experience, 'start' | 'end' | 'dateLabel'>) {
  return formatDateRange(entry).join(' to ');
}

/** Two digit index used in counters, for example 3 becomes "03". */
export const padIndex = (index: number) => String(index).padStart(2, '0');
