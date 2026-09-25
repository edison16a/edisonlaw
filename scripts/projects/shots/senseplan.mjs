/**
 * SensePlan: the scheduling dashboard after a booking call. The request typed in plain words,
 * the barbershops Bright Data found for it, and the call the Vapi voice agent just made to the
 * first one, with its transcript and the booking it confirmed, ready for the calendar.
 *
 * Drawn as HTML in the manner of Photo Craft's light theme. The shops, the request and the
 * conversation follow the team's own demo on Devpost (a men's haircut for Devin Liu, free on
 * Sunday between 10 AM and 12 PM, offered 10:55 or 11:30).
 * Sources:
 *   https://devpost.com/software/senseplan
 *   https://github.com/dliu99/senseplan-main (dashboard copy: Places, Call to Schedule, Call Summary)
 */
import { icon, productShell } from '../lib/layouts/product.mjs';

const GREEN = '#12a150';

const PLACES = [
  { name: 'Golden Door Barbershop', address: '764 Geary St, San Francisco', phone: '(415) 874-9626', booked: true },
  { name: 'Hairchitect Barber Shop & Lounge', address: '1530 Union St, San Francisco', phone: '(415) 634-0998' },
  { name: 'The Barberhood', address: '3248 Scott St, San Francisco', phone: '(415) 418-0227' },
];

const TRANSCRIPT = [
  ['shop', '0:02', 'Golden Door Barbershop, how can I help?'],
  ['agent', '0:05', "Hi, I'm an assistant calling for Devin Liu. He'd like a men's haircut on Sunday, any time between 10 AM and noon."],
  ['shop', '0:14', 'Sunday we have 10:55 or 11:30.'],
  ['agent', '0:18', '11:30 works. Could you put it under Devin Liu?'],
  ['shop', '0:23', 'Done. Devin Liu, Sunday at 11:30. See him then.'],
  ['agent', '0:27', 'Thank you, have a good day.'],
];

const CSS = `
body { color: #111214; }
.app { position: absolute; left: 0; top: 0; width: 1333.33px; height: 833.33px; zoom: 1.2; background: #f7f8fa; display: flex; flex-direction: column; }
.top { height: 60px; background: #fff; border-bottom: 1px solid #e2e5ea; display: flex; align-items: center; padding: 0 28px; gap: 24px; flex: none; }
.logo { display: flex; align-items: center; gap: 10px; font-size: 17px; font-weight: 650; letter-spacing: -0.02em; width: 200px; }
.mark { width: 28px; height: 28px; border-radius: 8px; background: #111214; display: grid; place-items: center; }
.query { flex: 1; max-width: 760px; margin: 0 auto; height: 42px; border-radius: 10px; border: 1px solid #d5d9e0; background: #fff; display: flex; align-items: center; gap: 10px; padding: 0 6px 0 14px; color: #6b7280; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.query span { flex: 1; color: #111214; font-size: 15px; }
.query .go { flex: none; height: 30px; padding: 0 12px; border-radius: 7px; background: #111214; color: #fff; font-size: 13px; font-weight: 550; display: flex; align-items: center; }
.me { width: 200px; display: flex; justify-content: flex-end; align-items: center; gap: 10px; font-size: 14px; color: #3f4450; }
.me i { width: 30px; height: 30px; border-radius: 50%; background: #e6ebf2; color: #3f4450; font-style: normal; font-weight: 600; font-size: 12px; display: grid; place-items: center; }
.main { flex: 1; display: grid; grid-template-columns: 420px 1fr; gap: 22px; padding: 24px 28px 28px; min-height: 0; }
.col-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 14px; }
.col-head h2 { font-size: 17px; font-weight: 650; letter-spacing: -0.015em; }
.col-head span { font-size: 13px; color: #6b7280; }
.place { background: #fff; border: 1px solid #e2e5ea; border-radius: 12px; padding: 16px 18px; margin-bottom: 12px; }
.place.sel { border-color: #111214; box-shadow: 0 0 0 1px #111214; }
.place-top { display: flex; align-items: center; gap: 10px; }
.place-top b { flex: 1; font-size: 15.5px; font-weight: 600; letter-spacing: -0.01em; }
.rating { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #3f4450; }
.lines { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; font-size: 13px; color: #6b7280; }
.lines span { display: flex; align-items: center; gap: 7px; }
.place-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 14px; }
.btn { height: 34px; border-radius: 8px; padding: 0 14px; display: inline-flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 550; }
.btn.dark { background: #111214; color: #fff; }
.btn.line { border: 1px solid #d5d9e0; color: #111214; background: #fff; }
.pill { height: 26px; border-radius: 13px; padding: 0 10px; display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 550; }
.pill.ok { background: #e7f6ee; color: #0b7a3b; }
.pill.muted { background: #eef0f3; color: #4b5260; }
.src { font-size: 12.5px; color: #6b7280; }
.prefs { margin-top: 18px; background: #fff; border: 1px solid #e2e5ea; border-radius: 12px; padding: 14px 18px 6px; }
.pref { display: flex; align-items: center; gap: 10px; font-size: 13.5px; padding: 9px 0; color: #6b7280; border-top: 1px solid #eceef2; }
.pref:nth-child(2) { border-top: 0; margin-top: 4px; }
.pref span { flex: 1; }
.pref b { color: #111214; font-weight: 550; }
.found { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: #6b7280; margin-top: 4px; }

.call { background: #fff; border: 1px solid #e2e5ea; border-radius: 14px; display: flex; flex-direction: column; overflow: hidden; height: 100%; }
.call-head { display: flex; align-items: center; gap: 14px; padding: 18px 22px; border-bottom: 1px solid #eceef2; }
.call-ico { width: 40px; height: 40px; border-radius: 10px; background: #e7f6ee; color: ${GREEN}; display: grid; place-items: center; }
.call-head .who { flex: 1; }
.call-head .who b { display: block; font-size: 16px; font-weight: 600; letter-spacing: -0.01em; }
.call-head .who span { font-size: 13px; color: #6b7280; }
.wave { display: flex; align-items: center; gap: 3px; height: 22px; }
.wave i { width: 3px; border-radius: 2px; background: #c9ced6; display: block; }
.body { display: grid; grid-template-columns: 1fr 300px; flex: 1; min-height: 0; }
.transcript { padding: 20px 22px; display: flex; flex-direction: column; gap: 14px; border-right: 1px solid #eceef2; }
.label { font-size: 11.5px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #6b7280; }
.msg { display: flex; gap: 10px; max-width: 86%; }
.msg .av { width: 28px; height: 28px; border-radius: 50%; flex: none; display: grid; place-items: center; font-size: 11px; font-weight: 650; }
.msg.shop .av { background: #eef0f3; color: #4b5260; }
.msg.agent { align-self: flex-end; flex-direction: row-reverse; }
.msg.agent .av { background: #111214; color: #fff; }
.bubble { border-radius: 12px; padding: 10px 13px; font-size: 14px; line-height: 1.45; }
.msg.shop .bubble { background: #f1f2f4; border-top-left-radius: 4px; }
.msg.agent .bubble { background: #111214; color: #f3f4f6; border-top-right-radius: 4px; }
.meta { font-size: 11.5px; color: #8a909b; margin-top: 4px; }
.msg.agent .meta { text-align: right; }
.side { padding: 20px 22px; display: flex; flex-direction: column; gap: 14px; background: #fcfcfd; }
.booked { border: 1px solid #cfe9da; background: #f3fbf6; border-radius: 12px; padding: 16px; }
.booked h3 { font-size: 22px; font-weight: 650; letter-spacing: -0.025em; margin: 10px 0 2px; }
.booked p { font-size: 13.5px; color: #3f4450; }
.row { display: flex; justify-content: space-between; font-size: 13.5px; padding: 9px 0; border-top: 1px solid #eceef2; }
.row span { color: #6b7280; }
.row b { font-weight: 550; }
.summary { font-size: 13.5px; line-height: 1.55; color: #3f4450; }
`;

const WAVE = [6, 10, 16, 9, 18, 12, 7, 14, 20, 11, 8, 15, 10, 6, 12, 17, 9, 6];

export async function capture({ compose }) {
  const star = icon('star', { size: 14, stroke: '#e0a800', fill: '#f5c518', width: 1.5 });
  const places = PLACES.map(
    (p) => `
    <div class="place${p.booked ? ' sel' : ''}">
      <div class="place-top"><b>${p.name}</b><span class="rating">${star}4.5</span></div>
      <div class="lines"><span>${icon('pin', { size: 14 })}${p.address}</span><span class="num">${icon('phone', { size: 13 })}${p.phone}</span></div>
      <div class="place-foot">
        ${
          p.booked
            ? `<span class="pill ok">${icon('checkCircle', { size: 14, width: 2 })}Booked for Sunday, 11:30 AM</span><span class="src">Called 2 min ago</span>`
            : `<span class="btn line">${icon('phone', { size: 14 })}Call to schedule</span><span class="src">Open Sunday</span>`
        }
      </div>
    </div>`,
  ).join('');

  const messages = TRANSCRIPT.map(
    ([who, time, text]) => `
    <div class="msg ${who}">
      <div class="av">${who === 'agent' ? 'AI' : 'GD'}</div>
      <div><div class="bubble">${text}</div><div class="meta num">${who === 'agent' ? 'SensePlan' : 'Golden Door'} &nbsp;${time}</div></div>
    </div>`,
  ).join('');

  const body = `
<div class="app">
  <div class="top">
    <div class="logo"><span class="mark">${icon('calendar', { size: 16, stroke: '#fff', width: 2 })}</span>SensePlan</div>
    <div class="query">${icon('search', { size: 17 })}<span>Book me a men's haircut Sunday morning</span><span class="go">Plan it</span></div>
    <div class="me">Devin Liu<i>DL</i></div>
  </div>
  <div class="main">
    <div>
      <div class="col-head"><h2>Places found</h2><span>Near Nob Hill, San Francisco</span></div>
      ${places}
      <div class="found">${icon('info', { size: 14 })}Found with a live web search for barbers near you.</div>
      <div class="prefs">
        <div class="label">From your profile</div>
        <div class="pref">${icon('clock', { size: 15 })}<span>Work hours</span><b>Mon to Fri, 9 to 5</b></div>
        <div class="pref">${icon('calendar', { size: 15 })}<span>Free</span><b>Sunday, 10 AM to 12 PM</b></div>
        <div class="pref">${icon('checkCircle', { size: 15 })}<span>Calendar</span><b>Google, connected</b></div>
      </div>
    </div>
    <div>
      <div class="call">
        <div class="call-head">
          <div class="call-ico">${icon('phone', { size: 19, width: 2 })}</div>
          <div class="who"><b>Call with Golden Door Barbershop</b><span class="num">(415) 874-9626 &nbsp;·&nbsp; Voice agent &nbsp;·&nbsp; 0:31</span></div>
          <div class="wave">${WAVE.map((h) => `<i style="height: ${h}px"></i>`).join('')}</div>
          <span class="pill muted">Call ended</span>
        </div>
        <div class="body">
          <div class="transcript">
            <div class="label">Transcript</div>
            ${messages}
          </div>
          <div class="side">
            <div class="booked">
              <span class="pill ok">${icon('check', { size: 14, width: 2.25 })}Confirmed on the call</span>
              <h3>Sunday, 11:30 AM</h3>
              <p>Men's haircut at Golden Door Barbershop</p>
            </div>
            <div>
              <div class="row"><span>Booked under</span><b>Devin Liu</b></div>
              <div class="row"><span>Your window</span><b>Sun, 10 AM to 12 PM</b></div>
              <div class="row"><span>Also offered</span><b>10:55 AM</b></div>
              <div class="row"><span>Address</span><b>764 Geary St</b></div>
            </div>
            <span class="btn dark" style="justify-content: center;">${icon('calendar', { size: 15, width: 2 })}Add to Google Calendar</span>
            <div class="label" style="margin-top: 8px;">Call summary</div>
            <p class="summary">The shop had 10:55 and 11:30 open on Sunday. The agent took 11:30, inside Devin's window, and booked it under his name.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;

  return { png: await compose(productShell({ background: '#f7f8fa', body, css: CSS })) };
}
