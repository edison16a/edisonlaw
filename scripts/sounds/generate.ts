/**
 * Synthesises every site sound from scratch, packs them into one MP3 sprite and writes
 * the sprite map the runtime reads. Run with npm run sounds. Output is deterministic.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSprite } from './build';
import { BITRATE, SPRITE_FILE, SPRITE_MODULE } from './config';
import { encodeMp3 } from './encode';
import { printReport } from './report';
import { regionOf } from './sprite';
import { spriteModule } from './spriteModule';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));

function write(path: string, contents: string | Uint8Array) {
  const target = resolve(ROOT, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, contents);
}

async function main() {
  const layout = buildSprite();
  const mp3 = await encodeMp3(layout.buffer, BITRATE);
  const version = createHash('sha256').update(mp3).digest('hex').slice(0, 10);

  write(SPRITE_FILE, mp3);
  write(SPRITE_MODULE, spriteModule(layout.placed.map((placed) => [placed.recipe.name, regionOf(placed)]), version));
  printReport(layout, mp3.length);
  console.log(`wrote ${SPRITE_FILE} and ${SPRITE_MODULE}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
