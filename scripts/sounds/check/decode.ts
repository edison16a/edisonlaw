import { chromium } from 'playwright';
import { SAMPLE_RATE } from '../dsp/signal';

/**
 * Decodes an MP3 with Chromium's own decoder, exactly as the site will hear it.
 * The page code is a plain string so the TypeScript transform never leaks helpers into the browser.
 */
export async function decodeInChromium(mp3: Uint8Array): Promise<Float32Array> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const encoded = Buffer.from(mp3).toString('base64');
    const decoded = await page.evaluate(`(async () => {
      const bytes = Uint8Array.from(atob('${encoded}'), (c) => c.charCodeAt(0));
      const context = new OfflineAudioContext(1, 1, ${SAMPLE_RATE});
      const buffer = await context.decodeAudioData(bytes.buffer);
      const samples = buffer.getChannelData(0);
      const view = new Uint8Array(samples.buffer, samples.byteOffset, samples.byteLength);
      let binary = '';
      for (let i = 0; i < view.length; i += 0x8000) binary += String.fromCharCode(...view.subarray(i, i + 0x8000));
      return btoa(binary);
    })()`);
    const bytes = Buffer.from(String(decoded), 'base64');
    return new Float32Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  } finally {
    await browser.close();
  }
}
