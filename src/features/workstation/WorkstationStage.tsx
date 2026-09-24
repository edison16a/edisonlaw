'use client';

import type { ScreenId } from './screens/types';
import { cn } from '@/lib/cn';

export interface WorkstationStageProps {
  /** `work`: seated and typing, seen from behind. `about`: standing and looking at the screens. */
  variant: 'work' | 'about';
  /** What the centre monitor shows. Defaults to Codex. */
  centerScreen?: ScreenId;
  /** Change this number to make the RGB lighting pulse once. */
  pulseKey?: number;
  className?: string;
}

/**
 * The desk scene as a drop-in block. It fills its parent.
 * Placeholder until the 3D room lands: a quiet panel of the same size.
 */
export function WorkstationStage({ variant, className }: WorkstationStageProps) {
  return (
    <div
      className={cn('relative h-full w-full overflow-hidden bg-grey-950', className)}
      aria-hidden="true"
      data-variant={variant}
    />
  );
}
