/* 成就徽章同證書（第 10 階段）：徽章全部由進度計出嚟，唔使另外儲存 */
import { html, useApp, useState, useEffect, useRef, joinSay, progress, settings, useStore, createStore, starCount, fx } from './lib.js';
import { Btn, Spk, TopBar, Lily } from './ui.js';
import { MODULES } from './modules.js';
import { CHALLENGES } from './challenges.js';
import { SYLLABUS } from './syllabus.js';

const isDone = (prog, id) => !!(prog[id] && prog[id].status === 'done');
const chDone = (prog, id) => !!(prog[id] && prog[id].challenge && prog[id].challenge.done);
// 每個主題有邊幾個實驗（1.2 / 9.1 共用「海水變食鹽」，兩個主題都計）
export const topicMods = (tp) => [...new Set(tp.subs.flatMap((s) => s.modules || []))];

const count = (prog, f) => MODULES.filter((m) => f(prog, m.id)).length;
const nCh = () => Object.keys(CHALLENGES).length;
const N = MODULES.length;

export const BADGES = [
  { id: 'first', icon: '🔬', zh: '第一個實驗', en: 'First experiment', how: { zh: '完成任何一個實驗', en: 'Finish any experiment' }, p: (g) => [Math.min(1, count(g, isDone)), 1] },
  ...SYLLABUS.map((tp) => ({
    id: 'topic' + tp.n, icon: tp.icon, topic: tp.n,
    zh: `主題 ${tp.n} 小專家`, en: `Topic ${tp.n} expert`,
    how: { zh: `完成「${tp.zh}」所有實驗`, en: `Finish every experiment in “${tp.en}”` },
    p: (g) => { const ms = topicMods(tp); return [ms.filter((id) => isDone(g, id)).length, ms.length]; },
  })),
  { id: 'half', icon: '🧪', zh: '半路英雄', en: 'Halfway hero', how: { zh: '完成 15 個實驗', en: 'Finish 15 experiments' }, p: (g) => [Math.min(15, count(g, isDone)), 15] },
  { id: 'all', icon: '🏆', zh: '化學小博士', en: 'Little chemist', how: { zh: `完成全部 ${N} 個實驗`, en: `Finish all ${N} experiments` }, p: (g) => [count(g, isDone), N] },
  { id: 'self10', icon: '✋', zh: '自己動手大師', en: 'Hands-on master', how: { zh: '10 個實驗全程自己動手（冇用示範）', en: 'Do 10 experiments yourself (no “Show me”)' }, p: (g) => [Math.min(10, count(g, (p, id) => !!(p[id] && p[id].stars && p[id].stars.self))), 10] },
  { id: 'quiz10', icon: '🎯', zh: '一擊即中', en: 'Sharp shooter', how: { zh: '10 個思考挑戰一次答啱', en: 'Get 10 thinking challenges right first time' }, p: (g) => [Math.min(10, count(g, (p, id) => !!(p[id] && p[id].stars && p[id].stars.quiz))), 10] },
  { id: 'stars', icon: '🌟', zh: '星星收集家', en: 'Star collector', how: { zh: `儲齊 ${N * 3} 粒星`, en: `Collect all ${N * 3} stars` }, p: (g) => [MODULES.reduce((a, m) => a + starCount(g[m.id]), 0), N * 3] },
  { id: 'ch1', icon: '🎓', zh: '升中新手', en: 'Secondary starter', how: { zh: '完成第一個升中挑戰', en: 'Finish your first Secondary Challenge' }, p: (g) => [Math.min(1, count(g, chDone)), 1] },
  { id: 'ch10', icon: '📘', zh: '升中達人', en: 'Secondary star', how: { zh: '完成 10 個升中挑戰', en: 'Finish 10 Secondary Challenges' }, p: (g) => [Math.min(10, count(g, chDone)), 10] },
  { id: 'chAll', icon: '🎖️', zh: '升中挑戰王', en: 'Secondary champion', how: { zh: '完成全部升中挑戰', en: 'Finish every Secondary Challenge' }, p: (g) => [count(g, chDone), nCh()] },
  { id: 'chPerfect', icon: '💯', zh: '滿分高手', en: 'Full marks', how: { zh: '5 個升中挑戰三題都一次答啱', en: 'Get all three questions right first time in 5 Secondary Challenges' }, p: (g) => [Math.min(5, count(g, (p, id) => !!(p[id] && p[id].challenge && p[id].challenge.first))), 5] },
];
export const earned = (b, prog) => { const [a, t] = b.p(prog); return t > 0 && a >= t; };

// 證書：每個主題一張、畢業證書、升中挑戰證書
export function certList(prog) {
  return [
    ...SYLLABUS.map((tp) => ({ kind: 'topic-' + tp.n, icon: tp.icon, title: { zh: `主題 ${tp.n}：${tp.zh}`, en: `Topic ${tp.n}: ${tp.en}` }, ok: earned(BADGES.find((b) => b.id === 'topic' + tp.n), prog), ids: topicMods(tp), ch: false })),
    { kind: 'graduate', icon: '🏆', title: { zh: '小麗博士化學實驗室畢業證書', en: "Dr. Lily's Chemistry Lab Graduate" }, ok: earned(BADGES.find((b) => b.id === 'all'), prog), ids: MODULES.map((m) => m.id), ch: false },
    { kind: 'challenge', icon: '🎓', title: { zh: '升中挑戰證書', en: 'Secondary Challenge Certificate' }, ok: earned(BADGES.find((b) => b.id === 'chAll'), prog), ids: Object.keys(CHALLENGES), ch: true },
  ];
}

/* ---------- 新徽章提示（彈出＋朗讀） ---------- */
const seenStore = createStore('chemlab.badges.v1', { seen: null });
export function BadgeToast() {
  const { t, pick, say, lang } = useApp(); const prog = useStore(progress);
  const [show, setShow] = useState(null);
  useEffect(() => {
    const now = BADGES.filter((b) => earned(b, prog)).map((b) => b.id);
    const seen = seenStore.get().seen;
    if (!seen) { seenStore.set({ seen: now }); return; } // 第一次用：唔彈舊徽章
    const fresh = now.filter((id) => !seen.includes(id));
    if (!fresh.length) return;
    seenStore.set({ seen: [...seen, ...fresh] });
    const b = BADGES.find((x) => x.id === fresh[fresh.length - 1]);
    setShow(b);
    setTimeout(() => say('badge:' + b.id, joinSay(lang, [t('newBadge'), pick(b)]), { queue: true }), 1200);
  }, [prog]);
  useEffect(() => { if (!show) return undefined; const k = setTimeout(() => setShow(null), 6000); return () => clearTimeout(k); }, [show]);
  if (!show) return null;
  return html`<div role="status" className="pop-in fixed z-[65] left-1/2 -translate-x-1/2 top-20 flex items-center gap-3 pl-3 pr-2 py-2 rounded-2xl bg-white shadow-2xl ring-2 ring-amber-300">
    <span className="text-3xl" aria-hidden="true">${show.icon}</span>
    <div><p className="text-xs font-black text-amber-600">🏅 ${t('newBadge')}</p><p className="font-black text-slate-800">${pick(show)}</p></div>
    <button type="button" aria-label=${t('close')} onClick=${() => setShow(null)} className="w-9 h-9 rounded-full bg-slate-100 font-black">✕</button>
  </div>`;
}

/* ---------- 成就頁 ---------- */
export function BadgesPage({ onBack }) {
  const { t, pick, lang, go } = useApp(); const prog = useStore(progress);
  const got = BADGES.filter((b) => earned(b, prog)).length;
  const certs = certList(prog);
  const intro = t('badgesIntro', { g: got, n: BADGES.length });
  return html`<div className="app-h flex flex-col">
    <${TopBar} title=${t('badgesTitle')} left=${html`<${Btn} label=${t('back')} onClick=${onBack} className="h-11 px-3 bg-white ring-2 ring-slate-200 text-slate-700"><span className="text-xl leading-none" aria-hidden="true">‹</span><span className="hidden sm:inline">${t('back')}</span><//>`} />
    <main id="main" tabIndex="-1" className="outline-none flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 pb-28 space-y-6">
        <div className="flex items-start gap-2"><p className="flex-1 text-lg font-bold text-slate-700">🏅 ${intro}</p><${Spk} text=${intro} id="badges-intro" /></div>
        <ul className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          ${BADGES.map((b) => {
            const [a, n] = b.p(prog); const ok = a >= n;
            const say = joinSay(lang, [pick(b), pick(b.how), ok ? t('badgeGot') : t('badgeProgress', { a, n })]);
            return html`<li key=${b.id} data-badge=${b.id} data-earned=${ok ? '1' : '0'} className=${`rounded-3xl p-3 ring-2 text-center space-y-1 ${ok ? 'bg-amber-50 ring-amber-300' : 'bg-white ring-slate-200'}`}>
              <div className="text-4xl" style=${{ filter: ok ? 'none' : 'grayscale(1) opacity(.35)' }} aria-hidden="true">${b.icon}</div>
              <p className="font-black text-slate-800 leading-snug">${pick(b)}</p>
              <p className="text-xs text-slate-500 leading-snug">${pick(b.how)}</p>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuemin="0" aria-valuemax=${n} aria-valuenow=${a} aria-label=${pick(b)}>
                <div className="h-full rounded-full bg-amber-400" style=${{ width: `${(a / n) * 100}%` }}></div></div>
              <div className="flex items-center justify-center gap-1"><span className="text-xs font-bold text-slate-500">${ok ? '✅ ' + t('badgeGot') : `${a} / ${n}`}</span><${Spk} size="sm" text=${say} id=${'b-' + b.id} /></div>
            </li>`;
          })}
        </ul>
        <section className="space-y-3">
          <div className="flex items-center gap-2"><h2 className="flex-1 text-2xl font-black text-slate-800">📜 ${t('certsTitle')}</h2><${Spk} size="sm" text=${joinSay(lang, [t('certsTitle'), t('certsHow')])} id="certs" /></div>
          <p className="text-slate-600">${t('certsHow')}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            ${certs.map((c) => html`<${Btn} key=${c.kind} label=${pick(c.title)} onClick=${() => go('cert/' + c.kind)}
              className=${`w-full !justify-start text-left px-4 py-3 ring-2 ${c.ok ? 'bg-white ring-emerald-300 text-slate-800' : 'bg-slate-50 ring-slate-200 text-slate-500'}`}>
              <span className="text-2xl" aria-hidden="true">${c.ok ? c.icon : '🔒'}</span><span className="flex-1">${pick(c.title)}</span><//>`)}
          </div>
        </section>
      </div>
    </main>
  </div>`;
}

/* ---------- 證書 ---------- */
const fmtDate = (ms, lang) => new Date(ms).toLocaleDateString(lang === 'zh' ? 'zh-HK' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

export function CertPage({ kind, onBack }) {
  const { t, pick, lang } = useApp(); const prog = useStore(progress); const st = useStore(settings);
  const svgRef = useRef(null);
  const c = certList(prog).find((x) => x.kind === kind);
  const name = (st.nickname || '').trim();
  const last = c ? Math.max(0, ...c.ids.map((id) => (c.ch ? prog[id] && prog[id].challenge && prog[id].challenge.at : prog[id] && prog[id].at) || 0)) : 0;
  const date = fmtDate(last || Date.now(), lang);
  useEffect(() => { if (c && c.ok) fx.fire(); }, [kind]);

  async function downloadPng() {
    const svg = svgRef.current; if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data);
    await img.decode();
    const cv = document.createElement('canvas'); cv.width = 2246; cv.height = 1588;
    const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(img, 0, 0, cv.width, cv.height);
    const blob = await new Promise((r) => cv.toBlob(r, 'image/png'));
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `certificate-${kind}.png`;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  const bar = html`<${Btn} label=${t('back')} onClick=${onBack} className="h-11 px-3 bg-white ring-2 ring-slate-200 text-slate-700"><span className="text-xl leading-none" aria-hidden="true">‹</span><span className="hidden sm:inline">${t('back')}</span><//>`;
  if (!c) return html`<div className="app-h flex flex-col"><${TopBar} title=${t('certsTitle')} left=${bar} /><p className="p-6">—</p></div>`;
  const F = 'PingFang HK, Noto Sans TC, Microsoft JhengHei, sans-serif';
  const body = c.kind === 'graduate' ? t('certGradBody') : c.kind === 'challenge' ? t('certChBody') : t('certTopicBody');
  return html`<div className="app-h flex flex-col">
    <${TopBar} title=${t('certsTitle')} left=${bar} />
    <main id="main" tabIndex="-1" className="outline-none flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-5 pb-28 space-y-4">
        ${!c.ok ? html`<div className="rounded-3xl bg-white ring-2 ring-slate-200 p-6 text-center space-y-2">
            <div className="text-5xl" aria-hidden="true">🔒</div>
            <p className="font-black text-slate-800 text-lg">${pick(c.title)}</p>
            <div className="flex items-start gap-2 justify-center"><p className="text-slate-600">${t('certLocked')}</p><${Spk} size="sm" text=${t('certLocked')} id="cert-locked" /></div>
          </div>`
        : html`
          ${!name ? html`<label className="no-print block rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-3"><span className="block font-bold text-amber-900 mb-1">${t('certNameAsk')}</span>
            <input type="text" maxLength="16" placeholder=${t('nicknamePh')} onChange=${(e) => settings.set({ nickname: e.target.value.slice(0, 16) })}
              className="w-full h-12 px-3 rounded-xl ring-2 ring-amber-200 focus:ring-amber-400 outline-none text-lg" /></label>` : null}
          <div className="print-area rounded-2xl shadow-xl ring-1 ring-slate-200 overflow-hidden bg-white">
            <svg ref=${svgRef} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1123 794" role="img" aria-label=${`${t('certWord')}：${pick(c.title)}，${name}，${date}`} style=${{ display: 'block', width: '100%', height: 'auto' }}>
              <rect width="1123" height="794" fill="#fffdf5" />
              <rect x="24" y="24" width="1075" height="746" rx="28" fill="none" stroke="#f59e0b" strokeWidth="10" />
              <rect x="46" y="46" width="1031" height="702" rx="20" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="10 8" />
              <text x="561" y="150" textAnchor="middle" fontFamily=${F} fontSize="64" fontWeight="900" fill="#0f172a">${t('certWord')}</text>
              <text x="561" y="195" textAnchor="middle" fontFamily=${F} fontSize="24" fill="#64748b">${lang === 'zh' ? 'Certificate of Achievement' : '小麗博士化學實驗室'}</text>
              <text x="561" y="280" textAnchor="middle" fontFamily=${F} fontSize="28" fill="#334155">${t('certPresented')}</text>
              <text x="561" y="360" textAnchor="middle" fontFamily=${F} fontSize="60" fontWeight="900" fill="#b45309">${name || '＿＿＿＿＿＿'}</text>
              <line x1="331" y1="380" x2="791" y2="380" stroke="#fbbf24" strokeWidth="3" />
              <text x="561" y="450" textAnchor="middle" fontFamily=${F} fontSize="30" fill="#334155">${body}</text>
              <text x="561" y="510" textAnchor="middle" fontFamily=${F} fontSize="38" fontWeight="900" fill="#0369a1">${c.icon} ${pick(c.title)}</text>
              <text x="160" y="680" fontFamily=${F} fontSize="24" fill="#475569">${t('certDate')}：${date}</text>
              <text x="760" y="660" fontFamily=${F} fontSize="30" fontStyle="italic" fill="#0f172a">${t('certSign')}</text>
              <line x1="740" y1="675" x2="980" y2="675" stroke="#94a3b8" strokeWidth="2" />
              <text x="760" y="705" fontFamily=${F} fontSize="20" fill="#64748b">${lang === 'zh' ? '小麗博士化學實驗室' : "Dr. Lily's Chemistry Lab"}</text>
              <${Lily} x="70" y="430" width="150" height="175" />
              <circle cx="980" cy="160" r="62" fill="#fde68a" stroke="#f59e0b" strokeWidth="6" />
              <text x="980" y="182" textAnchor="middle" fontSize="60">${c.icon}</text>
            </svg>
          </div>
          <div className="no-print flex flex-wrap gap-2">
            <${Btn} label=${t('certPrint')} onClick=${() => window.print()} className="px-4 py-2 bg-sky-500 text-white shadow">🖨️ ${t('certPrint')}<//>
            <${Btn} label=${t('certPng')} onClick=${downloadPng} className="px-4 py-2 bg-emerald-500 text-white shadow">⬇️ ${t('certPng')}<//>
          </div>`}
      </div>
    </main>
  </div>`;
}
