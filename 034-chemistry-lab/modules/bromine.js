/* Topic 7.3 烷和烯：用溴水分辨烷同烯（加成反應） */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V2, V3 } = K;

const ORANGE = '#e8862a';
const TUBES = [
  { k: 'A', zh: 'A：加烷', en: 'A: add alkane', drop: { zh: '烷（己烷）', en: 'Alkane (hexane)' }, after: ORANGE },
  { k: 'B', zh: 'B：加烯', en: 'B: add alkene', drop: { zh: '烯（己烯）', en: 'Alkene (hexene)' }, after: '#f8fafc' },
];

function Panel({ S }) {
  const { pick, lang } = useApp();
  const zh = lang === 'zh';
  return html`<div className="grid gap-1.5 text-sm">
    <div className="rounded-xl bg-rose-50 ring-1 ring-rose-300 px-3 py-2 text-rose-800"><b>⚠️ ${zh ? '安全：' : 'Safety: '}</b>${zh ? '溴有毒又有腐蝕性，只可以由老師喺抽氣櫃入面做。' : 'Bromine is toxic and corrosive. Only a teacher may use it, inside a fume cupboard.'}</div>
    ${TUBES.map((t, i) => html`<div key=${t.k} className="flex items-center gap-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2">
      <span className="flex-1 font-bold text-slate-700">${pick(t)}</span>
      <span className="text-xs text-slate-500">${S['a' + i] ? (zh ? '加咗' : 'added') : '—'}</span>
      <span className="w-4 h-4 rounded-full inline-block" style=${{ background: ORANGE }}></span><span className="text-slate-400">→</span>
      <span className="w-4 h-4 rounded-full inline-block ring-1 ring-slate-300" style=${{ background: S['k' + i] ? t.after : '#e2e8f0' }}></span>
      <span className="text-xs text-slate-600 w-16">${S['k' + i] ? (i ? (zh ? '褪色 ✅' : 'decolourised ✅') : (zh ? '仍然橙色' : 'still orange')) : '—'}</span>
    </div>`)}
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    ${[[70, '#e8862a'], [130, '#f1f5f9']].map(([x, c]) => html`<g key=${x}>
      <rect x=${x - 14} y="10" width="28" height="92" rx="14" fill="#fff" fillOpacity=".9" stroke="#cbd5e1" strokeWidth="3" />
      <rect x=${x - 10} y="44" width="20" height="54" rx="10" fill=${c} />
    </g>`)}
    <text x="62" y="34" fontSize="14" fontWeight="900" fill="#64748b">C–C</text><text x="120" y="34" fontSize="14" fontWeight="900" fill="#64748b">C=C</text>
  </svg>`;
}

const events = {
  ad_A: { zh: 'A 試管加咗幾滴烷。', en: 'A few drops of alkane are in tube A.' },
  ad_B: { zh: 'B 試管加咗幾滴烯。', en: 'A few drops of alkene are in tube B.' },
  ad_wrong: { zh: '每支試管淨係加一種：A 加烷，B 加烯，咁先可以比較。', en: 'Each tube gets only one: alkane in A and alkene in B, so we can compare them.' },
  sk_need: { zh: '要先加液體落試管，先好搖。', en: 'Add the liquid to the tube first, then shake.' },
  sk_A: { zh: 'A（烷）：搖完之後，溴水仍然係橙色。', en: 'A (alkane): after shaking, the bromine water is still orange.' },
  sk_B: { zh: 'B（烯）：搖完之後，橙色即刻消失，變成無色！', en: 'B (alkene): after shaking, the orange colour disappears straight away and it becomes colourless!' },
  skAll: { zh: '比較一下：只有烯可以令溴水褪色。', en: 'Compare them: only the alkene decolourises the bromine water.' },
  hood: { zh: '抽氣櫃會將有毒嘅氣體抽走。溴實驗一定要喺入面做。', en: 'The fume cupboard draws away poisonous fumes. Bromine experiments must be done inside it.' },
  bag: { zh: '膠袋係用乙烯整嘅聚乙烯，乙烯就係一種烯。', en: 'Plastic bags are made of polyethene, which is made from ethene, an alkene.' },
  model: { zh: '呢個模型係乙烯：兩粒碳原子之間有一條「雙鍵」。', en: 'This model is ethene: its two carbon atoms are joined by a double bond.' },
};

export default {
  id: 'bromine', topics: ['7.3'], accent: '#ea580c', dark: '#9a3412', bg: 'linear-gradient(135deg,#ffedd5,#f1f5f9)', Art,
  title: { zh: '溴水褪色', en: 'The Bromine Water Test' },
  desc: { zh: '烷同烯睇落一樣，點樣分？滴落橙色溴水，邊個令佢褪色就係烯！', en: 'Alkanes and alkenes look the same, so how can we tell? Whichever one turns orange bromine water colourless is the alkene!' },
  steps: [
    { tag: 'intro', zh: '烷同烯都係由碳同氫組成嘅「碳氫化合物」，好多都係無色液體，睇落一模一樣。分別在於：烯嘅碳原子之間有一條「雙鍵」，烷就只有單鍵。今日我哋用橙色嘅溴水做偵探，分辨佢哋。安全提提你：溴有毒又有腐蝕性，只可以由老師喺抽氣櫃入面做。後面嘅物件可以撳嚟睇介紹。',
      en: 'Alkanes and alkenes are both hydrocarbons, made of carbon and hydrogen. Many are colourless liquids that look exactly the same. The difference is that alkenes have a double bond between carbon atoms, while alkanes only have single bonds. Today we will use orange bromine water as our detective to tell them apart. Safety first: bromine is toxic and corrosive, so only a teacher may use it, inside a fume cupboard. Tap the objects at the back to learn about them.' },
    { tag: 'try', action: { id: 'add', events: ['ad_'] }, zh: '將「烷」滴管拖去 A 試管，再將「烯」滴管拖去 B 試管。', en: 'Drag the alkane dropper to tube A, then the alkene dropper to tube B.' },
    { tag: 'try', action: { id: 'shake', events: ['sk_'] }, zh: '逐支試管撳一下，搖一搖，睇下溴水嘅顏色有冇變。', en: 'Tap each tube to shake it, and see whether the bromine water changes colour.' },
    { tag: 'observe', zh: '加咗烯嘅 B 試管，橙色即刻消失，變成無色；加咗烷嘅 A 試管就仍然係橙色。所以溴水可以用嚟分辨烷同烯。',
      en: 'In tube B, with the alkene, the orange colour disappears straight away; in tube A, with the alkane, it stays orange. So bromine water can tell alkanes and alkenes apart.' },
    { tag: 'feynman', zh: '雙鍵好似兩粒碳原子用咗兩隻手互相拉住。遇到溴，其中一對手就會鬆開，改為捉住溴原子。溴俾烯「食」咗，橙色就冇咗。烷嘅碳原子冇多出嚟嘅手，所以捉唔到溴。',
      en: 'A double bond is like two carbon atoms holding each other with two hands. When bromine comes along, one pair of hands lets go and grabs the bromine atoms instead. The alkene "eats" the bromine, so the orange colour disappears. Alkane carbons have no spare hands, so they cannot grab the bromine.' },
    { tag: 'first', zh: '由最基本諗起：溴分子係橙色。烯嘅雙鍵打開，兩粒溴原子分別加到兩粒碳原子上面，變成一種無色嘅新物質，呢種反應叫「加成反應」。烷已經用晒所有位置連住氫，叫「飽和」，所以喺冇強光嘅情況下唔會同溴水反應。',
      en: 'Back to basics: bromine molecules are orange. The alkene\'s double bond opens and a bromine atom adds to each carbon, making a new colourless substance. This is called an addition reaction. Alkanes already use every bonding position for hydrogen, so they are called saturated, and they do not react with bromine water unless there is strong light.' },
    { tag: 'life', zh: '生活應用：工廠會將乙烯呢種烯變成聚乙烯，用嚟整膠袋同膠樽（下一個實驗「史萊姆」會講）。化驗師亦會用溴水，測試油同物質入面有冇雙鍵。',
      en: 'Everyday life: factories turn ethene, an alkene, into polyethene for plastic bags and bottles (more in the next experiment, Slime Science). Chemists also use bromine water to test whether oils and other substances contain double bonds.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '一種未知嘅無色液體加落溴水，一搖橙色就消失。佢最可能係咩？', en: 'An unknown colourless liquid is added to bromine water, and the orange colour vanishes when shaken. What is it most likely to be?' },
    options: [{ zh: '一種烷', en: 'An alkane' }, { zh: '一種烯', en: 'An alkene' }, { zh: '清水', en: 'Water' }],
    correct: 1,
    right: { zh: '啱！只有有雙鍵嘅烯，先會同溴發生加成反應，令溴水褪色。', en: 'Right! Only alkenes, with their double bond, undergo an addition reaction with bromine and decolourise it.' },
    wrong: { zh: '再諗下 A 同 B 試管：邊一支嘅溴水褪色？', en: 'Think about tubes A and B: in which one did the bromine water lose its colour?' },
  },
  tools: [
    { id: 'a', label: { zh: '加下一種液體', en: 'Add the next liquid' }, run: (c) => c.addNext() },
    { id: 's', label: { zh: '搖下一支試管', en: 'Shake the next tube' }, run: (c) => c.shakeNext() },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = { a0: false, a1: false, k0: false, k1: false };
    const push = () => api.state({ ...S });
    const xs = [-0.45, 0.45], TZ = -0.4, TY = T + 0.07, LV = 0.85, TH = 1.25;
    // 抽氣櫃
    const hoodMat = new THREE.MeshPhysicalMaterial({ color: '#e0f2fe', roughness: 0.1, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false });
    const hood = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.1, 1.3), hoodMat); hood.position.set(0, T + 1.05, -0.55); hood.renderOrder = 1; scene.add(hood);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.1, 1.4), K.stdMat('#cbd5e1', 0.5)); frame.position.set(0, T + 2.12, -0.55); scene.add(frame);
    const lHood = api.label({ zh: '抽氣櫃', en: 'Fume cupboard' }, { border: '#64748b', h: 0.15 }); lHood.position.set(0, T + 2.3, -0.55);
    api.tap(frame, () => api.emit('hood'), { zh: '抽氣櫃', en: 'Fume cupboard' }, [lHood]);
    const rack = K.makeRack(xs, 0.2, 1.6, 0.6); rack.position.set(0, T, TZ); scene.add(rack);
    const tubes = TUBES.map((t, i) => {
      const v = K.makeVessel(K.tubeProfile(0.17, TH), { liquidColor: ORANGE, level: LV, opacity: 0.8 });
      v.group.position.set(xs[i], TY, TZ); scene.add(v.group);
      const lab = api.label(t, { border: i ? '#16a34a' : '#64748b', h: 0.15 }); lab.position.set(xs[i], T + 1.55, TZ);
      api.tap(v.group, () => tapTube(i), t, [lab]);
      return { ...v, mouth: V3(xs[i], TY + TH, TZ) };
    });
    // 滴管
    const drops = TUBES.map((t, i) => {
      const b = K.makeBottle({ body: '#f8fafc', cap: i ? '#16a34a' : '#64748b', dropper: true, glass: true }); b.g.position.set(i ? 1.9 : -1.9, T, 0.9); scene.add(b.g);
      const l = api.label(t.drop, { border: i ? '#16a34a' : '#64748b', h: 0.15 }); l.position.set(0, 0.1, 0.42); b.g.add(l);
      return b;
    });
    // 後排：膠袋、乙烯模型
    const bag = new THREE.Mesh(new K.RoundedBoxGeometry(0.4, 0.5, 0.06, 3, 0.03), new THREE.MeshPhysicalMaterial({ color: '#f8fafc', roughness: 0.3, transparent: true, opacity: 0.8 })); bag.position.set(-2.8, T + 0.25, -1.15); scene.add(bag);
    const model = new THREE.Group(); model.position.set(2.75, T + 0.35, -1.15); scene.add(model);
    [-0.12, 0.12].forEach((x) => { const c = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), K.stdMat('#1f2937', 0.4)); c.position.x = x; model.add(c); [-1, 1].forEach((s) => { const hh = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), K.stdMat('#f8fafc', 0.4)); hh.position.set(x + Math.sign(x) * 0.1, s * 0.12, 0); model.add(hh); }); });
    [-0.03, 0.03].forEach((y) => { const bnd = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.24, 8), K.stdMat('#94a3b8', 0.4)); bnd.rotation.z = Math.PI / 2; bnd.position.y = y; model.add(bnd); });
    [[bag, 'bag', { zh: '膠袋', en: 'Plastic bag' }, -2.8, 0.7], [model, 'model', { zh: '乙烯模型', en: 'Ethene model' }, 2.75, 0.68]].forEach(([o, ev, name, x, y]) => {
      const l = api.label(name, { border: '#94a3b8', h: 0.14 }); l.position.set(x, T + y, -1.15);
      api.tap(o, () => api.emit(ev), name, [l]);
    });

    let busy = false;
    async function add(di, ti, h) {
      if (busy || S['a' + di]) return false;
      if (di !== ti) { api.emit('ad_wrong'); return false; }
      busy = true;
      const target = V3(xs[ti], TY + TH + 0.25, TZ);
      await K.moveTo(tw, drops[di].g, K.tipPose(V2(0, 0.86), 2.1, target), 2.1, 0.5);
      await K.dripDrop(scene, tw, target, V3(xs[ti], TY + LV, TZ), '#f1f5f9');
      S['a' + di] = true; push(); api.emit(di ? 'ad_B' : 'ad_A');
      await h.returnHome();
      busy = false;
      if (S.a0 && S.a1) api.done('add');
    }
    async function shake(i) {
      if (busy || S['k' + i]) return;
      if (!S['a' + i]) { api.emit('sk_need'); return; }
      busy = true;
      const g = tubes[i].group;
      await tw.to(1.1, (k) => { g.rotation.z = Math.sin(k * Math.PI * 8) * 0.22 * (1 - k); g.position.y = TY + Math.abs(Math.sin(k * Math.PI * 8)) * 0.06 * (1 - k); }, K.lin);
      g.rotation.z = 0; g.position.y = TY;
      api.emit(i ? 'sk_B' : 'sk_A');
      if (i === 1) { const c0 = new THREE.Color(ORANGE), c1 = new THREE.Color('#f8fafc'); await tw.to(1.2, (k) => { tubes[1].mat.color.copy(c0).lerp(c1, k); tubes[1].mat.opacity = 0.8 - 0.45 * k; }); }
      S['k' + i] = true; push();
      busy = false;
      if (S.k0 && S.k1) { api.done('shake'); api.emit('skAll'); }
    }
    function tapTube(i) { if (!busy) shake(i); }
    const hD = drops.map((b, di) => api.drag(b.g, { label: TUBES[di].drop, lift: 0.9, enabled: () => !busy && !S['a' + di],
      targets: () => tubes.map((tb, ti) => ({ key: 't' + ti, pos: tb.mouth, r: 0.4, ringY: T, accept: () => !S['a' + di] })),
      onDrop: (tg, h) => add(di, Number(tg.key.slice(1)), h), onTap: () => { if (!busy && !S['a' + di]) hD[di].dropOn('t' + di); } }));

    const nextAdd = () => (S.a0 ? (S.a1 ? -1 : 1) : 0);
    const nextShake = () => (S.k0 ? (S.k1 ? -1 : 1) : 0);
    push();
    return {
      cam: { pos: [0, 3.8, 4.9], target: [0, 1.45, -0.1], fitW: 6.4 },
      addNext() { const i = nextAdd(); if (!busy && i >= 0) hD[i].dropOn('t' + i); },
      shakeNext() { const i = nextShake(); if (i >= 0) shake(i); },
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (id === 'add') for (let i = nextAdd(), c = 0; i >= 0 && c < 3; i = nextAdd(), c++) { while (busy) await tw.wait(0.1); await hD[i].dropOn('t' + i); await api.waitSpeech(); }
        if (id === 'shake') for (let i = nextShake(), c = 0; i >= 0 && c < 3; i = nextShake(), c++) { while (busy) await tw.wait(0.1); await shake(i); await api.waitSpeech(); }
      },
      getHint(id) {
        if (busy) return null;
        if (id === 'add') { const i = nextAdd(); return i < 0 ? null : { from: K.worldOf(drops[i].g, 0.5), to: tubes[i].mouth }; }
        if (id === 'shake') { const i = nextShake(); return i < 0 ? null : { from: K.worldOf(tubes[i].group, 0.4) }; }
        return null;
      },
      reset() {
        tw.clear(); busy = false;
        Object.keys(S).forEach((k) => { S[k] = false; }); push();
        tubes.forEach((tb) => { tb.mat.color.set(ORANGE); tb.mat.opacity = 0.8; tb.group.rotation.z = 0; tb.group.position.y = TY; });
        hD.forEach((h) => { h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.busy = false; });
      },
    };
  },
};
