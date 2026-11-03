/* Topic 7.1 化石燃料：原油分餾、石油不同餾分的用途同性質 */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V3 } = K;

// 由塔頂（最凍）排到塔底（最熱）；h = 出口高度
const FR = [
  { id: 'gas', zh: '石油氣', en: 'Petroleum gas', use: { zh: '煮食、的士', en: 'cooking, taxis' }, col: '#f97316', h: 1.85 },
  { id: 'petrol', zh: '汽油', en: 'Petrol', use: { zh: '私家車', en: 'cars' }, col: '#ef4444', h: 1.5 },
  { id: 'kero', zh: '火水（航空燃油）', en: 'Kerosene (jet fuel)', use: { zh: '飛機', en: 'aeroplanes' }, col: '#3b82f6', h: 1.15 },
  { id: 'diesel', zh: '柴油', en: 'Diesel', use: { zh: '巴士、貨車', en: 'buses, lorries' }, col: '#eab308', h: 0.8 },
  { id: 'bitumen', zh: '瀝青', en: 'Bitumen', use: { zh: '鋪路', en: 'road surfaces' }, col: '#1f2937', h: 0.35 },
];

function Panel({ S }) {
  const { pick, lang } = useApp();
  const zh = lang === 'zh';
  return html`<div className="grid gap-1.5 text-sm">
    <div className="flex items-center gap-2 px-3 text-xs font-black text-slate-500"><span className="flex-1">${zh ? '塔頂（最凍、碳鏈最短）' : 'Top (coolest, shortest chains)'}</span><span>❄️</span></div>
    ${FR.map((f) => html`<div key=${f.id} className="flex items-center gap-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2">
      <span className="w-4 h-4 rounded-full inline-block" style=${{ background: f.col }}></span>
      <span className="flex-1 font-bold text-slate-700">${pick(f)}</span>
      <span className="text-slate-600 text-xs">${S[f.id] ? `✅ ${pick(f.use)}` : '—'}</span>
    </div>`)}
    <div className="flex items-center gap-2 px-3 text-xs font-black text-slate-500"><span className="flex-1">${zh ? '塔底（最熱、碳鏈最長）' : 'Bottom (hottest, longest chains)'}</span><span>🔥</span></div>
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    <defs><linearGradient id="ofg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#93c5fd" /><stop offset="1" stopColor="#f87171" /></linearGradient></defs>
    <rect x="70" y="8" width="34" height="96" rx="10" fill="url(#ofg)" stroke="#64748b" strokeWidth="3" />
    ${['#f97316', '#ef4444', '#3b82f6', '#eab308', '#1f2937'].map((c, i) => html`<g key=${c}><rect x="104" y=${18 + i * 18} width="30" height="5" fill="#94a3b8" /><circle cx="146" cy=${20 + i * 18} r="7" fill=${c} /></g>`)}
    <path d="M30 98 h40" stroke="#334155" strokeWidth="6" /><path d="M36 92 q4 -8 0 -14 q8 6 4 14" fill="#f97316" />
  </svg>`;
}

const events = {
  ht_on: { zh: '加熱爐將原油加熱到變成蒸氣，蒸氣湧入分餾塔，一路向上升！', en: 'The furnace heats the crude oil until it turns to vapour, which rushes into the column and rises!' },
  ht_done: { zh: '唔同嘅物質喺唔同高度凍返做液體，由唔同嘅出口流出嚟。', en: 'Different substances cool back into liquids at different heights and flow out of different outlets.' },
  pr_ok: { zh: '啱位！', en: 'Right place!' },
  pr_lower: { zh: '唔係呢度喎。佢嘅碳鏈比較長，沸點比較高，要喺塔嘅較低位置先凝結。試下放低啲。', en: 'Not here. Its carbon chains are longer and its boiling point is higher, so it condenses lower down the column. Try lower.' },
  pr_higher: { zh: '唔係呢度喎。佢嘅碳鏈比較短，沸點比較低，會升到較高位置先凝結。試下放高啲。', en: 'Not here. Its carbon chains are shorter and its boiling point is lower, so it rises higher before condensing. Try higher.' },
  pr_need: { zh: '要先撳加熱爐，將原油變成蒸氣送入分餾塔。', en: 'Tap the furnace first to turn the crude oil into vapour.' },
  prAll: { zh: '五樣產品都搵到位喇！由上至下：石油氣、汽油、火水、柴油、瀝青。', en: 'All five products are in place! From top to bottom: petroleum gas, petrol, kerosene, diesel, bitumen.' },
  crude: { zh: '原油係黑色、黐立立嘅液體，係由幾百萬年前嘅海洋生物遺骸變成嘅化石燃料。', en: 'Crude oil is a thick black liquid. It is a fossil fuel formed from the remains of sea creatures millions of years ago.' },
  column: { zh: '分餾塔底最熱，越高越凍。', en: 'The fractionating column is hottest at the bottom and gets cooler towards the top.' },
  taxi: { zh: '香港好多的士都係用石油氣做燃料。', en: 'Many taxis in Hong Kong run on petroleum gas.' },
};

export default {
  id: 'oilfrac', topics: ['7.1'], accent: '#475569', dark: '#1e293b', bg: 'linear-gradient(135deg,#e2e8f0,#ffedd5)', Art,
  title: { zh: '石油分層', en: 'Sorting Crude Oil' },
  desc: { zh: '一桶黑色原油，點樣分出石油氣、汽油、火水、柴油同瀝青？用分餾塔試下！', en: 'How does black crude oil become petroleum gas, petrol, kerosene, diesel and bitumen? Try the fractionating column!' },
  steps: [
    { tag: 'intro', zh: '汽車用汽油、飛機用火水、煮食用石油氣、鋪路用瀝青，原來全部都係由同一種黑色嘅「原油」分出嚟！原油係由好多種長短唔同嘅碳鏈分子混埋一齊。今日我哋用「分餾塔」將佢哋分開。安全提提你：石油產品好易著火，要遠離火種。後面嘅物件可以撳嚟睇介紹。',
      en: 'Cars use petrol, aeroplanes use kerosene, we cook with petroleum gas and build roads with bitumen, and they all come from the same black crude oil! Crude oil is a mixture of molecules with carbon chains of many different lengths. Today we will separate them with a fractionating column. Safety first: oil products catch fire easily, so keep them away from flames. Tap the objects at the back to learn about them.' },
    { tag: 'try', action: { id: 'heat', events: ['ht_'] }, zh: '撳左邊嘅加熱爐，將原油加熱變成蒸氣，送入分餾塔。', en: 'Tap the furnace on the left to heat the crude oil into vapour and send it into the column.' },
    { tag: 'observe', zh: '原油蒸氣喺塔入面向上升。塔底最熱，越高越凍。唔同嘅物質喺唔同高度凍返做液體，由唔同嘅出口流出嚟。',
      en: 'The crude oil vapour rises up the column. The bottom is hottest and it gets cooler higher up. Different substances turn back into liquids at different heights and flow out of different outlets.' },
    { tag: 'try', action: { id: 'sort', events: ['pr_'] }, zh: '將前面五樣產品拖去分餾塔啱嘅出口。提示：塔頂最凍，塔底最熱。',
      en: 'Drag the five products at the front to the right outlets on the column. Hint: the top is coolest and the bottom is hottest.' },
    { tag: 'observe', zh: '由上至下：石油氣、汽油、火水、柴油、瀝青。越低嘅產品，越黏、顏色越深、越難著火。',
      en: 'From top to bottom: petroleum gas, petrol, kerosene, diesel, bitumen. The lower the product, the thicker, darker and harder to set alight it is.' },
    { tag: 'feynman', zh: '想像碳鏈好似唔同長度嘅麵條：短嘅好輕、好易「飛」起，一直升到塔頂先凍返做液體；長嘅又重又黐，好快就喺塔底凍返做液體。',
      en: 'Imagine carbon chains as noodles of different lengths: short ones are light and fly up easily, rising all the way to the top before turning back into liquid; long ones are heavy and sticky, and turn back into liquid near the bottom.' },
    { tag: 'first', zh: '由最基本諗起：分子越大，即係碳鏈越長，分子之間嘅吸引力就越強，要更多熱能先可以將佢哋分開變成氣體，所以沸點越高。分餾就係利用沸點唔同，將混合物分開。',
      en: 'Back to basics: the bigger the molecule, or the longer the carbon chain, the more strongly the molecules attract each other, so more heat is needed to pull them apart into a gas, which means a higher boiling point. Fractional distillation uses these different boiling points to separate a mixture.' },
    { tag: 'life', zh: '生活應用：石油氣用嚟煮食同推動的士，汽油俾私家車用，火水俾飛機用，柴油俾巴士同貨車用，瀝青用嚟鋪路。石油係化石燃料，用完就冇，燒佢仲會產生二氧化碳，所以我哋要慳啲用。',
      en: 'Everyday life: petroleum gas is used for cooking and taxis, petrol for cars, kerosene for aeroplanes, diesel for buses and lorries, and bitumen for roads. Crude oil is a fossil fuel: once it is used up, it is gone, and burning it releases carbon dioxide, so we should use less of it.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '邊一樣產品會喺分餾塔嘅最頂流出嚟？', en: 'Which product comes out at the very top of the column?' },
    options: [{ zh: '瀝青', en: 'Bitumen' }, { zh: '石油氣', en: 'Petroleum gas' }, { zh: '柴油', en: 'Diesel' }],
    correct: 1,
    right: { zh: '啱！石油氣嘅碳鏈最短，沸點最低，所以一直升到最凍嘅塔頂。', en: 'Right! Petroleum gas has the shortest chains and the lowest boiling point, so it rises to the coolest part at the top.' },
    wrong: { zh: '再諗下：沸點越低嘅物質，會升到塔嘅邊個位置？', en: 'Think again: where in the column does a substance with a lower boiling point end up?' },
  },
  tools: [
    { id: 'h', primary: true, label: { zh: '🔥 加熱原油', en: '🔥 Heat the crude oil' }, run: (c) => c.heat() },
    { id: 's', label: { zh: '擺好下一樣產品', en: 'Place the next product' }, run: (c) => c.placeNext() },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = { hot: false }; FR.forEach((f) => { S[f.id] = false; });
    const push = () => api.state({ ...S });
    const CX = -0.4, CZ = -0.45, SX = 0.55;
    // 分餾塔：由上（藍，凍）到下（紅，熱）分 5 段
    const segMats = [];
    for (let i = 0; i < 5; i++) {
      const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#93c5fd').lerp(new THREE.Color('#f87171'), i / 4), roughness: 0.5, metalness: 0.3, emissive: '#ff5a1f', emissiveIntensity: 0 });
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.38, 28), mat); seg.position.set(CX, T + 2.0 - 0.19 - i * 0.38, CZ); scene.add(seg); segMats.push(mat);
      api.tap(seg, () => api.emit('column'), { zh: '分餾塔', en: 'Fractionating column' });
    }
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.32, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), K.stdMat('#64748b', 0.4, 0.5)); cap.position.set(CX, T + 2.0, CZ); scene.add(cap);
    const lCold = api.label({ zh: '❄️ 最凍', en: '❄️ Coolest' }, { border: '#3b82f6', h: 0.14 }); lCold.position.set(CX - 0.6, T + 1.9, CZ);
    const lHot = api.label({ zh: '🔥 最熱', en: '🔥 Hottest' }, { border: '#ef4444', h: 0.14 }); lHot.position.set(CX - 0.6, T + 0.3, CZ);
    // 出口同收集台
    const shelves = FR.map((f) => {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, SX - CX - 0.3, 10), K.stdMat('#94a3b8', 0.3, 0.7)); pipe.rotation.z = Math.PI / 2; pipe.position.set((CX + 0.3 + SX) / 2, T + f.h, CZ); scene.add(pipe);
      const pad = new THREE.Mesh(new K.RoundedBoxGeometry(0.36, 0.04, 0.32, 2, 0.01), K.stdMat('#e2e8f0', 0.5)); pad.position.set(SX + 0.12, T + f.h - 0.1, CZ); scene.add(pad);
      const drip = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), K.stdMat(f.col, 0.3)); drip.position.set(SX, T + f.h - 0.05, CZ); drip.visible = false; scene.add(drip);
      return { f, pad, drip, pos: V3(SX + 0.12, T + f.h - 0.08, CZ) };
    });
    // 加熱爐同原油
    const furnace = new THREE.Group(); furnace.position.set(-1.6, T, CZ); scene.add(furnace);
    const box = new THREE.Mesh(new K.RoundedBoxGeometry(0.6, 0.5, 0.5, 2, 0.04), K.stdMat('#475569', 0.6)); box.position.y = 0.25; furnace.add(box);
    const fireMat = new THREE.MeshBasicMaterial({ color: '#fb923c', transparent: true, opacity: 0.25 });
    const fire = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.2), fireMat); fire.position.set(0, 0.2, 0.252); furnace.add(fire);
    const feed = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 10), K.stdMat('#94a3b8', 0.3, 0.7)); feed.rotation.z = Math.PI / 2; feed.position.set(-1.0, T + 0.3, CZ); scene.add(feed);
    const lFur = api.label({ zh: '🔥 加熱爐', en: '🔥 Furnace' }, { border: '#f97316', h: 0.15 }); lFur.position.set(-1.6, T + 0.7, CZ);
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.6, 24), K.stdMat('#1c1917', 0.4, 0.3)); tank.position.set(-2.6, T + 0.3, CZ); scene.add(tank);
    const lTank = api.label({ zh: '原油', en: 'Crude oil' }, { border: '#1c1917', h: 0.15 }); lTank.position.set(-2.6, T + 0.78, CZ);
    api.tap(tank, () => api.emit('crude'), { zh: '原油', en: 'Crude oil' }, [lTank]);
    const vapour = K.makeSteam(scene);
    // 前面：五樣產品
    const pxs = [-2.3, -1.3, -0.3, 0.7, 1.7];
    const mkProduct = (f, i) => {
      const g = new THREE.Group(); g.position.set(pxs[i], T, 1.0); scene.add(g);
      let body;
      if (f.id === 'gas') body = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.22, 6, 16), K.stdMat(f.col, 0.4));
      else if (f.id === 'bitumen') body = new THREE.Mesh(new K.RoundedBoxGeometry(0.42, 0.14, 0.3, 2, 0.03), K.stdMat(f.col, 0.9));
      else body = new THREE.Mesh(new K.RoundedBoxGeometry(0.28, 0.34, 0.16, 2, 0.04), K.stdMat(f.col, 0.4));
      body.position.y = f.id === 'gas' ? 0.25 : f.id === 'bitumen' ? 0.07 : 0.17; g.add(body);
      const l = api.label(f, { border: f.col, h: 0.14 }); l.position.set(0, -0.02, 0.32); g.add(l);
      return { g, l, home: g.position.clone() };
    };
    const products = FR.map(mkProduct);
    // 後排：的士
    const taxi = new THREE.Group(); taxi.position.set(2.7, T, -1.2); scene.add(taxi);
    const tBody = new THREE.Mesh(new K.RoundedBoxGeometry(0.6, 0.18, 0.3, 2, 0.05), K.stdMat('#dc2626', 0.4)); tBody.position.y = 0.15; taxi.add(tBody);
    const tTop = new THREE.Mesh(new K.RoundedBoxGeometry(0.32, 0.14, 0.26, 2, 0.04), K.stdMat('#f8fafc', 0.4)); tTop.position.set(-0.04, 0.29, 0); taxi.add(tTop);
    const lTaxi = api.label({ zh: '的士', en: 'Taxi' }, { border: '#94a3b8', h: 0.14 }); lTaxi.position.set(2.7, T + 0.55, -1.2);
    api.tap(taxi, () => api.emit('taxi'), { zh: '的士', en: 'Taxi' }, [lTaxi]);

    let busy = false, vap = 0;
    const where = {}; // 每個收集台放咗乜
    async function heat() {
      if (busy || S.hot) return; busy = true;
      api.emit('ht_on'); vap = 1;
      await tw.to(4, (k) => { fireMat.opacity = 0.25 + 0.65 * k; segMats.forEach((m, i) => { m.emissiveIntensity = 0.35 * k * (i / 4); }); }, K.lin);
      shelves.forEach((s) => { s.drip.visible = true; });
      vap = 0; S.hot = true; push();
      await api.waitSpeech();
      api.emit('ht_done'); api.done('heat');
      busy = false;
    }
    async function place(pi, si, h) {
      if (busy || S[FR[pi].id]) return false;
      if (!S.hot) { api.emit('pr_need'); return false; }
      if (pi !== si) { api.emit(si < pi ? 'pr_lower' : 'pr_higher'); return false; }
      busy = true;
      const p = products[pi]; p.l.visible = false;
      await K.moveTo(tw, p.g, V3(shelves[si].pos.x, shelves[si].pos.y + 0.3, CZ), 0, 0.4);
      await K.moveTo(tw, p.g, shelves[si].pos, 0, 0.3);
      p.g.scale.setScalar(0.7); h.setHome(shelves[si].pos.clone()); where[si] = pi;
      S[FR[pi].id] = true; push(); api.emit('pr_ok');
      busy = false;
      if (FR.every((f) => S[f.id])) { api.done('sort'); api.emit('prAll'); }
    }
    const hP = products.map((p, pi) => api.drag(p.g, { label: FR[pi], lift: 0.6, enabled: () => !busy && !S[FR[pi].id],
      targets: () => shelves.map((s, si) => ({ key: 's' + si, pos: s.pos, r: 0.22, ringY: T, accept: () => where[si] === undefined })),
      onDrop: (tg, h) => place(pi, Number(tg.key.slice(1)), h),
      onTap: () => { if (busy || S[FR[pi].id]) return; if (!S.hot) api.emit('pr_need'); else hP[pi].dropOn('s' + pi); } }));
    api.tap(furnace, () => heat(), { zh: '加熱爐', en: 'Furnace' }, [lFur]);

    const nextP = () => FR.findIndex((f) => !S[f.id]);
    push();
    return {
      cam: { pos: [0, 3.9, 5.2], target: [0, 1.6, -0.1], fitW: 6.6 },
      heat,
      placeNext() { const i = nextP(); if (!busy && S.hot && i >= 0) hP[i].dropOn('s' + i); },
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (id === 'heat') await heat();
        if (id === 'sort') for (let i = nextP(), c = 0; i >= 0 && c < 6; i = nextP(), c++) { while (busy) await tw.wait(0.1); await hP[i].dropOn('s' + i); }
      },
      getHint(id) {
        if (busy) return null;
        if (id === 'heat') return S.hot ? null : { from: K.worldOf(furnace, 0.3) };
        if (id === 'sort') { const i = nextP(); return i < 0 || !S.hot ? null : { from: K.worldOf(products[i].g, 0.15), to: shelves[i].pos }; }
        return null;
      },
      update(dt, t) { vapour.update(dt, t, vap > 0, V3(CX, T + 0.4, CZ), 0.25); },
      reset() {
        tw.clear(); busy = false; vap = 0; vapour.clear();
        Object.keys(S).forEach((k) => { S[k] = false; }); push();
        Object.keys(where).forEach((k) => delete where[k]);
        fireMat.opacity = 0.25; segMats.forEach((m) => { m.emissiveIntensity = 0; }); shelves.forEach((s) => { s.drip.visible = false; });
        products.forEach((p, i) => { p.l.visible = true; p.g.scale.setScalar(1); hP[i].setHome(p.home); });
        hP.forEach((h) => { h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.busy = false; });
      },
    };
  },
};
