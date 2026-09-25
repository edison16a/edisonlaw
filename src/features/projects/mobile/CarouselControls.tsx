'use client';

import { IconBase } from '@/components/icons/IconBase';
import { sound } from '@/features/sound';

interface CarouselControlsProps {
  index: number;
  count: number;
  onMove: (index: number) => void;
}

/**
 * Previous and next buttons for the photo strip, for mice and switch access.
 * Swipes and the arrow keys also work. On touch screens a swipe is the way,
 * so there the buttons stay out of sight until keyboard focus reaches them.
 */
export function CarouselControls({ index, count, onMove }: CarouselControlsProps) {
  return (
    <div className="flex gap-2 pointer-coarse:not-focus-within:sr-only">
      <StepButton label="Previous project" disabled={index <= 0} onClick={() => onMove(index - 1)} path="m14.5 6-6 6 6 6" />
      <StepButton label="Next project" disabled={index >= count - 1} onClick={() => onMove(index + 1)} path="m9.5 6 6 6-6 6" />
    </div>
  );
}

interface StepButtonProps {
  label: string;
  disabled: boolean;
  onClick: () => void;
  /** The chevron, in the 24px icon grid. */
  path: string;
}

function StepButton({ label, disabled, onClick, path }: StepButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      // aria-disabled instead of disabled, so a keyboard user keeps focus on the button at either end.
      aria-disabled={disabled || undefined}
      onClick={() => !disabled && onClick()}
      onPointerEnter={() => !disabled && sound.play('hover')}
      className="inline-flex size-11 items-center justify-center rounded-full border border-grey-700 text-grey-200 transition-[border-color,color,opacity,transform] duration-300 ease-out-expo hover:border-grey-400 hover:text-white active:scale-95 aria-disabled:cursor-default aria-disabled:opacity-35 aria-disabled:hover:border-grey-700 aria-disabled:hover:text-grey-200 aria-disabled:active:scale-100"
    >
      <IconBase size={18}>
        <path d={path} />
      </IconBase>
    </button>
  );
}
