/* 程式入口：設定、開始畫面、路由 */
import { html, ReactDOM, useState, useEffect, useMemo, Ctx, settings, progress, useStore, makeT, VOICE_LANG, isChallengeOpen } from './lib.js';
import { Speech } from './speech.js';
import { NowPlaying, VoiceToast, Fireworks, Lily, SettingsSheet } from './ui.js';
import { chemSpeak } from './chem.js';
import { Home } from './home.js';
import { LessonView } from './lesson.js';
import { BadgesPage, CertPage, BadgeToast } from './badges.js';
import { SharePage } from './share.js';
import { TeacherPage } from './teacher.js';
import { MODULES } from './modules.js';
import { CHALLENGES } from './challenges.js';

function StartOverlay({ onStart, t }) {
  return html`<div className="fixed inset-0 z-[70] grid place-items-center bg-sky-900/40 backdrop-blur-sm p-4" onClick=${() => onStart(true)}>
    <div className="pop-in w-[min(94vw,480px)] rounded-[2rem] bg-white shadow-2xl p-6 text-center space-y-4" onClick=${(e) => e.stopPropagation()}>
      <div className="w-32 mx-auto lily-float"><${Lily} className="w-full" /></div>
      <h2 className="text-2xl font-black text-slate-800">${t('startTitle')}</h2>
      <p className="text-slate-600 leading-relaxed">${t('startText')}</p>
      <button type="button" onClick=${() => onStart(true)} className="w-full min-h-14 rounded-2xl bg-emerald-500 text-white text-xl font-black shadow-lg active:scale-[.98]">${t('startAuto')}</button>
      <button type="button" onClick=${() => onStart(false)} className="w-full min-h-11 rounded-2xl bg-white ring-2 ring-slate-200 text-slate-600 font-bold active:scale-[.98]">${t('startSelf')}</button>
    </div>
  </div>`;
}

// 網址路由（可以直接分享；iPad「返回」會返主頁）：
//   #/lemon 實驗、#/lemon/challenge 升中挑戰、#/badges 成就、#/share 交功課、
//   #/teacher 老師專區、#/teacher/import/<碼> 加學生、#/task/<碼> 今日任務、#/cert/<種類> 證書
export function parseRoute() {
  const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  const [a, b, ...rest] = h.split('/');
  if (MODULES.some((m) => m.id === a)) return { view: 'lesson', id: a, mode: b === 'challenge' ? 'challenge' : 'basic' };
  if (['badges', 'share', 'teacher', 'task', 'cert'].includes(a)) return { view: a, sub: b || '', arg: rest.join('/') };
  return { view: 'home' };
}
const RATE = { slow: 0.75, normal: 0.92, fast: 1.1 };
// 老師嘅今日任務連結：#/task/<id,id,…>[/ch] → 記低任務（ch = 同時開放升中挑戰），再返主頁
function takeTask(r) {
  if (r.view !== 'task') return r;
  const ids = r.sub.split(',').filter((id) => MODULES.some((m) => m.id === id));
  if (ids.length) settings.set({ task: { ids, at: Date.now() }, ...(r.arg === 'ch' ? { challengeAll: true } : {}) });
  history.replaceState(null, '', location.pathname + location.search);
  return { view: 'home' };
}

function App() {
  const st = useStore(settings);
  const lang = st.lang === 'en' ? 'en' : 'zh';
  const [readMode, setReadMode] = useState(false);
  const [route, setRoute] = useState(() => takeTask(parseRoute()));
  const [started, setStarted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const prog = useStore(progress);
  const [tourSignal, setTourSignal] = useState(0);

  const ctx = useMemo(() => {
    const t = makeT(lang);
    const pick = (o) => (o ? (o[lang] ?? o.zh) : '');
    const say = (id, text, opts) => Speech.say(id, chemSpeak(text, lang, settings.get().readFormula), VOICE_LANG[lang], opts);
    const setLang = (l) => { Speech.stop(); settings.set({ lang: l }); };
    const setAutoplay = (v) => settings.set({ autoplay: v });
    const go = (path) => { Speech.stop(); history.pushState({ fromHome: true }, '', '#/' + path); setRoute(parseRoute()); };
    return { lang, setLang, readMode, setReadMode, t, pick, say, autoplay: st.autoplay, setAutoplay, go, openSettings: () => setShowSettings(true) };
  }, [lang, readMode, st.autoplay]);

  // 無障礙設定：字體大小、高對比、減少動畫、語速
  useEffect(() => {
    const c = document.documentElement.classList;
    c.toggle('ts-lg', st.textSize === 'lg'); c.toggle('ts-xl', st.textSize === 'xl');
    c.toggle('hc', !!st.contrast); c.toggle('reduce-motion', !!st.reduceMotion);
    Speech.setRate(RATE[st.rate] || RATE.normal);
  }, [st.textSize, st.contrast, st.reduceMotion, st.rate]);

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-HK' : 'en-GB';
    document.title = lang === 'zh' ? '小麗博士化學實驗室' : "Dr. Lily's Chemistry Lab";
  }, [lang]);

  const onStart = (auto) => {
    Speech.unlock();
    settings.set({ autoplay: auto });
    setStarted(true);
    if (auto) setTourSignal((n) => n + 1);
  };
  // 瀏覽器「上一頁」或者手動改網址
  useEffect(() => {
    const sync = () => { Speech.stop(); setRoute(takeTask(parseRoute())); };
    window.addEventListener('popstate', sync); window.addEventListener('hashchange', sync);
    return () => { window.removeEventListener('popstate', sync); window.removeEventListener('hashchange', sync); };
  }, []);
  const open = (id, mode) => ctx.go(id + (mode === 'challenge' ? '/challenge' : ''));
  const back = () => {
    // 由主頁入嚟就退返一頁；直接用網址打開嘅就換走個網址
    if (history.state && history.state.fromHome) history.back();
    else { Speech.stop(); history.replaceState(null, '', location.pathname + location.search); setRoute({ view: 'home' }); }
  };

  const mod = route.view === 'lesson' ? MODULES.find((m) => m.id === route.id) : null;
  // 未解鎖嘅升中挑戰：先玩基礎層
  const mode = mod && route.mode === 'challenge' && CHALLENGES[mod.id] && isChallengeOpen(mod.id, prog) ? 'challenge' : 'basic';
  return html`<${Ctx.Provider} value=${ctx}>
    <div className=${readMode ? 'readmode-on' : ''}>
      <a href="#main" className="skip-link" onClick=${(e) => { e.preventDefault(); const m = document.getElementById('main'); if (m) m.focus(); }}>${ctx.t('skipToMain')}</a>
      ${mod ? html`<${LessonView} key=${mod.id + mode} mod=${mod} mode=${mode} onBack=${back} />`
        : route.view === 'badges' ? html`<${BadgesPage} onBack=${back} />`
        : route.view === 'cert' ? html`<${CertPage} key=${route.sub} kind=${route.sub} onBack=${back} />`
        : route.view === 'share' ? html`<${SharePage} onBack=${back} />`
        : route.view === 'teacher' ? html`<${TeacherPage} sub=${route.sub} arg=${route.arg} onBack=${back} />`
        : html`<${Home} onOpen=${open} tourSignal=${tourSignal} />`}
      <${BadgeToast} />
      ${showSettings ? html`<${SettingsSheet} onClose=${() => setShowSettings(false)} />` : null}
      <${NowPlaying} />
      <${VoiceToast} />
      <${Fireworks} />
      ${!started ? html`<${StartOverlay} onStart=${onStart} t=${ctx.t} />` : null}
    </div>
  <//>`;
}

ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);
