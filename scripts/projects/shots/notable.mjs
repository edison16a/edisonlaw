/**
 * Notable: a week plan open in the editor with its nested tab tree, while a sentence is read aloud
 * with the highlight, the voice picker and the playback bar.
 * Source: the read aloud screenshot in https://github.com/edison16a/notable, pinned to the commit
 * below. It is a 2560 x 1600 capture of the live app at https://freenotable.vercel.app, 16:10 like a card.
 */
const COMMIT = 'b8787163f791e4c9f7c706e02da8b49837048e44';
const SHOT = `https://raw.githubusercontent.com/edison16a/notable/${COMMIT}/docs/screenshots/read-aloud.png`;

export async function capture({ download }) {
  return { png: await download(SHOT), quality: 0.92 };
}
