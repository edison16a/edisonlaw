import { seededRandom } from '@/lib/math';
import { step } from '../../../anim/timeline';

/**
 * A weighted ensemble run as a function of time: walkers finish one by one, then the
 * iteration closes, a table row and log lines appear and the next iteration starts.
 */

export const FIRST_ITERATION = 148;
export const MAX_ITERATIONS = 200;
export const SEGMENTS = 96;
export const BINS = 24;
/** Screen seconds per iteration, compressed from the real five minutes. */
const ITERATION_SECONDS = 9;
const LOOP_ITERATIONS = 3;

export interface IterationRow {
  iteration: number;
  bins: number;
  flux: string;
  time: string;
}

/** Target state flux settling toward steady state, per iteration. */
export function fluxAt(iteration: number) {
  const random = seededRandom(iteration * 131);
  return 3.2e-7 * (1 - Math.exp(-iteration / 38)) * (0.9 + random() * 0.2);
}

/** Scientific notation with a two digit exponent, the way the tools print it. */
const formatFlux = (value: number) => value.toExponential(2).replace(/e-(\d)$/, 'e-0$1');

export function rowFor(iteration: number): IterationRow {
  const random = seededRandom(iteration * 977);
  return {
    iteration,
    bins: 21 + Math.floor(random() * 4),
    flux: formatFlux(fluxAt(iteration)),
    time: `4m ${String(38 + Math.floor(random() * 20)).padStart(2, '0')}s`,
  };
}

/** Walkers per bin for the occupancy histogram, drifting a little each iteration. */
export function binCounts(iteration: number) {
  const random = seededRandom(iteration * 53);
  return Array.from({ length: BINS }, (_, bin) => {
    const shape = Math.exp(-((bin - 8) ** 2) / 40) * 7 + Math.exp(-((bin - 18) ** 2) / 12) * 3;
    return Math.max(0, Math.round(shape + random() * 2.2));
  });
}

export interface RunState {
  iteration: number;
  segments: number;
  /** True for the beat after the last walker, while walkers are split and merged. */
  resampling: boolean;
  spinner: number;
  elapsedMinutes: number;
}

export function runState(time: number): RunState {
  const loop = ITERATION_SECONDS * LOOP_ITERATIONS;
  const t = ((time % loop) + loop) % loop;
  const index = Math.floor(t / ITERATION_SECONDS);
  const progress = (t % ITERATION_SECONDS) / (ITERATION_SECONDS - 1.2);
  return {
    iteration: FIRST_ITERATION + index,
    segments: Math.min(SEGMENTS, Math.floor(progress * SEGMENTS)),
    resampling: progress >= 1,
    spinner: step(time, 8) % 8,
    elapsedMinutes: 821 + index * 5 + Math.floor(progress * 5),
  };
}

export const runKey = (state: RunState) => `${state.iteration}:${state.segments}:${state.resampling}:${state.spinner}`;
