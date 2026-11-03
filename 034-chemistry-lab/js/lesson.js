/* =====================================================================
   實驗頁：步驟引擎、動作（示範俾我睇）、自動播放、語音階段規則、思考挑戰
   ===================================================================== */
import { html, useApp, useState, useEffect, useRef, useCallback, useMemo, joinSay, sleep, fx, markProgress, settings, useStore, ink } from './lib.js';
import { CHALLENGES } from './challenges.js';
import { ChemText } from './chem.js';
import { Speech } from './speech.js';
import { ThreeStage } from './stage.js';
import { Btn, Spk, Tutor, TopBar, SafetyNote, GestureTips, TAG_STYLE } from './ui.js';

function Quiz({ quiz, accent, onAnswer, onHome, qi = 0, qn = 1, onNext, finishText }) {
  const { t, pick, lang } = useApp();
  const [ans, setAns] = useState(null);
  const L = 'ABC';
  const q = pick(quiz.q); const opts = quiz.options.map(pick);
  const qLabel = qn > 1 ? t('qOf', { i: qi + 1, n: qn }) : '';
  const sayAll = joinSay(lang, [t('quizTitle'), qLabel, q, ...opts.map((o, i) => `${L[i]}${lang === 'zh' ? '：' : ': '}${o}`)]);
  const last = qi >= qn - 1;
  const ok = ans === quiz.correct;
  const fb = ans !== null ? joinSay(lang, [ok ? t('correctTitle') : t('wrongTitle'), pick(ok ? quiz.right : quiz.wrong)]) : '';
  const choose = (i) => { setAns(i); onAnswer(i, i === quiz.correct); };
  return html`<section className="pop-in rounded-3xl bg-gradient-to-br from-amber-50 to-pink-50 ring-2 ring-amber-200 p-4 space-y-3">
    <div className="flex items-start gap-2"><h2 className="flex-1 font-black text-amber-700 text-lg">🌟 ${t('quizTitle')}${qLabel ? html` <span className="text-sm text-amber-600">· ${qLabel}</span>` : null}</h2><${Spk} size="sm" text=${sayAll} id=${'quiz-q' + qi} /></div>
    <p className="font-bold text-slate-800 leading-relaxed text-[17px]"><${ChemText} text=${q} /></p>
    <div className="grid gap-2">
      ${opts.map((o, i) => {
        const chosen = ans === i, right = i === quiz.correct;
        const cls = ans === null ? 'bg-white ring-2 ring-slate-200 hover:ring-sky-300'
          : chosen && right ? 'bg-emerald-100 ring-2 ring-emerald-400' : chosen ? 'bg-rose-100 ring-2 ring-rose-300' : 'bg-white ring-2 ring-slate-100 opacity-70';
        return html`<${Btn} key=${i} label=${`${L[i]}. ${o}`} disabled=${ok} onClick=${() => choose(i)} className=${`w-full px-3 py-2 text-left !justify-start ${cls}`}>
          <span className="w-8 h-8 shrink-0 rounded-full grid place-items-center text-white font-black" style=${{ background: ink(accent) }}>${L[i]}</span>
          <span className="flex-1 text-left text-slate-800 leading-snug"><${ChemText} text=${o} /></span>
        <//>`;
      })}
    </div>
    ${ans !== null ? html`<div className=${`pop-in rounded-2xl p-3 ${ok ? 'bg-emerald-50 ring-1 ring-emerald-300' : 'bg-rose-50 ring-1 ring-rose-200'}`}>
      <div className="flex items-start gap-2">
        <p className="flex-1 leading-relaxed text-slate-800"><b>${ok ? t('correctTitle') : t('wrongTitle')}</b> <${ChemText} text=${pick(ok ? quiz.right : quiz.wrong)} /></p>
        <${Spk} size="sm" text=${fb} id=${'quiz-fb'} />
      </div>
      ${ok && !last ? html`<${Btn} label=${t('nextQ')} onClick=${onNext} className="mt-2 w-full text-white shadow" style=${{ background: ink(accent) }}>${t('nextQ')} ›<//>`
        : ok ? html`<div className="mt-3 rounded-2xl bg-white p-3 ring-1 ring-emerald-200">
          <div className="flex items-start gap-2"><p className="flex-1"><b className="text-emerald-700">🎉 ${t('finishTitle')}</b> ${finishText || t('finishText')}</p><${Spk} size="sm" text=${joinSay(lang, [t('finishTitle'), finishText || t('finishText')])} id="finish" /></div>
          <${Btn} label=${t('backHome')} onClick=${onHome} className="mt-2 w-full bg-emerald-500 text-white shadow" />
        </div>`
        : html`<${Btn} label=${t('tryAgain')} onClick=${() => setAns(null)} className="mt-2 px-4 bg-white ring-2 ring-rose-200 text-rose-600" />`}
    </div>` : null}
  </section>`;
}

// 升中挑戰：方程式卡（文字方程式＋有狀態符號嘅化學方程式）
function EquationCard({ eqs }) {
  const { t, pick, lang } = useApp();
  return html`<section className="rounded-3xl bg-fuchsia-50 ring-1 ring-fuchsia-200 p-3 sm:p-4 space-y-3">
    ${eqs.map((e, i) => {
      const say = joinSay(lang, [t('wordEq'), pick(e.word), t('symEq'), e.sym]);
      return html`<div key=${i} className="space-y-1">
        <div className="flex items-start gap-2">
          <div className="flex-1 space-y-1">
            <p className="text-xs font-black text-fuchsia-700">${t('wordEq')}</p>
            <p className="font-bold text-slate-800 leading-relaxed">${pick(e.word)}</p>
            <p className="text-xs font-black text-fuchsia-700 pt-1">${t('symEq')}</p>
            <p className="eq-sym font-bold text-slate-900 text-lg leading-relaxed"><${ChemText} text=${e.sym} /></p>
          </div>
          <${Spk} size="sm" text=${say} id=${'eq' + i} />
        </div>
      </div>`;
    })}
  </section>`;
}
function TermList({ terms }) {
  const { t, lang } = useApp();
  const say = joinSay(lang, [t('tag_term'), ...terms.map((x) => (lang === 'zh' ? `${x.zh}，英文叫 ${x.en}` : x.en))]);
  return html`<section className="rounded-3xl bg-indigo-50 ring-1 ring-indigo-200 p-3 sm:p-4">
    <div className="flex items-center gap-2 mb-1"><h2 className="flex-1 font-black text-indigo-700">📘 ${t('tag_term')}</h2><${Spk} size="sm" text=${say} id="terms" /></div>
    <ul className="grid sm:grid-cols-2 gap-1.5">${terms.map((x, i) => html`<li key=${i} className="rounded-xl bg-white px-3 py-1.5 ring-1 ring-indigo-100">
      <b className="text-slate-800"><${ChemText} text=${x.zh} /></b> <span className="text-slate-500 text-sm" lang="en-GB">${x.en}</span></li>`)}</ul>
  </section>`;
}

export function LessonView({ mod, onBack, mode = 'basic' }) {
  const { lang, t, pick, readMode, say, autoplay } = useApp();
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [evt, setEvt] = useState(null);
  const [S, setS] = useState({});
  const [done, setDone] = useState(() => new Set());
  const [demoing, setDemoing] = useState(false);
  const [hintOn, setHintOn] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [tips, setTips] = useState(() => !settings.get().tipsSeen && !settings.get().autoplay);
  const ctrl = useRef(null);
  const asideRef = useRef(null);
  const autoTok = useRef(0);
  const demoRef = useRef(false);
  const usedDemo = useRef(false);
  const firstTry = useRef(true);
  const lastAct = useRef(performance.now());
  const stepRef = useRef(step); stepRef.current = step;
  const doneRef = useRef(done); doneRef.current = done;
  const sayRef = useRef(say); sayRef.current = say;
  const pickRef = useRef(pick); pickRef.current = pick;

  // 升中挑戰：用挑戰版嘅步驟、事件同題目；3D 場景同動作沿用基礎層
  const ch = mode === 'challenge' ? CHALLENGES[mod.id] : null;
  const L = useMemo(() => (ch ? { steps: ch.steps, events: { ...mod.events, ...(ch.events || {}) }, quiz: ch.quiz }
    : { steps: mod.steps, events: mod.events, quiz: [mod.quiz] }), [mod, ch]);
  const [qi, setQi] = useState(0);
  const steps = L.steps; const total = steps.length; const cur = steps[step];
  const pending = !!(cur.action && !done.has(cur.action.id));

  useEffect(() => { markProgress(mod.id, {}); }, [mod.id]);

  // 實驗場景嘅事件
  const onEvent = useCallback((k, p) => {
    if (k === 'state') { setS((s) => ({ ...s, ...p })); return; }
    if (k === 'done') {
      if (demoRef.current) usedDemo.current = true;
      setDone((d) => { if (d.has(p.id)) return d; const n = new Set(d); n.add(p.id); return n; });
      return;
    }
    const text = L.events[k]; if (!text) return;
    const st = L.steps[stepRef.current];
    // 屬於「呢一步要做嘅動作」→ 換階段，即刻截斷；其他（同一階段隨意撳）→ 唔打斷老師，排隊
    const isAction = !!(st.action && (st.action.events || []).some((pre) => k.startsWith(pre)));
    setEvt(k);
    sayRef.current('evt:' + k, pickRef.current(text), { queue: !isAction });
  }, [L]);
  const onReadLabel = useCallback((lbl) => say('lbl:' + lbl.zh, pick(lbl)), [say, pick]);
  const poke = useCallback(() => { lastAct.current = performance.now(); setHintOn(false); }, []);

  const go = useCallback((i) => {
    const n = Math.max(0, Math.min(total - 1, i));
    setStep(n); setMaxStep((m) => Math.max(m, n));
    if (asideRef.current) asideRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [total]);

  // 換步驟（或者換語言）：讀新步驟（截斷舊語音）
  const quizSay = (i) => joinSay(lang, [L.quiz.length > 1 ? t('qOf', { i: i + 1, n: L.quiz.length }) : '', pick(L.quiz[i].q), ...L.quiz[i].options.map((o, j) => `${'ABC'[j]}${lang === 'zh' ? '：' : ': '}${pick(o)}`)]);
  const stepSay = joinSay(lang, [t('tag_' + cur.tag), pick(cur),
    ...(cur.eq ? cur.eq.map((e) => joinSay(lang, [pick(e.word), e.sym])) : []),
    ...(cur.tag === 'quiz' ? [quizSay(qi)] : [])]);
  useEffect(() => {
    setEvt(null); poke();
    if (ctrl.current && ctrl.current.setStep) ctrl.current.setStep(step, cur);
    say('step:' + mod.id + ':' + step, stepSay);
  }, [step, lang, resetKey]);

  // 示範
  const runDemo = useCallback(async () => {
    const st = L.steps[stepRef.current];
    if (!st.action || !ctrl.current || demoRef.current || doneRef.current.has(st.action.id)) return;
    demoRef.current = true; setDemoing(true);
    try { await ctrl.current.demo(st.action.id); } finally { demoRef.current = false; setDemoing(false); }
  }, [L]);
  const demoThenNext = useCallback(async () => {
    const my = ++autoTok.current;
    await runDemo(); if (my !== autoTok.current) return;
    await Speech.waitIdle(); if (my !== autoTok.current) return;
    await sleep(600); if (my !== autoTok.current) return;
    go(stepRef.current + 1);
  }, [runDemo, go]);

  // 自動播放：讀完 → 示範 → 讀完 → 下一步（去到思考挑戰就停低等小朋友答）
  useEffect(() => {
    if (!autoplay) return undefined;
    const my = ++autoTok.current;
    (async () => {
      await sleep(500); if (my !== autoTok.current) return;
      await Speech.waitIdle(); if (my !== autoTok.current) return;
      const st = L.steps[stepRef.current];
      if (st.action && !doneRef.current.has(st.action.id)) {
        await sleep(400); if (my !== autoTok.current) return;
        await runDemo(); if (my !== autoTok.current) return;
        await sleep(300); await Speech.waitIdle(); if (my !== autoTok.current) return;
      }
      if (st.tag === 'quiz') return;
      await sleep(900); if (my !== autoTok.current) return;
      if (stepRef.current < total - 1) go(stepRef.current + 1);
    })();
    return () => { autoTok.current++; };
  }, [step, autoplay, lang, resetKey]);

  // 提示手指：冇郁 4 秒就出現
  useEffect(() => {
    const iv = setInterval(() => { if (performance.now() - lastAct.current > 4000) setHintOn(true); }, 500);
    return () => clearInterval(iv);
  }, []);

  const firstCount = useRef(0); const qFirst = useRef(true);
  const finishText = ch ? t('challengeFinishText') : t('finishText');
  const onAnswer = (i, ok) => {
    poke();
    const q = L.quiz[qi]; const last = qi >= L.quiz.length - 1;
    const fb = joinSay(lang, [ok ? t('correctTitle') : t('wrongTitle'), pick(ok ? q.right : q.wrong), ...(ok && last ? [t('finishTitle'), finishText] : [])]);
    say('quiz-fb', fb);
    if (ok) {
      if (qFirst.current) firstCount.current++;
      if (!last) return;
      fx.fire();
      if (ch) markProgress(mod.id, { challenge: { done: true, first: firstTry.current, score: firstCount.current } });
      else markProgress(mod.id, { status: 'done', stars: { finish: true, self: !usedDemo.current, quiz: firstTry.current } });
    } else { firstTry.current = false; qFirst.current = false; }
  };
  const nextQ = () => { poke(); const n = qi + 1; setQi(n); qFirst.current = true; say('quiz-q' + n, quizSay(n)); };

  const doReset = () => {
    autoTok.current++; demoRef.current = false; setDemoing(false);
    if (ctrl.current) ctrl.current.reset();
    setDone(new Set()); setS({}); usedDemo.current = false; firstTry.current = true;
    setQi(0); firstCount.current = 0; qFirst.current = true;
    setStep(0); setMaxStep(0); setResetKey((k) => k + 1);
  };

  const evtText = evt && L.events[evt] ? pick(L.events[evt]) : null;
  const hintId = pending && !demoing && hintOn ? cur.action.id : null;
  const Panel = mod.Panel;
  const tools = (mod.tools || []).filter((x) => !x.show || x.show(step, S, cur));

  let nextBtn;
  if (cur.tag === 'quiz') nextBtn = null;
  else if (demoing) nextBtn = html`<${Btn} label=${t('demoing')} disabled=${true} className="px-4 bg-slate-200 text-slate-600" />`;
  else if (pending) nextBtn = html`<${Btn} label=${t('demo')} onClick=${() => { poke(); demoThenNext(); }} className="px-4 text-white shadow bg-amber-500">▶ ${t('demo')}<//>`;
  else nextBtn = html`<${Btn} label=${t('next')} disabled=${step === total - 1} onClick=${() => { poke(); go(step + 1); }}
      className=${`px-4 text-white shadow ${cur.action ? 'pulse-go' : ''}`} style=${{ background: ink(cur.action ? '#10b981' : mod.accent) }}><span className="hidden sm:inline">${t('next')}</span> ›<//>`;

  return html`<div className="app-h flex flex-col">
    <${TopBar} title=${ch ? `${t('challengeTag')}${lang === 'zh' ? '：' : ': '}${pick(mod.title)}` : pick(mod.title)}
      left=${html`<${Btn} label=${t('back')} onClick=${onBack} className="h-11 px-3 bg-white ring-2 ring-slate-200 text-slate-700"><span className="text-xl leading-none" aria-hidden="true">‹</span><span className="hidden sm:inline">${t('back')}</span><//>`} />
    <div className="lesson-main">
      <div className="stage-wrap" role="region" aria-label=${t('stageAlt', { t: pick(mod.title) })} style=${{ background: mod.bg }}>
        <${ThreeStage} mod=${mod} lang=${lang} readMode=${readMode} ctrlRef=${ctrl} onEvent=${onEvent} onReadLabel=${onReadLabel} onInteract=${poke} hintId=${hintId} />
        ${tips ? html`<${GestureTips} onClose=${() => { setTips(false); settings.set({ tipsSeen: true }); }} />` : null}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          <${Btn} label=${t('resetView')} onClick=${() => ctrl.current && ctrl.current.resetView && ctrl.current.resetView()} className="h-11 px-3 bg-white/95 text-slate-700 shadow ring-1 ring-slate-200 text-sm">🎯 <span className="hidden sm:inline">${t('resetView')}</span><//>
          <${Btn} label=${t('showTips')} onClick=${() => setTips((v) => !v)} className="h-11 px-3 bg-white/95 text-slate-700 shadow ring-1 ring-slate-200 text-sm">❓ <span className="hidden sm:inline">${t('showTips')}</span><//>
        </div>
      </div>
      <main ref=${asideRef} id="main" tabIndex="-1" aria-label=${t('stepWord')} className="lesson-aside bg-white/60 backdrop-blur border-t border-sky-100 outline-none">
        <div className="p-3 sm:p-4 space-y-3 pb-28">
          <${Tutor} tag=${cur.tag} text=${pick(cur)} id=${'step:' + mod.id + ':' + step} sayText=${stepSay} />
          ${cur.eq ? html`<${EquationCard} key=${'eq' + step} eqs=${cur.eq} />` : null}
          ${cur.terms ? html`<${TermList} key=${'tm' + step} terms=${cur.terms} />` : null}
          ${evtText ? html`<div key=${evt} className="pop-in ml-4 sm:ml-8 rounded-2xl bg-orange-50 ring-1 ring-orange-200 p-3">
            <span className=${`inline-block mb-1 px-2.5 py-0.5 rounded-full text-xs font-black ${TAG_STYLE.event}`}>🔬 ${t('discovery')}</span>
            <div className="flex items-start gap-2" aria-live="polite"><p className="flex-1 leading-relaxed text-slate-800"><${ChemText} text=${evtText} /></p><${Spk} size="sm" text=${evtText} id=${'evt:' + evt} /></div>
          </div>` : null}

          <nav className="flex items-center gap-2" aria-label=${t('stepWord')}>
            <${Btn} label=${t('prev')} disabled=${step === 0} onClick=${() => { poke(); go(step - 1); }} className="px-3 bg-white ring-2 ring-slate-200 text-slate-700">‹ <span className="hidden sm:inline">${t('prev')}</span><//>
            <div className="flex-1 flex justify-center items-center gap-1 flex-wrap">
              ${steps.map((s, i) => html`<${Btn} key=${i} label=${`${t('stepWord')} ${i + 1}：${t('tag_' + s.tag)}`} disabled=${i > maxStep} current=${i === step} onClick=${() => { poke(); go(i); }}
                className=${`!min-h-0 !rounded-full transition-all ${i === step ? 'w-6 h-3' : 'w-3 h-3 opacity-60'}`}
                style=${{ background: i <= maxStep ? mod.accent : '#cbd5e1' }}><span className="sr-only">${i + 1}</span><//>`)}
            </div>
            ${nextBtn}
          </nav>
          ${pending && !demoing ? html`<p className="text-sm font-bold text-amber-700 bg-amber-50 rounded-xl px-3 py-2">${t('doItHint')}</p>` : null}
          ${cur.action && !pending ? html`<p className="text-sm font-bold text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2">✅ ${t('actionDone')}</p>` : null}

          ${cur.tag === 'quiz' ? html`<${Quiz} key=${mod.id + lang + resetKey + ':' + qi} quiz=${L.quiz[qi]} qi=${qi} qn=${L.quiz.length} onNext=${nextQ} finishText=${finishText}
            accent=${ch ? '#4f46e5' : mod.accent} onAnswer=${onAnswer} onHome=${onBack} />` : null}

          <section className="rounded-3xl bg-white/85 ring-1 ring-slate-200 p-3 sm:p-4 space-y-2">
            <div className="flex items-center gap-2"><h2 className="flex-1 font-black text-slate-700">🧪 ${t('tools')}</h2><${Spk} size="sm" text=${joinSay(lang, [t('tools'), t('toolsHint')])} id="toolhint" /></div>
            <p className="text-sm text-slate-500">${t('toolsHint')}</p>
            ${Panel ? html`<${Panel} S=${S} ctrl=${ctrl} step=${step} />` : null}
            <div className="flex flex-wrap gap-2">
              ${tools.map((x) => html`<${Btn} key=${x.id} label=${pick(x.label)} disabled=${demoing || (x.disabled && x.disabled(S))} onClick=${() => { poke(); ctrl.current && x.run(ctrl.current); }}
                className=${`px-3 py-2 shadow-sm ${x.primary ? 'text-white' : 'bg-white ring-2 ring-slate-200 text-slate-700'}`} style=${x.primary ? { background: ink(mod.accent) } : null} />`)}
              <${Btn} label=${t('reset')} onClick=${doReset} className="px-3 py-2 bg-slate-100 text-slate-600">↺ ${t('reset')}<//>
            </div>
          </section>
          <${SafetyNote} />
        </div>
      </main>
    </div>
  </div>`;
}
