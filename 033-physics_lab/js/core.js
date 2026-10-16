/* =====================================================================
 * 物理虛擬實驗室 · 核心
 * 語音（主次優先）、教學流程、主頁導覽、圖表、煙花、介面
 * ===================================================================== */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { TOPICS, PARTIAL, BENCHES, HUB_TOUR } from './syllabus.js';
import { createCollisionLab } from './labs/collisions.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const QS = new URLSearchParams(location.search);
const FAST = QS.has('fast') ? 0.05 : 1;      // 測試用：加快語音
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k] ?? '');

/* ---------------- 設定（記在本機瀏覽器） ---------------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem('pvlab.' + k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } },
  set(k, v) { try { localStorage.setItem('pvlab.' + k, JSON.stringify(v)); } catch (_) {} }
};
const DEF = { lang: 'zh', auto: true, adv: false, rate: 1, demoDelay: 1.5, thinkTime: 15, sfx: true, fireworks: true, mute: false };
const S = Object.assign({}, DEF, store.get('settings', {}));
const save = () => store.set('settings', S);
const App = { view: 'start', pointRead: false };

/* =====================================================================
 * 1. 介面文字（雙語）
 * ===================================================================== */
const I18N = {
  zh: {
    appTitle: '物理虛擬實驗室', appSub: '小學生的 3D 物理遊樂場', home: '🏠 主頁',
    autoOn: '🤖 自動導覽：開', autoOff: '🤖 自動導覽：關', pause: '⏸ 暫停語音', resume: '▶ 繼續',
    pointRead: '👆🔊 點讀', adv: '🔬 進階', settings: '⚙️',
    sayChan: '陳老師說話中', sayMing: '小明說話中', sayInfo: '朗讀中', sayIdle: '安靜', sayPaused: '語音已暫停', queued: '・{n} 項等候中',
    waitTeacher: '🕒 老師講完就會讀出', reading: '🔊 朗讀中', pointReadOn: '點讀模式：輕按任何文字就會讀出來', pointReadOff: '已關閉點讀模式',
    tapStart: '輕按畫面任何地方開始', tapStartSub: '老師會自動朗讀和示範全部內容，你只需要看和聽。', startMuted: '🔇 靜音開始（只顯示字幕）',
    featuredTag: '✅ 已開放', startLab: '▶ 開始實驗', legendOpen: '已開放', legendPartial: '部分涵蓋', legendLocked: '即將推出',
    legendPhase: '「第 N 期」＝預計開放次序（開發路線圖）', phase: '第 {n} 期', topicN: '課題 {n}',
    openCount: '已開放 {a} 項・部分涵蓋 {b} 項・全部 {c} 項', itemsCovered: '涵蓋第 {list} 項',
    lockedSay: '第 {n} 項：{name}。這個實驗即將推出，預計在第 {p} 期開放。',
    prev: '◀ 上一步', next: '下一步 ▶', redo: '🔁 再做', stepOf: '第 {i} / {n} 步', task: '🎯 任務', cond: '📋 實驗條件', chain: '🔗 因果推理',
    taskDone: '做到了！', tools: '🧰 工具', toolsS: '工具', graphS: '圖表', resetS: '重設', camS: '視角',
    pushA: '👉 推 A 車', pushB: '👈 推 B 車', locked: '🔒 保持不變', on: '開', off: '關',
    quizTitle: '🤔 估一估', optN: '第 {n} 個答案：', question: '問題：',
    yourPick: '你揀咗：{x}。我哋做實驗睇吓！', yourPickNoRun: '你揀咗：{x}。', timeUp: '時間到！一齊睇吓答案。',
    correct: '🎉 答對了！', wrong: '💪 差一點點！', timeUpShort: '⏰ 時間到', correctSay: '答啱喇，好叻！', wrongSay: '唔緊要，差少少！',
    watching: '🔬 實驗進行中…', thinking: '🤔 思考時間', continue: '繼續 ▶',
    finishTitle: '完成撞車實驗室！', finishStars: '你答對了 {a} / {b} 題', finishSay: '恭喜你完成撞車實驗室！你答對咗 {a} 題，總共 {b} 題。',
    backHub: '🏠 回主頁', playAgain: '🔁 再玩一次',
    settingsTitle: '⚙️ 設定', sRate: '🗣️ 語速', sDemo: '🤖 自動示範前等待（秒）', sThink: '🤔 答題思考時間（秒）', sSfx: '🔔 音效',
    sFw: '🎆 煙花效果', sMute: '🔇 靜音（只顯示字幕）', sAuto: '🤖 自動導覽', sReset: '重設全部設定', close: '完成',
    voiceTip: '找不到廣東話語音。請在 iPad「設定 → 輔助使用 → 朗讀內容 → 聲音 → 中文（香港）」下載，然後重新載入本頁。',
    noSpeech: '這個瀏覽器不支援語音，會以字幕顯示。', demo: '🤖 自動示範中', xAxis: '時間 t (s)', ghostNote: '虛線＝上一次', crashNote: '橙色虛線＝碰撞',
    chan: '陳老師', ming: '小明', because: '因為', so: '所以'
  },
  en: {
    appTitle: 'Physics Virtual Lab', appSub: 'A 3D physics playground for kids', home: '🏠 Home',
    autoOn: '🤖 Auto guide: on', autoOff: '🤖 Auto guide: off', pause: '⏸ Pause voice', resume: '▶ Resume',
    pointRead: '👆🔊 Tap-to-read', adv: '🔬 Advanced', settings: '⚙️',
    sayChan: 'Ms Chan is talking', sayMing: 'Ming is talking', sayInfo: 'Reading', sayIdle: 'Quiet', sayPaused: 'Voice paused', queued: ' · {n} waiting',
    waitTeacher: '🕒 Will be read after the teacher finishes', reading: '🔊 Reading', pointReadOn: 'Tap-to-read: tap any text to hear it', pointReadOff: 'Tap-to-read is off',
    tapStart: 'Tap anywhere to start', tapStartSub: 'The teacher will read and demonstrate everything automatically. Just watch and listen.', startMuted: '🔇 Start muted (subtitles only)',
    featuredTag: '✅ Open now', startLab: '▶ Start the lab', legendOpen: 'Open', legendPartial: 'Partly covered', legendLocked: 'Coming soon',
    legendPhase: '"Phase N" = planned release order (roadmap)', phase: 'Phase {n}', topicN: 'Topic {n}',
    openCount: '{a} open · {b} partly covered · {c} in total', itemsCovered: 'Covers items {list}',
    lockedSay: 'Item {n}: {name}. This lab is coming soon, planned for phase {p}.',
    prev: '◀ Back', next: 'Next ▶', redo: '🔁 Redo', stepOf: 'Step {i} of {n}', task: '🎯 Your task', cond: '📋 Conditions', chain: '🔗 Cause and effect',
    taskDone: 'Done!', tools: '🧰 Tools', toolsS: 'Tools', graphS: 'Graph', resetS: 'Reset', camS: 'View',
    pushA: '👉 Push A', pushB: '👈 Push B', locked: '🔒 Kept the same', on: 'On', off: 'Off',
    quizTitle: '🤔 Make a guess', optN: 'Option {n}: ', question: 'Question: ',
    yourPick: "You picked: {x}. Let's test it!", yourPickNoRun: 'You picked: {x}.', timeUp: "Time's up! Let's see the answer.",
    correct: '🎉 Correct!', wrong: '💪 Almost!', timeUpShort: "⏰ Time's up", correctSay: 'Correct, well done!', wrongSay: 'Nice try, almost there!',
    watching: '🔬 Experiment running…', thinking: '🤔 Thinking time', continue: 'Continue ▶',
    finishTitle: 'Crash Lab complete!', finishStars: 'You got {a} of {b} questions right', finishSay: 'Congratulations on finishing the Crash Lab! You got {a} out of {b} questions right.',
    backHub: '🏠 Back home', playAgain: '🔁 Play again',
    settingsTitle: '⚙️ Settings', sRate: '🗣️ Speech speed', sDemo: '🤖 Wait before auto demo (s)', sThink: '🤔 Thinking time for questions (s)', sSfx: '🔔 Sound effects',
    sFw: '🎆 Fireworks', sMute: '🔇 Mute (subtitles only)', sAuto: '🤖 Auto guide', sReset: 'Reset all settings', close: 'Done',
    voiceTip: 'No British English voice found. On iPad, go to Settings → Accessibility → Spoken Content → Voices → English (UK) to download one, then reload this page.',
    noSpeech: "This browser doesn't support speech, so subtitles will be shown.", demo: '🤖 Auto demo', xAxis: 'time t (s)', ghostNote: 'dashed = last run', crashNote: 'orange dashed = crash',
    chan: 'Ms Chan', ming: 'Ming', because: 'Because', so: 'so'
  }
};
const t = (k) => I18N[S.lang][k] ?? k;
const L = (o) => (o ? (o[S.lang] ?? o.zh) : '');

/* =====================================================================
 * 2. 語音系統（Web Speech API）
 * ---------------------------------------------------------------------
 *  主線 main：老師的教學旁白。換階段 → 即刻截斷一切，讀新內容。
 *  支線 side：點物件、點讀、喇叭。老師講緊 → 排隊，等老師講完先讀。
 *  暫停：停止一切聲音和自動流程；繼續：由當句重新開始。
 * ===================================================================== */
const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}️‍⃣]/gu;
function speakable(s, lang) {
  s = String(s).replace(EMOJI, '').replace(/\s*\n+\s*/g, lang === 'zh' ? '，' : ', ');
  const R = lang === 'zh' ? [
    [/KE\s*=\s*½mv²/g, '動能等於二分之一 m v 平方'], [/F\s*=\s*Δp\s*\/\s*Δt/g, '力等於動量改變除以時間'], [/F\s*=\s*ma/g, 'F 等於 m a'],
    [/F\(A→B\)\s*=\s*−F\(B→A\)/g, 'A 推 B 嘅力，等於負 B 推 A 嘅力'], [/Δp_A\s*=\s*−Δp_B/g, 'A 嘅動量改變，等於負 B 嘅動量改變'], [/p_A \+ p_B/g, '兩架車嘅總動量'],
    [/½/g, '二分之一 '], [/²/g, ' 平方'], [/kg·m\/s/g, '公斤米每秒'], [/m\/s/g, '米每秒'], [/N·s/g, '牛頓秒'], [/(\d)\s*kg/g, '$1 公斤'], [/(\d)\s*J\b/g, '$1 焦耳'],
    [/(\d)\s*m\b/g, '$1 米'], [/v–t/g, '速度時間'], [/s–t/g, '位置時間'], [/p–t/g, '動量時間'], [/KE–t/g, '動能時間'], [/Δp/g, '動量改變'], [/Δt/g, '時間'],
    [/KE/g, '動能'], [/→/g, '，變成'], [/=/g, '等於'], [/×/g, '乘'], [/÷/g, '除以'], [/−(?=\d)/g, '負'], [/\+(?=\d)/g, '正'], [/μ/g, 'mu'], [/±/g, '正負']
  ] : [
    [/KE\s*=\s*½mv²/g, 'K E equals half m v squared'], [/F\s*=\s*Δp\s*\/\s*Δt/g, 'F equals change in momentum divided by time'], [/F\s*=\s*ma/g, 'F equals m a'],
    [/F\(A→B\)\s*=\s*−F\(B→A\)/g, 'the force of A on B equals minus the force of B on A'], [/Δp_A\s*=\s*−Δp_B/g, "the change in A's momentum equals minus the change in B's momentum"],
    [/p_A \+ p_B/g, 'the total momentum'], [/½/g, 'half '], [/²/g, ' squared'], [/kg·m\/s/g, 'kilogram metres per second'], [/m\/s/g, 'metres per second'],
    [/N·s/g, 'newton seconds'], [/(\d)\s*kg/g, '$1 kilograms'], [/(\d)\s*J\b/g, '$1 joules'], [/(\d)\s*m\b/g, '$1 metres'], [/–t\b/g, '-time'], [/Δp/g, 'change in momentum'], [/Δt/g, 'time'],
    [/\bKE\b/g, 'K E'], [/→/g, ' to '], [/=/g, ' equals '], [/×/g, ' times '], [/÷/g, ' divided by '], [/−(?=\d)/g, 'minus '], [/\+(?=\d)/g, 'plus '], [/μ/g, 'mu'], [/±/g, 'plus or minus ']
  ];
  for (const [a, b] of R) s = s.replace(a, b);
  return s.replace(/\s+/g, ' ').trim();
}
function chunk(text) {
  const parts = (text.match(/[^。！？!?；;]+[。！？!?；;]*/g) || [text]).flatMap((p) => p.replace(/\.\s+/g, '.\u0001').split('\u0001'));
  const out = [];
  for (const p of parts) {
    if (p.length <= 110) { out.push(p); continue; }
    let buf = '';
    for (const b of p.replace(/([，,、])/g, '$1\u0001').split('\u0001')) {
      if ((buf + b).length > 90 && buf) { out.push(buf); buf = ''; }
      buf += b;
    }
    if (buf) out.push(buf);
  }
  return out.map((s) => s.trim()).filter((s) => s.replace(/[，。,.!?！？\s]/g, ''));
}
const simDur = (s) => Math.max(600, s.length * (S.lang === 'zh' ? 210 : 62) / S.rate) * FAST;

const Speech = {
  ok: 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window && !QS.has('sim'),
  voices: [], paused: false, main: null, side: null, queue: [], idleCbs: [], listeners: new Set(),
  speaking: false, cur: null, tok: 0, timer: null, uStart: 0, uMax: 0, curDone: null, lastCancel: 0,
  get sim() { return !this.ok || S.mute; },
  init() {
    if (this.ok) {
      const load = () => { this.voices = speechSynthesis.getVoices() || []; updateVoiceTip(); };
      load(); speechSynthesis.onvoiceschanged = load; setTimeout(load, 900);
      setInterval(() => { // 看門狗：iOS 有時不觸發 onend
        if (!this.speaking || this.sim || !this.curDone) return;
        const el = performance.now() - this.uStart;
        if ((el > 1500 && !speechSynthesis.speaking && !speechSynthesis.pending) || el > this.uMax) this.curDone(true);
      }, 600);
    }
    document.addEventListener('visibilitychange', () => { if (!document.hidden && this.speaking && !this.sim && !speechSynthesis.speaking) this.restartChunk(); });
  },
  unlock() { if (!this.ok) return; try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } catch (_) {} },
  voice() {
    const n = (v) => (v.lang || '').replace('_', '-').toLowerCase();
    if (S.lang === 'zh') return this.voices.find((v) => n(v) === 'zh-hk') || this.voices.find((v) => /yue|cantonese|粵|sin-?ji/i.test(v.name + ' ' + v.lang)) || null;
    return this.voices.find((v) => n(v) === 'en-gb') || null;
  },
  on(f) { this.listeners.add(f); },
  notify() { this.listeners.forEach((f) => f()); },
  textOf(x) { return typeof x === 'function' ? x() : x; },
  prep(get) { return chunk(speakable(this.textOf(get), S.lang)); },
  busy() { return this.speaking || !!this.main || !!this.side || this.queue.length > 0; },
  whenIdle(cb) { if (!this.busy() && !this.paused) setTimeout(cb, 0); else this.idleCbs.push(cb); },
  stopOutput() {
    this.tok++; clearTimeout(this.timer); this.curDone = null;
    if (this.speaking && this.ok) { try { speechSynthesis.cancel(); } catch (_) {} this.lastCancel = performance.now(); }
    this.speaking = false;
  },
  cutAll() { this.stopOutput(); this.main = null; this.side = null; this.queue = []; this.idleCbs = []; this.notify(); },
  // 主線：換階段時用（截斷舊語音）
  say(get, onDone, who = null) {
    this.cutAll();
    this.main = { get, chunks: this.prep(get), i: 0, onDone, who, kind: 'main' };
    this.pump();
  },
  // 支線：老師講緊就排隊
  sideSay(get, key, who = 'info') {
    key = key || String(this.textOf(get)).slice(0, 40);
    if (this.main) {
      this.queue = this.queue.filter((q) => q.key !== key);
      this.queue.push({ get, key, who });
      if (this.queue.length > 3) this.queue.shift();
      this.notify(); return 'queued';
    }
    if (this.side && this.side.key === key && this.speaking) return 'now';
    this.stopOutput();
    this.queue = this.queue.filter((q) => q.key !== key);
    this.side = { get, key, who, chunks: this.prep(get), i: 0, kind: 'side' };
    this.pump(); return 'now';
  },
  isQueued(key) { return this.queue.some((q) => q.key === key); },
  isCurrent(key) { return this.speaking && this.cur && this.cur.key === key; },
  pause() { this.paused = true; this.stopOutput(); this.notify(); },
  resume() { this.paused = false; this.pump(); this.notify(); },
  relang() { // 轉語言：主線由頭用新語言重讀
    if (this.main) { this.main.chunks = this.prep(this.main.get); this.main.i = 0; }
    this.side = null; this.queue = [];
    this.stopOutput(); this.pump();
  },
  restartChunk() { this.stopOutput(); this.pump(); },
  pump() {
    if (this.paused) { this.notify(); return; }
    if (this.speaking) return;
    if (this.main) {
      if (this.main.i < this.main.chunks.length) return this.speak(this.main);
      const m = this.main; this.main = null;
      if (m.onDone) { m.onDone(); if (this.speaking || this.main) return; }
    }
    if (this.side && this.side.i < this.side.chunks.length) return this.speak(this.side);
    this.side = null;
    if (this.queue.length) { const q = this.queue.shift(); this.side = { ...q, chunks: this.prep(q.get), i: 0, kind: 'side' }; return this.speak(this.side); }
    this.notify();
    const cbs = this.idleCbs; this.idleCbs = [];
    cbs.forEach((f) => f());
  },
  speak(src) {
    const text = src.chunks[src.i], tok = ++this.tok;
    this.speaking = true; this.cur = src; this.notify();
    let fired = false;
    const done = (force) => {
      if (fired || tok !== this.tok) return; fired = true;
      if (force && this.ok && !this.sim) { try { speechSynthesis.cancel(); } catch (_) {} }
      clearTimeout(this.timer); this.speaking = false; this.curDone = null; src.i++;
      setTimeout(() => { if (tok === this.tok) this.pump(); }, 90 * FAST);
    };
    this.curDone = done;
    if (this.sim) { this.timer = setTimeout(done, simDur(text)); return; }
    const go = () => {
      if (tok !== this.tok) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = S.lang === 'zh' ? 'zh-HK' : 'en-GB';
      const v = this.voice(); if (v) u.voice = v;
      u.rate = (S.lang === 'zh' ? 0.95 : 0.92) * S.rate; u.pitch = 1.05;
      u.onend = () => done(); u.onerror = () => done();
      this.uStart = performance.now(); this.uMax = simDur(text) / FAST * 2.5 + 4000;
      speechSynthesis.speak(u);
    };
    const wait = 140 - (performance.now() - this.lastCancel);
    if (wait > 0) this.timer = setTimeout(go, wait); else go();
  },
  who() { return this.speaking && this.cur ? this.cur.who : null; }
};

/* =====================================================================
 * 3. 音效（WebAudio）與煙花
 * ===================================================================== */
const Sfx = {
  ac: null, lastBoom: 0,
  unlock() { try { this.ac = this.ac || new (window.AudioContext || window.webkitAudioContext)(); if (this.ac.state === 'suspended') this.ac.resume(); } catch (_) {} },
  tone(f, t0, d, type = 'sine', vol = 0.07) {
    const o = this.ac.createOscillator(), g = this.ac.createGain();
    o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g).connect(this.ac.destination); o.start(t0); o.stop(t0 + d + 0.05);
  },
  noise(t0, d, vol = 0.06, freq = 900) {
    const n = Math.floor(this.ac.sampleRate * d), b = this.ac.createBuffer(1, n, this.ac.sampleRate), ch = b.getChannelData(0);
    for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = this.ac.createBufferSource(), f = this.ac.createBiquadFilter(), g = this.ac.createGain();
    s.buffer = b; f.type = 'lowpass'; f.frequency.value = freq; g.gain.value = vol;
    s.connect(f).connect(g).connect(this.ac.destination); s.start(t0);
  },
  play(name) {
    if (!S.sfx || !this.ac) return;
    const t0 = this.ac.currentTime;
    try {
      if (name === 'pop') this.tone(660, t0, 0.09, 'triangle', 0.05);
      else if (name === 'tick') this.tone(440, t0, 0.05, 'square', 0.02);
      else if (name === 'crash') this.noise(t0, 0.14, 0.09, 1400);
      else if (name === 'correct') [523, 659, 784, 1047].forEach((f, i) => this.tone(f, t0 + i * 0.09, 0.22, 'triangle', 0.07));
      else if (name === 'wrong') { this.tone(392, t0, 0.18, 'sine', 0.05); this.tone(330, t0 + 0.16, 0.26, 'sine', 0.05); }
      else if (name === 'done') [523, 659, 784].forEach((f) => this.tone(f, t0, 0.6, 'triangle', 0.05));
      else if (name === 'boom') { if (performance.now() - this.lastBoom < 120) return; this.lastBoom = performance.now(); this.noise(t0, 0.35, 0.05, 500); }
    } catch (_) {}
  }
};

const FW = {
  cv: null, g: null, rockets: [], parts: [], on: false, last: 0,
  init() { this.cv = $('#fw'); this.g = this.cv.getContext('2d'); this.size(); addEventListener('resize', () => this.size()); },
  size() { const d = Math.min(devicePixelRatio, 2); this.cv.width = innerWidth * d; this.cv.height = innerHeight * d; this.g.setTransform(d, 0, 0, d, 0, 0); },
  launch(n = 6) {
    if (!S.fireworks) return;
    const hues = [0, 30, 50, 130, 190, 220, 280, 320];
    for (let i = 0; i < n; i++) this.rockets.push({ x: innerWidth * (0.12 + Math.random() * 0.76), y: innerHeight + 10, vx: (Math.random() - 0.5) * 80,
      vy: -Math.sqrt(2 * 520 * innerHeight * (0.45 + Math.random() * 0.3)), delay: i * 0.22, hue: hues[(Math.random() * hues.length) | 0] });
    if (!this.on) { this.on = true; this.last = performance.now(); requestAnimationFrame((ts) => this.tick(ts)); }
  },
  explode(r) {
    const n = 70 + Math.random() * 40;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 90 + Math.random() * 250;
      this.parts.push({ x: r.x, y: r.y, px: r.x, py: r.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1.1 + Math.random() * 0.8, max: 1.9, h: r.hue + Math.random() * 30 - 15 });
    }
    Sfx.play('boom');
  },
  tick(now) {
    const dt = Math.min((now - this.last) / 1000, 0.05); this.last = now;
    const g = this.g;
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(0, 0, innerWidth, innerHeight);
    g.globalCompositeOperation = 'lighter';
    for (const r of this.rockets) {
      if (r.delay > 0) { r.delay -= dt; continue; }
      const ox = r.x, oy = r.y;
      r.vy += 520 * dt; r.x += r.vx * dt; r.y += r.vy * dt;
      g.strokeStyle = `hsl(${r.hue},100%,75%)`; g.lineWidth = 3; g.beginPath(); g.moveTo(ox, oy); g.lineTo(r.x, r.y); g.stroke();
      if (r.vy > -40) { r.dead = true; this.explode(r); }
    }
    this.rockets = this.rockets.filter((r) => !r.dead);
    for (const p of this.parts) {
      p.px = p.x; p.py = p.y; p.vx *= 0.985; p.vy = p.vy * 0.985 + 170 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      g.strokeStyle = `hsla(${p.h},100%,65%,${Math.max(0, p.life / p.max)})`; g.lineWidth = 2.4;
      g.beginPath(); g.moveTo(p.px, p.py); g.lineTo(p.x, p.y); g.stroke();
    }
    this.parts = this.parts.filter((p) => p.life > 0);
    g.globalCompositeOperation = 'source-over';
    if (this.rockets.length || this.parts.length) requestAnimationFrame((ts) => this.tick(ts));
    else { this.on = false; g.clearRect(0, 0, innerWidth, innerHeight); }
  }
};
function celebrate(text, big = false) {
  FW.launch(big ? 11 : 6);
  Sfx.play(big ? 'done' : 'correct');
  const c = $('#cheer'); c.textContent = text; c.classList.remove('go'); void c.offsetWidth; c.classList.add('go');
}

/* =====================================================================
 * 4. 3D 引擎（Three.js）+ iPad 手勢
 * ===================================================================== */
const stageEl = $('#stage');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stageEl.appendChild(renderer.domElement);
const canvas = renderer.domElement;
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(innerWidth, innerHeight);
Object.assign(labelRenderer.domElement.style, { position: 'absolute', top: '0', left: '0', pointerEvents: 'none' });
stageEl.appendChild(labelRenderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdbeafe);
scene.fog = new THREE.Fog(0xdbeafe, 32, 60);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 200);
scene.add(new THREE.HemisphereLight(0xffffff, 0x94a3b8, 1.6));
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(6, 12, 8); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: 1, far: 40 });
sun.shadow.camera.updateProjectionMatrix(); scene.add(sun);

const lab = createCollisionLab({
  THREE, CSS2DObject, scene, camera,
  lang: () => S.lang, adv: () => S.adv,
  emit: (type, d) => Run.onEvent(type, d),
  info: (key, tg, xg) => Info.show(key, tg, xg),
  sfx: (n) => Sfx.play(n),
  speaker: () => { const w = Speech.who(); return w === 'chan' || w === 'ming' ? w : null; }
});
lab.mount();
const LABS = [lab];

// 觸控：手指落在物件上 → 交給實驗室；落在空白 → 旋轉視角
const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();
const setRay = (e) => { const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); raycaster.setFromCamera(ndc, camera); return raycaster; };
const pointers = new Set(); let captured = null, controls;
canvas.addEventListener('pointerdown', (e) => {
  if (e.isPrimary) pointers.clear();
  pointers.add(e.pointerId);
  if (pointers.size > 1 || captured !== null || App.view !== 'lab') return;
  if (lab.pointerDown(e, setRay(e))) { captured = e.pointerId; controls.enabled = false; try { canvas.setPointerCapture(e.pointerId); } catch (_) {} }
}, { capture: true });
canvas.addEventListener('pointermove', (e) => { if (captured === e.pointerId) lab.pointerMove(e, setRay(e)); });
const pUp = (e) => { pointers.delete(e.pointerId); lab.pointerUp(e); if (captured === e.pointerId) { captured = null; controls.enabled = true; } };
canvas.addEventListener('pointerup', pUp); canvas.addEventListener('pointercancel', pUp);

controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.minDistance = 4; controls.maxDistance = 32; controls.maxPolarAngle = Math.PI * 0.47;
controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
controls.addEventListener('change', () => { const tg = controls.target; tg.set(THREE.MathUtils.clamp(tg.x, -12, 12), THREE.MathUtils.clamp(tg.y, 0, 4), THREE.MathUtils.clamp(tg.z, -8, 8)); });
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('dblclick', (e) => e.preventDefault());
function defaultView() {
  const c = lab.camera, d = innerWidth / innerHeight < 1 ? 1.75 : 1.12;
  camera.position.set(c.pos[0] * d, c.pos[1] * d, c.pos[2] * d);
  controls.target.set(...c.target); controls.update();
}

/* =====================================================================
 * 5. 圖表（x 軸：時間；y 軸：速度 / 位置 / 動量 / 動能）
 * ===================================================================== */
const COLORS = { A: '#dc2626', B: '#2563eb', T: '#334155' };
function niceStep(span, n) { const raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p; }
function ticks(lo, hi, n) { const st = niceStep(hi - lo || 1, n), out = []; for (let v = Math.ceil(lo / st - 1e-9) * st; v <= hi + 1e-9; v += st) out.push(+v.toFixed(6)); return out; }
const fmtTick = (v) => (Math.abs(v) < 1e-9 ? '0' : Math.abs(v) >= 10 || Number.isInteger(v) ? String(Math.round(v * 10) / 10) : v.toFixed(1)).replace('-', '−');
const Chart = {
  cv: null, tab: 'v', hover: null, open: true, hoverT: null, lastLegend: '',
  init() {
    this.cv = $('#chart');
    const set = (e) => { const r = this.cv.getBoundingClientRect(); this.hover = e.clientX - r.left; clearTimeout(this.hoverT); this.draw(); };
    this.cv.addEventListener('pointerdown', set); this.cv.addEventListener('pointermove', set);
    const clear = () => { this.hoverT = setTimeout(() => { this.hover = null; this.draw(); }, 1500); };
    this.cv.addEventListener('pointerup', clear); this.cv.addEventListener('pointerleave', clear);
  },
  setTab(id) { this.tab = id; renderTabs(); this.draw(); },
  draw() {
    const cv = this.cv; if (!cv || !this.open || App.view !== 'lab') return;
    const dpr = Math.min(devicePixelRatio, 2), W = cv.clientWidth, Hh = cv.clientHeight; if (!W || !Hh) return;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(Hh * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr); }
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, Hh);
    const def = lab.graphs.find((x) => x.id === this.tab), H = lab.hist(), G = lab.ghost();
    const pad = { l: 40, r: 66, t: 20, b: 30 }, pw = W - pad.l - pad.r, ph = Hh - pad.t - pad.b;
    const tMax = H.t.length ? H.t[H.t.length - 1] : 0, gMax = G && G.t.length ? G.t[G.t.length - 1] : 0;
    let x1 = Math.max(4, tMax, Math.min(gMax, 12)), x0 = Math.max(0, x1 - 12);
    let lo = Infinity, hi = -Infinity;
    const scan = (h) => { for (const [k] of def.series) { const a = h.c[k]; for (let i = 0; i < a.length; i++) { if (h.t[i] < x0) continue; const v = a[i]; if (Number.isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } } } };
    scan(H); if (G) scan(G);
    if (def.fixed) [lo, hi] = def.fixed;
    else if (def.sym) { const m = Math.max(Math.abs(lo) || 0, Math.abs(hi) || 0, def.min || 1) * 1.15; lo = -m; hi = m; }
    else { hi = Math.max((Number.isFinite(hi) ? hi : 0) * 1.15, def.min || 1); lo = 0; }
    const yt = ticks(lo, hi, 4); lo = Math.min(lo, yt[0]); hi = Math.max(hi, yt[yt.length - 1]);
    const X = (tt) => pad.l + ((tt - x0) / (x1 - x0)) * pw, Y = (v) => pad.t + ((hi - v) / (hi - lo)) * ph;
    g.font = '11px -apple-system, system-ui, sans-serif'; g.lineWidth = 1;
    g.textAlign = 'right'; g.textBaseline = 'middle';
    for (const v of yt) { const y = Y(v); g.strokeStyle = Math.abs(v) < 1e-9 ? '#94a3b8' : '#e2e8f0'; g.lineWidth = Math.abs(v) < 1e-9 ? 1.5 : 1; g.beginPath(); g.moveTo(pad.l, y); g.lineTo(pad.l + pw, y); g.stroke(); g.fillStyle = '#64748b'; g.fillText(fmtTick(v), pad.l - 5, y); }
    g.textAlign = 'center'; g.textBaseline = 'top';
    for (const tt of ticks(x0, x1, 6)) { if (tt < x0 - 1e-6) continue; const x = X(tt); g.strokeStyle = '#f1f5f9'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, pad.t); g.lineTo(x, pad.t + ph); g.stroke(); g.fillStyle = '#64748b'; g.fillText(fmtTick(tt), x, pad.t + ph + 5); }
    g.strokeStyle = '#475569'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(pad.l, pad.t); g.lineTo(pad.l, pad.t + ph); g.lineTo(pad.l + pw, pad.t + ph); g.stroke();
    g.fillStyle = '#334155'; g.font = '700 11px -apple-system, system-ui, sans-serif';
    g.textAlign = 'left'; g.textBaseline = 'bottom'; g.fillText('↑ ' + L(def.y), pad.l - 4, pad.t - 5);
    g.textAlign = 'right'; g.textBaseline = 'bottom'; g.fillText(t('xAxis') + ' →', W - 2, Hh - 2);
    g.save(); g.beginPath(); g.rect(pad.l, pad.t - 3, pw, ph + 6); g.clip();
    for (const ev of H.ev) { if (ev.t < x0) continue; const x = X(ev.t); g.strokeStyle = '#f59e0b'; g.lineWidth = 1.5; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(x, pad.t); g.lineTo(x, pad.t + ph); g.stroke(); g.setLineDash([]); }
    const line = (h, k, color, w, dash, alpha) => {
      g.strokeStyle = color; g.lineWidth = w; g.globalAlpha = alpha; g.setLineDash(dash || []); g.lineJoin = 'round';
      g.beginPath(); let pen = false; const a = h.c[k];
      for (let i = 0; i < a.length; i++) { if (h.t[i] < x0) continue; const v = a[i]; if (!Number.isFinite(v)) { pen = false; continue; } const x = X(h.t[i]), y = Y(v); if (pen) g.lineTo(x, y); else { g.moveTo(x, y); pen = true; } }
      g.stroke(); g.globalAlpha = 1; g.setLineDash([]);
    };
    if (G) for (const [k, s] of def.series) line(G, k, COLORS[s], 2, [5, 4], 0.4);
    for (const [k, s] of def.series) line(H, k, COLORS[s], s === 'T' ? 2.6 : 2, null, 1);
    g.restore();
    // 直接標示（線尾）
    const n = H.t.length;
    if (n) {
      const labs = def.series.map(([k, s]) => ({ s, v: H.c[k][n - 1] })).filter((o) => Number.isFinite(o.v)).map((o) => ({ ...o, y: Math.min(Math.max(Y(o.v), pad.t), pad.t + ph) }));
      labs.sort((a, b) => a.y - b.y);
      for (let i = 1; i < labs.length; i++) if (labs[i].y - labs[i - 1].y < 14) labs[i].y = labs[i - 1].y + 14;
      g.font = '700 11px -apple-system, system-ui, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle';
      for (const o of labs) { g.fillStyle = COLORS[o.s]; g.beginPath(); g.arc(pad.l + pw + 7, o.y, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = '#334155'; g.fillText(`${lab.seriesName(o.s)} ${fmtTick(Math.round(o.v * 10) / 10)}`, pad.l + pw + 14, o.y); }
    }
    // 十字線提示
    if (this.hover != null && n && this.hover >= pad.l && this.hover <= pad.l + pw) {
      const tt = x0 + ((this.hover - pad.l) / pw) * (x1 - x0);
      let i = 0, j = n - 1; while (i < j) { const m = (i + j) >> 1; if (H.t[m] < tt) i = m + 1; else j = m; }
      const x = X(H.t[i]);
      g.strokeStyle = '#64748b'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, pad.t); g.lineTo(x, pad.t + ph); g.stroke();
      const rows = [`t = ${H.t[i].toFixed(2)} s`, ...def.series.filter(([k]) => Number.isFinite(H.c[k][i])).map(([k, s]) => `${lab.seriesName(s)}: ${H.c[k][i].toFixed(2)}`)];
      g.font = '700 11px -apple-system, system-ui, sans-serif';
      const bw = Math.max(...rows.map((r) => g.measureText(r).width)) + 14, bh = rows.length * 15 + 8;
      const bx = Math.min(x + 8, pad.l + pw - bw), by = pad.t + 4;
      g.fillStyle = 'rgba(15,23,42,.88)'; g.beginPath(); g.roundRect ? g.roundRect(bx, by, bw, bh, 6) : g.rect(bx, by, bw, bh); g.fill();
      g.fillStyle = '#fff'; g.textAlign = 'left'; g.textBaseline = 'top';
      rows.forEach((r, k) => g.fillText(r, bx + 7, by + 5 + k * 15));
    }
    const legend = def.series.map(([, s]) => `<span><i class="sw" style="background:${COLORS[s]}"></i>${esc(lab.seriesName(s))}</span>`).join('')
      + (G ? `<span>┄ ${esc(t('ghostNote'))}</span>` : '') + (H.ev.length ? `<span style="color:#b45309">┆ ${esc(t('crashNote'))}</span>` : '');
    if (legend !== this.lastLegend) { $('#chartLegend').innerHTML = legend; this.lastLegend = legend; }
  }
};

/* =====================================================================
 * 6. 介面元件
 * ===================================================================== */
let toastT;
function toast(text) { const el = $('#toast'); el.textContent = text; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2200); }

const Info = {
  key: null, hideT: null,
  show(key, tg, xg) {
    this.key = key; this.tg = tg; this.xg = xg;
    $('#infoTitle').textContent = tg(); $('#infoText').textContent = xg();
    $('#info').classList.remove('is-hidden');
    Speech.sideSay(() => tg() + (S.lang === 'zh' ? '。' : '. ') + xg(), 'info:' + key);
    this.status();
    clearTimeout(this.hideT); this.hideT = setTimeout(() => this.hideIfQuiet(), 9000);
  },
  hideIfQuiet() { if (Speech.isQueued('info:' + this.key) || Speech.isCurrent('info:' + this.key)) { this.hideT = setTimeout(() => this.hideIfQuiet(), 2000); return; } this.hide(); },
  hide() { $('#info').classList.add('is-hidden'); this.key = null; },
  relang() { if (this.key) { $('#infoTitle').textContent = this.tg(); $('#infoText').textContent = this.xg(); } },
  status() {
    if (!this.key) return;
    const k = 'info:' + this.key;
    $('#infoStatus').textContent = Speech.isQueued(k) ? t('waitTeacher') : Speech.isCurrent(k) ? t('reading') : '';
  }
};

function readable(el) {
  const c = el.cloneNode(true);
  c.querySelectorAll('.spk, button[data-noread], .no-tts, canvas').forEach((n) => n.remove());
  return c.innerText;
}
function chainSpeech(chain) {
  const a = chain.map(L);
  return S.lang === 'zh' ? `${t('because')}${a[0]}，` + a.slice(1).map((x) => `${t('so')}${x}`).join('，') + '。'
    : a[0] + '. ' + a.slice(1).map((x) => 'Therefore, ' + x.charAt(0).toLowerCase() + x.slice(1)).join('. ') + '.';
}
function readFor(btn) {
  const r = btn.dataset.read;
  if (r === 'bubble') return App.view === 'lab' ? Run.replay() : Tour.replay();
  if (r === 'graph') return Speech.sideSay(() => lab.describeGraph(Chart.tab), 'graph');
  if (r === 'chain') return Speech.sideSay(() => chainSpeech(Run.st.chain), 'chain');
  if (r === 'quizq') return Speech.sideSay(() => quizSpeech(Run.st.quiz), 'quizq');
  if (r && r.startsWith('opt:')) { const k = +r.slice(4); return Speech.sideSay(() => fmt(t('optN'), { n: k + 1 }) + L(Run.st.quiz.opts[k]), 'opt' + k); }
  const el = $(r); if (el) Speech.sideSay(() => readable($(r)), 'sel:' + r);
}
function quizSpeech(Q) { return t('question') + L(Q.q) + ' ' + Q.opts.map((o, k) => fmt(t('optN'), { n: k + 1 }) + L(o) + (S.lang === 'zh' ? '。' : '.')).join(' '); }

// 喇叭 & 點讀模式（捕捉階段攔截）
document.addEventListener('click', (e) => {
  const spk = e.target.closest('.spk');
  if (spk) { e.preventDefault(); e.stopPropagation(); Sfx.unlock(); readFor(spk); return; }
  if (!App.pointRead || App.view === 'start') return;
  if (e.target.closest('[data-noread]') || e.target.closest('#stage')) return;
  const el = e.target.closest('[data-say], .opt, .item, .chip, .pill, button, h1, h2, h3, p, li, label, b, span, .prow, .lbl, .task, div');
  if (!el || el.id === 'hub' || el.id === 'labUI') return;
  const text = (el.dataset.say || readable(el)).trim();
  if (!text) return;
  e.preventDefault(); e.stopPropagation();
  el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
  Speech.sideSay(text, 'pr:' + text.slice(0, 40));
}, true);

/* ---------------- 頂部列 ---------------- */
function renderTopbar() {
  const lab = App.view === 'lab';
  document.body.classList.toggle('view-hub', App.view === 'hub');
  $('#btnHome').textContent = t('home');
  $('#btnHome').classList.toggle('is-hidden', !lab);
  $('#btnAdv').classList.toggle('is-hidden', !lab);
  $('#btnAuto').textContent = S.auto ? t('autoOn') : t('autoOff');
  $('#btnAuto').classList.toggle('active', S.auto);
  $('#btnPause').textContent = Speech.paused ? t('resume') : t('pause');
  $('#btnPause').classList.toggle('btn-amber', Speech.paused);
  $('#btnRead').classList.toggle('active', App.pointRead);
  $('#btnAdv').classList.toggle('active', S.adv);
  $('#brandSub').textContent = lab ? L(LABS[0].title) : t('appSub');
  $$('[data-lang]').forEach((b) => b.classList.toggle('active', b.dataset.lang === S.lang));
  renderSayPill(); updateVoiceTip();
  requestAnimationFrame(measure);
}
function renderSayPill() {
  const p = $('#sayPill'), w = Speech.who();
  let txt = Speech.paused ? t('sayPaused') : w === 'chan' ? t('sayChan') : w === 'ming' ? t('sayMing') : w ? t('sayInfo') : t('sayIdle');
  if (Speech.queue.length) txt += fmt(t('queued'), { n: Speech.queue.length });
  $('#sayText').textContent = txt;
  p.classList.toggle('on', !!w && !Speech.paused); p.classList.toggle('paused', Speech.paused);
  $$('.spk[data-read="bubble"]').forEach((b) => b.classList.toggle('playing', !!Speech.main && Speech.speaking && Speech.cur === Speech.main));
}
Speech.on(() => { renderSayPill(); Info.status(); });

function updateVoiceTip() {
  let msg = '';
  if (!Speech.ok) msg = t('noSpeech');
  else if (!S.mute && Speech.voices.length && !Speech.voice()) msg = t('voiceTip');
  $('#voiceTipText').textContent = msg;
  $('#voiceTip').classList.toggle('is-hidden', !msg || updateVoiceTip.dismissed?.[S.lang] || App.view !== 'hub');
}

function measure() {
  document.documentElement.style.setProperty('--top', $('#topbar').offsetHeight + 4 + 'px');
  const b = $('#bubble'); if (b && App.view === 'lab') document.documentElement.style.setProperty('--bubbleH', b.offsetHeight + 'px');
}

/* =====================================================================
 * 7. 主頁（課程大綱 + 導覽）
 * ===================================================================== */
const itemStage = new Map(); // 項目編號 → 實驗步驟
LABS[0].stages.forEach((st, i) => (st.items || []).forEach((n) => { if (!itemStage.has(n)) itemStage.set(n, i); }));
function itemStatus(n) { return PARTIAL.includes(n) ? 'partial' : itemStage.has(n) ? 'open' : 'locked'; }

function renderHub() {
  let html = '';
  for (const tp of TOPICS) {
    html += `<section class="topic panel" id="topic-${tp.id}" style="--tc:${tp.color}">
      <header class="topic-h"><span class="ticon">${tp.icon}</span><div class="flex-1"><div class="tnum">${esc(fmt(t('topicN'), { n: tp.id }))}</div><h2>${esc(L(tp.name))}</h2><p class="tdesc">${esc(L(tp.desc))}</p></div>
      <button class="spk" data-read="#topic-${tp.id} .topic-h" aria-label="read">🔊</button></header>`;
    for (const sb of tp.subs) {
      const b = BENCHES[sb.bench];
      html += `<div class="sub"><div class="sub-h"><b>${sb.id} ${esc(L(sb.name))}</b><span class="pill phase p${sb.phase}">${esc(fmt(t('phase'), { n: sb.phase }))}</span><span class="pill bench">${b.icon} ${esc(L(b))}</span></div><ul>`;
      for (const [n, zh, en] of sb.items) {
        const st = itemStatus(n);
        html += `<li class="item ${st}" data-item="${n}" data-phase="${sb.phase}" data-name="${esc(S.lang === 'zh' ? zh : en)}"><span class="num">${n}</span><span class="nm">${esc(S.lang === 'zh' ? zh : en)}</span><span>${st === 'open' ? '✅' : st === 'partial' ? '🟡' : '🔒'}</span></li>`;
      }
      html += '</ul></div>';
    }
    html += '</section>';
  }
  $('#topics').innerHTML = html;
  const all = TOPICS.flatMap((tp) => tp.subs.flatMap((s) => s.items.map((i) => i[0])));
  const nOpen = all.filter((n) => itemStatus(n) === 'open').length, nPart = all.filter((n) => itemStatus(n) === 'partial').length;
  $('#fTitle').textContent = L(LABS[0].title); $('#fDesc').textContent = L(LABS[0].desc);
  $('#fItems').textContent = fmt(t('itemsCovered'), { list: [...itemStage.keys()].sort((a, b) => a - b).join(', ') });
  $('#openCount').textContent = fmt(t('openCount'), { a: nOpen, b: nPart, c: all.length });
  Tour.render();
}
$('#topics').addEventListener('click', (e) => {
  const li = e.target.closest('.item'); if (!li) return;
  const n = +li.dataset.item;
  if (itemStage.has(n)) { Sfx.unlock(); enterLab(itemStage.get(n)); return; }
  Speech.sideSay(() => fmt(t('lockedSay'), { n, name: li.dataset.name, p: li.dataset.phase }), 'item' + n);
  toast('🔒 ' + t('legendLocked'));
});

const Tour = {
  i: 0, tok: 0, timer: null,
  step() { return HUB_TOUR[this.i]; },
  render() {
    const s = this.step();
    $('#hAvatar').textContent = s.who === 'chan' ? '👩‍🔬' : '👦';
    $('#hName').textContent = t(s.who);
    $('#hCount').textContent = `${this.i + 1} / ${HUB_TOUR.length}`;
    $('#hText').textContent = L(s);
    $('#hPrev').disabled = this.i === 0;
    $$('.spot').forEach((el) => el.classList.remove('spot'));
  },
  go(i, speak = true) {
    this.tok++; clearTimeout(this.timer);
    this.i = Math.max(0, Math.min(i, HUB_TOUR.length - 1));
    this.render();
    const s = this.step(), el = document.getElementById(s.spot);
    if (el) { el.classList.add('spot'); el.scrollIntoView({ behavior: 'smooth', block: s.spot === 'topics' ? 'start' : 'center' }); }
    if (!speak) return;
    const tok = this.tok;
    this.done = false;
    Speech.say(() => L(this.step()), () => Speech.whenIdle(() => { if (tok === this.tok) { this.done = true; this.kick(); } }), s.who);
  },
  kick() {
    clearTimeout(this.timer);
    if (App.view !== 'hub' || !S.auto || Speech.paused || !this.done) return;
    const tok = this.tok;
    if (this.i < HUB_TOUR.length - 1) this.timer = setTimeout(() => tok === this.tok && this.go(this.i + 1), 450 * FAST);
    else this.timer = setTimeout(() => tok === this.tok && enterLab(0), 900 * FAST);
  },
  halt() { clearTimeout(this.timer); },
  replay() { this.go(this.i); }
};
$('#hPrev').onclick = () => Tour.go(Tour.i - 1);
$('#hNext').onclick = () => (Tour.i < HUB_TOUR.length - 1 ? Tour.go(Tour.i + 1) : enterLab(0));
$('#fStart').onclick = () => { Sfx.unlock(); enterLab(0); };

/* =====================================================================
 * 8. 實驗室教學流程（Run）
 * ---------------------------------------------------------------------
 *  換階段 → Speech.say() 截斷舊語音
 *  完成任務 / 答題 → 推進（同樣截斷）
 *  自動導覽：講完 → 自動示範 → 自動下一步；問題會倒數，時間到就揭曉
 * ===================================================================== */
const Run = {
  lab, i: 0, st: null, tok: 0, timers: [], autoT: null, narrDone: false, goalDone: false, demoRunning: false, demoDone: false, quiz: null, locks: new Set(), score: {}, enteredAt: 0,
  later(sec, fn) { const tok = this.tok; const id = setTimeout(() => { if (tok === this.tok) fn(); }, sec * 1000); this.timers.push(id); return id; },
  clear() { this.tok++; this.timers.forEach(clearTimeout); this.timers = []; this.autoT = null; this.demoRunning = false; showDemo(false); },
  go(i) {
    this.clear();
    const stages = this.lab.stages;
    this.i = Math.max(0, Math.min(i, stages.length - 1));
    const st = this.st = stages[this.i];
    this.narrDone = false; this.goalDone = false; this.demoDone = false; this.enteredAt = performance.now();
    this.quiz = st.quiz ? { phase: 'ask', pick: null, correct: null, revealSaid: false } : null;
    Info.hide(); $('#done').classList.add('is-hidden');
    if (this.toolsByDemo) { openTools(false); this.toolsByDemo = false; } // 示範時打開的工具箱，換步驟就收起
    if (st.setup) this.lab.apply(st.setup);
    this.locks = new Set(st.lock || []);
    renderTools(); if (st.graph) Chart.setTab(st.graph);
    renderStage(); renderBubble(); renderQuiz();
    if (st.pre) this.actions(st.pre);
    const tok = this.tok;
    Speech.say(() => this.narration(), () => Speech.whenIdle(() => { if (tok === this.tok) { this.narrDone = true; this.kick(); } }), st.who);
  },
  narration() {
    const st = this.st;
    let s = L(st.say);
    if (st.quiz) s += ' ' + quizSpeech(st.quiz);
    else if (S.adv && st.adv) s += ' ' + L(st.adv);
    return s;
  },
  bubbleText() { const q = this.quiz; return q && q.phase === 'reveal' ? L(this.st.quiz.why) : L(this.st.say); },
  next() { if (this.i < this.lab.stages.length - 1) this.go(this.i + 1); else this.finish(); },
  prev() { this.go(this.i - 1); },
  replay() {
    const q = this.quiz, tok = this.tok;
    if (q && q.phase === 'reveal') return this.sayReveal();
    Speech.say(() => this.narration(), () => Speech.whenIdle(() => { if (tok === this.tok) { this.narrDone = true; this.kick(); } }), this.st.who);
  },
  halt() { clearTimeout(this.autoT); this.autoT = null; stopCountdown(); },
  kick() {
    this.halt();
    if (App.view !== 'lab' || !this.narrDone || Speech.paused) return;
    const st = this.st, q = this.quiz;
    if (q) {
      if (q.phase === 'ask' && S.auto) startCountdown();
      if (q.phase === 'reveal' && q.revealSaid) { renderQuiz(); if (S.auto) this.autoT = this.later(1.2 * FAST + 0.3, () => this.next()); }
      return;
    }
    if (st.goal) { if (!this.goalDone && S.auto && !this.demoRunning) this.autoT = this.later(S.demoDelay * FAST, () => this.actions(st.demo, true)); return; }
    if (st.demo && !this.demoDone) {
      if (S.auto && !this.demoRunning) this.autoT = this.later(S.demoDelay * FAST, async () => { await this.actions(st.demo, true); this.demoDone = true; this.kick(); });
      return;
    }
    if (st.finish) return this.finish();
    if (S.auto) this.autoT = this.later(0.8 * FAST + 0.2, () => this.next());
  },
  // 以「模擬時間」等待：裝置較慢或開了慢動作，都會等到實驗真正做完
  async waitSim(sec) {
    const tok = this.tok; let start = this.lab.simTime(), last = start;
    while (tok === this.tok) {
      const now = this.lab.simTime();
      if (now < last) start = now; // 實驗被重設
      last = now;
      if (now - start >= sec) return;
      await sleep(80);
    }
  },
  async actions(list, demo = false) {
    if (!list) return;
    const tok = this.tok;
    if (demo) { this.demoRunning = true; showDemo(true); }
    for (const a of list) {
      if (tok !== this.tok) return;
      if (a[0] === 'wait') await this.waitSim(a[1]);
      else if (a[0] === 'openTools') { if ($('#tools').classList.contains('is-hidden')) { openTools(true); this.toolsByDemo = true; } }
      else {
        if (a[0] === 'push' && App.view === 'lab') await ghostTap(this.lab.screenPos(a[1]));
        if (tok !== this.tok) return;
        this.lab.act(a);
        if (a[0] === 'set') { renderTools(a[1]); }
        await sleep(120);
      }
    }
    if (tok === this.tok && demo) { this.demoRunning = false; showDemo(false); }
  },
  onEvent(type, d = {}) {
    const st = this.st;
    if (App.view !== 'lab' || !st || !st.goal || this.goalDone) return;
    if (performance.now() - this.enteredAt < 250) return;
    const g = st.goal;
    if (g.type !== type) return;
    if (g.id != null && d.id !== g.id) return;
    if (g.test && !g.test()) return;
    this.goalDone = true; this.halt(); renderStage();
    toast('✅ ' + t('taskDone')); Sfx.play('correct');
    this.later(st.settle ?? 1.6, () => this.next());
  },
  answer(k) {
    const q = this.quiz; if (!q || q.phase !== 'ask') return;
    this.halt();
    const st = this.st, Q = st.quiz;
    q.pick = k; q.correct = k === Q.ans;
    if (k != null && !(st.id in this.score)) this.score[st.id] = q.correct;
    if (Q.run) {
      q.phase = 'watch'; renderQuiz(); renderStage();
      Speech.say(() => (q.pick == null ? t('timeUp') : fmt(t('yourPick'), { x: L(Q.opts[q.pick]) })), null, st.who);
      const tok = this.tok;
      this.actions(Q.run).then(() => this.waitSim(Q.watch ?? 2.4)).then(() => { if (tok === this.tok) this.reveal(); });
    } else this.reveal();
  },
  reveal() {
    const q = this.quiz; q.phase = 'reveal';
    renderQuiz(); renderBubble(); renderStage();
    if (q.pick != null && q.correct) celebrate(t('correct'));
    else if (q.pick != null) Sfx.play('wrong');
    this.sayReveal();
  },
  sayReveal() {
    const q = this.quiz, st = this.st, tok = this.tok;
    Speech.say(() => (q.pick == null ? '' : (q.correct ? t('correctSay') : t('wrongSay')) + ' ') + L(st.quiz.why) + (S.adv && st.adv ? ' ' + L(st.adv) : ''),
      () => Speech.whenIdle(() => { if (tok === this.tok) { q.revealSaid = true; this.narrDone = true; this.kick(); } }), st.who);
  },
  finish() {
    this.halt();
    const ans = Object.values(this.score), total = this.lab.stages.filter((s) => s.quiz).length, ok = ans.filter(Boolean).length;
    $('#doneTitle').textContent = t('finishTitle');
    $('#doneStars').textContent = fmt(t('finishStars'), { a: ok, b: total }) + ' ' + '⭐'.repeat(Math.round((ok / total) * 5));
    $('#done').classList.remove('is-hidden');
    celebrate('🏆', true);
    Speech.say(() => fmt(t('finishSay'), { a: ok, b: total }), null, 'chan');
  }
};

function showDemo(on) { $('#demoBadge').classList.toggle('is-hidden', !on); }
async function ghostTap(pos) {
  const g = $('#ghost'); g.style.left = pos.x + 'px'; g.style.top = pos.y + 'px';
  g.classList.remove('is-hidden', 'tap'); void g.offsetWidth; g.classList.add('tap');
  await sleep(560); g.classList.add('is-hidden');
}
let cdTimer = null;
function startCountdown() {
  stopCountdown();
  const bar = $('#qBar i'); if (!bar) return;
  const dur = S.thinkTime * FAST;
  bar.style.transition = 'none'; bar.style.width = '100%'; void bar.offsetWidth;
  bar.style.transition = `width ${dur}s linear`; bar.style.width = '0%';
  $('#qBar').classList.remove('is-hidden');
  cdTimer = setTimeout(() => Run.answer(null), dur * 1000);
}
function stopCountdown() {
  clearTimeout(cdTimer); cdTimer = null;
  const bar = $('#qBar i'); if (bar) { bar.style.transition = 'none'; bar.style.width = '100%'; }
  const wrap = $('#qBar'); if (wrap) wrap.classList.add('is-hidden');
}

/* ---------------- 實驗室畫面 ---------------- */
function renderStage() {
  const st = Run.st, n = Run.lab.stages.length;
  $('#stageNum').textContent = fmt(t('stepOf'), { i: Run.i + 1, n });
  $('#stageTitle').textContent = L(st.title);
  $('#dots').innerHTML = Run.lab.stages.map((_, k) => `<i class="${k < Run.i ? 'past' : k === Run.i ? 'now' : ''}"></i>`).join('');
  $('#taskRow').classList.toggle('is-hidden', !st.task);
  if (st.task) { $('#taskText').textContent = L(st.task) + (Run.goalDone ? '  ✅ ' + t('taskDone') : ''); $('#taskText').classList.toggle('done', Run.goalDone); }
  $('#condRow').classList.toggle('is-hidden', !st.cond);
  $('#conds').innerHTML = (st.cond || []).map((c) => `<span class="chip">${esc(L(c))}</span>`).join('');
  const q = Run.quiz;
  document.body.classList.toggle('quiz-open', !!q && q.phase !== 'watch');
}
function renderBubble() {
  const st = Run.st, q = Run.quiz;
  $('#bAvatar').textContent = st.who === 'chan' ? '👩‍🔬' : '👦';
  $('#bName').textContent = t(st.who);
  $('#bCount').textContent = `${Run.i + 1} / ${Run.lab.stages.length}`;
  $('#bText').textContent = Run.bubbleText();
  const showAdv = S.adv && st.adv && (!q || q.phase === 'reveal');
  $('#bAdv').textContent = showAdv ? '🔬 ' + L(st.adv) : '';
  $('#bAdv').classList.toggle('is-hidden', !showAdv);
  const showChain = st.chain && (!q || q.phase === 'reveal');
  const ch = $('#chain');
  ch.classList.toggle('is-hidden', !showChain);
  if (showChain) ch.innerHTML = `<div class="lbl"><span>${esc(t('chain'))}</span><button class="spk" data-read="chain" aria-label="read" style="width:32px;height:32px;font-size:15px">🔊</button></div>` +
    st.chain.map((c, k) => (k ? '<span class="arr">→</span>' : '') + `<span class="chip">${k === 0 ? esc(t('because')) + ' ' : ''}${esc(L(c))}</span>`).join('');
  $('#bPrev').disabled = Run.i === 0;
  $('#bNext').classList.toggle('glow', !!q && q.phase === 'reveal' && q.revealSaid && !S.auto);
  requestAnimationFrame(measure);
}
function renderQuiz() {
  const q = Run.quiz, el = $('#quiz');
  if (!q) { el.classList.add('is-hidden'); document.body.classList.remove('quiz-open'); return; }
  const Q = Run.st.quiz;
  el.classList.remove('is-hidden');
  el.classList.toggle('mini', q.phase === 'watch');
  if (q.phase === 'watch') {
    el.innerHTML = `<div class="qhead">${esc(t('watching'))} <span class="text-slate-500 font-bold">${q.pick == null ? '' : '· ' + (q.pick + 1) + '. ' + esc(L(Q.opts[q.pick]))}</span></div>`;
  } else {
    const rv = q.phase === 'reveal';
    el.innerHTML = `<div class="qhead">${esc(t('quizTitle'))}<div class="flex-1"></div><button class="spk" data-read="quizq" aria-label="read">🔊</button></div>
      ${rv ? `<div id="qResult" style="color:${q.correct ? '#16a34a' : '#b45309'}">${esc(q.pick == null ? t('timeUpShort') : q.correct ? t('correct') : t('wrong'))}</div>` : ''}
      <div id="qText">${esc(L(Q.q))}</div>
      ${Q.opts.map((o, k) => `<button class="opt ${rv && k === Q.ans ? 'right' : ''} ${rv && k === q.pick && k !== Q.ans ? 'wrongpick' : ''}" data-k="${k}" ${rv ? 'disabled' : ''}>
        <span class="k">${rv && k === Q.ans ? '✓' : rv && k === q.pick ? '✗' : k + 1}</span><span class="tx">${esc(L(o))}</span>
        <span class="spk" data-read="opt:${k}" aria-label="read">🔊</span></button>`).join('')}
      <div id="qBar" class="is-hidden"><i></i></div>
      ${rv ? `<button id="qCont" class="btn btn-primary w-full mt-1 ${q.revealSaid && !S.auto ? 'glow' : ''}">${esc(t('continue'))}</button>` : ''}`;
  }
  document.body.classList.toggle('quiz-open', q.phase !== 'watch');
  if (q.phase === 'ask' && Run.narrDone && S.auto && !Speech.paused) startCountdown();
}
$('#quiz').addEventListener('click', (e) => {
  const o = e.target.closest('.opt'); if (o && !o.disabled) { Sfx.unlock(); Run.answer(+o.dataset.k); return; }
  if (e.target.closest('#qCont')) Run.next();
});

function renderTabs() {
  $('#tabs').innerHTML = lab.graphs.map((g) => `<button data-tab="${g.id}" class="${g.id === Chart.tab ? 'active' : ''}">${esc(L(g.tab))}</button>`).join('');
}
$('#tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) Chart.setTab(b.dataset.tab); });

function fmtParam(d, v) { return (d.unit === '×' ? v.toFixed(1) + '×' : (d.step < 1 ? v.toFixed(d.step < 0.1 ? 2 : 1) : v) + (d.unit ? ' ' + d.unit : '')) + (d.word ? ' · ' + lab.paramWord(d.key, v) : ''); }
function renderTools(flashKey) {
  $('#params').innerHTML = lab.params.map((d) => {
    const v = lab.getParam(d.key), lk = Run.locks.has(d.key);
    if (d.type === 'toggle') return `<div class="prow ${lk ? 'locked' : ''}" data-key="${d.key}"><div class="ph">${esc(L(d.label))} ${lk ? `<span class="lock">${esc(t('locked'))}</span>` : ''}
      <span class="val"></span><button class="toggle ${v ? 'on' : ''}" data-toggle="${d.key}" ${lk ? 'disabled' : ''} aria-label="toggle"></button></div></div>`;
    return `<div class="prow ${lk ? 'locked' : ''} ${flashKey === d.key ? 'flash' : ''}" data-key="${d.key}">
      <div class="ph">${esc(L(d.label))} ${lk ? `<span class="lock">${esc(t('locked'))}</span>` : ''}<span class="val" id="pv-${d.key}">${esc(fmtParam(d, v))}</span></div>
      ${d.hint ? `<div class="hint">${esc(L(d.hint))}</div>` : ''}
      <input type="range" min="${d.min}" max="${d.max}" step="${d.step}" value="${v}" data-param="${d.key}" ${lk ? 'disabled' : ''} /></div>`;
  }).join('');
  $('#pushB').disabled = !lab.getParam('showB');
}
$('#params').addEventListener('input', (e) => {
  const k = e.target.dataset.param; if (!k) return;
  const d = lab.params.find((q) => q.key === k), v = Number(e.target.value);
  lab.setParam(k, v); $('#pv-' + k).textContent = fmtParam(d, v);
});
$('#params').addEventListener('click', (e) => {
  const b = e.target.closest('[data-toggle]'); if (!b || b.disabled) return;
  const k = b.dataset.toggle; lab.setParam(k, !lab.getParam(k)); renderTools();
});
function openTools(on) { $('#tools').classList.toggle('is-hidden', !on); $('#fabTools').classList.toggle('active', on); }

/* =====================================================================
 * 9. 畫面切換、語言、設定
 * ===================================================================== */
function enterLab(i = 0) {
  Tour.halt(); $$('.spot').forEach((el) => el.classList.remove('spot'));
  App.view = 'lab';
  $('#hub').classList.add('is-hidden'); $('#labUI').classList.remove('is-hidden'); stageEl.style.visibility = 'visible';
  if (i === 0) Run.score = {};
  openTools(innerWidth >= 1366);
  renderTopbar(); renderTabs(); defaultView();
  Run.go(i);
  requestAnimationFrame(measure);
}
function goHub() {
  Run.clear(); Run.halt(); Speech.cutAll();
  App.view = 'hub';
  $('#labUI').classList.add('is-hidden'); $('#done').classList.add('is-hidden'); $('#hub').classList.remove('is-hidden'); stageEl.style.visibility = 'hidden';
  document.body.classList.remove('quiz-open');
  renderTopbar(); Tour.render();
}
function applyI18n() {
  document.documentElement.lang = S.lang === 'zh' ? 'zh-HK' : 'en-GB';
  document.title = t('appTitle');
  $$('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  renderTopbar(); renderHub(); renderSettings();
  if (App.view === 'lab') { renderStage(); renderBubble(); renderQuiz(); renderTools(); renderTabs(); lab.labels(); Chart.lastLegend = ''; Chart.draw(); Info.relang(); }
  if (!$('#done').classList.contains('is-hidden')) { const ans = Object.values(Run.score), total = lab.stages.filter((s) => s.quiz).length; $('#doneTitle').textContent = t('finishTitle'); $('#doneStars').textContent = fmt(t('finishStars'), { a: ans.filter(Boolean).length, b: total }); }
  updateVoiceTip();
}
function setLang(l) { if (S.lang === l) return; S.lang = l; save(); applyI18n(); Speech.relang(); }

const SET_ROWS = [
  { key: 'auto', type: 'toggle', label: 'sAuto' }, { key: 'mute', type: 'toggle', label: 'sMute' },
  { key: 'rate', label: 'sRate', min: 0.6, max: 1.4, step: 0.1 }, { key: 'demoDelay', label: 'sDemo', min: 0, max: 5, step: 0.5 },
  { key: 'thinkTime', label: 'sThink', min: 5, max: 40, step: 5 }, { key: 'sfx', type: 'toggle', label: 'sSfx' }, { key: 'fireworks', type: 'toggle', label: 'sFw' }
];
function renderSettings() {
  $('#sRows').innerHTML = SET_ROWS.map((r) => r.type === 'toggle'
    ? `<div class="srow"><span class="grow">${esc(t(r.label))}</span><button class="toggle ${S[r.key] ? 'on' : ''}" data-skey="${r.key}" data-noread aria-label="toggle"></button></div>`
    : `<div class="srow" style="flex-wrap:wrap"><span class="grow">${esc(t(r.label))}</span><b id="sv-${r.key}">${S[r.key]}</b><input type="range" min="${r.min}" max="${r.max}" step="${r.step}" value="${S[r.key]}" data-skey="${r.key}" /></div>`).join('');
}
$('#sRows').addEventListener('input', (e) => { const k = e.target.dataset.skey; if (!k) return; S[k] = Number(e.target.value); $('#sv-' + k).textContent = S[k]; save(); });
$('#sRows').addEventListener('click', (e) => {
  const b = e.target.closest('.toggle[data-skey]'); if (!b) return;
  const k = b.dataset.skey; S[k] = !S[k]; save(); renderSettings();
  if (k === 'auto') onAutoChange();
  if (k === 'mute') { Speech.restartChunk(); updateVoiceTip(); }
});
$('#btnSettings').onclick = () => { renderSettings(); $('#settings').classList.remove('is-hidden'); };
$('#sClose').onclick = () => $('#settings').classList.add('is-hidden');
$('#sReset').onclick = () => { const lang = S.lang; Object.assign(S, DEF, { lang }); save(); renderSettings(); renderTopbar(); };

function onAutoChange() {
  renderTopbar();
  if (S.auto) { App.view === 'lab' ? Run.kick() : Tour.kick(); }
  else { Run.halt(); Tour.halt(); }
  if (App.view === 'lab') { renderBubble(); renderQuiz(); }
}

/* ---------------- 事件綁定 ---------------- */
$$('[data-lang]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); setLang(b.dataset.lang); }));
$('#btnHome').onclick = goHub;
$('#btnAuto').onclick = () => { S.auto = !S.auto; save(); onAutoChange(); toast(S.auto ? t('autoOn') : t('autoOff')); };
$('#btnPause').onclick = () => {
  if (Speech.paused) { Speech.resume(); App.view === 'lab' ? Run.kick() : Tour.kick(); }
  else { Speech.pause(); Run.halt(); Tour.halt(); }
  renderTopbar();
};
$('#btnRead').onclick = () => { App.pointRead = !App.pointRead; document.body.classList.toggle('pointread', App.pointRead); renderTopbar(); toast(App.pointRead ? t('pointReadOn') : t('pointReadOff')); };
$('#btnAdv').onclick = () => { S.adv = !S.adv; save(); renderTopbar(); if (App.view === 'lab') { renderBubble(); lab.labels(); } };
$('#bPrev').onclick = () => Run.prev();
$('#bNext').onclick = () => Run.next();
$('#bRedo').onclick = () => Run.go(Run.i);
$('#fabTools').onclick = () => openTools($('#tools').classList.contains('is-hidden'));
$('#toolsClose').onclick = () => openTools(false);
$('#fabGraph').onclick = () => { Chart.open = !Chart.open; $('#graphPanel').classList.toggle('is-hidden', !Chart.open); $('#fabGraph').classList.toggle('active', Chart.open); Chart.draw(); };
$('#fabReset').onclick = () => { lab.again(); };
$('#fabCam').onclick = defaultView;
$('#pushA').onclick = () => lab.act(['push', 0]);
$('#pushB').onclick = () => lab.act(['push', 1]);
$('#infoClose').onclick = () => Info.hide();
$('#doneHub').onclick = goHub;
$('#doneAgain').onclick = () => { $('#done').classList.add('is-hidden'); Run.score = {}; Run.go(0); };
$('#voiceTipClose').onclick = () => { updateVoiceTip.dismissed = { ...(updateVoiceTip.dismissed || {}), [S.lang]: true }; updateVoiceTip(); };

// 開始：輕按任何地方（同時解鎖 iPad 語音及音效）
function start(muted) {
  Sfx.unlock(); Speech.unlock();
  S.auto = true; S.mute = !!muted; save();
  $('#start').classList.add('is-hidden');
  App.view = 'hub'; renderTopbar(); updateVoiceTip();
  Tour.go(0);
}
$('#start').addEventListener('click', (e) => { if (e.target.closest('[data-noread]')) return; start(false); });
$('#startMuted').addEventListener('click', (e) => { e.stopPropagation(); start(true); });

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); labelRenderer.setSize(innerWidth, innerHeight);
  measure(); Chart.draw();
});
if (window.ResizeObserver) new ResizeObserver(() => measure()).observe($('#bubble'));

/* =====================================================================
 * 10. 啟動 + 每幀
 * ===================================================================== */
const clock = new THREE.Clock();
let uiT = 0;
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (App.view !== 'lab') return;
  lab.update(dt, clock.elapsedTime);
  controls.update();
  uiT += dt;
  if (uiT > 0.1) { uiT = 0; lab.labels(); Chart.draw(); }
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
});

FW.init(); Chart.init(); Speech.init();
stageEl.style.visibility = 'hidden';
applyI18n();
renderTabs();
defaultView();

// 測試用掛鈎（不影響正常使用）
window.__lab = { Run, Speech, Tour, lab, S, App, enterLab, goHub };
