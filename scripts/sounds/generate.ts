/**
 * Synthesises every site sound from scratch, packs the effects into one MP3 sprite,
 * renders the background music to a file of its own, and writes the maps the runtime
 * reads. Run with npm run sounds. Output is deterministic.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSprite } from './build';
import { BITRATE, MUSIC_BITRATE, MUSIC_FILE, MUSIC_MODULE, MUSIC_PATH, SPRITE_FILE, SPRITE_MODULE } from './config';
import { encodeMp3 } from './encode';
import { buildMusic } from './music/build';
import { layoutMusic, musicModule } from './music/layout';
import { printMusicReport } from './music/report';
import { printReport } from './report';
import { regionOf } from './sprite';
import { spriteModule } from './spriteModule';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));

const versionOf = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex').slice(0, 10);

function write(path: string, contents: string | Uint8Array) {
  const target = resolve(ROOT, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, contents);
}

async function main() {
  const layout = buildSprite();
  const mp3 = await encodeMp3(layout.buffer, BITRATE);
  write(SPRITE_FILE, mp3);
  write(SPRITE_MODULE, spriteModule(layout.placed.map((placed) => [placed.recipe.name, regionOf(placed)]), versionOf(mp3)));
  printReport(layout, mp3.length);
  console.log(`wrote ${SPRITE_FILE} and ${SPRITE_MODULE}\n`);

  const lap = buildMusic();
  const music = layoutMusic(lap);
  const track = await encodeMp3(music.file, MUSIC_BITRATE);
  write(MUSIC_FILE, track);
  write(MUSIC_MODULE, musicModule(MUSIC_PATH, music.region, versionOf(track)));
  printMusicReport(lap, track.length);
  console.log(`wrote ${MUSIC_FILE} and ${MUSIC_MODULE}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
