import { spawn } from 'node:child_process';
import net from 'node:net';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:8123/index.html';
const PORT = 9355;
const waitPort = (port, tries = 60) => new Promise((resolve, reject) => {
  const tryOnce = (n) => { const s = net.connect(port, '127.0.0.1'); s.on('connect', () => { s.destroy(); resolve(); }); s.on('error', () => { s.destroy(); n <= 0 ? reject(new Error('no port')) : setTimeout(() => tryOnce(n - 1), 150); }); };
  tryOnce(tries);
});
const chrome = spawn(CHROME, ['--headless=new','--disable-gpu',`--remote-debugging-port=${PORT}`,'--window-size=1440,900','--no-first-run','--user-data-dir='+process.env.TEMP+'\\bpprobe4', URL], { stdio: 'ignore' });
let sock;
try {
  await waitPort(PORT);
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
  const page = targets.find((t) => t.type === 'page');
  sock = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r, j) => { sock.onopen = r; sock.onerror = j; });
  let id = 0; const pending = new Map();
  sock.onmessage = (ev) => { const d = JSON.parse(ev.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d.result); pending.delete(d.id); } };
  const send = (m, p = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); sock.send(JSON.stringify({ id: i, method: m, params: p })); });
  const js = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }))?.result?.value;
  await send('Runtime.enable');
  await new Promise((r) => setTimeout(r, 2800));
  console.log('GEOM:', await js(`(()=>{const s=document.getElementById('program'),t=document.querySelector('.blueprint-track');return JSON.stringify({bpActive:document.documentElement.classList.contains('bp-active'),bpExtra:getComputedStyle(s).getPropertyValue('--bp-extra').trim(),trackW:t.scrollWidth,innerW:innerWidth});})()`));
  console.log('PANELS:', await js(`JSON.stringify([...document.querySelectorAll('.blueprint-panel')].map(p=>{const r=p.getBoundingClientRect();return {cls:[...p.classList].filter(c=>c.startsWith('blueprint-panel--')).join(' ').replace(/blueprint-panel--/g,''),w:Math.round(r.width),h:Math.round(r.height),top:Math.round(r.top)};}))`));
  // schedule inner overflow?
  await js(`(()=>{const s=document.getElementById('program');scrollTo(0,s.getBoundingClientRect().top+scrollY+3000);return true;})()`);
  await new Promise((r) => setTimeout(r, 400));
  console.log('SCHED:', await js(`(()=>{const c=document.querySelector('.blueprint-panel--schedule .schedule-container');return JSON.stringify({scrollH:c.scrollHeight,clientH:c.clientHeight,overflowing:c.scrollHeight>c.clientHeight+2});})()`));
  console.log('META:', await js(`(()=>{const m=document.querySelector('.blueprint-panel--intro .bp-meta');return JSON.stringify({exists:!!m, borderBottom:m?getComputedStyle(m).borderBottomWidth:null});})()`));
  // Capture full-page screenshots at intro and schedule scroll positions.
  await send('Page.enable');
  const shot = async (name) => { const { data } = await send('Page.captureScreenshot', { format: 'png' }); const fs = await import('node:fs'); fs.writeFileSync(name, Buffer.from(data, 'base64')); };
  await js(`(()=>{const s=document.getElementById('program');scrollTo(0,s.getBoundingClientRect().top+scrollY+80);return true;})()`);
  await new Promise((r) => setTimeout(r, 500)); await shot('_shot_intro.png');
  await js(`(()=>{const s=document.getElementById('program');scrollTo(0,s.getBoundingClientRect().top+scrollY+800);return true;})()`);
  await new Promise((r) => setTimeout(r, 500)); await shot('_shot_agenda.png');
  await js(`(()=>{const s=document.getElementById('program');scrollTo(0,s.getBoundingClientRect().top+scrollY+2050);return true;})()`);
  await new Promise((r) => setTimeout(r, 500)); await shot('_shot_sched.png');
  console.log('SHOTS saved');
} catch (e) { console.error('ERR', e.message); } finally { if (sock) sock.close(); chrome.kill(); }
