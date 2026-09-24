import { randomValues, randomWalk, smooth } from '../../../draw/series';

/** Seeded numbers behind the Backbond usage and billing page. */

/** Compute hours so far this month. The screen counts up from here while it animates. */
export const COMPUTE_HOURS = 18420;

export const KPIS = [
  { label: 'Monthly recurring revenue', value: '$48.2k', delta: '+12.4%' },
  { label: 'Active organizations', value: '126', delta: '+9' },
  { label: 'Compute hours', value: COMPUTE_HOURS.toLocaleString('en-US'), delta: '+22%' },
  { label: 'Runs this month', value: '3,912', delta: '+8.1%' },
];

export const DAYS = 30;

/** GPU, CPU and storage usage per day, stacked. */
export const USAGE = (() => {
  const gpu = smooth(randomWalk(11, DAYS, { start: 320, drift: 9, volatility: 70, min: 120 }), 2);
  const cpu = randomValues(12, DAYS, 110, 210);
  const storage = randomValues(13, DAYS, 40, 80);
  return gpu.map((value, index) => [value, cpu[index], storage[index] + index * 1.5]);
})();

export const USAGE_MAX = 1000;

export const REVENUE = smooth(randomWalk(21, 40, { start: 31, drift: 0.45, volatility: 1.6 }), 3);

export const KPI_TRENDS = [
  smooth(randomWalk(31, 16, { start: 10, drift: 0.5, volatility: 1 }), 2),
  smooth(randomWalk(32, 16, { start: 10, drift: 0.35, volatility: 1.2 }), 2),
  smooth(randomWalk(33, 16, { start: 10, drift: 0.7, volatility: 1.4 }), 2),
  smooth(randomWalk(34, 16, { start: 10, drift: 0.3, volatility: 1 }), 2),
];

export type OrgStatus = 'Active' | 'Trialing' | 'Past due';

export const ORGS: { name: string; plan: string; seats: number; usage: number; mrr: string; status: OrgStatus }[] = [
  { name: 'Helix Therapeutics', plan: 'Enterprise', seats: 48, usage: 0.82, mrr: '$9,600', status: 'Active' },
  { name: 'Arbor Bio', plan: 'Team', seats: 14, usage: 0.64, mrr: '$2,380', status: 'Active' },
  { name: 'Cellwise Labs', plan: 'Team', seats: 9, usage: 0.41, mrr: '$1,530', status: 'Trialing' },
  { name: 'Quanta Rx', plan: 'Enterprise', seats: 31, usage: 0.93, mrr: '$7,450', status: 'Active' },
  { name: 'Meridian Peptides', plan: 'Starter', seats: 4, usage: 0.27, mrr: '$390', status: 'Past due' },
];
