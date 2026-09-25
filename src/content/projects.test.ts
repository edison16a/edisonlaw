import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MAX_PICTURES } from '@/features/projects/gallery/pictures';
import { projects } from './projects';

const PUBLIC = join(__dirname, '..', '..', 'public');

describe('project pictures', () => {
  it(`list at most ${MAX_PICTURES} pictures per project, the thumbnail included`, () => {
    for (const project of projects) {
      const total = 1 + (project.screenshots?.length ?? 0);
      expect(total, project.id).toBeLessThanOrEqual(MAX_PICTURES);
    }
  });

  it('point at files that exist in /public', () => {
    for (const project of projects) {
      for (const src of [project.image, ...(project.screenshots ?? [])]) {
        expect(src.startsWith('/'), src).toBe(true);
        expect(existsSync(join(PUBLIC, src)), src).toBe(true);
      }
    }
  });

  it('never repeat a picture within a project', () => {
    for (const project of projects) {
      const pictures = [project.image, ...(project.screenshots ?? [])];
      expect(new Set(pictures).size, project.id).toBe(pictures.length);
    }
  });

  it('give Backbond two pictures, Standoff and Photo Craft five, and every other project just its cover', () => {
    const galleries: Record<string, number> = { backbond: 1, standoff: 4, 'photo-craft': 4 };
    for (const project of projects) {
      expect(project.screenshots?.length ?? 0, project.id).toBe(galleries[project.id] ?? 0);
      expect(project.image, project.id).toBe(`/projects/${project.id}.webp`);
    }
  });
});
