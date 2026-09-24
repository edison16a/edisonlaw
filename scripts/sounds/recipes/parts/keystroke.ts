import { rise, swell } from '../../dsp/envelopes';
import { bandpass } from '../../dsp/filters';
import { whiteNoise } from '../../dsp/noise';
import { between, vary, type Random } from '../../dsp/random';
import { mix, shape } from '../../dsp/signal';
import { softClick } from './softClick';

export type KeyKind = 'letter' | 'space';

/**
 * One mechanical key press and release. The press is a round "thock" of the cap
 * bottoming out; the release is a lighter click as the spring returns. Every key gets
 * its own pitch and timing, so a burst never sounds like a sample on repeat.
 */
export function keystroke(kind: KeyKind, random: Random) {
  const space = kind === 'space';
  const pitch = vary(random, space ? 230 : 380, 0.08);
  const hold = between(random, 0.07, 0.13);

  const press = softClick({
    seconds: 0.07,
    attack: 0.0006,
    puff: 0.5,
    puffTone: 3500,
    body: [
      { frequency: pitch, amplitude: 1, decay: space ? 0.022 : 0.014 },
      { frequency: pitch * 2.35, amplitude: 0.45, decay: 0.006 },
      { frequency: vary(random, 2100, 0.1), amplitude: 0.25, decay: 0.0025 },
    ],
    random,
  });
  const release = softClick({
    seconds: 0.04,
    attack: 0.0005,
    puff: 0.3,
    puffTone: 4000,
    body: [
      { frequency: pitch * 1.6, amplitude: 0.5, decay: 0.006 },
      { frequency: vary(random, 2800, 0.1), amplitude: 0.2, decay: 0.002 },
    ],
    random,
  });
  const layers = [{ signal: press }, { signal: release, level: vary(random, 0.4, 0.3), at: hold }];

  if (space) {
    // The long bar's stabiliser wire gives a short, dull rattle.
    const rattle = shape(bandpass(whiteNoise(0.03, random), 900, 2), (t) => rise(t, 0.001) * swell(t, 0.004, 0.03));
    layers.push({ signal: rattle, level: 0.35, at: 0.002 });
  }
  return mix(layers);
}
