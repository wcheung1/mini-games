/* Topic 5.2 氧化還原反應：鐵同硫酸銅溶液嘅置換反應（鐵釘變銅色） */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V3 } = K;

const STEEL = '#a1a1aa', COPPER = '#b0552e', BLUE = '#3b9be0', PALE = '#9fd2b8', GREEN = '#bfe3a0';

function Panel({ S }) {
  const { lang } = useApp();
  const zh = lang === 'zh';
  const done = (S.min || 0) >= 20;
  const card = (title, put, result) => html`<div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2">
    <div className="font-bold text-slate-700">${title}</div>
    <div className="text-slate-600">${zh ? '放咗落去：' : 'Added: '}${put ? '✅' : '—'}　·　${zh ? '結果：' : 'Result: '}${put && done ? result : '—'}</div>
  </div>`;
  return html`<div className="grid gap-1.5 text-sm">
    ${card(zh ? '🔩 鐵釘 → 藍色硫酸銅溶液' : '🔩 Iron nail → blue copper sulfate', S.nail, zh ? '鐵釘鋪上紅啡色嘅銅，溶液變淡綠 ✅' : 'nail coated with red-brown copper, solution turns pale green ✅')}
    ${card(zh ? '🟠 銅線 → 淺綠色鐵(II) 溶液' : '🟠 Copper wire → pale green iron(II)', S.cu, zh ? '冇變化 ✖' : 'no change ✖')}
    <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2"><b className="text-slate-700">${zh ? '⏰ 時間：' : '⏰ Time: '}</b><span className="text-slate-600">${Math.round(S.min || 0)} ${zh ? '分鐘' : 'min'}</span></div>
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    ${[[60, '#3b9be0'], [140, '#bfe3a0']].map(([x, c]) => html`<g key=${x}>
      <path d=${`M${x - 32} 26 v66 a8 8 0 0 0 8 8 h48 a8 8 0 0 0 8 -8 v-66`} fill="#fff" fillOpacity=".9" stroke="#cbd5e1" strokeWidth="3" />
      <rect x=${x - 29} y="50" width="58" height="47" rx="5" fill=${c} opacity=".85" />
    </g>`)}
    <rect x="55" y="14" width="8" height="80" rx="3" fill="#b0552e" /><rect x="49" y="10" width="20" height="6" rx="3" fill="#a1a1aa" />
    <path d="M140 16 v74" stroke="#d9783a" strokeWidth="5" strokeLinecap="round" />
  </svg>`;
}

const events = {
  dp_nail: { zh: '鐵釘浸咗落藍色嘅硫酸銅溶液。', en: 'The iron nail is in the blue copper sulfate solution.' },
  dp_cu: { zh: '銅線浸咗落淺綠色嘅鐵(II) 溶液。', en: 'The copper wire is in the pale green iron(II) solution.' },
  dp_nailWrong: { zh: '鐵釘放落鐵溶液，冇嘢可以搶喎！鐵釘要放落藍色嘅硫酸銅溶液。', en: 'An iron nail in an iron solution has nothing to swap with! The nail goes into the blue copper sulfate solution.' },
  dp_cuWrong: { zh: '銅放落銅溶液都冇嘢睇。試下放落淺綠色嘅鐵溶液，睇下銅搶唔搶到鐵嘅位。', en: 'Copper in a copper solution shows nothing. Try the pale green iron solution to see if copper can take iron\'s place.' },
  dipAll: { zh: '兩杯都準備好喇！', en: 'Both beakers are ready!' },
  w_need: { zh: '先將鐵釘同銅線放落杯，先好快轉時間。', en: 'Put the nail and the copper wire into the beakers first, then fast-forward.' },
  w_go: { zh: '時間快轉中……留意鐵釘表面同藍色溶液。', en: 'Fast-forwarding… Watch the surface of the nail and the blue solution.' },
  w_done: { zh: '二十分鐘之後：鐵釘鋪咗一層紅啡色嘅銅，藍色溶液變淡帶綠；銅線就完全冇變！', en: 'Twenty minutes later: the nail is coated with red-brown copper and the blue solution has turned paler and greenish; the copper wire has not changed at all!' },
  clockDone: { zh: '已經過咗二十分鐘喇。', en: 'Twenty minutes have already passed.' },
  blue: { zh: '藍色溶液係硫酸銅溶液，入面有銅離子。佢有害，要戴手套。', en: 'The blue liquid is copper sulfate solution, which contains copper ions. It is harmful, so wear gloves.' },
  green: { zh: '淺綠色溶液係鐵(II) 溶液，入面有鐵(II) 離子。', en: 'The pale green liquid is an iron(II) solution, which contains iron(II) ions.' },
  ore: { zh: '呢塊係含銅嘅礦石。古時嘅人會用鐵喺含銅嘅水入面「浸」出銅。', en: 'This is a copper ore. Long ago, people used iron to "soak" copper out of copper-rich water.' },
  bucket: { zh: '配製含硫酸銅嘅殺菌劑唔可以用鐵桶，因為鐵會同硫酸銅反應，鐵桶會俾蝕穿。', en: 'Never mix copper sulfate pesticides in an iron bucket: the iron reacts with the copper sulfate and the bucket gets eaten away.' },
};

export default {
  id: 'displace', topics: ['5.2'], accent: '#ca8a04', dark: '#854d0e', bg: 'linear-gradient(135deg,#fef9c3,#dbeafe)', Art,
  title: { zh: '鐵釘變銅色', en: 'The Copper-Coated Nail' },
  desc: { zh: '鐵釘浸落藍色溶液，竟然鋪上一層銅！睇下活潑嘅金屬點樣「搶位」。', en: 'Dip an iron nail in a blue solution and it gets coated with copper! See how a more reactive metal "takes the place" of another.' },
  steps: [
    { tag: 'intro', zh: '記得金屬冒泡大比拼嗎？鎂、鋅、鐵、銅排咗名次，鐵比銅活潑。今日我哋睇下兩種金屬喺溶液入面點樣「搶位」：鐵釘遇到藍色嘅硫酸銅溶液會點？安全提提你：硫酸銅溶液有害，要戴手套；鐵釘好尖，要小心。後面嘅物件可以撳嚟睇介紹。',
      en: 'Remember the Metal Bubble Race? We ranked magnesium, zinc, iron and copper, and iron is more reactive than copper. Today we will see how two metals "swap places" in a solution: what happens when an iron nail meets blue copper sulfate solution? Safety first: copper sulfate solution is harmful, so wear gloves, and nails are sharp, so be careful. Tap the objects at the back to learn about them.' },
    { tag: 'try', action: { id: 'dip', events: ['dp_'] }, zh: '將鐵釘拖落左邊藍色嘅硫酸銅溶液，再將銅線拖落右邊淺綠色嘅鐵(II) 溶液。',
      en: 'Drag the iron nail into the blue copper sulfate solution on the left, then drag the copper wire into the pale green iron(II) solution on the right.' },
    { tag: 'observe', zh: '兩樣都浸咗落去，暫時未見到有咩變化。等陣比較一下，邊一杯會變。',
      en: 'Both are in, and nothing has changed yet. Soon we will compare which beaker changes.' },
    { tag: 'try', action: { id: 'wait', events: ['w_'] }, zh: '撳右邊嘅時鐘，快轉二十分鐘。', en: 'Tap the clock on the right to fast-forward twenty minutes.' },
    { tag: 'observe', zh: '鐵釘表面鋪咗一層紅啡色嘅銅！藍色溶液變淡，仲帶少少綠色。但係銅線放喺鐵溶液入面，就完全冇變。',
      en: 'The nail is coated with a layer of red-brown copper! The blue solution has turned paler and slightly green. But the copper wire in the iron solution has not changed at all.' },
    { tag: 'feynman', zh: '金屬好似玩「搶櫈仔」：活潑啲嘅金屬會搶走冇咁活潑嘅金屬個位。鐵比銅活潑，所以鐵走入溶液變成鐵離子，將銅離子趕出嚟，變返銅金屬鋪喺鐵釘上面。銅冇鐵咁活潑，搶唔到鐵嘅位，所以冇反應。呢種反應叫做「置換反應」。',
      en: 'Metals play musical chairs: a more reactive metal takes the seat of a less reactive one. Iron is more reactive than copper, so iron goes into the solution as iron ions and pushes the copper ions out, which turn back into copper metal on the nail. Copper is less reactive than iron, so it cannot take iron\'s seat, and nothing happens. This is called a displacement reaction.' },
    { tag: 'first', zh: '由最基本諗起：鐵原子交出兩粒電子，變成鐵(II) 離子溶入水，所以溶液帶綠色；銅離子接收咗呢兩粒電子，變成銅原子，鋪喺鐵釘表面。失去電子叫「氧化」，得到電子叫「還原」，兩樣一齊發生，所以叫「氧化還原反應」。',
      en: 'Back to basics: iron atoms give away two electrons and become iron(II) ions in the water, which is why the solution turns green; copper ions take those two electrons and become copper atoms on the nail. Losing electrons is called oxidation and gaining electrons is called reduction. They happen together, so this is a redox reaction.' },
    { tag: 'life', zh: '生活應用：中國宋朝已經用「膽水浸銅」：將鐵放入含硫酸銅嘅泉水，就可以收集到銅，係世界上最早嘅濕法煉銅之一。農夫配製含硫酸銅嘅殺菌劑嗰陣，唔可以用鐵桶，因為鐵桶會俾溶液蝕穿。',
      en: 'Everyday life: in the Song dynasty, Chinese workers already collected copper by soaking iron in spring water containing copper sulfate. It is one of the earliest ways of getting metal from a solution. Farmers mixing copper sulfate pesticides must not use iron buckets, because the solution would eat through them.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '如果將一塊鋅片放落藍色嘅硫酸銅溶液，會點？', en: 'What would happen if you put a piece of zinc into blue copper sulfate solution?' },
    options: [
      { zh: '完全冇反應', en: 'Nothing at all' },
      { zh: '鋅片表面會出現紅啡色嘅銅', en: 'Red-brown copper would appear on the zinc' },
      { zh: '鋅片會變成金', en: 'The zinc would turn into gold' },
    ],
    correct: 1,
    right: { zh: '啱！鋅比銅活潑，所以鋅會搶走銅嘅位，銅就鋪喺鋅片上面。', en: 'Right! Zinc is more reactive than copper, so zinc takes copper\'s place and copper coats the zinc.' },
    wrong: { zh: '再諗下金屬冒泡大比拼：鋅同銅，邊個比較活潑？', en: 'Think back to the Metal Bubble Race: which is more reactive, zinc or copper?' },
  },
  tools: [
    { id: 'd', label: { zh: '放下一樣金屬', en: 'Add the next metal' }, run: (c) => c.dipNext() },
    { id: 'f', primary: true, label: { zh: '⏩ 快轉二十分鐘', en: '⏩ Fast-forward 20 minutes' }, run: (c) => c.fastForward() },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = { nail: false, cu: false, min: 0 };
    const push = () => api.state({ ...S });
    const BZ = -0.3, LV = 0.5, BH = 0.75;
    const mkBeaker = (x, color, name, ev) => {
      const v = K.makeVessel(K.beakerProfile(0.38, BH), { liquidColor: color, level: LV, opacity: 0.75, sx: 0.94 });
      v.group.position.set(x, T + 0.01, BZ); scene.add(v.group);
      const lab = api.label(name, { border: color, h: 0.16 }); lab.position.set(x, T + 0.1, BZ + 0.6);
      api.tap(v.group, () => api.emit(ev), name, [lab]);
      return { ...v, x, mouth: V3(x, T + 0.01 + BH, BZ) };
    };
    const blue = mkBeaker(-0.9, BLUE, { zh: '硫酸銅溶液（藍色）', en: 'Copper sulfate (blue)' }, 'blue');
    const green = mkBeaker(0.9, GREEN, { zh: '鐵(II) 溶液（淺綠色）', en: 'Iron(II) solution (pale green)' }, 'green');
    const flakes = K.makeCloud(blue.group, { color: COPPER, count: 40, r: 0.22, yMin: 0.03, yMax: 0.06 });

    // 鐵釘同銅線（平放喺前面）
    const nailMat = K.stdMat(STEEL, 0.3, 0.85);
    const nail = new THREE.Group(); nail.position.set(-2.3, T + 0.05, 0.95); nail.rotation.z = Math.PI / 2; scene.add(nail);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.66, 12), nailMat); shaft.position.y = 0.37; nail.add(shaft);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.06, 12), nailMat); tip.rotation.x = Math.PI; tip.position.y = 0.02; nail.add(tip);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 20), nailMat); head.position.y = 0.71; nail.add(head);
    const nHit = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.75, 8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); nHit.position.y = 0.37; nail.add(nHit); // 透明嘅捉手範圍
    const lNail = api.label({ zh: '鐵釘', en: 'Iron nail' }, { border: '#71717a', h: 0.16 }); lNail.position.set(0.3, 0.3, 0.1); nail.add(lNail);
    const cuMat = K.stdMat('#d9783a', 0.3, 0.85);
    const wire = new THREE.Group(); wire.position.set(2.3, T + 0.05, 0.95); wire.rotation.z = -Math.PI / 2; scene.add(wire);
    const wBody = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.62, 10), cuMat); wBody.position.y = 0.31; wire.add(wBody);
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.016, 8, 24), cuMat); coil.position.y = 0.66; wire.add(coil);
    const wHit = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.72, 8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); wHit.position.y = 0.36; wire.add(wHit);
    const lWire = api.label({ zh: '銅線', en: 'Copper wire' }, { border: '#d9783a', h: 0.16 }); lWire.position.set(-0.3, 0.3, 0.1); wire.add(lWire);

    // 時鐘
    const clock = new THREE.Group(); clock.position.set(2.7, T, -0.6); scene.add(clock);
    const face = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 32), K.stdMat('#fefce8', 0.5)); face.rotation.x = Math.PI / 2; face.position.y = 0.34; clock.add(face);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.03, 10, 40), K.stdMat('#ca8a04', 0.4)); rim.position.y = 0.34; clock.add(rim);
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.02), K.stdMat('#1e293b', 0.5)); hand.geometry.translate(0, 0.1, 0); hand.position.set(0, 0.34, 0.05); clock.add(hand);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.18), K.stdMat('#ca8a04', 0.5)); foot.position.y = 0.03; clock.add(foot);
    const lClock = api.label((lang) => (lang === 'zh' ? `⏰ ${Math.round(S.min)} 分鐘` : `⏰ ${Math.round(S.min)} min`), { border: '#ca8a04', h: 0.17 }); lClock.position.set(2.7, T + 0.85, -0.6);
    // 後排：礦石、鐵桶
    const ore = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), K.stdMat('#2f7f6f', 0.8)); ore.position.set(-2.85, T + 0.17, -1.15); scene.add(ore);
    const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.4, 24, 1, true), new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.4, metalness: 0.7, side: THREE.DoubleSide })); bucket.position.set(-2.1, T + 0.2, -1.2); scene.add(bucket);
    [[ore, 'ore', { zh: '銅礦石', en: 'Copper ore' }, -2.85, 0.5], [bucket, 'bucket', { zh: '鐵桶', en: 'Iron bucket' }, -2.1, 0.58]].forEach(([o, ev, name, x, y]) => {
      const l = api.label(name, { border: '#94a3b8', h: 0.15 }); l.position.set(x, T + y, -1.18);
      api.tap(o, () => api.emit(ev), name, [l]);
    });

    let busy = false;
    const NAIL_IN = V3(blue.x - 0.08, T + 0.06, BZ), WIRE_IN = V3(green.x + 0.08, T + 0.06, BZ);
    async function dip(which, intoBlue, h) {
      if (busy || S[which]) return false;
      const right = which === 'nail' ? intoBlue : !intoBlue;
      if (!right) { api.emit(which === 'nail' ? 'dp_nailWrong' : 'dp_cuWrong'); return false; }
      busy = true;
      const obj = which === 'nail' ? nail : wire, B = intoBlue ? blue : green, to = which === 'nail' ? NAIL_IN : WIRE_IN, lean = which === 'nail' ? -0.18 : 0.18;
      (which === 'nail' ? lNail : lWire).visible = false;
      await K.moveTo(tw, obj, V3(to.x, B.mouth.y + 0.2, BZ), lean, 0.5);
      await K.moveTo(tw, obj, to, lean, 0.5);
      K.ripple(scene, tw, V3(B.x, T + 0.01 + LV, BZ));
      h.setHome(to.clone()); h.homeRot.set(0, 0, lean);
      S[which] = true; push(); api.emit(which === 'nail' ? 'dp_nail' : 'dp_cu');
      busy = false;
      if (S.nail && S.cu) { api.done('dip'); api.emit('dipAll'); }
    }
    async function fastForward() {
      if (busy) return;
      if (S.min >= 20) { api.emit('clockDone'); return; }
      if (!(S.nail && S.cu)) { api.emit('w_need'); return; }
      busy = true; api.emit('w_go');
      const s0 = new THREE.Color(STEEL), s1 = new THREE.Color(COPPER), b0 = new THREE.Color(BLUE), b1 = new THREE.Color(PALE);
      await tw.to(6, (k) => {
        S.min = 20 * k; lClock.userData.refresh(); hand.rotation.z = -Math.PI * 2 * k;
        const u = Math.min(1, k * 1.6); nailMat.color.copy(s0).lerp(s1, u); nailMat.roughness = 0.3 + 0.5 * u; nailMat.metalness = 0.85 - 0.45 * u;
        blue.mat.color.copy(b0).lerp(b1, k * 0.75); flakes.set(k * 0.8, 0);
      }, K.lin);
      S.min = 20; push();
      await api.waitSpeech();
      api.emit('w_done'); api.done('wait');
      busy = false;
    }
    const beakerTargets = (which) => () => [blue, green].map((B, i) => ({ key: i === 0 ? 'blue' : 'green', pos: B.mouth, r: 0.45, ringY: T, accept: () => !S[which] }));
    const hNail = api.drag(nail, { label: { zh: '鐵釘', en: 'Iron nail' }, lift: 0.9, enabled: () => !busy && !S.nail, targets: beakerTargets('nail'),
      onDrop: (tg, h) => dip('nail', tg.key === 'blue', h), onTap: () => { if (!busy && !S.nail) hNail.dropOn('blue'); } });
    const hWire = api.drag(wire, { label: { zh: '銅線', en: 'Copper wire' }, lift: 0.9, enabled: () => !busy && !S.cu, targets: beakerTargets('cu'),
      onDrop: (tg, h) => dip('cu', tg.key === 'blue', h), onTap: () => { if (!busy && !S.cu) hWire.dropOn('green'); } });
    api.tap(clock, () => fastForward(), { zh: '快轉時鐘', en: 'Fast-forward clock' }, [lClock]);

    const homes = { nail: nail.position.clone(), nailRot: nail.rotation.clone(), wire: wire.position.clone(), wireRot: wire.rotation.clone() };
    push();
    return {
      cam: { pos: [0, 3.8, 4.9], target: [0, 1.4, -0.1], fitW: 6.6 },
      fastForward,
      dipNext() { if (busy) return; if (!S.nail) hNail.dropOn('blue'); else if (!S.cu) hWire.dropOn('green'); },
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (id === 'dip') {
          if (!S.nail) { await hNail.dropOn('blue'); await api.waitSpeech(); }
          while (busy) await tw.wait(0.1);
          if (!S.cu) await hWire.dropOn('green');
        }
        if (id === 'wait') await fastForward();
      },
      getHint(id) {
        if (busy) return null;
        // 手指由釘身／銅線中間開始（原點喺尖端，太細撳唔中）
        if (id === 'dip') return !S.nail ? { from: nail.localToWorld(V3(0, 0.4, 0)), to: blue.mouth } : !S.cu ? { from: wire.localToWorld(V3(0, 0.35, 0)), to: green.mouth } : null;
        if (id === 'wait') return S.min >= 20 ? null : { from: K.worldOf(clock, 0.34) };
        return null;
      },
      reset() {
        tw.clear(); busy = false;
        Object.assign(S, { nail: false, cu: false, min: 0 }); push(); lClock.userData.refresh();
        hand.rotation.z = 0; nailMat.color.set(STEEL); nailMat.roughness = 0.3; nailMat.metalness = 0.85;
        blue.mat.color.set(BLUE); flakes.set(0, 0); lNail.visible = true; lWire.visible = true;
        hNail.setHome(homes.nail); hNail.homeRot.copy(homes.nailRot); hWire.setHome(homes.wire); hWire.homeRot.copy(homes.wireRot);
        [hNail, hWire].forEach((h) => { h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.busy = false; });
      },
    };
  },
};
