'use client';

import { sound } from './engine';
import { EqualizerBars } from './EqualizerBars';
import { useSoundEnabled } from './useSoundEnabled';
import { useSoundLifecycle } from './useSoundLifecycle';

/**
 * Bottom right sound switch. Moving bars mean sound is on, a flat row means off.
 * Sound starts off until the visitor turns it on. It also mounts the page wide audio upkeep.
 */
export function SoundToggle() {
  useSoundLifecycle();
  const enabled = useSoundEnabled();

  return (
    <button
      type="button"
      onClick={() => sound.setEnabled(!enabled)}
      aria-pressed={enabled}
      aria-label="Sound"
      className="group fixed right-5 bottom-5 z-50 inline-flex size-11 items-center justify-center rounded-full border border-grey-700 bg-black/70 backdrop-blur-md transition-[border-color,background-color,scale] duration-300 ease-out-expo hover:border-grey-400 hover:bg-grey-900/80 active:scale-92 sm:right-8 sm:bottom-8"
    >
      <EqualizerBars active={enabled} />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-full mr-2.5 translate-x-1.5 rounded-full border border-grey-800 bg-black/70 px-2.5 py-1 font-mono text-[11px] leading-4 whitespace-nowrap text-grey-200 opacity-0 backdrop-blur-md transition-[opacity,translate] duration-300 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
      >
        {enabled ? 'Sound on' : 'Sound off'}
      </span>
    </button>
  );
}
