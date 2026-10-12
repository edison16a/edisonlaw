/**
 * SandboxLabML: the home screen, where a trained car laps the Grand Prix beside a live hide and
 * seek match, each with its brain lighting up in the corner.
 * Source: the landing screenshot in https://github.com/edison16a/SandboxLabML, pinned to the
 * commit below. It is a 1600 x 1000 capture of the live app at https://sandboxlabs.vercel.app, 16:10 like a card.
 */
const COMMIT = '4bb092f7d3f35252b74ba9d1a9c319a2fc6cf46f';
const SHOT = `https://raw.githubusercontent.com/edison16a/SandboxLabML/${COMMIT}/assets/screenshots/landing.png`;

export async function capture({ download }) {
  return { png: await download(SHOT), quality: 0.92 };
}
