import { createRandom } from './dsp/random';
import { SAMPLE_RATE, type Signal } from './dsp/signal';

/** Samples per MP3 frame, the natural chunk size for the encoder. */
const FRAME = 1152;

/** Float to 16 bit PCM with seeded triangular dither, so quiet tails fade out as soft noise, not grit. */
export function toPcm16(signal: Signal, seed = 16): Int16Array {
  const random = createRandom(seed);
  const pcm = new Int16Array(signal.length);
  for (let i = 0; i < signal.length; i++) {
    const dither = random() - random();
    const value = Math.round(signal[i] * 32767 + dither);
    pcm[i] = Math.max(-32768, Math.min(32767, value));
  }
  return pcm;
}

/** Encodes mono audio, or a left and right pair, to a constant bitrate MP3 with lamejs. */
export async function encodeMp3(audio: Signal | [Signal, Signal], kbps: number): Promise<Uint8Array> {
  // lamejs only exposes its encoder through the ESM build, hence the dynamic import.
  const { Mp3Encoder } = await import('@breezystack/lamejs');
  const channels = audio instanceof Float32Array ? [audio] : audio;
  const encoder = new Mp3Encoder(channels.length, SAMPLE_RATE, kbps);
  // Each ear gets its own dither, so the noise does not collapse into the middle.
  const pcm = channels.map((signal, index) => toPcm16(signal, 16 + index));
  const chunks: Uint8Array[] = [];
  const keep = (chunk: Uint8Array) => {
    // The encoder hands back signed bytes in a buffer it reuses, so every chunk is copied out.
    if (chunk.length > 0) chunks.push(Uint8Array.from(chunk));
  };

  for (let i = 0; i < pcm[0].length; i += FRAME) {
    const [left, right] = pcm.map((channel) => channel.subarray(i, i + FRAME));
    keep(encoder.encodeBuffer(left, right));
  }
  keep(encoder.flush());

  const out = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}
