import type { ExperienceScreen } from '@/content/types';

/** Everything a monitor can show. The three apps plus one picture per experience entry. */
export type ScreenId = 'claude-code' | 'codex' | 'vscode' | ExperienceScreen;

/** Canvas size every screen is painted at. 16:9 to match the monitor panels. */
export const SCREEN_WIDTH = 1280;
export const SCREEN_HEIGHT = 720;
