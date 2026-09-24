import { describe, expect, it } from 'vitest';
import { describeDateRange, formatDateRange, formatYearMonth, padIndex } from '../format';

describe('formatYearMonth', () => {
  it('uses short month names', () => {
    expect(formatYearMonth({ year: 2026, month: 5 })).toBe('May 2026');
    expect(formatYearMonth({ year: 2022, month: 9 })).toBe('Sep 2022');
  });
});

describe('formatDateRange', () => {
  it('returns both ends of a range', () => {
    expect(formatDateRange({ start: { year: 2024, month: 6 }, end: { year: 2024, month: 7 } })).toEqual([
      'Jun 2024',
      'Jul 2024',
    ]);
  });

  it('says Present for ongoing roles', () => {
    expect(formatDateRange({ start: { year: 2026, month: 5 }, end: 'present' })).toEqual(['May 2026', 'Present']);
  });

  it('collapses a single month', () => {
    expect(formatDateRange({ start: { year: 2025, month: 7 }, end: { year: 2025, month: 7 } })).toEqual(['Jul 2025']);
  });

  it('prefers an explicit label', () => {
    const entry = { start: { year: 2024, month: 6 }, end: { year: 2024, month: 8 }, dateLabel: 'Summer 2024' };
    expect(formatDateRange(entry)).toEqual(['Summer 2024']);
  });
});

describe('describeDateRange', () => {
  it('joins the ends with a word, never a dash', () => {
    expect(describeDateRange({ start: { year: 2026, month: 3 }, end: { year: 2026, month: 6 } })).toBe(
      'Mar 2026 to Jun 2026',
    );
  });
});

describe('padIndex', () => {
  it('pads to two digits', () => {
    expect(padIndex(3)).toBe('03');
    expect(padIndex(12)).toBe('12');
  });
});
