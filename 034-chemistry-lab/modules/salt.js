/* Topic 1.2 海洋＋Topic 9.1 分離混合物：由海水提取食鹽（過濾、蒸發） */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V2, V3 } = K;

const SEA = '#2f8fbf', FILTRATE = '#5cb6dc';

function Panel({ S }) {
  const { lang } = useApp();
  const zh = lang === 'zh';
  const st = S.stage ?? 0;
  const items = zh ? ['① 過濾：分開沙', '② 倒入蒸發皿', '③ 加熱蒸發：分開水同鹽'] : ['① Filter: remove the sand', '② Pour into the evaporating dish', '③ Heat: separate the water and salt'];
  return html`<div className="space-y-1.5">
    ${items.map((x, i) => html`<div key=${i} className=${`rounded-xl px-3 py-2 text-sm font-bold ${st > i ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : st === i ? 'bg-cyan-50 text-cyan-800 ring-2 ring-cyan-300' : 'bg-slate-50 text-slate-400 ring-1 ring-slate-200'}`}>${x} ${st > i ? '✓' : ''}</div>`)}
    <p className="text-xs text-slate-500">${zh ? '💡 為咗睇得清楚，海水加咗藍色；真實嘅海水同鹽水都係透明嘅。' : '💡 The seawater is coloured blue so it is easy to see. Real seawater and salty water are see-through.'}</p>
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    <path d="M0 72 Q25 58 50 72 T100 72 T150 72 T200 72 V110 H0Z" fill="#7dd3fc" />
    <path d="M0 84 Q25 70 50 84 T100 84 T150 84 T200 84 V110 H0Z" fill="#0ea5e9" />
    ${[[78, 26, 26], [112, 36, 20], [138, 18, 24]].map(([x, y, s]) => html`<g key=${x} transform=${`translate(${x} ${y})`}>
      <path d=${`M0 ${s * 0.3} L${s * 0.5} 0 L${s} ${s * 0.3} L${s * 0.5} ${s * 0.6} Z`} fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
      <path d=${`M0 ${s * 0.3} L${s * 0.5} ${s * 0.6} L${s * 0.5} ${s * 1.2} L0 ${s * 0.9} Z`} fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
      <path d=${`M${s} ${s * 0.3} L${s * 0.5} ${s * 0.6} L${s * 0.5} ${s * 1.2} L${s} ${s * 0.9} Z`} fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" /></g>`)}
  </svg>`;
}

const events = {
  pour: { zh: '海水倒入漏斗喇！濾紙好似一個有好多細窿嘅篩：沙太大粒過唔到，留咗喺濾紙上面；水同溶咗嘅鹽就穿過濾紙，流落錐形瓶。', en: 'Pouring the seawater into the funnel! Filter paper is like a sieve with lots of tiny holes: the sand is too big and stays on the paper, while the water and dissolved salt pass through into the flask.' },
  transfer: { zh: '將過濾好嘅鹽水倒入蒸發皿，準備加熱！', en: 'Pouring the filtered salty water into the evaporating dish, ready for heating!' },
  heat: { zh: '開始加熱！水慢慢變成水蒸氣飛走，鹽唔會蒸發，所以會留喺蒸發皿入面。', en: 'Heating! The water slowly turns into steam and floats away. Salt does not evaporate, so it stays in the dish.' },
  heat_done: { zh: '水蒸發晒喇，蒸發皿入面留低咗白色嘅鹽粒！撳蒸發皿，可以放大睇鹽嘅粒子點樣排列。', en: 'All the water has evaporated, leaving white salt crystals in the dish! Tap the dish to zoom in on how salt particles are arranged.' },
  filterBefore: { zh: '呢張係濾紙，摺成錐形放喺漏斗入面。佢有好多肉眼睇唔到嘅細窿。', en: 'This is filter paper, folded into a cone inside the funnel. It has lots of holes too small to see.' },
  filterAfter: { zh: '揭起濾紙睇下：啡色嘅沙全部畀佢捉住咗！', en: 'Lift up the filter paper and look: it has caught all the brown sand!' },
  flask: { zh: '呢個係錐形瓶，用嚟裝住過濾之後流落嚟嘅液體，叫做「濾液」。', en: 'This is a conical flask. It collects the liquid that passes through the filter, called the filtrate.' },
  crystal: { zh: '鹽嘅粒子放大咗好多好多倍：紫色細波波係鈉離子，綠色大波波係氯離子。佢哋好似砌積木咁，一粒隔一粒整齊排列，所以鹽粒會砌成正方體。', en: 'Here are salt particles, magnified many, many times. The small purple balls are sodium ions and the big green balls are chloride ions. They stack neatly, taking turns like building blocks, which is why salt crystals are cube-shaped.' },
  notYet: { zh: '咪住先！要跟次序做：① 先過濾，② 再倒入蒸發皿，③ 最後加熱。', en: 'Hold on! We need to go in order: ① filter first, ② pour into the evaporating dish, ③ then heat.' },
  beaker: { zh: '呢杯係海水：有水、有沙，仲有溶咗、睇唔見嘅鹽。（為咗睇得清楚，我哋將佢加咗藍色。）', en: 'This is seawater: water, sand, and invisible dissolved salt. (We coloured it blue so it is easy to see.)' },
  hotplate: { zh: '電熱板好熱㗎！真實實驗入面，千祈唔好掂熱嘅器材，一定要等佢凍咗先，同埋要有大人陪。', en: 'The hot plate gets very hot! In a real experiment, never touch hot equipment. Wait for it to cool down, and always have a grown-up with you.' },
  dish: { zh: '呢個係蒸發皿，用嚟加熱溶液，令水蒸發。', en: 'This is an evaporating dish. We heat solutions in it to make the water evaporate.' },
};

export default {
  id: 'salt', topics: ['1.2', '9.1'], accent: '#0891b2', dark: '#0e7490', bg: 'linear-gradient(135deg,#d6f1ff,#d9f7e6)', Art,
  theme: { bg: '#9fbdd4', wall: '#adc7dc', top: '#a8754a' },
  title: { zh: '海水變食鹽', en: 'From Seawater to Salt' },
  desc: { zh: '用過濾同蒸發，將海水入面嘅沙同鹽分開！', en: 'Use filtering and evaporating to separate the sand and salt in seawater!' },
  steps: [
    { tag: 'intro', zh: '海水好鹹，因為入面溶咗好多鹽：每 1000 克海水，大約有 35 克鹽。左邊呢杯海水仲有啲沙。為咗睇得清楚，我哋將海水加咗藍色。我哋點樣先可以由海水攞到乾淨嘅鹽呢？',
      en: 'Seawater tastes salty because lots of salt is dissolved in it: about 35 grams of salt in every 1000 grams of seawater. This beaker of seawater on the left also has some sand in it. We coloured it blue so it is easy to see. How can we get clean salt out of seawater?' },
    { tag: 'try', action: { id: 'filter', events: ['pour'] }, zh: '第一步：過濾。按住左邊嘅燒杯，拖去漏斗上面放手，就會倒落去。',
      en: 'Step one: filtering. Press and hold the beaker on the left, drag it over the funnel and let go to pour.' },
    { tag: 'observe', zh: '過濾之後，沙留咗喺濾紙上面，但流落錐形瓶嘅水仍然係鹹嘅。點解鹽冇畀濾紙隔走？因為鹽「溶解」咗，散開成極細嘅粒子，細到可以穿過濾紙嘅窿。撳漏斗可以揭起濾紙睇下。',
      en: 'After filtering, the sand stays on the filter paper, but the water in the flask is still salty. Why did the filter paper not catch the salt? Because the salt has dissolved: it has spread out into tiny particles that slip through the holes. Tap the funnel to lift the filter paper and look.' },
    { tag: 'try', action: { id: 'transfer', events: ['transfer'] }, zh: '第二步：將錐形瓶拖去右邊嘅蒸發皿，將鹽水倒入去。',
      en: 'Step two: drag the conical flask to the evaporating dish on the right to pour in the salty water.' },
    { tag: 'try', action: { id: 'heat', events: ['heat'] }, zh: '第三步：撳電熱板開始加熱。水會變成水蒸氣飛走，但鹽唔會，所以鹽會留低。真實做嘅時候，通常加熱到剩少少水就停，等餘熱慢慢蒸乾，鹽粒就唔會周圍彈。',
      en: 'Step three: tap the hot plate to start heating. The water turns into steam and floats away, but the salt does not, so the salt is left behind. In a real lab we usually stop heating when only a little water is left and let the leftover heat dry it, so the salt does not spit everywhere.' },
    { tag: 'observe', zh: '蒸發皿入面留低咗白色嘅鹽粒！撳蒸發皿，可以放大睇鹽嘅粒子點樣排列。', en: 'White salt crystals are left in the dish! Tap the dish to zoom in on how the salt particles are arranged.' },
    { tag: 'feynman', zh: '用一句說話解釋：分離混合物，就係利用每樣物質「唔同」嘅地方。沙粒大，溶咗嘅鹽粒子細，所以用過濾分開；水會蒸發，鹽唔會，所以用蒸發分開。',
      en: 'In one sentence: separating a mixture means using the ways the substances are different. Sand grains are big and dissolved salt particles are tiny, so filtering separates them. Water evaporates and salt does not, so evaporating separates them.' },
    { tag: 'first', zh: '由最基本諗起：如果你唔知點樣分開兩樣嘢，就問自己：「佢哋邊度唔同？」大細、溶唔溶喺水、會唔會蒸發、會唔會畀磁石吸……搵到唔同之處，就搵到分離方法。',
      en: 'Back to basics: if you do not know how to separate two things, ask yourself, "How are they different?" Size, whether they dissolve, whether they evaporate, whether a magnet attracts them... Find the difference and you will find the way to separate them.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '如果你想由海水得到可以飲嘅淡水，而唔係鹽，應該點做？', en: 'If you want drinkable fresh water from seawater, rather than salt, what should you do?' },
    options: [
      { zh: '只要過濾就得', en: 'Just filter it' },
      { zh: '加熱，再收集水蒸氣，令佢冷卻變返做水', en: 'Heat it, then collect the steam and cool it back into water' },
      { zh: '落多啲鹽', en: 'Add more salt' },
    ],
    correct: 1,
    right: { zh: '呢個方法叫「蒸餾」。水蒸氣冷卻之後變返做純淨嘅水，鹽就留喺原本個容器度。有啲缺水嘅地方，就係用類似方法將海水變成食水。', en: 'This method is called distillation. When the steam cools, it turns back into pure water, and the salt stays behind. Some places short of fresh water use similar methods to turn seawater into drinking water.' },
    wrong: { zh: '再諗下：過濾隔唔走溶咗嘅鹽。有咩方法可以令水同鹽分開，又可以留住啲水呢？', en: 'Think again: filtering cannot remove dissolved salt. Which method separates the water from the salt and still keeps the water?' },
  },
  tools: [
    { id: 'p', label: { zh: '① 倒入漏斗過濾', en: '① Pour into the funnel' }, run: (c) => c.pour() },
    { id: 't', label: { zh: '② 倒入蒸發皿', en: '② Pour into the dish' }, run: (c) => c.transfer() },
    { id: 'h', label: { zh: '③ 加熱蒸發', en: '③ Heat to evaporate' }, run: (c) => c.heat() },
    { id: 'l', label: { zh: '🔍 睇鹽嘅粒子排列', en: '🔍 See salt particles' }, run: (c) => c.toggleLattice(), disabled: (S) => (S.stage ?? 0) < 3 },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const Z = 0.25;
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p3 = new THREE.Vector3();
    // 燒杯（海水＋沙）
    const B_LEVEL = 0.62;
    const beaker = K.makeVessel(K.beakerProfile(0.4, 0.85), { liquidColor: SEA, level: B_LEVEL, opacity: 0.8, sx: 0.94, oy: 0.01 });
    const bHome = V3(-2.55, T, Z); beaker.group.position.copy(bHome); scene.add(beaker.group);
    const SAND = 40; const sand = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.034, 0), K.stdMat('#a16207', 0.95), SAND);
    const sandData = [...Array(SAND)].map(() => ({ r: 0.05 + Math.random() * 0.28, a: Math.random() * 6.28, y: 0.04 + Math.random() * 0.5, sp: 0.2 + Math.random() * 0.5 }));
    beaker.group.add(sand);
    const lB = api.label({ zh: '海水', en: 'Seawater' }, { border: '#0891b2', h: 0.2 }); lB.position.set(0, 0.16, 0.6); beaker.group.add(lB);
    // 鐵架、漏斗、濾紙
    const metal = K.stdMat('#475569', 0.35, 0.6);
    const plate = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.05, 0.8), metal); plate.position.set(-0.75, T + 0.025, Z); scene.add(plate);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.85, 12), metal); rod.position.set(-1.2, T + 0.95, Z); scene.add(rod);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.32, 10), metal); arm.rotation.z = Math.PI / 2; arm.position.set(-1.06, T + 1.7, Z); scene.add(arm);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.022, 10, 40), metal); ring.rotation.x = Math.PI / 2; ring.position.set(-0.6, T + 1.7, Z); scene.add(ring);
    const funnel = new THREE.Group(); funnel.position.set(-0.6, T + 1.0, Z); scene.add(funnel);
    const fShell = new THREE.Mesh(new THREE.LatheGeometry([V2(0.035, 0), V2(0.035, 0.36), V2(0.4, 0.78), V2(0.42, 0.8)], 40), K.glassMat()); fShell.renderOrder = 3; funnel.add(fShell);
    const filter = new THREE.Group(); funnel.add(filter);
    const paper = new THREE.Mesh(new THREE.LatheGeometry([V2(0.004, 0.39), V2(0.37, 0.81)], 40), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.95, side: THREE.DoubleSide })); filter.add(paper);
    const sandCone = new THREE.Mesh(new THREE.LatheGeometry([V2(0, 0), V2(0.13, 0.13), V2(0, 0.13)], 24), K.stdMat('#a16207', 0.95)); sandCone.position.y = 0.4; sandCone.scale.setScalar(0.001); filter.add(sandCone);
    const lF = api.label({ zh: '漏斗＋濾紙', en: 'Funnel + filter paper' }, { border: '#64748b', h: 0.2 }); lF.position.set(-0.6, T + 0.16, Z + 0.62);
    // 錐形瓶
    const FK_MAX = 0.33;
    const flask = K.makeVessel(K.flaskProfile(1), { liquidColor: FILTRATE, level: 0, opacity: 0.8, sx: 0.93 });
    const fHome = V3(-0.6, T + 0.05, Z); flask.group.position.copy(fHome); scene.add(flask.group);
    // 電熱板＋蒸發皿
    const hp = K.makeHotplate(); hp.g.position.set(2.05, T, Z); scene.add(hp.g);
    const dish = K.makeDish(FILTRATE); dish.group.position.set(2.05, T + 0.22, Z); scene.add(dish.group);
    const lD = api.label({ zh: '蒸發皿＋電熱板', en: 'Dish + hot plate' }, { border: '#ef4444', h: 0.2 }); lD.position.set(2.05, T + 0.16, Z + 0.72);
    const steam = K.makeSteam(scene);
    const lattice = K.makeLattice(); lattice.position.set(2.05, T + 1.55, Z); lattice.visible = false; lattice.scale.setScalar(0.001); scene.add(lattice);
    const lNa = api.label({ zh: '紫色：鈉離子 Na⁺', en: 'Purple: sodium ion Na⁺' }, { border: '#8b5cf6', h: 0.18 }); lNa.position.set(0, -0.42, 0); lattice.add(lNa);
    const lCl = api.label({ zh: '綠色：氯離子 Cl⁻', en: 'Green: chloride ion Cl⁻' }, { border: '#22c55e', h: 0.18 }); lCl.position.set(0, -0.62, 0); lattice.add(lCl);
    const stream = K.makeStream(scene, SEA, 0.045);

    let stage = 0, busy = false, heating = false, filterUp = false, latticeOn = false, lbusy = false;
    const setStage = (s) => { stage = s; api.state({ stage: s }); };
    const funnelTop = V3(-0.6, T + 1.8, Z), dishTarget = V3(2.05, T + 0.5, Z);

    async function pour(h = hBk) {
      if (busy) return false;
      if (stage > 0) return false;
      busy = true; api.emit('pour');
      const rot = -1.25, lipT = V3(-0.9, T + 2.05, Z), base = K.tipPose(V2(0.45, 0.9), rot, lipT), fIn = V3(-0.6, T + 1.6, Z);
      await K.moveTo(tw, beaker.group, base, rot, 0.9);
      stream.mesh.material.color.set(SEA);
      await tw.to(2.8, (e, k) => {
        stream.set(lipT, fIn);
        beaker.setLevel(B_LEVEL - (B_LEVEL - 0.05) * k);
        sand.count = Math.round(SAND * (1 - K.smooth(0, 0.8, k)));
        sandCone.scale.setScalar(Math.max(0.001, K.smooth(0.05, 0.9, k)));
        flask.setLevel(FK_MAX * K.smooth(0.15, 1, k));
      }, K.lin);
      stream.hide();
      await h.returnHome();
      busy = false; setStage(1); api.done('filter');
    }
    async function transfer(h = hFk) {
      if (busy) return false;
      if (stage !== 1) { api.emit('notYet'); return false; }
      if (filterUp) toggleFilter(true);
      busy = true; api.emit('transfer');
      const rot = -1.35, lipT = V3(1.62, T + 0.98, Z), base = K.tipPose(V2(0.135, 0.92), rot, lipT);
      await K.moveTo(tw, flask.group, base, rot, 0.9);
      stream.mesh.material.color.set(FILTRATE);
      await tw.to(2.2, (e, k) => { stream.set(lipT, V3(2.05, T + 0.3, Z)); flask.setLevel(FK_MAX * (1 - k)); dish.setLevel(dish.MAX * K.smooth(0.1, 1, k)); }, K.lin);
      stream.hide();
      await h.returnHome();
      busy = false; setStage(2); api.done('transfer');
    }
    async function heat() {
      if (busy) return;
      if (stage < 2) { api.emit(stage === 0 ? 'notYet' : 'hotplate'); return; }
      if (stage > 2) { api.emit('hotplate'); return; }
      busy = true; api.emit('heat');
      await tw.to(1.0, (k) => hp.setHeat(k)); heating = true;
      await tw.to(6.5, (e, k) => { dish.setLevel(dish.MAX * (1 - k)); dish.setCrystals(K.smooth(0.3, 1, k)); }, K.lin);
      await tw.to(1.2, (k) => hp.setHeat(1 - k)); heating = false;
      await api.waitSpeech();
      busy = false; setStage(3); api.done('heat'); api.emit('heat_done');
    }
    function toggleFilter(silent) {
      if (!silent) api.emit(stage >= 1 ? 'filterAfter' : 'filterBefore');
      const up = !filterUp; filterUp = up;
      tw.add(0.7, (k) => { const s = up ? k : 1 - k; filter.position.set(0, 0.85 * s, 0.25 * s); filter.rotation.x = 0.55 * s; });
    }
    function toggleLattice() {
      if (stage < 3) { api.emit('notYet'); return; }
      if (lbusy) return; lbusy = true;
      latticeOn = !latticeOn;
      if (latticeOn) { lattice.visible = true; api.emit('crystal'); }
      const on = latticeOn;
      tw.add(0.7, (k) => lattice.scale.setScalar(Math.max(0.001, on ? k : 1 - k)), () => { lbusy = false; if (!on) lattice.visible = false; });
    }
    const hBk = api.drag(beaker.group, { label: { zh: '海水燒杯', en: 'Beaker of seawater' }, lift: 0.9, enabled: () => !busy && stage === 0,
      targets: () => [{ key: 'funnel', pos: funnelTop, r: 0.6, ringY: T, accept: () => stage === 0 }],
      onDrop: (tg, h) => pour(h), onTap: () => (stage === 0 ? hBk.dropOn('funnel') : api.emit('beaker')) });
    const hFk = api.drag(flask.group, { label: { zh: '錐形瓶', en: 'Conical flask' }, lift: 0.5, enabled: () => !busy && stage === 1,
      targets: () => [{ key: 'dish', pos: dishTarget, r: 0.6, ringY: T + 0.22, accept: () => stage === 1 }],
      onDrop: (tg, h) => transfer(h), onTap: () => (stage === 1 ? hFk.dropOn('dish') : api.emit('flask')) });
    api.tap(funnel, () => { if (!busy) toggleFilter(); }, { zh: '漏斗同濾紙', en: 'Funnel and filter paper' }, [lF]);
    api.tap(hp.g, () => heat(), { zh: '電熱板', en: 'Hot plate' }, [lD]);
    api.tap(dish.group, () => (stage === 3 ? toggleLattice() : stage === 2 ? heat() : api.emit('dish')), { zh: '蒸發皿', en: 'Evaporating dish' });
    api.tap(lattice, () => toggleLattice(), { zh: '鹽嘅粒子排列', en: 'How salt particles are arranged' });
    setStage(0);

    return {
      cam: { pos: [-0.25, 4.2, 5.6], target: [-0.25, 1.7, 0.1], fitW: 5.7 },
      pour: () => (stage === 0 ? hBk.dropOn('funnel') : null),
      transfer: () => (stage === 1 ? hFk.dropOn('dish') : api.emit('notYet')),
      heat, toggleLattice,
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (id === 'filter' && stage === 0) await hBk.dropOn('funnel');
        if (id === 'transfer' && stage === 1) await hFk.dropOn('dish');
        if (id === 'heat' && stage === 2) await heat();
      },
      getHint(id) {
        if (id === 'filter') return { from: K.worldOf(beaker.group, 0.5), to: funnelTop };
        if (id === 'transfer') return { from: K.worldOf(flask.group, 0.6), to: dishTarget };
        if (id === 'heat') return { from: K.worldOf(hp.g, 0.25) };
        return null;
      },
      update(dt, t) {
        if (sand.count > 0) {
          sandData.forEach((d, i) => { const a = d.a + t * d.sp; p3.set(Math.cos(a) * d.r, d.y + Math.sin(t * 1.3 + i) * 0.02, Math.sin(a) * d.r); sc.setScalar(1); sand.setMatrixAt(i, m4.compose(p3, q.identity(), sc)); });
          sand.instanceMatrix.needsUpdate = true;
        }
        steam.update(dt, t, heating, V3(2.05, T + 0.45, Z));
        if (latticeOn) lattice.rotation.y += dt * 0.5;
      },
      reset() {
        tw.clear(); busy = false; heating = false; lbusy = false; stream.hide(); steam.clear();
        beaker.group.position.copy(bHome); beaker.group.rotation.set(0, 0, 0); beaker.setLevel(B_LEVEL); sand.count = SAND;
        sandCone.scale.setScalar(0.001); filterUp = false; filter.position.set(0, 0, 0); filter.rotation.x = 0;
        flask.group.position.copy(fHome); flask.group.rotation.set(0, 0, 0); flask.setLevel(0);
        dish.setLevel(0); dish.setCrystals(0); hp.setHeat(0);
        latticeOn = false; lattice.visible = false; lattice.scale.setScalar(0.001);
        [hBk, hFk].forEach((h) => { h.busy = false; });
        setStage(0);
      },
    };
  },
};
