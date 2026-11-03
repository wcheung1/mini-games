/* 主頁：導師介紹、開放中嘅實驗、進度、完整課程地圖、自動導覽 */
import { html, useApp, useState, useEffect, useRef, useCallback, joinSay, sleep, progress, settings, useStore, starCount, isChallengeOpen, ink } from './lib.js';
import { CHALLENGES } from './challenges.js';
import { Speech } from './speech.js';
import { Btn, Spk, Tutor, TopBar, SafetyNote, Stars } from './ui.js';
import { MODULES } from './modules.js';
import { SYLLABUS, ALL_SUBS } from './syllabus.js';

const MOD_BY_ID = Object.fromEntries(MODULES.map((m) => [m.id, m]));
let lastTourSignal = 0;

function statusOf(rec) { return !rec ? 'new' : rec.status === 'done' ? 'done' : 'started'; }
const CHIP = {
  done: 'bg-emerald-100 text-emerald-700', started: 'bg-sky-100 text-sky-700', new: 'bg-slate-100 text-slate-600',
  open: 'bg-sky-100 text-sky-700', next: 'bg-amber-100 text-amber-700', locked: 'bg-slate-100 text-slate-500',
};

// 升中挑戰掣：未解鎖 🔒（撳會講點樣解鎖）、已解鎖 ▶、完成咗 🎓
function ChallengeBtn({ mod, rec, onOpen, small = false }) {
  const { t, say } = useApp(); useStore(settings);
  if (!CHALLENGES[mod.id]) return null;
  const open = isChallengeOpen(mod.id);
  const done = rec && rec.challenge && rec.challenge.done;
  const icon = done ? '🎓' : open ? '▶' : '🔒';
  const label = `${t('challenge')}${done ? '（' + t('challengeDone') + '）' : ''}`;
  return html`<${Btn} label=${label} onClick=${() => (open ? onOpen(mod.id, 'challenge') : say('locked', t('challengeLocked')))}
    className=${`${small ? '!min-h-9 px-3 text-sm' : 'w-full py-2'} ${open ? 'bg-indigo-600 text-white shadow' : 'bg-slate-100 text-slate-500 ring-2 ring-slate-200'}`}>
    <span aria-hidden="true">${icon}</span> ${t('challenge')}<//>`;
}

function LessonCard({ mod, onOpen, rec, focus }) {
  const { t, pick, lang } = useApp();
  const st = statusOf(rec);
  const speakText = joinSay(lang, [pick(mod.title), pick(mod.desc)]);
  const Art = mod.Art;
  return html`<article data-tour=${'card-' + mod.id} className=${`pop-in rounded-3xl bg-white shadow-lg ring-1 ring-slate-100 overflow-hidden flex flex-col ${focus ? 'tour-focus' : ''}`}>
    <div className="h-32 grid place-items-center relative" style=${{ background: mod.bg }}>
      <span className="absolute left-3 top-3 px-2.5 py-1 rounded-full text-xs font-black text-white shadow" style=${{ background: ink(mod.accent) }}>${t('topicWord')} ${mod.topics.join(' · ')}</span>
      <span className=${`absolute right-3 top-3 px-2.5 py-1 rounded-full text-xs font-black ${CHIP[st]}`}>${st === 'done' ? '✅ ' : ''}${t('st_' + st)}</span>
      ${Art ? html`<${Art} />` : null}
    </div>
    <div className="p-4 flex-1 flex flex-col gap-2">
      <div className="flex items-start gap-2">
        <h2 className="flex-1 text-xl font-black leading-snug" style=${{ color: mod.dark }}>${pick(mod.title)}</h2>
        <${Spk} text=${speakText} id=${'card-' + mod.id} />
      </div>
      <p className="text-slate-600 leading-relaxed">${pick(mod.desc)}</p>
      <div className="flex items-center gap-2"><${Stars} rec=${rec} /><span className="text-xs text-slate-400 font-bold">${starCount(rec)} / 3</span></div>
      <${Btn} label=${st === 'done' ? t('replay') : st === 'started' ? t('continue') : t('start')} onClick=${() => onOpen(mod.id)}
        className="mt-auto w-full py-3 text-lg text-white shadow-md" style=${{ background: ink(mod.accent) }}>${st === 'done' ? t('replay') : st === 'started' ? t('continue') : t('start')} ›<//>
      <${ChallengeBtn} mod=${mod} rec=${rec} onOpen=${onOpen} />
    </div>
  </article>`;
}

function Roadmap({ prog, onOpen, focus }) {
  const { t, pick, lang } = useApp();
  return html`<section data-tour="roadmap" className=${`space-y-4 ${focus ? 'tour-focus rounded-3xl' : ''}`}>
    <div className="flex items-start gap-2">
      <h2 className="flex-1 text-2xl font-black text-slate-800">🗺️ ${t('roadmap')}</h2>
      <${Spk} text=${joinSay(lang, [t('roadmap'), t('roadmapIntro')])} id="roadmap-intro" />
    </div>
    <p className="text-slate-600 leading-relaxed">${t('roadmapIntro')}</p>
    <div className="grid gap-4 md:grid-cols-2">
      ${SYLLABUS.map((tp) => {
        const sayTopic = joinSay(lang, [`${t('topicWord')} ${tp.n}：${pick(tp)}`, ...tp.subs.map((s) => {
          const mods = (s.modules || []).map((id) => MOD_BY_ID[id]).filter(Boolean);
          const stt = mods.length ? (mods.every((m) => statusOf(prog[m.id]) === 'done') ? t('st_done') : t('st_open')) : s.next ? t('st_next') : t('st_locked');
          return `${s.code} ${pick(s)}，${stt}`;
        })]);
        return html`<article key=${tp.n} className="rounded-3xl bg-white shadow ring-1 ring-slate-100 overflow-hidden">
          <header className="flex items-center gap-2 px-4 py-3" style=${{ background: tp.color + '1a' }}>
            <span className="text-2xl" aria-hidden="true">${tp.icon}</span>
            <h3 className="flex-1 font-black text-slate-800">${t('topicWord')} ${tp.n}　${pick(tp)}</h3>
            <${Spk} size="sm" text=${sayTopic} id=${'topic-' + tp.n} />
          </header>
          <ul className="divide-y divide-slate-100">
            ${tp.subs.map((s) => {
              const mods = (s.modules || []).map((id) => MOD_BY_ID[id]).filter(Boolean);
              const st = mods.length ? (mods.every((m) => statusOf(prog[m.id]) === 'done') ? 'done' : 'open') : s.next ? 'next' : 'locked';
              return html`<li key=${s.code} className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-9 text-xs font-black text-slate-400">${s.code}</span>
                  <span className=${`flex-1 font-bold ${st === 'locked' ? 'text-slate-400' : 'text-slate-800'}`}>${pick(s)}</span>
                  <span className=${`px-2 py-0.5 rounded-full text-xs font-black whitespace-nowrap ${CHIP[st]}`}>${st === 'done' ? '✅ ' : st === 'locked' ? '🔒 ' : st === 'next' ? '🔜 ' : '▶ '}${t('st_' + st)}</span>
                </div>
                <p className="ml-11 mt-0.5 text-xs text-slate-400 leading-relaxed">${s.items[lang].join(' · ')}</p>
                ${s.next ? html`<p className="ml-11 mt-1 text-xs font-bold text-amber-700">${t('comingName')}${pick(s.next)}</p>` : null}
                ${mods.length ? html`<div className="ml-11 mt-1.5 flex flex-wrap gap-1.5">
                  ${mods.map((m) => html`<${Btn} key=${m.id} label=${pick(m.title)} onClick=${() => onOpen(m.id)} className="!min-h-9 px-3 text-sm text-white" style=${{ background: ink(m.accent) }}>${pick(m.title)} ›<//>`)}
                  ${mods.map((m) => html`<${ChallengeBtn} key=${'c' + m.id} mod=${m} rec=${prog[m.id]} onOpen=${onOpen} small=${true} />`)}
                </div>` : null}
              </li>`;
            })}
          </ul>
        </article>`;
      })}
    </div>
  </section>`;
}

export function Home({ onOpen, tourSignal }) {
  const { t, pick, lang, say, autoplay, go } = useApp();
  const prog = useStore(progress); const st = useStore(settings);
  const task = st.task && st.task.ids ? st.task.ids.map((id) => MOD_BY_ID[id]).filter(Boolean) : null;
  const [focus, setFocus] = useState(null);
  const tourTok = useRef(0);
  const doneN = MODULES.filter((m) => statusOf(prog[m.id]) === 'done').length;
  const openSubs = ALL_SUBS.filter((s) => (s.modules || []).length).length;
  const progText = t('progressTxt', { d: doneN, n: MODULES.length });
  const unlockText = t('unlockedTxt', { o: openSubs, t: ALL_SUBS.length });

  const startTour = useCallback(async (waitFirst = false) => {
    const my = ++tourTok.current;
    if (waitFirst) { await sleep(200); await Speech.waitIdle(); if (my !== tourTok.current) return; }
    const seq = [
      ['hello', joinSay(lang, [t('appTitle'), t('homeHello')])],
      ['progress', joinSay(lang, [progText, unlockText])],
      ...MODULES.map((m) => ['card-' + m.id, joinSay(lang, [pick(m.title), pick(m.desc)])]),
      ['roadmap', joinSay(lang, [t('roadmap'), t('roadmapIntro')])],
    ];
    for (const [id, text] of seq) {
      if (my !== tourTok.current) return;
      setFocus(id);
      const el = document.querySelector(`[data-tour="${id}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: id === 'roadmap' ? 'start' : 'center' });
      say('tour:' + id, text);
      await sleep(150); await Speech.waitIdle();
      if (my !== tourTok.current) return;
      await sleep(450);
    }
    if (my === tourTok.current) setFocus(null);
  }, [lang, progText, unlockText]);

  useEffect(() => { if (tourSignal && tourSignal !== lastTourSignal) { lastTourSignal = tourSignal; startTour(); } }, [tourSignal]);
  const prevAuto = useRef(autoplay);
  useEffect(() => { if (autoplay && !prevAuto.current) startTour(true); prevAuto.current = autoplay; }, [autoplay]);
  useEffect(() => () => { tourTok.current++; }, []);
  useEffect(() => { if (!autoplay) { tourTok.current++; setFocus(null); } }, [autoplay]);
  useEffect(() => { tourTok.current++; setFocus(null); }, [lang]);

  return html`<div className="app-h flex flex-col">
    <${TopBar} title=${t('appTitle')} titleSpeak=${joinSay(lang, [t('appTitle'), t('appSub')])}
      left=${html`<div aria-hidden="true" className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500 grid place-items-center text-white text-xl shadow">⚗</div>`} />
    <main id="main" tabIndex="-1" className="flex-1 overflow-y-auto outline-none">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-28 space-y-7">
        <p className="text-slate-500 font-bold">${t('appSub')}</p>
        <div data-tour="hello" className=${`rounded-[2rem] p-4 sm:p-6 bg-gradient-to-br from-sky-100 via-white to-violet-100 ring-1 ring-sky-100 shadow-inner space-y-4 ${focus === 'hello' ? 'tour-focus' : ''}`}>
          <${Tutor} text=${t('homeHello')} id="home-hello" big=${true} />
          <div className="flex flex-wrap gap-2 sm:pl-36">
            <${Btn} label=${t('tour')} onClick=${(e) => { e.stopPropagation(); Speech.unlock(); startTour(); }} className="px-4 py-2 bg-emerald-500 text-white shadow" />
          </div>
        </div>

        ${task ? html`<section className="rounded-3xl bg-amber-50 ring-2 ring-amber-300 p-4 space-y-2">
          <div className="flex items-start gap-2"><h2 className="flex-1 font-black text-amber-900">${t('taskBanner')}</h2>
            <${Spk} size="sm" text=${joinSay(lang, [t('taskBanner'), ...task.map((m) => pick(m.title))])} id="task-banner" /></div>
          <div className="flex flex-wrap gap-2">
            ${task.map((m) => html`<${Btn} key=${m.id} label=${pick(m.title)} onClick=${() => onOpen(m.id)} className="px-3 text-white shadow" style=${{ background: ink(m.accent) }}>${statusOf(prog[m.id]) === 'done' ? '✅ ' : ''}${pick(m.title)} ›<//>`)}
            <${Btn} label=${t('taskClear')} onClick=${() => settings.set({ task: null })} className="px-3 bg-white ring-2 ring-amber-200 text-amber-800">${t('taskClear')}<//>
          </div>
        </section>` : null}

        <section data-tour="progress" className=${`rounded-3xl bg-white shadow ring-1 ring-slate-100 p-4 space-y-3 ${focus === 'progress' ? 'tour-focus' : ''}`}>
          <div className="flex items-center gap-2">
            <h2 className="flex-1 font-black text-slate-800 text-lg">🏆 ${progText}</h2>
            <${Spk} size="sm" text=${joinSay(lang, [progText, unlockText, t('starsHow')])} id="progress" />
          </div>
          <div className="h-4 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-500 transition-all" style=${{ width: `${(doneN / MODULES.length) * 100}%` }}></div></div>
          <p className="text-sm text-slate-500 font-bold">🗺️ ${unlockText}</p>
          <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-amber-400" style=${{ width: `${(openSubs / ALL_SUBS.length) * 100}%` }}></div></div>
          <p className="text-xs text-slate-400">⭐ ${t('starsHow')}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <${Btn} label=${t('badgesBtn')} onClick=${() => go('badges')} className="px-4 py-2 bg-amber-400 text-slate-900 shadow">🏅 ${t('badgesBtn')}<//>
            <${Btn} label=${t('shareBtn')} onClick=${() => go('share')} className="px-4 py-2 bg-sky-500 text-white shadow">📮 ${t('shareBtn')}<//>
            <${Btn} label=${t('teacherBtn')} onClick=${() => go('teacher')} className="px-4 py-2 bg-white ring-2 ring-slate-200 text-slate-700">🧑‍🏫 ${t('teacherBtn')}<//>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2"><h2 className="flex-1 text-2xl font-black text-slate-800">🔬 ${t('openNow')}</h2><${Spk} size="sm" text=${t('openNow')} id="open-now" /></div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            ${MODULES.map((m) => html`<${LessonCard} key=${m.id} mod=${m} rec=${prog[m.id]} onOpen=${onOpen} focus=${focus === 'card-' + m.id} />`)}
          </div>
        </section>

        <${Roadmap} prog=${prog} onOpen=${onOpen} focus=${focus === 'roadmap'} />
        <${SafetyNote} />
      </div>
    </main>
  </div>`;
}
