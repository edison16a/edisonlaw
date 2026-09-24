import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * House style: no em or en dashes, no double hyphens or spaced hyphens used as punctuation,
 * no midline dots or bullets inside text, and no arrows standing in for words.
 * Characters are built from code points so this file does not trip its own check.
 */
const char = (code: number) => String.fromCharCode(code);

const EVERYWHERE: { name: string; pattern: RegExp }[] = [
  { name: 'em dash', pattern: new RegExp(char(0x2014)) },
  { name: 'en dash', pattern: new RegExp(char(0x2013)) },
  { name: 'midline dot', pattern: new RegExp(char(0x00b7)) },
  { name: 'bullet', pattern: new RegExp(char(0x2022)) },
  { name: 'arrow', pattern: new RegExp(`[${char(0x2190)}-${char(0x21ff)}]`) },
  { name: 'double hyphen', pattern: /[A-Za-z,.)] -- [A-Za-z(]/ },
];

/** A hyphen with spaces around it is punctuation in prose, but subtraction in code. */
const PROSE_ONLY = [{ name: 'spaced hyphen', pattern: /[A-Za-z,.)] - [A-Za-z(]/ }];

/** Painted screen and cover art may imitate real app chrome, so it is exempt. */
const EXEMPT = ['features/workstation/screens/', 'features/projects/covers/'];

const SRC = join(__dirname, '..', '..');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return /\.(ts|tsx|css)$/.test(name) ? [path] : [];
  });
}

/** Comment text on a line, or the whole line for content files, which are all prose. */
function proseOf(line: string, isContent: boolean) {
  if (isContent) return line;
  const comment = line.match(/(?:\/\/|^\s*\*|\/\*)(.*)$/);
  return comment ? comment[1] : '';
}

const files = walk(SRC).filter((file) => !EXEMPT.some((prefix) => relative(SRC, file).startsWith(prefix)));

describe('writing style', () => {
  it.each(files.map((file) => [relative(SRC, file), file]))('%s follows the house style', (name, file) => {
    const isContent = name.startsWith('content/') && !name.includes('__tests__');
    const problems = readFileSync(file, 'utf8')
      .split('\n')
      .flatMap((line, index) => {
        const prose = proseOf(line, isContent);
        return [
          ...EVERYWHERE.filter(({ pattern }) => pattern.test(line)),
          ...PROSE_ONLY.filter(({ pattern }) => pattern.test(prose)),
        ].map(({ name: rule }) => `line ${index + 1}: ${rule}`);
      });
    expect(problems).toEqual([]);
  });
});
