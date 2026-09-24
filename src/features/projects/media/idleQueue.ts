/**
 * Runs small jobs one at a time when the browser is idle, lowest priority number first.
 * Used to paint covers progressively so a dozen of them never block a frame together.
 */

type Job = () => void | Promise<void>;

interface Entry {
  job: Job;
  priority: number;
}

const queue: Entry[] = [];
let pumping = false;

function nextSlice(callback: () => void) {
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(callback, { timeout: 120 });
  else window.setTimeout(callback, 16);
}

async function pump() {
  const entry = queue.shift();
  if (!entry) {
    pumping = false;
    return;
  }
  try {
    await entry.job();
  } catch (error) {
    console.error('Cover paint failed', error);
  }
  nextSlice(pump);
}

export function scheduleIdle(job: Job, priority = 0) {
  const index = queue.findIndex((entry) => entry.priority > priority);
  queue.splice(index === -1 ? queue.length : index, 0, { job, priority });
  if (!pumping) {
    pumping = true;
    nextSlice(pump);
  }
}
