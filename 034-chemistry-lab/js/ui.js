/* 共用介面元件 */
import { html, useApp, useEffect, useRef, useSyncExternalStore, joinSay, fx, settings, useStore } from './lib.js';
import { ChemText, chemPlain } from './chem.js';
import { Speech } from './speech.js';

export const useSpeech = () => useSyncExternalStore(Speech.subscribe, Speech.get);

function IconSpeaker({ active }) {
  return html`<svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
    <path className=${active ? 'wave1' : ''} d="M15.5 9a4 4 0 0 1 0 6" />
    <path className=${active ? 'wave2' : ''} d="M18.5 6.5a7.5 7.5 0 0 1 0 11" />
  </svg>`;
}

// 小喇叭：撳一下就讀出 text（屬於用戶主動要求，會截斷舊語音）
export function Spk({ text, id, size = 'md' }) {
  const { say, t } = useApp(); const sp = useSpeech();
  const sid = id || ('t:' + String(text).slice(0, 48));
  const on = sp.id === sid && sp.playing;
  const sz = size === 'sm' ? 'w-9 h-9 p-[7px]' : 'w-11 h-11 p-2';
  return html`<button type="button" aria-label=${t('speakerAria')} title=${t('speakerAria')}
    className=${`shrink-0 ${sz} rounded-full shadow ring-2 transition active:scale-90 ${on ? 'bg-amber-400 text-white ring-amber-300' : 'bg-white text-sky-600 ring-sky-200 hover:bg-sky-50'}`}
    onClick=${(e) => { e.stopPropagation(); say(sid, text); }}><${IconSpeaker} active=${on} /></button>`;
}

// 一般按鈕：點讀模式時讀出名，唔執行
export function Btn({ label, onClick, className = '', children, disabled = false, style, ariaLabel, current }) {
  const { readMode, say } = useApp();
  label = chemPlain(label);
  return html`<button type="button" aria-label=${chemPlain(ariaLabel) || label} aria-disabled=${disabled ? 'true' : 'false'} aria-current=${current ? 'step' : undefined} style=${style}
    className=${`rm-target inline-flex items-center justify-center gap-2 min-h-11 rounded-2xl font-bold transition active:scale-[.97] ${disabled ? 'opacity-45 cursor-not-allowed' : ''} ${className}`}
    onClick=${(e) => { if (readMode) { e.stopPropagation(); say('btn:' + label, label); return; } if (!disabled && onClick) onClick(e); }}>${children ?? label}</button>`;
}

export function Lily({ className = '', talking = false, ...rest }) {
  return html`<svg viewBox="0 0 120 140" className=${className} aria-hidden="true" ...${rest}>
    <path d="M22 62 C18 30 40 14 60 14 C82 14 102 30 98 62 L100 96 C92 101 84 99 80 93 L40 93 C36 99 27 101 20 96 Z" fill="#3b2a24" />
    <path d="M16 140 C16 112 33 100 60 100 C87 100 104 112 104 140 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
    <path d="M60 101 L47 140 M60 101 L73 140" stroke="#cbd5e1" strokeWidth="2" />
    <path d="M50 101 L60 117 L70 101 Z" fill="#38bdf8" />
    <rect x="52" y="85" width="16" height="17" rx="6" fill="#f3c19c" />
    <ellipse cx="60" cy="62" rx="30" ry="32" fill="#ffd9b8" />
    <path d="M30 58 C29 35 45 26 60 26 C76 26 92 35 90 58 C81 47 71 41 60 43 C49 41 39 47 30 58 Z" fill="#3b2a24" />
    <rect x="29" y="33" width="62" height="7" rx="3.5" fill="#14b8a6" />
    <circle cx="47" cy="37" r="9.5" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="3" />
    <circle cx="73" cy="37" r="9.5" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="3" />
    <circle cx="44" cy="34" r="2.5" fill="#ffffff" /><circle cx="70" cy="34" r="2.5" fill="#ffffff" />
    <ellipse cx="48" cy="64" rx="3.8" ry="4.8" fill="#1e293b" /><ellipse cx="72" cy="64" rx="3.8" ry="4.8" fill="#1e293b" />
    <circle cx="49.4" cy="62.2" r="1.4" fill="#ffffff" /><circle cx="73.4" cy="62.2" r="1.4" fill="#ffffff" />
    <ellipse cx="39" cy="74" rx="5.5" ry="3.2" fill="#fda4af" opacity=".75" /><ellipse cx="81" cy="74" rx="5.5" ry="3.2" fill="#fda4af" opacity=".75" />
    ${talking
      ? html`<ellipse className="mouth-talk" cx="60" cy="81" rx="6" ry="4.5" fill="#be123c" />`
      : html`<path d="M52 79 Q60 86 68 79" stroke="#be123c" strokeWidth="3" fill="none" strokeLinecap="round" />`}
    <rect x="77" y="116" width="15" height="13" rx="2" fill="none" stroke="#cbd5e1" strokeWidth="2" />
    <path d="M81 111 v9" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" /><path d="M87 112 v8" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" />
  </svg>`;
}

export const TAG_STYLE = {
  intro: 'bg-sky-100 text-sky-700', try: 'bg-emerald-100 text-emerald-700', observe: 'bg-indigo-100 text-indigo-700',
  feynman: 'bg-pink-100 text-pink-700', first: 'bg-violet-100 text-violet-700', life: 'bg-lime-100 text-lime-800',
  quiz: 'bg-amber-100 text-amber-700', event: 'bg-orange-100 text-orange-700',
  term: 'bg-indigo-100 text-indigo-700', equation: 'bg-fuchsia-100 text-fuchsia-700', exam: 'bg-rose-100 text-rose-700',
};

// 小麗博士對白泡泡
export function Tutor({ tag, text, id, big = false, sayText }) {
  const { t, lang } = useApp(); const sp = useSpeech();
  const full = sayText || (tag ? joinSay(lang, [t('tag_' + tag), text]) : text);
  return html`<div className="flex gap-3 items-start">
    <div className=${`${big ? 'w-24 sm:w-32' : 'w-16 sm:w-20'} shrink-0 lily-float`}><${Lily} talking=${sp.playing} className="w-full drop-shadow-md" /></div>
    <div key=${id} className="pop-in relative flex-1 bg-white rounded-3xl rounded-tl-md p-3 sm:p-4 shadow-lg ring-1 ring-sky-100">
      ${tag ? html`<span className=${`inline-block mb-1.5 px-2.5 py-0.5 rounded-full text-xs font-black ${TAG_STYLE[tag] || ''}`}>${t('tag_' + tag)}</span>` : null}
      <div className="flex gap-2 items-start">
        <p className=${`flex-1 leading-relaxed text-slate-800 ${big ? 'text-lg sm:text-xl' : 'text-[17px]'}`}><${ChemText} text=${text} /></p>
        <${Spk} id=${id} text=${full} />
      </div>
    </div>
  </div>`;
}

export function ReadModeToggle() {
  const { readMode, setReadMode, t, say } = useApp();
  return html`<button type="button" aria-pressed=${readMode} aria-label=${t('readMode')} title=${t('readMode')}
    onClick=${() => { const nv = !readMode; setReadMode(nv); say('rm', nv ? t('readModeOnSay') : t('readModeOffSay')); }}
    className=${`flex items-center gap-1.5 h-11 px-3 rounded-full font-bold text-sm shadow-sm ring-2 transition active:scale-95 ${readMode ? 'bg-amber-400 text-white ring-amber-500' : 'bg-white text-slate-700 ring-slate-200'}`}>
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 4l5 5-9.5 9.5L5 20l1.5-5.5z" /><path d="M13 6l5 5" /></svg>
    <span className="hidden lg:inline">${t('readMode')}</span>
  </button>`;
}

export function AutoplayToggle() {
  const { autoplay, setAutoplay, t, say, readMode } = useApp();
  return html`<button type="button" aria-pressed=${autoplay} aria-label=${t('autoplay')} title=${t('autoplay')}
    onClick=${() => { if (readMode) { say('btn:auto', t('autoplay')); return; } const nv = !autoplay; setAutoplay(nv); say('ap', nv ? t('autoplayOnSay') : t('autoplayOffSay')); }}
    className=${`rm-target flex items-center gap-1.5 h-11 px-3 rounded-full font-bold text-sm shadow-sm ring-2 transition active:scale-95 ${autoplay ? 'bg-emerald-500 text-white ring-emerald-600' : 'bg-white text-slate-700 ring-slate-200'}`}>
    <span aria-hidden="true" className="text-base leading-none">${autoplay ? '▶' : '⏸'}</span>
    <span className="hidden sm:inline">${t('autoplay')}</span>
  </button>`;
}

export function LangToggle() {
  const { lang, setLang } = useApp();
  const seg = (on) => `px-3 h-9 rounded-full grid place-items-center text-sm font-black transition ${on ? 'bg-sky-500 text-white shadow' : 'text-slate-500'}`;
  return html`<button type="button" aria-label="中文 / English" onClick=${() => setLang(lang === 'zh' ? 'en' : 'zh')}
    className="flex items-center p-1 rounded-full bg-white ring-2 ring-slate-200 shadow-sm active:scale-95">
    <span className=${seg(lang === 'zh')}>中</span><span className=${seg(lang === 'en')}>EN</span>
  </button>`;
}

export function SettingsToggle() {
  const { t, openSettings, readMode, say } = useApp();
  return html`<button type="button" aria-label=${t('settings')} title=${t('settings')}
    onClick=${() => { if (readMode) { say('btn:settings', t('settings')); return; } openSettings(); }}
    className="rm-target grid place-items-center w-11 h-11 rounded-full bg-white ring-2 ring-slate-200 shadow-sm text-lg active:scale-95"><span aria-hidden="true">⚙️</span></button>`;
}

// 設定：升中模式、朗讀化學式、字體大小、高對比、減少動畫、語速、暱稱
export function SettingsSheet({ onClose }) {
  const { t, lang } = useApp(); const st = useStore(settings);
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, []);
  const Sw = ({ k, label }) => html`<label className="flex items-center gap-3 py-2 cursor-pointer">
    <input type="checkbox" className="peer sr-only" checked=${!!st[k]} onChange=${(e) => settings.set({ [k]: e.target.checked })} />
    <span aria-hidden="true" className=${`relative w-12 h-7 shrink-0 rounded-full transition peer-focus-visible:ring-4 peer-focus-visible:ring-sky-300 ${st[k] ? 'bg-emerald-500' : 'bg-slate-300'}`}>
      <span className=${`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${st[k] ? 'left-6' : 'left-1'}`}></span></span>
    <span className="flex-1 font-bold text-slate-700">${label}</span>
  </label>`;
  const Seg = ({ k, label, opts }) => html`<fieldset className="py-2">
    <legend className="font-bold text-slate-700 mb-1.5">${label}</legend>
    <div className="flex gap-2">${opts.map(([v, l]) => html`<label key=${v} className=${`flex-1 text-center cursor-pointer rounded-xl py-2 font-bold ring-2 ${st[k] === v ? 'bg-sky-500 text-white ring-sky-600' : 'bg-white text-slate-600 ring-slate-200'}`}>
      <input type="radio" name=${k} value=${v} className="sr-only" checked=${st[k] === v} onChange=${() => settings.set({ [k]: v })} />${l}</label>`)}</div>
  </fieldset>`;
  return html`<div className="fixed inset-0 z-[80] grid place-items-center bg-slate-900/40 backdrop-blur-sm p-3" onClick=${onClose}>
    <div role="dialog" aria-modal="true" aria-labelledby="set-title" className="pop-in w-[min(94vw,520px)] max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl p-5" onClick=${(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2 mb-2">
        <h2 id="set-title" className="flex-1 text-xl font-black text-slate-800">⚙️ ${t('settingsTitle')}</h2>
        <button type="button" autoFocus aria-label=${t('close')} onClick=${onClose} className="w-11 h-11 rounded-full bg-slate-100 font-black text-lg">✕</button>
      </div>
      <div className="divide-y divide-slate-100">
        <${Sw} k="challengeAll" label=${'🎓 ' + t('setChallengeAll')} />
        <${Sw} k="readFormula" label=${'🔤 ' + t('setReadFormula')} />
        <${Seg} k="textSize" label=${t('setTextSize')} opts=${[['md', t('size_md')], ['lg', t('size_lg')], ['xl', t('size_xl')]]} />
        <${Seg} k="rate" label=${t('setRate')} opts=${[['slow', t('rate_slow')], ['normal', t('rate_normal')], ['fast', t('rate_fast')]]} />
        <${Sw} k="contrast" label=${t('setContrast')} />
        <${Sw} k="reduceMotion" label=${t('setMotion')} />
        <label className="block py-2"><span className="block font-bold text-slate-700 mb-1.5">${t('setNickname')}</span>
          <input type="text" maxLength="16" value=${st.nickname || ''} placeholder=${t('nicknamePh')} lang=${lang === 'zh' ? 'zh-HK' : 'en-GB'}
            onChange=${(e) => settings.set({ nickname: e.target.value.slice(0, 16) })}
            className="w-full h-12 px-3 rounded-xl ring-2 ring-slate-200 focus:ring-sky-400 outline-none text-lg" /></label>
      </div>
    </div>
  </div>`;
}

export function TopBar({ left, title, titleSpeak }) {
  return html`<header className="sticky top-0 z-30 flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/90 backdrop-blur border-b border-sky-100"
    style=${{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}>
    ${left}
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <h1 className="font-black text-base sm:text-xl text-slate-800 truncate"><${ChemText} text=${title} /></h1>
      <${Spk} text=${titleSpeak || title} size="sm" id=${'title:' + title} />
    </div>
    <${AutoplayToggle} /><${ReadModeToggle} /><${LangToggle} /><${SettingsToggle} />
  </header>`;
}

export function SafetyNote() {
  const { t } = useApp();
  return html`<div className="flex items-start gap-2 rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-3 text-sm text-amber-900">
    <span aria-hidden="true">⚠️</span><p className="flex-1 leading-relaxed">${t('safety')}</p><${Spk} size="sm" text=${t('safety')} id="safety" />
  </div>`;
}

export function NowPlaying() {
  const sp = useSpeech(); const { t, setAutoplay } = useApp();
  if (!sp.playing && !sp.paused) return null;
  const b = 'h-10 px-3 rounded-full font-bold text-sm active:scale-95 transition';
  return html`<div role="status" className="fixed z-50 left-1/2 -translate-x-1/2 flex items-center gap-2 pl-4 pr-2 py-2 rounded-full bg-slate-900/92 text-white shadow-2xl"
    style=${{ bottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
    <span className=${`eq ${sp.playing ? 'on' : ''}`}><i></i><i></i><i></i></span>
    <span className="text-sm font-bold whitespace-nowrap">${sp.playing ? t('reading') : t('pausedTxt')}</span>
    <span className="hidden md:block text-xs opacity-70 max-w-[28vw] truncate">${sp.text}</span>
    ${sp.playing
      ? html`<button type="button" className=${b + ' bg-amber-400 text-slate-900'} onClick=${Speech.pause}>⏸ ${t('pause')}</button>`
      : html`<button type="button" className=${b + ' bg-emerald-400 text-slate-900'} onClick=${Speech.resume}>▶ ${t('resume')}</button>`}
    <button type="button" aria-label=${t('stop')} className=${b + ' bg-white/15'} onClick=${() => { setAutoplay(false); Speech.stop(); }}>■ <span className="hidden sm:inline">${t('stop')}</span></button>
  </div>`;
}

export function VoiceToast() {
  const sp = useSpeech(); const { t } = useApp();
  if (!sp.missing) return null;
  const msg = sp.missing === 'nosupport' ? t('noTts') : (sp.missing === 'zh-HK' ? t('voiceMissingZh') : t('voiceMissingEn'));
  return html`<div className="fixed z-50 top-20 left-1/2 -translate-x-1/2 w-[min(92vw,520px)] pop-in flex items-start gap-2 p-3 rounded-2xl bg-white shadow-2xl ring-2 ring-amber-300">
    <span aria-hidden="true" className="text-xl">🔈</span>
    <p className="flex-1 text-sm leading-relaxed text-slate-700">${msg}</p>
    <button type="button" aria-label=${t('close')} className="w-9 h-9 rounded-full bg-slate-100 font-black" onClick=${Speech.dismissMissing}>✕</button>
  </div>`;
}

export function Stars({ rec, size = 'text-lg' }) {
  const s = rec && rec.stars ? rec.stars : {};
  return html`<span className=${`inline-flex gap-0.5 ${size}`} aria-hidden="true">
    ${['finish', 'self', 'quiz'].map((k) => html`<span key=${k} style=${{ filter: s[k] ? 'none' : 'grayscale(1) opacity(.3)' }}>⭐</span>`)}
  </span>`;
}

export function GestureTips({ onClose }) {
  const { t, lang } = useApp();
  const lines = [['☝️', t('g1')], ['✌️', t('g2')], ['🤏', t('g3')], ['✊', t('g4')], ['👆', t('g5')]];
  const speak = joinSay(lang, [t('gestureTitle'), ...lines.map((l) => l[1])]);
  return html`<div className="pop-in absolute left-3 top-3 z-10 w-[min(88%,350px)] rounded-2xl bg-white/95 backdrop-blur shadow-xl ring-1 ring-sky-100 p-3">
    <div className="flex items-center gap-2 mb-2"><h3 className="flex-1 font-black text-slate-800">${t('gestureTitle')}</h3><${Spk} size="sm" text=${speak} id="tips" /></div>
    <ul className="space-y-1.5 text-[15px] text-slate-700">
      ${lines.map(([e, s]) => html`<li key=${s} className="flex gap-2"><span aria-hidden="true">${e}</span><span>${s}</span></li>`)}
    </ul>
    <${Btn} label=${t('gotIt')} onClick=${onClose} className="mt-3 w-full bg-sky-500 text-white shadow" />
  </div>`;
}

/* ---------- 煙花＋彩紙 ---------- */
export function Fireworks() {
  const ref = useRef(null);
  useEffect(() => {
    let raf = 0, parts = [], until = 0, bursts = [];
    const COLORS = ['#f43f5e', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#eab308', '#14b8a6'];
    let last = 0;
    const loop = (now) => {
      const c = ref.current; if (!c) return;
      const step = last ? Math.min(6, Math.max(0.5, (now - last) / (1000 / 60))) : 1; last = now;
      const ctx = c.getContext('2d'); const W = c.width, H = c.height, dpr = window.devicePixelRatio || 1;
      bursts = bursts.filter((b) => { if (now >= b.at) { explode(b.x * W, b.y * H, dpr); return false; } return true; });
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      parts = parts.filter((p) => p.life > 0);
      parts.forEach((p) => {
        p.life -= step / 60; const dr = Math.pow(p.drag, step); p.vx *= dr; p.vy = p.vy * dr + p.g * step; p.x += p.vx * step; p.y += p.vy * step; p.rot += p.vr * step;
        const a = Math.max(0, Math.min(1, p.life / p.max * 1.4));
        ctx.globalAlpha = a; ctx.fillStyle = p.color;
        if (p.kind === 'spark') { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
        else { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalCompositeOperation = 'source-over'; ctx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r); ctx.restore(); ctx.globalCompositeOperation = 'lighter'; }
      });
      ctx.globalAlpha = 1;
      if (now < until || parts.length || bursts.length) raf = requestAnimationFrame(loop); else { ctx.clearRect(0, 0, W, H); raf = 0; last = 0; }
    };
    function explode(x, y, dpr) {
      const col = COLORS[Math.floor(Math.random() * COLORS.length)], col2 = COLORS[Math.floor(Math.random() * COLORS.length)];
      for (let i = 0; i < 70; i++) {
        const a = Math.random() * Math.PI * 2, s = (2 + Math.random() * 5.5) * dpr;
        parts.push({ kind: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 0.07 * dpr, drag: 0.975, r: (1.6 + Math.random() * 2) * dpr, color: i % 3 ? col : col2, life: 1.3 + Math.random() * 0.5, max: 1.8, rot: 0, vr: 0 });
      }
    }
    const off = fx.on(() => {
      const c = ref.current; if (!c) return;
      if (document.documentElement.classList.contains('reduce-motion') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const dpr = window.devicePixelRatio || 1; c.width = window.innerWidth * dpr; c.height = window.innerHeight * dpr;
      const now = performance.now();
      for (let i = 0; i < 7; i++) bursts.push({ at: now + i * 260, x: 0.15 + Math.random() * 0.7, y: 0.12 + Math.random() * 0.35 });
      for (let i = 0; i < 140; i++) {
        parts.push({ kind: 'confetti', x: Math.random() * c.width, y: -Math.random() * c.height * 0.4, vx: (Math.random() - 0.5) * 2 * dpr, vy: (1.5 + Math.random() * 2.5) * dpr, g: 0.02 * dpr, drag: 0.995, r: (4 + Math.random() * 4) * dpr, color: COLORS[i % COLORS.length], life: 3.2 + Math.random(), max: 4.2, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3 });
      }
      until = now + 3500;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    return () => { off(); cancelAnimationFrame(raf); };
  }, []);
  return html`<canvas ref=${ref} className="fx-canvas" aria-hidden="true"></canvas>`;
}
