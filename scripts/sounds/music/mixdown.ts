import { highpass, lowpass } from '../dsp/filters';
import { crossfadeLoop, mixCircular, processLoop } from '../dsp/loop';
import { pinkNoise } from '../dsp/noise';
import { createRandom, type Random } from '../dsp/random';
import { reverb } from '../dsp/reverb';
import { mix, silence, slice, type Signal } from '../dsp/signal';
import { bassNote } from './instruments/bass';
import { brush, kick, shaker } from './instruments/drums';
import { electricPiano } from './instruments/keys';
import { padChord } from './instruments/pad';
import type { Score, Voice } from './score';
import { LAP } from './theory';

export type Stereo = [left: Signal, right: Signal];

interface Channel {
  level: number;
  /** -1 is hard left, 1 hard right. */
  pan: number;
  /** How much goes to the shared room. */
  send: number;
}

/** The balance of the band, set by ear and checked against the spectrum in scripts/sounds/check.ts. */
const CHANNELS: Record<Voice | 'pad', Channel> = {
  keys: { level: 0.3, pan: -0.12, send: 0.35 },
  lead: { level: 0.45, pan: 0.22, send: 0.5 },
  pad: { level: 0.13, pan: 0, send: 0.3 },
  bass: { level: 0.42, pan: 0, send: 0.04 },
  kick: { level: 0.45, pan: 0, send: 0.02 },
  brush: { level: 0.8, pan: 0.15, send: 0.25 },
  shaker: { level: 0.25, pan: 0.35, send: 0.15 },
};

/** Equal power pan gains for the left and right ear. */
const panGains = (pan: number) => [Math.cos(((pan + 1) * Math.PI) / 4), Math.sin(((pan + 1) * Math.PI) / 4)];

function render(voice: Voice, midi: number, duration: number, velocity: number, random: Random) {
  switch (voice) {
    case 'keys':
      return electricPiano(midi, duration, { velocity });
    case 'lead':
      return electricPiano(midi, duration, { velocity, tone: 4500 });
    case 'bass':
      return bassNote(midi, duration, velocity);
    case 'kick':
      return kick(velocity);
    case 'brush':
      return brush(velocity, random);
    case 'shaker':
      return shaker(velocity, random);
  }
}

/** A faint, warm hiss under everything, like a quiet tape, looped without a seam. */
function hiss(random: Random) {
  return crossfadeLoop(slice(lowpass(pinkNoise(LAP + 1.5, random), 3500, 0.6), 0.5), LAP, 1);
}

/**
 * Plays the score into one seamless stereo lap. Every note is placed on a
 * circle, so a chord that rings past the end carries on at the start, and the
 * room is run over two laps so its tail wraps too.
 */
export function mixdown({ hits, pads }: Score): Stereo {
  const random = createRandom(2024);
  const dry: Stereo = [silence(LAP), silence(LAP)];
  const send: Stereo = [silence(LAP), silence(LAP)];
  const place = (signal: Signal, at: number, { level, pan, send: wet }: Channel, ear?: 0 | 1) => {
    const gains = panGains(pan);
    for (const side of [0, 1] as const) {
      if (ear !== undefined && ear !== side) continue;
      mixCircular(dry[side], signal, at, level * gains[side]);
      mixCircular(send[side], signal, at, level * gains[side] * wet);
    }
  };

  for (const { voice, at, duration, midi, velocity } of hits) place(render(voice, midi, duration, velocity, random), at, CHANNELS[voice]);
  for (const { at, duration, notes } of pads) {
    const [left, right] = padChord(notes, duration, random);
    place(left, at, CHANNELS.pad, 0);
    place(right, at, CHANNELS.pad, 1);
  }

  // Two slightly different rooms, one per ear, so the reverb spreads wide instead of sitting in the middle.
  const room = send.map((signal, side) =>
    processLoop(signal, (twoLaps) => lowpass(reverb(twoLaps, { decay: 2.4, damping: 3200, size: side ? 1.13 : 1, preDelay: 0.02, tail: 0 }), 5000)),
  );
  const noise = hiss(random);
  return dry.map((signal, side) => mix([{ signal }, { signal: room[side], level: 0.55 }, { signal: noise, level: 0.004 }], LAP)) as Stereo;
}

/** The lap with its lowest rumble and harshest highs taken off, as a worn tape would. */
export function warm(lap: Stereo): Stereo {
  return lap.map((signal) => processLoop(signal, (twoLaps) => lowpass(highpass(twoLaps, 35, 0.6), 9000, 0.6))) as Stereo;
}
