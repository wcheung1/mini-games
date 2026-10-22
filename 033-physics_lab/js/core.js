/* =====================================================================
 * 物理虛擬實驗室 · 核心
 * 語音（主次優先）、教學流程、主頁、圖表、煙花、介面
 * 實驗枱放喺 js/labs/*.js，每個檔案 export default 一個 create(ctx)
 * ===================================================================== */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { TOPICS, BENCHES, HUB_TOUR, ORDER } from './syllabus.js';
import { makeKit, buildWorld } from './kit.js';

const BENCH_FILES = ['track', 'energy', 'play', 'heat', 'waves', 'optics', 'circuits', 'fields', 'atom'];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const QS = new URLSearchParams(location.search);
const FAST = QS.has('fast') ? 0.05 : 1;      // 測試用：加快語音
const TURBO = QS.has('turbo') ? 4 : 1;       // 測試用：加快物理
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
const PROGRESS = store.get('progress', {});
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
    allOpen: '✅ 全部實驗已開放', allTitle: '{n} 個 3D 互動實驗', allDesc: '由科學家工具箱開始，一步步探索熱、力、波、電磁和原子。每個實驗都會自動講解和示範。',
    startAll: '▶ 由頭開始', continueAt: '▶ 繼續：{name}', progress: '已完成 {a} / {b} 個實驗',
    legendDone: '已完成', legendExtra: '⭐ 加料內容', legendMerged: '同一張卡內的項目已合併成一個實驗',
    topicN: '課題 {n}', start: '▶ 開始', covers: '涵蓋', doneBadge: '✅ 已完成',
    prev: '◀ 上一步', next: '下一步 ▶', redo: '🔁 再做', stepOf: '第 {i} / {n} 步', task: '🎯 任務', cond: '📋 實驗條件', chain: '🔗 因果推理',
    taskDone: '做到了！', tools: '🧰 工具', toolsS: '工具', graphS: '圖表', resetS: '重設', camS: '視角', locked: '🔒 保持不變', on: '開', off: '關',
    quizTitle: '🤔 估一估', optN: '第 {n} 個答案：', question: '問題：',
    yourPick: '你揀咗：{x}。我哋做實驗睇吓！', timeUp: '時間到！一齊睇吓答案。',
    correct: '🎉 答對了！', wrong: '💪 差一點點！', timeUpShort: '⏰ 時間到', correctSay: '答啱喇，好叻！', wrongSay: '唔緊要，差少少！',
    watching: '🔬 實驗進行中…', continue: '繼續 ▶',
    advOn: '🔬 進階模式：開（多了公式圖表）', advOff: '🔬 進階模式：關',
    skipPick: '唔估都冇問題，我哋一齊做實驗，睇吓結果係點！', revealShort: '👀 實驗結果', watchWait: '🔬 實驗進行中，請等結果出來',
    finishTitle: '完成「{name}」！', finishStars: '你答對了 {a} / {b} 題', finishSay: '恭喜你完成{name}！你答對咗 {a} 題，總共 {b} 題。',
    nextLesson: '▶ 下一個：{name}', nextIn: '{n} 秒後自動開始', backHub: '🏠 回主頁', playAgain: '🔁 再玩一次',
    settingsTitle: '⚙️ 設定', sRate: '🗣️ 語速', sDemo: '🤖 自動示範前等待（秒）', sThink: '🤔 答題思考時間（秒）', sSfx: '🔔 音效',
    sFw: '🎆 煙花效果', sMute: '🔇 靜音（只顯示字幕）', sAuto: '🤖 自動導覽', sReset: '重設全部設定', sProgress: '清除學習進度', close: '完成',
    voiceTip: '找不到廣東話語音。請在 iPad「設定 → 輔助使用 → 朗讀內容 → 聲音 → 中文（香港）」下載，然後重新載入本頁。',
    noSpeech: '這個瀏覽器不支援語音，會以字幕顯示。', demo: '🤖 自動示範中', xAxis: '時間 t (s)', ghostNote: '虛線＝上一次', crashNote: '橙色虛線＝事件',
    slope: '斜率 ≈ {m}', chan: '陳老師', ming: '小明', because: '因為', so: '所以', board: '黑板',
    chanInfo: '陳老師是物理學家，最喜歡問「為甚麼」。', mingInfo: '小明讀小學四年級，最喜歡動手做實驗。'
  },
  en: {
    appTitle: 'Physics Virtual Lab', appSub: 'A 3D physics playground for kids', home: '🏠 Home',
    autoOn: '🤖 Auto guide: on', autoOff: '🤖 Auto guide: off', pause: '⏸ Pause voice', resume: '▶ Resume',
    pointRead: '👆🔊 Tap-to-read', adv: '🔬 Advanced', settings: '⚙️',
    sayChan: 'Ms Chan is talking', sayMing: 'Ming is talking', sayInfo: 'Reading', sayIdle: 'Quiet', sayPaused: 'Voice paused', queued: ' · {n} waiting',
    waitTeacher: '🕒 Will be read after the teacher finishes', reading: '🔊 Reading', pointReadOn: 'Tap-to-read: tap any text to hear it', pointReadOff: 'Tap-to-read is off',
    tapStart: 'Tap anywhere to start', tapStartSub: 'The teacher will read and demonstrate everything automatically. Just watch and listen.', startMuted: '🔇 Start muted (subtitles only)',
    allOpen: '✅ Every lab is open', allTitle: '{n} interactive 3D labs', allDesc: "Start with the Scientist's Toolkit, then explore heat, forces, waves, electricity and atoms. Every lab explains and demonstrates itself.",
    startAll: '▶ Start from the beginning', continueAt: '▶ Continue: {name}', progress: '{a} of {b} labs finished',
    legendDone: 'Finished', legendExtra: '⭐ Bonus content', legendMerged: 'Items on the same card are combined into one lab',
    topicN: 'Topic {n}', start: '▶ Start', covers: 'Covers', doneBadge: '✅ Finished',
    prev: '◀ Back', next: 'Next ▶', redo: '🔁 Redo', stepOf: 'Step {i} of {n}', task: '🎯 Your task', cond: '📋 Conditions', chain: '🔗 Cause and effect',
    taskDone: 'Done!', tools: '🧰 Tools', toolsS: 'Tools', graphS: 'Graph', resetS: 'Reset', camS: 'View', locked: '🔒 Kept the same', on: 'On', off: 'Off',
    quizTitle: '🤔 Make a guess', optN: 'Option {n}: ', question: 'Question: ',
    yourPick: "You picked: {x}. Let's test it!", timeUp: "Time's up! Let's see the answer.",
    correct: '🎉 Correct!', wrong: '💪 Almost!', timeUpShort: "⏰ Time's up", correctSay: 'Correct, well done!', wrongSay: 'Nice try, almost there!',
    watching: '🔬 Experiment running…', continue: 'Continue ▶',
    advOn: '🔬 Advanced: on (extra formula graphs)', advOff: '🔬 Advanced: off',
    skipPick: "No guess? That's fine. Let's do the experiment and see what happens!", revealShort: "👀 Here's the result", watchWait: '🔬 The experiment is still running. Wait for the result',
    finishTitle: '"{name}" complete!', finishStars: 'You got {a} of {b} questions right', finishSay: 'Congratulations on finishing {name}! You got {a} out of {b} questions right.',
    nextLesson: '▶ Next: {name}', nextIn: 'Starting in {n} s', backHub: '🏠 Back home', playAgain: '🔁 Play again',
    settingsTitle: '⚙️ Settings', sRate: '🗣️ Speech speed', sDemo: '🤖 Wait before auto demo (s)', sThink: '🤔 Thinking time for questions (s)', sSfx: '🔔 Sound effects',
    sFw: '🎆 Fireworks', sMute: '🔇 Mute (subtitles only)', sAuto: '🤖 Auto guide', sReset: 'Reset all settings', sProgress: 'Clear my progress', close: 'Done',
    voiceTip: 'No British English voice found. On iPad, go to Settings → Accessibility → Spoken Content → Voices → English (UK) to download one, then reload this page.',
    noSpeech: "This browser doesn't support speech, so subtitles will be shown.", demo: '🤖 Auto demo', xAxis: 'time t (s)', ghostNote: 'dashed = last run', crashNote: 'orange dashed = event',
    slope: 'slope ≈ {m}', chan: 'Ms Chan', ming: 'Ming', because: 'Because', so: 'so', board: 'Blackboard',
    chanInfo: 'Ms Chan is a physicist who loves asking why.', mingInfo: 'Ming is in Primary 4 and loves doing experiments.'
  }
};
const t = (k) => I18N[S.lang][k] ?? k;
const L = (o) => (o == null ? '' : typeof o === 'string' ? o : (o[S.lang] ?? o.zh));

/* =====================================================================
 * 2. 語音系統（Web Speech API）
 *  主線 main：老師的教學旁白。換階段 → 即刻截斷一切，讀新內容。
 *  支線 side：點物件、點讀、喇叭。老師講緊 → 排隊，等老師講完先讀。
 *  暫停：停止一切聲音和自動流程；繼續：由當句重新開始。
 * ===================================================================== */
const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}️‍⃣]/gu;
function speakable(s, lang) {
  s = String(s).replace(EMOJI, '').replace(/\s*\n+\s*/g, lang === 'zh' ? '，' : ', ');
  const R = lang === 'zh' ? [
    [/T\s*\(°C\)/g, '攝氏溫度'], [/T\s*\(K\)/g, '絕對溫度'], [/\s\+\s/g, ' 加 '], [/∝/g, '成正比於'], [/kJ\/°C/g, '千焦耳每度'], [/J\/g\b/g, '焦耳每克'], [/(\d)\s*K\b/g, '$1 開爾文'],
    [/KE\s*=\s*½mv²/g, '動能等於二分之一 m v 平方'], [/F\s*=\s*Δp\s*\/\s*Δt/g, '力等於動量改變除以時間'], [/F\s*=\s*ma/g, 'F 等於 m a'],
    [/E\s*=\s*mcΔT/g, 'E 等於 m c delta T'], [/E\s*=\s*mL/g, 'E 等於 m L'], [/v\s*=\s*fλ/g, 'v 等於 f 乘 lambda'], [/V\s*=\s*IR/g, 'V 等於 I R'], [/P\s*=\s*VI/g, 'P 等於 V I'],
    [/E\s*=\s*mc²/g, 'E 等於 m c 平方'], [/PE\s*=\s*mgh/g, '勢能等於 m g h'], [/W\s*=\s*Fs/g, '功等於力乘距離'], [/P\s*=\s*W\s*\/\s*t/g, '功率等於功除以時間'],
    [/F\(A→B\)\s*=\s*−F\(B→A\)/g, 'A 推 B 嘅力，等於負 B 推 A 嘅力'], [/Δp_A\s*=\s*−Δp_B/g, 'A 嘅動量改變，等於負 B 嘅動量改變'], [/p_A \+ p_B/g, '兩架車嘅總動量'],
    [/½/g, '二分之一 '], [/²/g, ' 平方'], [/³/g, ' 立方'], [/kg·m\/s/g, '公斤米每秒'], [/m\/s²/g, '米每二次方秒'], [/m\/s/g, '米每秒'], [/N·s/g, '牛頓秒'], [/kWh/g, '度電'],
    [/J\/kg°C/g, '焦耳每公斤每度'], [/J\/kg/g, '焦耳每公斤'], [/kg\/m 平方/g, ''], [/g\/cm 立方/g, '克每立方厘米'], [/°C/g, '度'], [/(\d)°/g, '$1 度'],
    [/(\d)\s*kg/g, '$1 公斤'], [/(\d)\s*kJ\b/g, '$1 千焦耳'], [/(\d)\s*J\b/g, '$1 焦耳'], [/(\d)\s*kW\b/g, '$1 千瓦'], [/(\d)\s*W\b/g, '$1 瓦'], [/(\d)\s*Hz\b/g, '$1 赫茲'],
    [/(\d)\s*mA\b/g, '$1 毫安'], [/(\d)\s*A\b/g, '$1 安培'], [/(\d)\s*V\b/g, '$1 伏特'], [/(\d)\s*Ω/g, '$1 歐姆'], [/(\d)\s*N\b/g, '$1 牛頓'], [/(\d)\s*cm\b/g, '$1 厘米'], [/(\d)\s*m\b/g, '$1 米'], [/(\d)\s*s\b/g, '$1 秒'],
    [/v–t/g, '速度時間'], [/s–t/g, '位置時間'], [/a–t/g, '加速度時間'], [/p–t/g, '動量時間'], [/KE–t/g, '動能時間'], [/T–t/g, '溫度時間'], [/I–V/g, '電流電壓'], [/N–t/g, '數目時間'],
    [/Δp/g, '動量改變'], [/ΔT/g, '溫度改變'], [/Δt/g, '時間'], [/KE/g, '動能'], [/PE/g, '勢能'], [/→/g, '，變成'], [/=/g, '等於'], [/×/g, '乘'], [/÷/g, '除以'],
    [/−(?=\d)/g, '負'], [/\+(?=\d)/g, '正'], [/μ/g, 'mu'], [/λ/g, 'lambda'], [/α/g, '阿爾法'], [/β/g, '貝他'], [/γ/g, '伽瑪'], [/±/g, '正負'], [/≈/g, '大約'], [/(\d)\s*%/g, '百分之$1']
  ] : [
    [/T\s*\(°C\)/g, 'Celsius temperature'], [/T\s*\(K\)/g, 'absolute temperature'], [/\s\+\s/g, ' plus '], [/∝/g, ' is proportional to '], [/kJ\/°C/g, 'kilojoules per degree'], [/J\/g\b/g, 'joules per gram'], [/(\d)\s*K\b/g, '$1 kelvin'],
    [/KE\s*=\s*½mv²/g, 'K E equals half m v squared'], [/F\s*=\s*Δp\s*\/\s*Δt/g, 'F equals change in momentum divided by time'], [/F\s*=\s*ma/g, 'F equals m a'],
    [/E\s*=\s*mcΔT/g, 'E equals m c delta T'], [/E\s*=\s*mL/g, 'E equals m L'], [/v\s*=\s*fλ/g, 'v equals f lambda'], [/V\s*=\s*IR/g, 'V equals I R'], [/P\s*=\s*VI/g, 'P equals V I'],
    [/E\s*=\s*mc²/g, 'E equals m c squared'], [/PE\s*=\s*mgh/g, 'P E equals m g h'], [/W\s*=\s*Fs/g, 'work equals force times distance'], [/P\s*=\s*W\s*\/\s*t/g, 'power equals work divided by time'],
    [/F\(A→B\)\s*=\s*−F\(B→A\)/g, 'the force of A on B equals minus the force of B on A'], [/Δp_A\s*=\s*−Δp_B/g, "the change in A's momentum equals minus the change in B's momentum"],
    [/p_A \+ p_B/g, 'the total momentum'], [/½/g, 'half '], [/²/g, ' squared'], [/³/g, ' cubed'], [/kg·m\/s/g, 'kilogram metres per second'], [/m\/s²/g, 'metres per second squared'], [/m\/s/g, 'metres per second'],
    [/N·s/g, 'newton seconds'], [/kWh/g, 'kilowatt hours'], [/J\/kg°C/g, 'joules per kilogram per degree'], [/J\/kg/g, 'joules per kilogram'], [/g\/cm³/g, 'grams per cubic centimetre'], [/°C/g, ' degrees'], [/(\d)°/g, '$1 degrees'],
    [/(\d)\s*kg/g, '$1 kilograms'], [/(\d)\s*kJ\b/g, '$1 kilojoules'], [/(\d)\s*J\b/g, '$1 joules'], [/(\d)\s*kW\b/g, '$1 kilowatts'], [/(\d)\s*W\b/g, '$1 watts'], [/(\d)\s*Hz\b/g, '$1 hertz'],
    [/(\d)\s*mA\b/g, '$1 milliamps'], [/(\d)\s*A\b/g, '$1 amps'], [/(\d)\s*V\b/g, '$1 volts'], [/(\d)\s*Ω/g, '$1 ohms'], [/(\d)\s*N\b/g, '$1 newtons'], [/(\d)\s*cm\b/g, '$1 centimetres'], [/(\d)\s*m\b/g, '$1 metres'], [/(\d)\s*s\b/g, '$1 seconds'],
    [/–t\b/g, '-time'], [/I–V/g, 'current-voltage'], [/Δp/g, 'change in momentum'], [/ΔT/g, 'temperature change'], [/Δt/g, 'time'], [/\bKE\b/g, 'K E'], [/\bPE\b/g, 'P E'], [/→/g, ' to '],
    [/=/g, ' equals '], [/×/g, ' times '], [/÷/g, ' divided by '], [/−(?=\d)/g, 'minus '], [/\+(?=\d)/g, 'plus '], [/μ/g, 'mu'], [/λ/g, 'lambda'], [/α/g, 'alpha'], [/β/g, 'beta'], [/γ/g, 'gamma'],
    [/±/g, 'plus or minus '], [/≈/g, 'about '], [/(\d)\s*%/g, '$1 percent']
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
  say(get, onDone, who = null) {
    this.cutAll();
    this.main = { get, chunks: this.prep(get), i: 0, onDone, who, kind: 'main' };
    this.pump();
  },
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
  relang() {
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
  ac: null, lastBoom: 0, toneNode: null,
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
  // 實驗用：播放一段純音（聲音實驗）
  sound(freq, vol = 0.1, dur = 1.5) {
    if (!this.ac) return;
    try { this.tone(freq, this.ac.currentTime, dur, 'sine', Math.max(0.0002, Math.min(0.25, vol))); } catch (_) {}
  },
  play(name) {
    if (!S.sfx || !this.ac) return;
    const t0 = this.ac.currentTime;
    try {
      if (name === 'pop') this.tone(660, t0, 0.09, 'triangle', 0.05);
      else if (name === 'tick') this.tone(440, t0, 0.05, 'square', 0.02);
      else if (name === 'click') this.tone(1800, t0, 0.03, 'square', 0.03);
      else if (name === 'crash') this.noise(t0, 0.14, 0.09, 1400);
      else if (name === 'splash') this.noise(t0, 0.3, 0.06, 700);
      else if (name === 'zap') { this.tone(900, t0, 0.08, 'sawtooth', 0.03); this.tone(400, t0 + 0.05, 0.1, 'sawtooth', 0.03); }
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
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(0, 0, innerWidth, innerHeight);
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
  world.cheer();
  const c = $('#cheer'); c.textContent = text; c.classList.remove('go'); void c.offsetWidth; c.classList.add('go');
}

/* =====================================================================
 * 4. 3D 引擎（Three.js）+ iPad 手勢 + 實驗室房間
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
scene.fog = new THREE.Fog(0xdbeafe, 34, 64);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.05, 200);
scene.add(new THREE.HemisphereLight(0xffffff, 0x94a3b8, 1.6));
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(6, 12, 8); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 40 });
sun.shadow.camera.updateProjectionMatrix(); scene.add(sun);

const kit = makeKit(THREE, CSS2DObject);
const world = buildWorld(THREE, kit, scene);

/* ---------------- 載入所有實驗枱 ---------------- */
const BENCH = {};       // id → 實驗枱
const LESSONS = {};     // id → 實驗單元
const Cam = { tw: null, key: null }; // 鏡頭動畫（近看／返回全景）
function makeCtx(id) {
  const root = new THREE.Group(); root.visible = false; scene.add(root);
  return {
    THREE, CSS2DObject, kit, scene, camera, root, id,
    lang: () => S.lang, adv: () => S.adv,
    emit: (type, d) => Run.onEvent(type, d || {}),
    info: (key, tg, xg) => Info.show(key, tg, xg),
    sfx: (n) => Sfx.play(n),
    sound: (f, v, d) => Sfx.sound(f, v, d),
    toast: (x) => toast(L(x)),
    cheer: () => world.cheer(),
    speaker: () => { const w = Speech.who(); return w === 'chan' || w === 'ming' ? w : null; },
    renderTools: () => renderTools(),
    focus: (view, key) => focusView(view, key), // 鏡頭慢慢移去近看 view={pos,target}；null＝返回全景
    focusKey: () => Cam.key
  };
}
const loaded = await Promise.all(BENCH_FILES.map((f) => import(`./labs/${f}.js`).then((m) => [f, m.default]).catch((e) => { console.error('bench failed', f, e); return [f, null]; })));
for (const [f, create] of loaded) {
  if (!create) continue;
  try {
    const ctx = makeCtx(f);
    const b = create(ctx);
    b.root = ctx.root; b.key = f;
    b.mount();
    BENCH[f] = b;
    for (const ls of b.lessons) { ls.bench = b; LESSONS[ls.id] = ls; }
  } catch (e) { console.error('bench error', f, e); }
}
const ORDERED = ORDER.filter((id) => LESSONS[id]).concat(Object.keys(LESSONS).filter((id) => !ORDER.includes(id)));

// 觸控：手指落在物件上 → 交給實驗枱；落在空白 → 旋轉視角
const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();
const setRay = (e) => { const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); raycaster.setFromCamera(ndc, camera); return raycaster; };
const pointers = new Set(); let captured = null, tapStart = null, controls;
const bench = () => Run.lab;
canvas.addEventListener('pointerdown', (e) => {
  if (e.isPrimary) pointers.clear();
  pointers.add(e.pointerId);
  if (pointers.size > 1) { tapStart = null; return; }
  if (captured !== null || App.view !== 'lab' || !bench()) return;
  tapStart = { x: e.clientX, y: e.clientY, t: performance.now() };
  Cam.tw = null; // 手指一郁就停咗鏡頭動畫
  if (bench().pointerDown && bench().pointerDown(e, setRay(e))) { captured = e.pointerId; controls.enabled = false; try { canvas.setPointerCapture(e.pointerId); } catch (_) {} }
}, { capture: true });
canvas.addEventListener('pointermove', (e) => { if (captured === e.pointerId && bench().pointerMove) bench().pointerMove(e, setRay(e)); });
const pUp = (e) => {
  pointers.delete(e.pointerId);
  if (captured === e.pointerId) { captured = null; controls.enabled = true; if (bench().pointerUp) bench().pointerUp(e, setRay(e)); tapStart = null; return; }
  if (tapStart && e.type === 'pointerup' && Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y) < 10 && performance.now() - tapStart.t < 450) {
    const ray = setRay(e);
    if (!(bench().tap && bench().tap(ray))) worldTap(ray);
  }
  tapStart = null;
};
canvas.addEventListener('pointerup', pUp); canvas.addEventListener('pointercancel', pUp);
function worldTap(ray) {
  const hits = ray.intersectObjects(world.pickables.map((q) => q.obj), false);
  if (!hits.length) return;
  const h = world.pickables.find((q) => q.obj === hits[0].object);
  if (h.kind === 'person') { world.wave(h.id); Info.show(h.id, () => t(h.id), () => t(h.id + 'Info')); }
  else if (h.kind === 'board' && curBoard()) Info.show('board', () => t('board'), () => L(curBoard().info) || curBoard().lines.map(L).join('；'));
}

controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.minDistance = 2.5; controls.maxDistance = 34; controls.maxPolarAngle = Math.PI * 0.49;
controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
controls.addEventListener('change', () => { const tg = controls.target; tg.set(THREE.MathUtils.clamp(tg.x, -14, 14), THREE.MathUtils.clamp(tg.y, 0, 6), THREE.MathUtils.clamp(tg.z, -8, 8)); });
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('dblclick', (e) => e.preventDefault());
function homeView() {
  const ls = Run.lesson, b = Run.lab; if (!b) return null;
  const c = (Run.st && Run.st.camera) || (ls && ls.camera) || b.camera;
  const d = innerWidth / innerHeight < 1 ? 1.7 : 1.1;
  return { pos: [0, 1, 2].map((i) => c.target[i] + (c.pos[i] - c.target[i]) * d), target: c.target };
}
// animate：用動畫慢慢移返去；否則即刻跳
function defaultView(animate = false) {
  const v = homeView(); if (!v) return;
  const had = Cam.key; Cam.key = null;
  if (animate) tweenCam(v.pos, v.target);
  else { Cam.tw = null; camera.position.set(...v.pos); controls.target.set(...v.target); controls.update(); }
  if (had) renderTools();
}
function tweenCam(pos, target, dur = 0.9) {
  Cam.tw = { p0: camera.position.clone(), t0: controls.target.clone(), p1: new THREE.Vector3(...pos), t1: new THREE.Vector3(...target), s: 0, dur };
}
// 近看：實驗枱用 ctx.focus({pos,target}, key)；null＝返回全景
function focusView(view, key) {
  if (!view) { if (Cam.key) defaultView(true); return; }
  const d = innerWidth / innerHeight < 1 ? 1.45 : 1;
  const pos = view.pos.map((v, i) => view.target[i] + (v - view.target[i]) * d);
  // 下面有對話框同圖表：將鏡頭向下移少少，令想睇嘅嘢喺畫面中上位置
  const dist = Math.hypot(...pos.map((v, i) => v - view.target[i])), sh = dist * Math.tan((camera.fov * Math.PI) / 360) * 0.12;
  pos[1] -= sh; const target = [view.target[0], view.target[1] - sh, view.target[2]];
  Cam.key = key || 'focus'; tweenCam(pos, target); renderTools();
}
function stepCam(dt) {
  const w = Cam.tw; if (!w) return;
  w.s = Math.min(1, w.s + dt / w.dur);
  const e = w.s < 0.5 ? 2 * w.s * w.s : 1 - Math.pow(-2 * w.s + 2, 2) / 2;
  camera.position.lerpVectors(w.p0, w.p1, e); controls.target.lerpVectors(w.t0, w.t1, e);
  if (w.s >= 1) Cam.tw = null;
}

/* =====================================================================
 * 5. 圖表（時間圖 / x–y 圖 / 散點圖 + 最佳直線）
 * ===================================================================== */
function niceStep(span, n) { const raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p; }
function ticks(lo, hi, n) { const st = niceStep(hi - lo || 1, n), out = []; for (let v = Math.ceil(lo / st - 1e-9) * st; v <= hi + 1e-9; v += st) out.push(+v.toFixed(6)); return out; }
const fmtTick = (v) => { const a = Math.abs(v); const s = a < 1e-9 ? '0' : a >= 1000 ? String(Math.round(v)) : a >= 10 || Number.isInteger(v) ? String(Math.round(v * 10) / 10) : a >= 0.1 ? v.toFixed(1) : v.toFixed(2); return s.replace('-', '−'); };
const Chart = {
  cv: null, tab: null, hover: null, open: true, hoverT: null, lastLegend: '',
  init() {
    this.cv = $('#chart');
    const set = (e) => { const r = this.cv.getBoundingClientRect(); this.hover = e.clientX - r.left; clearTimeout(this.hoverT); this.draw(); };
    this.cv.addEventListener('pointerdown', set); this.cv.addEventListener('pointermove', set);
    const clear = () => { this.hoverT = setTimeout(() => { this.hover = null; this.draw(); }, 1500); };
    this.cv.addEventListener('pointerup', clear); this.cv.addEventListener('pointerleave', clear);
  },
  // adv:true 的圖表只在「進階」模式顯示
  defs() { const ls = Run.lesson; return ls ? (ls.graphs || []).map((id) => Run.lab.graphs.find((g) => g.id === id)).filter((g) => g && (!g.adv || S.adv)) : []; },
  setTab(id) { if (this.defs().some((d) => d.id === id)) this.tab = id; renderTabs(); this.draw(); },
  draw() {
    const cv = this.cv; if (!cv || !this.open || App.view !== 'lab' || !Run.lab) return;
    const def = this.defs().find((d) => d.id === this.tab); if (!def) return;
    const dpr = Math.min(devicePixelRatio, 2), W = cv.clientWidth, Hh = cv.clientHeight; if (!W || !Hh) return;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(Hh * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr); }
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, Hh);
    const pad = { l: 42, r: 70, t: 20, b: 30 }, pw = W - pad.l - pad.r, ph = Hh - pad.t - pad.b;
    const mode = def.mode || 'time';
    const sets = []; let ev = [], x0, x1, xTitle;
    if (mode === 'time') {
      const H = Run.lab.hist(), G = Run.lab.ghost ? Run.lab.ghost() : null;
      const tMax = H.t.length ? H.t[H.t.length - 1] : 0, gMax = G && G.t.length ? G.t[G.t.length - 1] : 0;
      const span = def.span || 12;
      x1 = Math.max(def.minSpan || 4, tMax, Math.min(gMax, span)); x0 = Math.max(0, x1 - span);
      for (const [k, name, color, o = {}] of def.series) {
        if (G && G.c[k] && !o.dash) sets.push({ xs: G.t, ys: G.c[k], color, ghost: true });
        sets.push({ xs: H.t, ys: H.c[k], color, name, k, w: def.total === k ? 2.6 : 2, dash: !!o.dash });
      }
      ev = H.ev || []; xTitle = (def.x ? L(def.x) : t('xAxis'));
    } else {
      const D = def.data();
      for (const [k, name, color, o = {}] of def.series) {
        if (D.ghost && D.ghost.c[k]) sets.push({ xs: D.ghost.x, ys: D.ghost.c[k], color, ghost: true });
        if (mode === 'scatter') sets.push({ pts: (D.pts && D.pts[k]) || [], color, name, k, fit: o.fit !== false });
        else sets.push({ xs: (D.xk && D.xk[k]) || D.x, ys: D.c[k], color, name, k, w: def.total === k ? 2.6 : 2, dash: !!o.dash }); // D.xk：個別系列用自己的 x
      }
      const allX = sets.flatMap((s) => (s.pts ? s.pts.map((p) => p[0]) : s.xs)).filter(Number.isFinite);
      if (def.xRange) [x0, x1] = def.xRange;
      else { x0 = mode === 'scatter' ? 0 : Math.min(...allX, 0); x1 = Math.max(...allX, x0 + 1) * (mode === 'scatter' ? 1.15 : 1); }
      xTitle = L(def.x);
    }
    let lo = Infinity, hi = -Infinity;
    for (const s of sets) {
      if (s.pts) s.pts.forEach((p) => { lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]); });
      else for (let i = 0; i < s.ys.length; i++) { if (s.xs[i] < x0 || s.xs[i] > x1) continue; const v = s.ys[i]; if (Number.isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }
    }
    if (def.fixed) [lo, hi] = def.fixed;
    else if (def.sym) { const m = Math.max(Math.abs(lo) || 0, Math.abs(hi) || 0, def.min || 1) * 1.15; lo = -m; hi = m; }
    else { hi = Math.max((Number.isFinite(hi) ? hi : 0) * 1.15, def.min || 1); lo = def.zero !== false ? Math.min(0, Number.isFinite(lo) ? lo * 1.15 : 0) : (Number.isFinite(lo) ? lo : 0); }
    const yt = ticks(lo, hi, 4); lo = Math.min(lo, yt[0]); hi = Math.max(hi, yt[yt.length - 1]);
    const X = (v) => pad.l + ((v - x0) / (x1 - x0 || 1)) * pw, Y = (v) => pad.t + ((hi - v) / (hi - lo || 1)) * ph;
    g.font = '11px -apple-system, system-ui, sans-serif'; g.lineWidth = 1;
    g.textAlign = 'right'; g.textBaseline = 'middle';
    for (const v of yt) { const y = Y(v); g.strokeStyle = Math.abs(v) < 1e-9 ? '#94a3b8' : '#e2e8f0'; g.lineWidth = Math.abs(v) < 1e-9 ? 1.5 : 1; g.beginPath(); g.moveTo(pad.l, y); g.lineTo(pad.l + pw, y); g.stroke(); g.fillStyle = '#64748b'; g.fillText(fmtTick(v), pad.l - 5, y); }
    g.textAlign = 'center'; g.textBaseline = 'top';
    for (const v of ticks(x0, x1, 6)) { if (v < x0 - 1e-6) continue; const x = X(v); g.strokeStyle = '#f1f5f9'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, pad.t); g.lineTo(x, pad.t + ph); g.stroke(); g.fillStyle = '#64748b'; g.fillText(fmtTick(v), x, pad.t + ph + 5); }
    g.strokeStyle = '#475569'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(pad.l, pad.t); g.lineTo(pad.l, pad.t + ph); g.lineTo(pad.l + pw, pad.t + ph); g.stroke();
    g.fillStyle = '#334155'; g.font = '700 11px -apple-system, system-ui, sans-serif';
    g.textAlign = 'left'; g.textBaseline = 'bottom'; g.fillText('↑ ' + L(def.y), pad.l - 4, pad.t - 5);
    g.textAlign = 'right'; g.textBaseline = 'bottom'; g.fillText(xTitle + ' →', W - 2, Hh - 2);
    g.save(); g.beginPath(); g.rect(pad.l, pad.t - 3, pw, ph + 6); g.clip();
    for (const e of ev) { if (e.t < x0) continue; const x = X(e.t); g.strokeStyle = '#f59e0b'; g.lineWidth = 1.5; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(x, pad.t); g.lineTo(x, pad.t + ph); g.stroke(); g.setLineDash([]); }
    const fits = [];
    for (const s of sets) {
      if (s.pts) {
        g.fillStyle = s.color;
        for (const [px, py] of s.pts) { g.beginPath(); g.arc(X(px), Y(py), 5, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); }
        if (def.fit && s.fit && s.pts.length >= 2) {
          let sxy = 0, sxx = 0; s.pts.forEach(([a, b]) => { sxy += a * b; sxx += a * a; });
          const m = sxy / (sxx || 1); fits.push({ m, color: s.color });
          g.strokeStyle = s.color; g.lineWidth = 1.5; g.setLineDash([6, 4]); g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(x1), Y(m * x1)); g.stroke(); g.setLineDash([]);
        }
        continue;
      }
      g.strokeStyle = s.color; g.lineWidth = s.w || 2; g.globalAlpha = s.ghost ? 0.4 : 1; g.setLineDash(s.ghost ? [5, 4] : s.dash ? [8, 5] : []); g.lineJoin = 'round';
      g.beginPath(); let pen = false;
      for (let i = 0; i < s.ys.length; i++) { const xv = s.xs[i], v = s.ys[i]; if (xv < x0 || xv > x1 + 1e-9 || !Number.isFinite(v)) { pen = false; continue; } const x = X(xv), y = Y(v); if (pen) g.lineTo(x, y); else { g.moveTo(x, y); pen = true; } }
      g.stroke(); g.globalAlpha = 1; g.setLineDash([]);
    }
    g.restore();
    // 線尾直接標示
    g.font = '700 11px -apple-system, system-ui, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle';
    const labs = sets.filter((s) => !s.ghost && !s.pts && s.ys.length).map((s) => {
      let i = s.ys.length - 1; while (i >= 0 && !Number.isFinite(s.ys[i])) i--;
      return i < 0 ? null : { s, v: s.ys[i], y: Math.min(Math.max(Y(s.ys[i]), pad.t), pad.t + ph) };
    }).filter(Boolean).sort((a, b) => a.y - b.y);
    for (let i = 1; i < labs.length; i++) if (labs[i].y - labs[i - 1].y < 14) labs[i].y = labs[i - 1].y + 14;
    for (const o of labs) { g.fillStyle = o.s.color; g.beginPath(); g.arc(pad.l + pw + 7, o.y, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = '#334155'; g.fillText(`${L(o.s.name)} ${fmtTick(Math.round(o.v * 100) / 100)}`, pad.l + pw + 14, o.y); }
    fits.forEach((fi, k) => { const s = fmt(L(def.slope) || t('slope'), { m: fi.m.toFixed(2) }), y = pad.t + 10 + k * 15; g.fillStyle = 'rgba(255,255,255,.88)'; g.fillRect(pad.l + 4, y - 7, g.measureText(s).width + 8, 14); g.fillStyle = fi.color; g.fillText(s, pad.l + 8, y); });
    // 十字線
    const base = sets.find((s) => !s.ghost && !s.pts && s.xs && s.xs.length);
    if (this.hover != null && base && this.hover >= pad.l && this.hover <= pad.l + pw) {
      const xv = x0 + ((this.hover - pad.l) / pw) * (x1 - x0), xs = base.xs;
      let i = 0, j = xs.length - 1; while (i < j) { const m = (i + j) >> 1; if (xs[m] < xv) i = m + 1; else j = m; }
      const x = X(xs[i]);
      g.strokeStyle = '#64748b'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, pad.t); g.lineTo(x, pad.t + ph); g.stroke();
      const rows = [`${mode === 'time' ? 't' : 'x'} = ${xs[i].toFixed(2)}`, ...sets.filter((s) => !s.ghost && !s.pts && s.xs === xs && Number.isFinite(s.ys[i])).map((s) => `${L(s.name)}: ${s.ys[i].toFixed(2)}`)];
      const bw = Math.max(...rows.map((r) => g.measureText(r).width)) + 14, bh = rows.length * 15 + 8;
      const bx = Math.min(x + 8, pad.l + pw - bw), by = pad.t + 4;
      g.fillStyle = 'rgba(15,23,42,.88)'; g.beginPath(); g.roundRect ? g.roundRect(bx, by, bw, bh, 6) : g.rect(bx, by, bw, bh); g.fill();
      g.fillStyle = '#fff'; g.textAlign = 'left'; g.textBaseline = 'top';
      rows.forEach((r, k) => g.fillText(r, bx + 7, by + 5 + k * 15));
    }
    const legend = def.series.map(([, name, color, o = {}]) => `<span><i class="sw" style="background:${o.dash ? `repeating-linear-gradient(90deg,${color} 0 5px,transparent 5px 8px)` : color}"></i>${esc(L(name))}</span>`).join('')
      + (sets.some((s) => s.ghost) ? `<span>┄ ${esc(t('ghostNote'))}</span>` : '') + (ev.length ? `<span style="color:#b45309">┆ ${esc(L(def.evNote) || t('crashNote'))}</span>` : '');
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
  c.querySelectorAll('.spk, button[data-noread], .no-tts, canvas, input').forEach((n) => n.remove());
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
  if (r === 'graph') return Speech.sideSay(() => (Run.lab.describeGraph ? Run.lab.describeGraph(Chart.tab) : '') || readable($('#graphPanel')), 'graph');
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
  $('#brandSub').textContent = lab && Run.lesson ? L(Run.lesson.title) : t('appSub');
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
 * 7. 主頁（課程大綱 → 實驗單元 + 導覽）
 * ===================================================================== */
const ITEM_NAME = {};
TOPICS.forEach((tp) => tp.subs.forEach((sb) => sb.items.forEach(([n, zh, en]) => (ITEM_NAME[n] = { zh, en }))));
const itemTarget = new Map(); // 項目 → { lesson, stage }
for (const id of ORDERED) {
  const ls = LESSONS[id];
  (ls.items || []).forEach((n) => { if (!itemTarget.has(n)) itemTarget.set(n, { lesson: id, stage: 0 }); });
  ls.stages.forEach((st, i) => (st.items || []).forEach((n) => { const cur = itemTarget.get(n); if (cur && cur.lesson === id && cur.stage === 0 && i > 0) cur.stage = i; }));
}
function renderHub() {
  let html = '';
  for (const tp of TOPICS) {
    html += `<section class="topic panel" id="topic-${tp.id}" style="--tc:${tp.color}">
      <header class="topic-h"><span class="ticon">${tp.icon}</span><div class="flex-1"><div class="tnum">${esc(fmt(t('topicN'), { n: tp.id }))}</div><h2>${esc(L(tp.name))}</h2><p class="tdesc">${esc(L(tp.desc))}</p></div>
      <button class="spk" data-read="#topic-${tp.id} .topic-h" aria-label="read">🔊</button></header>`;
    for (const sb of tp.subs) {
      const lessons = ORDERED.map((id) => LESSONS[id]).filter((ls) => (ls.subs || []).includes(sb.id));
      html += `<div class="sub"><div class="sub-h"><b>${sb.id} ${esc(L(sb.name))}</b></div>`;
      const shown = new Set();
      for (const ls of lessons) {
        const its = sb.items.filter(([n]) => (ls.items || []).includes(n));
        its.forEach(([n]) => shown.add(n));
        const done = PROGRESS[ls.id];
        html += `<div class="lcard ${done ? 'done' : ''}" data-lesson="${ls.id}">
          <div class="lc-h"><span class="lc-i">${ls.icon}</span><div class="flex-1"><b>${esc(L(ls.title))}</b><div class="lc-d">${esc(L(ls.desc))}</div>
          <div class="lc-m"><span class="pill bench">${(BENCHES[ls.bench.key] || { icon: '🔬' }).icon} ${esc(L(BENCHES[ls.bench.key] || { zh: ls.bench.key, en: ls.bench.key }))}</span>${done ? `<span class="pill" style="background:#dcfce7;color:#166534">${esc(t('doneBadge'))} ${'⭐'.repeat(done)}</span>` : ''}</div></div>
          <button class="btn btn-primary btn-sm" data-start="${ls.id}">${esc(t('start'))}</button></div>
          ${its.length ? `<ul>${its.map(([n, zh, en]) => `<li class="item open" data-item="${n}"><span class="num">${typeof n === 'string' ? '⭐' : n}</span><span class="nm">${esc(S.lang === 'zh' ? zh : en)}</span></li>`).join('')}</ul>` : ''}
        </div>`;
      }
      const rest = sb.items.filter(([n]) => !shown.has(n));
      if (rest.length) html += `<ul>${rest.map(([n, zh, en]) => { const tg = itemTarget.get(n); return `<li class="item ${tg ? 'open' : 'locked'}" data-item="${n}"><span class="num">${typeof n === 'string' ? '⭐' : n}</span><span class="nm">${esc(S.lang === 'zh' ? zh : en)}</span><span>${tg ? '↗' : '🔒'}</span></li>`; }).join('')}</ul>`;
      html += '</div>';
    }
    html += '</section>';
  }
  $('#topics').innerHTML = html;
  const n = ORDERED.length, nd = ORDERED.filter((id) => PROGRESS[id]).length;
  $('#fTag').textContent = t('allOpen');
  $('#fTitle').textContent = fmt(t('allTitle'), { n });
  $('#fDesc').textContent = t('allDesc');
  $('#openCount').textContent = fmt(t('progress'), { a: nd, b: n });
  const nextId = ORDERED.find((id) => !PROGRESS[id]);
  $('#fStart').textContent = nd && nextId ? fmt(t('continueAt'), { name: L(LESSONS[nextId].title) }) : t('startAll');
  $('#fStart').dataset.lesson = nextId || ORDERED[0];
  Tour.render();
}
$('#topics').addEventListener('click', (e) => {
  const st = e.target.closest('[data-start]');
  if (st) { Sfx.unlock(); enterLesson(st.dataset.start, 0); return; }
  const li = e.target.closest('.item');
  if (li) {
    const raw = li.dataset.item, n = /^\d+$/.test(raw) ? +raw : raw, tg = itemTarget.get(n);
    if (tg) { Sfx.unlock(); enterLesson(tg.lesson, tg.stage); }
    return;
  }
  const card = e.target.closest('.lcard'); if (card) { Sfx.unlock(); enterLesson(card.dataset.lesson, 0); }
});

const Tour = {
  i: 0, tok: 0, timer: null, done: false,
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
    else this.timer = setTimeout(() => tok === this.tok && enterLesson($('#fStart').dataset.lesson, 0), 900 * FAST);
  },
  halt() { clearTimeout(this.timer); },
  replay() { this.go(this.i); }
};
$('#hPrev').onclick = () => Tour.go(Tour.i - 1);
$('#hNext').onclick = () => (Tour.i < HUB_TOUR.length - 1 ? Tour.go(Tour.i + 1) : enterLesson($('#fStart').dataset.lesson, 0));
$('#fStart').onclick = () => { Sfx.unlock(); enterLesson($('#fStart').dataset.lesson, 0); };

/* =====================================================================
 * 8. 實驗室教學流程（Run）
 *  換階段 → Speech.say() 截斷舊語音
 *  完成任務 / 答題 → 推進（同樣截斷）
 *  自動導覽：講完 → 自動示範 → 自動下一步；問題會倒數，時間到就揭曉
 * ===================================================================== */
const WATCH_AFTER = 3, WATCH_MIN = 6; // 答完之後：實驗做完最少再睇 3 秒；由答題到揭曉最少 6 秒
const Run = {
  lab: null, lesson: null, i: 0, st: null, tok: 0, timers: [], autoT: null, narrDone: false, goalDone: false, demoRunning: false, demoDone: false,
  quiz: null, locks: new Set(), score: {}, enteredAt: 0, toolsByDemo: false,
  later(sec, fn) { const tok = this.tok; const id = setTimeout(() => { if (tok === this.tok) fn(); }, sec * 1000); this.timers.push(id); return id; },
  clear() { this.tok++; this.timers.forEach(clearTimeout); this.timers = []; this.autoT = null; this.demoRunning = false; showDemo(false); stopNextCountdown(); },
  go(i) {
    this.clear();
    const stages = this.lesson.stages;
    this.i = Math.max(0, Math.min(i, stages.length - 1));
    const st = this.st = stages[this.i];
    this.narrDone = false; this.goalDone = false; this.demoDone = false; this.enteredAt = performance.now();
    this.quiz = st.quiz ? { phase: 'ask', pick: null, correct: null, revealSaid: false, skipped: false } : null;
    Info.hide(); $('#done').classList.add('is-hidden');
    if (this.toolsByDemo) { openTools(false); this.toolsByDemo = false; }
    if (st.setup) this.lab.apply({ ...(this.lesson.base || {}), ...st.setup });
    this.locks = new Set(st.lock || []);
    renderTools(); if (st.graph) Chart.setTab(st.graph);
    if (S.adv && st.advGraph) Chart.setTab(st.advGraph); // 進階模式：自動打開對應公式的圖表
    if (st.camera || this.camStage) defaultView();
    else if (Cam.key) defaultView(true); // 換步驟：由近看慢慢返回全景
    this.camStage = !!st.camera;
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
  next() {
    const q = this.quiz;
    // 估一估：唔揀答案都要做完個實驗、睇到結果，先可以去下一步
    if (q && q.phase === 'ask') return this.answer(null, true);
    if (q && q.phase === 'watch') { toast(t('watchWait')); return; }
    if (this.i < this.lesson.stages.length - 1) this.go(this.i + 1); else this.finish();
  },
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
      if (now < last) start = now;
      last = now;
      if (now - start >= sec) return;
      await sleep(80);
    }
  },
  async waitFor(ev, maxSec) { // 等某個事件（最多 maxSec 模擬秒）
    const tok = this.tok; this.waiting = { ev, hit: false };
    let start = this.lab.simTime(), last = start;
    while (tok === this.tok && !this.waiting.hit) { const now = this.lab.simTime(); if (now < last) start = now; last = now; if (now - start >= maxSec) break; await sleep(80); }
  },
  async actions(list, demo = false) {
    if (!list) return;
    const tok = this.tok;
    if (demo) { this.demoRunning = true; showDemo(true); }
    for (const a of list) {
      if (tok !== this.tok) return;
      if (a[0] === 'wait') await this.waitSim(a[1]);
      else if (a[0] === 'until') await this.waitFor(a[1], a[2] ?? 10);
      else if (a[0] === 'openTools') { if ($('#tools').classList.contains('is-hidden')) { openTools(true); this.toolsByDemo = true; } }
      else if (a[0] === 'set') { this.lab.setParam(a[1], a[2]); renderTools(a[1]); this.onEvent('param', { key: a[1], value: a[2] }); await sleep(150); }
      else if (a[0] === 'again') { this.lab.again(); await sleep(100); }
      else {
        const pos = this.lab.screenPos ? this.lab.screenPos(a) : null;
        if (pos && App.view === 'lab') await ghostTap(pos);
        if (tok !== this.tok) return;
        this.lab.act(a);
        await sleep(120);
      }
    }
    if (tok === this.tok && demo) { this.demoRunning = false; showDemo(false); }
  },
  onEvent(type, d = {}) {
    if (this.waiting && this.waiting.ev === type) this.waiting.hit = true;
    if (type === 'param' || type === 'refresh') renderTools();
    const st = this.st;
    if (App.view !== 'lab' || !st || !st.goal || this.goalDone) return;
    if (performance.now() - this.enteredAt < 250) return;
    const g = st.goal;
    if (g.type !== type) return;
    if (g.id != null && d.id !== g.id) return;
    if (g.test && !g.test(d)) return;
    this.goalDone = true; this.halt(); renderStage();
    toast('✅ ' + t('taskDone')); Sfx.play('correct');
    this.later(st.settle ?? 1.6, () => this.next());
  },
  // skipped：撳咗「下一步」而冇揀答案
  answer(k, skipped = false) {
    const q = this.quiz; if (!q || q.phase !== 'ask') return;
    this.halt();
    const st = this.st, Q = st.quiz;
    q.pick = k; q.correct = k === Q.ans; q.skipped = skipped && k == null;
    if (k != null && !(st.id in this.score)) this.score[st.id] = q.correct;
    if (Q.run) {
      q.phase = 'watch'; renderQuiz(); renderStage();
      Speech.say(() => (q.pick == null ? t(q.skipped ? 'skipPick' : 'timeUp') : fmt(t('yourPick'), { x: L(Q.opts[q.pick]) })), null, st.who);
      this.watchRun(Q);
    } else this.reveal();
  },
  // 做實驗：run 做完（通常 run 入面有 ['until', 結果事件]）→ 再睇 watch 秒 → 再保證有足夠時間睇清楚，先揭曉
  async watchRun(Q) {
    const tok = this.tok, t0 = performance.now();
    await this.actions(Q.run); if (tok !== this.tok) return;
    const t1 = performance.now();
    await this.waitSim(Q.watch ?? 2.4); if (tok !== this.tok) return;
    const now = performance.now();
    const more = Math.max(WATCH_AFTER * 1000 - (now - t1), WATCH_MIN * 1000 - (now - t0)) / TURBO;
    if (more > 0) await sleep(more);
    if (tok === this.tok) this.reveal();
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
    const ls = this.lesson, ans = Object.values(this.score), total = ls.stages.filter((s) => s.quiz).length, ok = ans.filter(Boolean).length;
    const stars = total ? Math.max(1, Math.round((ok / total) * 3)) : 3;
    PROGRESS[ls.id] = Math.max(PROGRESS[ls.id] || 0, stars); store.set('progress', PROGRESS);
    renderDone();
    $('#done').classList.remove('is-hidden');
    celebrate('🏆', true);
    const nxt = nextLessonId();
    Speech.say(() => fmt(t('finishSay'), { name: L(ls.title), a: ok, b: total }), () => Speech.whenIdle(() => { if (S.auto && nxt && App.view === 'lab') startNextCountdown(nxt); }), 'chan');
  }
};
function nextLessonId() { const i = ORDERED.indexOf(Run.lesson.id); return i >= 0 && i < ORDERED.length - 1 ? ORDERED[i + 1] : null; }
function renderDone() {
  const ls = Run.lesson; if (!ls) return;
  const ans = Object.values(Run.score), total = ls.stages.filter((s) => s.quiz).length, ok = ans.filter(Boolean).length;
  $('#doneTitle').textContent = fmt(t('finishTitle'), { name: L(ls.title) });
  $('#doneStars').textContent = (total ? fmt(t('finishStars'), { a: ok, b: total }) + ' ' : '') + '⭐'.repeat(PROGRESS[ls.id] || 1);
  const nxt = nextLessonId();
  $('#doneNext').classList.toggle('is-hidden', !nxt);
  if (nxt) $('#doneNext').textContent = fmt(t('nextLesson'), { name: L(LESSONS[nxt].title) });
}
let nextT = null;
function startNextCountdown(id) {
  stopNextCountdown();
  let n = 10;
  const tick = () => { $('#doneCount').textContent = fmt(t('nextIn'), { n }); if (n-- <= 0) { stopNextCountdown(); enterLesson(id, 0); } else nextT = setTimeout(tick, 1000 * FAST); };
  tick();
}
function stopNextCountdown() { clearTimeout(nextT); nextT = null; const c = $('#doneCount'); if (c) c.textContent = ''; }

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
  const st = Run.st, n = Run.lesson.stages.length;
  $('#stageNum').textContent = fmt(t('stepOf'), { i: Run.i + 1, n });
  $('#stageTitle').textContent = L(st.title);
  $('#dots').innerHTML = Run.lesson.stages.map((_, k) => `<i class="${k < Run.i ? 'past' : k === Run.i ? 'now' : ''}"></i>`).join('');
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
  $('#bCount').textContent = `${Run.i + 1} / ${Run.lesson.stages.length}`;
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
      ${rv ? `<div id="qResult" style="color:${q.pick == null ? '#4f46e5' : q.correct ? '#16a34a' : '#b45309'}">${esc(q.pick == null ? t(q.skipped ? 'revealShort' : 'timeUpShort') : q.correct ? t('correct') : t('wrong'))}</div>` : ''}
      <div id="qText">${esc(L(Q.q))}</div>
      ${Q.opts.map((o, k) => `<button class="opt ${rv && k === Q.ans ? 'right' : ''} ${rv && k === q.pick && k !== Q.ans ? 'wrongpick' : ''} ${rv && k !== Q.ans && k !== q.pick ? 'dim' : ''}" data-k="${k}" ${rv ? 'disabled' : ''}>
        <span class="k">${rv && k === Q.ans ? '✓' : rv && k === q.pick ? '✗' : k + 1}</span><span class="tx">${esc(L(o))}</span>
        <span class="spk" data-read="opt:${k}" aria-label="read">🔊</span></button>`).join('')}
      <div id="qBar" class="is-hidden"><i></i></div>
      ${rv ? `<button id="qCont" class="btn btn-primary w-full mt-1 ${q.revealSaid && !S.auto ? 'glow' : ''}">${esc(t('continue'))}</button>` : ''}`;
  }
  document.body.classList.toggle('quiz-open', q.phase !== 'watch');
  document.body.classList.toggle('quiz-reveal', q.phase === 'reveal');
  if (q.phase === 'ask' && Run.narrDone && S.auto && !Speech.paused) startCountdown();
}
$('#quiz').addEventListener('click', (e) => {
  const o = e.target.closest('.opt'); if (o && !o.disabled) { Sfx.unlock(); Run.answer(+o.dataset.k); return; }
  if (e.target.closest('#qCont')) Run.next();
});

function renderTabs() {
  const defs = Chart.defs();
  $('#tabs').innerHTML = defs.map((g) => `<button data-tab="${g.id}" class="${g.id === Chart.tab ? 'active' : ''}">${esc(L(g.tab))}</button>`).join('');
}
$('#tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) Chart.setTab(b.dataset.tab); });

function paramDefs() { const ls = Run.lesson, b = Run.lab; return b ? b.params.filter((d) => !ls.params || ls.params.includes(d.key)) : []; }
function fmtParam(d, v) {
  if (d.type === 'select') { const o = d.options.find((q) => q.v === v); return o ? L(o.label) : String(v); }
  const s = d.fmt ? d.fmt(v) : (d.unit === '×' ? v.toFixed(1) + '×' : (d.step < 1 ? v.toFixed(d.step < 0.1 ? 2 : 1) : v) + (d.unit ? ' ' + d.unit : ''));
  return s + (d.word ? ' · ' + L(d.word(v)) : '');
}
function renderTools(flashKey) {
  if (!Run.lab || App.view !== 'lab') return;
  const b = Run.lab;
  $('#params').innerHTML = paramDefs().map((d) => {
    const v = b.getParam(d.key), lk = Run.locks.has(d.key);
    const head = `<div class="ph">${esc(L(d.label))} ${lk ? `<span class="lock">${esc(t('locked'))}</span>` : ''}<span class="val" id="pv-${d.key}">${d.type === 'toggle' ? '' : esc(fmtParam(d, v))}</span>`;
    if (d.type === 'toggle') return `<div class="prow ${lk ? 'locked' : ''} ${flashKey === d.key ? 'flash' : ''}">${head}<button class="toggle ${v ? 'on' : ''}" data-toggle="${d.key}" ${lk ? 'disabled' : ''} aria-label="toggle"></button></div>${d.hint ? `<div class="hint">${esc(L(d.hint))}</div>` : ''}</div>`;
    if (d.type === 'select') return `<div class="prow ${lk ? 'locked' : ''} ${flashKey === d.key ? 'flash' : ''}">${head}</div>${d.hint ? `<div class="hint">${esc(L(d.hint))}</div>` : ''}
      <div class="seg wrap">${d.options.map((o) => `<button data-sel="${d.key}" data-v="${esc(String(o.v))}" class="${o.v === v ? 'active' : ''}" ${lk ? 'disabled' : ''}>${esc(L(o.label))}</button>`).join('')}</div></div>`;
    return `<div class="prow ${lk ? 'locked' : ''} ${flashKey === d.key ? 'flash' : ''}">${head}</div>
      ${d.hint ? `<div class="hint">${esc(L(d.hint))}</div>` : ''}
      <input type="range" min="${d.min}" max="${d.max}" step="${d.step}" value="${v}" data-param="${d.key}" ${lk ? 'disabled' : ''} /></div>`;
  }).join('');
  const btns = (Run.lesson.buttons || b.buttons || []).filter((x) => !x.show || x.show());
  $('#toolBtns').innerHTML = btns.map((x, i) => `<button class="btn ${x.cls || ''}" data-btn="${i}" ${x.enabled && !x.enabled() ? 'disabled' : ''}>${esc(L(x.label))}</button>`).join('');
  $('#toolBtns').dataset.n = btns.length;
}
$('#params').addEventListener('input', (e) => {
  const k = e.target.dataset.param; if (!k) return;
  const d = Run.lab.params.find((q) => q.key === k), v = Number(e.target.value);
  Run.lab.setParam(k, v); $('#pv-' + k).textContent = fmtParam(d, v);
  Run.onEvent('param', { key: k, value: v, ui: true });
});
$('#params').addEventListener('change', () => renderTools());
$('#params').addEventListener('click', (e) => {
  const b = e.target.closest('[data-toggle]');
  if (b && !b.disabled) { const k = b.dataset.toggle, v = !Run.lab.getParam(k); Run.lab.setParam(k, v); Run.onEvent('param', { key: k, value: v, ui: true }); renderTools(); return; }
  const s = e.target.closest('[data-sel]');
  if (s && !s.disabled) {
    const k = s.dataset.sel, d = Run.lab.params.find((q) => q.key === k), o = d.options.find((q) => String(q.v) === s.dataset.v);
    Run.lab.setParam(k, o.v); Run.onEvent('param', { key: k, value: o.v, ui: true }); renderTools();
  }
});
$('#toolBtns').addEventListener('click', (e) => {
  const b = e.target.closest('[data-btn]'); if (!b) return;
  const x = (Run.lesson.buttons || Run.lab.buttons || []).filter((q) => !q.show || q.show())[+b.dataset.btn];
  Sfx.unlock();
  if (x.act[0] === 'again') Run.lab.again(); else Run.lab.act(x.act);
  renderTools();
});
function openTools(on) { $('#tools').classList.toggle('is-hidden', !on); $('#fabTools').classList.toggle('active', on); }

/* =====================================================================
 * 9. 畫面切換、語言、設定
 * ===================================================================== */
function enterLesson(id, i = 0) {
  const ls = LESSONS[id]; if (!ls) return;
  Tour.halt(); $$('.spot').forEach((el) => el.classList.remove('spot'));
  stopNextCountdown();
  const b = ls.bench;
  if (Run.lab && Run.lab !== b) { Run.lab.root.visible = false; Run.lab.deactivate && Run.lab.deactivate(); }
  Run.clear();
  Run.lab = b; Run.lesson = ls; b.root.visible = true;
  world.setBoard(boardOf(ls)); world.placePeople(b.people);
  if (i === 0 || !Run.score) Run.score = {};
  b.activate && b.activate(ls);
  b.apply({ ...(ls.base || {}), ...((ls.stages[0] && ls.stages[0].setup) || {}) });
  App.view = 'lab';
  $('#hub').classList.add('is-hidden'); $('#labUI').classList.remove('is-hidden'); stageEl.style.visibility = 'visible';
  Chart.tab = null; syncGraphs();
  openTools(innerWidth >= 1366);
  Run.i = i; Run.st = ls.stages[i];
  renderTopbar(); renderTabs(); defaultView();
  Run.go(i);
  requestAnimationFrame(measure);
}
// 黑板：課堂可以有自己的 board（lesson.board），否則用實驗枱的；lines／title 可以係 {zh,en}
function curBoard() { return Run.lesson ? Run.lesson.board || Run.lab.board : null; }
function boardOf(ls) { const b = ls.board || ls.bench.board; return { ...b, title: L(b.title), sub: L(b.sub), lines: (b.lines || []).map(L) }; }
// 圖表面板：按課堂＋進階模式決定有冇圖、顯示邊幅
function syncGraphs() {
  const defs = Chart.defs();
  if (!defs.some((d) => d.id === Chart.tab)) Chart.tab = defs.length ? defs[0].id : null;
  Chart.open = defs.length > 0 && Chart.userOpen !== false;
  $('#graphPanel').classList.toggle('is-hidden', !Chart.open); $('#fabGraph').classList.toggle('is-hidden', !defs.length); $('#fabGraph').classList.toggle('active', Chart.open);
  document.body.classList.toggle('no-graph', !Chart.open);
  renderTabs(); Chart.lastLegend = ''; Chart.draw(); requestAnimationFrame(measure);
}
function goHub() {
  Run.clear(); Run.halt(); Speech.cutAll();
  App.view = 'hub';
  $('#labUI').classList.add('is-hidden'); $('#done').classList.add('is-hidden'); $('#hub').classList.remove('is-hidden'); stageEl.style.visibility = 'hidden';
  document.body.classList.remove('quiz-open', 'quiz-reveal');
  renderHub(); renderTopbar(); Tour.render();
}
function applyI18n() {
  document.documentElement.lang = S.lang === 'zh' ? 'zh-HK' : 'en-GB';
  document.title = t('appTitle');
  $$('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  world.labels({ chan: t('chan'), ming: t('ming') });
  renderTopbar(); renderHub(); renderSettings();
  if (App.view === 'lab') { world.setBoard(boardOf(Run.lesson)); renderStage(); renderBubble(); renderQuiz(); renderTools(); renderTabs(); Run.lab.labels && Run.lab.labels(); Chart.lastLegend = ''; Chart.draw(); Info.relang(); }
  if (!$('#done').classList.contains('is-hidden')) renderDone();
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
$('#sProgress').onclick = () => { Object.keys(PROGRESS).forEach((k) => delete PROGRESS[k]); store.set('progress', PROGRESS); renderHub(); toast('✓'); };

function onAutoChange() {
  renderTopbar();
  if (S.auto) { App.view === 'lab' ? Run.kick() : Tour.kick(); }
  else { Run.halt(); Tour.halt(); stopNextCountdown(); }
  if (App.view === 'lab') { renderBubble(); renderQuiz(); }
}

/* ---------------- 事件綁定 ---------------- */
$$('[data-lang]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); setLang(b.dataset.lang); }));
$('#btnHome').onclick = goHub;
$('#btnAuto').onclick = () => { S.auto = !S.auto; save(); onAutoChange(); toast(S.auto ? t('autoOn') : t('autoOff')); };
$('#btnPause').onclick = () => {
  if (Speech.paused) { Speech.resume(); App.view === 'lab' ? Run.kick() : Tour.kick(); }
  else { Speech.pause(); Run.halt(); Tour.halt(); stopNextCountdown(); }
  renderTopbar();
};
$('#btnRead').onclick = () => { App.pointRead = !App.pointRead; document.body.classList.toggle('pointread', App.pointRead); renderTopbar(); toast(App.pointRead ? t('pointReadOn') : t('pointReadOff')); };
$('#btnAdv').onclick = () => {
  S.adv = !S.adv; save(); renderTopbar();
  if (App.view !== 'lab') return;
  renderBubble(); Run.lab.labels && Run.lab.labels(); syncGraphs();
  if (S.adv && Run.st && Run.st.advGraph) Chart.setTab(Run.st.advGraph);
  toast(S.adv ? t('advOn') : t('advOff'));
};
$('#bPrev').onclick = () => Run.prev();
$('#bNext').onclick = () => Run.next();
$('#bRedo').onclick = () => Run.go(Run.i);
$('#fabTools').onclick = () => openTools($('#tools').classList.contains('is-hidden'));
$('#toolsClose').onclick = () => openTools(false);
$('#fabGraph').onclick = () => { Chart.open = !Chart.open; Chart.userOpen = Chart.open; $('#graphPanel').classList.toggle('is-hidden', !Chart.open); $('#fabGraph').classList.toggle('active', Chart.open); document.body.classList.toggle('no-graph', !Chart.open); Chart.draw(); };
$('#fabReset').onclick = () => { Run.lab.again(); renderTools(); };
$('#fabCam').onclick = () => defaultView(true);
$('#infoClose').onclick = () => Info.hide();
$('#doneHub').onclick = goHub;
$('#doneAgain').onclick = () => { stopNextCountdown(); $('#done').classList.add('is-hidden'); Run.score = {}; enterLesson(Run.lesson.id, 0); };
$('#doneNext').onclick = () => { const n = nextLessonId(); stopNextCountdown(); if (n) enterLesson(n, 0); };
$('#voiceTipClose').onclick = () => { updateVoiceTip.dismissed = { ...(updateVoiceTip.dismissed || {}), [S.lang]: true }; updateVoiceTip(); };

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
  if (App.view !== 'lab' || !Run.lab) return;
  Run.lab.update(dt * TURBO, clock.elapsedTime);
  world.update(dt, clock.elapsedTime, (() => { const w = Speech.who(); return w === 'chan' || w === 'ming' ? w : null; })());
  stepCam(dt);
  controls.update();
  uiT += dt;
  if (uiT > 0.1) { uiT = 0; Run.lab.labels && Run.lab.labels(); Chart.draw(); }
  renderer.render(scene, camera);
  renderLabels();
});
// CSS2DRenderer 唔會理會「父物件被隱藏」，所以渲染前暫時隱藏佢哋
const cssObjs = [];
scene.traverse((o) => o.isCSS2DObject && cssObjs.push(o));
let cssCount = 0;
function renderLabels() {
  if (cssCount++ % 60 === 0) { cssObjs.length = 0; scene.traverse((o) => o.isCSS2DObject && cssObjs.push(o)); }
  const tmp = [];
  for (const o of cssObjs) {
    if (!o.visible) continue;
    for (let q = o.parent; q; q = q.parent) if (!q.visible) { o.visible = false; tmp.push(o); break; }
  }
  labelRenderer.render(scene, camera);
  for (const o of tmp) o.visible = true;
}

FW.init(); Chart.init(); Speech.init();
stageEl.style.visibility = 'hidden';
applyI18n();

// 測試用掛鈎（不影響正常使用）
window.__lab = { Run, Speech, Tour, S, App, BENCH, LESSONS, ORDERED, enterLesson, goHub };
