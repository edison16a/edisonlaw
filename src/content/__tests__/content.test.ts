import { describe, expect, it } from 'vitest';
import { activities, education, honors, skills, socials } from '../about';
import { experience } from '../experience';
import { projects } from '../projects';
import { getSkillIcon } from '@/components/skills/skillIcons';

const isUrl = (href: string) => /^(https:\/\/|mailto:)/.test(href);
const sentenceCount = (text: string) => text.split(/(?<=[.!?])\s+/).filter(Boolean).length;

describe('projects', () => {
  it('have unique ids', () => {
    const ids = projects.map((project) => project.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('have a name, a stack and a two to four sentence description at most', () => {
    for (const project of projects) {
      expect(project.name.trim()).not.toBe('');
      expect(project.stack.length).toBeGreaterThan(0);
      expect(sentenceCount(project.description)).toBeLessThanOrEqual(4);
    }
  });

  it('have a logo for every stack item', () => {
    for (const item of projects.flatMap((project) => project.stack)) {
      expect(getSkillIcon(item), item).toBeDefined();
    }
  });

  it('only link to secure urls', () => {
    for (const link of projects.flatMap((project) => project.links)) {
      expect(isUrl(link.href), link.href).toBe(true);
    }
  });
});

describe('experience', () => {
  it('has unique ids', () => {
    const ids = experience.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('never ends before it starts', () => {
    for (const entry of experience) {
      if (entry.end === 'present') continue;
      const start = entry.start.year * 12 + entry.start.month;
      const end = entry.end.year * 12 + entry.end.month;
      expect(end, entry.id).toBeGreaterThanOrEqual(start);
    }
  });

  it('keeps summaries short', () => {
    for (const entry of experience) expect(sentenceCount(entry.summary), entry.id).toBeLessThanOrEqual(3);
  });
});

describe('about', () => {
  it('has a secure link for every social', () => {
    for (const social of socials) expect(isUrl(social.href), social.href).toBe(true);
  });

  it('has an icon for every skill', () => {
    for (const item of skills.flatMap((group) => group.items)) {
      expect(getSkillIcon(item), item).toBeDefined();
    }
  });

  it('lists education, honors and activities', () => {
    expect(education.length).toBeGreaterThan(0);
    expect(honors.length).toBeGreaterThan(0);
    expect(activities.length).toBeGreaterThan(0);
  });
});
