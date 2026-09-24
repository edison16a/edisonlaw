'use client';

import { sound } from '@/features/sound';
import { cn } from '@/lib/cn';
import type { SpiralMode } from '../state/spiralStore';

interface ModeToggleProps {
  mode: SpiralMode;
  onChange: (mode: SpiralMode) => void;
  /** Word for the picture view. Screens that get the photo carousel instead of the spiral say "photos". */
  spiralLabel?: string;
  className?: string;
}

/** "spiral" and "list" with a small white dot between them. The active word is white. */
export function ModeToggle({ mode, onChange, spiralLabel = 'spiral', className }: ModeToggleProps) {
  const choose = (next: SpiralMode) => {
    if (next === mode) return;
    sound.play('toggle');
    onChange(next);
  };

  return (
    <div role="group" aria-label="Project view" className={cn('flex items-center gap-5', className)}>
      <ToggleWord label={spiralLabel} active={mode === 'spiral'} onSelect={() => choose('spiral')} className="justify-end" />
      <span aria-hidden="true" className="size-1.5 rounded-full bg-white" />
      <ToggleWord label="list" active={mode === 'list'} onSelect={() => choose('list')} />
    </div>
  );
}

interface ToggleWordProps {
  label: string;
  active: boolean;
  onSelect: () => void;
  className?: string;
}

/** On hover the word rolls up and a copy rolls in from below. */
function ToggleWord({ label, active, onSelect, className }: ToggleWordProps) {
  return (
    <div className={cn('flex min-w-16', className)}>
      <button
        type="button"
        aria-pressed={active}
        onClick={onSelect}
        onPointerEnter={() => !active && sound.play('hover')}
        className={cn(
          'group relative overflow-hidden text-lg leading-7 font-medium tracking-tight transition-colors duration-300',
          active ? 'text-white' : 'text-grey-400 hover:text-grey-200',
        )}
      >
        <span className="block transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">
          {label}
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-0 translate-y-full transition-transform duration-500 ease-out-expo group-hover:translate-y-0"
        >
          {label}
        </span>
      </button>
    </div>
  );
}
