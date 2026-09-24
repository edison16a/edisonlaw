'use client';

import { IconBase } from '@/components/icons/IconBase';
import { cn } from '@/lib/cn';
import { stepSpiral } from '../input/steering';
import { useSpiralStore } from '../state/spiralStore';

/** Size of a button and its inset from the focused card's side, in pixels. */
const SIZE = 48;
const INSET = 20;

interface StepButtonProps {
  direction: 1 | -1;
  label: string;
  /** Where the button's left side sits, from the focused card's sides that the stage publishes. */
  left: string;
  /** The chevron, in the 24px icon grid. */
  path: string;
}

/**
 * Previous and next buttons for keyboard and screen reader users. Everyone
 * else turns the spiral with the wheel, a swipe or a click on a card, so the
 * buttons stay out of sight until one takes keyboard focus. Then it shows
 * just inside the focused card's side. They wait for the spiral to draw.
 */
export function StepButtons() {
  const ready = useSpiralStore((state) => state.ready);

  return (
    <div className={cn('pointer-events-none absolute inset-0 z-10', !ready && 'invisible')}>
      <StepButton direction={-1} label="Previous project" left={`calc(var(--card-left, 25%) + ${INSET}px)`} path="m14.5 6-6 6 6 6" />
      <StepButton
        direction={1}
        label="Next project"
        left={`calc(var(--card-right, 75%) - ${INSET + SIZE}px)`}
        path="m9.5 6 6 6-6 6"
      />
    </div>
  );
}

function StepButton({ direction, label, left, path }: StepButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      data-step={direction}
      onClick={() => stepSpiral(direction)}
      style={{ left, top: 'var(--card-middle, 50%)', width: SIZE, height: SIZE }}
      // Hidden, it lets clicks through to the card underneath. Shown by keyboard focus, it takes them.
      className="absolute flex -translate-y-1/2 items-center justify-center rounded-full bg-black/80 text-white opacity-0 transition-opacity duration-200 focus-visible:pointer-events-auto focus-visible:opacity-100"
    >
      <IconBase size={20} strokeWidth={1.75}>
        <path d={path} />
      </IconBase>
    </button>
  );
}
