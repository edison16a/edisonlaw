import { describe, expect, it } from 'vitest';
import { featuredProjectId, projects } from '@/content/projects';
import { featuredIndex } from './featured';

describe('featuredIndex', () => {
  it('opens on the featured project from the content', () => {
    expect(projects[featuredIndex(projects)].id).toBe(featuredProjectId);
  });

  it('finds a featured project anywhere in the list', () => {
    expect(featuredIndex(projects, projects[4].id)).toBe(4);
    expect(featuredIndex(projects, projects[projects.length - 1].id)).toBe(projects.length - 1);
  });

  it('falls back to the first project when the featured one is missing', () => {
    expect(featuredIndex(projects, 'no such project')).toBe(0);
    expect(featuredIndex([], featuredProjectId)).toBe(0);
  });
});
