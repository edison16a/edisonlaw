import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SOUNDS } from '../config';

const SRC = join(__dirname, '..', '..', '..');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : walk(path);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

/** Every place a sound is played, as "file: sound". */
const playedAt = walk(SRC).flatMap((file) =>
  [...readFileSync(file, 'utf8').matchAll(/sound\.play\('(\w+)'/g)].map((match) => `${relative(SRC, file)}: ${match[1]}`),
);

describe('the sound inventory', () => {
  it('has only the six one-shots, and no ambient loops', () => {
    expect(Object.keys(SOUNDS).sort()).toEqual(['blip', 'dot', 'hover', 'move', 'tab', 'toggle']);
  });

  it('plays each sound only where it belongs', () => {
    expect([...new Set(playedAt)].sort()).toEqual([
      'components/layout/NavTabs.tsx: hover',
      'components/layout/NavTabs.tsx: tab',
      'features/about/CopyEmail.tsx: blip',
      'features/experience/useDotSound.ts: dot',
      'features/projects/sound/moveSound.ts: move',
      'features/sound/engine.ts: toggle',
    ]);
  });

  it('keeps Work Experience and About Me to one quiet sound each', () => {
    const about = playedAt.filter((entry) => entry.startsWith('features/about/') || entry.startsWith('components/skills/') || entry.startsWith('components/ui/'));
    const experience = playedAt.filter((entry) => entry.startsWith('features/experience/'));
    expect(about).toEqual(['features/about/CopyEmail.tsx: blip']);
    expect(experience).toEqual(['features/experience/useDotSound.ts: dot']);
  });
});
