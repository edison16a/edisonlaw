import { seededRandom } from '@/lib/math';

/** What Edison "types": a loop of plausible code, so key choice and spacing feel human. */
const SOURCE = `export async function deploy(env) {
  const build = await compile({ target: env, minify: true });
  if (!build.ok) throw new Error(build.log);
  return upload(build.files, { region: 'us-west-2' });
}
const results = runs.filter((run) => run.status === 'done').map(score);
await db.insert(users).values({ id, email, plan: 'pro' });
`;

const SYMBOL_KEYS: Record<string, [label: string, shifted: boolean]> = {
  ' ': ['space', false], '\n': ['enter', false], '(': ['9', true], ')': ['0', true], '{': ['[', true],
  '}': [']', true], '[': ['[', false], ']': [']', false], '.': ['.', false], ',': [',', false], ';': [';', false],
  ':': [';', true], "'": ["'", false], '"': ["'", true], '=': ['=', false], '>': ['.', true], '<': [',', true],
  '!': ['1', true], '-': ['-', false], '_': ['-', true], '/': ['/', false], '*': ['8', true], '&': ['7', true],
  '|': ['\\', true],
};

/** Key labels (see keyLayout) pressed for one character, shift first when needed. */
function keysForChar(char: string): string[] {
  const symbol = SYMBOL_KEYS[char];
  if (symbol) return symbol[1] ? ['lshift', symbol[0]] : [symbol[0]];
  const lower = char.toLowerCase();
  if (/^[a-z0-9]$/.test(lower)) return lower === char ? [lower] : ['lshift', lower];
  return [];
}

export interface TypingModel {
  /** Moves time forward and calls `press` for every key struck in that span. */
  advance(delta: number, press: (label: string) => void): void;
}

/**
 * Bursts of 8 to 12 keys per second with uneven gaps, short thinking pauses between bursts
 * and the odd correction with backspace.
 */
export function createTypingModel(seed = 1): TypingModel {
  const random = seededRandom(seed);
  const between = (min: number, max: number) => min + random() * (max - min);

  let cursor = Math.floor(random() * SOURCE.length);
  let wait = between(0.2, 0.8);
  let burstLeft = 0;
  let rate = 10;
  let corrections = 0;

  const startBurst = () => {
    burstLeft = Math.round(between(14, 46));
    rate = between(8, 12);
  };

  const strike = (press: (label: string) => void) => {
    if (corrections > 0) {
      corrections -= 1;
      press('backspace');
      return 1;
    }
    const char = SOURCE[cursor];
    cursor = (cursor + 1) % SOURCE.length;
    const keys = keysForChar(char);
    keys.forEach(press);
    if (random() < 0.035) corrections = Math.ceil(between(0, 3));
    // Word breaks and new lines take a touch longer.
    return char === ' ' ? 1.3 : char === '\n' ? 2 : 0.94;
  };

  return {
    advance(delta, press) {
      wait -= delta;
      while (wait <= 0) {
        if (burstLeft <= 0) startBurst();
        const stretch = strike(press);
        burstLeft -= 1;
        wait += burstLeft > 0 ? (stretch * between(0.65, 1.35)) / rate : between(0.45, 1.9);
      }
    },
  };
}
