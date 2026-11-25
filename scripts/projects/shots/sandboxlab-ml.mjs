/**
 * SandboxLabML: the home screen, where a trained SUV drives a city street beside a trained runner
 * crossing the Gauntlet, each with its live brain in the corner.
 * Source: the landing screenshot in https://github.com/edison16a/SandboxLabML, pinned to the
 * commit below. It is a 3200 x 2000 capture of the live app at https://sandboxlabs.vercel.app, 16:10 like a card.
 */
const COMMIT = 'b9ba87d93d78132baf07ea2944554c11b011486e';
const SHOT = `https://raw.githubusercontent.com/edison16a/SandboxLabML/${COMMIT}/assets/screenshots/landing.png`;

export async function capture({ download }) {
  return { png: await download(SHOT), quality: 0.92 };
}
