import { randomValues, randomWalk, smooth } from '../../../draw/series';

/** Edison's extensions and apps, with seeded usage behind the charts. */

export interface Extension {
  name: string;
  initials: string;
  color: string;
  users: number;
  rating: number;
  updated: string;
  featured?: boolean;
}

export const EXTENSIONS: Extension[] = [
  { name: 'SafeEats for Chrome', initials: 'SE', color: '#1e8e3e', users: 1480, rating: 4.9, updated: 'Sep 12', featured: true },
  { name: 'Clue.ai Study Helper', initials: 'CL', color: '#8430ce', users: 812, rating: 4.7, updated: 'Aug 30', featured: true },
  { name: 'Tab Focus', initials: 'TF', color: '#d93025', users: 604, rating: 4.6, updated: 'Aug 18' },
  { name: 'Quick Notes', initials: 'QN', color: '#e37400', users: 391, rating: 4.5, updated: 'Jul 27' },
  { name: 'Page Reader Lite', initials: 'PR', color: '#1967d2', users: 257, rating: 4.4, updated: 'Jun 30' },
];

export const WEEKLY_USERS = smooth(randomWalk(88, 26, { start: 1950, drift: 64, volatility: 90 }), 2);

export const DOWNLOADS = randomValues(91, 30, 38, 96).map((value, index) => value + index * 1.6);
