/* Topic 7.2 同系列、結構式和命名：砌烷（甲烷、乙烷、丙烷）同命名 */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V3 } = K;

const ALK = [
  { n: 1, zh: '甲烷', en: 'Methane', f: 'CH₄' },
  { n: 2, zh: '乙烷', en: 'Ethane', f: 'C₂H₆' },
  { n: 3, zh: '丙烷', en: 'Propane', f: 'C₃H₈' },
];

function Panel({ S }) {
  const { pick, lang } = useApp();
  const zh = lang === 'zh';
  return html`<div className="grid gap-1.5 text-sm">
    <div className="grid grid-cols-[1fr_1fr_1.2fr_0.6fr] gap-2 px-3 text-xs font-black text-slate-500"><span>${zh ? '名稱' : 'Name'}</span><span>${zh ? '碳' : 'Carbons'}</span><span>${zh ? '化學式' : 'Formula'}</span><span>${zh ? '名牌' : 'Tag'}</span></div>
    ${ALK.map((a) => html`<div key=${a.n} className="grid grid-cols-[1fr_1fr_1.2fr_0.6fr] gap-2 items-center rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2">
      <b className="text-slate-700">${pick(a)}</b><span className="text-slate-600">${(S.n || 0) >= a.n ? a.n : '—'}</span>
      <span className="font-mono text-slate-700">${(S.n || 0) >= a.n ? a.f : '—'}</span><span>${S['t' + a.n] ? '✅' : '—'}</span>
    </div>`)}
    <div className="rounded-xl bg-amber-50 ring-1 ring-amber-200 px-3 py-2 text-amber-900">${zh ? '甲 = 1、乙 = 2、丙 = 3、丁 = 4 粒碳。每多一粒碳，就多一個 CH₂。' : 'meth- = 1, eth- = 2, prop- = 3, but- = 4 carbons. Each extra carbon adds one CH₂.'}</div>
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    ${[60, 100, 140].map((x) => html`<g key=${x}>
      <line x1=${x} y1="55" x2=${x} y2="25" stroke="#94a3b8" strokeWidth="4" /><line x1=${x} y1="55" x2=${x} y2="85" stroke="#94a3b8" strokeWidth="4" />
      <circle cx=${x} cy="22" r="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" /><circle cx=${x} cy="88" r="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
    </g>`)}
    <line x1="30" y1="55" x2="170" y2="55" stroke="#94a3b8" strokeWidth="4" />
    <circle cx="26" cy="55" r="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" /><circle cx="174" cy="55" r="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
    ${[60, 100, 140].map((x) => html`<circle key=${x} cx=${x} cy="55" r="13" fill="#1f2937" />`)}
  </svg>`;
}

const events = {
  bd_1: { zh: '甲烷：1 粒碳，4 粒氫。佢係天然氣嘅主要成分。', en: 'Methane: 1 carbon and 4 hydrogens. It is the main part of natural gas.' },
  bd_2: { zh: '乙烷：2 粒碳，6 粒氫。多咗一粒碳同兩粒氫。', en: 'Ethane: 2 carbons and 6 hydrogens. One more carbon and two more hydrogens.' },
  bd_3: { zh: '丙烷：3 粒碳，8 粒氫。又多咗一粒碳同兩粒氫！', en: 'Propane: 3 carbons and 8 hydrogens. Once again, one more carbon and two more hydrogens!' },
  bd_full: { zh: '分子板已經砌好丙烷喇！', en: 'The board already shows propane!' },
  nm_ok: { zh: '啱名！', en: 'Right name!' },
  nm_wrong: { zh: '唔係呢個喎。數下有幾多粒碳：甲係 1 粒，乙係 2 粒，丙係 3 粒，丁係 4 粒。', en: 'Not this one. Count the carbons: meth- means 1, eth- means 2, prop- means 3 and but- means 4.' },
  nm_need: { zh: '先砌好分子，先好貼名牌。', en: 'Build the molecules first, then add the name tags.' },
  nmAll: { zh: '三個名牌都貼啱晒！', en: 'All three name tags are in the right places!' },
  gas: { zh: '天然氣同沼氣嘅主要成分係甲烷。', en: 'Natural gas and biogas are mostly methane.' },
  lighter: { zh: '打火機入面嘅燃料係丁烷，有 4 粒碳。', en: 'The fuel in a lighter is butane, with 4 carbons.' },
};

export default {
  id: 'carbonchain', topics: ['7.2'], accent: '#0f766e', dark: '#134e4a', bg: 'linear-gradient(135deg,#ccfbf1,#f1f5f9)', Art,
  title: { zh: '碳鏈積木', en: 'Carbon Chain Builder' },
  desc: { zh: '用碳同氫砌甲烷、乙烷、丙烷，發現同系列嘅規律，再學識點樣改名！', en: 'Build methane, ethane and propane from carbon and hydrogen, spot the pattern of a homologous series, and learn how they are named!' },
  steps: [
    { tag: 'intro', zh: '石油同天然氣入面有好多「碳氫化合物」，佢哋由碳同氫組成。最簡單嘅一族叫「烷」。今日我哋用積木砌烷，再學識佢哋嘅名！後面嘅物件可以撳嚟睇介紹。',
      en: 'Crude oil and natural gas contain many hydrocarbons, made of carbon and hydrogen. The simplest family is the alkanes. Today we will build alkanes with model kits and learn their names! Tap the objects at the back to learn about them.' },
    { tag: 'try', action: { id: 'build', events: ['bd_'] }, zh: '將黑色嘅碳原子逐粒拖去分子板，砌出甲烷、乙烷同丙烷。白色嘅氫原子會自動補上。',
      en: 'Drag the black carbon atoms to the model board one at a time to build methane, ethane and propane. The white hydrogen atoms are added automatically.' },
    { tag: 'observe', zh: '甲烷有 1 粒碳、4 粒氫；乙烷有 2 粒碳、6 粒氫；丙烷有 3 粒碳、8 粒氫。每多一粒碳，就多兩粒氫。呢班性質相似、一個比一個多一粒碳同兩粒氫嘅化合物，叫做「同系列」。',
      en: 'Methane has 1 carbon and 4 hydrogens; ethane has 2 carbons and 6 hydrogens; propane has 3 carbons and 8 hydrogens. Each extra carbon brings two extra hydrogens. A family of similar compounds where each member adds one carbon and two hydrogens is called a homologous series.' },
    { tag: 'try', action: { id: 'name', events: ['nm_'] }, zh: '將前面嘅名牌拖去啱嘅分子。提示：甲、乙、丙、丁分別代表 1、2、3、4 粒碳。', en: 'Drag the name tags at the front to the right molecules. Hint: meth-, eth-, prop- and but- mean 1, 2, 3 and 4 carbons.' },
    { tag: 'feynman', zh: '烷好似一列火車：每卡車廂係一粒碳，每卡都有兩粒氫做乘客，車頭同車尾仲各多一粒氫。火車越長，名就由甲、乙、丙、丁一路排落去。',
      en: 'An alkane is like a train: each carriage is a carbon carrying two hydrogen passengers, with one extra hydrogen at the front and one at the back. The longer the train, the further along the names go: meth-, eth-, prop-, but-.' },
    { tag: 'first', zh: '由最基本諗起：碳原子有 4 隻「手」，即係可以形成 4 條鍵；氫只有 1 隻。烷入面每粒碳都用單鍵連住其他原子，所以叫「飽和」。有 n 粒碳嘅烷，就有 2n 加 2 粒氫。碳鏈越長，沸點越高（記得石油分層嗎？）。',
      en: 'Back to basics: a carbon atom has 4 "hands", so it forms 4 bonds; hydrogen has only 1. In an alkane every carbon uses single bonds, so alkanes are called saturated. An alkane with n carbons has 2n plus 2 hydrogens. The longer the chain, the higher the boiling point (remember Sorting Crude Oil?).' },
    { tag: 'life', zh: '生活應用：甲烷係天然氣同沼氣嘅主要成分；丙烷同丁烷係石油氣，用嚟煮食同燒烤；丁烷亦係打火機入面嘅燃料。',
      en: 'Everyday life: methane is the main part of natural gas and biogas; propane and butane make up petroleum gas, used for cooking and barbecues; and butane is the fuel inside lighters.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '丁烷有幾多粒碳原子？', en: 'How many carbon atoms does butane have?' },
    options: [{ zh: '2 粒', en: '2' }, { zh: '4 粒', en: '4' }, { zh: '6 粒', en: '6' }],
    correct: 1,
    right: { zh: '啱！「丁」代表 4 粒碳，所以丁烷有 4 粒碳同 10 粒氫。', en: 'Right! But- means 4 carbons, so butane has 4 carbons and 10 hydrogens.' },
    wrong: { zh: '再諗下：甲、乙、丙、丁，分別代表幾多粒碳？', en: 'Think again: how many carbons do meth-, eth-, prop- and but- stand for?' },
  },
  tools: [
    { id: 'b', label: { zh: '加一粒碳', en: 'Add a carbon' }, run: (c) => c.addC() },
    { id: 'n', label: { zh: '貼下一個名牌', en: 'Place the next tag' }, run: (c) => c.tagNext() },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = { n: 0, t1: false, t2: false, t3: false };
    const push = () => api.state({ ...S });
    const cMat = K.stdMat('#1f2937', 0.35), hMat = K.stdMat('#f8fafc', 0.4), bMat = K.stdMat('#94a3b8', 0.4);
    const UP = new THREE.Vector3(0, 1, 0);
    function bond(g, a, b) {
      const d = b.clone().sub(a), len = d.length();
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, len, 8), bMat);
      m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(UP, d.normalize()); g.add(m);
    }
    // 砌一粒有 n 粒碳嘅烷（原點喺分子中間）
    function alkane(n, scale = 1) {
      const g = new THREE.Group(), D = 0.36 * scale;
      const cs = [...Array(n)].map((_, i) => V3((i - (n - 1) / 2) * D, (i % 2 ? -0.04 : 0.04) * scale, 0));
      cs.forEach((p, i) => {
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.1 * scale, 16, 12), cMat); c.position.copy(p); g.add(c);
        const hs = [V3(p.x, p.y + 0.26 * scale, 0), V3(p.x, p.y - 0.26 * scale, 0)];
        if (i === 0) hs.push(V3(p.x - 0.26 * scale, p.y, 0));
        if (i === n - 1) hs.push(V3(p.x + 0.26 * scale, p.y, 0));
        hs.forEach((hp) => { const h = new THREE.Mesh(new THREE.SphereGeometry(0.06 * scale, 12, 8), hMat); h.position.copy(hp); g.add(h); bond(g, p, hp); });
        if (i > 0) bond(g, cs[i - 1], p);
      });
      return g;
    }
    // 分子板（砌嘅位置）
    const BX = -0.6, BZ = 0.05;
    const board = new THREE.Mesh(new K.RoundedBoxGeometry(2.0, 0.04, 0.9, 2, 0.02), K.stdMat('#e0f2fe', 0.6)); board.position.set(BX, T + 0.02, BZ); scene.add(board);
    const lBoard = api.label((lang) => { const a = ALK[S.n - 1]; return a ? `${lang === 'zh' ? a.zh : a.en}  ${a.f}` : (lang === 'zh' ? '分子板' : 'Model board'); }, { border: '#0f766e', h: 0.16 }); lBoard.position.set(BX, T + 0.1, BZ + 0.6);
    let model = null;
    const rebuild = () => { if (model) scene.remove(model); model = S.n ? alkane(S.n) : null; if (model) { model.position.set(BX, T + 0.4, BZ); scene.add(model); } lBoard.userData.refresh(); };
    // 碳原子盒
    const bin = new THREE.Mesh(new K.RoundedBoxGeometry(0.5, 0.06, 0.4, 2, 0.02), K.stdMat('#e2e8f0', 0.5)); bin.position.set(1.4, T + 0.03, 0.4); scene.add(bin);
    const carbon = new THREE.Group(); carbon.position.set(1.4, T + 0.16, 0.4); scene.add(carbon);
    const cBall = new THREE.Mesh(new THREE.SphereGeometry(0.12, 18, 14), cMat); carbon.add(cBall);
    const cHit = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); carbon.add(cHit);
    const lC = api.label({ zh: '碳原子', en: 'Carbon atom' }, { border: '#1f2937', h: 0.14 }); lC.position.set(0, -0.1, 0.3); carbon.add(lC);
    // 名牌架（後排三個分子，砌完先出現）
    const SX = [-1.8, -0.4, 1.0], SZ = -1.45;
    const shelfModels = ALK.map((a, i) => { const m = alkane(a.n, 0.8); m.position.set(SX[i], T + 0.7, SZ); m.visible = false; scene.add(m); return m; });
    SX.forEach((x) => { const st = new THREE.Mesh(new K.RoundedBoxGeometry(0.9, 0.05, 0.4, 2, 0.02), K.stdMat('#f1f5f9', 0.6)); st.position.set(x, T + 0.025, SZ); scene.add(st); });
    const tagSpot = (i) => V3(SX[i], T + 0.12, SZ + 0.25);
    const order = [2, 0, 1]; // 名牌喺前面嘅次序（打亂）
    const tags = ALK.map((a, i) => {
      const g = new THREE.Group(); g.position.set(-2.2 + order.indexOf(i) * 0.85, T + 0.05, 1.0); g.visible = false; scene.add(g);
      const card = new THREE.Mesh(new K.RoundedBoxGeometry(0.6, 0.05, 0.28, 2, 0.02), K.stdMat('#fef3c7', 0.6)); card.position.y = 0.025; g.add(card);
      const l = api.label(a, { border: '#ca8a04', h: 0.15 }); l.position.set(0, 0.1, 0); g.add(l);
      return { g, home: g.position.clone() };
    });
    // 後排：煤氣爐、打火機
    const stove = new THREE.Mesh(new K.RoundedBoxGeometry(0.45, 0.1, 0.35, 2, 0.02), K.stdMat('#334155', 0.5)); stove.position.set(2.75, T + 0.05, -0.9); scene.add(stove);
    const lighter = new THREE.Mesh(new K.RoundedBoxGeometry(0.1, 0.28, 0.05, 2, 0.02), K.stdMat('#ef4444', 0.4)); lighter.position.set(2.75, T + 0.14, -0.3); scene.add(lighter);
    [[stove, 'gas', { zh: '煤氣爐', en: 'Gas stove' }, 2.75, 0.3, -0.9], [lighter, 'lighter', { zh: '打火機', en: 'Lighter' }, 2.75, 0.45, -0.3]].forEach(([o, ev, name, x, y, z]) => {
      const l = api.label(name, { border: '#94a3b8', h: 0.13 }); l.position.set(x, T + y, z);
      api.tap(o, () => api.emit(ev), name, [l]);
    });

    let busy = false;
    async function addCarbon(h = hC) {
      if (busy) return false;
      if (S.n >= 3) { api.emit('bd_full'); return false; }
      busy = true;
      await K.moveTo(tw, carbon, V3(BX + 0.3, T + 0.5, BZ), 0, 0.4);
      S.n += 1; rebuild(); push();
      api.emit('bd_' + S.n);
      await h.returnHome();
      busy = false;
      if (S.n >= 3) { api.done('build'); shelfModels.forEach((m) => { m.visible = true; }); tags.forEach((t) => { t.g.visible = true; }); }
    }
    async function placeTag(ti, si, h) {
      if (busy || S['t' + ALK[ti].n]) return false;
      if (S.n < 3) { api.emit('nm_need'); return false; }
      if (ti !== si) { api.emit('nm_wrong'); return false; }
      busy = true;
      await K.moveTo(tw, tags[ti].g, tagSpot(si), 0, 0.5);
      h.setHome(tagSpot(si));
      S['t' + ALK[ti].n] = true; push(); api.emit('nm_ok');
      busy = false;
      if (S.t1 && S.t2 && S.t3) { api.done('name'); api.emit('nmAll'); }
    }
    const hC = api.drag(carbon, { label: { zh: '碳原子', en: 'Carbon atom' }, lift: 0.6, extra: [bin], enabled: () => !busy && S.n < 3,
      targets: () => [{ key: 'board', pos: V3(BX, T + 0.3, BZ), r: 0.7, ringY: T, accept: () => S.n < 3 }], onDrop: (tg, h) => addCarbon(h),
      onTap: () => { if (busy) return; if (S.n < 3) hC.dropOn('board'); else api.emit('bd_full'); } });
    const hT = tags.map((t, ti) => api.drag(t.g, { label: ALK[ti], lift: 0.6, enabled: () => !busy && t.g.visible && !S['t' + ALK[ti].n],
      targets: () => ALK.map((a, si) => ({ key: 's' + si, pos: tagSpot(si), r: 0.35, ringY: T, accept: () => !S['t' + a.n] || si === ti })),
      onDrop: (tg, h) => placeTag(ti, Number(tg.key.slice(1)), h), onTap: () => { if (!busy && t.g.visible && !S['t' + ALK[ti].n]) hT[ti].dropOn('s' + ti); } }));

    const nextTag = () => ALK.findIndex((a) => !S['t' + a.n]);
    push();
    return {
      cam: { pos: [0.2, 4.0, 4.6], target: [0.2, 1.0, -0.4], fitW: 6.0 },
      addC: () => { if (!busy && S.n < 3) hC.dropOn('board'); },
      tagNext() { const i = nextTag(); if (!busy && S.n >= 3 && i >= 0) hT[i].dropOn('s' + i); },
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (id === 'build') for (let c = 0; S.n < 3 && c < 4; c++) { while (busy) await tw.wait(0.1); await hC.dropOn('board'); await api.waitSpeech(); }
        if (id === 'name') for (let i = nextTag(), c = 0; i >= 0 && c < 4; i = nextTag(), c++) { while (busy) await tw.wait(0.1); await hT[i].dropOn('s' + i); }
      },
      getHint(id) {
        if (busy) return null;
        if (id === 'build') return S.n >= 3 ? null : { from: K.worldOf(carbon), to: V3(BX, T + 0.3, BZ) };
        if (id === 'name') { const i = nextTag(); return i < 0 || S.n < 3 ? null : { from: K.worldOf(tags[i].g, 0.05), to: tagSpot(i) }; }
        return null;
      },
      reset() {
        tw.clear(); busy = false;
        Object.assign(S, { n: 0, t1: false, t2: false, t3: false }); push(); rebuild();
        shelfModels.forEach((m) => { m.visible = false; });
        tags.forEach((t, i) => { t.g.visible = false; hT[i].setHome(t.home); });
        [hC, ...hT].forEach((h) => { h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.busy = false; });
      },
    };
  },
};
