import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * grey-400 (#858585) is the darkest grey that reaches WCAG AA (4.5:1) on black.
 * Darker greys are for borders, rules and dots, never for text.
 */
const DARK_TEXT = /\btext-grey-(500|600|700|800|900|950)\b/g;

const SRC = join(__dirname, '..', '..');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return name.endsWith('.tsx') ? [path] : [];
  });
}

describe('text contrast', () => {
  it.each(walk(SRC).map((file) => [relative(SRC, file), file]))('%s keeps text at grey-400 or lighter', (_, file) => {
    const matches = readFileSync(file, 'utf8').match(DARK_TEXT) ?? [];
    expect(matches).toEqual([]);
  });
});
