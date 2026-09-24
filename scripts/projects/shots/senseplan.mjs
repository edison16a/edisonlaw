/**
 * SensePlan: the scheduling dashboard after a voice call, with the places it found,
 * the call transcript and the summary. Screenshot from the team's Devpost gallery.
 * Source: https://devpost.com/software/senseplan
 */
import { dataUrl, shell } from '../lib/layouts/base.mjs';

const SHOT = 'https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/003/642/045/datas/original.png';

/** The page's own background, so the added top margin does not show. */
const PAGE_COLOUR = '#f8fafb';

export async function capture({ download, compose }) {
  const src = dataUrl(await download(SHOT));
  // The screenshot starts right at the page title, so it moves down a little on the page colour.
  const body = `<img src="${src}" style="position: absolute; left: 0; top: 18px; width: 1600px;">`;
  return { png: await compose(shell({ background: PAGE_COLOUR, body })) };
}
