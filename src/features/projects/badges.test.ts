import { describe, expect, it } from 'vitest';
import { projectBadges } from './badges';

describe('projectBadges', () => {
  it('leads with the hackathon win and its prizes, each with a trophy', () => {
    const badges = projectBadges({
      win: { hackathon: 'CruzHacks 2023', prizes: ['Best Lightship AR VPS Game'] },
      badges: ['App Store'],
    });
    expect(badges).toEqual([
      { label: 'Winner, CruzHacks 2023', mark: 'trophy' },
      { label: 'Best Lightship AR VPS Game', mark: 'trophy' },
      { label: 'App Store' },
    ]);
  });

  it('gives a project without a win only its status badges', () => {
    expect(projectBadges({ badges: ['In progress'] })).toEqual([{ label: 'In progress' }]);
    expect(projectBadges({ badges: [] })).toEqual([]);
  });

  it('marks a store feature with a star', () => {
    expect(projectBadges({ badges: ['Featured on the Chrome Web Store', '5.0 stars'] })).toEqual([
      { label: 'Featured on the Chrome Web Store', mark: 'star' },
      { label: '5.0 stars' },
    ]);
  });
});
