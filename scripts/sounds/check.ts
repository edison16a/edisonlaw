/**
 * Checks the built sprite the way a browser hears it. Decodes public/audio/sprite.mp3 in
 * Chromium, compares every sound against a fresh render, confirms the sprite map lines up,
 * and draws each waveform and spectrum to a PNG you can look at.
 *
 *   npx tsx scripts/sounds/check.ts [out.png]
 */
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { SPRITE_REGIONS } from '../../src/features/sound/sprite';
import { buildSprite } from './build';
import { decodeInChromium } from './check/decode';
import { checkSound } from './check/measure';
import { PLOT_WIDTH, plotPage } from './check/plot';
import { DECODER_DELAY, SPRITE_FILE } from './config';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));

async function main() {
  const out = resolve(process.argv[2] ?? join(tmpdir(), 'sound-check.png'));
  const layout = buildSprite();
  const decoded = await decodeInChromium(readFileSync(resolve(ROOT, SPRITE_FILE)));

  const rows = layout.placed.map((placed) => {
    const region = SPRITE_REGIONS[placed.recipe.name];
    const target = { name: placed.recipe.name, audio: placed.audio, start: placed.start };
    return { check: checkSound(target, region, decoded), region, decoded };
  });

  for (const { check } of rows) {
    const fit = check.seam === undefined ? `captured ${((check.captured ?? 0) * 100).toFixed(2)}%` : `seam ${check.seam.toFixed(2)}x`;
    console.log(`${check.name.padEnd(8)} delay ${check.delay}  snr ${check.snrDb.toFixed(1)} dB  gain ${check.gainDb.toFixed(2)} dB  peak ${check.peakDb.toFixed(1)} dB  ${fit}`);
  }
  const off = rows.filter(({ check }) => Math.abs(check.delay - DECODER_DELAY) > 2);
  console.log(off.length ? `\ndelay differs from DECODER_DELAY (${DECODER_DELAY}) for ${off.map(({ check }) => check.name).join(', ')}` : '\ndecoder delay matches');

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: PLOT_WIDTH, height: 400 } });
  await page.setContent(plotPage(rows));
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
  console.log(`plot saved to ${out}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
