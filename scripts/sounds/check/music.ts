import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { MUSIC_LOOP } from '../../../src/features/sound/musicTrack';
import { MUSIC_FILE } from '../config';
import { rms, toDb } from '../dsp/analysis';
import { loudestDbA } from '../dsp/loudness';
import { toSamples } from '../dsp/signal';
import { buildMusic } from '../music/build';
import { MUSIC_DELAY, layoutMusic } from '../music/layout';
import { bandBalance } from '../music/report';
import { decodeInChromium } from './decode';
import { checkSound } from './measure';
import type { PlotRow } from './plot';
import { spectrogramBlock } from './spectrogram';

/**
 * Checks public/audio/music.mp3 as Chromium decodes it: each ear against a fresh render,
 * the loop region against the lap, and the seam of the decoded loop. Returns plot rows
 * and a spectrogram of the whole lap.
 */
export async function checkMusic(root: string, width: number) {
  const lap = buildMusic();
  const { start, region } = layoutMusic(lap);
  const decoded = await decodeInChromium(readFileSync(resolve(root, MUSIC_FILE)));
  const aligned = Math.abs(region.start - MUSIC_LOOP.start) < 0.01 && Math.abs(region.duration - MUSIC_LOOP.duration) < 0.01;
  console.log(`\nmusic region ${aligned ? 'matches the build' : 'is stale, run npm run sounds'}`);

  const rows: PlotRow[] = lap.map((audio, side) => {
    const name = side ? 'music R' : 'music L';
    const check = checkSound({ name, audio, start, loop: true }, MUSIC_LOOP, decoded[side]);
    const fit = Math.abs(check.delay - MUSIC_DELAY) <= 2 ? 'as expected' : `expected ${MUSIC_DELAY.toFixed(0)}`;
    console.log(`${name}  delay ${check.delay} (${fit})  snr ${check.snrDb.toFixed(1)} dB  peak ${check.peakDb.toFixed(1)} dB  seam ${(check.seam ?? 0).toFixed(2)}x`);
    return { check, region: MUSIC_LOOP, decoded: decoded[side], loop: true };
  });

  const from = toSamples(MUSIC_LOOP.start / 1000);
  const left = decoded[0].subarray(from, from + lap[0].length);
  const right = decoded[1].subarray(from, from + lap[1].length);
  const mono = Float32Array.from(left, (value, i) => (value + right[i]) / 2);
  console.log(`music as decoded: rms ${toDb(rms(mono)).toFixed(1)} dB, loudest ${loudestDbA(mono).toFixed(1)} dBA`);
  console.log(`  balance ${bandBalance(mono).map(({ name, db }) => `${name} ${db.toFixed(1)}`).join(', ')}`);
  return { rows, extra: spectrogramBlock('music', mono, width - 28, 260) };
}
