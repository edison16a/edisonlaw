import { describe, expect, it } from 'vitest';
import { projectBadges } from './badges';

describe('projectBadges', () => {
  it('leads with the hackathon win and its prizes, each with a trophy', () => {
    const badges = projectBadges({
      win: { hackathon: 'CruzHacks 2023', prizes: ['Best Lightship AR VPS Game'] },
      badges: ['App Store'],
    });
    expect(badges).toEqual([
      { label: 'Winner, CruzHacks 2023', trophy: true },
      { label: 'Best Lightship AR VPS Game', trophy: true },
      { label: 'App Store', trophy: false },
    ]);
  });

  it('gives a project without a win only its status badges', () => {
    expect(projectBadges({ badges: ['In progress'] })).toEqual([{ label: 'In progress', trophy: false }]);
    expect(projectBadges({ badges: [] })).toEqual([]);
  });
});
