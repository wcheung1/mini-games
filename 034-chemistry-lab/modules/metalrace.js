/* Topic 3.2 金屬的活潑性：金屬與稀酸反應、金屬活潑性序列 */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V3 } = K;

// 活潑性由高至低；rate = 每秒大約幾多個泡泡
const METALS = [
  { id: 'mg', zh: '鎂', en: 'Magnesium', col: '#d1d5db', rate: 26, bub: 3 },
  { id: 'zn', zh: '鋅', en: 'Zinc', col: '#9aa7b4', rate: 9, bub: 2 },
  { id: 'fe', zh: '鐵', en: 'Iron', col: '#5b6066', rate: 2.2, bub: 1 },
  { id: 'cu', zh: '銅', en: 'Copper', col: '#c46a35', rate: 0, bub: 0 },
];
const MEDALS = [
  { zh: '🥇 第 1 名', en: '🥇 1st', col: '#f5c542' },
  { zh: '🥈 第 2 名', en: '🥈 2nd', col: '#cbd5e1' },
  { zh: '🥉 第 3 名', en: '🥉 3rd', col: '#cd7f32' },
];

function Panel({ S }) {
  const { pick, lang } = useApp();
  const zh = lang === 'zh';
  return html`<div className="grid gap-1.5 text-sm">
    <div className="grid grid-cols-[1fr_1.4fr_1fr] gap-2 px-3 font-black text-slate-500 text-xs">
      <span>${zh ? '金屬' : 'Metal'}</span><span>${zh ? '冒泡' : 'Bubbles'}</span><span>${zh ? '名次' : 'Place'}</span>
    </div>
    ${METALS.map((m) => html`<div key=${m.id} className="grid grid-cols-[1fr_1.4fr_1fr] gap-2 items-center rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2">
      <span className="flex items-center gap-1.5 font-bold text-slate-700"><span className="w-4 h-4 rounded-full inline-block ring-1 ring-slate-300" style=${{ background: m.col }}></span>${pick(m)}</span>
      <span className="text-slate-600">${!S[m.id] ? '—' : m.bub ? '🫧'.repeat(m.bub) + (zh ? ['', ' 好慢', ' 穩定', ' 好快'][m.bub] : ['', ' slow', ' steady', ' fast'][m.bub]) : (zh ? '✖ 冇泡泡' : '✖ none')}</span>
      <span className="text-slate-600">${S['r_' + m.id] ? pick(MEDALS[S['r_' + m.id] - 1]) : '—'}</span>
    </div>`)}
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    ${[[30, 7, '#d1d5db'], [77, 4, '#9aa7b4'], [124, 2, '#5b6066'], [171, 0, '#c46a35']].map(([x, n, c]) => html`<g key=${x}>
      <path d=${`M${x - 19} 30 v66 a6 6 0 0 0 6 6 h26 a6 6 0 0 0 6 -6 v-66`} fill="#fff" fillOpacity=".9" stroke="#cbd5e1" strokeWidth="3" />
      <rect x=${x - 16} y="52" width="32" height="47" rx="4" fill="#dbeafe" />
      ${[...Array(n)].map((_, i) => html`<circle key=${i} cx=${x - 9 + (i % 3) * 9} cy=${90 - i * 6} r="3.5" fill="#fff" stroke="#94a3b8" />`)}
      <rect x=${x - 8} y="94" width="16" height="4" rx="2" fill=${c} />
    </g>`)}
    <circle cx="30" cy="16" r="9" fill="#f5c542" stroke="#b45309" strokeWidth="2" />
  </svg>`;
}

const events = {
  m_mg: { zh: '鎂一落去就冒出大量泡泡，好似汽水咁！鎂仲會慢慢變細，最後消失，燒杯摸落仲會暖暖哋。', en: 'The magnesium fizzes like mad, just like a fizzy drink! It slowly shrinks until it disappears, and the beaker gets warm.' },
  m_zn: { zh: '鋅都有冒泡，不過冇鎂咁勁，係穩定噉一粒粒冒出嚟。', en: 'The zinc bubbles too, but not as wildly as magnesium. The bubbles come up at a steady pace.' },
  m_fe: { zh: '鐵好慢先冒出幾粒泡泡，要好細心先睇到。過一陣，溶液仲會變成淡淡嘅綠色，呢個係鐵(II) 離子嘅顏色。', en: 'The iron only makes a few slow bubbles, so look carefully. After a while, the solution turns a very pale green, which is the colour of iron(II) ions.' },
  m_cu: { zh: '銅放咗落去，等極都冇泡泡！銅同稀鹽酸唔會反應。', en: 'The copper is in, but no matter how long we wait, there are no bubbles! Copper does not react with dilute hydrochloric acid.' },
  raceAll: { zh: '四種金屬都放晒落去喇！比較下邊杯泡泡最多、最快。', en: 'All four metals are in! Compare which beaker bubbles the most and the fastest.' },
  rank_1: { zh: '金牌：鎂！佢冒泡最快，係四種金屬入面最活潑嘅。', en: 'Gold medal: magnesium! It bubbles fastest, so it is the most reactive of the four.' },
  rank_2: { zh: '銀牌：鋅！冒泡穩定，排第二。', en: 'Silver medal: zinc! It bubbles steadily, so it comes second.' },
  rank_3: { zh: '銅牌：鐵！冒泡好慢，不過都有反應，排第三。', en: 'Bronze medal: iron! It bubbles slowly, but it still reacts, so it comes third.' },
  rank_slow: { zh: '唔係喎，呢杯冒泡冇咁快。搵下邊杯泡泡更多、更快！', en: 'Not quite! This beaker is not bubbling as fast. Look for one with more, faster bubbles!' },
  rank_fast: { zh: '唔係喎，呢杯冒泡仲快，應該攞更高嘅獎牌！', en: 'Not quite! This beaker bubbles even faster, so it deserves a better medal!' },
  rank_cu: { zh: '銅完全冇冒泡，喺呢場比賽排最尾，冇獎牌㗎！', en: 'Copper does not bubble at all, so it comes last in this race and gets no medal!' },
  rankAll: { zh: '排好晒喇：鎂、鋅、鐵、銅，由最活潑排到最唔活潑。', en: 'All ranked: magnesium, zinc, iron, copper, from most reactive to least reactive.' },
  acid: { zh: '呢樽係稀鹽酸，有腐蝕性。真實做實驗要由老師倒，千祈唔好掂或者試味！', en: 'This bottle is dilute hydrochloric acid. It is corrosive, so a teacher must pour it. Never touch or taste it!' },
  ring: { zh: '金好唔活潑，幾乎乜嘢都唔反應，所以金戒指戴幾千年都仲係咁閃。', en: 'Gold is very unreactive and hardly reacts with anything, so gold rings stay shiny for thousands of years.' },
  beaker: { zh: '四個燒杯裝住一樣份量、一樣濃度嘅稀鹽酸，咁先係公平比賽。', en: 'All four beakers hold the same amount of the same dilute acid. That makes it a fair test.' },
};

export default {
  id: 'metalrace', topics: ['3.2'], accent: '#ea580c', dark: '#9a3412', bg: 'linear-gradient(135deg,#ffedd5,#fef3c7)', Art,
  title: { zh: '金屬冒泡大比拼', en: 'Metal Bubble Race' },
  desc: { zh: '鎂、鋅、鐵、銅放落稀酸，邊個冒泡最快？幫金屬排名次，認識活潑性！', en: 'Drop magnesium, zinc, iron and copper into dilute acid. Which bubbles fastest? Rank them to discover reactivity!' },
  steps: [
    { tag: 'intro', zh: '金屬周圍都係：鐵做鐵釘，銅做電線，鋅包住鐵皮，鎂可以喺煙花入面燒出白光。不過，有啲金屬好「活潑」，好易起反應；有啲就好「懶」。今日我哋搞場比賽，睇下邊種金屬最活潑！記住：真實做實驗要由老師處理稀鹽酸。後面嘅物件可以撳嚟睇介紹。',
      en: 'Metals are everywhere: iron makes nails, copper makes wires, zinc coats iron sheets, and magnesium burns with a white light in fireworks. Some metals are very "reactive" and react easily; others are rather lazy. Today we will hold a race to find the most reactive metal! Remember: in a real lab, a teacher handles the dilute acid. Tap the objects at the back to learn about them.' },
    { tag: 'try', action: { id: 'race', events: ['m_'] }, zh: '將前面四種金屬：鎂、鋅、鐵、銅，逐種拖落一個燒杯。每個燒杯都裝住一樣嘅稀鹽酸，睇下邊個冒泡最快！',
      en: 'Drag the four metals at the front, magnesium, zinc, iron and copper, into the beakers, one metal per beaker. Every beaker holds the same dilute acid. Watch which one bubbles fastest!' },
    { tag: 'observe', zh: '鎂冒泡最勁，鋅第二，鐵好慢，銅就完全冇泡泡。泡泡入面係「氫氣」。冒泡越快，代表金屬同酸反應得越快，即係越「活潑」。',
      en: 'Magnesium bubbles the most, zinc comes second, iron is very slow, and copper makes no bubbles at all. The bubbles are hydrogen gas. The faster the bubbles, the faster the metal reacts with the acid, so the more reactive it is.' },
    { tag: 'try', action: { id: 'rank', events: ['rank_'] }, zh: '頒獎時間！將右邊嘅金牌、銀牌、銅牌，拖去冒泡第一快、第二快、第三快嘅燒杯。',
      en: 'Medal time! Drag the gold, silver and bronze medals on the right to the beakers that bubble first, second and third fastest.' },
    { tag: 'observe', zh: '名次出咗嚟：鎂、鋅、鐵、銅。將金屬由最活潑排到最唔活潑，就叫做「金屬活潑性序列」。',
      en: 'Here are the results: magnesium, zinc, iron, copper. Putting metals in order from most to least reactive is called the reactivity series.' },
    { tag: 'feynman', zh: '用一句說話講：金屬原子入面有啲極細嘅粒子叫「電子」。活潑嘅金屬好肯放手，好快就將電子交俾酸；唔活潑嘅金屬就攬實唔放。鎂最肯放手，銅就攬到實一實。',
      en: 'In one sentence: metal atoms hold tiny particles called electrons. A reactive metal lets go of them easily and quickly hands them to the acid; an unreactive metal holds on tight. Magnesium lets go most easily, while copper hugs its electrons tightly.' },
    { tag: 'first', zh: '由最基本諗起：酸溶喺水會放出「氫離子」。氫離子由金屬原子度攞走電子，自己孖埋變成氫氣，金屬就變成離子溶落水度。金屬越肯俾電子，反應就越快。銅喺活潑性序列排喺氫之下，氫離子攞唔到佢嘅電子，所以銅同稀酸唔會反應。',
      en: 'Back to basics: acids release hydrogen ions in water. Hydrogen ions take electrons from metal atoms and pair up to become hydrogen gas, while the metal turns into ions that dissolve. The more easily a metal gives away electrons, the faster it reacts. Copper sits below hydrogen in the reactivity series, so hydrogen ions cannot take its electrons, and copper does not react with dilute acid.' },
    { tag: 'life', zh: '生活應用：金同銀好唔活潑，所以用嚟做首飾，耐耐都咁閃；銅唔易同水反應，用嚟做水喉；鐵皮外面包一層鋅，因為鋅比鐵活潑，會「頂替」鐵先俾空氣同水蝕，保護入面嘅鐵唔生鏽。',
      en: 'Everyday life: gold and silver are very unreactive, so they are used for jewellery that stays shiny. Copper hardly reacts with water, so it is used for water pipes. Iron sheets are coated with zinc because zinc is more reactive than iron, so it gets attacked by air and water first and protects the iron from rusting.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '一種神秘金屬放落稀鹽酸，有少少泡泡，但係冒得比鋅慢。佢最可能係邊種金屬？', en: 'A mystery metal goes into dilute hydrochloric acid. It makes a few bubbles, but more slowly than zinc. Which metal is it most likely to be?' },
    options: [
      { zh: '鎂', en: 'Magnesium' },
      { zh: '鐵', en: 'Iron' },
      { zh: '銅', en: 'Copper' },
    ],
    correct: 1,
    right: { zh: '有冒泡，即係有反應，所以唔係銅；比鋅慢，即係冇鋅咁活潑，所以唔係鎂。答案係鐵！', en: 'It bubbles, so it reacts, which means it is not copper. It is slower than zinc, so it is less reactive than zinc, which rules out magnesium. The answer is iron!' },
    wrong: { zh: '再諗下比賽結果：鎂冒泡最快，鋅第二，鐵好慢，銅完全冇泡泡。', en: 'Think about the race: magnesium bubbled fastest, zinc came second, iron was slow, and copper made no bubbles at all.' },
  },
  tools: [
    { id: 'm', label: { zh: '放下一種金屬', en: 'Add the next metal' }, run: (c) => c.addNext() },
    { id: 'r', label: { zh: '頒下一個獎牌', en: 'Award the next medal' }, run: (c) => c.medalNext() },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = {}; METALS.forEach((m) => { S[m.id] = false; S['r_' + m.id] = 0; });
    const push = () => api.state({ ...S });
    const LIQ = '#e3f1fb', LV = 0.36, BH = 0.62;
    const bxs = [-1.8, -0.6, 0.6, 1.8], bz = -0.35;
    // 四個燒杯（稀鹽酸）
    const where = [null, null, null, null]; // 每個燒杯放咗邊種金屬（METALS 嘅 index）
    const beakers = bxs.map((x, i) => {
      const v = K.makeVessel(K.beakerProfile(0.3, BH), { liquidColor: LIQ, level: LV, opacity: 0.6, sx: 0.93 });
      v.group.position.set(x, T + 0.01, bz); scene.add(v.group);
      const lab = api.label((lang) => (where[i] === null ? (lang === 'zh' ? `燒杯 ${i + 1}` : `Beaker ${i + 1}`) : METALS[where[i]][lang]), { border: '#ea580c', h: 0.18 });
      lab.position.set(x, T + 0.95, bz);
      api.tap(v.group, () => api.emit('beaker'), { zh: '稀鹽酸燒杯', en: 'Beaker of dilute acid' }, [lab]);
      return { ...v, x, lab, bub: K.makeBubbles(v.group, { max: 200, size: 0.03 }), mouth: V3(x, T + 0.01 + BH, bz) };
    });

    // 後排：稀鹽酸樽、金戒指
    const acidB = K.makeBottle({ body: '#e0f2fe', cap: '#334155' }); acidB.g.position.set(-2.95, T, -1.2); scene.add(acidB.g);
    const warn = new THREE.Mesh(new THREE.CircleGeometry(0.08, 3), new THREE.MeshBasicMaterial({ color: '#f97316' })); warn.position.set(0, 0.22, 0.228); acidB.g.add(warn);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.035, 14, 36), K.stdMat('#f5c542', 0.2, 1)); ring.position.set(2.95, T + 0.17, -1.15); scene.add(ring);
    const ringBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.06, 24), K.stdMat('#7c2d12', 0.7)); ringBase.position.set(2.95, T + 0.03, -1.15); scene.add(ringBase);
    [[acidB.g, 'acid', { zh: '稀鹽酸', en: 'Dilute acid' }, -2.95, 1.05], [ring, 'ring', { zh: '金戒指', en: 'Gold ring' }, 2.95, 0.55]].forEach(([o, ev, name, x, y]) => {
      const l = api.label(name, { border: '#94a3b8', h: 0.16 }); l.position.set(x, T + y, -1.15);
      api.tap(o, () => api.emit(ev), name, o === ring ? [l, ringBase] : [l]);
    });

    // 前排：四種金屬（每種一個碟）
    const mxs = [-2.6, -1.5, -0.4, 0.7], mz = 0.95;
    const dishes = [];
    const pieces = METALS.map((m, i) => {
      const g = new THREE.Group(); g.position.set(mxs[i], T + 0.05, mz); scene.add(g);
      const mat = K.stdMat(m.col, m.id === 'fe' ? 0.6 : 0.3, m.id === 'fe' ? 0.6 : 0.85);
      for (let k = 0; k < 6; k++) {
        let s;
        if (m.id === 'mg') { s = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.012, 0.045), mat); s.position.set(-0.22 + k * 0.088, 0.02 + (k % 2) * 0.03, 0); s.rotation.z = k % 2 ? -0.45 : 0.45; }
        else if (m.id === 'zn') { s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.045), mat); s.position.set(Math.cos(k) * 0.09, 0.03, Math.sin(k) * 0.07); }
        else if (m.id === 'fe') { s = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.025, 0.035), mat); s.position.set(Math.cos(k * 1.3) * 0.1, 0.02, Math.sin(k * 1.3) * 0.08); s.rotation.y = k; }
        else { s = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.009, 6, 14, 4.5), mat); s.position.set(Math.cos(k * 1.1) * 0.1, 0.03, Math.sin(k * 1.1) * 0.08); s.rotation.set(k, k * 0.7, 0); }
        g.add(s);
      }
      const d = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.23, 0.04, 28), K.stdMat('#e2e8f0', 0.5)); d.position.set(mxs[i], T + 0.02, mz); scene.add(d); dishes.push(d);
      const lab = api.label(m, { border: m.col, h: 0.18 }); lab.position.set(0, -0.02, 0.4); g.add(lab);
      return { g, lab, home: g.position.clone() };
    });

    // 右邊：頒獎台同獎牌
    const pxs = [2.45, 1.95, 2.95], phs = [0.22, 0.14, 0.09], pz = 0.95;
    const podium = pxs.map((x, i) => { const b = new THREE.Mesh(new K.RoundedBoxGeometry(0.46, phs[i], 0.4, 2, 0.03), K.stdMat(['#fde68a', '#e2e8f0', '#fed7aa'][i], 0.6)); b.position.set(x, T + phs[i] / 2, pz); scene.add(b); return b; });
    const medals = MEDALS.map((md, i) => {
      const g = new THREE.Group(); g.position.set(pxs[i], T + phs[i], pz); scene.add(g);
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.035, 32), K.stdMat(md.col, 0.25, 0.9)); disc.rotation.x = Math.PI / 2; disc.position.y = 0.16; g.add(disc);
      const strap = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.14, 0.012), K.stdMat(['#dc2626', '#2563eb', '#16a34a'][i], 0.7)); strap.position.set(0, 0.32, -0.01); g.add(strap);
      const lab = api.label(md, { border: md.col, h: 0.15 }); lab.position.set(0, 0.52, 0); g.add(lab);
      return g;
    });
    const medalHome = medals.map((g) => g.position.clone());

    let busy = false, mgLeft = 1, feTint = 0;
    const idxOf = (id) => METALS.findIndex((m) => m.id === id);
    const beakerOf = (mi) => where.indexOf(mi);
    const nextMetal = () => METALS.findIndex((m) => !S[m.id]);
    const firstEmpty = () => where.indexOf(null);
    const allIn = () => METALS.every((m) => S[m.id]);
    const nextMedal = () => [0, 1, 2].find((r) => !S['r_' + METALS[r].id]) ?? -1;

    async function addMetal(mi, bi) {
      if (busy || S[METALS[mi].id] || bi < 0 || where[bi] !== null) return false;
      busy = true;
      const p = pieces[mi], B = beakers[bi];
      p.lab.visible = false;
      await K.moveTo(tw, p.g, V3(B.x, B.mouth.y + 0.4, bz), 0, 0.5);
      const from = p.g.position.clone(), to = V3(B.x, T + 0.03, bz);
      await tw.to(0.7, (k) => { p.g.position.lerpVectors(from, to, k * k); p.g.scale.setScalar(1 - 0.25 * k); });
      K.ripple(scene, tw, V3(B.x, T + 0.01 + LV, bz));
      where[bi] = mi; B.lab.userData.refresh();
      S[METALS[mi].id] = true; push();
      api.emit('m_' + METALS[mi].id);
      busy = false;
      if (allIn()) { api.done('race'); api.emit('raceAll'); }
    }
    async function award(r, bi, h) {
      if (busy || S['r_' + METALS[r].id] || where[bi] === null) return false;
      const mi = where[bi];
      if (mi !== r) { api.emit(METALS[mi].id === 'cu' ? 'rank_cu' : mi > r ? 'rank_slow' : 'rank_fast'); return false; }
      busy = true;
      const B = beakers[bi], spot = V3(B.x, T, bz + 0.45);
      await K.moveTo(tw, medals[r], V3(spot.x, spot.y + 0.5, spot.z), 0, 0.4);
      await K.moveTo(tw, medals[r], spot, 0, 0.35);
      h.setHome(spot);
      K.popText(scene, tw, ['🥇', '🥈', '🥉'][r], V3(B.x, T + 1.25, bz), MEDALS[r].col);
      S['r_' + METALS[r].id] = r + 1; push();
      api.emit('rank_' + (r + 1));
      busy = false;
      if (nextMedal() < 0) { api.done('rank'); api.emit('rankAll'); }
    }

    const hMetal = pieces.map((p, mi) => api.drag(p.g, {
      label: METALS[mi], lift: 0.9, extra: [dishes[mi]], enabled: () => !busy && !S[METALS[mi].id],
      targets: () => beakers.map((B, bi) => ({ key: 'b' + bi, pos: B.mouth, r: 0.42, ringY: T, accept: () => where[bi] === null })),
      onDrop: (tg) => addMetal(mi, Number(tg.key.slice(1))), onTap: () => { const bi = firstEmpty(); if (!busy && !S[METALS[mi].id] && bi >= 0) hMetal[mi].dropOn('b' + bi); },
    }));
    const hMedal = medals.map((g, r) => api.drag(g, {
      label: MEDALS[r], lift: 0.75, extra: [podium[r]], enabled: () => !busy && allIn() && !S['r_' + METALS[r].id],
      targets: () => beakers.map((B, bi) => ({ key: 'b' + bi, pos: B.mouth, r: 0.42, ringY: T, accept: () => where[bi] !== null && !METALS.some((m, j) => S['r_' + m.id] && where[bi] === j) })),
      onDrop: (tg, h) => award(r, Number(tg.key.slice(1)), h), onTap: () => { const bi = beakerOf(r); if (!busy && allIn() && !S['r_' + METALS[r].id] && bi >= 0) hMedal[r].dropOn('b' + bi); },
    }));

    push();
    return {
      cam: { pos: [0.15, 4.0, 5.3], target: [0.15, 1.35, 0], fitW: 7.0 },
      addNext() { const mi = nextMetal(), bi = firstEmpty(); if (mi >= 0 && bi >= 0 && !busy) hMetal[mi].dropOn('b' + bi); },
      medalNext() { const r = nextMedal(); if (r >= 0 && allIn() && !busy) hMedal[r].dropOn('b' + beakerOf(r)); },
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (id === 'race') {
          for (let mi = nextMetal(); mi >= 0; mi = nextMetal()) { while (busy) await tw.wait(0.1); await hMetal[mi].dropOn('b' + firstEmpty()); await api.waitSpeech(); }
        }
        if (id === 'rank') {
          for (let r = nextMedal(); r >= 0; r = nextMedal()) { while (busy) await tw.wait(0.1); await hMedal[r].dropOn('b' + beakerOf(r)); await api.waitSpeech(); }
        }
      },
      getHint(id) {
        if (busy) return null;
        if (id === 'race') { const mi = nextMetal(), bi = firstEmpty(); return mi < 0 || bi < 0 ? null : { from: K.worldOf(pieces[mi].g, 0.03), to: beakers[bi].mouth }; }
        if (id === 'rank') { const r = nextMedal(); return r < 0 || !allIn() ? null : { from: K.worldOf(medals[r], 0.2), to: beakers[beakerOf(r)].mouth }; }
        return null;
      },
      update(dt, t) {
        where.forEach((mi, bi) => {
          if (mi === null) return;
          const m = METALS[mi], B = beakers[bi];
          let rate = m.rate;
          if (m.id === 'mg') {
            rate *= mgLeft > 0 ? 1 : 0;
            if (mgLeft > 0) { mgLeft = Math.max(0, mgLeft - dt / 45); pieces[mi].g.scale.setScalar(0.75 * Math.max(0.02, mgLeft)); if (mgLeft <= 0) pieces[mi].g.visible = false; }
          }
          if (m.id === 'fe' && feTint < 1) { feTint = Math.min(1, feTint + dt / 25); B.mat.color.set(LIQ).lerp(new THREE.Color('#cfe8b8'), feTint); }
          if (rate && Math.random() < dt * rate) B.bub.spawn((Math.random() - 0.5) * 0.24, 0.06, (Math.random() - 0.5) * 0.24, LV - 0.01, m.id === 'mg' ? 1.1 : 0.8);
          if (m.id === 'mg' && rate && Math.random() < dt * rate) B.bub.spawn((Math.random() - 0.5) * 0.24, 0.06, (Math.random() - 0.5) * 0.24, LV - 0.01, 1);
        });
        beakers.forEach((B) => B.bub.update(dt, t));
      },
      reset() {
        tw.clear(); busy = false; mgLeft = 1; feTint = 0;
        METALS.forEach((m) => { S[m.id] = false; S['r_' + m.id] = 0; }); push();
        where.fill(null);
        beakers.forEach((B) => { B.bub.clear(); B.mat.color.set(LIQ); B.lab.userData.refresh(); });
        pieces.forEach((p) => { p.g.visible = true; p.g.scale.setScalar(1); p.lab.visible = true; });
        hMedal.forEach((h, r) => h.setHome(medalHome[r]));
        [...hMetal, ...hMedal].forEach((h) => { h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.busy = false; });
      },
    };
  },
};
