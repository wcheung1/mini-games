/* Topic 4.3 指示劑和 pH：紫椰菜汁、石蕊試紙、pH 試紙 */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V2, V3 } = K;

// 紫椰菜汁喺 pH 0–14 嘅顏色
const CAB = ['#c81d3a', '#d61f45', '#dc2f55', '#e64a7b', '#c94f9e', '#9a4fb0', '#7d47a8', '#6c4bb0', '#4b63c9', '#3a7fd0', '#2fa39c', '#3fb56a', '#7cc142', '#c9cf35', '#e8d23a'];
// 萬用指示劑 / pH 試紙嘅顏色
const UNI = ['#d7191c', '#e8331f', '#f05a24', '#f7941d', '#fdb913', '#f5e11b', '#c8dc2b', '#74c043', '#2fa84f', '#14a58d', '#1d7fc4', '#2a59a8', '#433f98', '#5b2c8f', '#6a1f80'];
const LIQ = [
  { id: 'lemon', ph: 2, zh: '檸檬汁', en: 'Lemon juice', color: '#f0d969' },
  { id: 'vinegar', ph: 3, zh: '白醋', en: 'White vinegar', color: '#eadfc4' },
  { id: 'water', ph: 7, zh: '清水', en: 'Water', color: '#a9d8f5' },
  { id: 'soda', ph: 8, zh: '梳打粉水', en: 'Baking soda water', color: '#d9e2ea' },
  { id: 'soap', ph: 10, zh: '番鹼水', en: 'Soapy water', color: '#efd3e3' },
];
const RED_LIT = '#e2475a', BLUE_LIT = '#3f6fd8', PH_PAPER = '#f2d58a';
const kindOf = (ph) => (ph < 7 ? 'acid' : ph > 7 ? 'alkali' : 'neutral');

const events = {
  cabbage: { zh: '呢個係紫椰菜！將佢切碎，用熱水浸一陣，就會得到紫色嘅椰菜汁。用熱水記得搵大人幫手！', en: 'This is a red cabbage! Chop it and soak it in hot water to get purple cabbage juice. Always ask a grown-up to help with hot water!' },
  chart: { zh: '呢塊係 pH 色板。上面一行係紫椰菜汁嘅顏色，下面一行係 pH 試紙嘅顏色。pH 由 0 到 14：數字越細越酸，7 係中性，數字越大越鹼。', en: 'This is the pH colour chart. The top row shows cabbage juice colours and the bottom row shows pH paper colours. pH goes from 0 to 14: smaller means more acidic, 7 is neutral, bigger means more alkaline.' },
  allCab: { zh: '五支試管都滴咗紫椰菜汁喇！撳「下一步」，一齊整理發現。', en: 'All five test tubes have cabbage juice now! Tap "Next" to sort out what we found.' },
  enoughLit: { zh: '石蕊試紙用得好好！你可以繼續試，或者撳「下一步」。', en: 'Great work with the litmus paper! Keep testing or tap "Next".' },
  enoughPh: { zh: 'pH 試紙用得好好！你可以繼續試，或者撳「下一步」。', en: 'Great work with the pH paper! Keep testing or tap "Next".' },
  already: { zh: '呢支試管已經試過呢件工具喇，揀另一支試下！', en: 'This tube has already been tested with this tool. Try another one!' },
};
const CAB_TXT = {
  lemon: ['檸檬汁令紫椰菜汁即刻變咗紅色！紅色代表好酸。', 'Lemon juice turns the cabbage juice red straight away! Red means very acidic.'],
  vinegar: ['白醋令佢變咗粉紅色，代表佢都係酸性。', 'Vinegar turns it pink, so vinegar is acidic too.'],
  water: ['清水冇令顏色改變，仍然係紫色，代表中性：唔酸亦唔鹼。', 'Water does not change the colour. It stays purple, which means neutral: not acidic and not alkaline.'],
  soda: ['梳打粉水令佢變咗藍色！藍色代表弱鹼性。', 'Baking soda water turns it blue! Blue means weakly alkaline.'],
  soap: ['番鹼水令佢變成藍綠色，代表鹼性再強啲。', 'Soapy water turns it blue-green, which means more alkaline.'],
};
LIQ.forEach((L) => {
  const k = kindOf(L.ph);
  events['cab_' + L.id] = { zh: CAB_TXT[L.id][0], en: CAB_TXT[L.id][1] };
  events['lit_' + L.id] = k === 'acid'
    ? { zh: `${L.zh}令藍色石蕊試紙變成紅色，紅色試紙就冇變。所以${L.zh}係酸性！`, en: `${L.en} turns the blue litmus paper red, and the red paper stays red. So ${L.en.toLowerCase()} is acidic!` }
    : k === 'alkali'
      ? { zh: `${L.zh}令紅色石蕊試紙變成藍色，藍色試紙就冇變。所以${L.zh}係鹼性！`, en: `${L.en} turns the red litmus paper blue, and the blue paper stays blue. So ${L.en.toLowerCase()} is alkaline!` }
      : { zh: `兩張石蕊試紙都冇變色，所以${L.zh}係中性。`, en: `Neither litmus paper changes colour, so ${L.en.toLowerCase()} is neutral.` };
  events['ph_' + L.id] = { zh: `pH 試紙蘸咗${L.zh}之後變色喇。對返色板，pH 大約係 ${L.ph}。`, en: `The pH paper changes colour in ${L.en.toLowerCase()}. Matching it with the chart, the pH is about ${L.ph}.` };
  events['tube_' + L.id] = { zh: `呢支試管裝住${L.zh}。`, en: `This test tube holds ${L.en.toLowerCase()}.` };
});

function Panel({ S }) {
  const { pick, lang } = useApp();
  const st = S.tubes || LIQ.map(() => ({}));
  const H = lang === 'zh' ? ['液體', '紫椰菜汁', '石蕊試紙', 'pH'] : ['Liquid', 'Cabbage', 'Litmus', 'pH'];
  const litTxt = (L) => { const k = kindOf(L.ph); return k === 'acid' ? (lang === 'zh' ? '藍 → 紅（酸）' : 'blue → red (acid)') : k === 'alkali' ? (lang === 'zh' ? '紅 → 藍（鹼）' : 'red → blue (alkali)') : (lang === 'zh' ? '冇變（中性）' : 'no change (neutral)'); };
  return html`<div className="overflow-x-auto"><table className="w-full text-sm">
    <thead><tr className="text-left text-slate-500">${H.map((h) => html`<th key=${h} className="py-1 pr-2 font-black">${h}</th>`)}</tr></thead>
    <tbody>${LIQ.map((L, i) => html`<tr key=${L.id} className="border-t border-slate-100">
      <td className="py-1.5 pr-2 font-bold text-slate-700">${pick(L)}</td>
      <td className="py-1.5 pr-2">${st[i] && st[i].cab ? html`<span className="inline-block w-6 h-6 rounded-full ring-2 ring-white shadow align-middle" style=${{ background: CAB[L.ph] }}></span>` : '—'}</td>
      <td className="py-1.5 pr-2 text-slate-700">${st[i] && st[i].lit ? litTxt(L) : '—'}</td>
      <td className="py-1.5 pr-2">${st[i] && st[i].ph ? html`<span className="px-2 py-0.5 rounded-full text-white font-black" style=${{ background: UNI[L.ph] }}>${L.ph}</span>` : '—'}</td>
    </tr>`)}</tbody>
  </table></div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    ${[['#d61f45', 40], ['#6c4bb0', 80], ['#2fa39c', 120]].map(([c, x]) => html`<g key=${x}><rect x=${x - 13} y="10" width="26" height="88" rx="13" fill="#fff" fillOpacity=".9" stroke="#cbd5e1" strokeWidth="3" /><rect x=${x - 9} y="46" width="18" height="48" rx="9" fill=${c} /></g>`)}
    <rect x="150" y="20" width="10" height="70" rx="3" fill="#e2475a" /><rect x="165" y="20" width="10" height="70" rx="3" fill="#3f6fd8" />
    <rect x="180" y="20" width="10" height="70" rx="3" fill="#74c043" />
  </svg>`;
}

export default {
  id: 'indicators', topics: ['4.3'], accent: '#a855f7', dark: '#7e22ce', bg: 'linear-gradient(135deg,#f5e8ff,#ffe4ef)', Art,
  title: { zh: '酸鹼偵探：指示劑同 pH', en: 'Acid–Alkali Detectives: Indicators and pH' },
  desc: { zh: '用紫椰菜汁、石蕊試紙同 pH 試紙，查出屋企液體係酸定係鹼！', en: 'Use red cabbage juice, litmus paper and pH paper to find out which household liquids are acidic or alkaline!' },
  steps: [
    { tag: 'intro', zh: '大家好！今日我哋做「酸鹼偵探」。架上五支試管，分別裝住檸檬汁、白醋、清水、梳打粉水同番鹼水。我哋有三件偵探工具：紫椰菜汁、石蕊試紙同 pH 試紙。佢哋都係「指示劑」：識得變色，話俾我哋知一樣嘢係酸定係鹼。',
      en: 'Hello everyone! Today we are acid–alkali detectives. The five test tubes hold lemon juice, white vinegar, water, baking soda water and soapy water. We have three detective tools: red cabbage juice, litmus paper and pH paper. They are all "indicators": they change colour to tell us whether something is an acid or an alkali.' },
    { tag: 'try', action: { id: 'cab', events: ['cab_'] }, zh: '第一件工具：紫椰菜汁。按住紫色滴瓶，拖去試管上面放手，佢就會滴一滴落去。五支試管都試晒佢！',
      en: 'Tool one: red cabbage juice. Press and hold the purple dropper bottle, drag it over a test tube and let go to add a drop. Test all five tubes!' },
    { tag: 'observe', zh: '我哋發現：檸檬汁同白醋令紫椰菜汁變紅或者粉紅，佢哋係「酸性」；清水仍然係紫色，係「中性」；梳打粉水同番鹼水令佢變藍或者藍綠，佢哋係「鹼性」。後面塊色板話俾我哋知：顏色越紅越酸，越綠越鹼。',
      en: 'Here is what we found: lemon juice and vinegar turn the cabbage juice red or pink, so they are acidic. Water stays purple, so it is neutral. Baking soda water and soapy water turn it blue or blue-green, so they are alkaline. The chart at the back shows us: the redder, the more acidic; the greener, the more alkaline.' },
    { tag: 'try', action: { id: 'lit', events: ['lit_'] }, zh: '第二件工具：石蕊試紙。佢有一張紅色、一張藍色。拖去試管度蘸一蘸：酸會令藍色試紙變紅，鹼會令紅色試紙變藍。最少試三支試管！',
      en: 'Tool two: litmus paper. There is one red strip and one blue strip. Drag them to a tube to dip them: an acid turns blue litmus red, and an alkali turns red litmus blue. Test at least three tubes!' },
    { tag: 'try', action: { id: 'ph', events: ['ph_'] }, zh: '第三件工具：pH 試紙。佢會變成好多種唔同顏色。蘸完之後，對住色板下面嗰行，就知道 pH 係幾多。最少試三支試管！',
      en: 'Tool three: pH paper. It can turn many different colours. After dipping it, match it with the bottom row of the chart to find the pH number. Test at least three tubes!' },
    { tag: 'feynman', zh: '比較下三件工具：石蕊試紙好似一個只識答「係」或者「唔係」嘅偵探，只話到你「酸定鹼」；紫椰菜汁同 pH 試紙就好似識講「有幾酸、有幾鹼」嘅偵探，可以用 pH 數字表示。科學家要知道有幾酸，就會用 pH 試紙或者 pH 計。',
      en: 'Compare the three tools: litmus paper is like a detective who can only answer "yes" or "no": it only tells you acid or alkali. Cabbage juice and pH paper are like detectives who can tell you how acidic or how alkaline, using a pH number. When scientists need to know how acidic something is, they use pH paper or a pH meter.' },
    { tag: 'first', zh: '由最基本諗起：「酸」究竟係咩？酸溶咗喺水入面，會放出好多極細、肉眼睇唔到嘅「氫離子」。鹼就會將氫離子捉走。氫離子越多就越酸，所以 pH 數字越細。指示劑入面嘅色素一遇到多咗或者少咗氫離子，形狀會改變，顏色就跟住變。',
      en: 'Back to basics: what actually is an acid? When an acid dissolves in water, it releases lots of tiny particles called hydrogen ions, far too small to see. An alkali takes hydrogen ions away. More hydrogen ions means more acidic, so a smaller pH number. The colouring in an indicator changes shape when there are more or fewer hydrogen ions, and so its colour changes too.' },
    { tag: 'life', zh: '生活入面成日都要量 pH：泳池要保持 pH 大約 7.2 至 7.8，游水先唔會刺眼；有啲植物鍾意酸性泥土，有啲鍾意鹼性泥土；我哋個胃入面嘅胃酸，pH 大約係 1.5 至 3.5，好酸㗎！',
      en: 'We measure pH all the time in everyday life: swimming pools are kept at about pH 7.2 to 7.8 so the water does not sting our eyes; some plants like acidic soil and others like alkaline soil; and the acid in our stomach has a pH of about 1.5 to 3.5, which is very acidic!' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰，用你學到嘅嘢估下答案！', en: 'Finally, a thinking challenge. Use what you have learnt to work out the answer!' },
  ],
  events,
  quiz: {
    q: { zh: '你用 pH 試紙測試一杯飲品，試紙變咗橙色。對住色板，呢杯飲品係咩性質？', en: 'You test a drink with pH paper and the paper turns orange. Using the chart, what kind of drink is it?' },
    options: [{ zh: '酸性', en: 'Acidic' }, { zh: '中性', en: 'Neutral' }, { zh: '鹼性', en: 'Alkaline' }],
    correct: 0,
    right: { zh: '橙色喺色板左邊，大約係 pH 3 至 4，所以係酸性。好多果汁同汽水都係酸性㗎！', en: 'Orange is on the left of the chart, about pH 3 to 4, so the drink is acidic. Lots of fruit juices and fizzy drinks are acidic!' },
    wrong: { zh: '再睇下色板：中性係綠色，鹼性係藍色或者紫色。橙色喺邊一邊呢？', en: 'Look at the chart again: neutral is green, and alkaline is blue or purple. Which side is orange on?' },
  },
  tools: [
    { id: 'tcab', label: { zh: '滴紫椰菜汁', en: 'Add cabbage juice' }, run: (c) => c.useTool('cab') },
    { id: 'tlit', label: { zh: '用石蕊試紙', en: 'Use litmus paper' }, run: (c) => c.useTool('lit') },
    { id: 'tph', label: { zh: '用 pH 試紙', en: 'Use pH paper' }, run: (c) => c.useTool('ph') },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const xs = [-2.1, -1.05, 0, 1.05, 2.1], zT = -0.5, LEVEL = 0.62, TUBE_Y = T + 0.07;
    const rack = K.makeRack(xs, 0.2, 5.5, 0.8); rack.position.set(0, T, zT); scene.add(rack);
    const st = LIQ.map(() => ({ cab: false, lit: false, ph: false }));
    const tubes = LIQ.map((L, i) => {
      const v = K.makeVessel(K.tubeProfile(0.17, 1.25), { liquidColor: L.color, level: LEVEL, opacity: 0.85 });
      v.group.position.set(xs[i], TUBE_Y, zT); scene.add(v.group); return v;
    });
    const tubeLabels = LIQ.map((L, i) => {
      const lab = api.label((lang) => (lang === 'zh' ? L.zh : L.en) + (st[i].ph ? ` · pH ${L.ph}` : ''), { border: '#94a3b8', h: 0.19 });
      lab.position.set(xs[i], T + 1.55, zT); return lab;
    });
    const pushState = () => api.state({ tubes: st.map((x) => ({ ...x })) });

    // pH 色板（兩行）
    const board = new THREE.Mesh(new THREE.BoxGeometry(5.5, 1.5, 0.05), K.stdMat('#ffffff', 0.9)); board.position.set(0, T + 2.45, -1.45); scene.add(board);
    [-2.6, 2.6].forEach((x) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.7, 12), K.stdMat('#94a3b8', 0.4, 0.5)); p.position.set(x, T + 0.85, -1.45); scene.add(p); });
    const chart = new THREE.Mesh(new THREE.PlaneGeometry(5.3, 1.38), new THREE.MeshBasicMaterial({ toneMapped: false })); chart.position.set(0, T + 2.45, -1.42); scene.add(chart);
    api.onLang((lang) => {
      const c = document.createElement('canvas'); c.width = 1590; c.height = 414; const x = c.getContext('2d');
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, c.width, c.height);
      const left = 190, cw = (1590 - left - 10) / 15;
      x.fillStyle = '#334155'; x.font = `900 40px ${K.FONT}`; x.textAlign = 'left'; x.textBaseline = 'middle';
      x.fillText(lang === 'zh' ? '紫椰菜汁' : 'Cabbage', 12, 80); x.fillText(lang === 'zh' ? 'pH 試紙' : 'pH paper', 12, 220);
      [[CAB, 20], [UNI, 160]].forEach(([cols, y0]) => cols.forEach((col, i) => {
        x.fillStyle = col; K.roundRect(x, left + i * cw + 5, y0, cw - 10, 120, 18); x.fill();
        x.fillStyle = '#ffffff'; x.font = `900 56px ${K.FONT}`; x.textAlign = 'center'; x.fillText(String(i), left + i * cw + cw / 2, y0 + 62);
      }));
      const L = lang === 'zh' ? ['← 越嚟越酸', '中性', '越嚟越鹼 →'] : ['← more acidic', 'neutral', 'more alkaline →'];
      x.fillStyle = '#334155'; x.font = `900 46px ${K.FONT}`;
      x.textAlign = 'left'; x.fillText(L[0], left, 350); x.textAlign = 'center'; x.fillText(L[1], left + 7 * cw + cw / 2, 350); x.textAlign = 'right'; x.fillText(L[2], 1580, 350);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
      if (chart.material.map) chart.material.map.dispose(); chart.material.map = tex; chart.material.needsUpdate = true;
    });
    api.tap(chart, () => api.emit('chart'), { zh: 'pH 色板', en: 'pH colour chart' }, [board]);

    // 紫椰菜（裝飾）
    const geo = new THREE.IcosahedronGeometry(0.3, 3); const pos = geo.attributes.position; const vv = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) { vv.fromBufferAttribute(pos, i); vv.multiplyScalar(1 + 0.06 * Math.sin(vv.x * 18) * Math.cos(vv.y * 15)); pos.setXYZ(i, vv.x, vv.y * 0.9, vv.z); }
    geo.computeVertexNormals();
    const cab = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: '#6d2a8c', roughness: 0.55, flatShading: true })); cab.position.set(-2.8, T + 0.28, 0.6); scene.add(cab);
    const cabLab = api.label({ zh: '紫椰菜', en: 'Red cabbage' }, { border: '#7e22ce', h: 0.18 }); cabLab.position.set(-2.8, T + 0.12, 1.1);
    api.tap(cab, () => api.emit('cabbage'), { zh: '紫椰菜', en: 'Red cabbage' }, [cabLab]);

    // 工具 1：紫椰菜汁滴瓶
    const bottle = K.makeBottle({ body: '#7d47a8', cap: '#4c1d95', dropper: true, glass: true });
    bottle.g.position.set(-1.7, T, 0.95); scene.add(bottle.g);
    const lb1 = api.label({ zh: '紫椰菜汁', en: 'Cabbage juice' }, { border: '#7e22ce', h: 0.18 }); lb1.position.set(0, 0.1, 0.42); bottle.g.add(lb1);
    // 工具 2：石蕊試紙（紅＋藍）
    const litmus = new THREE.Group(); litmus.position.set(0, T + 0.05, 0.95); scene.add(litmus);
    const mkStrip = (col, x) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.55, 0.012), K.stdMat(col, 0.9)); m.position.set(x, 0.275, 0); litmus.add(m); return m; };
    const sRed = mkStrip(RED_LIT, -0.05), sBlue = mkStrip(BLUE_LIT, 0.05);
    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.09, 0.07), K.stdMat('#f59e0b', 0.5)); clip.position.y = 0.6; litmus.add(clip);
    const cup1 = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.12, 20), K.stdMat('#e2e8f0', 0.5)); cup1.position.set(0, T + 0.06, 0.95); scene.add(cup1);
    const lb2 = api.label({ zh: '石蕊試紙', en: 'Litmus paper' }, { border: '#3f6fd8', h: 0.18 }); lb2.position.set(0, 0.05, 0.42); litmus.add(lb2);
    // 工具 3：pH 試紙
    const phT = new THREE.Group(); phT.position.set(1.7, T + 0.05, 0.95); scene.add(phT);
    const sPh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.012), K.stdMat(PH_PAPER, 0.9)); sPh.position.y = 0.275; phT.add(sPh);
    const clip2 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.07), K.stdMat('#22c55e', 0.5)); clip2.position.y = 0.6; phT.add(clip2);
    const cup2 = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.12, 20), K.stdMat('#e2e8f0', 0.5)); cup2.position.set(1.7, T + 0.06, 0.95); scene.add(cup2);
    const lb3 = api.label({ zh: 'pH 試紙', en: 'pH paper' }, { border: '#22c55e', h: 0.18 }); lb3.position.set(0, 0.05, 0.42); phT.add(lb3);

    const results = [];
    let busy = false, curTool = 'cab';
    const tubeTop = (i) => V3(xs[i], T + 1.45, zT);
    const targetsFor = (kind) => () => LIQ.map((L, i) => ({ key: 't' + i, i, pos: V3(xs[i], TUBE_Y + 1.25, zT), r: 0.45, ringY: T, accept: () => !st[i][kind] && !busy }));
    const countDone = (kind) => st.filter((x) => x[kind]).length;
    const DONE_N = { cab: 5, lit: 3, ph: 3 };

    async function doCab(i, h) {
      busy = true;
      const target = V3(xs[i], T + 1.5, zT);
      await K.moveTo(tw, bottle.g, K.tipPose(V2(0, 0.86), 2.1, target), 2.1, 0.6);
      api.emit('cab_' + LIQ[i].id);
      await K.dripDrop(scene, tw, target, V3(xs[i], TUBE_Y + LEVEL, zT), '#7d47a8');
      const from = tubes[i].mat.color.clone(), to = new THREE.Color(CAB[LIQ[i].ph]);
      tubes[i].mat.opacity = 0.92;
      await tw.to(1.0, (k) => tubes[i].mat.color.copy(from).lerp(to, k));
      st[i].cab = true; pushState();
      await h.returnHome();
      busy = false;
      if (countDone('cab') === 5) { api.done('cab'); api.emit('allCab'); }
    }
    function layResult(i, colors, dx) {
      const g = new THREE.Group();
      colors.forEach((c, j) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.012, 0.45), K.stdMat(c, 0.9)); m.position.x = (j - (colors.length - 1) / 2) * 0.09; g.add(m); });
      g.position.set(xs[i] + dx, T + 0.01, 0.12); scene.add(g); results.push(g);
    }
    async function dip(kind, i, h, strips) {
      busy = true;
      const obj = h.obj;
      await K.moveTo(tw, obj, V3(xs[i], T + 1.6, zT), 0, 0.55);
      await tw.to(0.6, (k) => { obj.position.y = T + 1.6 - 1.15 * k; });
      api.emit(kind + '_' + LIQ[i].id);
      const L = LIQ[i]; const kd = kindOf(L.ph);
      const plans = kind === 'lit'
        ? [[sRed, kd === 'alkali' ? BLUE_LIT : RED_LIT], [sBlue, kd === 'acid' ? RED_LIT : BLUE_LIT]]
        : [[sPh, UNI[L.ph]]];
      const froms = plans.map(([m]) => m.material.color.clone());
      await tw.to(0.9, (k) => plans.forEach(([m, c], j) => m.material.color.copy(froms[j]).lerp(new THREE.Color(c), k)));
      await tw.to(0.6, (k) => { obj.position.y = T + 0.45 + 1.15 * k; });
      layResult(i, plans.map(([, c]) => c), kind === 'lit' ? -0.2 : 0.2);
      st[i][kind] = true; pushState();
      if (kind === 'ph') tubeLabels[i].userData.refresh();
      await h.returnHome();
      plans.forEach(([m]) => m.material.color.set(m === sRed ? RED_LIT : m === sBlue ? BLUE_LIT : PH_PAPER));
      busy = false;
      if (countDone(kind) === DONE_N[kind]) { api.done(kind); api.emit(kind === 'lit' ? 'enoughLit' : 'enoughPh'); }
    }
    const handles = {};
    const apply = (kind, i, h) => (kind === 'cab' ? doCab(i, h) : dip(kind, i, h));
    const nextTube = (kind) => [0, 4, 2, 1, 3].find((i) => !st[i][kind]);
    function useTool(kind, i = nextTube(kind)) {
      if (busy) return Promise.resolve();
      if (i === undefined) { api.emit('already'); return Promise.resolve(); }
      if (st[i][kind]) { api.emit('already'); return Promise.resolve(); }
      return handles[kind].dropOn('t' + i);
    }
    const dragOpts = (kind, label, extra) => ({
      label, lift: kind === 'cab' ? 0.9 : 1.0, extra,
      enabled: () => !busy, targets: targetsFor(kind),
      onDrop: (tg, h) => apply(kind, tg.i, h),
      onTap: () => useTool(kind),
    });
    handles.cab = api.drag(bottle.g, dragOpts('cab', { zh: '紫椰菜汁滴瓶', en: 'Cabbage juice dropper' }, [lb1]));
    handles.lit = api.drag(litmus, dragOpts('lit', { zh: '石蕊試紙', en: 'Litmus paper' }, [lb2]));
    handles.ph = api.drag(phT, dragOpts('ph', { zh: 'pH 試紙', en: 'pH paper' }, [lb3]));
    tubes.forEach((v, i) => api.tap(v.group, () => {
      if (curTool && !st[i][curTool]) useTool(curTool, i); else api.emit('tube_' + LIQ[i].id);
    }, { zh: LIQ[i].zh + '試管', en: 'Test tube of ' + LIQ[i].en.toLowerCase() }, [tubeLabels[i]]));
    pushState();

    async function demo(id) {
      while (countDone(id) < DONE_N[id]) {
        while (busy) await tw.wait(0.1);
        const i = nextTube(id); if (i === undefined) break;
        await handles[id].dropOn('t' + i);
        await api.waitSpeech();
      }
    }
    return {
      cam: { pos: [-0.1, 4.3, 5.7], target: [-0.1, 1.95, -0.3], fitW: 6.1 },
      useTool, demo,
      setStep: (i, s) => { if (s.action) curTool = s.action.id; },
      getHint: (id) => { const i = nextTube(id); if (i === undefined) return null; return { from: K.worldOf(handles[id].obj, 0.5), to: tubeTop(i) }; },
      update: (dt, t) => { cab.rotation.y += dt * 0.25; },
      reset() {
        tw.clear(); busy = false;
        st.forEach((x) => { x.cab = x.lit = x.ph = false; });
        tubes.forEach((v, i) => { v.mat.color.set(LIQ[i].color); v.mat.opacity = 0.85; });
        results.forEach((g) => scene.remove(g)); results.length = 0;
        Object.values(handles).forEach((h) => { h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.busy = false; });
        sRed.material.color.set(RED_LIT); sBlue.material.color.set(BLUE_LIT); sPh.material.color.set(PH_PAPER);
        tubeLabels.forEach((l) => l.userData.refresh()); pushState();
      },
    };
  },
};
