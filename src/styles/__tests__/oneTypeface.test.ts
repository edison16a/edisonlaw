import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * One typeface across the site. font-sans and font-display both point at Satoshi.
 * Any other family class, including font-mono, serif and arbitrary families, is off limits.
 * Geist Mono is only for the painted monitor screens, so only that folder is exempt.
 */
const OTHER_FAMILY = /\bfont-(mono|serif)\b|\bfont-\[(?!\d)[^\]]*\]|\bfont-\(family-name:[^)]*\)/g;

const EXEMPT = ['features/workstation/screens/'];

const SRC = join(__dirname, '..', '..');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return name.endsWith('.tsx') ? [path] : [];
  });
}

const files = walk(SRC).filter((file) => !EXEMPT.some((prefix) => relative(SRC, file).startsWith(prefix)));

describe('one typeface', () => {
  it.each(files.map((file) => [relative(SRC, file), file]))('%s uses only the Satoshi font classes', (_, file) => {
    const matches = readFileSync(file, 'utf8').match(OTHER_FAMILY) ?? [];
    expect(matches).toEqual([]);
  });
});
