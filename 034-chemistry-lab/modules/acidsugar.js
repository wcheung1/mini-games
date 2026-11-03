/* Topic 6.2 硫酸和二氧化硫：濃硫酸的脫水性（糖、硫酸銅晶體）、安全稀釋、二氧化硫的用途 */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V2, V3 } = K;

function Panel({ S }) {
  const { lang } = useApp();
  const zh = lang === 'zh';
  const row = (label, val) => html`<div className="flex items-center gap-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2"><b className="flex-1 text-slate-700">${label}</b><span className="text-slate-600 text-right">${val}</span></div>`;
  return html`<div className="grid gap-1.5 text-sm">
    <div className="rounded-xl bg-rose-50 ring-2 ring-rose-300 px-3 py-2 text-rose-800"><b>⚠️ ${zh ? '濃硫酸：' : 'Concentrated sulfuric acid: '}</b>${zh ? '會嚴重灼傷皮膚同眼。只可以由老師喺抽氣櫃入面處理，要戴手套同護目鏡。記住「酸落水」！' : 'causes severe burns to skin and eyes. Only a teacher may handle it, in a fume cupboard, with gloves and goggles. Remember: acid into water!'}</div>
    ${row(zh ? '🍬 糖 ＋ 濃硫酸' : '🍬 Sugar + conc. acid', S.sugar ? (zh ? '變黑，升起碳柱 ✅' : 'turns black, a carbon column rises ✅') : '—')}
    ${row(zh ? '💎 藍色硫酸銅晶體 ＋ 濃硫酸' : '💎 Blue copper sulfate + conc. acid', S.crystal ? (zh ? '變白色 ✅' : 'turns white ✅') : '—')}
    ${row(zh ? '💧 稀釋方法' : '💧 Diluting', S.dilute ? (zh ? '酸慢慢加落水 ✅' : 'acid slowly into water ✅') : '—')}
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    <path d="M60 50 v42 a8 8 0 0 0 8 8 h44 a8 8 0 0 0 8 -8 v-42" fill="#fff" fillOpacity=".9" stroke="#cbd5e1" strokeWidth="3" />
    <path d="M74 96 v-60 q16 -14 32 0 v60z" fill="#1c1917" />
    <path d="M80 30 q4 -10 0 -18 M96 26 q4 -10 0 -18" stroke="#cbd5e1" strokeWidth="3" fill="none" />
    <circle cx="150" cy="80" r="16" fill="#3b82f6" /><circle cx="172" cy="80" r="12" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
  </svg>`;
}

const events = {
  sg_drop: { zh: '老師滴咗濃硫酸落糖度……糖變黃、變啡、再變黑，仲升起一條黑色、熱辣辣嘅碳柱，冒出蒸氣！', en: 'The teacher adds concentrated sulfuric acid to the sugar… it turns yellow, brown, then black, and a hot black column of carbon rises up, giving off steam!' },
  cr_drop: { zh: '濃硫酸滴落藍色嘅硫酸銅晶體，晶體慢慢變成白色！', en: 'Concentrated sulfuric acid on the blue copper sulfate crystals slowly turns them white!' },
  dl_ok: { zh: '啱！將濃硫酸慢慢加落大量水度，一路攪，熱力就會分散喺水入面。記住：酸落水！', en: 'Correct! Adding the acid slowly into plenty of water while stirring spreads the heat through the water. Remember: acid into water!' },
  dl_wrong: { zh: '千祈唔好！將水倒落濃硫酸，會即刻放出大量熱，令啲水滾起，連酸一齊濺出嚟。要將酸加落水，唔好將水加落酸！', en: 'Never do that! Pouring water into concentrated acid releases a burst of heat that makes the water boil and spit acid out. Always add acid to water, never water to acid!' },
  dl_need: { zh: '先睇完濃硫酸搶水嘅示範，再學點樣稀釋。', en: 'Watch the water-grabbing demonstrations first, then learn how to dilute.' },
  hood: { zh: '抽氣櫃會將有害嘅氣體抽走，處理濃硫酸要喺入面做。', en: 'The fume cupboard draws harmful fumes away. Concentrated sulfuric acid is handled inside it.' },
  raisins: { zh: '提子乾同一啲酒會加少量二氧化硫，防止變壞同變色。', en: 'Raisins and some wines contain a little sulfur dioxide to stop them going off or changing colour.' },
  battery: { zh: '汽車電池入面有稀硫酸。', en: 'Car batteries contain dilute sulfuric acid.' },
};

export default {
  id: 'acidsugar', topics: ['6.2'], accent: '#b91c1c', dark: '#7f1d1d', bg: 'linear-gradient(135deg,#fee2e2,#f1f5f9)', Art,
  title: { zh: '濃硫酸搶水', en: 'The Water-Grabbing Acid' },
  desc: { zh: '老師示範：濃硫酸將白糖變成黑色碳柱，將藍色晶體變白！再學識「酸落水」安全稀釋。', en: 'Teacher demo: concentrated sulfuric acid turns white sugar into a black carbon column and blue crystals white! Then learn to dilute safely: acid into water.' },
  steps: [
    { tag: 'intro', zh: '硫酸係工業上最重要嘅化學品之一，可以用嚟整化肥、清潔劑同電池。濃硫酸有超強腐蝕性，仲好鍾意「搶水」！今日由老師喺抽氣櫃入面示範。安全提提你：濃硫酸會嚴重灼傷皮膚同眼，小朋友千祈唔好掂，大人都要戴手套同護目鏡。後面嘅物件可以撳嚟睇介紹。',
      en: 'Sulfuric acid is one of the most important industrial chemicals, used to make fertilisers, detergents and batteries. Concentrated sulfuric acid is extremely corrosive, and it loves to grab water! Today a teacher will demonstrate inside a fume cupboard. Safety first: it causes severe burns to skin and eyes, so children must never touch it, and adults must wear gloves and goggles. Tap the objects at the back to learn about them.' },
    { tag: 'try', action: { id: 'sugar', events: ['sg_'] }, zh: '將濃硫酸樽拖去抽氣櫃入面嗰杯白糖，請老師滴落去。', en: 'Drag the concentrated sulfuric acid bottle to the beaker of white sugar in the fume cupboard, so the teacher can add it.' },
    { tag: 'observe', zh: '白色嘅糖變黃、變啡、再變黑，仲升起一條有好多細孔嘅黑色「碳柱」，好熱，仲冒出蒸氣！', en: 'The white sugar turns yellow, brown, then black, and a hot black column of carbon full of tiny holes rises up, giving off steam!' },
    { tag: 'try', action: { id: 'crystal', events: ['cr_'] }, zh: '而家將濃硫酸樽拖去藍色嘅硫酸銅晶體。', en: 'Now drag the acid bottle to the blue copper sulfate crystals.' },
    { tag: 'observe', zh: '藍色晶體慢慢變成白色！原來藍色晶體入面藏住一啲水。', en: 'The blue crystals slowly turn white! The blue crystals were hiding some water inside them.' },
    { tag: 'try', action: { id: 'dilute', events: ['dl_'] }, zh: '實驗室常常要將濃硫酸稀釋。濃硫酸遇到水會放出大量熱。揀啱嘅方法：將濃硫酸杯拖去大杯水，定係將水壺拖去濃硫酸杯？',
      en: 'Labs often need to dilute concentrated sulfuric acid, which releases a lot of heat when it meets water. Choose the right way: drag the acid beaker to the big beaker of water, or drag the water jug to the acid?' },
    { tag: 'feynman', zh: '濃硫酸好似一個「搶水大王」。糖由碳、氫、氧組成，濃硫酸將入面嘅氫同氧以水嘅形式搶走，剩低黑色嘅碳。藍色硫酸銅晶體入面藏住啲水，俾濃硫酸搶走之後，就變返白色。',
      en: 'Concentrated sulfuric acid is a water-grabbing champion. Sugar is made of carbon, hydrogen and oxygen; the acid snatches the hydrogen and oxygen away as water, leaving black carbon. Blue copper sulfate crystals have water hidden inside; once the acid takes it, they turn white.' },
    { tag: 'first', zh: '由最基本諗起：濃硫酸係一種「脫水劑」，佢同水結合嘅時候會放出大量熱。所以稀釋嘅時候，一定要將少量濃硫酸慢慢加入大量水，一路攪，等熱力分散；如果將水倒落濃硫酸，少量水會即刻滾起，將酸濺出嚟。',
      en: 'Back to basics: concentrated sulfuric acid is a dehydrating agent, and it gives out a lot of heat when it combines with water. So when diluting, always add a little acid slowly to a lot of water while stirring, to spread the heat; pouring water into the acid makes that small amount of water boil instantly and splash acid out.' },
    { tag: 'life', zh: '生活應用：硫酸用嚟整化肥、清潔劑同汽車電池。二氧化硫係另一種含硫物質，少量加入提子乾等乾果同一啲酒入面，防止變壞；佢亦可以漂白紙張。不過二氧化硫亦係形成酸雨嘅原因之一。',
      en: 'Everyday life: sulfuric acid is used to make fertilisers, detergents and car batteries. Sulfur dioxide, another sulfur compound, is added in small amounts to dried fruit such as raisins and to some wines to stop them spoiling, and it can bleach paper. But sulfur dioxide is also one of the causes of acid rain.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '稀釋濃硫酸，正確嘅方法係邊個？', en: 'What is the correct way to dilute concentrated sulfuric acid?' },
    options: [{ zh: '將水快快倒入濃硫酸', en: 'Quickly pour water into the acid' }, { zh: '將濃硫酸慢慢加入大量水，一路攪', en: 'Slowly add the acid to plenty of water while stirring' }, { zh: '兩樣一齊倒入膠樽搖勻', en: 'Pour both into a plastic bottle and shake' }],
    correct: 1,
    right: { zh: '啱！「酸落水」：大量水可以吸收熱力，慢慢加同埋一路攪，就唔會滾起濺出嚟。', en: 'Right! Acid into water: plenty of water soaks up the heat, and adding slowly while stirring stops it boiling and splashing.' },
    wrong: { zh: '再諗下：濃硫酸遇水會放熱。點樣先可以令熱力分散，唔會濺出嚟？', en: 'Think again: the acid gives out heat with water. How can the heat be spread out so nothing splashes?' },
  },
  tools: [
    { id: 'n', label: { zh: '滴落下一樣', en: 'Add to the next one' }, run: (c) => c.dropNext() },
    { id: 'd', label: { zh: '酸落水', en: 'Acid into water' }, run: (c) => c.dilute() },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = { sugar: false, crystal: false, dilute: false };
    const push = () => api.state({ ...S });
    const HZ = -0.45;
    // 抽氣櫃（左邊）
    const hood = new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.0, 1.2), new THREE.MeshPhysicalMaterial({ color: '#e0f2fe', roughness: 0.1, transparent: true, opacity: 0.15, side: THREE.DoubleSide, depthWrite: false })); hood.position.set(-1.0, T + 1.0, HZ); hood.renderOrder = 1; scene.add(hood);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 1.3), K.stdMat('#cbd5e1', 0.5)); frame.position.set(-1.0, T + 2.02, HZ); scene.add(frame);
    const lHood = api.label({ zh: '抽氣櫃', en: 'Fume cupboard' }, { border: '#64748b', h: 0.14 }); lHood.position.set(-1.0, T + 2.2, HZ);
    api.tap(frame, () => api.emit('hood'), { zh: '抽氣櫃', en: 'Fume cupboard' }, [lHood]);
    // 糖杯
    const SGX = -1.55;
    const sugarBk = K.makeVessel(K.beakerProfile(0.26, 0.5), { liquidColor: '#ffffff', level: 0.18, opacity: 0.95, sx: 0.95 });
    sugarBk.group.position.set(SGX, T + 0.01, HZ); scene.add(sugarBk.group);
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 1, 20), K.stdMat('#1c1917', 1)); column.visible = false; column.position.set(SGX, T + 0.2, HZ); scene.add(column);
    const lSg = api.label({ zh: '白糖', en: 'Sugar' }, { border: '#94a3b8', h: 0.14 }); lSg.position.set(SGX, T + 0.08, HZ + 0.45);
    const steam = K.makeSteam(scene);
    // 硫酸銅晶體（錶面玻璃）
    const CRX = -0.45;
    const wg = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.04, 28), new THREE.MeshPhysicalMaterial({ color: '#e0f2fe', roughness: 0.1, transparent: true, opacity: 0.6 })); wg.position.set(CRX, T + 0.02, HZ); scene.add(wg);
    const crystalMat = K.stdMat('#2563eb', 0.3);
    for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.05, 0), crystalMat); c.position.set(CRX + Math.cos(i * 2.1) * 0.13 * (i % 3) / 2, T + 0.07, HZ + Math.sin(i * 2.1) * 0.12 * (i % 3) / 2); c.rotation.set(i, i * 0.5, 0); scene.add(c); }
    const lCr = api.label({ zh: '藍色硫酸銅晶體', en: 'Blue copper sulfate crystals' }, { border: '#2563eb', h: 0.13 }); lCr.position.set(CRX, T + 0.08, HZ + 0.4);
    // 濃硫酸樽（老師用）
    const acid = K.makeBottle({ body: '#78350f', cap: '#111827', dropper: true, glass: true }); acid.g.position.set(-2.55, T, 0.9); scene.add(acid.g);
    const lAc = api.label({ zh: '濃硫酸（老師用）', en: 'Conc. sulfuric acid (teacher)' }, { border: '#b91c1c', h: 0.14 }); lAc.position.set(0, 0.1, 0.42); acid.g.add(lAc);
    // 稀釋站（右邊）：大杯水、細杯濃硫酸、水壺
    const WX = 1.3, WZ = -0.35;
    const water = K.makeVessel(K.beakerProfile(0.4, 0.7), { liquidColor: '#e0f2fe', level: 0.42, opacity: 0.55, sx: 0.95 });
    water.group.position.set(WX, T + 0.01, WZ); scene.add(water.group);
    const lW = api.label({ zh: '大杯水', en: 'Beaker of water' }, { border: '#0ea5e9', h: 0.14 }); lW.position.set(WX, T + 0.08, WZ + 0.6);
    const acidCup = new THREE.Group(); acidCup.position.set(2.45, T, 0.75); scene.add(acidCup);
    const ac = K.makeVessel(K.beakerProfile(0.16, 0.3), { liquidColor: '#fef3c7', level: 0.15, opacity: 0.8, sx: 0.95 }); acidCup.add(ac.group);
    const lAC = api.label({ zh: '濃硫酸（少量）', en: 'Conc. acid (small)' }, { border: '#b91c1c', h: 0.13 }); lAC.position.set(0, -0.02, 0.32); acidCup.add(lAC);
    const jug = new THREE.Group(); jug.position.set(0.55, T, 0.9); scene.add(jug);
    const jBody = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.36, 20), new THREE.MeshPhysicalMaterial({ color: '#bae6fd', roughness: 0.1, transparent: true, opacity: 0.7 })); jBody.position.y = 0.18; jug.add(jBody);
    const jSpout = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 12), new THREE.MeshPhysicalMaterial({ color: '#bae6fd', roughness: 0.1, transparent: true, opacity: 0.7 })); jSpout.rotation.z = -Math.PI / 2; jSpout.position.set(0.17, 0.33, 0); jug.add(jSpout);
    const lJ = api.label({ zh: '水壺', en: 'Water jug' }, { border: '#0ea5e9', h: 0.13 }); lJ.position.set(0, -0.02, 0.32); jug.add(lJ);
    const rule = api.label({ zh: '酸落水，唔好水落酸！', en: 'Acid into water, never water into acid!' }, { border: '#b91c1c', h: 0.15 }); rule.position.set(1.8, T + 1.35, -0.6);
    // 後排：提子乾、汽車電池
    const raisins = new THREE.Group(); raisins.position.set(2.85, T, -1.2); scene.add(raisins);
    for (let i = 0; i < 6; i++) { const r = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), K.stdMat('#7c2d12', 0.9)); r.position.set((i % 3) * 0.08 - 0.08, 0.04, Math.floor(i / 3) * 0.08 - 0.04); raisins.add(r); }
    const carBat = new THREE.Mesh(new K.RoundedBoxGeometry(0.4, 0.26, 0.26, 2, 0.03), K.stdMat('#1f2937', 0.5)); carBat.position.set(2.2, T + 0.13, -1.2); scene.add(carBat);
    [[raisins, 'raisins', { zh: '提子乾', en: 'Raisins' }, 2.85, 0.25], [carBat, 'battery', { zh: '汽車電池', en: 'Car battery' }, 2.2, 0.45]].forEach(([o, ev, name, x, y]) => {
      const l = api.label(name, { border: '#94a3b8', h: 0.13 }); l.position.set(x, T + y, -1.15);
      api.tap(o, () => api.emit(ev), name, [l]);
    });

    let busy = false, steamOn = 0;
    const steamAt = V3(SGX, T + 1.1, HZ);
    const SUGAR_TOP = V3(SGX, T + 0.55, HZ), CR_TOP = V3(CRX, T + 0.12, HZ);
    async function drip(target, h) {
      const over = V3(target.x, target.y + 0.45, target.z);
      await K.moveTo(tw, acid.g, K.tipPose(V2(0, 0.86), 2.1, over), 2.1, 0.5);
      await K.dripDrop(scene, tw, over, target, '#fde68a');
      return [h.returnHome()];
    }
    async function doSugar(h = hA) {
      if (busy || S.sugar) return false; busy = true;
      const [back] = await drip(V3(SGX, T + 0.19, HZ), h);
      api.emit('sg_drop');
      const c0 = new THREE.Color('#ffffff'), c1 = new THREE.Color('#ca8a04'), c2 = new THREE.Color('#1c1917');
      await tw.to(2.0, (k) => sugarBk.mat.color.copy(k < 0.5 ? c0 : c1).lerp(k < 0.5 ? c1 : c2, k < 0.5 ? k * 2 : (k - 0.5) * 2));
      column.visible = true; steamOn = 4; steamAt.set(SGX, T + 1.1, HZ);
      await tw.to(2.5, (k) => { column.scale.y = Math.max(0.01, 0.9 * k); column.position.y = T + 0.2 + 0.45 * k; });
      await back;
      S.sugar = true; push(); api.done('sugar');
      busy = false;
    }
    async function doCrystal(h = hA) {
      if (busy || S.crystal) return false; busy = true;
      const [back] = await drip(CR_TOP, h);
      api.emit('cr_drop');
      const c0 = new THREE.Color('#2563eb'), c1 = new THREE.Color('#f1f5f9');
      await tw.to(2.2, (k) => crystalMat.color.copy(c0).lerp(c1, k));
      await back;
      S.crystal = true; push(); api.done('crystal');
      busy = false;
    }
    async function pourAcid(h = hCup) {
      if (busy || S.dilute) return false;
      if (!(S.sugar && S.crystal)) { api.emit('dl_need'); return false; }
      busy = true;
      const target = V3(WX, T + 0.95, WZ);
      await K.moveTo(tw, acidCup, K.tipPose(V2(0.16, 0.3), 1.6, target), 1.6, 0.6);
      await K.dripDrop(scene, tw, target, V3(WX, T + 0.43, WZ), '#fef3c7');
      ac.setLevel(0.02); steamOn = 1.2; steamAt.set(WX, T + 0.75, WZ);
      await tw.wait(0.8); await h.returnHome();
      S.dilute = true; push(); api.emit('dl_ok'); api.done('dilute');
      busy = false;
    }
    const hA = api.drag(acid.g, { label: { zh: '濃硫酸樽', en: 'Acid bottle' }, lift: 0.9, enabled: () => !busy && !(S.sugar && S.crystal),
      targets: () => [{ key: 'sugar', pos: SUGAR_TOP, r: 0.4, ringY: T, accept: () => !S.sugar }, { key: 'crystal', pos: CR_TOP, r: 0.4, ringY: T, accept: () => !S.crystal }],
      onDrop: (tg, h) => (tg.key === 'sugar' ? doSugar(h) : doCrystal(h)),
      onTap: () => { if (busy) return; if (!S.sugar) hA.dropOn('sugar'); else if (!S.crystal) hA.dropOn('crystal'); } });
    const hCup = api.drag(acidCup, { label: { zh: '濃硫酸（少量）', en: 'Concentrated acid' }, lift: 0.9, enabled: () => !busy && !S.dilute,
      targets: () => [{ key: 'w', pos: V3(WX, T + 0.72, WZ), r: 0.45, ringY: T, accept: () => !S.dilute }],
      onDrop: (tg, h) => pourAcid(h), onTap: () => { if (!busy && !S.dilute) hCup.dropOn('w'); } });
    // 錯誤示範：將水壺拖去濃硫酸杯 → 解釋點解危險，然後返原位
    const hJug = api.drag(jug, { label: { zh: '水壺', en: 'Water jug' }, lift: 0.9, enabled: () => !busy && !S.dilute,
      targets: () => [{ key: 'a', pos: V3(acidCup.position.x, T + 0.32, acidCup.position.z), r: 0.35, ringY: T, accept: () => !S.dilute }],
      onDrop: () => { if (!(S.sugar && S.crystal)) api.emit('dl_need'); else api.emit('dl_wrong'); return false; },
      onTap: () => { if (!busy && !S.dilute) api.emit(S.sugar && S.crystal ? 'dl_wrong' : 'dl_need'); } });

    push();
    return {
      cam: { pos: [0, 3.6, 4.9], target: [0, 1.25, -0.1], fitW: 6.6 },
      dropNext() { if (busy) return; if (!S.sugar) hA.dropOn('sugar'); else if (!S.crystal) hA.dropOn('crystal'); },
      dilute() { if (!busy && S.sugar && S.crystal && !S.dilute) hCup.dropOn('w'); },
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (id === 'sugar' && !S.sugar) await hA.dropOn('sugar');
        if (id === 'crystal' && !S.crystal) await hA.dropOn('crystal');
        if (id === 'dilute' && !S.dilute) await hCup.dropOn('w');
      },
      getHint(id) {
        if (busy) return null;
        if (id === 'sugar') return S.sugar ? null : { from: K.worldOf(acid.g, 0.5), to: SUGAR_TOP };
        if (id === 'crystal') return S.crystal ? null : { from: K.worldOf(acid.g, 0.5), to: CR_TOP };
        if (id === 'dilute') return S.dilute || !(S.sugar && S.crystal) ? null : { from: K.worldOf(acidCup, 0.15), to: V3(WX, T + 0.72, WZ) };
        return null;
      },
      update(dt, t) {
        if (steamOn > 0) steamOn -= dt;
        steam.update(dt, t, steamOn > 0, steamAt, 0.2);
      },
      reset() {
        tw.clear(); busy = false; steamOn = 0; steam.clear();
        Object.keys(S).forEach((k) => { S[k] = false; }); push();
        sugarBk.mat.color.set('#ffffff'); column.visible = false; column.scale.y = 1; crystalMat.color.set('#2563eb'); ac.setLevel(0.15);
        [hA, hCup, hJug].forEach((h) => { h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.busy = false; });
      },
    };
  },
};
