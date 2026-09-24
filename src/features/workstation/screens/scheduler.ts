/**
 * One shared clock for every animated screen. Each task runs at about 12 fps, and at most one
 * task runs per animation frame so several screens never repaint in the same frame.
 * The loop only exists while there are tasks, and requestAnimationFrame already stops in
 * background tabs.
 */

/** Receives the seconds since this task last ran. */
export type ScheduledTask = (delta: number) => void;

const INTERVAL = 1000 / 12;
/** Longest step a task is told about, so a paused tab does not fast forward the loop. */
const MAX_DELTA = 0.25;

interface Slot {
  run: ScheduledTask;
  due: number;
  last: number;
}

const slots = new Set<Slot>();
let handle = 0;

function loop(now: number) {
  handle = requestAnimationFrame(loop);
  let next: Slot | null = null;
  for (const slot of slots) {
    if (slot.due <= now && (!next || slot.due < next.due)) next = slot;
  }
  if (!next) return;
  const delta = Math.min((now - next.last) / 1000, MAX_DELTA);
  next.last = now;
  // Keep an even rhythm, but never queue up a burst after a slow frame.
  next.due = Math.max(next.due + INTERVAL, now + INTERVAL / 2);
  next.run(delta);
}

/** Starts running `run` on the shared clock. Returns a function that stops it. */
export function scheduleTask(run: ScheduledTask): () => void {
  const now = performance.now();
  const slot: Slot = { run, due: now + INTERVAL, last: now };
  slots.add(slot);
  if (!handle) handle = requestAnimationFrame(loop);

  return () => {
    slots.delete(slot);
    if (slots.size === 0 && handle) {
      cancelAnimationFrame(handle);
      handle = 0;
    }
  };
}
