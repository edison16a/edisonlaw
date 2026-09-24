import { toSpans, tokenize } from './syntax';
import { withBackground, type Span } from './terminal';

/** One line of a unified diff as the terminal agents print it. */
export interface DiffLine {
  number: number;
  sign: ' ' | '+' | '-';
  code: string;
  /** Characters of `code` that changed, drawn with a stronger background. */
  changed?: [number, number];
}

/** Syntax coloured spans for each line, with the changed characters on `strong` backgrounds. */
export function diffCodeSpans(lines: DiffLine[], strong: { add: string; remove: string }): Span[][] {
  const tokens = tokenize(
    lines.map((line) => line.code),
    'tsx',
  );
  return lines.map((line, index) => {
    const spans = toSpans(tokens[index]);
    if (!line.changed || line.sign === ' ') return spans;
    return withBackground(spans, line.changed[0], line.changed[1], line.sign === '+' ? strong.add : strong.remove);
  });
}
