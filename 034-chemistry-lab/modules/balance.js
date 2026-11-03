/* Topic 3.3 反應質量：質量守恆（密封同開口錐形瓶）同元素嘅質量百分比 */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V2, V3 } = K;

const START = 152.0, LOSS = 1.0; // 克；2 克梳打粉同醋反應，大約放出 1 克二氧化碳

function Panel({ S }) {
  const { lang } = useApp();
  const zh = lang === 'zh';
  const row = (label, before, after) => html`<div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2 items-center rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2">
    <b className="text-slate-700">${label}</b><span className="text-slate-600">${before}</span><span className="text-slate-600 font-bold">${after}</span>
  </div>`;
  return html`<div className="grid gap-1.5 text-sm">
    <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2 px-3 text-xs font-black text-slate-500"><span></span><span>${zh ? '反應前' : 'Before'}</span><span>${zh ? '反應後' : 'After'}</span></div>
    ${row(zh ? '🔒 密封瓶' : '🔒 Sealed flask', `${START.toFixed(1)} g`, S.sealed ? `${START.toFixed(1)} g ${zh ? '（不變）' : '(same)'}` : '—')}
    ${row(zh ? '🔓 開口瓶' : '🔓 Open flask', `${START.toFixed(1)} g`, S.open ? `${(START - LOSS).toFixed(1)} g ${zh ? '（輕咗）' : '(lighter)'}` : '—')}
    ${S.sealed && S.open ? html`<div className="rounded-xl bg-indigo-50 ring-1 ring-indigo-200 px-3 py-2 text-indigo-900">
      <b>${zh ? '🧮 計下：水入面氧佔幾多質量？' : '🧮 Work it out: how much of water\'s mass is oxygen?'}</b><br />
      ${zh ? '氧 16 ＋ 氫 1 × 2 ＝ 18　→　16 ÷ 18 ≈ 89%' : 'O 16 + H 1 × 2 = 18   →   16 ÷ 18 ≈ 89%'}
    </div>` : null}
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    ${[[60, '152.0'], [140, '151.0']].map(([x, v], i) => html`<g key=${x}>
      <rect x=${x - 34} y="82" width="68" height="20" rx="5" fill="#334155" /><rect x=${x - 20} y="86" width="40" height="12" rx="2" fill="#bbf7d0" />
      <text x=${x} y="96" fontSize="9" fontWeight="900" textAnchor="middle" fill="#14532d">${v}</text>
      <path d=${`M${x - 6} 20 v18 l-20 40 h52 l-20 -40 v-18z`} fill="#fff" fillOpacity=".9" stroke="#cbd5e1" strokeWidth="3" />
      <path d=${`M${x - 22} 70 l6 -12 h32 l6 12z`} fill="#fde68a" />
      ${i === 0 ? html`<rect x=${x - 8} y="14" width="16" height="8" rx="2" fill="#7c2d12" />` : null}
    </g>`)}
  </svg>`;
}

const events = {
  sd_mix: { zh: '密封瓶傾側咗，梳打粉跌落醋度，即刻冒泡！睇住電子磅……', en: 'The sealed flask tips, the baking soda falls into the vinegar and it fizzes straight away! Watch the scale…' },
  sd_done: { zh: '密封瓶：冒完泡之後，讀數仍然係 152.0 克，完全冇變！', en: 'Sealed flask: after the fizzing, the reading is still 152.0 grams. No change at all!' },
  op_mix: { zh: '梳打粉倒咗入開口瓶，都即刻冒泡！睇住電子磅……', en: 'The baking soda is in the open flask, and it fizzes straight away! Watch the scale…' },
  op_done: { zh: '開口瓶：讀數慢慢由 152.0 克跌到 151.0 克，輕咗大約 1 克！', en: 'Open flask: the reading slowly drops from 152.0 to 151.0 grams, about 1 gram lighter!' },
  op_need: { zh: '先試完左邊嘅密封瓶，再試開口瓶。', en: 'Try the sealed flask on the left first, then the open flask.' },
  scale: { zh: '電子磅可以準確量度到零點一克。', en: 'This electronic balance measures to a tenth of a gram.' },
  stopper: { zh: '膠塞塞實個瓶口，氣體走唔甩。份量好少，壓力唔會太大。', en: 'The stopper seals the flask so no gas can escape. The amounts are tiny, so the pressure stays safe.' },
  cake: { zh: '焗蛋糕嗰陣，梳打粉放出二氧化碳，蛋糕焗完會輕咗少少。', en: 'When baking, baking soda gives off carbon dioxide, so the cake is a little lighter afterwards.' },
  ash: { zh: '木頭燒完剩低嘅灰好輕，因為大部分原子變成氣體飄走咗，並唔係唔見咗。', en: 'Ash weighs much less than the wood it came from, because most of the atoms floated away as gases. They did not disappear.' },
};

export default {
  id: 'balance', topics: ['3.3'], accent: '#4f46e5', dark: '#3730a3', bg: 'linear-gradient(135deg,#e0e7ff,#fef3c7)', Art,
  title: { zh: '化學天秤', en: 'The Chemistry Balance' },
  desc: { zh: '化學反應之後，啲物質會唔會「唔見咗」？用電子磅做偵探，發現質量守恆！', en: 'Does anything "disappear" in a chemical reaction? Use a balance as your detective and discover the conservation of mass!' },
  steps: [
    { tag: 'intro', zh: '化學反應之後，啲物質會唔會「唔見咗」？今日我哋用兩部電子磅做偵探：兩個錐形瓶都裝住醋同梳打粉，一個用膠塞密封，一個開口。安全提提你：份量好少，都要戴護目鏡。後面嘅物件可以撳嚟睇介紹。',
      en: 'When substances react, does anything "disappear"? Today two electronic balances are our detectives. Both conical flasks hold vinegar and baking soda: one is sealed with a stopper and one is open. Safety first: the amounts are tiny, but we still wear goggles. Tap the objects at the back to learn about them.' },
    { tag: 'try', action: { id: 'sealed', events: ['sd_'] }, zh: '左邊錐形瓶已經塞好膠塞，入面細試管裝住梳打粉。撳一下個瓶，將佢傾側，令梳打粉跌落醋度。',
      en: 'The flask on the left is sealed with a stopper, and a small tube inside holds the baking soda. Tap the flask to tip it so the baking soda falls into the vinegar.' },
    { tag: 'observe', zh: '密封瓶入面不停冒泡，但係電子磅讀數完全冇變，仍然係 152.0 克！', en: 'The sealed flask fizzes and fizzes, but the reading does not change at all. It is still 152.0 grams!' },
    { tag: 'try', action: { id: 'open', events: ['op_'] }, zh: '而家將右邊碟梳打粉，拖入開口嘅錐形瓶。', en: 'Now drag the dish of baking soda on the right into the open flask.' },
    { tag: 'observe', zh: '開口瓶都冒泡，但係讀數慢慢減少咗大約 1 克！兩個瓶明明係同一個反應，點解結果唔同？',
      en: 'The open flask fizzes too, but its reading slowly drops by about 1 gram! It is the same reaction in both flasks, so why are the results different?' },
    { tag: 'feynman', zh: '化學反應好似將積木拆開再砌過：積木冇唔見，只係換咗組合。密封瓶入面產生嘅二氧化碳走唔甩，所以總質量一樣；開口瓶嘅二氧化碳飄走咗，所以磅落輕咗。',
      en: 'A reaction is like taking Lego apart and building something new: no bricks vanish, they just form new combinations. In the sealed flask, the carbon dioxide made cannot escape, so the total mass stays the same; in the open flask, it drifts away, so the flask weighs less.' },
    { tag: 'first', zh: '由最基本諗起：化學反應只係將原子重新排列，原子唔會憑空出現或者消失，所以反應前後嘅總質量一樣，叫做「質量守恆定律」。我哋仲可以計元素佔幾多質量：一粒水分子有 1 粒氧（16）同 2 粒氫（各 1），總共 18，氧就佔 16 ÷ 18，大約 89%。',
      en: 'Back to basics: a chemical reaction only rearranges atoms; atoms never appear from nowhere or vanish, so the total mass before and after is the same. This is the law of conservation of mass. We can also work out how much of a compound\'s mass is one element: a water molecule has 1 oxygen (16) and 2 hydrogens (1 each), 18 in total, so oxygen makes up 16 ÷ 18, about 89%.' },
    { tag: 'life', zh: '生活應用：焗蛋糕嗰陣，梳打粉放出二氧化碳，蛋糕焗完會輕咗少少；木頭燒完剩低嘅灰好輕，係因為大部分原子變成氣體飄走咗，佢哋並冇真正消失。',
      en: 'Everyday life: baking soda gives off carbon dioxide as a cake bakes, so the cake ends up slightly lighter; ash weighs far less than the wood it came from because most of the atoms floated off as gases. They never truly disappeared.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '一支蠟燭喺一個完全密封嘅玻璃罩入面燒。燒完之後，成個玻璃罩連蠟燭嘅總質量會點？', en: 'A candle burns inside a completely sealed glass jar. Afterwards, what happens to the total mass of the jar and everything inside?' },
    options: [{ zh: '變輕', en: 'It goes down' }, { zh: '不變', en: 'It stays the same' }, { zh: '變重', en: 'It goes up' }],
    correct: 1,
    right: { zh: '啱！蠟燭燒出嚟嘅氣體走唔甩，原子全部仲喺罩入面，所以總質量不變。', en: 'Right! The gases from the burning candle cannot escape, so every atom is still inside and the total mass stays the same.' },
    wrong: { zh: '再諗下密封瓶：氣體走唔走得甩？', en: 'Think about the sealed flask: could the gas escape?' },
  },
  tools: [
    { id: 's', label: { zh: '傾側密封瓶', en: 'Tip the sealed flask' }, run: (c) => c.sealed() },
    { id: 'o', label: { zh: '梳打粉倒入開口瓶', en: 'Baking soda into the open flask' }, run: (c) => c.openNext() },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = { sealed: false, open: false };
    const push = () => api.state({ ...S });
    const XS = [-1.15, 1.15], Z = -0.3, FS = 1.0, LV = 0.28;
    const readings = [START, START];
    const scales = XS.map((x, i) => {
      const base = new THREE.Mesh(new K.RoundedBoxGeometry(1.1, 0.14, 0.8, 2, 0.04), K.stdMat('#334155', 0.5)); base.position.set(x, T + 0.07, Z); scene.add(base);
      const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.03, 32), K.stdMat('#cbd5e1', 0.3, 0.7)); pan.position.set(x, T + 0.155, Z); scene.add(pan);
      const lab = api.label(() => `${readings[i].toFixed(1)} g`, { border: '#16a34a', bg: '#dcfce7', h: 0.2 }); lab.position.set(x, T + 0.1, Z + 0.45);
      api.tap(base, () => api.emit('scale'), { zh: '電子磅', en: 'Electronic balance' }, [lab]);
      return { lab };
    });
    const setRead = (i, v) => { readings[i] = v; scales[i].lab.userData.refresh(); };
    const flasks = XS.map((x, i) => {
      const v = K.makeVessel(K.flaskProfile(FS), { liquidColor: '#fef3c7', level: LV, opacity: 0.7, sx: 0.93 });
      v.group.position.set(x - (i ? 0.15 : 0), T + 0.17, Z); scene.add(v.group);
      return { ...v, bub: K.makeBubbles(v.group, { max: 160, size: 0.025 }), mouth: V3(x - (i ? 0.15 : 0), T + 0.17 + 0.92 * FS, Z) };
    });
    const lF = [api.label({ zh: '🔒 密封瓶', en: '🔒 Sealed' }, { border: '#7c2d12', h: 0.15 }), api.label({ zh: '🔓 開口瓶', en: '🔓 Open' }, { border: '#64748b', h: 0.15 })];
    lF.forEach((l, i) => l.position.set(XS[i], T + 1.35, Z));
    // 密封瓶：膠塞＋入面嘅細試管（裝梳打粉）
    const stopper = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.1, 20), K.stdMat('#7c2d12', 0.8)); stopper.position.set(0, 0.95 * FS, 0); flasks[0].group.add(stopper);
    const inner = new THREE.Group(); inner.position.set(0.05, 0.42, 0); inner.rotation.z = 0.15; flasks[0].group.add(inner);
    const itube = new THREE.Mesh(new THREE.LatheGeometry(K.tubeProfile(0.05, 0.3), 16), K.glassMat()); inner.add(itube);
    const isoda = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 12), K.stdMat('#ffffff', 0.9)); isoda.position.y = 0.06; inner.add(isoda);
    api.tap(stopper, () => api.emit('stopper'), { zh: '膠塞', en: 'Stopper' });
    // 開口瓶旁邊：一碟梳打粉（都放喺電子磅上面）
    const dish = new THREE.Group(); dish.position.set(XS[1] + 0.3, T + 0.17, Z + 0.15); scene.add(dish);
    const dPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.03, 20), K.stdMat('#e2e8f0', 0.5)); dPlate.position.y = 0.015; dish.add(dPlate);
    const dSoda = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 8), K.stdMat('#ffffff', 0.9)); dSoda.scale.y = 0.4; dSoda.position.y = 0.04; dish.add(dSoda);
    const lD = api.label({ zh: '梳打粉', en: 'Baking soda' }, { border: '#94a3b8', h: 0.13 }); lD.position.set(0.15, 0.12, 0.2); dish.add(lD);
    const steam = K.makeSteam(scene);
    // 後排：蛋糕、木灰
    const cake = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.2, 24), K.stdMat('#fcd34d', 0.7)); cake.position.set(-2.85, T + 0.1, -1.15); scene.add(cake);
    const ash = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 8), K.stdMat('#9ca3af', 1)); ash.scale.y = 0.35; ash.position.set(2.85, T + 0.05, -1.15); scene.add(ash);
    [[cake, 'cake', { zh: '蛋糕', en: 'Cake' }, -2.85, 0.4], [ash, 'ash', { zh: '木灰', en: 'Wood ash' }, 2.85, 0.3]].forEach(([o, ev, name, x, y]) => {
      const l = api.label(name, { border: '#94a3b8', h: 0.14 }); l.position.set(x, T + y, -1.12);
      api.tap(o, () => api.emit(ev), name, [l]);
    });

    let busy = false, fizz = [0, 0], gasOut = 0;
    async function sealed() {
      if (busy || S.sealed) return; busy = true;
      const g = flasks[0].group;
      await tw.to(0.6, (k) => { g.rotation.z = 0.35 * Math.sin(k * Math.PI); inner.rotation.z = 0.15 + 1.6 * k; });
      isoda.visible = false; fizz[0] = 1; api.emit('sd_mix');
      await tw.wait(3.5);
      fizz[0] = 0; S.sealed = true; push();
      await api.waitSpeech();
      api.emit('sd_done'); api.done('sealed');
      busy = false;
    }
    async function addOpen(h = hD) {
      if (busy || S.open) return false;
      if (!S.sealed) { api.emit('op_need'); return false; }
      busy = true;
      const F = flasks[1], target = V3(F.mouth.x, F.mouth.y + 0.25, Z);
      await K.moveTo(tw, dish, K.tipPose(V2(0, 0.05), 1.9, target), 1.9, 0.5);
      await K.dripDrop(scene, tw, target, V3(F.mouth.x, T + 0.17 + LV, Z), '#ffffff');
      dSoda.visible = false; fizz[1] = 1; gasOut = 1;
      await h.returnHome();
      api.emit('op_mix');
      await tw.to(4, (k) => setRead(1, START - LOSS * k), K.lin);
      setRead(1, START - LOSS); fizz[1] = 0; gasOut = 0; S.open = true; push();
      await api.waitSpeech();
      api.emit('op_done'); api.done('open');
      busy = false;
    }
    const hD = api.drag(dish, { label: { zh: '梳打粉', en: 'Baking soda' }, lift: 1.1, enabled: () => !busy && !S.open,
      targets: () => [{ key: 'f', pos: flasks[1].mouth, r: 0.4, ringY: T, accept: () => !S.open }], onDrop: (tg, h) => addOpen(h),
      onTap: () => { if (busy || S.open) return; if (!S.sealed) api.emit('op_need'); else hD.dropOn('f'); } });
    api.tap(flasks[0].group, () => sealed(), { zh: '密封瓶', en: 'Sealed flask' }, [lF[0]]);

    push();
    return {
      cam: { pos: [0, 3.6, 4.8], target: [0, 1.25, -0.1], fitW: 6.2 },
      sealed, openNext: () => { if (!busy && S.sealed && !S.open) hD.dropOn('f'); },
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (id === 'sealed') await sealed();
        if (id === 'open' && !S.open) await hD.dropOn('f');
      },
      getHint(id) {
        if (busy) return null;
        if (id === 'sealed') return S.sealed ? null : { from: K.worldOf(flasks[0].group, 0.3) };
        if (id === 'open') return S.open || !S.sealed ? null : { from: K.worldOf(dish, 0.05), to: flasks[1].mouth };
        return null;
      },
      update(dt, t) {
        flasks.forEach((F, i) => { if (fizz[i] && Math.random() < dt * 30) F.bub.spawn((Math.random() - 0.5) * 0.3, 0.06, (Math.random() - 0.5) * 0.3, LV - 0.01, 0.9); F.bub.update(dt, t); });
        steam.update(dt, t, gasOut > 0, flasks[1].mouth, 0.08);
      },
      reset() {
        tw.clear(); busy = false; fizz = [0, 0]; gasOut = 0; steam.clear();
        Object.assign(S, { sealed: false, open: false }); push();
        setRead(0, START); setRead(1, START);
        flasks[0].group.rotation.z = 0; inner.rotation.z = 0.15; isoda.visible = true; dSoda.visible = true;
        flasks.forEach((F) => F.bub.clear());
        hD.obj.position.copy(hD.home); hD.obj.rotation.copy(hD.homeRot); hD.busy = false;
      },
    };
  },
};
