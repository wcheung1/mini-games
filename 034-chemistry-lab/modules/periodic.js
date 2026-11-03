/* Topic 2.2 周期表：元素的排列方法（族、週期、金屬同非金屬） */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V3 } = K;

// 首 20 個元素：[符號, 中文, 英文, 週期, 族（8 = 第 0 族）, 類別]
const ELS = [
  ['H', '氫', 'Hydrogen', 1, 1, 'non'], ['He', '氦', 'Helium', 1, 8, 'noble'],
  ['Li', '鋰', 'Lithium', 2, 1, 'metal'], ['Be', '鈹', 'Beryllium', 2, 2, 'metal'], ['B', '硼', 'Boron', 2, 3, 'semi'], ['C', '碳', 'Carbon', 2, 4, 'non'],
  ['N', '氮', 'Nitrogen', 2, 5, 'non'], ['O', '氧', 'Oxygen', 2, 6, 'non'], ['F', '氟', 'Fluorine', 2, 7, 'non'], ['Ne', '氖', 'Neon', 2, 8, 'noble'],
  ['Na', '鈉', 'Sodium', 3, 1, 'metal'], ['Mg', '鎂', 'Magnesium', 3, 2, 'metal'], ['Al', '鋁', 'Aluminium', 3, 3, 'metal'], ['Si', '矽', 'Silicon', 3, 4, 'semi'],
  ['P', '磷', 'Phosphorus', 3, 5, 'non'], ['S', '硫', 'Sulfur', 3, 6, 'non'], ['Cl', '氯', 'Chlorine', 3, 7, 'non'], ['Ar', '氬', 'Argon', 3, 8, 'noble'],
  ['K', '鉀', 'Potassium', 4, 1, 'metal'], ['Ca', '鈣', 'Calcium', 4, 2, 'metal'],
];
const MOVABLE = ['Li', 'Na', 'K', 'He', 'Ne', 'Ar'];
const CAT = { metal: '#93c5fd', non: '#fde68a', semi: '#d6d3d1', noble: '#d8b4fe' };
const CAT_NAME = { metal: { zh: '金屬', en: 'Metals' }, non: { zh: '非金屬', en: 'Non-metals' }, semi: { zh: '類金屬', en: 'Metalloids' }, noble: { zh: '惰性氣體', en: 'Noble gases' } };

function Panel({ S }) {
  const { pick, lang } = useApp();
  const zh = lang === 'zh';
  const row = (title, syms) => html`<div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2">
    <b className="text-slate-700">${title}</b>
    <div className="mt-1 flex gap-1.5">${syms.map((s) => html`<span key=${s} className=${`px-2 py-0.5 rounded-lg text-xs font-black ${S[s] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'}`}>${s} ${S[s] ? '✅' : ''}</span>`)}</div>
  </div>`;
  return html`<div className="grid gap-1.5 text-sm">
    ${row(zh ? '第 1 族（鹼金屬）' : 'Group 1 (alkali metals)', ['Li', 'Na', 'K'])}
    ${row(zh ? '第 0 族（惰性氣體）' : 'Group 0 (noble gases)', ['He', 'Ne', 'Ar'])}
    ${S.colour ? html`<div className="flex flex-wrap gap-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2">${Object.keys(CAT).map((c) => html`<span key=${c} className="inline-flex items-center gap-1 text-xs text-slate-600"><span className="w-3 h-3 rounded inline-block" style=${{ background: CAT[c] }}></span>${pick(CAT_NAME[c])}</span>`)}</div>` : null}
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    ${ELS.map(([s, , , p, g, c]) => { const x = 18 + (g - 1) * 21, y = 10 + (p - 1) * 23; return html`<g key=${s}><rect x=${x} y=${y} width="19" height="21" rx="3" fill=${CAT[c]} stroke="#64748b" strokeWidth="1" /><text x=${x + 9.5} y=${y + 14} fontSize="9" fontWeight="900" textAnchor="middle" fill="#1e293b">${s}</text></g>`; })}
  </svg>`;
}

const events = {
  pt_ok: { zh: '啱位！', en: 'Right place!' },
  pt_g1: { zh: '唔係呢一族喎。佢係好活潑嘅金屬，最外層得 1 粒電子，要放入最左邊嘅第 1 族。', en: 'Wrong group. It is a very reactive metal with just 1 outer electron, so it belongs in Group 1 on the far left.' },
  pt_g0: { zh: '唔係呢一族喎。佢係惰性氣體，最外層已經填滿，要放入最右邊嘅第 0 族。', en: 'Wrong group. It is a noble gas with a full outer shell, so it belongs in Group 0 on the far right.' },
  pt_period: { zh: '族就啱咗！不過佢嘅電子層數目唔同：有幾多層電子，就放喺第幾個週期（第幾行）。試下上或者落一格。', en: 'Right group! But it has a different number of electron shells: the number of shells tells you which period (row) it goes in. Try one row up or down.' },
  g1All: { zh: '第 1 族砌好喇：鋰、鈉、鉀，全部都係好活潑嘅金屬！', en: 'Group 1 is complete: lithium, sodium and potassium, all very reactive metals!' },
  g0All: { zh: '第 0 族砌好喇：氦、氖、氬，全部都係惰性氣體！', en: 'Group 0 is complete: helium, neon and argon, all noble gases!' },
  cl_on: { zh: '顏色燈著咗！藍色係金屬，黃色係非金屬，灰色係類金屬，紫色係惰性氣體。金屬多數喺左邊，非金屬喺右邊。', en: 'The colour lamp is on! Blue are metals, yellow are non-metals, grey are metalloids and purple are noble gases. Metals are mostly on the left and non-metals on the right.' },
  cl_need: { zh: '先砌好第 1 族同第 0 族，先開顏色燈。', en: 'Complete Group 1 and Group 0 first, then switch on the colour lamp.' },
  hydrogen: { zh: '氫雖然喺第 1 族嘅最頂，但係佢係非金屬，同鋰、鈉、鉀好唔同。', en: 'Hydrogen sits at the top of Group 1, but it is a non-metal and very different from lithium, sodium and potassium.' },
  balloon: { zh: '氦氣比空氣輕，又唔會著火，所以用嚟吹會飛嘅氣球。', en: 'Helium is lighter than air and does not burn, so it fills floating balloons.' },
  neon: { zh: '霓虹燈入面有氖氣，通電之後會發出紅橙色嘅光。', en: 'Neon signs contain neon gas, which glows red-orange when electricity passes through it.' },
};

export default {
  id: 'periodic', topics: ['2.2'], accent: '#0891b2', dark: '#155e75', bg: 'linear-gradient(135deg,#cffafe,#ede9fe)', Art,
  title: { zh: '周期表拼圖', en: 'Periodic Table Puzzle' },
  desc: { zh: '將元素磚放入周期表啱嘅位置，發現同一族嘅元素點解咁似！', en: 'Put element tiles in the right places on the periodic table, and discover why elements in the same group are so alike!' },
  steps: [
    { tag: 'intro', zh: '世界上已知有 118 種元素。化學家將佢哋排成一張「周期表」，好似一個大書櫃：每一橫行叫「週期」，每一直行叫「族」，同一族嘅元素性質好相似。今日我哋砌首 20 個元素嘅周期表！後面嘅物件可以撳嚟睇介紹。',
      en: 'There are 118 known elements. Chemists arrange them in the periodic table, like a big bookcase: each row is a period and each column is a group, and elements in the same group behave alike. Today we will build the periodic table of the first 20 elements! Tap the objects at the back to learn about them.' },
    { tag: 'try', action: { id: 'group1', events: ['pt_', 'g1'] }, zh: '將鋰、鈉、鉀三塊元素磚，拖入最左邊第 1 族啱嘅位置。提示：有幾多層電子，就放第幾行。',
      en: 'Drag the lithium, sodium and potassium tiles into the right places in Group 1 on the far left. Hint: the number of electron shells tells you the row.' },
    { tag: 'observe', zh: '第 1 族嘅鋰、鈉、鉀都係好活潑嘅金屬，最外層都只有 1 粒電子，所以性質好似。由上到下，電子層越嚟越多，金屬亦越嚟越活潑。',
      en: 'Lithium, sodium and potassium in Group 1 are all very reactive metals with just 1 outer electron, so they behave alike. Going down, they have more shells and become even more reactive.' },
    { tag: 'try', action: { id: 'group0', events: ['pt_', 'g0'] }, zh: '將氦、氖、氬三塊元素磚，拖入最右邊第 0 族啱嘅位置。', en: 'Drag the helium, neon and argon tiles into the right places in Group 0 on the far right.' },
    { tag: 'observe', zh: '第 0 族係「惰性氣體」：佢哋最外層電子已經滿晒，所以好難同其他物質反應。',
      en: 'Group 0 contains the noble gases: their outer shells are already full, so they hardly react with anything.' },
    { tag: 'try', action: { id: 'colour', events: ['cl_'] }, zh: '撳右邊嘅「顏色燈」，睇下金屬同非金屬喺周期表點樣分佈。', en: 'Tap the colour lamp on the right to see where metals and non-metals are on the table.' },
    { tag: 'feynman', zh: '周期表好似一棟宿舍：住喺同一橫行（週期）嘅元素，電子層數目一樣；住喺同一直行（族）嘅元素，最外層電子數目一樣，所以「性格」相似。',
      en: 'The periodic table is like a dormitory: elements in the same row (period) have the same number of electron shells, and elements in the same column (group) have the same number of outer electrons, so they have similar "personalities".' },
    { tag: 'first', zh: '由最基本諗起：元素按質子數目由細到大排列。週期數目等於電子層數目；族數目等於最外層電子數目，第 0 族就係外層已經填滿。最外層電子決定化學性質，所以同族元素性質相似。左邊多數係金屬，右邊多數係非金屬。',
      en: 'Back to basics: elements are arranged in order of their number of protons. The period number equals the number of electron shells, and the group number equals the number of outer electrons, with Group 0 having a full outer shell. Outer electrons decide chemical behaviour, so elements in the same group are alike. Metals are mostly on the left and non-metals on the right.' },
    { tag: 'life', zh: '生活應用：會飛嘅氣球入面有氦，霓虹燈入面有氖，燈膽入面有氬，街燈用過鈉，補鈣丸入面有鈣。周期表幫科學家預測新元素嘅性質。',
      en: 'Everyday life: floating balloons contain helium, neon signs contain neon, light bulbs contain argon, street lamps have used sodium, and calcium tablets contain calcium. The periodic table helps scientists predict the properties of new elements.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '鈉放落水會劇烈反應。鉀同鈉喺同一族，鉀放落水會點？', en: 'Sodium reacts violently with water. Potassium is in the same group. What happens when potassium is put in water?' },
    options: [{ zh: '完全唔會反應', en: 'Nothing at all' }, { zh: '都會劇烈反應，因為同族元素性質相似', en: 'It also reacts violently, because elements in the same group behave alike' }, { zh: '會變成金', en: 'It turns into gold' }],
    correct: 1,
    right: { zh: '啱！鉀同鈉最外層都係 1 粒電子，而且鉀喺下面，仲更加活潑，反應更劇烈。', en: 'Right! Potassium and sodium both have 1 outer electron, and potassium, lower down, is even more reactive, so the reaction is even more violent.' },
    wrong: { zh: '再諗下：同一族嘅元素，最外層電子數目一樣嗎？', en: 'Think again: do elements in the same group have the same number of outer electrons?' },
  },
  tools: [
    { id: 't', label: { zh: '放好下一塊磚', en: 'Place the next tile' }, run: (c) => c.placeNext() },
    { id: 'c', label: { zh: '🎨 開顏色燈', en: '🎨 Colour lamp' }, run: (c) => c.colour() },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = { colour: false }; MOVABLE.forEach((s) => { S[s] = false; });
    const push = () => api.state({ ...S });
    // 直立嘅周期表板（面向鏡頭）
    const BZ = -0.75, W = 0.44, X0 = -1.55, Y0 = T + 1.95;
    const board = new THREE.Mesh(new K.RoundedBoxGeometry(3.8, 2.0, 0.06, 2, 0.03), K.stdMat('#f8fafc', 0.6)); board.position.set(0, T + 1.3, BZ - 0.05); scene.add(board);
    const slotPos = (p, g) => V3(X0 + (g - 1) * W, Y0 - (p - 1) * W, BZ + 0.02);
    const tileMats = {};
    const tiles = {};
    ELS.forEach(([sym, zh, en, p, g, cat]) => {
      const mat = K.stdMat('#e2e8f0', 0.6); tileMats[sym] = { mat, cat };
      const tile = new THREE.Group();
      const box = new THREE.Mesh(new K.RoundedBoxGeometry(0.4, 0.4, 0.05, 2, 0.02), mat); tile.add(box);
      const l = api.label({ zh: `${sym} ${zh}`, en: sym }, { border: '#64748b', h: 0.12 }); l.position.set(0, 0, 0.05); tile.add(l);
      const movable = MOVABLE.includes(sym);
      if (movable) {
        const empty = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.38), new THREE.MeshBasicMaterial({ color: '#cbd5e1', transparent: true, opacity: 0.5 })); empty.position.copy(slotPos(p, g)); empty.position.z += 0.005; scene.add(empty);
        const k = MOVABLE.indexOf(sym), order = [3, 0, 5, 1, 4, 2][k];
        tile.position.set(-2.1 + order * 0.6, T + 0.25, 0.95); tile.rotation.x = -0.5;
      } else tile.position.copy(slotPos(p, g));
      scene.add(tile);
      tiles[sym] = { tile, p, g, l, home: tile.position.clone() };
      if (sym === 'H') api.tap(tile, () => api.emit('hydrogen'), { zh: '氫', en: 'Hydrogen' });
    });
    const lG1 = api.label({ zh: '第 1 族', en: 'Group 1' }, { border: '#3b82f6', h: 0.13 }); lG1.position.set(X0, Y0 + 0.33, BZ);
    const lG0 = api.label({ zh: '第 0 族', en: 'Group 0' }, { border: '#a855f7', h: 0.13 }); lG0.position.set(X0 + 7 * W, Y0 + 0.33, BZ);
    // 顏色燈
    const lamp = new THREE.Group(); lamp.position.set(2.55, T, 0.6); scene.add(lamp);
    const lBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.08, 24), K.stdMat('#334155', 0.5)); lBase.position.y = 0.04; lamp.add(lBase);
    const bulbMat = new THREE.MeshStandardMaterial({ color: '#fde68a', emissive: '#fbbf24', emissiveIntensity: 0, roughness: 0.3 });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 14), bulbMat); bulb.position.y = 0.25; lamp.add(bulb);
    const lLamp = api.label({ zh: '🎨 顏色燈', en: '🎨 Colour lamp' }, { border: '#f59e0b', h: 0.14 }); lLamp.position.set(2.55, T + 0.55, 0.6);
    // 後排：氣球、霓虹燈
    const balloon = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 14), K.stdMat('#f472b6', 0.3)); balloon.scale.y = 1.2; balloon.position.set(-2.85, T + 0.6, -1.2); scene.add(balloon);
    const neon = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.025, 10, 30), new THREE.MeshStandardMaterial({ color: '#f97316', emissive: '#f97316', emissiveIntensity: 0.8 })); neon.position.set(2.9, T + 0.4, -1.2); scene.add(neon);
    [[balloon, 'balloon', { zh: '氦氣球', en: 'Helium balloon' }, -2.85, 0.98], [neon, 'neon', { zh: '霓虹燈', en: 'Neon sign' }, 2.9, 0.72]].forEach(([o, ev, name, x, y]) => {
      const l = api.label(name, { border: '#94a3b8', h: 0.14 }); l.position.set(x, T + y, -1.15);
      api.tap(o, () => api.emit(ev), name, [l]);
    });

    let busy = false;
    const g1Done = () => ['Li', 'Na', 'K'].every((s) => S[s]);
    const g0Done = () => ['He', 'Ne', 'Ar'].every((s) => S[s]);
    // 所有未放好嘅空位都係目標；放錯會解釋（族錯 or 週期錯）
    const emptySlots = () => MOVABLE.filter((s) => !S[s]).map((s) => ({ s, p: tiles[s].p, g: tiles[s].g }));
    async function place(sym, slotSym, h) {
      if (busy || S[sym]) return false;
      const me = tiles[sym], slot = tiles[slotSym];
      if (slot.g !== me.g) { api.emit(me.g === 1 ? 'pt_g1' : 'pt_g0'); return false; }
      if (slot.p !== me.p) { api.emit('pt_period'); return false; }
      busy = true;
      const to = slotPos(me.p, me.g);
      await K.moveTo(tw, me.tile, V3(to.x, to.y, to.z + 0.4), 0, 0.45, 0);
      await K.moveTo(tw, me.tile, to, 0, 0.25, 0);
      h.setHome(to.clone()); h.homeRot.set(0, 0, 0);
      S[sym] = true; push(); api.emit('pt_ok');
      busy = false;
      if (me.g === 1 && g1Done()) { api.done('group1'); api.emit('g1All'); }
      if (me.g === 8 && g0Done()) { api.done('group0'); api.emit('g0All'); }
    }
    async function colour() {
      if (busy || S.colour) return;
      if (!(g1Done() && g0Done())) { api.emit('cl_need'); return; }
      busy = true; api.emit('cl_on');
      const white = new THREE.Color('#e2e8f0');
      await tw.to(1.2, (k) => { bulbMat.emissiveIntensity = 1.2 * k; Object.values(tileMats).forEach(({ mat, cat }) => mat.color.copy(white).lerp(new THREE.Color(CAT[cat]), k)); });
      S.colour = true; push(); api.done('colour');
      busy = false;
    }
    const hT = {};
    MOVABLE.forEach((sym) => {
      hT[sym] = api.drag(tiles[sym].tile, { label: { zh: ELS.find((e) => e[0] === sym)[1], en: ELS.find((e) => e[0] === sym)[2] }, lift: 0.6, enabled: () => !busy && !S[sym],
        targets: () => emptySlots().map((e) => ({ key: e.s, pos: slotPos(e.p, e.g), r: 0.22, ringY: T, accept: () => !S[e.s] })),
        onDrop: (tg, h) => place(sym, tg.key, h), onTap: () => { if (!busy && !S[sym]) hT[sym].dropOn(sym); } });
    });
    api.tap(lamp, () => colour(), { zh: '顏色燈', en: 'Colour lamp' }, [lLamp]);

    const nextIn = (group) => (group === 1 ? ['Li', 'Na', 'K'] : ['He', 'Ne', 'Ar']).find((s) => !S[s]);
    const stepGroup = (id) => (id === 'group1' ? 1 : id === 'group0' ? 0 : null);
    push();
    return {
      cam: { pos: [0, 2.9, 5.2], target: [0, 1.35, -0.3], fitW: 6.4 },
      colour,
      placeNext() { const s = nextIn(1) || nextIn(0); if (!busy && s) hT[s].dropOn(s); },
      async demo(id) {
        while (busy) await tw.wait(0.1);
        const g = stepGroup(id);
        if (g !== null) for (let s = nextIn(g), c = 0; s && c < 4; s = nextIn(g), c++) { while (busy) await tw.wait(0.1); await hT[s].dropOn(s); }
        if (id === 'colour') await colour();
      },
      getHint(id) {
        if (busy) return null;
        const g = stepGroup(id);
        if (g !== null) { const s = nextIn(g); return s ? { from: K.worldOf(tiles[s].tile), to: slotPos(tiles[s].p, tiles[s].g) } : null; }
        if (id === 'colour') return S.colour ? null : { from: K.worldOf(lamp, 0.25) };
        return null;
      },
      reset() {
        tw.clear(); busy = false;
        Object.keys(S).forEach((k) => { S[k] = false; }); push();
        bulbMat.emissiveIntensity = 0; Object.values(tileMats).forEach(({ mat }) => mat.color.set('#e2e8f0'));
        MOVABLE.forEach((sym) => { const h = hT[sym]; h.setHome(tiles[sym].home); h.homeRot.set(-0.5, 0, 0); h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.busy = false; });
      },
    };
  },
};
