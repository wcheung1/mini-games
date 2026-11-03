/* Topic 5.3 化學電池中的反應：鋅碳電池的結構同化學；比較唔同嘅電池 */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V3 } = K;

// 由外到內
const LAYERS = [
  { id: 'case', zh: '外殼（膠紙同鐵皮）', en: 'Outer casing', col: '#2563eb', r: 0.36, h: 1.36 },
  { id: 'zinc', zh: '鋅筒（負極）', en: 'Zinc can (negative)', col: '#a1a1aa', r: 0.33, h: 1.26 },
  { id: 'paste', zh: '糊狀電解質', en: 'Electrolyte paste', col: '#e7e5e4', r: 0.3, h: 1.18 },
  { id: 'mix', zh: '二氧化錳＋碳粉', en: 'Manganese(IV) oxide + carbon', col: '#27272a', r: 0.26, h: 1.12 },
  { id: 'rod', zh: '碳棒（正極）', en: 'Carbon rod (positive)', col: '#52525b', r: 0.06, h: 1.4 },
];
const OTHERS = [
  { id: 'alkaline', zh: '鹼性電池', en: 'Alkaline cell' },
  { id: 'lithium', zh: '鋰離子電池', en: 'Lithium-ion battery' },
  { id: 'button', zh: '鈕扣電池', en: 'Button cell' },
];

function Panel({ S }) {
  const { pick, lang } = useApp();
  const zh = lang === 'zh';
  return html`<div className="grid gap-1.5 text-sm">
    <div className="rounded-xl bg-rose-50 ring-1 ring-rose-300 px-3 py-2 text-rose-800"><b>⚠️ ${zh ? '安全：' : 'Safety: '}</b>${zh ? '千祈唔好拆真電池、唔好掉落火；鈕扣電池千祈唔好放入口；舊電池要回收。' : 'Never open real batteries or throw them into fire; never put button cells in your mouth; recycle old batteries.'}</div>
    ${LAYERS.map((l, i) => html`<div key=${l.id} className="flex items-center gap-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2">
      <span className="w-6 h-6 shrink-0 rounded-full grid place-items-center text-xs font-black text-white" style=${{ background: l.col === '#e7e5e4' ? '#a8a29e' : l.col }}>${i + 1}</span>
      <span className="flex-1 font-bold text-slate-700">${pick(l)}</span><span>${S[l.id] ? '✅' : '—'}</span>
    </div>`)}
    <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2">${OTHERS.map((o) => html`<span key=${o.id} className=${`px-2 py-0.5 rounded-lg text-xs font-bold ${S[o.id] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>${pick(o)} ${S[o.id] ? '✅' : ''}</span>`)}</div>
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    <rect x="60" y="14" width="80" height="88" rx="10" fill="#2563eb" /><rect x="66" y="20" width="68" height="78" rx="8" fill="#a1a1aa" />
    <rect x="72" y="26" width="56" height="66" rx="6" fill="#e7e5e4" /><rect x="78" y="30" width="44" height="58" rx="5" fill="#27272a" />
    <rect x="96" y="8" width="8" height="80" rx="3" fill="#71717a" /><rect x="92" y="4" width="16" height="8" rx="3" fill="#ca8a04" />
    <text x="160" y="30" fontSize="16" fontWeight="900" fill="#ef4444">+</text><text x="160" y="96" fontSize="16" fontWeight="900" fill="#334155">−</text>
  </svg>`;
}

const events = {
  op_case: { zh: '拆走外殼。外殼只係包住電池、印住資料，唔參與反應。', en: 'Casing removed. It just wraps the cell and shows information; it takes no part in the reaction.' },
  op_zinc: { zh: '拆走鋅筒，佢就係負極！鋅會交出電子，慢慢俾反應用掉。', en: 'Zinc can removed: this is the negative electrode! Zinc gives away electrons and is slowly used up.' },
  op_paste: { zh: '拆走糊狀電解質，主要係氯化銨。佢係糊而唔係水，唔會瀉，所以叫「乾」電池。', en: 'Electrolyte paste removed. It is mainly ammonium chloride, a paste rather than a liquid, so it cannot spill. That is why it is called a "dry" cell.' },
  op_mix: { zh: '拆走黑色嘅二氧化錳同碳粉。二氧化錳負責接收電子。', en: 'The black manganese(IV) oxide and carbon removed. The manganese(IV) oxide accepts electrons.' },
  op_rod: { zh: '最後係碳棒，佢係正極，將電子帶俾二氧化錳。拆晒喇！', en: 'Finally, the carbon rod: the positive electrode that carries electrons to the manganese(IV) oxide. All taken apart!' },
  op_inner: { zh: '要由最外面嗰層開始拆，先拆得到入面。', en: 'Start with the outermost layer; the inner ones can only be reached after that.' },
  cp_alkaline: { zh: '鹼性電池：負極都係鋅，不過電解質係鹼（氫氧化鉀），用得耐好多。', en: 'Alkaline cell: the negative electrode is still zinc, but the electrolyte is an alkali (potassium hydroxide), so it lasts much longer.' },
  cp_lithium: { zh: '鋰離子電池：手機同平板電腦用嘅，可以充電好多次。唔好刺穿或者壓爛佢，會起火。', en: 'Lithium-ion battery: used in phones and tablets, and it can be recharged many times. Never pierce or crush it, because it can catch fire.' },
  cp_button: { zh: '鈕扣電池：好細，用喺手錶同計數機。千祈唔好放入口，吞咗會嚴重灼傷，要即刻睇醫生！', en: 'Button cell: tiny, used in watches and calculators. Never put one in your mouth: swallowing it causes serious burns and needs a doctor straight away!' },
  cpAll: { zh: '三種電池都睇完喇！', en: 'You have looked at all three batteries!' },
  cp_need: { zh: '先拆完個鋅碳電池，再睇其他電池。', en: 'Finish taking apart the zinc-carbon cell first, then look at the other batteries.' },
  tray: { zh: '零件盤：拆出嚟嘅部分就放喺度。', en: 'The parts tray: the pieces you take out go here.' },
};

export default {
  id: 'drycell', topics: ['5.3'], accent: '#2563eb', dark: '#1e40af', bg: 'linear-gradient(135deg,#dbeafe,#fef9c3)', Art,
  title: { zh: '拆解乾電池', en: 'Inside a Dry Cell' },
  desc: { zh: '喺電腦入面安全咁拆開一粒乾電池，睇下鋅、碳同二氧化錳點樣合作發電！', en: 'Safely take apart a dry cell on screen and see how zinc, carbon and manganese(IV) oxide work together to make electricity!' },
  steps: [
    { tag: 'intro', zh: '遙控器、時鐘用嘅「乾電池」入面係點樣？今日我哋喺電腦入面，安全咁拆開一粒鋅碳電池睇下。安全提提你：千祈唔好拆真電池！入面嘅化學物質有腐蝕性，有啲仲會起火。後面嘅物件可以撳嚟睇介紹。',
      en: 'What is inside the dry cells in remote controls and clocks? Today we will safely take apart a zinc-carbon cell on screen. Safety first: never open a real battery! The chemicals inside are corrosive, and some can even catch fire. Tap the objects at the back to learn about them.' },
    { tag: 'try', action: { id: 'open', events: ['op_'] }, zh: '由最外面開始，將每一層拖去右邊嘅零件盤：外殼、鋅筒、糊狀電解質、黑色混合物，最後係碳棒。',
      en: 'Starting from the outside, drag each layer to the parts tray on the right: the casing, the zinc can, the electrolyte paste, the black mixture and finally the carbon rod.' },
    { tag: 'observe', zh: '鋅筒係負極，碳棒係正極，中間係糊狀嘅電解質同二氧化錳。因為電解質係糊而唔係水，唔會瀉出嚟，所以叫「乾」電池。',
      en: 'The zinc can is the negative electrode and the carbon rod is the positive electrode, with the electrolyte paste and manganese(IV) oxide in between. The electrolyte is a paste rather than a liquid, so it cannot spill. That is why it is called a "dry" cell.' },
    { tag: 'try', action: { id: 'compare', events: ['cp_'] }, zh: '撳後面三種唔同嘅電池，睇下佢哋有咩分別。', en: 'Tap the three different batteries at the back to see how they differ.' },
    { tag: 'feynman', zh: '乾電池同檸檬電池好似：鋅都係負責將電子推出去；檸檬汁換咗做糊狀電解質；銅片就換咗做碳棒同二氧化錳。',
      en: 'A dry cell is a lot like the lemon battery: zinc still pushes the electrons out; the lemon juice is replaced by the electrolyte paste; and the copper plate is replaced by the carbon rod and manganese(IV) oxide.' },
    { tag: 'first', zh: '由最基本諗起：鋅原子失去電子，變成鋅離子，呢個係「氧化」；電子經電線同電器行去碳棒，俾二氧化錳接收，呢個係「還原」。鋅慢慢用完，電池就冇電；舊電池嘅鋅筒可能蝕穿咗，入面嘅糊就會漏出嚟。',
      en: 'Back to basics: zinc atoms lose electrons and become zinc ions; this is oxidation. The electrons travel through the wires and the device to the carbon rod, where the manganese(IV) oxide accepts them; this is reduction. As the zinc is used up, the cell runs flat, and an old cell\'s zinc can may be eaten through, letting the paste leak out.' },
    { tag: 'life', zh: '生活應用：鹼性電池用氫氧化鉀做電解質，用得耐啲；手機用嘅鋰離子電池可以充電；鈕扣電池好細，千祈唔好放入口，要放喺小朋友攞唔到嘅地方。用完嘅電池要放入回收箱。',
      en: 'Everyday life: alkaline cells use potassium hydroxide as the electrolyte and last longer; the lithium-ion batteries in phones can be recharged; button cells are tiny, must never go in anyone\'s mouth, and should be kept out of children\'s reach. Put used batteries in a recycling box.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '點解好舊嘅乾電池有時會漏出糊狀物質？', en: 'Why do very old dry cells sometimes leak a paste?' },
    options: [
      { zh: '因為鋅筒慢慢俾反應用掉，變薄甚至穿窿', en: 'Because the zinc can is slowly used up by the reaction and becomes thin or gets holes' },
      { zh: '因為電池凍親', en: 'Because the cell caught a cold' },
      { zh: '因為入面有好多水', en: 'Because it is full of water' },
    ],
    correct: 0,
    right: { zh: '啱！鋅筒本身就係負極，會交出電子溶走，所以用耐咗會蝕穿。', en: 'Right! The zinc can is the negative electrode itself; it gives away electrons and dissolves, so after long use it can be eaten through.' },
    wrong: { zh: '再諗下：邊一個部分會交出電子，慢慢俾反應用掉？', en: 'Think again: which part gives away electrons and is slowly used up?' },
  },
  tools: [
    { id: 'o', label: { zh: '拆下一層', en: 'Remove the next layer' }, run: (c) => c.openNext() },
    { id: 'c', label: { zh: '睇下一種電池', en: 'Look at the next battery' }, run: (c) => c.compareNext() },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = {}; [...LAYERS, ...OTHERS].forEach((l) => { S[l.id] = false; });
    const push = () => api.state({ ...S });
    const CX = -0.6, CZ = -0.3, BASE = T + 0.02;
    // 放大咗嘅電池模型：每一層係一個獨立物件（可以拖走）
    const parts = LAYERS.map((l, i) => {
      const g = new THREE.Group(); g.position.set(CX, BASE, CZ); scene.add(g);
      const open = i < 3; // 外面三層做成「半個」，可以睇到入面
      const geo = new THREE.CylinderGeometry(l.r, l.r, l.h, 40, 1, open, 0, open ? Math.PI * 1.25 : Math.PI * 2);
      const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: l.col, roughness: l.id === 'zinc' ? 0.35 : 0.7, metalness: l.id === 'zinc' ? 0.7 : 0, side: THREE.DoubleSide }));
      mesh.position.y = l.h / 2; mesh.rotation.y = Math.PI * 0.25; g.add(mesh);
      if (l.id === 'rod') { const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 20), K.stdMat('#ca8a04', 0.3, 0.8)); cap.position.y = l.h + 0.03; g.add(cap); }
      let plus = null;
      if (l.id === 'case') { plus = api.label({ zh: '＋ 1.5V', en: '+ 1.5V' }, { border: '#2563eb', h: 0.15 }); plus.position.set(0.5, l.h, 0); g.add(plus); }
      const hit = new THREE.Mesh(new THREE.CylinderGeometry(l.r + 0.03, l.r + 0.03, l.h, 12), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); hit.position.y = l.h / 2; hit.visible = true; g.add(hit);
      return { g, l, plus, home: g.position.clone() };
    });
    const lCell = api.label({ zh: '鋅碳電池（放大）', en: 'Zinc-carbon cell (enlarged)' }, { border: '#2563eb', h: 0.15 }); lCell.position.set(CX, T + 1.75, CZ);
    // 零件盤
    const TX = 1.35, TZ = 0.45;
    const tray = new THREE.Mesh(new K.RoundedBoxGeometry(2.0, 0.05, 1.0, 2, 0.02), K.stdMat('#e2e8f0', 0.6)); tray.position.set(TX, T + 0.025, TZ); scene.add(tray);
    const lTray = api.label({ zh: '零件盤', en: 'Parts tray' }, { border: '#94a3b8', h: 0.14 }); lTray.position.set(TX, T + 0.1, TZ + 0.6);
    api.tap(tray, () => api.emit('tray'), { zh: '零件盤', en: 'Parts tray' }, [lTray]);
    const traySpot = (i) => V3(TX - 0.75 + i * 0.38, T + 0.05, TZ);
    // 零件盤上面嘅編號（同記錄表 1–5 對應）
    const nums = LAYERS.map((l, i) => { const n = api.label({ zh: String(i + 1), en: String(i + 1) }, { border: l.col === '#e7e5e4' ? '#a8a29e' : l.col, h: 0.13 }); const at = traySpot(i); n.position.set(at.x, T + 0.12, TZ - 0.42); n.visible = false; scene.add(n); return n; });
    // 後排：三種電池
    const others = OTHERS.map((o, i) => {
      const g = new THREE.Group(); g.position.set(-2.3 + i * 0.75, T, -1.2); scene.add(g);
      if (o.id === 'alkaline') { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.45, 20), K.stdMat('#111827', 0.4)); b.position.y = 0.225; g.add(b); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 20), K.stdMat('#ca8a04', 0.3, 0.7)); c.position.y = 0.4; g.add(c); }
      if (o.id === 'lithium') { const b = new THREE.Mesh(new K.RoundedBoxGeometry(0.3, 0.45, 0.05, 2, 0.02), K.stdMat('#334155', 0.4)); b.position.y = 0.225; g.add(b); }
      if (o.id === 'button') { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.035, 24), K.stdMat('#d1d5db', 0.25, 0.9)); b.position.y = 0.02; g.add(b); }
      const hit = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.55, 12), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); hit.position.y = 0.275; g.add(hit); // 細粒電池都撳得中
      const l = api.label(o, { border: '#94a3b8', h: 0.13 }); l.position.set(-2.3 + i * 0.75, T + 0.62, -1.15);
      api.tap(g, () => look(i), o, [l]);
      return g;
    });

    let busy = false;
    const nextLayer = () => LAYERS.findIndex((l) => !S[l.id]);
    async function remove(i, h) {
      if (busy || S[LAYERS[i].id]) return false;
      if (i !== nextLayer()) { api.emit('op_inner'); return false; }
      busy = true;
      const p = parts[i], to = traySpot(i);
      if (p.plus) p.plus.visible = false;
      await K.moveTo(tw, p.g, V3(p.g.position.x, T + 1.9, CZ + 0.3), 0, 0.5);
      await K.moveTo(tw, p.g, V3(to.x, to.y + 0.6, to.z), 0, 0.45, -Math.PI / 2);
      await tw.to(0.3, (k) => { p.g.position.y = to.y + 0.6 * (1 - k); p.g.scale.setScalar(1 - 0.45 * k); });
      h.setHome(p.g.position.clone()); h.homeRot.copy(p.g.rotation);
      S[LAYERS[i].id] = true; push(); api.emit('op_' + LAYERS[i].id);
      nums[i].visible = true; if (p.plus) p.plus.visible = false;
      busy = false;
      if (nextLayer() < 0) { lCell.visible = false; api.done('open'); }
    }
    function look(i) {
      if (busy) return;
      if (nextLayer() >= 0) { api.emit('cp_need'); return; }
      const o = OTHERS[i];
      api.emit('cp_' + o.id);
      const g = others[i]; const y0 = g.position.y;
      tw.to(0.6, (k) => { g.position.y = y0 + Math.sin(k * Math.PI) * 0.15; g.rotation.y = k * Math.PI * 2; });
      if (!S[o.id]) { S[o.id] = true; push(); if (OTHERS.every((x) => S[x.id])) { api.done('compare'); api.emit('cpAll'); } }
    }
    const hL = parts.map((p, i) => api.drag(p.g, { label: p.l, lift: 1.9, enabled: () => !busy && !S[p.l.id],
      targets: () => [{ key: 'tray', pos: V3(TX, T + 0.1, TZ), r: 0.8, ringY: T, accept: () => !S[p.l.id] }],
      onDrop: (tg, h) => remove(i, h), onTap: () => { if (busy || S[p.l.id]) return; if (i === nextLayer()) hL[i].dropOn('tray'); else api.emit('op_inner'); } }));

    push();
    return {
      cam: { pos: [0, 3.3, 4.6], target: [0, 1.1, -0.1], fitW: 5.6 },
      openNext() { const i = nextLayer(); if (!busy && i >= 0) hL[i].dropOn('tray'); },
      compareNext() { const i = OTHERS.findIndex((o) => !S[o.id]); if (i >= 0) look(i); },
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (id === 'open') for (let i = nextLayer(), c = 0; i >= 0 && c < 6; i = nextLayer(), c++) { while (busy) await tw.wait(0.1); await hL[i].dropOn('tray'); await api.waitSpeech(); }
        if (id === 'compare') for (let i = 0; i < OTHERS.length; i++) { if (!S[OTHERS[i].id]) { look(i); await tw.wait(0.7); await api.waitSpeech(); } }
      },
      getHint(id) {
        if (busy) return null;
        if (id === 'open') { const i = nextLayer(); return i < 0 ? null : { from: K.worldOf(parts[i].g, LAYERS[i].h * 0.6), to: V3(TX, T + 0.1, TZ) }; }
        if (id === 'compare') { const i = OTHERS.findIndex((o) => !S[o.id]); return i < 0 || nextLayer() >= 0 ? null : { from: K.worldOf(others[i], 0.25) }; }
        return null;
      },
      reset() {
        tw.clear(); busy = false;
        Object.keys(S).forEach((k) => { S[k] = false; }); push();
        parts.forEach((p, i) => { p.g.scale.setScalar(1); hL[i].setHome(p.home); hL[i].homeRot.set(0, 0, 0); if (p.plus) p.plus.visible = true; nums[i].visible = false; });
        lCell.visible = true;
        others.forEach((g) => { g.position.y = T; g.rotation.y = 0; });
        hL.forEach((h) => { h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.busy = false; });
      },
    };
  },
};
