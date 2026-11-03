/* Topic 5.4 電解：電解的應用（電鍍：將鎖匙鍍上銅） */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V3 } = K;

const SILVER = '#c0c4cc', COPPER = '#c8743a', BLUE = '#3b9be0';

function Panel({ S }) {
  const { lang } = useApp();
  const zh = lang === 'zh';
  const p = S.plate || 0;
  const keyCol = new K.THREE.Color(SILVER).lerp(new K.THREE.Color(COPPER), p).getStyle();
  const row = (label, val) => html`<div className="flex items-center gap-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2"><b className="flex-1 text-slate-700">${label}</b><span className="text-slate-600">${val}</span></div>`;
  return html`<div className="grid gap-1.5 text-sm">
    ${row(zh ? '⚫ 負極（黑色夾）' : '⚫ Negative (black clip)', S.key ? (zh ? '🔑 鎖匙 ✅' : '🔑 key ✅') : '—')}
    ${row(zh ? '🔴 正極（紅色夾）' : '🔴 Positive (red clip)', S.cu ? (zh ? '🟧 銅片 ✅' : '🟧 copper strip ✅') : '—')}
    ${row(zh ? '⚡ 電流' : '⚡ Current', S.on ? (zh ? '開咗' : 'on') : (zh ? '關咗' : 'off'))}
    <div className="flex items-center gap-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2">
      <b className="flex-1 text-slate-700">${zh ? '鎖匙顏色' : 'Key colour'}</b>
      <span className="w-5 h-5 rounded-full inline-block ring-1 ring-slate-300" style=${{ background: keyCol }}></span>
      <span className="text-slate-600">${p >= 1 ? (zh ? '銅色 ✅' : 'copper ✅') : p > 0 ? (zh ? '變緊色…' : 'changing…') : (zh ? '銀色' : 'silver')}</span>
    </div>
    ${row(zh ? '溶液顏色' : 'Solution colour', html`<span className="inline-flex items-center gap-1"><span className="w-4 h-4 rounded-full inline-block" style=${{ background: BLUE }}></span>${zh ? '藍色' : 'blue'}${p >= 1 ? (zh ? '（冇變淡）' : ' (no paler)') : ''}</span>`)}
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    <path d="M60 30 v62 a8 8 0 0 0 8 8 h64 a8 8 0 0 0 8 -8 v-62" fill="#fff" fillOpacity=".9" stroke="#cbd5e1" strokeWidth="3" />
    <rect x="63" y="52" width="74" height="45" rx="5" fill="#3b9be0" opacity=".8" />
    <circle cx="82" cy="38" r="9" fill="none" stroke="#c8743a" strokeWidth="5" /><rect x="79" y="46" width="6" height="40" fill="#c8743a" /><rect x="85" y="70" width="7" height="4" fill="#c8743a" /><rect x="85" y="78" width="5" height="4" fill="#c8743a" />
    <rect x="114" y="34" width="8" height="54" fill="#d9783a" />
    ${[[96, 64], [104, 74], [100, 84]].map(([x, y]) => html`<circle key=${x + '' + y} cx=${x} cy=${y} r="3" fill="#1d4ed8" />`)}
    <path d="M82 28 q0 -18 45 -18 h30 M118 30 q0 -8 20 -10 h30" stroke="#334155" strokeWidth="2.5" fill="none" />
    <rect x="158" y="6" width="30" height="20" rx="4" fill="#facc15" />
  </svg>`;
}

const events = {
  su_key: { zh: '鎖匙夾好喇，接咗電池嘅負極（黑色）。', en: 'The key is clipped on and connected to the negative terminal (black).' },
  su_cu: { zh: '銅片夾好喇，接咗電池嘅正極（紅色）。', en: 'The copper strip is clipped on and connected to the positive terminal (red).' },
  su_keyWrong: { zh: '鎖匙唔可以接正極！如果接咗正極，鎖匙會俾電慢慢蝕走，而唔係鍍上銅。要接黑色嘅負極。', en: 'The key must not go on the positive clip! There, the key would slowly be eaten away instead of being plated. Use the black negative clip.' },
  su_cuWrong: { zh: '銅片要接紅色嘅正極，佢會慢慢溶出新嘅銅離子，補返落溶液度。', en: 'The copper strip goes on the red positive clip, where it slowly releases new copper ions into the solution.' },
  setupAll: { zh: '電路接好喇！', en: 'The circuit is ready!' },
  pw_need: { zh: '要先夾好鎖匙同銅片，先好開電。', en: 'Clip on the key and the copper strip first, then switch on.' },
  pw_on: { zh: '開咗電！我哋快轉十分鐘。藍色細點係銅離子，佢哋由銅片嗰邊游去鎖匙。', en: 'The power is on! Let us fast-forward ten minutes. The blue dots are copper ions swimming from the copper strip to the key.' },
  pw_done: { zh: '十分鐘之後：鎖匙鍍上咗一層銅，變成銅色！銅片細咗少少，但係溶液仍然係藍色。', en: 'Ten minutes later: the key is coated with copper and looks copper-coloured! The copper strip is a little thinner, but the solution is still blue.' },
  switchDone: { zh: '電鍍已經完成喇。', en: 'The plating is already finished.' },
  beaker: { zh: '藍色溶液係硫酸銅溶液，入面有好多銅離子。佢有害，要戴手套，唔好掂。', en: 'The blue solution is copper sulfate solution, full of copper ions. It is harmful, so wear gloves and do not touch it.' },
  battery: { zh: '呢個係低電壓電池，好安全。千祈唔好用牆上面嘅電插座做實驗！', en: 'This is a low-voltage battery, which is safe. Never use a wall socket for experiments!' },
  can: { zh: '罐頭嘅鐵罐鍍咗一層錫，可以防止生鏽。', en: 'Food cans are steel coated with tin, which stops them rusting.' },
  gloves: { zh: '處理硫酸銅溶液要戴手套同護目鏡。', en: 'Wear gloves and goggles when handling copper sulfate solution.' },
};

export default {
  id: 'plating', topics: ['5.4'], accent: '#0ea5e9', dark: '#0369a1', bg: 'linear-gradient(135deg,#e0f2fe,#fef3c7)', Art,
  title: { zh: '電鍍魔法', en: 'Electroplating Magic' },
  desc: { zh: '用電將一條銀色鎖匙鍍上一層銅！睇下溶液入面嘅銅離子點樣搬家。', en: 'Use electricity to coat a silver key with copper! Watch how copper ions move through the solution.' },
  steps: [
    { tag: 'intro', zh: '你見過金光閃閃嘅首飾、亮晶晶嘅水喉嗎？好多都唔係成件用金或者鉻整，而係喺表面「鍍」咗薄薄一層。今日我哋用電，將一條普通嘅銀色鎖匙鍍上一層銅！安全提提你：藍色嘅硫酸銅溶液有害，要戴手套，唔好掂；我哋只用低電壓電池，千祈唔好用牆上面嘅電插座。後面嘅物件可以撳嚟睇介紹。',
      en: 'Have you seen shiny gold jewellery or gleaming taps? Many are not made entirely of gold or chromium. Instead, they have a thin layer "plated" on the surface. Today we will use electricity to coat an ordinary silver key with copper! Safety first: the blue copper sulfate solution is harmful, so wear gloves and do not touch it. We only use a low-voltage battery, never a wall socket. Tap the objects at the back to learn about them.' },
    { tag: 'try', action: { id: 'setup', events: ['su_'] }, zh: '將鎖匙拖去黑色嘅負極夾，再將銅片拖去紅色嘅正極夾。兩樣都會浸落藍色溶液度。',
      en: 'Drag the key to the black negative clip, then drag the copper strip to the red positive clip. Both will dip into the blue solution.' },
    { tag: 'observe', zh: '電路接好：電池嘅負極接鎖匙，正極接銅片。藍色溶液叫「硫酸銅溶液」，入面有好多帶正電嘅「銅離子」，溶液就係因為佢哋先變藍色。',
      en: 'The circuit is ready: the battery\'s negative terminal connects to the key, and the positive terminal to the copper strip. The blue liquid is copper sulfate solution. It is full of positively charged copper ions, which are what make it blue.' },
    { tag: 'try', action: { id: 'power', events: ['pw_'] }, zh: '撳右邊嘅開關通電！我哋會快轉十分鐘，睇下鎖匙有咩變化。',
      en: 'Tap the switch on the right to turn on the power! We will fast-forward ten minutes and see what happens to the key.' },
    { tag: 'observe', zh: '鎖匙由銀色慢慢變成銅色，表面鋪咗一層銅！銅片就細咗少少。奇怪嘅係，溶液仍然係藍色，冇變淡。',
      en: 'The key slowly changes from silver to copper-coloured: it is now coated with copper! The copper strip gets a little thinner. Strangely, the solution stays blue and does not get paler.' },
    { tag: 'feynman', zh: '正電同負電會互相吸引。帶正電嘅銅離子會游去接住負極嘅鎖匙，攞返電子，變返銅原子，一粒一粒咁鋪喺鎖匙表面。同時，正極嘅銅片會交出電子，變成新嘅銅離子溶落水度補返，所以溶液嘅藍色一直都冇變淡。',
      en: 'Positive and negative charges attract each other. The positively charged copper ions swim to the key on the negative side, pick up electrons and turn back into copper atoms, settling on the key one by one. Meanwhile, the copper strip on the positive side gives away electrons and becomes new copper ions that dissolve into the water, so the blue colour never fades.' },
    { tag: 'first', zh: '由最基本諗起：電池好似一個電子泵，將電子由銅片嗰邊抽走，再推去鎖匙嗰邊。鎖匙有多咗電子，溶液入面嘅銅離子攞咗電子，就變成銅金屬；銅片少咗電子，銅原子就變成銅離子。記得檸檬電池嗎？嗰個係「化學反應產生電」；電鍍就啱啱相反，係「用電推動化學反應」，叫做「電解」。',
      en: 'Back to basics: the battery is like an electron pump. It pulls electrons away from the copper strip and pushes them over to the key. On the key, copper ions from the solution take those electrons and become copper metal; on the copper strip, copper atoms lose electrons and become copper ions. Remember the lemon battery? That was "a chemical reaction making electricity". Electroplating is the opposite: "electricity driving a chemical reaction". This is called electrolysis.' },
    { tag: 'life', zh: '生活應用：鍍金首飾、鍍鉻水喉、罐頭用嘅鍍錫鐵罐、鍍銀餐具，都係用電鍍整嘅。只要用少少貴金屬，就可以令東西又靚又唔易生鏽。',
      en: 'Everyday life: gold-plated jewellery, chrome-plated taps, tin-plated food cans and silver-plated cutlery are all made by electroplating. A thin layer of a precious metal makes things look good and stops them rusting.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '想將一隻匙羹鍍銀，匙羹應該接去電池嘅邊一極？', en: 'To silver-plate a spoon, which battery terminal should the spoon be connected to?' },
    options: [
      { zh: '正極', en: 'The positive terminal' },
      { zh: '負極', en: 'The negative terminal' },
      { zh: '邊一極都得', en: 'Either terminal' },
    ],
    correct: 1,
    right: { zh: '啱！帶正電嘅銀離子會游去負極，攞返電子變成銀，鋪喺匙羹上面。', en: 'Right! Positively charged silver ions swim to the negative side, pick up electrons and become silver on the spoon.' },
    wrong: { zh: '再諗下鎖匙：佢接咗邊一極，先至鍍到銅？', en: 'Think about the key: which terminal was it connected to when it got plated with copper?' },
  },
  tools: [
    { id: 's', label: { zh: '夾好下一樣', en: 'Clip on the next item' }, run: (c) => c.setupNext() },
    { id: 'p', primary: true, label: { zh: '⚡ 開電', en: '⚡ Switch on' }, run: (c) => c.power() },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = { key: false, cu: false, on: false, plate: 0 };
    const push = () => api.state({ ...S });
    const BZ = -0.3, LV = 0.6;
    const bk = K.makeVessel(K.beakerProfile(0.5, 0.85), { liquidColor: BLUE, level: LV, opacity: 0.72, sx: 0.95 });
    bk.group.position.set(0, T + 0.01, BZ); scene.add(bk.group);
    const lBk = api.label({ zh: '硫酸銅溶液', en: 'Copper sulfate solution' }, { border: BLUE, h: 0.17 }); lBk.position.set(0, T + 0.1, BZ + 0.75);
    api.tap(bk.group, () => api.emit('beaker'), { zh: '硫酸銅溶液', en: 'Copper sulfate solution' }, [lBk]);
    // 橫架同兩個夾
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 0.08), K.stdMat('#e2e8f0', 0.5)); bar.position.set(0, T + 1.12, BZ); scene.add(bar);
    const CLIP = { neg: V3(-0.25, T + 1.05, BZ), pos: V3(0.25, T + 1.05, BZ) };
    [[CLIP.neg, '#111827'], [CLIP.pos, '#dc2626']].forEach(([p, c]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.08), K.stdMat(c, 0.4)); m.position.copy(p); scene.add(m); });
    const lNeg = api.label({ zh: '− 負極', en: '− negative' }, { border: '#111827', h: 0.15 }); lNeg.position.set(-0.55, T + 1.35, BZ);
    const lPos = api.label({ zh: '＋ 正極', en: '+ positive' }, { border: '#dc2626', h: 0.15 }); lPos.position.set(0.55, T + 1.35, BZ);
    // 電池同開關
    const BX = 2.15;
    const bat = new THREE.Mesh(new K.RoundedBoxGeometry(0.7, 0.36, 0.42, 2, 0.04), K.stdMat('#facc15', 0.5)); bat.position.set(BX, T + 0.18, -0.4); scene.add(bat);
    const tN = V3(BX - 0.18, T + 0.4, -0.4), tP = V3(BX + 0.18, T + 0.4, -0.4);
    [[tN, '#111827'], [tP, '#dc2626']].forEach(([p, c]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 16), K.stdMat(c, 0.4)); m.position.copy(p); m.position.y -= 0.03; scene.add(m); });
    const lBat = api.label({ zh: '低電壓電池', en: 'Low-voltage battery' }, { border: '#ca8a04', h: 0.15 }); lBat.position.set(BX, T + 0.7, -0.4);
    api.tap(bat, () => api.emit('battery'), { zh: '電池', en: 'Battery' }, [lBat]);
    const wire = (a, b, c) => { const m = a.clone().lerp(b, 0.5); m.y = Math.max(a.y, b.y) + 0.35; const mesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, m, b]), 40, 0.015, 8, false), K.stdMat(c, 0.5)); scene.add(mesh); };
    wire(V3(CLIP.neg.x, CLIP.neg.y + 0.06, BZ), tN, '#111827');
    wire(V3(CLIP.pos.x, CLIP.pos.y + 0.06, BZ), tP, '#dc2626');
    const sw = new THREE.Group(); sw.position.set(BX, T, 0.55); scene.add(sw);
    const swBase = new THREE.Mesh(new K.RoundedBoxGeometry(0.42, 0.12, 0.42, 2, 0.03), K.stdMat('#334155', 0.5)); swBase.position.y = 0.06; sw.add(swBase);
    const btnMat = new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.4, emissive: '#22c55e', emissiveIntensity: 0 });
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.08, 24), btnMat); btn.position.y = 0.16; sw.add(btn);
    const lSw = api.label({ zh: '⚡ 開關', en: '⚡ Switch' }, { border: '#ef4444', h: 0.16 }); lSw.position.set(BX, T + 0.48, 0.55);
    // 後排：罐頭、手套
    const can = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.36, 24), K.stdMat('#d1d5db', 0.25, 0.9)); can.position.set(-2.8, T + 0.18, -1.15); scene.add(can);
    const glove = new THREE.Group(); glove.position.set(2.85, T + 0.04, -1.15); scene.add(glove);
    const gPalm = new THREE.Mesh(new K.RoundedBoxGeometry(0.3, 0.06, 0.34, 2, 0.03), K.stdMat('#60a5fa', 0.7)); glove.add(gPalm);
    [-0.1, -0.03, 0.04, 0.11].forEach((x) => { const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.14, 4, 8), K.stdMat('#60a5fa', 0.7)); f.rotation.x = Math.PI / 2; f.position.set(x, 0, -0.25); glove.add(f); });
    [[can, 'can', { zh: '罐頭', en: 'Food can' }, -2.8, 0.55], [glove, 'gloves', { zh: '手套', en: 'Gloves' }, 2.85, 0.35]].forEach(([o, ev, name, x, y]) => {
      const l = api.label(name, { border: '#94a3b8', h: 0.15 }); l.position.set(x, T + y, -1.15);
      api.tap(o, () => api.emit(ev), name, [l]);
    });

    // 鎖匙（原點喺鎖匙底；平放喺檯面）
    const keyMat = K.stdMat(SILVER, 0.25, 0.9);
    const key = new THREE.Group(); key.position.set(-2.3, T + 0.02, 0.85); key.rotation.x = -Math.PI / 2; scene.add(key);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.03, 10, 28), keyMat); ring.position.y = 0.5; key.add(ring);
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.42, 0.025), keyMat); shaft.position.y = 0.21; key.add(shaft);
    [[0.06, 0.05], [0.05, 0.13], [0.07, 0.2]].forEach(([w, y]) => { const tooth = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, 0.025), keyMat); tooth.position.set(0.025 + w / 2, y, 0); key.add(tooth); });
    const lKey = api.label({ zh: '鎖匙', en: 'Key' }, { border: '#64748b', h: 0.17 }); lKey.position.set(0, 0.25, 0.25); key.add(lKey);
    // 銅片（企喺座度）
    const cuG = new THREE.Group(); cuG.position.set(-1.1, T + 0.33, 0.95); scene.add(cuG);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.6, 0.14), K.stdMat('#d9783a', 0.3, 0.85)); cuG.add(strip);
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.25), K.stdMat('#e2e8f0', 0.6)); stand.position.set(-1.1, T + 0.025, 0.95); scene.add(stand);
    const lCu = api.label({ zh: '銅片', en: 'Copper strip' }, { border: '#d9783a', h: 0.17 }); lCu.position.set(0, -0.2, 0.3); cuG.add(lCu);
    const HANG = { key: V3(CLIP.neg.x, T + 0.34, BZ), cu: V3(CLIP.pos.x, T + 0.72, BZ) };

    // 銅離子（藍色細點）
    const ION = 26;
    const ions = new THREE.InstancedMesh(new THREE.SphereGeometry(0.025, 10, 8), new THREE.MeshBasicMaterial({ color: '#1d4ed8' }), ION);
    ions.count = 0; ions.frustumCulled = false; ions.renderOrder = 5; scene.add(ions);
    const ionData = [...Array(ION)].map(() => ({ ph: Math.random(), y: T + 0.18 + Math.random() * 0.36, z: BZ + (Math.random() - 0.5) * 0.4 }));

    let busy = false, flow = 0;
    async function clipOn(which, slot, h) {
      if (busy || S[which]) return false;
      if ((which === 'key') !== (slot === 'neg')) { api.emit(which === 'key' ? 'su_keyWrong' : 'su_cuWrong'); return false; }
      busy = true;
      const obj = which === 'key' ? key : cuG, to = HANG[which];
      (which === 'key' ? lKey : lCu).visible = false;
      await K.moveTo(tw, obj, V3(to.x, to.y + 0.75, to.z), 0, 0.45, 0);
      await K.moveTo(tw, obj, to, 0, 0.45, 0);
      K.ripple(scene, tw, V3(to.x, T + 0.01 + LV, BZ));
      h.setHome(to.clone()); h.homeRot.set(0, 0, 0);
      S[which] = true; push(); api.emit(which === 'key' ? 'su_key' : 'su_cu');
      busy = false;
      if (S.key && S.cu) { api.done('setup'); api.emit('setupAll'); }
    }
    async function power() {
      if (busy) return;
      if (S.plate >= 1) { api.emit('switchDone'); return; }
      if (!(S.key && S.cu)) { api.emit('pw_need'); return; }
      busy = true; S.on = true; push();
      btn.position.y = 0.13; btnMat.color.set('#22c55e'); btnMat.emissiveIntensity = 0.6;
      api.emit('pw_on');
      const c0 = new THREE.Color(SILVER), c1 = new THREE.Color(COPPER);
      await tw.to(6, (k) => { flow = 1; S.plate = k; keyMat.color.copy(c0).lerp(c1, k); keyMat.roughness = 0.25 + 0.15 * k; strip.scale.z = 1 - 0.15 * k; }, K.lin);
      S.plate = 1; S.on = false; flow = 0; push();
      btn.position.y = 0.16; btnMat.color.set('#ef4444'); btnMat.emissiveIntensity = 0;
      await api.waitSpeech();
      api.emit('pw_done'); api.done('power');
      busy = false;
    }
    // 兩樣嘢都可以拖去兩個夾；拖錯會解釋點解，然後返原位
    const clipTargets = (which) => () => ['neg', 'pos'].map((slot) => ({ key: slot, pos: CLIP[slot], r: 0.28, ringY: T, accept: () => !S[which] && !(slot === 'neg' ? S.key : S.cu) }));
    const hKey = api.drag(key, { label: { zh: '鎖匙', en: 'Key' }, lift: 0.9, enabled: () => !busy && !S.key, targets: clipTargets('key'),
      onDrop: (tg, h) => clipOn('key', tg.key, h), onTap: () => { if (!busy && !S.key) hKey.dropOn('neg'); } });
    const hCu = api.drag(cuG, { label: { zh: '銅片', en: 'Copper strip' }, lift: 0.7, extra: [stand], enabled: () => !busy && !S.cu, targets: clipTargets('cu'),
      onDrop: (tg, h) => clipOn('cu', tg.key, h), onTap: () => { if (!busy && !S.cu) hCu.dropOn('pos'); } });
    api.tap(sw, () => power(), { zh: '開關', en: 'Switch' }, [lSw]);

    const homes = { key: key.position.clone(), keyRot: key.rotation.clone(), cu: cuG.position.clone() };
    push();
    return {
      cam: { pos: [0.1, 3.8, 4.9], target: [0.1, 1.5, -0.1], fitW: 6.4 },
      power,
      setupNext() { if (busy) return; if (!S.key) hKey.dropOn('neg'); else if (!S.cu) hCu.dropOn('pos'); },
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (id === 'setup') {
          if (!S.key) { await hKey.dropOn('neg'); await api.waitSpeech(); }
          while (busy) await tw.wait(0.1);
          if (!S.cu) await hCu.dropOn('pos');
        }
        if (id === 'power') await power();
      },
      getHint(id) {
        if (busy) return null;
        if (id === 'setup') return !S.key ? { from: K.worldOf(key), to: CLIP.neg } : !S.cu ? { from: K.worldOf(cuG), to: CLIP.pos } : null;
        if (id === 'power') return S.plate >= 1 ? null : { from: K.worldOf(btn, 0.05) };
        return null;
      },
      update(dt, t) {
        if (flow) {
          const m4 = new THREE.Matrix4();
          ionData.forEach((d, i) => { const u = (d.ph + t * 0.35) % 1; m4.makeTranslation(CLIP.pos.x - 0.06 - u * 0.38, d.y + Math.sin(t * 3 + i) * 0.02, d.z); ions.setMatrixAt(i, m4); });
          ions.count = ION; ions.instanceMatrix.needsUpdate = true;
        } else ions.count = 0;
      },
      reset() {
        tw.clear(); busy = false; flow = 0; ions.count = 0;
        Object.assign(S, { key: false, cu: false, on: false, plate: 0 }); push();
        keyMat.color.set(SILVER); keyMat.roughness = 0.25; strip.scale.z = 1;
        btn.position.y = 0.16; btnMat.color.set('#ef4444'); btnMat.emissiveIntensity = 0;
        lKey.visible = true; lCu.visible = true;
        hKey.setHome(homes.key); hKey.homeRot.copy(homes.keyRot); hCu.setHome(homes.cu); hCu.homeRot.set(0, 0, 0);
        [hKey, hCu].forEach((h) => { h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.busy = false; });
      },
    };
  },
};
