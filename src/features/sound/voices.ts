interface Voice<Key> {
  key: Key;
  endsAt: number;
}

/**
 * Counts the one-shots still ringing, so a burst never piles up into mush.
 * A new voice that would pass a cap is skipped: cutting an old one short would click.
 */
export function createVoiceLimiter<Key extends string>(total: number, perKey: (key: Key) => number) {
  const voices: Voice<Key>[] = [];

  return {
    /** Claims a voice for `duration` ms from `now`, or returns false if there is no room. */
    tryStart(key: Key, now: number, duration: number) {
      for (let i = voices.length - 1; i >= 0; i--) if (voices[i].endsAt <= now) voices.splice(i, 1);
      if (voices.length >= total) return false;
      let same = 0;
      for (const voice of voices) if (voice.key === key) same++;
      if (same >= perKey(key)) return false;
      voices.push({ key, endsAt: now + duration });
      return true;
    },
  };
}
