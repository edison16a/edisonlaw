import { describe, expect, it } from 'vitest';
import { skills } from '../about';
import { originIds, skillOrigin } from '../skillOrigins';

describe('skill origins', () => {
  const names = skills.flatMap((group) => group.items);

  it('gives every About skill a project or job that exists', () => {
    for (const name of names) {
      const origin = skillOrigin(name);
      expect(origin, name).toBeDefined();
      expect(originIds[origin!.kind].has(origin!.id), name).toBe(true);
    }
  });
});
