/* Topic 7.4 使用化石燃料的後果：酸雨的形成、酸雨對建築材料（大理石）同植物的影響 */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V2, V3 } = K;

const TRAYS = [
  { k: 'A', zh: 'A：淋清水', en: 'A: clean water', ph: 7, phCol: '#22c55e' },
  { k: 'B', zh: 'B：淋酸雨', en: 'B: acid rain', ph: 4, phCol: '#f97316' },
];

function Panel({ S }) {
  const { pick, lang } = useApp();
  const zh = lang === 'zh';
  const done = (S.mon || 0) >= 1;
  return html`<div className="grid gap-1.5 text-sm">
    ${TRAYS.map((t, i) => html`<div key=${t.k} className="rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2">
      <div className="flex items-center gap-2"><b className="flex-1 text-slate-700">${pick(t)}</b><span className="text-xs text-slate-500">${S['r' + i] ? (zh ? '✅ 淋咗' : '✅ watered') : '—'}</span></div>
      <div className="mt-1 grid grid-cols-3 gap-1 text-xs text-slate-600">
        <span>🪨 ${done && S['r' + i] ? (i ? (zh ? '變細、粗糙' : 'smaller, rough') : (zh ? '完好' : 'unchanged')) : '—'}</span>
        <span>🌱 ${done && S['r' + i] ? (i ? (zh ? '葉變黃' : 'leaves yellow') : (zh ? '健康' : 'healthy')) : '—'}</span>
        <span className="inline-flex items-center gap-1">pH ${S['p' + i] ? html`<span className="w-3 h-3 rounded-full inline-block" style=${{ background: t.phCol }}></span> ${t.ph}` : '—'}</span>
      </div>
    </div>`)}
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    <rect x="20" y="30" width="22" height="70" fill="#64748b" /><path d="M31 28 q-8 -12 4 -20 q10 -6 18 2" stroke="#94a3b8" strokeWidth="6" fill="none" strokeLinecap="round" />
    <ellipse cx="120" cy="22" rx="46" ry="14" fill="#94a3b8" />
    ${[95, 110, 125, 140].map((x, i) => html`<line key=${x} x1=${x} y1=${40 + i % 2 * 6} x2=${x - 5} y2=${56 + i % 2 * 6} stroke="#f97316" strokeWidth="3" strokeLinecap="round" />`)}
    <path d="M95 100 v-22 q0 -12 12 -12 h14 q12 0 12 12 v22z" fill="#e7e5e4" stroke="#a8a29e" strokeWidth="3" />
    <path d="M104 78 l4 6 l5 -4" stroke="#a8a29e" strokeWidth="2" fill="none" />
    <path d="M165 100 v-24 M165 82 q-12 -4 -14 -14 M165 78 q10 -2 13 -12" stroke="#ca8a04" strokeWidth="3" fill="none" />
  </svg>`;
}

const events = {
  rn_clean: { zh: 'A 盤淋咗清水。', en: 'Tray A has been watered with clean water.' },
  rn_acid: { zh: 'B 盤淋咗「酸雨」。', en: 'Tray B has been watered with "acid rain".' },
  rn_wrongClean: { zh: 'B 盤係淋酸雨嘅，清水要淋 A 盤。', en: 'Tray B gets the acid rain. The clean water goes on tray A.' },
  rn_wrongAcid: { zh: 'A 盤係對照組，淋清水㗎，酸雨要淋 B 盤。', en: 'Tray A is the control and gets clean water. The acid rain goes on tray B.' },
  rainAll: { zh: '兩個盤都淋好喇！', en: 'Both trays are watered!' },
  w_need: { zh: '先淋好兩個盤，先好快轉時間。', en: 'Water both trays first, then fast-forward.' },
  w_go: { zh: '時間快轉中……真實世界要好多年，我哋用快轉模擬。留意 B 盤嘅大理石同幼苗。', en: 'Fast-forwarding… In real life this takes many years, so we are simulating it. Watch the marble and the seedling in tray B.' },
  w_done: { zh: 'B 盤嘅大理石冒泡、變細、表面變粗糙，幼苗嘅葉仲變黃；A 盤就冇變！', en: 'In tray B, the marble fizzed, shrank and became rough, and the seedling\'s leaves turned yellow; tray A has not changed!' },
  clockDone: { zh: '時間已經快轉咗喇。', en: 'The time has already been fast-forwarded.' },
  ph_A: { zh: 'A 盤：pH 試紙變綠色，pH 大約係 7，係中性。', en: 'Tray A: the pH paper turns green, about pH 7, which is neutral.' },
  ph_B: { zh: 'B 盤：pH 試紙變橙紅色，pH 大約係 4，係酸性！', en: 'Tray B: the pH paper turns orange-red, about pH 4, which is acidic!' },
  phAll: { zh: '兩個盤都測試完喇。', en: 'Both trays have been tested.' },
  ph_need: { zh: '等時間快轉完，先用 pH 試紙測試。', en: 'Wait until the time has been fast-forwarded, then test with pH paper.' },
  factory: { zh: '工廠同發電廠燒煤同石油，會放出二氧化硫，係形成酸雨嘅主要原因之一。', en: 'Factories and power stations burn coal and oil, releasing sulfur dioxide, one of the main causes of acid rain.' },
  car: { zh: '汽車引擎會放出氮氧化物，都會令雨變酸。催化轉換器可以減少佢哋。', en: 'Car engines release nitrogen oxides, which also make rain acidic. Catalytic converters reduce them.' },
  marble: { zh: '大理石嘅主要成分係碳酸鈣，同蛋殼一樣。', en: 'Marble is mainly calcium carbonate, just like eggshell.' },
};

export default {
  id: 'acidrain', topics: ['7.4'], accent: '#64748b', dark: '#334155', bg: 'linear-gradient(135deg,#e2e8f0,#fef3c7)', Art,
  title: { zh: '酸雨侵蝕', en: 'Acid Rain Attack' },
  desc: { zh: '燒煤同石油會令雨變酸！模擬酸雨淋落大理石同幼苗，睇下有咩後果。', en: 'Burning coal and oil can make rain acidic! Simulate acid rain falling on marble and seedlings and see what happens.' },
  steps: [
    { tag: 'intro', zh: '落雨通常都唔會傷害植物同建築物，但係有一種雨叫「酸雨」，就會慢慢蝕壞大理石雕像同森林！酸雨係點嚟㗎？今日我哋做個模擬實驗：A 盤淋清水，B 盤淋「酸雨」（用稀酸代替），比較一下。安全提提你：稀酸要由老師處理。後面嘅物件可以撳嚟睇介紹。',
      en: 'Rain does not usually harm plants or buildings, but one kind of rain, called acid rain, slowly damages marble statues and forests! Where does acid rain come from? Today we will run a simulation: tray A gets clean water and tray B gets "acid rain" (we use a dilute acid instead), and we will compare them. Safety first: a teacher handles the dilute acid. Tap the objects at the back to learn about them.' },
    { tag: 'try', action: { id: 'rain', events: ['rn_'] }, zh: '將藍色灑水壺嘅清水淋落 A 盤，再將「酸雨」灑水壺淋落 B 盤。',
      en: 'Water tray A with the blue can of clean water, then water tray B with the "acid rain" can.' },
    { tag: 'observe', zh: '兩個盤都淋咗水。A 盤係「對照組」，等我哋知道冇酸嘅時候會點，咁先可以公平比較。',
      en: 'Both trays have been watered. Tray A is the control: it shows us what happens without acid, so the comparison is fair.' },
    { tag: 'try', action: { id: 'wait', events: ['w_'] }, zh: '撳右邊嘅時鐘快轉時間。真實世界要好多年，我哋用快轉模擬。',
      en: 'Tap the clock on the right to fast-forward. In real life this takes many years, so we simulate it.' },
    { tag: 'observe', zh: 'B 盤嘅大理石冒泡、變細、表面變得粗糙，幼苗嘅葉仲變黃；A 盤就冇變。',
      en: 'In tray B, the marble fizzes, shrinks and becomes rough, and the seedling\'s leaves turn yellow; tray A does not change.' },
    { tag: 'try', action: { id: 'ph', events: ['ph_'] }, zh: '用 pH 試紙測試兩個盤嘅水：將 pH 試紙拖去 A 盤同 B 盤。',
      en: 'Test the water in both trays with pH paper: drag the pH paper to tray A and tray B.' },
    { tag: 'feynman', zh: '工廠、發電廠同汽車燒煤同石油嗰陣，會放出二氧化硫同氮氧化物。佢哋飄上天，溶入雲入面嘅水滴，就變成帶酸嘅雨。酸雨落喺大理石上面，好似醋淋落蛋殼咁，會慢慢將石頭溶走。',
      en: 'When factories, power stations and cars burn coal and oil, they release sulfur dioxide and nitrogen oxides. These gases float up and dissolve in the water droplets in clouds, making acidic rain. When acid rain falls on marble, it slowly dissolves the stone, just like vinegar on eggshell.' },
    { tag: 'first', zh: '由最基本諗起：大理石嘅主要成分係碳酸鈣，同蛋殼一樣。酸嘅氫離子會同碳酸鈣反應，產生二氧化碳氣泡同溶得落水嘅物質，所以石頭會越嚟越細。平時嘅雨因為溶咗少少二氧化碳，都係微酸，pH 大約 5.6；酸雨就更酸，有時 pH 會低到 4。酸亦會傷害葉片，同埋沖走泥土入面嘅養分，令植物生長得唔好。',
      en: 'Back to basics: marble is mainly calcium carbonate, like eggshell. The hydrogen ions in acid react with calcium carbonate to make carbon dioxide bubbles and substances that dissolve in water, so the stone gets smaller and smaller. Normal rain is slightly acidic, about pH 5.6, because a little carbon dioxide dissolves in it; acid rain is more acidic, sometimes as low as pH 4. Acid also damages leaves and washes nutrients out of the soil, so plants grow poorly.' },
    { tag: 'life', zh: '生活應用：好多大理石雕像同墓碑上面嘅字，都俾酸雨蝕到模糊；有啲湖泊變得太酸，魚都住唔到。要減少酸雨：汽車裝催化轉換器、發電廠除去煙入面嘅二氧化硫、多用潔淨能源；我哋都可以多搭公共交通同慳電。',
      en: 'Everyday life: the carvings on many marble statues and gravestones have been blurred by acid rain, and some lakes became too acidic for fish. To reduce acid rain, cars use catalytic converters, power stations remove sulfur dioxide from their smoke, and we can use cleaner energy. We can help too, by taking public transport and saving electricity.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '我哋可以點樣幫手減少酸雨？', en: 'How can we help reduce acid rain?' },
    options: [
      { zh: '成日開冷氣', en: 'Use air conditioning all the time' },
      { zh: '多搭公共交通、慳電，少用化石燃料', en: 'Take public transport, save electricity and burn less fossil fuel' },
      { zh: '喺雕像上面淋多啲水', en: 'Pour more water on statues' },
    ],
    correct: 1,
    right: { zh: '啱！少燒煤同石油，放出嘅二氧化硫同氮氧化物就少咗，雨就冇咁酸。', en: 'Right! Burning less coal and oil means less sulfur dioxide and nitrogen oxides, so the rain is less acidic.' },
    wrong: { zh: '再諗下：酸雨入面嘅酸，係由燒咩嘢嗰陣放出嚟？', en: 'Think again: burning what releases the gases that make rain acidic?' },
  },
  tools: [
    { id: 'r', label: { zh: '淋下一個盤', en: 'Water the next tray' }, run: (c) => c.rainNext() },
    { id: 'f', primary: true, label: { zh: '⏩ 快轉時間', en: '⏩ Fast-forward' }, run: (c) => c.fastForward() },
    { id: 'p', label: { zh: '測試 pH', en: 'Test the pH' }, run: (c) => c.phNext() },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = { r0: false, r1: false, p0: false, p1: false, mon: 0 };
    const push = () => api.state({ ...S });
    const txs = [-1.1, 1.1], TZ = -0.3;
    const trays = TRAYS.map((t, i) => {
      const x = txs[i];
      const tray = new THREE.Mesh(new K.RoundedBoxGeometry(1.4, 0.08, 0.9, 2, 0.03), K.stdMat('#cbd5e1', 0.5)); tray.position.set(x, T + 0.04, TZ); scene.add(tray);
      const puddle = new THREE.Mesh(new THREE.CircleGeometry(0.5, 32), K.liquidMat('#bae6fd', 0)); puddle.rotation.x = -Math.PI / 2; puddle.scale.set(1.2, 0.75, 1); puddle.position.set(x, T + 0.085, TZ); scene.add(puddle);
      const marbleMat = K.stdMat('#f1f5f9', 0.35);
      const marble = new THREE.Mesh(new THREE.DodecahedronGeometry(0.17, 1), marbleMat); marble.scale.set(1.2, 0.8, 1); marble.position.set(x - 0.3, T + 0.2, TZ); scene.add(marble);
      api.tap(marble, () => api.emit('marble'), { zh: '大理石', en: 'Marble' });
      const plant = new THREE.Group(); plant.position.set(x + 0.32, T + 0.08, TZ); scene.add(plant);
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.2, 20), K.stdMat('#c2410c', 0.7)); pot.position.y = 0.1; plant.add(pot);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 8), K.stdMat('#15803d', 0.6)); stem.position.y = 0.35; plant.add(stem);
      const leafMat = K.stdMat('#22c55e', 0.6), leaves = new THREE.Group(); leaves.position.y = 0.45; plant.add(leaves);
      [-1, 1].forEach((s, k) => [0, 1].forEach((j) => { const l = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), leafMat); l.scale.set(1.4, 0.35, 0.8); l.position.set(s * 0.08, -0.08 * j, 0); l.rotation.z = s * 0.4; leaves.add(l); }));
      const lab = api.label(t, { border: i ? '#f97316' : '#38bdf8', h: 0.16 }); lab.position.set(x, T + 0.12, TZ + 0.58);
      api.tap(tray, () => api.emit('marble'), t, [lab]);
      return { x, tray, puddle, marble, marbleMat, plant, leaves, leafMat, bub: K.makeBubbles(scene, { max: 60, size: 0.018 }), drop: V3(x, T + 0.75, TZ) };
    });

    // 灑水壺
    const mkCan = (x, color, name, border) => {
      const g = new THREE.Group(); g.position.set(x, T, 0.95); scene.add(g);
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.34, 24), K.stdMat(color, 0.4)); body.position.y = 0.17; g.add(body);
      const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.4, 12), K.stdMat(color, 0.4)); spout.rotation.z = -0.9; spout.position.set(0.3, 0.3, 0); g.add(spout);
      const rose = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.03, 0.05, 16), K.stdMat('#e2e8f0', 0.4)); rose.rotation.z = -0.9; rose.position.set(0.46, 0.42, 0); g.add(rose);
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 8, 20, Math.PI), K.stdMat(color, 0.4)); handle.rotation.z = Math.PI / 2; handle.position.set(-0.2, 0.22, 0); g.add(handle);
      const l = api.label(name, { border, h: 0.16 }); l.position.set(0, -0.05, 0.36); g.add(l);
      return g;
    };
    const canW = mkCan(-2.5, '#38bdf8', { zh: '清水', en: 'Clean water' }, '#0ea5e9');
    const canA = mkCan(2.2, '#a8a29e', { zh: '酸雨（稀酸）', en: 'Acid rain (dilute acid)' }, '#f97316');
    const ROSE = V2(0.46, 0.42);

    // pH 試紙
    const paper = new THREE.Group(); paper.position.set(-1.0, T + 0.05, 1.0); scene.add(paper);
    const card = new THREE.Mesh(new K.RoundedBoxGeometry(0.36, 0.03, 0.5, 2, 0.01), K.stdMat('#ffffff', 0.6)); card.position.y = -0.02; paper.add(card); // 白卡，方便手指捉住
    const strips = [0, 1].map((i) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.012, 0.42), K.stdMat('#fde68a', 0.8)); m.position.set(-0.06 + i * 0.12, 0.002, 0); paper.add(m); return m; });
    const lPaper = api.label({ zh: 'pH 試紙', en: 'pH paper' }, { border: '#22c55e', h: 0.16 }); lPaper.position.set(0, -0.06, 0.38); paper.add(lPaper);

    // 時鐘
    const clock = new THREE.Group(); clock.position.set(2.75, T, -0.95); scene.add(clock);
    const face = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.08, 32), K.stdMat('#f8fafc', 0.5)); face.rotation.x = Math.PI / 2; face.position.y = 0.32; clock.add(face);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.03, 10, 40), K.stdMat('#64748b', 0.4)); rim.position.y = 0.32; clock.add(rim);
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.2, 0.02), K.stdMat('#1e293b', 0.5)); hand.geometry.translate(0, 0.09, 0); hand.position.set(0, 0.32, 0.05); clock.add(hand);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.18), K.stdMat('#64748b', 0.5)); foot.position.y = 0.03; clock.add(foot);
    const lClock = api.label({ zh: '⏰ 快轉', en: '⏰ Fast-forward' }, { border: '#64748b', h: 0.16 }); lClock.position.set(2.75, T + 0.78, -0.95);
    // 後排：工廠煙囪、汽車
    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.9, 16), K.stdMat('#78716c', 0.7)); chimney.position.set(-2.9, T + 0.45, -1.25); scene.add(chimney);
    const smoke = K.makeSteam(scene);
    const car = new THREE.Group(); car.position.set(1.3, T, -1.3); scene.add(car);
    const cBody = new THREE.Mesh(new K.RoundedBoxGeometry(0.6, 0.18, 0.3, 2, 0.05), K.stdMat('#ef4444', 0.4)); cBody.position.y = 0.15; car.add(cBody);
    const cTop = new THREE.Mesh(new K.RoundedBoxGeometry(0.32, 0.14, 0.26, 2, 0.04), K.stdMat('#ef4444', 0.4)); cTop.position.set(-0.04, 0.29, 0); car.add(cTop);
    [[-0.18, 0.15], [0.18, 0.15], [-0.18, -0.15], [0.18, -0.15]].forEach(([x, z]) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 14), K.stdMat('#1f2937', 0.6)); w.rotation.x = Math.PI / 2; w.position.set(x, 0.06, z); car.add(w); });
    [[chimney, 'factory', { zh: '工廠煙囪', en: 'Factory chimney' }, -2.9, 1.05], [car, 'car', { zh: '汽車', en: 'Car' }, 1.3, 0.55]].forEach(([o, ev, name, x, y]) => {
      const l = api.label(name, { border: '#94a3b8', h: 0.15 }); l.position.set(x, T + y, -1.2);
      api.tap(o, () => api.emit(ev), name, [l]);
    });

    let busy = false, fizz = 0;
    async function pour(i, can, h) {
      const tr = trays[i];
      await K.moveTo(tw, can, K.tipPose(ROSE, -0.5, V3(tr.x, T + 0.75, TZ)), -0.5, 0.5); // 壺嘴向下傾
      const drops = [-0.35, -0.1, 0.15, 0.4].map((dx, k) => tw.wait(k * 0.12).then(() => K.dripDrop(scene, tw, V3(tr.x + dx, T + 0.7, TZ + (k % 2) * 0.1), V3(tr.x + dx, T + 0.09, TZ), i ? '#d6d3d1' : '#7dd3fc')));
      await Promise.all(drops);
      tr.puddle.material.color.set(i ? '#e7e5e4' : '#bae6fd');
      await tw.to(0.4, (k) => { tr.puddle.material.opacity = 0.6 * k; });
      await h.returnHome();
    }
    async function rain(which, i, h) {
      if (busy) return false;
      const want = which === 'clean' ? 0 : 1;
      if (i !== want) { api.emit(which === 'clean' ? 'rn_wrongClean' : 'rn_wrongAcid'); return false; }
      if (S['r' + i]) return false;
      busy = true;
      await pour(i, which === 'clean' ? canW : canA, h);
      S['r' + i] = true; push(); api.emit(which === 'clean' ? 'rn_clean' : 'rn_acid');
      busy = false;
      if (S.r0 && S.r1) { api.done('rain'); api.emit('rainAll'); }
    }
    async function fastForward() {
      if (busy) return;
      if (S.mon >= 1) { api.emit('clockDone'); return; }
      if (!(S.r0 && S.r1)) { api.emit('w_need'); return; }
      busy = true; api.emit('w_go'); fizz = 1;
      const B = trays[1], g0 = new THREE.Color('#22c55e'), g1 = new THREE.Color('#ca8a04'), m0 = new THREE.Color('#f1f5f9'), m1 = new THREE.Color('#d6d3d1');
      await tw.to(6, (k) => {
        S.mon = k; hand.rotation.z = -Math.PI * 4 * k;
        B.marble.scale.set(1.2 * (1 - 0.3 * k), 0.8 * (1 - 0.3 * k), 1 - 0.3 * k); B.marble.position.y = T + 0.2 - 0.05 * k;
        B.marbleMat.color.copy(m0).lerp(m1, k); B.marbleMat.roughness = 0.35 + 0.6 * k;
        B.leafMat.color.copy(g0).lerp(g1, k); B.leaves.rotation.z = 0.35 * k; B.leaves.position.y = 0.45 - 0.06 * k;
      }, K.lin);
      fizz = 0; S.mon = 1; push();
      await api.waitSpeech();
      api.emit('w_done'); api.done('wait');
      busy = false;
    }
    async function test(i, h) {
      if (busy || S['p' + i]) return false;
      if (S.mon < 1) { api.emit('ph_need'); return false; }
      busy = true;
      const tr = trays[i];
      await K.moveTo(tw, paper, V3(tr.x, T + 0.35, TZ + 0.1), 0, 0.45);
      await K.moveTo(tw, paper, V3(tr.x, T + 0.11, TZ + 0.1), 0, 0.3);
      const from = strips[i].material.color.clone();
      await tw.to(0.8, (k) => strips[i].material.color.copy(from).lerp(new THREE.Color(TRAYS[i].phCol), k));
      S['p' + i] = true; push(); api.emit(i ? 'ph_B' : 'ph_A');
      await h.returnHome();
      busy = false;
      if (S.p0 && S.p1) { api.done('ph'); api.emit('phAll'); }
    }
    const trayTargets = (accept) => () => trays.map((tr, i) => ({ key: 't' + i, pos: tr.drop, r: 0.6, ringY: T, accept: () => accept(i) }));
    const hW = api.drag(canW, { label: { zh: '清水灑水壺', en: 'Clean water can' }, lift: 0.9, enabled: () => !busy && !S.r0, targets: trayTargets(() => !S.r0),
      onDrop: (tg, h) => rain('clean', Number(tg.key.slice(1)), h), onTap: () => { if (!busy && !S.r0) hW.dropOn('t0'); } });
    const hA = api.drag(canA, { label: { zh: '酸雨灑水壺', en: 'Acid rain can' }, lift: 0.9, enabled: () => !busy && !S.r1, targets: trayTargets(() => !S.r1),
      onDrop: (tg, h) => rain('acid', Number(tg.key.slice(1)), h), onTap: () => { if (!busy && !S.r1) hA.dropOn('t1'); } });
    const nextPh = () => (S.p0 ? (S.p1 ? -1 : 1) : 0);
    const hP = api.drag(paper, { label: { zh: 'pH 試紙', en: 'pH paper' }, lift: 0.8, enabled: () => !busy && nextPh() >= 0, targets: trayTargets((i) => !S['p' + i]),
      onDrop: (tg, h) => test(Number(tg.key.slice(1)), h), onTap: () => { const i = nextPh(); if (!busy && i >= 0) hP.dropOn('t' + i); } });
    api.tap(clock, () => fastForward(), { zh: '快轉時鐘', en: 'Fast-forward clock' }, [lClock]);

    const smokeAt = V3(-2.9, T + 0.95, -1.25);
    push();
    return {
      cam: { pos: [0, 3.9, 5.0], target: [0, 1.35, -0.1], fitW: 6.8 },
      fastForward,
      rainNext() { if (busy) return; if (!S.r0) hW.dropOn('t0'); else if (!S.r1) hA.dropOn('t1'); },
      phNext() { const i = nextPh(); if (!busy && i >= 0 && S.mon >= 1) hP.dropOn('t' + i); },
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (id === 'rain') {
          if (!S.r0) { await hW.dropOn('t0'); await api.waitSpeech(); }
          while (busy) await tw.wait(0.1);
          if (!S.r1) await hA.dropOn('t1');
        }
        if (id === 'wait') await fastForward();
        if (id === 'ph') for (let i = nextPh(), c = 0; i >= 0 && c < 3; i = nextPh(), c++) { while (busy) await tw.wait(0.1); await hP.dropOn('t' + i); await api.waitSpeech(); }
      },
      getHint(id) {
        if (busy) return null;
        if (id === 'rain') return !S.r0 ? { from: K.worldOf(canW, 0.17), to: trays[0].drop } : !S.r1 ? { from: K.worldOf(canA, 0.17), to: trays[1].drop } : null;
        if (id === 'wait') return S.mon >= 1 ? null : { from: K.worldOf(clock, 0.32) };
        if (id === 'ph') { const i = nextPh(); return i < 0 || S.mon < 1 ? null : { from: K.worldOf(paper), to: trays[i].drop }; }
        return null;
      },
      update(dt, t) {
        smoke.update(dt, t, true, smokeAt, 0.12);
        const B = trays[1];
        if (fizz && Math.random() < dt * 30) B.bub.spawn(B.marble.position.x + (Math.random() - 0.5) * 0.3, T + 0.1, TZ + (Math.random() - 0.5) * 0.2, T + 0.45, 0.8);
        trays.forEach((tr) => tr.bub.update(dt, t));
      },
      reset() {
        tw.clear(); busy = false; fizz = 0;
        Object.assign(S, { r0: false, r1: false, p0: false, p1: false, mon: 0 }); push();
        hand.rotation.z = 0;
        trays.forEach((tr) => {
          tr.puddle.material.opacity = 0; tr.bub.clear();
          tr.marble.scale.set(1.2, 0.8, 1); tr.marble.position.y = T + 0.2; tr.marbleMat.color.set('#f1f5f9'); tr.marbleMat.roughness = 0.35;
          tr.leafMat.color.set('#22c55e'); tr.leaves.rotation.z = 0; tr.leaves.position.y = 0.45;
        });
        strips.forEach((s) => s.material.color.set('#fde68a'));
        [hW, hA, hP].forEach((h) => { h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.busy = false; });
      },
    };
  },
};
