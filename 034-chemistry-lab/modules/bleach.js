/* Topic 6.3 漂白劑：漂白劑的作用（褪色）同安全使用 */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V2, V3 } = K;

const SPOTS = [
  { zh: '① 色素（加清水）', en: '① Food colouring (water)', col: '#dc2626', water: true },
  { zh: '② 色素', en: '② Food colouring', col: '#dc2626' },
  { zh: '③ 墨水', en: '③ Ink', col: '#1e3a8a' },
  { zh: '④ 花汁', en: '④ Flower juice', col: '#7e22ce' },
];
const FADED = '#f5f0e6';

function Panel({ S }) {
  const { pick, lang } = useApp();
  const zh = lang === 'zh';
  return html`<div className="grid gap-1.5 text-sm">
    <div className="rounded-xl bg-rose-50 ring-2 ring-rose-300 px-3 py-2 text-rose-800 leading-relaxed">
      <b>⚠️ ${zh ? '漂白水安全：' : 'Bleach safety: '}</b>${zh ? '要由大人用、戴手套、開窗；千祈唔好飲；千祈唔好同潔廁劑溝埋，會產生有毒嘅氯氣！' : 'Grown-ups only, wear gloves, open a window. Never drink it, and never mix it with toilet cleaner: that makes poisonous chlorine gas!'}
    </div>
    ${SPOTS.map((sp, i) => html`<div key=${i} className="flex items-center gap-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2">
      <span className="flex-1 font-bold text-slate-700">${pick(sp)}</span>
      <span className="w-4 h-4 rounded-full inline-block" style=${{ background: sp.col }}></span>
      <span className="text-slate-400">→</span>
      <span className="w-4 h-4 rounded-full inline-block ring-1 ring-slate-300" style=${{ background: S['s' + i] ? (sp.water ? sp.col : FADED) : '#e2e8f0' }}></span>
      <span className="text-slate-600 text-xs w-20">${S['s' + i] ? (sp.water ? (zh ? '幾乎冇變' : 'hardly changed') : (zh ? '褪色 ✅' : 'faded ✅')) : '—'}</span>
    </div>`)}
    <div className="flex items-center gap-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2">
      <span className="flex-1 font-bold text-slate-700">👕 ${zh ? '彩色 T 恤' : 'Coloured T-shirt'}</span>
      <span className="text-slate-600 text-xs">${S.shirt ? (zh ? '變白咗一笪 ⚠️' : 'white patch ⚠️') : '—'}</span>
    </div>
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    <rect x="18" y="40" width="120" height="50" rx="8" fill="#fff" stroke="#e2e8f0" strokeWidth="3" />
    ${[[42, '#dc2626', 1], [76, '#fca5a5', 0.6], [110, '#f5f0e6', 1]].map(([x, c]) => html`<circle key=${x} cx=${x} cy="65" r="13" fill=${c} />`)}
    <path d="M150 30 h22 v10 l8 8 v50 a6 6 0 0 1 -6 6 h-26 a6 6 0 0 1 -6 -6 v-50 l8 -8z" fill="#fef9c3" stroke="#eab308" strokeWidth="3" />
    <path d="M153 64 l14 0" stroke="#eab308" strokeWidth="4" /><path d="M160 57 v14" stroke="#eab308" strokeWidth="4" />
  </svg>`;
}

const events = {
  wa_drop: { zh: '清水滴咗落第一滴污漬，紅色幾乎冇變。', en: 'Water has been dropped on the first stain. The red has hardly changed.' },
  wa_wrong: { zh: '清水淨係加落第一滴污漬做對照，其他污漬留俾漂白水。', en: 'Water only goes on the first stain, as the control. The other stains are for the bleach.' },
  bl_drop: { zh: '加咗漂白水，顏色慢慢褪走！', en: 'Bleach added, and the colour slowly fades away!' },
  bl_wrong: { zh: '第一滴係對照組，淨係加清水。漂白水要加落第二、三、四滴。', en: 'The first stain is the control and only gets water. The bleach goes on stains two, three and four.' },
  bl_need: { zh: '先用清水做好對照組，先加漂白水。', en: 'Set up the control with water first, then add bleach.' },
  blAll: { zh: '三滴污漬都褪晒色喇！', en: 'All three stains have faded!' },
  sh_spot: { zh: 'T 恤嗰一角變咗白色一笪！所以彩色衫唔可以用漂白水，要睇清楚衫上面嘅洗衣標籤。', en: 'That corner of the T-shirt now has a white patch! That is why bleach must not be used on coloured clothes. Always check the care label.' },
  sh_need: { zh: '先做完污漬實驗，先試 T 恤。', en: 'Finish the stain test first, then try the T-shirt.' },
  cleaner: { zh: '好多潔廁劑都係酸性。千祈唔好同漂白水溝埋，會產生有毒嘅氯氣！', en: 'Many toilet cleaners are acidic. Never mix them with bleach: that makes poisonous chlorine gas!' },
  jug: { zh: '家用漂白水嘅主要成分係次氯酸鈉，要放喺小朋友攞唔到嘅地方。', en: 'Household bleach is mainly sodium hypochlorite. Keep it where children cannot reach it.' },
  gloves: { zh: '用漂白水一定要戴手套，因為佢會刺激皮膚。', en: 'Always wear gloves with bleach, because it irritates the skin.' },
  cloth: { zh: '白布上面有四滴污漬。第一滴淨係加清水，做對照組。', en: 'The white cloth has four stains. The first gets only water, as the control.' },
};

export default {
  id: 'bleach', topics: ['6.3'], accent: '#8b5cf6', dark: '#6d28d9', bg: 'linear-gradient(135deg,#ede9fe,#fef9c3)', Art,
  title: { zh: '褪色魔術', en: 'The Vanishing Colour Trick' },
  desc: { zh: '滴幾滴漂白水，污漬嘅顏色就消失！認識漂白劑點樣褪色，同埋點樣安全使用。', en: 'A few drops of bleach and the stain\'s colour disappears! Learn how bleach removes colour and how to use it safely.' },
  steps: [
    { tag: 'intro', zh: '白色校服整污糟咗，大人有時會用漂白水清洗。漂白水點樣令顏色消失？今日我哋做「褪色魔術」！安全好重要：漂白水要由大人使用，要戴手套、開窗保持空氣流通；千祈唔好飲，亦千祈唔好同潔廁劑溝埋，會產生有毒嘅氯氣！後面嘅物件可以撳嚟睇介紹。',
      en: 'When a white school shirt gets stained, grown-ups sometimes clean it with bleach. How does bleach make colour disappear? Today we will do the Vanishing Colour Trick! Safety matters: bleach is for grown-ups to use, with gloves and an open window. Never drink it, and never mix it with toilet cleaner, because that makes poisonous chlorine gas! Tap the objects at the back to learn about them.' },
    { tag: 'try', action: { id: 'water', events: ['wa_'] }, zh: '先做對照組：將清水滴管拖去第一滴污漬，睇下有冇變化。',
      en: 'First, the control: drag the water dropper to the first stain and see whether anything changes.' },
    { tag: 'observe', zh: '清水滴落去，紅色污漬幾乎冇變。所以等陣如果顏色消失，就唔係因為水，而係因為漂白水。',
      en: 'With water, the red stain hardly changes. So if a colour disappears later, it is because of the bleach, not the water.' },
    { tag: 'try', action: { id: 'bleach', events: ['bl_'] }, zh: '而家將漂白水滴管拖去第二、三、四滴污漬：色素、墨水同花汁。',
      en: 'Now drag the bleach dropper to stains two, three and four: food colouring, ink and flower juice.' },
    { tag: 'observe', zh: '三滴污漬嘅顏色都慢慢褪走，變得差唔多白色！漂白水可以令好多有顏色嘅物質失去顏色。',
      en: 'The colours of all three stains slowly fade until they are almost white! Bleach can remove the colour from many coloured substances.' },
    { tag: 'try', action: { id: 'shirt', events: ['sh_'] }, zh: '如果漂白水滴落彩色衫會點？將漂白水滴管拖去右邊 T 恤嘅一角。',
      en: 'What happens if bleach drips onto coloured clothes? Drag the bleach dropper to a corner of the T-shirt on the right.' },
    { tag: 'feynman', zh: '有顏色嘅物質入面，有一部分專門「食」走某啲顏色嘅光，所以我哋見到佢有顏色。漂白水好似一把剪刀，將呢部分剪爛，物質就再食唔到光，睇落就變成白色或者透明。',
      en: 'Part of every coloured substance "eats" certain colours of light, which is why we see it as coloured. Bleach is like a pair of scissors that cuts this part up, so the substance can no longer absorb light, and it looks white or clear.' },
    { tag: 'first', zh: '由最基本諗起：家用漂白水嘅主要成分係次氯酸鈉。佢係一種「氧化劑」，會搶走色素分子嘅電子，破壞分子入面負責顏色嘅結構，所以顏色就消失。同一個原理，漂白水亦可以破壞細菌，所以可以用嚟消毒。不過佢遇到酸，就會放出有毒嘅氯氣，所以絕對唔可以同酸性嘅清潔劑溝埋。',
      en: 'Back to basics: household bleach is mainly sodium hypochlorite. It is an oxidising agent: it takes electrons from dye molecules and breaks the part of the molecule that makes the colour, so the colour vanishes. In the same way, bleach destroys germs, so it is used as a disinfectant. But when it meets an acid it releases poisonous chlorine gas, so it must never be mixed with acidic cleaners.' },
    { tag: 'life', zh: '生活應用：漂白水用嚟漂白白色衫、清潔同消毒地板同廁所；游泳池同食水都會用含氯嘅物質殺菌。使用嗰陣要稀釋、戴手套、開窗，同埋千祈唔好同潔廁劑溝埋。',
      en: 'Everyday life: bleach is used to whiten white clothes and to clean and disinfect floors and toilets; swimming pools and drinking water are also treated with chlorine compounds to kill germs. When using bleach, dilute it, wear gloves, open a window, and never mix it with toilet cleaner.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '點解漂白水唔可以同潔廁劑一齊用？', en: 'Why must bleach never be used together with toilet cleaner?' },
    options: [
      { zh: '因為會冇咗香味', en: 'Because the nice smell disappears' },
      { zh: '因為會產生有毒嘅氯氣', en: 'Because they make poisonous chlorine gas' },
      { zh: '因為會變成清水', en: 'Because they turn into plain water' },
    ],
    correct: 1,
    right: { zh: '啱！好多潔廁劑係酸性，同漂白水溝埋會放出有毒嘅氯氣，吸入會傷害肺部。', en: 'Right! Many toilet cleaners are acidic, and mixing them with bleach releases poisonous chlorine gas, which damages the lungs.' },
    wrong: { zh: '再諗下安全提示：漂白水遇到酸，會放出咩氣體？', en: 'Think about the safety tip: what gas does bleach give off when it meets an acid?' },
  },
  tools: [
    { id: 'w', label: { zh: '加清水（對照）', en: 'Add water (control)' }, run: (c) => c.waterNext() },
    { id: 'b', label: { zh: '加漂白水落下一滴', en: 'Bleach the next stain' }, run: (c) => c.bleachNext() },
    { id: 's', label: { zh: '漂白水滴落 T 恤', en: 'Bleach on the T-shirt' }, run: (c) => c.shirt() },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = { s0: false, s1: false, s2: false, s3: false, shirt: false };
    const push = () => api.state({ ...S });
    const CZ = -0.25, sxs = [-1.45, -0.7, 0.05, 0.8];
    const cloth = new THREE.Mesh(new K.RoundedBoxGeometry(3.0, 0.015, 0.95, 2, 0.006), K.stdMat('#fafaf9', 0.95)); cloth.position.set(-0.32, T + 0.008, CZ); scene.add(cloth);
    api.tap(cloth, () => api.emit('cloth'), { zh: '白布', en: 'White cloth' });
    const spots = SPOTS.map((sp, i) => {
      const m = new THREE.Mesh(new THREE.CircleGeometry(0.17, 28), new THREE.MeshStandardMaterial({ color: sp.col, roughness: 0.95 })); m.rotation.x = -Math.PI / 2; m.position.set(sxs[i], T + 0.018, CZ); scene.add(m);
      const lab = api.label(sp, { border: sp.col, h: 0.13 }); lab.position.set(sxs[i], T + 0.08, CZ + 0.38);
      return { m, pos: V3(sxs[i], T + 0.05, CZ) };
    });
    // T 恤
    const shirtG = new THREE.Group(); shirtG.position.set(2.1, T + 0.02, 0.45); scene.add(shirtG);
    const shirtMat = K.stdMat('#0d9488', 0.9);
    const body = new THREE.Mesh(new K.RoundedBoxGeometry(0.62, 0.03, 0.72, 2, 0.01), shirtMat); shirtG.add(body);
    [-1, 1].forEach((s) => { const sl = new THREE.Mesh(new K.RoundedBoxGeometry(0.3, 0.028, 0.24, 2, 0.01), shirtMat); sl.position.set(s * 0.4, 0, -0.24); sl.rotation.y = s * 0.5; shirtG.add(sl); });
    const patch = new THREE.Mesh(new THREE.CircleGeometry(0.12, 24), new THREE.MeshStandardMaterial({ color: '#e7f6f4', roughness: 0.95, transparent: true, opacity: 0 })); patch.rotation.x = -Math.PI / 2; patch.position.set(0.15, 0.02, 0.2); shirtG.add(patch);
    const lShirt = api.label({ zh: '彩色 T 恤', en: 'Coloured T-shirt' }, { border: '#0d9488', h: 0.15 }); lShirt.position.set(2.1, T + 0.08, 0.98);
    const SHIRT_SPOT = V3(2.25, T + 0.05, 0.65);
    // 滴管
    const drW = K.makeBottle({ body: '#e0f2fe', cap: '#0ea5e9', dropper: true, glass: true }); drW.g.position.set(-2.55, T, 0.95); scene.add(drW.g);
    const lW = api.label({ zh: '清水', en: 'Water' }, { border: '#0ea5e9', h: 0.16 }); lW.position.set(0, 0.1, 0.42); drW.g.add(lW);
    const drB = K.makeBottle({ body: '#fef9c3', cap: '#eab308', dropper: true, glass: true }); drB.g.position.set(-1.55, T, 0.95); scene.add(drB.g);
    const lBl = api.label({ zh: '稀漂白水', en: 'Dilute bleach' }, { border: '#eab308', h: 0.16 }); lBl.position.set(0, 0.1, 0.42); drB.g.add(lBl);
    // 後排：手套、漂白水樽、潔廁劑（唔好溝！）
    const glove = new THREE.Group(); glove.position.set(-2.85, T + 0.04, -1.15); scene.add(glove);
    const gPalm = new THREE.Mesh(new K.RoundedBoxGeometry(0.3, 0.06, 0.34, 2, 0.03), K.stdMat('#facc15', 0.7)); glove.add(gPalm);
    [-0.1, -0.03, 0.04, 0.11].forEach((x) => { const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.14, 4, 8), K.stdMat('#facc15', 0.7)); f.rotation.x = Math.PI / 2; f.position.set(x, 0, -0.25); glove.add(f); });
    const jug = K.makeBottle({ body: '#f8fafc', cap: '#2563eb' }); jug.g.position.set(1.9, T, -1.2); jug.g.scale.setScalar(1.25); scene.add(jug.g);
    const cleaner = K.makeBottle({ body: '#60a5fa', cap: '#1e3a8a' }); cleaner.g.position.set(2.8, T, -1.2); cleaner.g.scale.setScalar(1.25); scene.add(cleaner.g);
    const noMix = api.label({ zh: '❌ 千祈唔好溝埋！', en: '❌ Never mix!' }, { border: '#dc2626', h: 0.17 }); noMix.position.set(2.35, T + 1.25, -1.2);
    [[glove, 'gloves', { zh: '手套', en: 'Gloves' }, -2.85, 0.32], [jug.g, 'jug', { zh: '漂白水', en: 'Bleach' }, 1.9, 1.0], [cleaner.g, 'cleaner', { zh: '潔廁劑（酸性）', en: 'Toilet cleaner (acidic)' }, 2.8, 1.0]].forEach(([o, ev, name, x, y]) => {
      const l = api.label(name, { border: '#94a3b8', h: 0.14 }); l.position.set(x, T + y, -1.15);
      api.tap(o, () => api.emit(ev), name, [l]);
    });

    let busy = false;
    const nextBleach = () => [1, 2, 3].find((i) => !S['s' + i]) ?? -1;
    const bleachDone = () => nextBleach() < 0;
    async function drip(bottle, h, target, color) {
      const over = V3(target.x, T + 0.62, target.z);
      await K.moveTo(tw, bottle, K.tipPose(V2(0, 0.86), 2.1, over), 2.1, 0.5);
      await K.dripDrop(scene, tw, over, V3(target.x, T + 0.03, target.z), color);
      return [h.returnHome()]; // 包住個 Promise，等褪色同滴管返原位一齊發生
    }
    async function addWater(i, h = hW) {
      if (busy || S.s0) return false;
      if (i !== 0) { api.emit('wa_wrong'); return false; }
      busy = true;
      const [back] = await drip(drW.g, h, spots[0].pos, '#bae6fd');
      const c0 = new THREE.Color(SPOTS[0].col);
      await tw.to(0.8, (k) => spots[0].m.material.color.copy(c0).lerp(new THREE.Color('#ef4444'), k * 0.3));
      await back;
      S.s0 = true; push(); api.emit('wa_drop'); api.done('water');
      busy = false;
    }
    async function addBleach(i, h = hB) {
      if (busy) return false;
      if (i === 0) { api.emit('bl_wrong'); return false; }
      if (!S.s0) { api.emit('bl_need'); return false; }
      if (S['s' + i]) return false;
      busy = true;
      const [back] = await drip(drB.g, h, spots[i].pos, '#fef08a');
      api.emit('bl_drop');
      const c0 = new THREE.Color(SPOTS[i].col), c1 = new THREE.Color(FADED);
      await tw.to(2.2, (k) => spots[i].m.material.color.copy(c0).lerp(c1, k));
      await back;
      S['s' + i] = true; push();
      busy = false;
      if (bleachDone()) { api.done('bleach'); api.emit('blAll'); }
    }
    async function bleachShirt(h = hB) {
      if (busy || S.shirt) return false;
      if (!bleachDone()) { api.emit('sh_need'); return false; }
      busy = true;
      const [back] = await drip(drB.g, h, SHIRT_SPOT, '#fef08a');
      await tw.to(2.0, (k) => { patch.material.opacity = k; patch.scale.setScalar(0.5 + 0.5 * k); });
      await back;
      S.shirt = true; push(); api.emit('sh_spot'); api.done('shirt');
      busy = false;
    }
    const spotTargets = (accept) => spots.map((sp, i) => ({ key: 's' + i, pos: sp.pos, r: 0.3, ringY: T, accept: () => accept(i) }));
    const hW = api.drag(drW.g, { label: { zh: '清水滴管', en: 'Water dropper' }, lift: 0.9, enabled: () => !busy && !S.s0,
      targets: () => spotTargets(() => !S.s0), onDrop: (tg, h) => addWater(Number(tg.key.slice(1)), h),
      onTap: () => { if (!busy && !S.s0) hW.dropOn('s0'); } });
    const hB = api.drag(drB.g, { label: { zh: '漂白水滴管', en: 'Bleach dropper' }, lift: 0.9, enabled: () => !busy && !S.shirt,
      targets: () => (bleachDone() ? [{ key: 'shirt', pos: SHIRT_SPOT, r: 0.45, ringY: T, accept: () => !S.shirt }] : spotTargets((i) => i === 0 || !S['s' + i])), // 對照組都接受，等佢可以解釋點解唔加漂白水
      onDrop: (tg, h) => (tg.key === 'shirt' ? bleachShirt(h) : addBleach(Number(tg.key.slice(1)), h)),
      onTap: () => { if (busy || S.shirt) return; if (!S.s0) api.emit('bl_need'); else if (bleachDone()) hB.dropOn('shirt'); else hB.dropOn('s' + nextBleach()); } });

    push();
    return {
      cam: { pos: [0, 3.9, 5.0], target: [0, 1.3, -0.1], fitW: 6.7 },
      waterNext() { if (!busy && !S.s0) hW.dropOn('s0'); },
      bleachNext() { const i = nextBleach(); if (!busy && S.s0 && i > 0) hB.dropOn('s' + i); },
      shirt() { if (!busy && bleachDone() && !S.shirt) hB.dropOn('shirt'); },
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (id === 'water' && !S.s0) await hW.dropOn('s0');
        if (id === 'bleach') for (let i = nextBleach(), c = 0; i > 0 && c < 4; i = nextBleach(), c++) { while (busy) await tw.wait(0.1); await hB.dropOn('s' + i); await api.waitSpeech(); }
        if (id === 'shirt' && !S.shirt) await hB.dropOn('shirt');
      },
      getHint(id) {
        if (busy) return null;
        if (id === 'water') return S.s0 ? null : { from: K.worldOf(drW.g, 0.5), to: spots[0].pos };
        if (id === 'bleach') { const i = nextBleach(); return i > 0 && S.s0 ? { from: K.worldOf(drB.g, 0.5), to: spots[i].pos } : null; }
        if (id === 'shirt') return S.shirt || !bleachDone() ? null : { from: K.worldOf(drB.g, 0.5), to: SHIRT_SPOT };
        return null;
      },
      reset() {
        tw.clear(); busy = false;
        Object.keys(S).forEach((key) => { S[key] = false; }); push();
        spots.forEach((sp, i) => sp.m.material.color.set(SPOTS[i].col));
        patch.material.opacity = 0; patch.scale.setScalar(1);
        [hW, hB].forEach((h) => { h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.busy = false; });
      },
    };
  },
};
