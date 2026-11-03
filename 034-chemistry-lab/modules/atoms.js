/* Topic 2.1 原子結構：質子、中子、電子；首 20 個元素的電子排佈 */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V3 } = K;

const EL = {
  carbon: { zh: '碳', en: 'Carbon', p: 6, n: 6, shells: [2, 4], pre: 'c_' },
  oxygen: { zh: '氧', en: 'Oxygen', p: 8, n: 8, shells: [2, 6], pre: 'o_' },
  sodium: { zh: '鈉', en: 'Sodium', p: 11, n: 12, shells: [2, 8, 1], pre: 'na_' },
};
const ORDER = ['carbon', 'oxygen', 'sodium'];
const RADII = [0.42, 0.68, 0.94];

function Panel({ S }) {
  const { pick, lang } = useApp();
  const zh = lang === 'zh';
  return html`<div className="grid gap-1.5 text-sm">
    <div className="rounded-xl bg-sky-50 ring-1 ring-sky-200 px-3 py-2 text-sky-900">${zh ? '📏 規則：由最入面嗰層開始填；第一層最多 2 粒，第二、三層（首 20 個元素）最多 8 粒。' : '📏 Rule: fill from the innermost shell; shell 1 holds up to 2, shells 2 and 3 hold up to 8 (first 20 elements).'}</div>
    ${ORDER.map((id) => { const e = EL[id]; return html`<div key=${id} className="flex items-center gap-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2">
      <b className="w-10 text-slate-700">${pick(e)}</b>
      <span className="flex-1 text-xs text-slate-500">${zh ? `質子 ${e.p}・中子 ${e.n}・電子 ${e.p}` : `${e.p} protons · ${e.n} neutrons · ${e.p} electrons`}</span>
      <span className="font-black text-slate-700">${S[id] ? e.shells.join(',') + ' ✅' : '—'}</span>
    </div>`; })}
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    <circle cx="100" cy="55" r="44" fill="none" stroke="#94a3b8" strokeWidth="2.5" /><circle cx="100" cy="55" r="24" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
    ${[[94, 52, '#ef4444'], [104, 50, '#94a3b8'], [99, 60, '#ef4444'], [108, 59, '#94a3b8']].map(([x, y, c]) => html`<circle key=${x + '' + y} cx=${x} cy=${y} r="6" fill=${c} />`)}
    ${[[100, 31], [100, 79], [56, 55], [144, 55], [131, 24], [69, 86]].map(([x, y]) => html`<circle key=${x + '' + y} cx=${x} cy=${y} r="5" fill="#3b82f6" />`)}
  </svg>`;
}

const events = {
  c_1: { zh: '碳：第一層放咗 2 粒電子，已經滿咗！', en: 'Carbon: shell 1 now has 2 electrons and is full!' },
  c_2: { zh: '碳：第二層放咗 4 粒。碳原子完成：2,4！', en: 'Carbon: shell 2 has 4. Carbon is complete: 2,4!' },
  o_1: { zh: '氧：第一層放咗 2 粒，滿咗！', en: 'Oxygen: shell 1 has 2 and is full!' },
  o_2: { zh: '氧：第二層放咗 6 粒。氧原子完成：2,6！', en: 'Oxygen: shell 2 has 6. Oxygen is complete: 2,6!' },
  na_1: { zh: '鈉：第一層 2 粒，滿咗！', en: 'Sodium: shell 1 has 2, full!' },
  na_2: { zh: '鈉：第二層 8 粒，又滿咗！仲有 1 粒電子未有位。', en: 'Sodium: shell 2 has 8, full again! One electron still needs a place.' },
  na_3: { zh: '鈉：第三層放咗 1 粒。鈉原子完成：2,8,1！', en: 'Sodium: shell 3 has 1. Sodium is complete: 2,8,1!' },
  e_inner: { zh: '唔係呢層喎！電子要由最入面嗰層開始填，入面嗰層滿咗先可以去外面。', en: 'Not this shell! Electrons fill the innermost shell first; only when it is full do they go further out.' },
  e_full: { zh: '呢層已經滿咗：第一層最多 2 粒，第二層最多 8 粒。試下出面嗰層。', en: 'This shell is already full: shell 1 holds up to 2 and shell 2 up to 8. Try the next shell out.' },
  e_none: { zh: '呢粒原子已經冇電子要放喇！', en: 'This atom has no more electrons to place!' },
  nucleus: { zh: '原子核入面有帶正電嘅質子（紅色）同唔帶電嘅中子（灰色）。', en: 'The nucleus holds positively charged protons (red) and neutral neutrons (grey).' },
  pencil: { zh: '鉛筆芯係石墨，同鑽石一樣，都係由碳原子組成。', en: 'Pencil lead is graphite, made of carbon atoms, just like diamond.' },
  scope: { zh: '科學家要用超強嘅顯微鏡，先可以「睇」到一粒粒原子。', en: 'Scientists need super-powerful microscopes to "see" individual atoms.' },
};

export default {
  id: 'atoms', topics: ['2.1'], accent: '#6366f1', dark: '#3730a3', bg: 'linear-gradient(135deg,#e0e7ff,#f5f3ff)', Art,
  title: { zh: '原子樂高', en: 'Atom Builder' },
  desc: { zh: '用質子、中子同電子砌原子！學識電子一層一層咁排，認識碳、氧同鈉。', en: 'Build atoms from protons, neutrons and electrons! Learn how electrons fill shells, layer by layer, in carbon, oxygen and sodium.' },
  steps: [
    { tag: 'intro', zh: '世界上所有物質都係由「原子」砌成，原子細到要幾百萬粒排埋，先得一毫米咁長！原子中間係「原子核」，入面有帶正電嘅「質子」同唔帶電嘅「中子」；外面有帶負電嘅「電子」，喺唔同嘅「電子層」度轉。今日我哋砌三粒原子！後面嘅物件可以撳嚟睇介紹。',
      en: 'Everything in the world is built from atoms, which are so tiny that millions of them in a row would be just one millimetre long! In the middle of an atom is the nucleus, holding positive protons and neutral neutrons. Around it, negative electrons move in different shells. Today we will build three atoms! Tap the objects at the back to learn about them.' },
    { tag: 'try', action: { id: 'carbon', events: ['c_', 'e_'] }, zh: '呢個係碳原子核：6 粒質子、6 粒中子。將藍色電子拖去電子層：要由最入面嗰層開始，第一層最多 2 粒。',
      en: 'This is a carbon nucleus: 6 protons and 6 neutrons. Drag the blue electrons to the shells, starting with the innermost one. Shell 1 holds up to 2.' },
    { tag: 'observe', zh: '碳有 6 粒電子：第一層 2 粒，第二層 4 粒，寫做「2,4」。電子數目同質子數目一樣，正負抵消，所以原子唔帶電。',
      en: 'Carbon has 6 electrons: 2 in shell 1 and 4 in shell 2, written as 2,4. The number of electrons equals the number of protons, so the charges cancel and the atom is neutral.' },
    { tag: 'try', action: { id: 'oxygen', events: ['o_', 'e_'] }, zh: '而家砌氧原子：8 粒質子、8 粒中子。將電子拖去電子層。', en: 'Now build oxygen: 8 protons and 8 neutrons. Drag the electrons to the shells.' },
    { tag: 'try', action: { id: 'sodium', events: ['na_', 'e_'] }, zh: '最後砌鈉原子：11 粒質子、12 粒中子。記住：第二層最多 8 粒，裝唔落就要開新一層！',
      en: 'Finally, build sodium: 11 protons and 12 neutrons. Remember: shell 2 holds up to 8, so any extra electrons start a new shell!' },
    { tag: 'feynman', zh: '電子層好似一棟大廈嘅樓層：最近原子核嘅一樓最細，只坐得 2 個人；首 20 個元素嘅二樓同三樓，各坐得 8 個。大家都會由低層坐起，坐滿先上一層。',
      en: 'Electron shells are like the floors of a building: the first floor, nearest the nucleus, is smallest and seats only 2; for the first 20 elements, the second and third floors seat 8 each. Everyone fills the lowest floor first, and only moves up when it is full.' },
    { tag: 'first', zh: '由最基本諗起：質子數目決定係咩元素：1 粒係氫，6 粒係碳，8 粒係氧，11 粒係鈉。電子帶負電，俾帶正電嘅原子核吸住；越入面嘅電子層能量越低，所以電子會先填入面。最外層有幾多粒電子，就決定咗元素嘅化學性質。',
      en: 'Back to basics: the number of protons decides which element it is: 1 is hydrogen, 6 is carbon, 8 is oxygen and 11 is sodium. Negative electrons are held by the positive nucleus; inner shells have lower energy, so electrons fill them first. The number of electrons in the outer shell decides how the element behaves chemically.' },
    { tag: 'life', zh: '生活應用：鉛筆芯（石墨）同鑽石都係由碳原子組成，只係排法唔同；我哋呼吸嘅氧氣、食鹽入面嘅鈉，全部都係原子砌成。科學家要用超強嘅顯微鏡，先「睇」到一粒粒原子。',
      en: 'Everyday life: pencil lead (graphite) and diamond are both made of carbon atoms, just arranged differently; the oxygen we breathe and the sodium in table salt are all built from atoms. Scientists need super-powerful microscopes to "see" individual atoms.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '鎂原子有 12 粒電子。佢嘅電子排佈係點？', en: 'A magnesium atom has 12 electrons. What is its electron arrangement?' },
    options: [{ zh: '2,10', en: '2,10' }, { zh: '2,8,2', en: '2,8,2' }, { zh: '12', en: '12' }],
    correct: 1,
    right: { zh: '啱！第一層 2 粒，第二層最多 8 粒，剩低 2 粒就去第三層：2,8,2。', en: 'Right! 2 in shell 1, up to 8 in shell 2, and the remaining 2 go into shell 3: 2,8,2.' },
    wrong: { zh: '再諗下：第二層最多可以坐幾多粒電子？', en: 'Think again: how many electrons can shell 2 hold at most?' },
  },
  tools: [{ id: 'e', label: { zh: '放下一層電子', en: 'Fill the next shell' }, run: (c) => c.fillNext() }],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = { carbon: false, oxygen: false, sodium: false };
    const push = () => api.state({ ...S });
    const C = V3(-0.3, T + 1.25, -0.5);
    let cur = 'carbon', filled = 0; // 已經填好幾多層
    // 原子核
    const nucleus = new THREE.Group(); nucleus.position.copy(C); scene.add(nucleus);
    const pMat = K.stdMat('#ef4444', 0.35), nMat = K.stdMat('#94a3b8', 0.35), eMat = K.stdMat('#3b82f6', 0.3);
    const ballGeo = new THREE.SphereGeometry(0.055, 14, 10);
    // 按比例平均分配質子同中子，用黃金角螺旋擠埋一齊
    function buildNucleus(el) {
      while (nucleus.children.length) nucleus.remove(nucleus.children[0]);
      const tot = el.p + el.n;
      for (let i = 0; i < tot; i++) {
        const isP = Math.floor((i + 1) * el.p / tot) > Math.floor(i * el.p / tot);
        const m = new THREE.Mesh(ballGeo, isP ? pMat : nMat);
        const y = 1 - (i + 0.5) / tot * 2, r = Math.sqrt(1 - y * y), th = i * 2.39996, R = 0.05 + 0.045 * Math.cbrt(tot);
        m.position.set(Math.cos(th) * r * R, y * R, Math.sin(th) * r * R); nucleus.add(m);
      }
    }
    const lNuc = api.label((lang) => { const e = EL[cur]; return lang === 'zh' ? `${e.zh}原子核：質子 ${e.p}・中子 ${e.n}` : `${e.en} nucleus: ${e.p} p · ${e.n} n`; }, { border: '#6366f1', h: 0.16 }); lNuc.position.set(C.x, T + 0.12, C.z + 0.6);
    api.tap(nucleus, () => api.emit('nucleus'), { zh: '原子核', en: 'Nucleus' }, [lNuc]);
    // 電子層（直立嘅圓環，面向鏡頭）
    const rings = RADII.map((r, k) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 72), new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.5, transparent: true, opacity: 0.9 })); ring.position.copy(C); scene.add(ring);
      const l = api.label({ zh: `第 ${k + 1} 層`, en: `Shell ${k + 1}` }, { border: '#94a3b8', h: 0.12 }); l.position.set(C.x + r * 0.71 + 0.12, C.y + r * 0.71 + 0.05, C.z);
      return { ring, l, r };
    });
    const electrons = new THREE.Group(); scene.add(electrons);
    const shellPos = (k) => V3(C.x, C.y + RADII[k], C.z); // 拖放目標：每層最頂
    // 電子盒（每次拖一「批」電子去一層）
    const tray = new THREE.Mesh(new K.RoundedBoxGeometry(0.6, 0.06, 0.45, 2, 0.02), K.stdMat('#dbeafe', 0.5)); tray.position.set(1.9, T + 0.03, 0.85); scene.add(tray);
    const token = new THREE.Group(); token.position.set(1.9, T + 0.14, 0.85); scene.add(token);
    [[-0.1, 0, 0], [0.1, 0, 0.02], [0, 0.03, -0.08], [0.02, 0.04, 0.09]].forEach(([x, y, z]) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), eMat); e.position.set(x, y, z); token.add(e); });
    const lTok = api.label({ zh: '電子（拖去電子層）', en: 'Electrons (drag to a shell)' }, { border: '#3b82f6', h: 0.14 }); lTok.position.set(0, -0.08, 0.4); token.add(lTok);
    // 後排：鉛筆、顯微鏡
    const pencil = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 6), K.stdMat('#facc15', 0.6)); pencil.rotation.z = Math.PI / 2; pencil.position.set(-2.8, T + 0.04, -1.1); scene.add(pencil);
    const scope = new THREE.Group(); scope.position.set(2.8, T, -1.15); scene.add(scope);
    const sb = new THREE.Mesh(new K.RoundedBoxGeometry(0.3, 0.06, 0.3, 2, 0.02), K.stdMat('#334155', 0.5)); sb.position.y = 0.03; scope.add(sb);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.06), K.stdMat('#334155', 0.5)); arm.position.set(-0.08, 0.3, 0); scope.add(arm);
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.35, 16), K.stdMat('#e2e8f0', 0.4)); tube.rotation.z = 0.4; tube.position.set(0.02, 0.45, 0); scope.add(tube);
    [[pencil, 'pencil', { zh: '鉛筆', en: 'Pencil' }, -2.8, 0.25], [scope, 'scope', { zh: '顯微鏡', en: 'Microscope' }, 2.8, 0.75]].forEach(([o, ev, name, x, y]) => {
      const l = api.label(name, { border: '#94a3b8', h: 0.14 }); l.position.set(x, T + y, -1.12);
      api.tap(o, () => api.emit(ev), name, [l]);
    });

    function showElement(id) {
      cur = id; filled = 0;
      while (electrons.children.length) electrons.remove(electrons.children[0]);
      buildNucleus(EL[id]); lNuc.userData.refresh();
      rings.forEach((r, k) => { const used = k < EL[id].shells.length; r.ring.material.opacity = used ? 0.9 : 0.15; r.l.visible = used; });
    }
    showElement('carbon');
    let busy = false, spin = 0;
    async function fill(k, h) {
      if (busy) return false;
      const el = EL[cur];
      if (filled >= el.shells.length) { api.emit('e_none'); return false; }
      if (k > filled) { api.emit('e_inner'); return false; }
      if (k < filled) { api.emit('e_full'); return false; }
      busy = true;
      const n = el.shells[k], R = RADII[k];
      await K.moveTo(tw, token, V3(C.x, C.y + R + 0.15, C.z + 0.05), 0, 0.4);
      for (let i = 0; i < n; i++) {
        const e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), eMat); e.userData = { k, a: Math.PI / 2 + (i / n) * Math.PI * 2 };
        e.position.set(C.x + Math.cos(e.userData.a) * R, C.y + Math.sin(e.userData.a) * R, C.z); electrons.add(e);
      }
      await tw.to(0.4, (t) => electrons.children.forEach((e) => { if (e.userData.k === k) e.scale.setScalar(Math.max(0.01, t)); }));
      filled += 1;
      api.emit(el.pre + (k + 1));
      await h.returnHome();
      busy = false;
      if (filled >= el.shells.length) { S[cur] = true; push(); api.done(cur); }
    }
    const hTok = api.drag(token, { label: { zh: '電子', en: 'Electrons' }, lift: 0.6, extra: [tray], enabled: () => !busy,
      targets: () => RADII.map((r, k) => ({ key: 's' + k, pos: shellPos(k), r: 0.25, ringY: T, accept: () => true })), // 每層都接受，放錯會解釋
      onDrop: (tg, h) => fill(Number(tg.key.slice(1)), h), onTap: () => { if (!busy && filled < EL[cur].shells.length) hTok.dropOn('s' + filled); } });

    push();
    return {
      cam: { pos: [0, 3.3, 5.0], target: [0, 1.3, -0.2], fitW: 6.2 },
      setStep(i, st) {
        // 去到下一粒原子嘅步驟，就換原子核同清走電子
        const id = st.action && EL[st.action.id] ? st.action.id : null;
        if (id && id !== cur && !S[id] && !busy) showElement(id);
      },
      fillNext() { if (!busy && filled < EL[cur].shells.length) hTok.dropOn('s' + filled); },
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (EL[id] && cur !== id) showElement(id);
        for (let c = 0; filled < EL[cur].shells.length && c < 4; c++) { while (busy) await tw.wait(0.1); await hTok.dropOn('s' + filled); await api.waitSpeech(); }
      },
      getHint(id) {
        if (busy || !EL[id] || cur !== id || filled >= EL[cur].shells.length) return null;
        return { from: K.worldOf(token), to: shellPos(filled) };
      },
      update(dt, t) {
        spin += dt;
        electrons.children.forEach((e) => { const a = e.userData.a + spin * (0.6 - e.userData.k * 0.15), R = RADII[e.userData.k]; e.position.set(C.x + Math.cos(a) * R, C.y + Math.sin(a) * R, C.z); });
      },
      reset() {
        tw.clear(); busy = false;
        Object.keys(S).forEach((k) => { S[k] = false; }); push();
        showElement('carbon');
        hTok.obj.position.copy(hTok.home); hTok.busy = false;
      },
    };
  },
};
