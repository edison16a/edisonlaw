/**
 * Text & Image Replacer: a Chrome window on a magazine page after pressing Start. Every heading,
 * paragraph and list item says what the user typed, and every picture is the photo they
 * uploaded. Links, buttons and labels keep their words, because the extension only rewrites
 * text elements (h1 to h6, p, li, td, th, strong, em, b, i, u, blockquote, q) and img tags.
 * The popup is open from the toolbar with the text, the Both mode and the uploaded photo.
 *
 * Drawn as HTML, with the popup restyled in the manner of Photo Craft. The page is a made up
 * magazine. The photo is André Spieker's, from Unsplash, through Lorem Picsum.
 * Sources:
 *   https://github.com/edison16a/text-replacer (popup copy, selectors, modes)
 *   https://chromewebstore.google.com/detail/text-image-replacer-exten/glamceigjodgbnfondkfloeoiikmlfno
 *   https://picsum.photos/id/237 (https://unsplash.com/photos/8wTPqxlnKM4)
 */
import { dataUrl } from '../lib/layouts/base.mjs';
import { BROWSER_CSS, backdrop, browserWindow, icon, productShell } from '../lib/layouts/product.mjs';

const PHOTO = 'https://picsum.photos/id/237/1200/800';
const TEXT = 'Biscuit is the goodest boy';
const ACCENT = '#38b6e8';

/** The extension's icon: two looping arrows, in its sky blue. */
const LOGO = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" stroke="${ACCENT}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 15v-2a5 5 0 0 1 5-5h15"/><path d="m21 3 5 5-5 5"/>
  <path d="M26 17v2a5 5 0 0 1-5 5H6"/><path d="m11 29-5-5 5-5"/>
</svg>`;

const CSS = `
${BROWSER_CSS}
.site { position: absolute; inset: 0; background: #fbfaf8; color: #16181c; }
.site-head { height: 64px; display: flex; align-items: center; padding: 0 48px; border-bottom: 1px solid #ebe8e3; gap: 40px; }
.brand { font-size: 21px; font-weight: 700; letter-spacing: -0.03em; }
.brand span { color: #b4572e; }
.site-nav { display: flex; gap: 26px; font-size: 14px; color: #4a4d53; flex: 1; }
.subscribe { font-size: 13px; font-weight: 600; background: #16181c; color: #fff; padding: 8px 14px; border-radius: 999px; }
.lead { padding: 34px 48px 0; max-width: 820px; }
.kicker { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #b4572e; }
.lead h1 { font-size: 52px; line-height: 1.02; letter-spacing: -0.04em; font-weight: 650; margin: 12px 0 12px; }
.deck { font-size: 18px; line-height: 1.45; color: #4a4d53; }
.byline { display: flex; align-items: center; gap: 10px; margin-top: 16px; font-size: 13px; color: #6a6d73; }
.avatar { width: 30px; height: 30px; border-radius: 50%; overflow: hidden; }
.byline b { color: #16181c; font-weight: 550; }
.feature { display: grid; grid-template-columns: 2fr 1fr; gap: 28px; padding: 26px 48px 0; }
.feature-img { height: 330px; border-radius: 6px; overflow: hidden; }
.feature-img img, .card img, .avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
.most { padding-top: 4px; }
.most .h { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #6a6d73; padding-bottom: 10px; border-bottom: 1px solid #ebe8e3; }
.most ol { margin: 0; padding: 0 0 0 26px; }
.most li { font-size: 16px; font-weight: 600; letter-spacing: -0.01em; padding: 13px 0 13px 6px; border-bottom: 1px solid #ebe8e3; }
.most li::marker { color: #b4572e; font-weight: 650; }
.section-head { display: flex; align-items: baseline; justify-content: space-between; padding: 34px 48px 16px; }
.section-head h2 { font-size: 20px; letter-spacing: -0.02em; font-weight: 650; }
.section-head span { font-size: 13px; color: #6a6d73; }
.cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; padding: 0 48px; }
.card .thumb { height: 150px; border-radius: 6px; overflow: hidden; }
.card .tag { font-size: 11.5px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #6a6d73; margin-top: 12px; }
.card h3 { font-size: 17px; line-height: 1.25; letter-spacing: -0.015em; font-weight: 600; margin-top: 6px; }

/* The extension popup, drawn over the page from the toolbar. */
.popup { position: absolute; right: 14px; top: 6px; width: 372px; background: #15181d; color: #e8eaee; border-radius: 14px; border: 1px solid #262a31;
  box-shadow: 0 24px 60px -12px rgba(8, 12, 20, 0.5), 0 8px 20px -8px rgba(8, 12, 20, 0.35); padding: 18px; }
.pp-head { display: flex; align-items: center; gap: 12px; }
.pp-logo { width: 38px; height: 38px; border-radius: 10px; background: #0f2530; display: grid; place-items: center; }
.pp-title { flex: 1; }
.pp-title b { display: block; font-size: 15px; font-weight: 600; letter-spacing: -0.01em; }
.pp-title span { font-size: 12.5px; color: #8c93a0; }
.switch { width: 40px; height: 24px; border-radius: 12px; background: ${ACCENT}; position: relative; }
.switch::after { content: ''; position: absolute; right: 3px; top: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; }
.pp-rule { height: 1px; background: #262a31; margin: 16px -18px; }
.label { font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #8c93a0; margin-bottom: 8px; display: flex; justify-content: space-between; }
.label i { font-style: normal; font-weight: 500; letter-spacing: 0; text-transform: none; }
.field { height: 40px; border-radius: 8px; background: #0e1014; border: 1px solid ${ACCENT}; box-shadow: 0 0 0 3px rgba(56, 182, 232, 0.16); display: flex; align-items: center; padding: 0 12px; font-size: 14px; }
.caret { width: 1.5px; height: 17px; background: ${ACCENT}; margin-left: 1px; }
.seg { display: grid; grid-template-columns: repeat(3, 1fr); background: #0e1014; border: 1px solid #262a31; border-radius: 8px; padding: 3px; gap: 3px; }
.seg span { height: 30px; border-radius: 6px; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; color: #a3aab5; }
.seg .on { background: #232831; color: #fff; font-weight: 550; box-shadow: inset 0 0 0 1px #343a45; }
.upload { display: flex; gap: 12px; align-items: center; padding: 10px; border-radius: 10px; background: #0e1014; border: 1px solid #262a31; }
.upload .pic { width: 92px; height: 60px; border-radius: 6px; overflow: hidden; flex: none; }
.upload .pic img { width: 100%; height: 100%; object-fit: cover; display: block; }
.upload .meta { flex: 1; font-size: 13px; }
.upload .meta b { display: block; font-weight: 550; }
.upload .meta span { color: #8c93a0; font-size: 12px; }
.ghost { font-size: 12.5px; color: #c8cdd5; border: 1px solid #2f343d; border-radius: 7px; padding: 5px 10px; }
.actions { display: grid; grid-template-columns: 1fr auto; gap: 8px; margin-top: 16px; }
.btn { height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 14px; font-weight: 550; }
.btn.primary { background: ${ACCENT}; color: #06202c; }
.btn.secondary { border: 1px solid #2f343d; color: #dfe3e8; padding: 0 14px; font-weight: 500; }
.pp-foot { display: flex; justify-content: space-between; align-items: center; margin-top: 14px; font-size: 12.5px; color: #8c93a0; }
.live { display: flex; align-items: center; gap: 8px; }
.live i { width: 7px; height: 7px; border-radius: 50%; background: #3ecf8e; box-shadow: 0 0 0 3px rgba(62, 207, 142, 0.18); }
kbd { font-family: 'Geist Mono', monospace; font-size: 11px; color: #c8cdd5; background: #20242b; border: 1px solid #30353e; border-bottom-width: 2px; border-radius: 5px; padding: 1px 6px; }
.ext-on { color: ${ACCENT}; }
`;

export async function capture({ download, compose }) {
  const photo = dataUrl(await download(PHOTO));
  const img = `<img src="${photo}" alt="">`;

  const card = (tag, position) => `
    <div class="card">
      <div class="thumb"><img src="${photo}" style="object-position: ${position};" alt=""></div>
      <div class="tag">${tag}</div>
      <h3>${TEXT}</h3>
    </div>`;

  const site = `
<div class="site">
  <div class="site-head">
    <div class="brand">fieldnotes<span>.</span></div>
    <div class="site-nav"><span>Culture</span><span>Travel</span><span>Food</span><span>Design</span><span>Science</span></div>
  </div>
  <div class="lead">
    <div class="kicker">Weekend Reads</div>
    <h1>${TEXT}</h1>
    <p class="deck">${TEXT}</p>
    <div class="byline"><div class="avatar">${img}</div><span>By <b>Nora Ellis</b> &nbsp;·&nbsp; 6 min read</span></div>
  </div>
  <div class="feature">
    <div class="feature-img">${img}</div>
    <div class="most">
      <div class="h">Most read</div>
      <ol>${Array.from({ length: 6 }, () => `<li>${TEXT}</li>`).join('')}</ol>
    </div>
  </div>
  <div class="section-head"><h2>${TEXT}</h2><span>See all</span></div>
  <div class="cards">
    ${card('Travel', '30% 40%')}
    ${card('Food', '60% 30%')}
    ${card('Design', '45% 55%')}
    ${card('Science', '55% 45%')}
  </div>

  <div class="popup">
    <div class="pp-head">
      <div class="pp-logo">${LOGO(24)}</div>
      <div class="pp-title"><b>Text &amp; Image Replacer</b><span>Replacing on every open tab</span></div>
      <div class="switch"></div>
    </div>
    <div class="pp-rule"></div>
    <div class="label">Replacement text <i class="num">${TEXT.length} characters</i></div>
    <div class="field">${TEXT}<span class="caret"></span></div>
    <div class="label" style="margin-top: 16px;">Replace</div>
    <div class="seg">
      <span>${icon('type', { size: 14 })}Text</span>
      <span>${icon('image', { size: 14 })}Images</span>
      <span class="on">Both</span>
    </div>
    <div class="label" style="margin-top: 16px;">Replacement image</div>
    <div class="upload">
      <div class="pic"><img src="${photo}" alt=""></div>
      <div class="meta"><b>biscuit.jpg</b><span class="num">1200 × 800</span></div>
      <span class="ghost">Change</span>
    </div>
    <div class="actions">
      <div class="btn primary">Stop replacing</div>
      <div class="btn secondary">This site only</div>
    </div>
    <div class="pp-foot">
      <span class="live"><i></i>Running</span>
      <span>Shortcut &nbsp;<kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>Y</kbd></span>
    </div>
  </div>
</div>`;

  const favicon = `<span style="flex: none; width: 16px; height: 16px; border-radius: 4px; background: #16181c; color: #fff; font-size: 10px; font-weight: 700; display: grid; place-items: center;">f</span>`;
  const extensions = `<span class="bw-ext-btn on">${LOGO(18)}</span>`;
  const body = browserWindow({
    x: 90,
    y: 64,
    width: 1420,
    height: 1000,
    tab: 'fieldnotes. Weekend Reads',
    favicon,
    url: 'fieldnotes.example/weekend',
    extensions,
    page: site,
    zoom: 1.15,
  });

  return { png: await compose(productShell({ background: backdrop('#cfdde9', 0.35), body, css: CSS })) };
}
