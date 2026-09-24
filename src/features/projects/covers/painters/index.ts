import type { Painter } from '../types';
import { paintAutolab } from './autolab';
import { paintBackbond } from './backbond';
import { paintFallback } from './fallback';

/** Hand designed painters keyed by project id. */
const painters: Record<string, Painter> = {
  backbond: paintBackbond,
  autolab: paintAutolab,
};

/** The painter for a project, or the generic seeded one for ids without their own cover. */
export function painterFor(id: string): Painter {
  return painters[id] ?? paintFallback;
}
