/* =====================================================================
   語音朗讀（Web Speech API）
   - 中文 = zh-HK 廣東話；英文 = en-GB 英式英文
   - say(id, text, lang)            ：即刻截斷舊語音，讀新內容（換階段、撳喇叭）
   - say(id, text, lang, {queue})   ：唔打斷老師；等而家講緊嘅完咗先讀（只留最新一句）
   - waitIdle()                     ：等到冇嘢讀（自動播放用）
   ===================================================================== */
export const Speech = (() => {
  const synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  let voices = [];
  const load = () => { try { if (synth) voices = synth.getVoices() || []; } catch (e) { voices = []; } };
  if (synth) {
    load();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', load); else synth.onvoiceschanged = load;
  }
  let state = { id: null, text: '', playing: false, paused: false, missing: null };
  const subs = new Set();
  const set = (p) => { state = { ...state, ...p }; subs.forEach((f) => f()); };
  const warned = new Set();
  let chunks = [], idx = 0, token = 0, lang = 'zh-HK', cur = null, pending = null, rate = 0.92;
  const waiters = new Set();
  const isIdle = () => !state.playing && !state.paused && !pending;
  const flushIdle = () => { if (isIdle()) { const w = [...waiters]; waiters.clear(); w.forEach((f) => f()); } };

  const norm = (s) => (s || '').toLowerCase().replace(/_/g, '-');
  function pick(l) {
    if (!voices.length) load();
    if (l === 'zh-HK') {
      return voices.find((v) => norm(v.lang) === 'zh-hk')
        || voices.find((v) => norm(v.lang).startsWith('yue'))
        || voices.find((v) => /cantonese|粵|廣東|sin-?ji/i.test(v.name)) || null;
    }
    const gb = voices.filter((v) => norm(v.lang) === 'en-gb');
    return gb.find((v) => /natural|enhanced|premium|google/i.test(v.name)) || gb[0] || null;
  }
  function clean(text) {
    const zh = lang === 'zh-HK';
    return String(text)
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}️‍]/gu, '')
      .replace(/①/g, zh ? '一，' : 'one, ').replace(/②/g, zh ? '二，' : 'two, ').replace(/③/g, zh ? '三，' : 'three, ')
      .replace(/\(III\)/g, zh ? '三' : ' three').replace(/\(II\)/g, zh ? '二' : ' two')
      .replace(/≈/g, zh ? '大約' : 'about ')
      .replace(/→/g, zh ? '變成' : ' becomes ')
      .replace(/[＋+]/g, zh ? '加' : ' plus ')
      .replace(/[／]/g, zh ? '或者' : ' or ')
      .replace(/Na⁺|Cl⁻|O₂|H⁺|OH⁻|CO₂|H₂/g, '')
      .replace(/[›]/g, '，')
      .replace(/\s+/g, ' ').trim();
  }
  function split(text) {
    const raw = text.match(/[^。！？；!?;.\n]+[。！？；!?;.\n]*/g) || [text];
    const out = []; let buf = '';
    for (const p of raw) { if ((buf + p).length > 110 && buf) { out.push(buf); buf = p; } else buf += p; }
    if (buf.trim()) out.push(buf);
    return out.flatMap((s) => (s.length <= 170 ? [s] : (s.match(/[^，,、]+[，,、]*/g) || [s]))).filter((s) => s.trim());
  }
  // 冇語音時用嘅估計時間（等自動播放唔會一下子衝晒）
  const EST_SCALE = /[?&]fast=1/.test(location.search) ? 0.04 : 1; // 測試用
  const est = (s) => Math.max(700 * EST_SCALE, (lang === 'zh-HK' ? s.length * 230 : s.length * 68) * EST_SCALE);

  function finishAll(my) {
    if (my !== token) return;
    cur = null;
    set({ playing: false, paused: false, id: null, text: '' });
    if (pending) { const p = pending; pending = null; begin(p); } else flushIdle();
  }
  function next(my) {
    if (my !== token) return;
    if (idx >= chunks.length) { finishAll(my); return; }
    const text = chunks[idx];
    const advance = () => { if (my !== token) return; idx++; next(my); };
    if (!synth) { setTimeout(advance, est(text)); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    const v = pick(lang); if (v) u.voice = v;
    u.rate = rate; u.pitch = 1.05;
    u._start = performance.now();
    const end = (forceEst) => {
      if (u._done || my !== token) return;
      u._done = true;
      const el = performance.now() - u._start;
      const minMs = (forceEst || !voices.length) ? est(text) * 0.9 : 0;
      setTimeout(advance, Math.max(0, minMs - el));
    };
    u.onend = () => end(false);
    u.onerror = (e) => { if (e && (e.error === 'interrupted' || e.error === 'canceled')) return; end(true); };
    cur = u;
    try { synth.speak(u); } catch (e) { end(true); }
  }
  // 保險：有啲裝置唔觸發 onend
  if (synth) setInterval(() => {
    if (state.playing && cur && !cur._done && performance.now() - cur._start > 1500 && !synth.speaking && !synth.pending) {
      cur._done = true; const my = token; const el = performance.now() - cur._start; const t = cur.text;
      setTimeout(() => { if (my !== token) return; idx++; next(my); }, Math.max(0, (voices.length ? 0 : est(t) * 0.9) - el));
    }
  }, 500);

  function begin(p) {
    token++; const my = token;
    if (synth) { try { synth.cancel(); } catch (e) { /* ignore */ } }
    pending = null;
    lang = p.lang;
    chunks = split(clean(p.text)); idx = 0;
    if (!chunks.length) { set({ playing: false, paused: false, id: null, text: '' }); flushIdle(); return; }
    if (synth && voices.length && !pick(lang) && !warned.has(lang)) { warned.add(lang); set({ missing: lang }); }
    if (!synth && !warned.has('nosupport')) { warned.add('nosupport'); set({ missing: 'nosupport' }); }
    set({ id: p.id, text: p.text, playing: true, paused: false });
    next(my);
  }
  function say(id, text, l, opts = {}) {
    if (!text) return;
    if (opts.queue && (state.playing || state.paused)) { pending = { id, text, lang: l }; return; }
    begin({ id, text, lang: l });
  }
  function pause() { if (!state.playing) return; token++; if (synth) synth.cancel(); set({ playing: false, paused: true }); }
  function resume() { if (!state.paused) return; token++; const my = token; set({ playing: true, paused: false }); next(my); }
  function stop() {
    token++; if (synth) { try { synth.cancel(); } catch (e) { /* ignore */ } }
    chunks = []; idx = 0; cur = null; pending = null;
    set({ id: null, text: '', playing: false, paused: false });
    flushIdle();
  }
  // iOS：第一次發聲一定要喺用戶撳掣嗰一刻
  function unlock() {
    if (!synth) return;
    try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; synth.speak(u); } catch (e) { /* ignore */ }
  }
  function waitIdle() { return new Promise((res) => { if (isIdle()) setTimeout(res, 0); else waiters.add(res); }); }
  function dismissMissing() { set({ missing: null }); }
  function setRate(r) { rate = r; }
  return { say, setRate, pause, resume, stop, unlock, waitIdle, dismissMissing, isIdle,
    subscribe: (f) => { subs.add(f); return () => subs.delete(f); }, get: () => state };
})();
