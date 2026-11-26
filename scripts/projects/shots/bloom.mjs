/**
 * Bloom: the home page, with the headline beside a pink flower drawn in letters.
 * Source: the home screenshot in https://github.com/edison16a/bloom, pinned to the commit below.
 * It is a 2880 x 1800 capture of the site, 16:10 like a card.
 */
const COMMIT = '5d15a44503cf471cacfecd1940f6ccc9dd350156';
const SHOT = `https://raw.githubusercontent.com/edison16a/bloom/${COMMIT}/assets/screenshots/home.webp`;

export async function capture({ download }) {
  return { png: await download(SHOT), quality: 0.92 };
}
