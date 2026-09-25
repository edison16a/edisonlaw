/**
 * CallSense: the dispatcher's Live Call screen mid call. The caller's words are transcribed as
 * they speak, one line highlighted by the dispatcher, and Gemini has pulled out the key details,
 * scored the danger level and suggested what to ask next. The priority queue on the right ranks
 * every open call, with units already on the way to one of them.
 *
 * Drawn as HTML in the manner of Photo Craft's dark theme, in CallSense's own blue. The screens,
 * labels, keyboard shortcuts, call IDs and the crash on 5th and Main come from the repository's
 * data files (content.json, navigation.json, demo-transcripts.json).
 * Source: https://github.com/edison16a/CallSense
 */
import { icon, productShell } from '../lib/layouts/product.mjs';

const BLUE = '#4d8dff';
const RED = '#f2555a';
const AMBER = '#f5a524';
const GREEN = '#3ecf8e';

const NAV = [
  ['home', 'Home', 'H'],
  ['mic', 'Live Call', 'L', true],
  ['list', 'Call Priority', 'P'],
  ['file', 'Current Calls', 'C'],
  ['settings', 'Settings', 'S'],
];

const TRANSCRIPT = [
  ['0:04', 'I just witnessed a car crash on 5th and Main.'],
  ['0:11', 'Two cars, one of them hit the light pole.', true],
  ['0:19', 'One person looks hurt, airbags deployed.'],
  ['0:27', "He's sitting up but he isn't really answering me."],
  ['0:36', "The other driver got out, she says she's okay."],
  ['0:44', "My name's Johnson, I'm parked right by the gas station."],
];

const DETAILS = [
  ['Caller', 'Johnson, on scene'],
  ['Incident', 'Two car crash, one into a light pole'],
  ['Location', '5th St and Main St, by the gas station'],
  ['Injuries', 'One driver hurt, slow to respond'],
  ['Others', 'Second driver out, says she is okay'],
  ['Hazards', 'None reported yet'],
];

const QUESTIONS = [
  'Is the injured driver breathing normally?',
  'Is he bleeding anywhere you can see?',
  'Is anyone trapped inside either car?',
  'Do you see smoke, fire or leaking fluid?',
  'Is traffic still moving around the crash?',
  'Can you stay on the line until units arrive?',
];

const QUEUE = [
  ['CS-482913', 'High', '1 min', 'send'],
  ['CS-482907', 'High', '6 min', 'enroute'],
  ['CS-482896', 'Medium', '4 min', 'send'],
  ['CS-482874', 'Medium', '8 min', 'send'],
  ['CS-482881', 'Low', '9 min', 'send'],
  ['CS-482852', 'Medium', '', 'done'],
];

const TONE = { High: RED, Medium: AMBER, Low: GREEN };

const CSS = `
body { color: #eef0f4; }
.app { position: absolute; left: 0; top: 0; width: 1280px; height: 800px; zoom: 1.25; background: #0f1115; display: flex; flex-direction: column; }
.top { height: 56px; border-bottom: 1px solid #22262e; display: flex; align-items: center; padding: 0 20px; gap: 14px; flex: none; }
.mark { width: 28px; height: 28px; border-radius: 8px; background: ${BLUE}; color: #fff; font-size: 12px; font-weight: 700; display: grid; place-items: center; letter-spacing: -0.02em; }
.name { font-size: 16px; font-weight: 650; letter-spacing: -0.02em; }
.tag { font-size: 13px; color: #8b93a1; flex: 1; }
.ghost { height: 32px; border: 1px solid #2a2f38; border-radius: 8px; padding: 0 12px; display: flex; align-items: center; gap: 7px; font-size: 13px; color: #c9ced6; }
.avatar { width: 30px; height: 30px; border-radius: 50%; background: #242a35; color: #c9ced6; font-size: 12px; font-weight: 600; display: grid; place-items: center; }
.cols { flex: 1; display: grid; grid-template-columns: 196px 1fr 318px; min-height: 0; }
.side { border-right: 1px solid #22262e; padding: 16px 12px; display: flex; flex-direction: column; gap: 2px; }
.side .label { padding: 0 10px 8px; }
.nav { height: 36px; border-radius: 8px; display: flex; align-items: center; gap: 10px; padding: 0 10px; font-size: 13.5px; color: #aab1bd; }
.nav span { flex: 1; }
.nav kbd { font-family: 'Geist Mono', monospace; font-size: 10.5px; color: #767e8c; border: 1px solid #2a2f38; border-radius: 4px; padding: 0 5px; }
.nav.on { background: #1b2130; color: #fff; box-shadow: inset 0 0 0 1px #28324a; }
.nav.on svg { color: ${BLUE}; }
.side .spacer { flex: 1; }
.label { font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #7d8594; }
.main { padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.head { display: flex; align-items: center; gap: 12px; }
.head h1 { font-size: 20px; font-weight: 650; letter-spacing: -0.02em; }
.id { font-family: 'Geist Mono', monospace; font-size: 12.5px; color: #8b93a1; }
.rec { display: flex; align-items: center; gap: 7px; height: 26px; padding: 0 10px; border-radius: 13px; background: rgba(242, 85, 90, 0.12); color: #ff8d90; font-size: 12.5px; font-weight: 550; }
.rec i { width: 7px; height: 7px; border-radius: 50%; background: ${RED}; box-shadow: 0 0 0 3px rgba(242, 85, 90, 0.2); }
.head .grow { flex: 1; }
.actions { display: flex; gap: 8px; }
.btn { height: 32px; border-radius: 8px; padding: 0 12px; display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 500; border: 1px solid #2a2f38; color: #d5d9e0; background: #151820; }
.btn.warn { color: #ffb1b3; border-color: #4a2a2e; }
.btn.primary { background: ${BLUE}; border-color: ${BLUE}; color: #fff; font-weight: 550; }
.panel { background: #151820; border: 1px solid #22262e; border-radius: 12px; }
.transcript { padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; }
.line { display: flex; gap: 12px; font-size: 14px; line-height: 1.5; }
.line time { font-family: 'Geist Mono', monospace; font-size: 11.5px; color: #6d7583; width: 30px; padding-top: 3px; flex: none; }
.line b { font-weight: 550; color: #8b93a1; margin-right: 6px; }
mark { background: rgba(245, 165, 36, 0.2); color: #ffe2ad; border-radius: 3px; padding: 1px 3px; }
.listening { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: #7d8594; padding-left: 42px; }
.bars { display: flex; gap: 2px; align-items: center; }
.bars i { width: 2px; border-radius: 1px; background: ${BLUE}; display: block; }
.grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 14px; flex: 1; min-height: 0; align-items: start; }
.card { padding: 14px 16px; }
.card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.danger { display: flex; align-items: center; gap: 6px; height: 24px; padding: 0 9px; border-radius: 12px; font-size: 12px; font-weight: 600; background: rgba(242, 85, 90, 0.14); color: #ff8d90; }
.kv { display: grid; grid-template-columns: 76px 1fr; gap: 10px; padding: 8px 0; border-top: 1px solid #22262e; font-size: 13.5px; }
.kv:first-of-type { border-top: 0; }
.kv span { color: #8b93a1; }
.q { display: flex; gap: 10px; padding: 8px 0; border-top: 1px solid #22262e; font-size: 13.5px; }
.q:first-of-type { border-top: 0; }
.q i { font-style: normal; font-family: 'Geist Mono', monospace; font-size: 11.5px; color: ${BLUE}; width: 14px; padding-top: 2px; }
.gem { font-size: 11.5px; color: #6d7583; display: flex; align-items: center; gap: 6px; }
.queue { border-left: 1px solid #22262e; padding: 18px 16px; display: flex; flex-direction: column; gap: 10px; }
.queue h2 { font-size: 15px; font-weight: 600; letter-spacing: -0.01em; }
.chips { display: flex; gap: 6px; }
.chips span { height: 26px; padding: 0 10px; border-radius: 13px; border: 1px solid #2a2f38; font-size: 12px; color: #aab1bd; display: flex; align-items: center; gap: 6px; }
.chips span.on { background: #eef0f4; color: #0f1115; border-color: #eef0f4; font-weight: 550; }
.chips i { width: 6px; height: 6px; border-radius: 50%; display: block; }
.row { background: #151820; border: 1px solid #22262e; border-radius: 10px; padding: 11px 12px; }
.row.live { border-color: #2c3a5c; box-shadow: inset 3px 0 0 ${BLUE}; }
.row-top { display: flex; align-items: center; gap: 8px; }
.row-top .id { flex: 1; color: #d5d9e0; }
.lvl { font-size: 11.5px; font-weight: 600; padding: 2px 8px; border-radius: 10px; }
.row-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 9px; font-size: 12.5px; color: #8b93a1; }
.send { height: 28px; border-radius: 7px; padding: 0 10px; display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 550; background: #1f2633; color: #dfe6f5; border: 1px solid #2c3444; }
.row.done { opacity: 0.55; }
.progress { height: 4px; border-radius: 2px; background: #22262e; margin-top: 9px; overflow: hidden; }
.progress i { display: block; height: 100%; width: 62%; background: ${GREEN}; border-radius: 2px; }
`;

const BARS = [5, 9, 13, 7, 11, 15, 8, 5, 10, 6];

export async function capture({ compose }) {
  const nav = NAV.map(
    ([ico, label, key, on]) => `<div class="nav${on ? ' on' : ''}">${icon(ico, { size: 16 })}<span>${label}</span><kbd>${key}</kbd></div>`,
  ).join('');

  const lines = TRANSCRIPT.map(
    ([time, text, marked]) => `<div class="line"><time>${time}</time><div><b>Caller</b>${marked ? `<mark>${text}</mark>` : text}</div></div>`,
  ).join('');

  const details = DETAILS.map(([k, v]) => `<div class="kv"><span>${k}</span><div>${v}</div></div>`).join('');
  const questions = QUESTIONS.map((q, i) => `<div class="q"><i>${i + 1}</i><div>${q}</div></div>`).join('');

  const queue = QUEUE.map(([id, level, wait, state], i) => {
    const tone = TONE[level];
    const foot =
      state === 'done'
        ? `<div class="row-foot"><span>${icon('check', { size: 13, width: 2 })}</span><span>Finished</span></div>`
        : state === 'enroute'
        ? `<div class="row-foot"><span>Units en route</span><span class="num">ETA 3 min</span></div><div class="progress"><i></i></div>`
        : `<div class="row-foot"><span class="num">Waiting ${wait}</span><span class="send">${icon('send', { size: 12, width: 2 })}Send units</span></div>`;
    return `
    <div class="row${i === 0 ? ' live' : ''}${state === 'done' ? ' done' : ''}">
      <div class="row-top"><span class="id">${id}</span>${i === 0 ? '<span class="gem" style="color: #9fb9ff;">On the line</span>' : ''}<span class="lvl" style="color: ${tone}; background: ${tone}22;">${level}</span></div>
      ${foot}
    </div>`;
  }).join('');

  const body = `
<div class="app">
  <div class="top">
    <span class="mark">CS</span><span class="name">CallSense</span><span class="tag">Real time triage, calm under pressure.</span>
    <span class="ghost">${icon('play', { size: 13 })}Demo</span>
    <span class="ghost">${icon('upload', { size: 14 })}Export CSV</span>
    <span class="avatar">JR</span>
  </div>
  <div class="cols">
    <div class="side">
      <div class="label">Navigator</div>
      ${nav}
      <div class="spacer"></div>
      <div class="nav">${icon('trash', { size: 16 })}<span>Clear data</span></div>
    </div>
    <div class="main">
      <div class="head">
        <h1>Live Call</h1><span class="id">CS-482913</span>
        <span class="rec"><i></i><span class="num">Listening 00:47</span></span>
        <span class="grow"></span>
      </div>
      <div class="actions">
        <span class="btn">${icon('highlight', { size: 14 })}Highlight text</span>
        <span class="btn warn">${icon('alert', { size: 14 })}Mark as dangerous</span>
        <span class="btn">${icon('sparkle', { size: 14 })}Generate questions</span>
        <span class="grow" style="flex: 1;"></span>
        <span class="btn primary">${icon('phoneOff', { size: 14, width: 2 })}End call</span>
      </div>
      <div class="panel transcript">
        <div class="label" style="margin-bottom: 2px;">Transcript</div>
        ${lines}
        <div class="listening"><span class="bars">${BARS.map((h) => `<i style="height: ${h}px"></i>`).join('')}</span>Transcribing</div>
      </div>
      <div class="grid">
        <div class="panel card">
          <div class="card-head"><span class="label">Important details</span><span class="danger">${icon('alert', { size: 13, width: 2 })}Danger level: High</span></div>
          ${details}
        </div>
        <div class="panel card">
          <div class="card-head"><span class="label">Ask next</span><span class="gem">${icon('sparkle', { size: 12 })}Gemini</span></div>
          ${questions}
        </div>
      </div>
    </div>
    <div class="queue">
      <h2>Call Priority</h2>
      <div class="chips"><span class="on">All 6</span><span><i style="background: ${RED}"></i>High</span><span><i style="background: ${AMBER}"></i>Medium</span><span><i style="background: ${GREEN}"></i>Low</span></div>
      ${queue}
    </div>
  </div>
</div>`;

  return { png: await compose(productShell({ background: '#0f1115', body, css: CSS })) };
}
