/* Topic 6.1 氯和次氯酸鹽：電解鹽水製造氯；氯的性質；漂白水的製造 */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V2, V3 } = K;

const CL_GAS = '#d9f99d';

function Panel({ S }) {
  const { lang } = useApp();
  const zh = lang === 'zh';
  const row = (label, val) => html`<div className="flex items-center gap-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2"><b className="flex-1 text-slate-700">${label}</b><span className="text-slate-600 text-right">${val}</span></div>`;
  return html`<div className="grid gap-1.5 text-sm">
    <div className="rounded-xl bg-rose-50 ring-1 ring-rose-300 px-3 py-2 text-rose-800"><b>⚠️ ${zh ? '安全：' : 'Safety: '}</b>${zh ? '氯氣有毒、有刺鼻味，只可以由老師喺抽氣櫃入面做。' : 'Chlorine is poisonous and choking. Only a teacher may do this, inside a fume cupboard.'}</div>
    ${row(zh ? '⚡ 通電' : '⚡ Power', S.on ? '✅' : '—')}
    ${row(zh ? '🔴 正極氣體' : '🔴 Gas at positive', S.on ? (zh ? '淡黃綠色 → 氯氣' : 'pale yellow-green → chlorine') : '—')}
    ${row(zh ? '⚫ 負極氣體' : '⚫ Gas at negative', S.on ? (zh ? '無色 → 氫氣' : 'colourless → hydrogen') : '—')}
    ${row(zh ? '🧻 濕藍色石蕊試紙（正極）' : '🧻 Damp blue litmus (positive)', S.lit ? (zh ? '先變紅，再變白 ✅' : 'red, then bleached white ✅') : '—')}
    ${row(zh ? '🔥 點著嘅木條（負極）' : '🔥 Burning splint (negative)', S.pop ? (zh ? '「噗」一聲 ✅' : '"pop!" ✅') : '—')}
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    <path d="M40 40 v52 a8 8 0 0 0 8 8 h104 a8 8 0 0 0 8 -8 v-52" fill="#fff" fillOpacity=".9" stroke="#cbd5e1" strokeWidth="3" />
    <rect x="43" y="56" width="114" height="42" rx="5" fill="#e0f2fe" />
    <rect x="70" y="14" width="18" height="60" rx="8" fill="#ecfccb" stroke="#94a3b8" strokeWidth="2" /><rect x="112" y="14" width="18" height="60" rx="8" fill="#fff" stroke="#94a3b8" strokeWidth="2" />
    <rect x="70" y="14" width="18" height="24" rx="8" fill="#d9f99d" />
    <text x="79" y="10" fontSize="12" fontWeight="900" textAnchor="middle" fill="#dc2626">+</text><text x="121" y="10" fontSize="12" fontWeight="900" textAnchor="middle" fill="#334155">−</text>
  </svg>`;
}

const events = {
  pw_on: { zh: '通電喇！兩條電極都不停冒泡，氣體慢慢收集喺試管頂。', en: 'The power is on! Both electrodes bubble, and the gases collect at the tops of the tubes.' },
  pw_done: { zh: '正極試管收集到淡黃綠色嘅氣體，負極試管收集到無色嘅氣體，而且負極嗰邊收集得多啲。', en: 'The positive tube has collected a pale yellow-green gas, and the negative tube a colourless gas, with more gas on the negative side.' },
  pw_already: { zh: '已經收集好氣體喇。', en: 'The gases have already been collected.' },
  ts_litmus: { zh: '濕藍色石蕊試紙先變紅，跟住褪色變白！氯氣溶喺水會變酸，仲可以漂白。', en: 'The damp blue litmus turns red, then bleaches white! Chlorine makes water acidic and also bleaches.' },
  ts_pop: { zh: '「噗！」點著嘅木條一放近負極試管就響，證明係氫氣。', en: '"Pop!" The burning splint pops at the negative tube, which proves the gas is hydrogen.' },
  ts_litWrong: { zh: '試紙要用嚟測試正極（紅色）嗰支試管嘅氣體。', en: 'The litmus paper is for testing the gas in the positive (red) tube.' },
  ts_splWrong: { zh: '氯氣唔會「噗」一聲。木條要用嚟測試負極（黑色）嗰支試管。', en: 'Chlorine does not pop. The splint is for testing the negative (black) tube.' },
  ts_need: { zh: '要先通電收集氣體，先好測試。', en: 'Switch on and collect the gases first, then test them.' },
  tsAll: { zh: '兩種氣體都認出嚟喇：正極係氯氣，負極係氫氣！', en: 'Both gases identified: chlorine at the positive electrode and hydrogen at the negative!' },
  brine: { zh: '呢杯係濃鹽水，即係溶咗好多食鹽（氯化鈉）嘅水。', en: 'This beaker holds brine: water with lots of table salt (sodium chloride) dissolved in it.' },
  pool: { zh: '泳池同食水會加少量含氯嘅物質，殺死細菌。', en: 'Swimming pools and drinking water are treated with a little chlorine to kill germs.' },
  pipe: { zh: '好多水管係 PVC 塑膠整嘅，PVC 入面都有氯。', en: 'Many water pipes are made of PVC plastic, which contains chlorine.' },
};

export default {
  id: 'chlorine', topics: ['6.1'], accent: '#65a30d', dark: '#3f6212', bg: 'linear-gradient(135deg,#ecfccb,#e0f2fe)', Art,
  title: { zh: '漂白水嘅秘密', en: 'The Secret of Bleach' },
  desc: { zh: '電解鹽水，收集氯氣同氫氣，再用測試認出佢哋，揭開漂白水點樣整出嚟！', en: 'Electrolyse salt water, collect chlorine and hydrogen, identify them with tests, and find out how bleach is made!' },
  steps: [
    { tag: 'intro', zh: '漂白水同泳池消毒用嘅「氯」，係點樣整出嚟㗎？原來係用電解鹽水！今日我哋電解濃鹽水，收集兩種氣體，再用測試認出佢哋。安全提提你：氯氣有毒、有刺鼻味，只可以由老師喺抽氣櫃入面做。後面嘅物件可以撳嚟睇介紹。',
      en: 'How is the chlorine in bleach and swimming pools made? By electrolysing salt water! Today we will electrolyse brine, collect two gases and identify them with tests. Safety first: chlorine is poisonous and choking, so only a teacher may do this, inside a fume cupboard. Tap the objects at the back to learn about them.' },
    { tag: 'try', action: { id: 'power', events: ['pw_'] }, zh: '撳右邊嘅開關通電，睇下兩條電極有咩變化。', en: 'Tap the switch on the right to turn on the power, and watch the two electrodes.' },
    { tag: 'observe', zh: '兩條電極都冒泡。正極（紅色）收集到淡黃綠色嘅氣體，負極（黑色）收集到無色嘅氣體。正極嘅氣體有少少溶咗落水，所以收集得少啲。',
      en: 'Both electrodes bubble. The positive electrode (red) collects a pale yellow-green gas and the negative electrode (black) a colourless gas. Some of the gas at the positive electrode dissolves in the water, so less of it collects.' },
    { tag: 'try', action: { id: 'test', events: ['ts_'] }, zh: '將濕咗嘅藍色石蕊試紙拖去正極嗰支試管，再將點著嘅木條拖去負極嗰支試管。', en: 'Drag the damp blue litmus paper to the positive tube, then drag the burning splint to the negative tube.' },
    { tag: 'observe', zh: '石蕊試紙先變紅，再褪色變白：呢個係氯氣嘅特徵。木條一放近負極就「噗」一聲：呢個係氫氣嘅特徵。',
      en: 'The litmus paper turns red and then white: the sign of chlorine. The splint pops at the negative tube: the sign of hydrogen.' },
    { tag: 'feynman', zh: '鹽水入面有鈉離子同氯離子。通電之後，帶負電嘅氯離子游去正極，交出電子，變成氯氣；負極嗰邊，水接收電子，放出氫氣，剩低嘅溶液就慢慢變成氫氧化鈉。',
      en: 'Brine contains sodium ions and chloride ions. With the power on, the negative chloride ions swim to the positive electrode and give up electrons to become chlorine gas; at the negative electrode, water gains electrons and gives off hydrogen, and the solution left behind slowly becomes sodium hydroxide.' },
    { tag: 'first', zh: '由最基本諗起：電解即係用電推動化學反應。工廠電解濃鹽水，一次過得到三樣有用嘅產品：氯氣、氫氣同氫氧化鈉。再將氯氣通入凍嘅氫氧化鈉溶液，就整到漂白水嘅主要成分次氯酸鈉（記得褪色魔術嗎？）。',
      en: 'Back to basics: electrolysis uses electricity to drive a chemical reaction. Factories electrolyse brine to get three useful products at once: chlorine, hydrogen and sodium hydroxide. Bubbling chlorine into cold sodium hydroxide solution then makes sodium hypochlorite, the main ingredient of bleach (remember the Vanishing Colour Trick?).' },
    { tag: 'life', zh: '生活應用：食水同泳池會加少量含氯物質殺菌；漂白水用嚟消毒；氯仲用嚟整 PVC 塑膠水管。電解得出嚟嘅氫氣，可以做燃料。',
      en: 'Everyday life: drinking water and swimming pools are treated with chlorine compounds to kill germs; bleach is used for disinfecting; and chlorine is used to make PVC plastic pipes. The hydrogen from electrolysis can be used as a fuel.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '點解電解鹽水嘅實驗一定要喺抽氣櫃入面做？', en: 'Why must the electrolysis of brine be done inside a fume cupboard?' },
    options: [{ zh: '因為會產生有毒嘅氯氣', en: 'Because it makes poisonous chlorine gas' }, { zh: '因為實驗會好凍', en: 'Because the experiment gets very cold' }, { zh: '因為實驗好嘈', en: 'Because the experiment is noisy' }],
    correct: 0,
    right: { zh: '啱！氯氣有毒，吸入會傷害呼吸道，所以一定要喺抽氣櫃入面做。', en: 'Right! Chlorine is poisonous and harms the airways if breathed in, so it must stay inside a fume cupboard.' },
    wrong: { zh: '再諗下：正極產生嘅淡黃綠色氣體係咩？佢安唔安全？', en: 'Think again: what is the pale yellow-green gas at the positive electrode, and is it safe?' },
  },
  tools: [
    { id: 'p', primary: true, label: { zh: '⚡ 開電', en: '⚡ Switch on' }, run: (c) => c.power() },
    { id: 't', label: { zh: '測試下一種氣體', en: 'Test the next gas' }, run: (c) => c.testNext() },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = { on: false, lit: false, pop: false };
    const push = () => api.state({ ...S });
    const BX = -0.3, BZ = -0.3, LV = 0.55, EX = [0.22, -0.22]; // [正極, 負極]
    // 抽氣櫃
    const hood = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.1, 1.4), new THREE.MeshPhysicalMaterial({ color: '#e0f2fe', roughness: 0.1, transparent: true, opacity: 0.15, side: THREE.DoubleSide, depthWrite: false })); hood.position.set(BX, T + 1.05, -0.5); hood.renderOrder = 1; scene.add(hood);
    const bk = K.makeVessel(K.beakerProfile(0.55, 0.75), { liquidColor: '#e0f2fe', level: LV, opacity: 0.55, sx: 0.95 });
    bk.group.position.set(BX, T + 0.01, BZ); scene.add(bk.group);
    const lBk = api.label({ zh: '濃鹽水', en: 'Brine' }, { border: '#0ea5e9', h: 0.15 }); lBk.position.set(BX, T + 0.1, BZ + 0.75);
    api.tap(bk.group, () => api.emit('brine'), { zh: '濃鹽水', en: 'Brine' }, [lBk]);
    // 電極同收集試管（倒轉）
    const tubes = EX.map((dx, i) => {
      const x = BX + dx;
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 10), K.stdMat('#27272a', 0.6)); rod.position.set(x, T + 0.25, BZ); scene.add(rod);
      const g = new THREE.Group(); g.position.set(x, T + 0.2, BZ); scene.add(g);
      const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.05, 24, 1, true), K.glassMat()); shell.position.y = 0.525; shell.renderOrder = 3; g.add(shell);
      const top = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 8, 0, Math.PI * 2, 0, Math.PI / 2), K.glassMat()); top.position.y = 1.05; g.add(top);
      const water = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1, 20), K.liquidMat('#e0f2fe', 0.55)); water.renderOrder = 2; g.add(water);
      const gas = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1, 20), new THREE.MeshBasicMaterial({ color: i === 0 ? CL_GAS : '#ffffff', transparent: true, opacity: i === 0 ? 0.65 : 0.05, depthWrite: false })); gas.renderOrder = 2; g.add(gas);
      const lab = api.label(i === 0 ? { zh: '＋ 正極', en: '+ positive' } : { zh: '− 負極', en: '− negative' }, { border: i === 0 ? '#dc2626' : '#111827', h: 0.14 }); lab.position.set(x + (i === 0 ? 0.3 : -0.3), T + 1.4, BZ);
      const setGas = (h) => { const wTop = 1.05 - h; water.scale.y = Math.max(0.001, wTop); water.position.y = wTop / 2; gas.scale.y = Math.max(0.001, h); gas.position.y = 1.05 - h / 2; gas.visible = h > 0.005; };
      setGas(0);
      return { g, setGas, bub: K.makeBubbles(scene, { max: 80, size: 0.02 }), x, top: V3(x, T + 1.3, BZ) };
    });
    // 電池同開關
    const SX = 2.0;
    const bat = new THREE.Mesh(new K.RoundedBoxGeometry(0.6, 0.32, 0.4, 2, 0.04), K.stdMat('#facc15', 0.5)); bat.position.set(SX, T + 0.16, -0.6); scene.add(bat);
    const wire = (a, b, c) => { const m = a.clone().lerp(b, 0.5); m.y = Math.max(a.y, b.y) + 0.3; scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, m, b]), 40, 0.014, 8, false), K.stdMat(c, 0.5))); };
    wire(V3(BX + EX[0], T + 0.5, BZ), V3(SX + 0.15, T + 0.33, -0.6), '#dc2626');
    wire(V3(BX + EX[1], T + 0.5, BZ), V3(SX - 0.15, T + 0.33, -0.6), '#111827');
    const sw = new THREE.Group(); sw.position.set(SX, T, 0.5); scene.add(sw);
    const swBase = new THREE.Mesh(new K.RoundedBoxGeometry(0.42, 0.12, 0.42, 2, 0.03), K.stdMat('#334155', 0.5)); swBase.position.y = 0.06; sw.add(swBase);
    const btnMat = new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.4 });
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.08, 24), btnMat); btn.position.y = 0.16; sw.add(btn);
    const lSw = api.label({ zh: '⚡ 開關', en: '⚡ Switch' }, { border: '#ef4444', h: 0.15 }); lSw.position.set(SX, T + 0.45, 0.5);
    // 測試工具：濕藍色石蕊試紙、點著嘅木條
    const lit = new THREE.Group(); lit.position.set(-2.4, T + 0.05, 0.9); scene.add(lit);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.55, 0.015), K.stdMat('#3f6fd8', 0.9)); strip.position.y = 0.3; lit.add(strip);
    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.08), K.stdMat('#f59e0b', 0.5)); clip.position.y = 0.6; lit.add(clip);
    const litHit = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 0.2), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); litHit.position.y = 0.35; lit.add(litHit);
    const lLit = api.label({ zh: '濕藍色石蕊試紙', en: 'Damp blue litmus' }, { border: '#3f6fd8', h: 0.14 }); lLit.position.set(0, -0.02, 0.38); lit.add(lLit);
    const spl = new THREE.Group(); spl.position.set(-1.4, T + 0.08, 0.9); scene.add(spl);
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.6, 10), K.stdMat('#c08a4a', 0.8)); stick.position.y = 0.3; spl.add(stick);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 14), new THREE.MeshBasicMaterial({ color: '#fb923c', transparent: true, opacity: 0.9 })); flame.position.y = 0.7; spl.add(flame);
    const splHit = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.75, 0.22), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); splHit.position.y = 0.38; spl.add(splHit);
    const lSpl = api.label({ zh: '點著嘅木條', en: 'Burning splint' }, { border: '#f97316', h: 0.14 }); lSpl.position.set(0, -0.02, 0.38); spl.add(lSpl);
    // 後排：泳池水、PVC 水管
    const pool = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 24), K.stdMat('#38bdf8', 0.2)); pool.position.set(-2.85, T + 0.04, -1.2); scene.add(pool);
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.6, 16), K.stdMat('#e5e7eb', 0.5)); pipe.rotation.z = Math.PI / 2; pipe.position.set(2.75, T + 0.07, -1.2); scene.add(pipe);
    [[pool, 'pool', { zh: '泳池水', en: 'Pool water' }, -2.85, 0.3], [pipe, 'pipe', { zh: 'PVC 水管', en: 'PVC pipe' }, 2.75, 0.3]].forEach(([o, ev, name, x, y]) => {
      const l = api.label(name, { border: '#94a3b8', h: 0.14 }); l.position.set(x, T + y, -1.15);
      api.tap(o, () => api.emit(ev), name, [l]);
    });

    let busy = false, bubbling = 0;
    async function power() {
      if (busy) return;
      if (S.on) { api.emit('pw_already'); return; }
      busy = true; btn.position.y = 0.13; btnMat.color.set('#22c55e'); bubbling = 1;
      api.emit('pw_on');
      await tw.to(5, (k) => { tubes[0].setGas(0.28 * k); tubes[1].setGas(0.42 * k); }, K.lin);
      bubbling = 0; btn.position.y = 0.16; btnMat.color.set('#ef4444');
      S.on = true; push();
      await api.waitSpeech();
      api.emit('pw_done'); api.done('power');
      busy = false;
    }
    const finishTests = () => { if (S.lit && S.pop) { api.done('test'); api.emit('tsAll'); } };
    async function testLit(i, h) {
      if (busy || S.lit) return false;
      if (!S.on) { api.emit('ts_need'); return false; }
      if (i !== 0) { api.emit('ts_litWrong'); return false; }
      busy = true;
      await K.moveTo(tw, lit, V3(tubes[0].x + 0.25, T + 1.0, BZ + 0.2), 0, 0.5);
      const blue = new THREE.Color('#3f6fd8'), red = new THREE.Color('#e2475a'), white = new THREE.Color('#f8fafc');
      api.emit('ts_litmus');
      await tw.to(0.8, (k) => strip.material.color.copy(blue).lerp(red, k));
      await tw.to(1.0, (k) => strip.material.color.copy(red).lerp(white, k));
      S.lit = true; push();
      await h.returnHome();
      busy = false; finishTests();
    }
    async function testSpl(i, h) {
      if (busy || S.pop) return false;
      if (!S.on) { api.emit('ts_need'); return false; }
      if (i !== 1) { api.emit('ts_splWrong'); return false; }
      busy = true;
      const target = V3(tubes[1].x - 0.15, T + 1.05, BZ + 0.15);
      await K.moveTo(tw, spl, K.tipPose(V2(0, 0.7), -0.6, target), -0.6, 0.5);
      api.emit('ts_pop');
      K.popText(scene, tw, '噗！Pop!', V3(tubes[1].x - 0.3, T + 1.5, BZ), '#f97316');
      tubes[1].setGas(0.1);
      S.pop = true; push();
      await tw.wait(0.6); await h.returnHome();
      busy = false; finishTests();
    }
    const tubeTargets = (accept) => () => tubes.map((tb, i) => ({ key: 't' + i, pos: tb.top, r: 0.3, ringY: T, accept }));
    const hLit = api.drag(lit, { label: { zh: '濕藍色石蕊試紙', en: 'Damp blue litmus' }, lift: 0.9, enabled: () => !busy && !S.lit, targets: tubeTargets(() => !S.lit),
      onDrop: (tg, h) => testLit(Number(tg.key.slice(1)), h), onTap: () => { if (busy || S.lit) return; if (!S.on) api.emit('ts_need'); else hLit.dropOn('t0'); } });
    const hSpl = api.drag(spl, { label: { zh: '點著嘅木條', en: 'Burning splint' }, lift: 0.9, enabled: () => !busy && !S.pop, targets: tubeTargets(() => !S.pop),
      onDrop: (tg, h) => testSpl(Number(tg.key.slice(1)), h), onTap: () => { if (busy || S.pop) return; if (!S.on) api.emit('ts_need'); else hSpl.dropOn('t1'); } });
    api.tap(sw, () => power(), { zh: '開關', en: 'Switch' }, [lSw]);

    push();
    return {
      cam: { pos: [0, 3.7, 5.0], target: [0, 1.35, -0.1], fitW: 6.4 },
      power,
      testNext() { if (busy || !S.on) return; if (!S.lit) hLit.dropOn('t0'); else if (!S.pop) hSpl.dropOn('t1'); },
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (id === 'power') await power();
        if (id === 'test') {
          if (!S.lit) { await hLit.dropOn('t0'); await api.waitSpeech(); }
          while (busy) await tw.wait(0.1);
          if (!S.pop) await hSpl.dropOn('t1');
        }
      },
      getHint(id) {
        if (busy) return null;
        if (id === 'power') return S.on ? null : { from: K.worldOf(btn, 0.05) };
        if (id === 'test') return !S.on ? null : !S.lit ? { from: K.worldOf(lit, 0.35), to: tubes[0].top } : !S.pop ? { from: K.worldOf(spl, 0.35), to: tubes[1].top } : null;
        return null;
      },
      update(dt, t) {
        if (bubbling) tubes.forEach((tb) => { if (Math.random() < dt * 25) tb.bub.spawn(tb.x + (Math.random() - 0.5) * 0.05, T + 0.05, BZ + (Math.random() - 0.5) * 0.05, T + 0.5, 0.8); });
        tubes.forEach((tb) => tb.bub.update(dt, t));
        flame.scale.y = 1 + Math.sin(t * 20) * 0.1;
      },
      reset() {
        tw.clear(); busy = false; bubbling = 0;
        Object.assign(S, { on: false, lit: false, pop: false }); push();
        tubes.forEach((tb) => { tb.setGas(0); tb.bub.clear(); });
        strip.material.color.set('#3f6fd8'); btn.position.y = 0.16; btnMat.color.set('#ef4444');
        [hLit, hSpl].forEach((h) => { h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.busy = false; });
      },
    };
  },
};
