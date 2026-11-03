/* Topic 3.4 金屬的腐蝕及其防護：生鏽的因素（公平測試）、防鏽方法 */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V2, V3 } = K;

function Panel({ S, ctrl }) {
  const { lang, t } = useApp();
  const zh = lang === 'zh';
  const day = S.day ?? 0, maxDay = S.protectDone ? 14 : 7;
  const Y = '✅', N = '❌';
  const rows = [
    ['A', zh ? '只有空氣' : 'Air only', N, Y, N],
    ['B', zh ? '只有水' : 'Water only', Y, N, zh ? '幾乎冇' : 'Hardly'],
    ['C', zh ? '水＋空氣' : 'Water + air', Y, Y, Y],
  ];
  const H = zh ? ['試管', '條件', '水', '氧氣', '生鏽？'] : ['Tube', 'Setup', 'Water', 'Oxygen', 'Rusted?'];
  return html`<div className="space-y-3">
    <div className="rounded-2xl bg-white ring-2 ring-orange-100 p-3">
      <div className="flex items-center gap-2 mb-2"><span className="flex-1 font-black text-orange-700 text-lg">📅 ${zh ? `第 ${day} 日` : `Day ${day}`}</span>
        <span className="text-xs text-slate-500">${zh ? `最多第 ${maxDay} 日` : `Up to day ${maxDay}`}</span></div>
      <input type="range" min="0" max=${maxDay} step="1" value=${Math.min(day, maxDay)} aria-label=${zh ? '時間棒' : 'Time slider'} className="day-slider"
        onChange=${(e) => ctrl.current && ctrl.current.slide(Number(e.target.value))} />
    </div>
    ${day >= 7 ? html`<div className="overflow-x-auto"><table className="w-full text-sm">
      <thead><tr className="text-left text-slate-500">${H.map((h) => html`<th key=${h} className="py-1 pr-2 font-black">${h}</th>`)}</tr></thead>
      <tbody>${rows.map((r) => html`<tr key=${r[0]} className="border-t border-slate-100">${r.map((c, i) => html`<td key=${i} className=${`py-1.5 pr-2 ${i < 2 ? 'font-bold text-slate-700' : ''}`}>${c}</td>`)}</tr>`)}</tbody>
    </table></div>` : null}
    ${day >= 14 ? html`<p className="text-sm font-bold text-slate-700">${zh ? '防鏽挑戰：① 冇保護 → 生鏽　② 油漆 → 冇生鏽　③ 塗油 → 冇生鏽' : 'Rust challenge: ① unprotected → rusty ② painted → no rust ③ oiled → no rust'}</p>` : null}
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    <g transform="rotate(-22 100 58)">
      <rect x="44" y="52" width="112" height="12" rx="4" fill="#9aa4ae" /><rect x="150" y="38" width="12" height="40" rx="3" fill="#7c8791" />
      <path d="M44 52 L24 58 L44 64 Z" fill="#9aa4ae" />
      <circle cx="70" cy="58" r="7" fill="#b45309" /><circle cx="96" cy="54" r="5" fill="#9a3412" /><circle cx="118" cy="60" r="7" fill="#b45309" />
    </g>
    <path d="M32 14 C32 14 21 30 21 37 a11 11 0 0 0 22 0 C43 30 32 14 32 14Z" fill="#38bdf8" />
    <circle cx="172" cy="26" r="15" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="3" /><text x="172" y="31" textAnchor="middle" fontSize="14" fontWeight="900" fill="#0369a1">O₂</text>
  </svg>`;
}

const events = {
  tubeA: { zh: '試管 A：鐵釘只有空氣，冇水。底下白色粒粒係「乾燥劑」，會吸走空氣入面嘅水氣；棉花承住鐵釘；個塞封住試管，唔俾外面嘅水氣走入嚟。', en: 'Tube A: the nail has air but no water. The white grains are a drying agent that soaks up water vapour; the cotton wool holds the nail up; and the stopper keeps damp air from getting in.' },
  tubeB: { zh: '試管 B：鐵釘浸喺煲滾過嘅水入面。煲滾可以趕走水入面溶咗嘅空氣，面頭嗰層油封住水面，唔俾空氣再溶返入去。', en: 'Tube B: the nail is in boiled water. Boiling drives out the air dissolved in the water, and the layer of oil stops air getting back in.' },
  tubeC: { zh: '試管 C：鐵釘有水，又有空氣，試管口冇塞住。', en: 'Tube C: the nail has both water and air, and the tube is left open.' },
  tubeA_after: { zh: '試管 A 過咗一星期：鐵釘仍然光亮，冇生鏽！因為冇水。', en: 'Tube A after a week: the nail is still shiny with no rust, because there is no water.' },
  tubeB_after: { zh: '試管 B 過咗一星期：鐵釘幾乎冇生鏽！因為冇氧氣。', en: 'Tube B after a week: hardly any rust, because there is no oxygen.' },
  tubeC_after: { zh: '試管 C 過咗一星期：鐵釘生咗好多啡紅色嘅鐵鏽，水底仲有鏽屑！', en: 'Tube C after a week: the nail is covered in reddish-brown rust, with rust flakes at the bottom!' },
  allOpen: { zh: '三支試管都睇過喇！準備好就撳「下一步」。', en: 'You have looked in all three tubes! Tap "Next" when you are ready.' },
  ff_seal: { zh: '等等！做公平測試，試管一定要封好。如果開住，空氣同水氣會走入去，A 同 B 都會生鏽，咁就搵唔到真兇喇。我幫你封返先！', en: 'Wait! For a fair test, the tubes must be sealed. If they stay open, damp air gets in and A and B would rust too, so we could not find the real culprit. Let me seal them first!' },
  ff_go: { zh: '時間快轉中！白天、黑夜不停交替，留意每口鐵釘有咩變化。', en: 'Fast-forwarding time! Watch day and night flash by, and keep an eye on every nail.' },
  ff_done1: { zh: '一星期過去喇！只有試管 C 嘅鐵釘生咗好多鐵鏽。撳每支試管，打開佢睇清楚！', en: 'A week has passed! Only the nail in tube C has gone very rusty. Tap each tube to open it and look closely!' },
  ff_done2: { zh: '又過咗一星期！冇保護嘅鐵釘生鏽喇，但係髹咗油漆同塗咗油嘅鐵釘仍然光亮！', en: 'Another week has passed! The unprotected nail has rusted, but the painted and oiled nails are still shiny!' },
  needProtect: { zh: '要先完成防鏽挑戰，保護好兩口鐵釘，先可以再快轉！', en: 'Finish the rust challenge and protect the two nails before fast-forwarding again!' },
  weekOver: { zh: '實驗已經做完喇，可以撳「重新開始」再玩。', en: 'The experiment is finished. Tap "Start again" to play once more.' },
  pr_paint: { zh: '油漆髹好喇！油漆好似一件雨褸，將鐵同水、氧氣隔開。', en: 'Painted! Paint is like a raincoat that keeps water and oxygen away from the iron.' },
  pr_oil: { zh: '油塗好喇！油會包住鐵釘，水同氧氣就掂唔到佢。', en: 'Oiled! The oil wraps around the nail, so water and oxygen cannot touch it.' },
  dish: { zh: '呢三碟水入面各有一口鐵釘，水同空氣都有。', en: 'Each of these dishes of water holds a nail, with both water and air.' },
  calendar: { zh: '呢個係日曆，撳佢可以快轉時間。', en: 'This is the calendar. Tap it to fast-forward time.' },
};

export default {
  id: 'rust', topics: ['3.4'], accent: '#ea580c', dark: '#c2410c', bg: 'linear-gradient(135deg,#fff1e0,#ffe2cc)', Art,
  title: { zh: '鐵釘生鏽偵探', en: 'Rusty Nail Detective' },
  desc: { zh: '用公平測試搵出令鐵生鏽嘅真兇，再挑戰保護鐵釘唔生鏽！', en: 'Use a fair test to find what really makes iron rust, then try to protect nails from rusting!' },
  steps: [
    { tag: 'intro', zh: '你有冇見過舊鐵閘、舊單車上面啡紅色、甩甩脆脆嘅嘢？嗰啲就係「鐵鏽」。今日我哋做「生鏽偵探」，搵出令鐵生鏽嘅真兇！',
      en: 'Have you ever seen the crumbly reddish-brown stuff on an old iron gate or bike? That is rust. Today we are rust detectives, and we will find out what really makes iron rust!' },
    { tag: 'try', action: { id: 'inspect', events: ['tube'] }, zh: '三支試管各有一口一模一樣嘅鐵釘。撳每支試管，打開個塞睇清楚入面有咩。',
      en: 'Each test tube has an identical iron nail. Tap each tube to lift its stopper and look closely at what is inside.' },
    { tag: 'try', action: { id: 'week1', events: ['ff_'] }, zh: '準備好未？撳日曆或者「快轉一星期」，睇下一星期後三口鐵釘會變成點。記住：做公平測試，試管要封好！',
      en: 'Ready? Tap the calendar or "Fast-forward a week" to see the nails after a week. Remember: for a fair test, the tubes must be sealed!' },
    { tag: 'observe', zh: '結果出爐：A 有空氣但冇水，冇生鏽；B 有水但冇空氣，幾乎冇生鏽；C 有水又有空氣，生鏽喇！所以真兇唔止一個：要水同空氣入面嘅氧氣一齊出現，鐵先會生鏽。睇下工具區嘅對照表。',
      en: 'Results are in! A has air but no water: no rust. B has water but no air: hardly any rust. C has water and air: rust! So there is not just one culprit: iron only rusts when water and oxygen are both there. Check the table in the tools area.' },
    { tag: 'feynman', zh: '生鏽係一種化學變化：鐵慢慢同氧氣、水結合，變成一種全新嘅物質，叫做鐵鏽。鐵鏽又鬆又脆，會一層層甩落嚟，所以生鏽嘅鐵會越嚟越薄、越嚟越弱。',
      en: 'Rusting is a chemical change: iron slowly joins with oxygen and water to make a brand-new substance called rust. Rust is loose and crumbly and flakes off layer by layer, so rusty iron gets thinner and weaker.' },
    { tag: 'first', zh: '由最基本諗起：點樣先可以肯定邊個係真兇？「公平測試」每次只改變一樣嘢。三口鐵釘一樣、時間一樣，我哋只改變「有冇水」同「有冇空氣」。所以試管一定要封好：一打開，空氣同水氣就會走入去，條件就唔再公平。',
      en: 'Back to basics: how can we be sure who the culprit is? A fair test changes only one thing at a time. Same nails, same time; we only change whether there is water and whether there is air. That is why the tubes must stay sealed: open them, and damp air gets in, so the test is no longer fair.' },
    { tag: 'try', action: { id: 'protect', events: ['pr_'] }, zh: '防鏽挑戰！前面三碟水入面各有一口鐵釘，水同空氣都有。將油漆掃拖去第 ② 碟，將油樽拖去第 ③ 碟，保護佢哋。第 ① 碟唔理佢，做對照。',
      en: 'Rust challenge! The three dishes in front each hold a nail with water and air. Drag the paintbrush to dish ② and the oil can to dish ③ to protect them. Leave dish ① alone so we can compare.' },
    { tag: 'try', action: { id: 'week2', events: ['ff_'] }, zh: '再快轉一星期，睇下保護有冇用！', en: 'Fast-forward another week to see if the protection works!' },
    { tag: 'life', zh: '知道生鏽要水同氧氣，就識得防止：只要隔開其中一樣就得！例如油漆（鐵閘）、塗油（單車鏈）、包膠（衣架），或者鍍一層鋅（街上閃閃嘅鍍鋅欄杆）。',
      en: 'Since rusting needs water and oxygen, we can stop it by keeping just one of them away! For example: paint (iron gates), oil (bike chains), plastic coating (clothes hangers), or a layer of zinc (shiny galvanised railings).' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '單車鏈點樣保護，先唔容易生鏽？', en: 'How can we protect a bicycle chain so it does not rust easily?' },
    options: [
      { zh: '每日淋水洗乾淨佢', en: 'Wash it with water every day' },
      { zh: '塗一層油，隔開水同空氣', en: 'Put a layer of oil on it to keep water and air away' },
      { zh: '成日放喺太陽底下曬', en: 'Leave it out in the sun all the time' },
    ],
    correct: 1,
    right: { zh: '油可以包住鐵，令水同氧氣掂唔到佢，所以單車鏈要定期上油。', en: 'Oil wraps around the iron so water and oxygen cannot reach it. That is why bike chains need oiling regularly.' },
    wrong: { zh: '再諗下：生鏽要水同氧氣一齊出現，邊個方法可以隔開佢哋？', en: 'Think again: rusting needs both water and oxygen. Which way keeps them away?' },
  },
  tools: [
    { id: 'ff', primary: true, label: { zh: '⏩ 快轉一星期', en: '⏩ Fast-forward a week' }, run: (c) => c.fastForward() },
    { id: 'oa', label: { zh: '打開／合返 A', en: 'Open / close A' }, run: (c) => c.inspect(0) },
    { id: 'ob', label: { zh: '打開／合返 B', en: 'Open / close B' }, run: (c) => c.inspect(1) },
    { id: 'oc', label: { zh: '打開／合返 C', en: 'Open / close C' }, run: (c) => c.inspect(2) },
    { id: 'pp', label: { zh: '② 髹油漆', en: '② Paint' }, run: (c) => c.paint(), show: (i, S, st) => st.action && st.action.id === 'protect' },
    { id: 'po', label: { zh: '③ 塗油', en: '③ Oil' }, run: (c) => c.oil(), show: (i, S, st) => st.action && st.action.id === 'protect' },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const xs = [-1.75, 0, 1.75], z = -0.5, R = 0.3, H = 1.9;
    const rack = K.makeRack(xs, R + 0.03, 5.2, 0.9); rack.position.set(0, T, z); scene.add(rack);
    const tubes = xs.map((x) => { const v = K.makeVessel(K.tubeProfile(R, H), { liquidColor: '#bfe3f7', level: 0, opacity: 0.55, sx: 0.92 }); v.group.position.set(x, T + 0.07, z); scene.add(v.group); return v; });
    tubes[1].setLevel(1.4); tubes[2].setLevel(0.78);
    const WATER = new THREE.Color('#bfe3f7'), RUSTWATER = new THREE.Color('#d9a679');
    const oil = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.92, R * 0.92, 0.14, 32), K.liquidMat('#f2c94c', 0.9)); oil.position.y = 1.47; oil.renderOrder = 2; tubes[1].group.add(oil);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), sc = new THREE.Vector3(), p3 = new THREE.Vector3();
    const dry = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.045), K.stdMat('#f8fafc', 0.9), 70);
    for (let i = 0; i < 70; i++) {
      const rho = Math.random() * 0.22, a = Math.random() * 6.28, yMin = R - Math.sqrt(Math.max(0, R * R - rho * rho)) + 0.05;
      p3.set(Math.cos(a) * rho, yMin + Math.random() * Math.max(0.02, 0.36 - yMin), Math.sin(a) * rho);
      q.setFromEuler(e3.set(Math.random() * 3, Math.random() * 3, 0)); sc.setScalar(0.8 + Math.random() * 0.5); dry.setMatrixAt(i, m4.compose(p3, q, sc));
    }
    tubes[0].group.add(dry);
    const cotton = new THREE.Group();
    [[0, 0, 0, 0.12], [0.1, 0.02, 0.05, 0.1], [-0.09, 0.01, -0.06, 0.1], [0.04, 0.05, -0.1, 0.09], [-0.05, 0.04, 0.1, 0.09]].forEach(([x, y, zz, r]) => { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), K.stdMat('#ffffff', 1)); s.position.set(x, y, zz); cotton.add(s); });
    cotton.position.y = 0.48; tubes[0].group.add(cotton);

    // 鐵釘＋鏽斑
    function makeNail() {
      const g = new THREE.Group(); const mat = K.stdMat('#b8c1ca', 0.3, 0.75);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.09, 16), mat); tip.rotation.x = Math.PI; tip.position.y = 0.045;
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.82, 16), mat); shaft.position.y = 0.5;
      const head = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.035, 24), mat); head.position.y = 0.93;
      g.add(tip, shaft, head);
      return { g, mat };
    }
    function makePatches(n, count) {
      const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.024, 8, 6), K.stdMat('#9c4a1a', 0.95), count);
      const data = [...Array(count)].map(() => ({ a: Math.random() * 6.28, y: 0.12 + Math.random() * 0.78, s: 0.6 + Math.random() * 0.8 }));
      n.g.add(mesh);
      return (k) => { data.forEach((d, i) => { p3.set(Math.cos(d.a) * 0.036, d.y, Math.sin(d.a) * 0.036); sc.setScalar(Math.max(0.0001, k * d.s)); mesh.setMatrixAt(i, m4.compose(p3, q.identity(), sc)); }); mesh.instanceMatrix.needsUpdate = true; };
    }
    const GREY = new THREE.Color('#b8c1ca'), RUST = new THREE.Color('#8f3f16');
    const rustNail = (n, patch, k) => { n.mat.color.copy(GREY).lerp(RUST, k); n.mat.roughness = 0.3 + 0.65 * k; n.mat.metalness = 0.75 - 0.65 * k; patch(k); };
    const nailBase = [0.58, 0.1, 0.1];
    const nails = nailBase.map((y, i) => { const n = makeNail(); n.g.position.y = y; tubes[i].group.add(n.g); return n; });
    const patchC = makePatches(nails[2], 70), patchB = makePatches(nails[1], 10);
    const flakes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.045, 0.014, 0.045), K.stdMat('#a0461b', 0.9), 30);
    for (let i = 0; i < 30; i++) { const rho = Math.random() * 0.17, a = Math.random() * 6.28; p3.set(Math.cos(a) * rho, R - Math.sqrt(R * R - rho * rho) + 0.03, Math.sin(a) * rho); q.setFromEuler(e3.set(Math.random() * 0.5, Math.random() * 3, 0)); sc.setScalar(1); flakes.setMatrixAt(i, m4.compose(p3, q, sc)); }
    flakes.count = 0; tubes[2].group.add(flakes);
    const stoppers = [0, 1].map((i) => { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.27, 0.26, 24), K.stdMat('#8a5a3b', 0.9)); s.position.y = H + 0.04; tubes[i].group.add(s); return s; });
    const names = [{ zh: 'A：只有空氣', en: 'A: air only' }, { zh: 'B：只有水', en: 'B: water only' }, { zh: 'C：水＋空氣', en: 'C: water + air' }];
    const cols = ['#0ea5e9', '#f59e0b', '#ea580c'];
    const tubeLabs = xs.map((x, i) => { const l = api.label(names[i], { border: cols[i], h: 0.2 }); l.position.set(x, T + 2.35, z); return l; });

    // 防鏽挑戰：三碟水
    const dxs = [-1.3, 0, 1.3], dz = 0.85;
    const dishes = dxs.map((x, i) => {
      const g = new THREE.Group(); g.position.set(x, T, dz); scene.add(g);
      const d = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 36, 1, true), K.glassMat()); d.position.y = 0.06; d.renderOrder = 3; g.add(d);
      const base = new THREE.Mesh(new THREE.CircleGeometry(0.5, 36), K.glassMat()); base.rotation.x = -Math.PI / 2; base.position.y = 0.005; g.add(base);
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.07, 36), K.liquidMat('#9fd3f2', 0.55)); w.position.y = 0.04; w.renderOrder = 2; g.add(w);
      const n = makeNail(); n.g.rotation.z = Math.PI / 2; n.g.position.set(0.42, 0.045, 0); n.g.scale.setScalar(0.88); g.add(n.g);
      const patch = makePatches(n, 40);
      return { g, n, patch, prot: null };
    });
    const dishLabs = dishes.map((d, i) => {
      const l = api.label((lang) => {
        const pr = d.prot;
        if (i === 0) return lang === 'zh' ? '① 冇保護' : '① No protection';
        if (i === 1) return pr ? (lang === 'zh' ? '② 髹咗油漆' : '② Painted') : (lang === 'zh' ? '② 等你髹油漆' : '② Paint me');
        return pr ? (lang === 'zh' ? '③ 塗咗油' : '③ Oiled') : (lang === 'zh' ? '③ 等你塗油' : '③ Oil me');
      }, { border: '#64748b', h: 0.17 });
      l.position.set(dxs[i], T + 0.12, dz + 0.62);
      api.tap(d.g, () => api.emit('dish'), { zh: '水碟', en: 'Dish of water' }, [l]);
      return l;
    });
    // 工具：油漆掃、油樽
    const brush = new THREE.Group(); brush.position.set(-2.75, T + 0.02, 0.95); scene.add(brush);
    const tin = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.24, 24), K.stdMat('#2563eb', 0.4, 0.3)); tin.position.y = 0.12; brush.add(tin);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.42, 0.03), K.stdMat('#a16207', 0.7)); handle.position.set(0.05, 0.42, 0); handle.rotation.z = -0.25; brush.add(handle);
    const bristle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.05), K.stdMat('#2563eb', 0.8)); bristle.position.set(0.0, 0.2, 0); brush.add(bristle);
    const lBr = api.label({ zh: '油漆', en: 'Paint' }, { border: '#2563eb', h: 0.17 }); lBr.position.set(0, -0.02, 0.4); brush.add(lBr);
    const oilCan = K.makeBottle({ body: '#facc15', cap: '#a16207' }); oilCan.g.position.set(2.75, T, 0.95); scene.add(oilCan.g);
    const lOil = api.label({ zh: '油', en: 'Oil' }, { border: '#ca8a04', h: 0.17 }); lOil.position.set(0, 0.1, 0.42); oilCan.g.add(lOil);

    // 日曆
    let day = 0, playing = false, protectDone = false;
    const cal = new THREE.Group();
    const page = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 0.12), K.stdMat('#fff7d6', 0.8)); page.position.y = 0.3;
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.13, 0.14), K.stdMat('#ef4444', 0.6)); strip.position.y = 0.53;
    cal.add(page, strip); cal.rotation.x = -0.2; cal.position.set(3.05, T, -0.9); scene.add(cal);
    const dayLab = api.label((lang) => (lang === 'zh' ? `第 ${Math.floor(day)} 日` : `Day ${Math.floor(day)}`), { border: '#ef4444', h: 0.3 }); dayLab.position.set(3.05, T + 1.0, -0.9);
    api.tap(cal, () => fastForward(), { zh: '日曆：快轉時間', en: 'Calendar: fast-forward time' }, [dayLab]);

    const open = [false, false, false], opened = [false, false, false];
    const S = () => api.state({ day: Math.floor(day), protectDone, opened: opened.filter(Boolean).length });
    let shownDay = -1;
    function setDay(v) {
      day = v;
      const kC = K.smooth(0.3, 6, Math.min(v, 7) + Math.max(0, v - 7) * 0.3), kB = 0.12 * K.smooth(0.3, 6, Math.min(v, 7));
      rustNail(nails[2], patchC, kC); rustNail(nails[1], patchB, kB);
      flakes.count = Math.floor(K.smooth(1.5, 7, v) * 30);
      tubes[2].mat.color.copy(WATER).lerp(RUSTWATER, kC * 0.55);
      const k2 = K.smooth(7.3, 13, v);
      rustNail(dishes[0].n, dishes[0].patch, k2);
      dishes.forEach((d, i) => { if (i > 0 && !d.prot) rustNail(d.n, d.patch, k2); });
      const dd = Math.floor(v);
      if (dd !== shownDay) { shownDay = dd; dayLab.userData.refresh(); S(); }
    }
    setDay(0);

    // 打開：拎起個塞；實驗做完（第 7 日後）先會連鐵釘拎出嚟睇
    function toggleTube(i, want) {
      const willOpen = want ?? !open[i];
      if (willOpen === open[i]) return Promise.resolve();
      open[i] = willOpen;
      const n0 = nails[i].g.position.y, n1 = willOpen && day >= 7 ? nailBase[i] + 1.55 : nailBase[i];
      const s0 = stoppers[i] ? (stoppers[i].position.y - H - 0.04) / 0.6 : 0, s1 = willOpen ? 1 : 0;
      return tw.to(0.8, (k) => {
        const s = s0 + (s1 - s0) * k;
        if (stoppers[i]) { stoppers[i].position.y = H + 0.04 + 0.6 * s; stoppers[i].rotation.x = 0.5 * s; }
        nails[i].g.position.y = n0 + (n1 - n0) * k;
      });
    }
    function inspect(i) {
      if (playing) return;
      if (!open[i]) {
        api.emit('tube' + 'ABC'[i] + (day >= 7 ? '_after' : ''));
        if (!opened[i]) { opened[i] = true; S(); if (opened.every(Boolean)) { api.done('inspect'); api.emit('allOpen'); } }
      }
      toggleTube(i);
    }
    async function sealAll() {
      if (!open.some(Boolean)) return false;
      api.emit('ff_seal');
      await Promise.all([0, 1, 2].map((i) => toggleTube(i, false)));
      await api.waitSpeech();
      return true;
    }
    const NIGHT = new THREE.Color('#1e2a4a');
    async function fastForward() {
      if (playing) return;
      const goal = day < 7 ? 7 : protectDone && day < 14 ? 14 : null;
      if (goal === null) { api.emit(day >= 14 ? 'weekOver' : 'needProtect'); return; }
      playing = true;
      await sealAll();
      api.emit('ff_go');
      const from = day;
      await tw.to(6 * (goal - from) / 7, (e, k) => {
        const v = from + (goal - from) * k; setDay(v);
        const n = (0.5 - 0.5 * Math.cos(v * Math.PI * 2)) * 0.85;
        scene.background.copy(api.room.dayBg).lerp(NIGHT, n); api.room.sun.intensity = 1.55 * (1 - 0.7 * n);
      }, K.lin);
      scene.background.copy(api.room.dayBg); api.room.sun.intensity = 1.55;
      setDay(goal); await api.waitSpeech(); playing = false;
      if (goal === 7) { api.emit('ff_done1'); api.done('week1'); } else { api.emit('ff_done2'); api.done('week2'); }
    }
    async function slide(v) {
      if (playing) return;
      const max = protectDone ? 14 : 7; v = Math.max(0, Math.min(max, v));
      if (v !== day && open.some(Boolean)) { playing = true; await sealAll(); playing = false; }
      setDay(v);
      if (v >= 7) api.done('week1');
      if (v >= 14) api.done('week2');
    }
    // 防鏽
    let pbusy = false;
    async function protect(kind, h) {
      const i = kind === 'paint' ? 1 : 2; const d = dishes[i];
      if (pbusy || d.prot || day > 7) return false;
      pbusy = true;
      const obj = h.obj;
      if (kind === 'paint') {
        await K.moveTo(tw, obj, V3(dxs[i] - 0.35, T + 0.35, dz), 0, 0.5);
        await tw.to(1.4, (k, raw) => { obj.position.x = dxs[i] - 0.35 + Math.sin(raw * Math.PI * 3) * 0.3; d.n.mat.color.copy(GREY).lerp(new THREE.Color('#2563eb'), raw); });
        d.n.mat.roughness = 0.5; d.n.mat.metalness = 0;
      } else {
        const target = V3(dxs[i], T + 0.3, dz);
        await K.moveTo(tw, obj, K.tipPose(V2(0, 0.7), 2.0, target), 2.0, 0.6);
        await tw.to(1.2, (k) => { d.n.mat.color.copy(GREY).lerp(new THREE.Color('#d4b04a'), k * 0.6); d.n.mat.roughness = 0.3 - 0.2 * k; });
      }
      d.prot = kind; dishLabs[i].userData.refresh();
      api.emit(kind === 'paint' ? 'pr_paint' : 'pr_oil');
      await h.returnHome();
      pbusy = false;
      if (dishes[1].prot && dishes[2].prot) { protectDone = true; S(); api.done('protect'); }
    }
    const hBr = api.drag(brush, { label: { zh: '油漆', en: 'Paint' }, lift: 0.5, enabled: () => !pbusy && !dishes[1].prot && day <= 7,
      targets: () => [{ key: 'd1', pos: V3(dxs[1], T + 0.1, dz), r: 0.6, ringY: T, accept: () => !dishes[1].prot }], onDrop: (tg, h) => protect('paint', h), onTap: () => hBr.dropOn('d1') });
    const hOil = api.drag(oilCan.g, { label: { zh: '油', en: 'Oil' }, lift: 0.6, enabled: () => !pbusy && !dishes[2].prot && day <= 7,
      targets: () => [{ key: 'd2', pos: V3(dxs[2], T + 0.1, dz), r: 0.6, ringY: T, accept: () => !dishes[2].prot }], onDrop: (tg, h) => protect('oil', h), onTap: () => hOil.dropOn('d2') });
    tubes.forEach((v, i) => api.tap(v.group, () => inspect(i), names[i], [tubeLabs[i]]));

    return {
      cam: { pos: [0.15, 4.3, 5.7], target: [0.15, 1.65, -0.1], fitW: 6.9 },
      inspect, fastForward, slide,
      paint: () => hBr.dropOn('d1'), oil: () => hOil.dropOn('d2'),
      async demo(id) {
        if (id === 'inspect') for (let i = 0; i < 3; i++) { if (!opened[i]) { inspect(i); await tw.wait(0.9); await api.waitSpeech(); } }
        if (id === 'week1' || id === 'week2') await fastForward();
        if (id === 'protect') {
          while (pbusy) await tw.wait(0.1);
          if (!dishes[1].prot) { await hBr.dropOn('d1'); await api.waitSpeech(); }
          while (pbusy) await tw.wait(0.1);
          if (!dishes[2].prot) await hOil.dropOn('d2');
        }
      },
      getHint(id) {
        if (id === 'inspect') { const i = opened.findIndex((o) => !o); return i < 0 ? null : { from: K.worldOf(tubes[i].group, 1.2) }; }
        if (id === 'week1' || id === 'week2') return { from: K.worldOf(cal, 0.4) };
        if (id === 'protect') return !dishes[1].prot ? { from: K.worldOf(brush, 0.4), to: V3(dxs[1], T + 0.1, dz) } : { from: K.worldOf(oilCan.g, 0.5), to: V3(dxs[2], T + 0.1, dz) };
        return null;
      },
      reset() {
        tw.clear(); playing = false; pbusy = false; protectDone = false;
        scene.background.copy(api.room.dayBg); api.room.sun.intensity = 1.55;
        [0, 1, 2].forEach((i) => { open[i] = false; opened[i] = false; nails[i].g.position.y = nailBase[i]; });
        stoppers.forEach((s) => { s.position.y = H + 0.04; s.rotation.x = 0; });
        dishes.forEach((d) => { d.prot = null; d.n.mat.color.copy(GREY); d.n.mat.roughness = 0.3; d.n.mat.metalness = 0.75; });
        dishLabs.forEach((l) => l.userData.refresh());
        [hBr, hOil].forEach((h) => { h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.busy = false; });
        shownDay = -1; setDay(0);
      },
    };
  },
};
