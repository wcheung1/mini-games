/* 交功課：學生將進度變成一條連結＋QR code，老師用 iPad 相機掃，就會加入老師部機嘅班表。
   唔經任何伺服器：資料只喺連結入面，同埋老師部機嘅 localStorage。 */
import { html, useApp, useState, joinSay, progress, settings, useStore } from './lib.js';
import { Btn, Spk, TopBar } from './ui.js';
import { MODULES } from './modules.js';
import qrcode from './vendor/qrcode.js';

// 每個實驗用第一個課題編號做短碼（例如 3.2 → 32），之後加新實驗唔會影響舊碼
export const shortOf = (m) => m.topics[0].replace('.', '');
const BY_SHORT = Object.fromEntries(MODULES.map((m) => [shortOf(m), m.id]));
const ALPHA = '0123456789abcdefghijklmnopqrstuv'; // 5 bits

// 每個實驗一個數值：1 完成、2 自己動手、4 一次答啱、8 升中挑戰完成、16 升中挑戰全部一次答啱
export function packProgress(prog) {
  return MODULES.map((m) => {
    const r = prog[m.id]; if (!r || r.status !== 'done') return '';
    const v = 1 | (r.stars && r.stars.self ? 2 : 0) | (r.stars && r.stars.quiz ? 4 : 0) | (r.challenge && r.challenge.done ? 8 : 0) | (r.challenge && r.challenge.first ? 16 : 0);
    return shortOf(m) + ALPHA[v];
  }).join('');
}
export function unpackProgress(p) {
  const out = {};
  for (const m of String(p || '').matchAll(/(\d{2})([0-9a-v])/g)) {
    const id = BY_SHORT[m[1]]; if (!id) continue;
    const v = ALPHA.indexOf(m[2]);
    out[id] = { done: !!(v & 1), self: !!(v & 2), quiz: !!(v & 4), ch: !!(v & 8), chFirst: !!(v & 16) };
  }
  return out;
}
const b64u = (s) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)));
export const encodeSubmission = (name, prog) => b64u(JSON.stringify({ v: 1, n: name, t: Date.now(), p: packProgress(prog) }));
export function decodeSubmission(code) {
  try {
    const o = JSON.parse(unb64u(String(code).trim()));
    if (!o || o.v !== 1 || typeof o.n !== 'string' || !o.n.trim()) return null;
    return { name: o.n.trim().slice(0, 16), t: +o.t || Date.now(), p: String(o.p || ''), mods: unpackProgress(o.p) };
  } catch (e) { return null; }
}
// 網站嘅網址（GitHub Pages 會有 /repo 名/）
export const siteUrl = (hash) => location.origin + location.pathname + '#/' + hash;

export function QR({ text, label, size = 260 }) {
  const q = qrcode(0, 'L'); q.addData(text); q.make();
  const n = q.getModuleCount(), pad = 4; let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + pad} ${r + pad}h1v1h-1z`;
  return html`<svg role="img" aria-label=${label} viewBox=${`0 0 ${n + pad * 2} ${n + pad * 2}`} width=${size} height=${size} shapeRendering="crispEdges" className="bg-white rounded-xl" data-qr=${text}>
    <rect width="100%" height="100%" fill="#fff" /><path d=${d} fill="#000" /></svg>`;
}

export async function copyText(s) {
  try { await navigator.clipboard.writeText(s); return true; } catch (e) { /* 舊瀏覽器 */ }
  const ta = document.createElement('textarea'); ta.value = s; document.body.appendChild(ta); ta.select();
  let ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; } ta.remove(); return ok;
}

/* ---------- 學生：交功課頁 ---------- */
export function SharePage({ onBack }) {
  const { t, lang, say } = useApp(); const prog = useStore(progress); const st = useStore(settings);
  const [copied, setCopied] = useState(false);
  const name = (st.nickname || '').trim();
  const doneN = MODULES.filter((m) => prog[m.id] && prog[m.id].status === 'done').length;
  const link = name ? siteUrl('teacher/import/' + encodeSubmission(name, prog)) : '';
  const how = t('shareHow');
  return html`<div className="app-h flex flex-col">
    <${TopBar} title=${t('shareTitle')} left=${html`<${Btn} label=${t('back')} onClick=${onBack} className="h-11 px-3 bg-white ring-2 ring-slate-200 text-slate-700"><span className="text-xl leading-none" aria-hidden="true">‹</span><span className="hidden sm:inline">${t('back')}</span><//>`} />
    <main id="main" tabIndex="-1" className="outline-none flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-5 pb-28 space-y-4">
        <div className="flex items-start gap-2"><p className="flex-1 text-slate-700 leading-relaxed">${how}</p><${Spk} text=${how} id="share-how" /></div>
        <label className="block rounded-2xl bg-white ring-1 ring-slate-200 p-3"><span className="block font-bold text-slate-700 mb-1">${t('setNickname')}</span>
          <input type="text" maxLength="16" value=${st.nickname || ''} placeholder=${t('nicknamePh')} onChange=${(e) => settings.set({ nickname: e.target.value.slice(0, 16) })}
            className="w-full h-12 px-3 rounded-xl ring-2 ring-slate-200 focus:ring-sky-400 outline-none text-lg" /></label>
        <p className="font-bold text-slate-600">📊 ${t('progressTxt', { d: doneN, n: MODULES.length })}</p>
        ${name ? html`<div className="rounded-3xl bg-white shadow ring-1 ring-slate-200 p-4 flex flex-col items-center gap-3">
            <${QR} text=${link} label=${t('shareQr')} />
            <p className="text-sm text-slate-500 text-center">${t('shareScan')}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <${Btn} label=${t('copyLink')} onClick=${async () => { const ok = await copyText(link); setCopied(ok); say('copied', ok ? t('copied') : t('copyFail')); }} className="px-4 py-2 bg-sky-500 text-white shadow">📋 ${copied ? t('copied') : t('copyLink')}<//>
            </div>
          </div>`
        : html`<p className="rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-3 font-bold text-amber-900">${t('shareNeedName')}</p>`}
        <p className="text-xs text-slate-400">🔒 ${t('privacyNote')}</p>
      </div>
    </main>
  </div>`;
}
