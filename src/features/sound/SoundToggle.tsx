'use client';

import { SpeakerOffIcon, SpeakerOnIcon } from '@/components/icons';
import { sound } from './engine';
import { useSoundEnabled } from './useSoundEnabled';

/** Bottom-right speaker switch. Sound starts off until the visitor turns it on. */
export function SoundToggle() {
  const enabled = useSoundEnabled();
  return (
    <button
      type="button"
      onClick={() => sound.setEnabled(!enabled)}
      aria-pressed={enabled}
      aria-label={enabled ? 'Turn sound off' : 'Turn sound on'}
      className="fixed right-5 bottom-5 z-50 inline-flex size-11 items-center justify-center rounded-full border border-grey-700 bg-black/70 text-white backdrop-blur-md transition-colors hover:border-white sm:right-8 sm:bottom-8"
    >
      {enabled ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
    </button>
  );
}
