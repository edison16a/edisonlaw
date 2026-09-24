import type { Painter } from '../types';
import { paintFallback } from './fallback';

/** Hand designed painters keyed by project id. */
const painters: Record<string, Painter> = {};

/** The painter for a project, or the generic seeded one for ids without their own cover. */
export function painterFor(id: string): Painter {
  return painters[id] ?? paintFallback;
}
