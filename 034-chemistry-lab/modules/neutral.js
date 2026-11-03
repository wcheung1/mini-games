/* Topic 4.4 中和作用和鹽的製備 */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V2, V3 } = K;

const UNI = ['#d7191c', '#e8331f', '#f05a24', '#f7941d', '#fdb913', '#f5e11b', '#c8dc2b', '#74c043', '#2fa84f', '#14a58d', '#1d7fc4', '#2a59a8', '#433f98', '#5b2c8f', '#6a1f80'];
// 每加一滴酸之後嘅 pH（第 4 滴啱啱中和）
const PH = [13, 12.5, 11.8, 10.4, 7, 3, 2.2, 1.8];
const colorOf = (ph) => { const a = Math.floor(ph), b = Math.min(14, a + 1), k = ph - a; return new THREE.Color(UNI[a]).lerp(new THREE.Color(UNI[b]), k); };
const hexOf = (ph) => '#' + colorOf(ph).getHexString();

function Panel({ S }) {
  const { lang } = useApp();
  const zh = lang === 'zh';
  const ph = S.ph ?? 13;
  const kind = ph < 6.5 ? (zh ? '酸性' : 'acidic') : ph > 7.5 ? (zh ? '鹼性' : 'alkaline') : (zh ? '中性 🎯' : 'neutral 🎯');
  return html`<div className="space-y-2">
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2">
      <span className="w-10 h-10 rounded-full ring-4 ring-white shadow" style=${{ background: hexOf(ph) }}></span>
      <div className="flex-1"><div className="font-black text-slate-800 text-lg">pH ${ph.toFixed(1)}</div><div className="text-sm text-slate-600">${kind}</div></div>
      <div className="text-xs text-slate-500 text-right">${zh ? '已加酸' : 'Acid drops'}<br /><b className="text-base text-slate-700">${S.drops ?? 0}</b></div>
    </div>
    <div className="relative h-5 rounded-full overflow-hidden" style=${{ background: `linear-gradient(90deg, ${UNI.join(',')})` }}>
      <div className="absolute top-0 bottom-0 w-1.5 bg-white ring-2 ring-slate-800 rounded" style=${{ left: `calc(${(ph / 14) * 100}% - 3px)` }}></div>
      <div className="absolute top-0 bottom-0 w-px bg-white/80" style=${{ left: '50%' }}></div>
    </div>
    ${S.salt ? html`<p className="text-sm font-bold text-emerald-700">${zh ? '🧂 得到食鹽（氯化鈉）！酸 ＋ 鹼 → 鹽 ＋ 水' : '🧂 We made table salt (sodium chloride)! acid + alkali → salt + water'}</p>` : null}
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    <path d="M86 14 h28 v28 l30 54 a6 6 0 0 1 -5 9 h-78 a6 6 0 0 1 -5 -9 l30 -54z" fill="#fff" fillOpacity=".9" stroke="#cbd5e1" strokeWidth="3" />
    <path d="M70 68 h60 l14 28 a5 5 0 0 1 -4 7 h-80 a5 5 0 0 1 -4 -7z" fill="#74c043" />
    <path d="M100 0 q-7 10 0 14 q7 -4 0 -14z" fill="#ef4444" />
    <rect x="20" y="60" width="26" height="40" rx="4" fill="#d7191c" /><rect x="154" y="60" width="26" height="40" rx="4" fill="#5b2c8f" />
  </svg>`;
}

const events = {
  nt_still: { zh: '加咗一滴酸，顏色變咗少少，但仲係鹼性。再加！', en: 'One drop of acid. The colour changed a little, but it is still alkaline. Add more!' },
  nt_green: { zh: '變綠色喇！pH 係 7，係中性。酸同鹼啱啱好互相抵消晒，呢個就叫「中和」！', en: 'It turned green! pH 7 means neutral. The acid and alkali have exactly cancelled each other out. This is called neutralisation!' },
  nt_over: { zh: '哎呀，落多咗酸，變咗紅色，即係酸性喇。冇問題！用右邊嘅稀氫氧化鈉加返一滴鹼，救返佢。', en: 'Oops, too much acid! It turned red, so now it is acidic. No problem: add a drop of alkali with the sodium hydroxide bottle to fix it.' },
  nt_back: { zh: '加咗一滴鹼，溶液向鹼嗰邊返去喇。', en: 'One drop of alkali moves the solution back towards the alkaline side.' },
  nt_max: { zh: '已經夠鹼喇，唔使再加鹼。試下加酸！', en: 'It is already alkaline enough. Try adding acid instead!' },
  ev_notyet: { zh: '要先將溶液變成綠色（中性），先可以拎去蒸發。', en: 'First make the solution green (neutral), then we can evaporate it.' },
  ev_pour: { zh: '將中和咗嘅溶液倒入蒸發皿，開始加熱！', en: 'Pouring the neutralised solution into the evaporating dish and heating it!' },
  ev_salt: { zh: '水蒸發晒，留低咗白色晶體。呢啲係食鹽，化學名叫「氯化鈉」！', en: 'All the water has evaporated, leaving white crystals. This is table salt, called sodium chloride!' },
  flask: { zh: '錐形瓶入面係稀氫氧化鈉（鹼），加咗萬用指示劑，所以係紫色。', en: 'The conical flask holds dilute sodium hydroxide (an alkali) with universal indicator, so it is purple.' },
  antacid: { zh: '胃藥入面有弱鹼，可以中和胃入面太多嘅胃酸，令胃冇咁痛。', en: 'Antacid tablets contain a weak alkali that neutralises extra stomach acid, so your tummy hurts less.' },
  toothpaste: { zh: '牙膏係弱鹼性，可以幫手中和口腔細菌整出嚟、會蛀牙嘅酸。', en: 'Toothpaste is weakly alkaline. It helps neutralise the acid that mouth bacteria make, which causes tooth decay.' },
  hotplate: { zh: '電熱板好熱㗎！真實實驗入面，千祈唔好掂熱嘅器材。', en: 'The hot plate gets very hot! In a real experiment, never touch hot equipment.' },
};

export default {
  id: 'neutral', topics: ['4.4'], accent: '#10b981', dark: '#047857', bg: 'linear-gradient(135deg,#dcfce7,#e0f2fe)', Art,
  title: { zh: '中和魔法：酸鹼變鹽', en: 'Neutralisation: Making Salt' },
  desc: { zh: '一滴一滴加酸落鹼，搵出啱啱好嘅綠色，再將佢變成食鹽！', en: 'Add acid to alkali drop by drop, find the perfect green, then turn it into table salt!' },
  steps: [
    { tag: 'intro', zh: '酸同鹼係一對冤家，撞埋一齊會互相抵消，呢個叫做「中和」。錐形瓶入面係稀氫氧化鈉，係一種鹼，我哋加咗萬用指示劑，所以佢係紫色。左邊係稀鹽酸，右邊係稀氫氧化鈉。',
      en: 'Acids and alkalis are like rivals: when they meet, they cancel each other out. This is called neutralisation. The conical flask holds dilute sodium hydroxide, an alkali, with universal indicator added, so it is purple. On the left is dilute hydrochloric acid, and on the right is dilute sodium hydroxide.' },
    { tag: 'try', action: { id: 'neutral', events: ['nt_'] }, zh: '你嘅任務：令溶液變成綠色（pH 7）。將左邊嘅稀鹽酸滴瓶拖去錐形瓶，每次加一滴，一邊加一邊睇顏色。落多咗變紅？用右邊嘅鹼救返佢！',
      en: 'Your mission: make the solution green (pH 7). Drag the dilute acid dropper on the left to the flask to add one drop at a time, and watch the colour. Added too much and it turned red? Rescue it with the alkali on the right!' },
    { tag: 'observe', zh: '綠色代表中性。酸同鹼嘅份量啱啱好，互相抵消晒。科學家要做得準，就會一滴一滴慢慢加，仲會一路搖勻個錐形瓶。',
      en: 'Green means neutral. The amounts of acid and alkali are just right, so they cancel each other out completely. To be accurate, scientists add the acid slowly, drop by drop, and keep swirling the flask.' },
    { tag: 'try', action: { id: 'evap', events: ['ev_'] }, zh: '中和完之後，溶液入面仲有啲咩？將錐形瓶拖去右邊嘅蒸發皿，加熱睇下！',
      en: 'After neutralising, what is left in the solution? Drag the flask to the evaporating dish on the right and heat it to find out!' },
    { tag: 'observe', zh: '水蒸發晒，留低白色晶體，係食鹽（氯化鈉）！所以：酸 ＋ 鹼 → 鹽 ＋ 水。化學入面「鹽」係一大家族，食鹽只係其中一種。記住：實驗室整出嚟嘅鹽千祈唔好食！',
      en: 'All the water evaporates, leaving white crystals: table salt, sodium chloride! So: acid + alkali → salt + water. In chemistry, "salts" are a big family, and table salt is just one of them. Remember: never eat salt made in a lab!' },
    { tag: 'feynman', zh: '用最簡單嘅說話講：酸帶住好多「氫離子」，鹼帶住好多「氫氧根離子」。一粒氫離子同一粒氫氧根離子一撞埋，就變成一粒水。兩邊數量一樣多嘅時候，就全部變晒水，溶液就係中性。',
      en: 'In the simplest words: acids carry lots of hydrogen ions, and alkalis carry lots of hydroxide ions. When one hydrogen ion meets one hydroxide ion, they become one particle of water. When there are exactly the same number of each, they all turn into water and the solution is neutral.' },
    { tag: 'first', zh: '由最基本諗起：點解越接近綠色，越要慢慢加？因為一開始有好多氫氧根離子，一滴酸只係抵消少少；但到最後只剩返好少，一滴酸已經足夠令佢由鹼性變成酸性。所以去到最後，一滴就決定成敗！',
      en: 'Back to basics: why do we need to go slower as we get close to green? At the start there are lots of hydroxide ions, so one drop of acid only cancels a few. Near the end there are very few left, so a single drop can flip the solution from alkaline to acidic. At the end, one drop makes all the difference!' },
    { tag: 'life', zh: '生活應用：胃酸太多會胃痛，胃藥入面嘅弱鹼可以中和胃酸；牙膏係弱鹼性，幫手中和蛀牙嘅酸；農夫會喺太酸嘅泥土撒熟石灰，令植物生得好啲。後面嘅物件都可以撳嚟睇介紹。',
      en: 'Everyday life: too much stomach acid gives you a tummy ache, and the weak alkali in antacids neutralises it; toothpaste is weakly alkaline and helps neutralise the acid that causes tooth decay; farmers spread slaked lime on soil that is too acidic so plants grow better. Tap the objects at the back to learn more.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '胃酸太多會胃痛。醫生俾嘅胃藥，最有可能係咩性質？', en: 'Too much stomach acid gives you a tummy ache. What kind of medicine is an antacid most likely to be?' },
    options: [{ zh: '強酸性', en: 'Strongly acidic' }, { zh: '弱鹼性', en: 'Weakly alkaline' }, { zh: '同醋一樣', en: 'The same as vinegar' }],
    correct: 1,
    right: { zh: '弱鹼可以中和多餘嘅胃酸，又唔會太強傷到身體。所以胃藥通常係弱鹼性。', en: 'A weak alkali can neutralise the extra stomach acid without being strong enough to harm the body. That is why antacids are usually weakly alkaline.' },
    wrong: { zh: '再諗下：要抵消太多嘅酸，應該加酸定加鹼？', en: 'Think again: to cancel out too much acid, should we add acid or alkali?' },
  },
  tools: [
    { id: 'a', label: { zh: '加一滴酸', en: 'Add a drop of acid' }, run: (c) => c.addAcid() },
    { id: 'b', label: { zh: '加一滴鹼', en: 'Add a drop of alkali' }, run: (c) => c.addAlkali() },
    { id: 'c', label: { zh: '倒去蒸發皿加熱', en: 'Pour into dish and heat' }, run: (c) => c.evap() },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = { drops: 0, ph: PH[0], salt: false, poured: false };
    const push = () => api.state({ ...S });
    const FS = 1.15, LV = 0.38;
    const flask = K.makeVessel(K.flaskProfile(FS), { liquidColor: hexOf(PH[0]), level: LV, opacity: 0.9, sx: 0.93 });
    const fHome = V3(-0.3, T + 0.01, -0.2);
    flask.group.position.copy(fHome); scene.add(flask.group);
    const mouth = () => V3(flask.group.position.x, T + 0.01 + 0.92 * FS, flask.group.position.z);
    // pH 計（顯示數字）
    const meter = new THREE.Mesh(new K.RoundedBoxGeometry(0.5, 0.36, 0.14, 3, 0.04), K.stdMat('#334155', 0.5)); meter.position.set(0.75, T + 0.18, 0.1); scene.add(meter);
    const mLab = api.label(() => `pH ${S.ph.toFixed(1)}`, { border: () => hexOf(S.ph), h: 0.26 }); mLab.position.set(0.75, T + 0.62, 0.1);
    const fLab = api.label({ zh: '鹼＋萬用指示劑', en: 'Alkali + indicator' }, { border: '#10b981', h: 0.17 }); fLab.position.set(0, 1.35, 0); flask.group.add(fLab);
    // 滴瓶
    const acid = K.makeBottle({ body: '#fde2e2', cap: '#dc2626', dropper: true, glass: true }); acid.g.position.set(-2.0, T, 0.9); scene.add(acid.g);
    const lA = api.label({ zh: '稀鹽酸（酸）', en: 'Dilute acid' }, { border: '#dc2626', h: 0.17 }); lA.position.set(0, 0.1, 0.42); acid.g.add(lA);
    const alk = K.makeBottle({ body: '#e0e7ff', cap: '#4338ca', dropper: true, glass: true }); alk.g.position.set(1.15, T, 0.95); scene.add(alk.g);
    const lB = api.label({ zh: '稀氫氧化鈉（鹼）', en: 'Dilute alkali' }, { border: '#4338ca', h: 0.17 }); lB.position.set(0, 0.1, 0.42); alk.g.add(lB);
    // 電熱板＋蒸發皿
    const hp = K.makeHotplate(); hp.g.position.set(2.45, T, -0.25); scene.add(hp.g);
    const dish = K.makeDish('#9fdc7a'); dish.group.position.set(2.45, T + 0.22, -0.25); scene.add(dish.group);
    const lD = api.label({ zh: '蒸發皿', en: 'Evaporating dish' }, { border: '#ef4444', h: 0.17 }); lD.position.set(2.45, T + 0.12, 0.45);
    api.tap(hp.g, () => (S.drops === 4 && !S.poured ? hF.dropOn('dish') : api.emit('hotplate')), { zh: '電熱板', en: 'Hot plate' }, [lD]);
    const steam = K.makeSteam(scene); let heating = false;
    const lattice = K.makeLattice(); lattice.position.set(2.45, T + 1.4, -0.25); lattice.scale.setScalar(0.001); lattice.visible = false; scene.add(lattice);
    // 後排：生活例子
    const pills = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.12), K.stdMat('#bae6fd', 0.5)); pills.position.set(-2.6, T + 0.15, -1.2); scene.add(pills);
    const tp = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.45, 6, 12), K.stdMat('#f8fafc', 0.4)); tp.rotation.z = Math.PI / 2; tp.position.set(-1.6, T + 0.09, -1.25); scene.add(tp);
    [[pills, 'antacid', { zh: '胃藥', en: 'Antacid' }, -2.6], [tp, 'toothpaste', { zh: '牙膏', en: 'Toothpaste' }, -1.6]].forEach(([o, ev, name, x]) => {
      const l = api.label(name, { border: '#94a3b8', h: 0.15 }); l.position.set(x, T + 0.55, -1.2); api.tap(o, () => api.emit(ev), name, [l]);
    });

    let busy = false;
    const setPh = (d) => { S.drops = d; S.ph = PH[d]; mLab.userData.refresh(); push(); };
    async function drip(bottle, h, color) {
      const target = V3(mouth().x, mouth().y + 0.15, mouth().z);
      await K.moveTo(tw, bottle.g, K.tipPose(V2(0, 0.86), 2.1, target), 2.1, 0.55);
      await K.dripDrop(scene, tw, target, V3(target.x, T + 0.01 + LV, target.z), color);
      return h.returnHome();
    }
    async function swirlTo(ph) {
      const from = flask.mat.color.clone(), to = colorOf(ph);
      await tw.to(0.9, (k, raw) => { flask.mat.color.copy(from).lerp(to, k); flask.group.rotation.z = Math.sin(raw * Math.PI * 4) * 0.05 * (1 - raw); });
    }
    async function addAcid(h = hA) {
      if (busy || S.poured) return false;
      if (S.drops >= PH.length - 1) { api.emit('nt_over'); return false; }
      busy = true;
      const back = drip(acid, h, '#fca5a5');
      await tw.wait(1.0);
      const d = S.drops + 1; setPh(d);
      api.emit(d === 4 ? 'nt_green' : d > 4 ? 'nt_over' : 'nt_still');
      await swirlTo(PH[d]); await back;
      busy = false;
      if (d === 4) api.done('neutral');
    }
    async function addAlkali(h = hB) {
      if (busy || S.poured) return false;
      if (S.drops <= 0) { api.emit('nt_max'); return false; }
      busy = true;
      const back = drip(alk, h, '#c7d2fe');
      await tw.wait(1.0);
      const d = S.drops - 1; setPh(d);
      api.emit(d === 4 ? 'nt_green' : 'nt_back');
      await swirlTo(PH[d]); await back;
      busy = false;
      if (d === 4) api.done('neutral');
    }
    async function evap(h = hF) {
      if (busy || S.poured) return false;
      if (S.drops !== 4) { api.emit('ev_notyet'); return false; }
      busy = true; S.poured = true; push();
      api.emit('ev_pour');
      const lip = V3(2.05, T + 1.0, -0.25);
      await K.moveTo(tw, flask.group, K.tipPose(V2(0.135 * FS, 0.92 * FS), -1.35, lip), -1.35, 0.8);
      const stream = K.makeStream(scene, hexOf(7), 0.035);
      await tw.to(2.0, (e, k) => { stream.set(lip, V3(2.45, T + 0.32, -0.25)); flask.setLevel(LV * (1 - k)); dish.setLevel(dish.MAX * K.smooth(0.1, 1, k)); }, K.lin);
      stream.hide();
      await h.returnHome();
      await api.waitSpeech();
      heating = true;
      await tw.to(1.0, (k) => hp.setHeat(k));
      await tw.to(5.0, (e, k) => { dish.setLevel(dish.MAX * (1 - k)); dish.setCrystals(K.smooth(0.3, 1, k)); }, K.lin);
      heating = false;
      tw.to(1.2, (k) => hp.setHeat(1 - k));
      S.salt = true; push();
      api.emit('ev_salt');
      lattice.visible = true; await tw.to(0.7, (k) => lattice.scale.setScalar(Math.max(0.001, k)));
      busy = false; api.done('evap');
    }
    const hA = api.drag(acid.g, { label: { zh: '稀鹽酸滴瓶', en: 'Dilute acid dropper' }, lift: 0.9, enabled: () => !busy && !S.poured,
      targets: () => [{ key: 'f', pos: mouth(), r: 0.55, ringY: T }], onDrop: (tg, h) => addAcid(h), onTap: () => hA.dropOn('f') });
    const hB = api.drag(alk.g, { label: { zh: '稀氫氧化鈉滴瓶', en: 'Dilute alkali dropper' }, lift: 0.9, enabled: () => !busy && !S.poured,
      targets: () => [{ key: 'f', pos: mouth(), r: 0.55, ringY: T }], onDrop: (tg, h) => addAlkali(h), onTap: () => hB.dropOn('f') });
    const hF = api.drag(flask.group, { label: { zh: '錐形瓶', en: 'Conical flask' }, lift: 0.6, extra: [fLab], enabled: () => !busy && !S.poured,
      targets: () => [{ key: 'dish', pos: V3(2.45, T + 0.5, -0.25), r: 0.6, ringY: T + 0.22, accept: () => S.drops === 4 }],
      onDrop: (tg, h) => evap(h), onTap: () => api.emit(S.drops === 4 ? 'ev_notyet' : 'flask') });
    // 錐形瓶喺中和之前撳 = 介紹；中和咗之後撳 = 提示拖去蒸發皿
    hF.opts.onTap = () => { if (S.drops === 4 && !S.poured) hF.dropOn('dish'); else api.emit('flask'); };

    push();
    return {
      cam: { pos: [0.2, 3.9, 5.0], target: [0.2, 1.35, -0.1], fitW: 6.0 },
      addAcid: () => hA.dropOn('f'), addAlkali: () => hB.dropOn('f'), evap: () => (S.drops === 4 ? hF.dropOn('dish') : api.emit('ev_notyet')),
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (id === 'neutral') {
          while (S.drops !== 4) {
            while (busy) await tw.wait(0.1);
            await (S.drops < 4 ? hA.dropOn('f') : hB.dropOn('f'));
            await api.waitSpeech();
          }
        }
        if (id === 'evap' && !S.poured) await hF.dropOn('dish');
      },
      getHint(id) {
        if (id === 'neutral') return { from: K.worldOf(S.drops > 4 ? alk.g : acid.g, 0.5), to: mouth() };
        if (id === 'evap') return { from: K.worldOf(flask.group, 0.6), to: V3(2.45, T + 0.5, -0.25) };
        return null;
      },
      update(dt, t) {
        steam.update(dt, t, heating, V3(2.45, T + 0.45, -0.25));
        if (lattice.visible) lattice.rotation.y += dt * 0.5;
      },
      reset() {
        tw.clear(); busy = false; heating = false; steam.clear();
        S.poured = false; S.salt = false; setPh(0);
        flask.mat.color.copy(colorOf(PH[0])); flask.setLevel(LV); flask.group.rotation.set(0, 0, 0);
        dish.setLevel(0); dish.setCrystals(0); hp.setHeat(0); lattice.visible = false; lattice.scale.setScalar(0.001);
        [hA, hB, hF].forEach((h) => { h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.busy = false; });
      },
    };
  },
};
