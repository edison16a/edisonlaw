'use client';

import { SpeakerIcon, SpeakerMutedIcon } from '@/components/icons';
import { sound } from './engine';
import { useSoundEnabled } from './useSoundEnabled';
import { useSoundLifecycle } from './useSoundLifecycle';

/**
 * Speaker switch at the right end of the navbar: a speaker while sound is on, crossed out while it is off.
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
      className="-mr-2 inline-flex size-10 items-center justify-center rounded-full text-white transition-[opacity,scale] duration-300 ease-out-expo hover:opacity-80 active:scale-90"
    >
      {enabled ? <SpeakerIcon size={20} /> : <SpeakerMutedIcon size={20} />}
    </button>
  );
}
