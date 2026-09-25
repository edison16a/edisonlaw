/**
 * WESTPA CLI Dashboard: w_progress, from Edison's pull request westpa/westpa#595, watching a live
 * run of WESTPA's ODLD test system beside w_run. Both panes are real output, captured by
 * scripts/projects/westpa/run-odld.sh. This recipe only sets them in a terminal window.
 * Source: https://github.com/westpa/westpa/pull/595
 */
import { readFileSync } from 'node:fs';
import { GLOW, shell } from '../lib/layouts/base.mjs';
import { TERMINAL_CSS, terminal } from '../lib/layouts/terminal.mjs';

const read = (name) => readFileSync(new URL(`../westpa/${name}`, import.meta.url), 'utf8');

export async function capture({ compose }) {
  const body = terminal({
    title: 'odld',
    cwd: '~/edison16a/odld',
    width: 1472,
    height: 888,
    panes: [
      { command: 'w_run', output: read('run-log.txt'), tail: true },
      { command: 'w_progress', output: read('progress.txt'), grow: 1.12 },
    ],
  });
  // The purple of the WESTPA logo.
  const background = `${GLOW}, linear-gradient(135deg, #1a1030 0%, #3b1f63 50%, #7c4a9e 100%)`;
  return { png: await compose(shell({ background, body, css: TERMINAL_CSS })) };
}
