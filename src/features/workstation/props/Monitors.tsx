'use client';

import type { MonitorSlot } from '../layout';
import type { ScreenId } from '../screens/types';
import { Monitor } from './Monitor';

interface MonitorsProps {
  /** Centre monitor picture. Defaults to Codex. */
  centerScreen?: ScreenId;
  live: boolean;
}

/** The three screens: Claude Code on the left, VS Code on the right, the centre one set by the section. */
export function Monitors({ centerScreen, live }: MonitorsProps) {
  const screens: Record<MonitorSlot, ScreenId> = {
    left: 'claude-code',
    center: centerScreen ?? 'codex',
    right: 'vscode',
  };

  return (
    <>
      {(Object.keys(screens) as MonitorSlot[]).map((slot) => (
        <Monitor key={slot} slot={slot} screen={screens[slot]} live={live} />
      ))}
    </>
  );
}
