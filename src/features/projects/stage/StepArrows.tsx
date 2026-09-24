'use client';

import { motion } from 'motion/react';
import { IconBase } from '@/components/icons/IconBase';
import { sound } from '@/features/sound';
import { cn } from '@/lib/cn';
import { EASE_OUT_EXPO } from '@/lib/easing';
import { stepSpiral } from '../input/steering';
import { useSpiralStore } from '../state/spiralStore';

interface StepArrowProps {
  direction: 1 | -1;
  label: string;
  /** Where the button sits, from the focused card's edges that the stage publishes. */
  place: string;
  /** The chevron, in the 24px icon grid. */
  path: string;
}

/**
 * Round previous and next buttons on either side of the focused card. Each
 * press turns the spiral one project in content order, round and round
 * forever, and quick presses queue up. They fade in once the spiral has drawn.
 */
export function StepArrows() {
  const ready = useSpiralStore((state) => state.ready);

  return (
    <motion.div
      initial={false}
      animate={{ opacity: ready ? 1 : 0 }}
      transition={{ duration: 0.8, delay: ready ? 0.5 : 0, ease: EASE_OUT_EXPO }}
      className={cn('pointer-events-none absolute inset-0 z-10 [--arrow-gap:1.25rem]', !ready && 'invisible')}
    >
      <StepArrow
        direction={-1}
        label="Previous project"
        place="left-[calc(var(--card-left,25%)-var(--arrow-gap)-3rem)]"
        path="m14.5 6-6 6 6 6"
      />
      <StepArrow
        direction={1}
        label="Next project"
        place="left-[calc(var(--card-right,75%)+var(--arrow-gap))]"
        path="m9.5 6 6 6-6 6"
      />
    </motion.div>
  );
}

function StepArrow({ direction, label, place, path }: StepArrowProps) {
  // The chevron leans the way it points on hover, and a press sinks the whole button a touch.
  const lean = direction > 0 ? 'group-hover:translate-x-0.5' : 'group-hover:-translate-x-0.5';
  return (
    <button
      type="button"
      aria-label={label}
      data-step={direction}
      onClick={() => stepSpiral(direction)}
      onPointerEnter={() => sound.play('hover')}
      className={cn(
        'group pointer-events-auto absolute top-[var(--card-middle,50%)] flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-grey-600 bg-black/75 text-white transition-[background-color,border-color,color,scale] duration-300 ease-out-expo hover:border-white hover:bg-white hover:text-black active:scale-90 active:duration-100',
        place,
      )}
    >
      <IconBase size={20} strokeWidth={1.75} className={cn('transition-transform duration-300 ease-out-expo', lean)}>
        <path d={path} />
      </IconBase>
    </button>
  );
}
