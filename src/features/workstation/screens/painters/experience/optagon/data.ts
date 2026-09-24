import { randomValues, randomWalk, smooth } from '../../../draw/series';

/**
 * Seeded demo numbers behind the Backbond usage page. The workspace is a made up demo org,
 * so nothing here is a real customer, price or business figure.
 */

/** Compute hours so far this month. The screen counts up from here while it animates. */
export const COMPUTE_HOURS = 18420;

export const KPIS = [
  { label: 'Compute hours', value: COMPUTE_HOURS.toLocaleString('en-US'), delta: '+22%' },
  { label: 'Runs this month', value: '412', delta: '+8.1%' },
  { label: 'Active projects', value: '14', delta: '+2' },
  { label: 'Storage used', value: '2.4 TB', delta: '+0.3 TB' },
];
/** The KPI that counts up live. */
export const LIVE_KPI = 0;

export const DAYS = 30;

/** GPU, CPU and storage usage per day, stacked. */
export const USAGE = (() => {
  const gpu = smooth(randomWalk(11, DAYS, { start: 320, drift: 9, volatility: 70, min: 120 }), 2);
  const cpu = randomValues(12, DAYS, 110, 210);
  const storage = randomValues(13, DAYS, 40, 80);
  return gpu.map((value, index) => [value, cpu[index], storage[index] + index * 1.5]);
})();

export const USAGE_MAX = 1000;

/** Runs finished per day, for the runs card. */
export const RUNS_PER_DAY = smooth(randomWalk(21, 40, { start: 9, drift: 0.12, volatility: 1.6, min: 2 }), 3);

export const KPI_TRENDS = [
  smooth(randomWalk(33, 16, { start: 10, drift: 0.7, volatility: 1.4 }), 2),
  smooth(randomWalk(34, 16, { start: 10, drift: 0.3, volatility: 1 }), 2),
  smooth(randomWalk(31, 16, { start: 10, drift: 0.5, volatility: 1 }), 2),
  smooth(randomWalk(32, 16, { start: 10, drift: 0.35, volatility: 1.2 }), 2),
];

export type ProjectStatus = 'Running' | 'Queued' | 'Idle';

export const PROJECTS: { name: string; kind: string; runs: number; usage: number; lastRun: string; status: ProjectStatus }[] = [
  { name: 'Binder design', kind: 'Structure', runs: 148, usage: 0.82, lastRun: '4 min ago', status: 'Running' },
  { name: 'Docking screen', kind: 'Docking', runs: 96, usage: 0.64, lastRun: '22 min ago', status: 'Running' },
  { name: 'Stability scan', kind: 'Simulation', runs: 41, usage: 0.41, lastRun: '1 hr ago', status: 'Queued' },
  { name: 'Library triage', kind: 'Scoring', runs: 112, usage: 0.93, lastRun: '3 hr ago', status: 'Idle' },
  { name: 'Sandbox', kind: 'Notebook', runs: 15, usage: 0.12, lastRun: 'Yesterday', status: 'Idle' },
];
