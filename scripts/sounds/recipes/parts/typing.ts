import { between, gaussian, vary, type Random } from '../../dsp/random';
import type { KeyKind } from './keystroke';

export interface KeyEvent {
  at: number;
  kind: KeyKind;
  level: number;
}

/** Keeps the lap edges quiet, so the pause that spans the loop point feels like any other pause. */
const EDGE_GAP = 0.35;

/**
 * When the keys fall across one lap of `seconds`: bursts of 3 to 14 keys at about
 * nine a second, spaces every few letters, the odd hesitation, and thinking pauses between.
 */
export function typingSchedule(seconds: number, random: Random): KeyEvent[] {
  const events: KeyEvent[] = [];
  let at = between(random, 0.2, 0.5);

  while (at < seconds - EDGE_GAP) {
    const count = Math.round(between(random, 3, 14));
    const burstLevel = between(random, 0.75, 1);
    let sinceSpace = 0;
    for (let key = 0; key < count && at < seconds - EDGE_GAP; key++) {
      const space = sinceSpace >= 3 && random() < 0.28;
      events.push({ at, kind: space ? 'space' : 'letter', level: burstLevel * vary(random, 1, 0.18) });
      sinceSpace = space ? 0 : sinceSpace + 1;
      const hesitation = random() < 0.08 ? between(random, 0.12, 0.3) : 0;
      at += Math.max(0.045, 0.105 + gaussian(random, 0.03)) + hesitation;
    }
    at += between(random, 0.45, 1.5);
  }
  return events;
}
