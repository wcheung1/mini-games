/* Topic 9.2 物質的檢測：焰色試驗（煙花顏色嘅秘密） */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V2, V3 } = K;

const SALTS = [
  { id: 'na', zh: '鈉', en: 'Sodium', salt: '#f8fafc', flame: '#ffb000', op: 0.95, czh: '黃色', cen: 'yellow-orange' },
  { id: 'k', zh: '鉀', en: 'Potassium', salt: '#f8fafc', flame: '#c4a1ff', op: 0.5, czh: '淡紫色', cen: 'lilac' },
  { id: 'ca', zh: '鈣', en: 'Calcium', salt: '#f8fafc', flame: '#d9381e', op: 0.9, czh: '磚紅色', cen: 'brick red' },
  { id: 'cu', zh: '銅', en: 'Copper', salt: '#3fa796', flame: '#2dd4bf', op: 0.9, czh: '藍綠色', cen: 'blue-green' },
  { id: 'li', zh: '鋰', en: 'Lithium', salt: '#f8fafc', flame: '#c8102e', op: 0.95, czh: '深紅色', cen: 'crimson' },
];
const YELLOW = '#ffb703', BLUE = '#5b9dff';

function Panel({ S }) {
  const { pick, lang } = useApp();
  const zh = lang === 'zh';
  return html`<div className="grid gap-2 text-sm">
    <div className="rounded-xl bg-rose-50 ring-2 ring-rose-300 px-3 py-2 text-rose-800 leading-relaxed">
      <b>🔥 ${zh ? '火焰安全：' : 'Flame safety: '}</b>${zh
        ? '只可以由老師點火同處理化學品；要戴護目鏡、紮起長頭髮；燒過嘅金屬線好熱，唔好掂；喺屋企千祈唔好自己玩火同煙花。'
        : 'Only a teacher lights the burner and handles the chemicals. Wear safety goggles and tie back long hair. The wire stays hot after use, so do not touch it. Never play with fire or fireworks at home.'}
    </div>
    <div className="grid grid-cols-5 gap-1.5">
      ${SALTS.map((s) => html`<div key=${s.id} className="rounded-xl bg-slate-50 ring-1 ring-slate-200 px-1 py-2 text-center">
        <div className="font-bold text-slate-700 leading-tight">${pick(s)}</div>
        ${S[s.id] ? html`<div className="mt-1 flex flex-col items-center gap-0.5">
          <span className="w-6 h-6 rounded-full inline-block ring-2 ring-white shadow" style=${{ background: s.flame }}></span>
          <span className="text-xs text-slate-600 leading-tight">${zh ? s.czh : s.cen}</span></div>` : html`<div className="mt-1 text-slate-400">—</div>`}
      </div>`)}
    </div>
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    ${SALTS.map((s, i) => html`<g key=${s.id}>
      <path d=${`M${22 + i * 39} 96 c-12 -14 -8 -34 0 -52 c8 18 12 38 0 52z`} fill=${s.flame} />
      <path d=${`M${22 + i * 39} 96 c-5 -7 -4 -16 0 -24 c4 8 5 17 0 24z`} fill="#fff" fillOpacity=".7" />
    </g>`)}
    ${[[40, 18], [100, 12], [160, 20]].map(([x, y], i) => html`<g key=${x} stroke=${['#c8102e', '#ffb000', '#2dd4bf'][i]} strokeWidth="2.5" strokeLinecap="round">
      ${[0, 1, 2, 3, 4, 5].map((k) => { const a = (k / 6) * Math.PI * 2; return html`<line key=${k} x1=${x + Math.cos(a) * 3} y1=${y + Math.sin(a) * 3} x2=${x + Math.cos(a) * 10} y2=${y + Math.sin(a) * 10} />`; })}
    </g>`)}
  </svg>`;
}

const events = {
  air: { zh: '進氣孔打開咗！多咗空氣入去，搖搖擺擺嘅黃色火，變成穩定嘅藍色火焰。', en: 'The air hole is open! With more air going in, the wobbly yellow flame turns into a steady blue flame.' },
  f_na: { zh: '鈉：火焰變成好鮮豔嘅黃色！以前好多街燈嘅橙黃色光，就係鈉發出嘅。', en: 'Sodium: the flame turns a bright yellow-orange! The orange glow of many old street lights came from sodium.' },
  f_k: { zh: '鉀：火焰變成好淡嘅紫色，要好細心先睇到。', en: 'Potassium: the flame turns a very pale purple called lilac. Look carefully!' },
  f_ca: { zh: '鈣：火焰變成磚紅色，即係帶啲橙嘅紅色。', en: 'Calcium: the flame turns brick red, a red with a bit of orange.' },
  f_cu: { zh: '銅：火焰變成藍綠色，好靚！', en: 'Copper: the flame turns a beautiful blue-green!' },
  f_li: { zh: '鋰：火焰變成深紅色，好似紅寶石咁。', en: 'Lithium: the flame turns crimson, a deep red like a ruby.' },
  fireworks: { zh: '五種都試晒喇！將呢啲金屬放入煙花，就可以燒出五顏六色嘅煙花！', en: 'All five done! Put these metals into fireworks, and they burst into all these colours!' },
  burner: { zh: '呢個係本生燈，用煤氣燒。只可以由老師點火同調校。', en: 'This is a Bunsen burner. It burns gas. Only a teacher may light it and adjust it.' },
  collar: { zh: '進氣孔已經開咗，而家係藍色火焰。', en: 'The air hole is already open, so the flame is blue.' },
  goggles: { zh: '做火焰實驗一定要戴護目鏡，保護眼睛。', en: 'Always wear safety goggles for flame experiments to protect your eyes.' },
  firesign: { zh: '小心火！紮起長頭髮，唔好將紙張同衣袖放近火焰。', en: 'Careful, fire! Tie back long hair and keep paper and sleeves away from the flame.' },
  board: { zh: '黑色隔熱板放喺火焰後面，令火焰嘅顏色睇得更清楚。', en: 'The black heat-proof board behind the flame makes its colour easier to see.' },
  s_na: { zh: '呢碟係氯化鈉，即係我哋食嘅鹽。', en: 'This dish holds sodium chloride, the salt we eat.' },
  s_k: { zh: '呢碟係氯化鉀，一種含鉀嘅鹽。', en: 'This dish holds potassium chloride, a salt containing potassium.' },
  s_ca: { zh: '呢碟係氯化鈣，一種含鈣嘅鹽。', en: 'This dish holds calcium chloride, a salt containing calcium.' },
  s_cu: { zh: '呢碟係氯化銅，係藍綠色嘅粉。', en: 'This dish holds copper chloride, a blue-green powder.' },
  s_li: { zh: '呢碟係氯化鋰，一種含鋰嘅鹽。', en: 'This dish holds lithium chloride, a salt containing lithium.' },
};

export default {
  id: 'flametest', topics: ['9.2'], accent: '#d946ef', dark: '#a21caf', bg: 'linear-gradient(135deg,#fae8ff,#e0e7ff)', Art,
  theme: { bg: '#6b7a96', wall: '#75849f', floor: '#4b5870', top: '#b08458', leg: '#3b4a63' },
  title: { zh: '焰色反應：煙花顏色嘅秘密', en: 'Flame Tests: the Secret of Firework Colours' },
  desc: { zh: '將唔同金屬放入火焰，會燒出唔同顏色！原來煙花嘅顏色係咁嚟。', en: 'Put different metals in a flame and they glow different colours! That is where firework colours come from.' },
  steps: [
    { tag: 'intro', zh: '你有冇諗過，煙花點解會有紅、黃、綠、紫咁多種顏色？秘密就係入面嘅金屬！今日我哋做「焰色試驗」，將唔同金屬嘅鹽放入火焰，睇下會變咩色。火焰好危險：真實實驗一定要由老師點火同處理化學品，要戴護目鏡、紮起長頭髮；燒過嘅金屬線好熱，唔好掂。喺屋企千祈唔好自己玩火或者煙花！後面嘅物件可以撳嚟睇介紹。',
      en: 'Have you ever wondered why fireworks come in red, yellow, green and purple? The secret is the metals inside! Today we will do flame tests: we put salts of different metals into a flame and see what colour it turns. Flames are dangerous: in a real lab, only a teacher lights the burner and handles the chemicals, and everyone wears goggles and ties back long hair. The wire gets very hot, so do not touch it. Never play with fire or fireworks at home! Tap the objects at the back to learn about them.' },
    { tag: 'try', action: { id: 'air', events: ['air'] }, zh: '老師已經點著咗本生燈，而家係黃色、搖搖擺擺嘅火。撳一下燈管下面嘅「進氣孔」，將佢打開，等多啲空氣入去。',
      en: 'The teacher has lit the Bunsen burner, and the flame is yellow and wobbly. Tap the air hole near the bottom of the burner to open it and let more air in.' },
    { tag: 'observe', zh: '進氣孔一開，火焰就變成藍色，而且幾乎冇顏色。藍色火焰比黃色火焰更熱，又唔會有黑煙。因為佢冇乜顏色，等陣金屬嘅顏色就會睇得好清楚。',
      en: 'With the air hole open, the flame turns blue and is almost colourless. A blue flame is hotter than a yellow one and makes no black soot. Because it has hardly any colour, the colours of the metals will be easy to see.' },
    { tag: 'try', action: { id: 'flame', events: ['f_'] }, zh: '將金屬線圈拖去一碟鹽，沾少少；再拖入火焰入面，睇下火變咩色。五種都要試！每次試完，我會幫你清潔線圈。',
      en: 'Drag the wire loop to a dish of salt to pick up a little, then drag it into the flame and watch the colour. Try all five! I will clean the loop for you after each test.' },
    { tag: 'observe', zh: '鈉係黃色，鉀係好淡嘅紫色，鈣係磚紅色，銅係藍綠色，鋰係深紅色。每種金屬都有自己嘅火焰顏色，好似指紋咁，所以可以用嚟認出係邊種金屬。鈉嘅黃色好強，會遮住其他顏色，所以每次都要清潔線圈。',
      en: 'Sodium is yellow-orange, potassium is lilac, calcium is brick red, copper is blue-green and lithium is crimson. Each metal has its own flame colour, like a fingerprint, so we can use it to identify the metal. Sodium\'s yellow is so strong that it can hide other colours, which is why the loop must be cleaned every time.' },
    { tag: 'feynman', zh: '用一句說話講：火嘅熱力令金屬原子入面嘅電子好興奮，跳上高啲嘅「樓梯級」。電子企唔穩，好快就跌返落嚟，跌落嚟嗰陣就放出光。每種金屬嘅樓梯級高度唔同，所以放出嘅光顏色都唔同。',
      en: 'In one sentence: the heat of the flame gets the electrons in metal atoms excited, so they jump up to a higher "step". They cannot stay there, so they quickly drop back down, giving out light as they fall. Each metal has steps of different heights, so each gives out a different colour of light.' },
    { tag: 'first', zh: '由最基本諗起：光嘅顏色代表能量嘅大細。每種元素嘅電子只可以企喺某幾級特定嘅能量，好似一把獨一無二嘅樓梯，所以每種元素放出嘅光都有自己一套顏色。科學家仲用呢個方法，研究太陽同星星由咩組成：「氦」呢種元素，最初就係喺太陽光入面發現㗎！',
      en: 'Back to basics: the colour of light tells us how much energy it carries. The electrons of each element can only sit on certain energy levels, like a staircase that is unique to that element, so each element gives out its own set of colours. Scientists even use this to find out what the Sun and stars are made of: the element helium was first discovered in sunlight!' },
    { tag: 'life', zh: '生活應用：煙花入面加咗唔同嘅金屬化合物：鍶同鋰令煙花變紅，鈉令佢變黃，鋇變綠，銅變藍，鈣變橙。另外，煲湯嗰陣如果湯瀉咗落煤氣爐，火會變黃，就係因為湯入面有鹽！記住：睇煙花要喺安全距離睇，千祈唔好自己玩煙花或者爆竹。',
      en: 'Everyday life: fireworks contain different metal compounds: strontium and lithium make red, sodium makes yellow, barium makes green, copper makes blue and calcium makes orange. And if soup boils over onto a gas cooker, the flame turns yellow because of the salt in the soup! Remember: watch fireworks from a safe distance, and never play with fireworks or firecrackers yourself.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '煲湯嗰陣，湯瀉咗落煤氣爐，藍色嘅火即刻變咗黃色。點解？', en: 'While cooking soup, some boils over onto the gas cooker, and the blue flame suddenly turns yellow. Why?' },
    options: [
      { zh: '因為湯太熱', en: 'Because the soup is too hot' },
      { zh: '因為湯入面有鹽，鹽入面嘅鈉令火焰變黃', en: 'Because the soup contains salt, and the sodium in salt turns the flame yellow' },
      { zh: '因為煤氣就快用完', en: 'Because the gas is running out' },
    ],
    correct: 1,
    right: { zh: '啱！食鹽係氯化鈉，鈉一入火就會發出黃色光，同我哋嘅焰色試驗一樣。', en: 'Right! Table salt is sodium chloride, and sodium glows yellow in a flame, just like in our flame test.' },
    wrong: { zh: '再諗下：邊種金屬喺焰色試驗會令火變黃？湯入面有咩含有呢種金屬？', en: 'Think again: which metal turned the flame yellow in our test? What in soup contains that metal?' },
  },
  tools: [
    { id: 'a', label: { zh: '打開進氣孔', en: 'Open the air hole' }, run: (c) => c.openAir() },
    { id: 'f', label: { zh: '測試下一種鹽', en: 'Test the next salt' }, run: (c) => c.testNext() },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = { air: false }; SALTS.forEach((s) => { S[s.id] = false; });
    const push = () => api.state({ ...S });
    const BZ = -0.3;
    // 黑色隔熱板
    const board = new THREE.Mesh(new K.RoundedBoxGeometry(2.4, 1.9, 0.06, 2, 0.03), K.stdMat('#111827', 0.9)); board.position.set(0, T + 0.95, -1.05); scene.add(board);
    api.tap(board, () => api.emit('board'), { zh: '隔熱板', en: 'Heat-proof board' });
    // 本生燈
    const burner = new THREE.Group(); burner.position.set(0, T, BZ); scene.add(burner);
    const steel = K.stdMat('#94a3b8', 0.3, 0.8);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.07, 32), K.stdMat('#334155', 0.5, 0.4)); base.position.y = 0.035; burner.add(base);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.76, 20), steel); barrel.position.y = 0.45; burner.add(barrel);
    const collar = new THREE.Group(); collar.position.y = 0.2; burner.add(collar);
    const collarM = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.13, 24), K.stdMat('#cbd5e1', 0.25, 0.9)); collar.add(collarM);
    const hole = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.02), K.stdMat('#0f172a', 0.8)); hole.position.set(0, 0, 0.085); hole.scale.x = 0.15; collar.add(hole);
    const hose = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3(0.2, 0.05, 0), V3(0.6, 0.04, -0.2), V3(1.0, 0.04, -0.6)]), 20, 0.03, 8), K.stdMat('#f97316', 0.6)); burner.add(hose);
    const lBurner = api.label({ zh: '本生燈', en: 'Bunsen burner' }, { border: '#64748b', h: 0.16 }); lBurner.position.set(0.55, T + 0.12, BZ + 0.35);
    const lCollar = api.label({ zh: '進氣孔', en: 'Air hole' }, { border: '#d946ef', h: 0.15 }); lCollar.position.set(-0.45, T + 0.22, BZ + 0.15);
    api.tap(base, () => api.emit('burner'), { zh: '本生燈', en: 'Bunsen burner' }, [barrel, hose, lBurner]);
    // 火焰
    const FY = 0.83;
    const flame = new THREE.Group(); flame.position.set(0, T + FY, BZ); scene.add(flame);
    const addMat = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending });
    const outer = new THREE.Mesh(new THREE.ConeGeometry(0.09, 1, 24, 1, true), addMat(YELLOW, 0.85)); outer.renderOrder = 6; flame.add(outer);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.045, 1, 20, 1, true), addMat('#bfdbfe', 0)); inner.renderOrder = 7; flame.add(inner);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: K.softCircleTexture(), color: YELLOW, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.position.y = 0.3; glow.scale.setScalar(1.0); glow.renderOrder = 5; flame.add(glow);
    const fLight = new THREE.PointLight(YELLOW, 1.5, 4); fLight.position.y = 0.3; flame.add(fLight);
    // 火焰狀態：h = 高度，col = 顏色，op = 透明度，blue = 0 黃火 / 1 藍火
    const fs = { h: 0.75, col: new THREE.Color(YELLOW), op: 0.85, blue: 0 };
    const cY = new THREE.Color(YELLOW), cB = new THREE.Color(BLUE), col = new THREE.Color();
    const flamePt = V3(0, T + FY + 0.12, BZ);

    // 五碟鹽（錶面玻璃）
    const dxs = [-1.7, -0.85, 0, 0.85, 1.7], DZ = 0.75;
    const glassMat = new THREE.MeshPhysicalMaterial({ color: '#e0f2fe', roughness: 0.1, transparent: true, opacity: 0.55, side: THREE.DoubleSide, clearcoat: 1 });
    const dishes = SALTS.map((s, i) => {
      const g = new THREE.Group(); g.position.set(dxs[i], T, DZ); scene.add(g);
      const wg = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 8, 0, Math.PI * 2, Math.PI * 0.82, Math.PI * 0.18), glassMat); wg.position.y = 0.5; g.add(wg);
      const pile = new THREE.Mesh(new THREE.SphereGeometry(0.12, 18, 10), K.stdMat(s.salt, 0.95)); pile.scale.set(1, 0.32, 1); pile.position.y = 0.035; g.add(pile);
      const lab = api.label(s, { border: s.flame, h: 0.17 }); lab.position.set(dxs[i], T + 0.08, DZ + 0.42);
      api.tap(g, () => api.emit('s_' + s.id), { zh: s.zh, en: s.en }, [lab]);
      return { g, pos: V3(dxs[i], T + 0.06, DZ) };
    });
    // 後排：護目鏡、安全牌
    const gog = new THREE.Group(); gog.position.set(-2.6, T + 0.06, -0.9); scene.add(gog);
    const gogMat = new THREE.MeshPhysicalMaterial({ color: '#a5f3fc', roughness: 0.1, transparent: true, opacity: 0.6, clearcoat: 1 });
    [-0.13, 0.13].forEach((x) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 24), gogMat); l.rotation.x = Math.PI / 2; l.position.x = x; gog.add(l); });
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.015, 8, 30, Math.PI), K.stdMat('#1e293b', 0.6)); strap.rotation.x = -Math.PI / 2; strap.position.z = -0.02; gog.add(strap);
    const sign = new THREE.Group(); sign.position.set(2.6, T, -0.95); scene.add(sign);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8), K.stdMat('#64748b', 0.5)); pole.position.y = 0.25; sign.add(pole);
    const tri = new THREE.Mesh(new THREE.CircleGeometry(0.22, 3), K.stdMat('#facc15', 0.5)); tri.rotation.z = Math.PI / 2; tri.position.set(0, 0.62, 0.02); sign.add(tri);
    const signLab = api.label({ zh: '🔥 小心火', en: '🔥 Fire!' }, { border: '#ef4444', h: 0.16 }); signLab.position.set(2.6, T + 1.0, -0.95);
    const gogLab = api.label({ zh: '護目鏡', en: 'Goggles' }, { border: '#94a3b8', h: 0.15 }); gogLab.position.set(-2.6, T + 0.4, -0.9);
    api.tap(gog, () => api.emit('goggles'), { zh: '護目鏡', en: 'Safety goggles' }, [gogLab]);
    api.tap(sign, () => api.emit('firesign'), { zh: '小心火', en: 'Fire warning' }, [signLab]);

    // 工具：金屬線圈（線圈喺 (0, 0.8)）
    const loop = new THREE.Group(); loop.position.set(2.55, T + 0.06, 0.65); scene.add(loop);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.32, 12), K.stdMat('#1f2937', 0.6)); handle.position.y = 0.16; loop.add(handle);
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.46, 6), K.stdMat('#d1d5db', 0.3, 0.9)); wire.position.y = 0.55; loop.add(wire);
    const ringM = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.007, 6, 18), K.stdMat('#d1d5db', 0.3, 0.9)); ringM.position.y = 0.81; loop.add(ringM);
    const sample = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 8), K.stdMat('#ffffff', 0.9)); sample.position.y = 0.81; sample.visible = false; loop.add(sample);
    const holder = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.12, 20), K.stdMat('#64748b', 0.5)); holder.position.set(2.55, T + 0.06, 0.65); scene.add(holder);
    const lLoop = api.label({ zh: '金屬線圈', en: 'Wire loop' }, { border: '#d946ef', h: 0.17 }); lLoop.position.set(0, -0.02, 0.4); loop.add(lLoop);
    const TIP = V2(0, 0.81);

    // 煙花粒子
    const FW = 300;
    const fwGeo = new THREE.BufferGeometry();
    const fwPos = new Float32Array(FW * 3), fwCol = new Float32Array(FW * 3), fwVel = new Float32Array(FW * 3);
    fwGeo.setAttribute('position', new THREE.BufferAttribute(fwPos, 3)); fwGeo.setAttribute('color', new THREE.BufferAttribute(fwCol, 3));
    const fwMat = new THREE.PointsMaterial({ size: 0.09, map: K.softCircleTexture(), vertexColors: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    const fw = new THREE.Points(fwGeo, fwMat); fw.frustumCulled = false; fw.visible = false; scene.add(fw);
    let fwT = -1;
    function launchFireworks() {
      const c = new THREE.Color();
      for (let i = 0; i < FW; i++) {
        const b = i % SALTS.length, cx = (b - 2) * 0.55, cy = T + 2.1 + (b % 2) * 0.35;
        c.set(SALTS[b].flame);
        const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), sp = 0.7 + Math.random() * 0.5;
        fwPos.set([cx, cy, BZ - 0.2], i * 3); fwCol.set([c.r, c.g, c.b], i * 3);
        fwVel.set([Math.sin(ph) * Math.cos(th) * sp, Math.cos(ph) * sp, Math.sin(ph) * Math.sin(th) * sp * 0.5], i * 3);
      }
      fwGeo.attributes.position.needsUpdate = true; fwGeo.attributes.color.needsUpdate = true;
      fw.visible = true; fwT = 0;
    }

    let busy = false, loaded = -1;
    const nextSalt = () => SALTS.findIndex((s) => !S[s.id]);
    async function openAir() {
      if (busy || S.air) return false; busy = true;
      await tw.to(1.2, (k) => { collar.rotation.y = k * Math.PI * 0.5; hole.scale.x = 0.15 + 0.85 * k; fs.blue = k; });
      fs.col.set(BLUE); fs.h = 0.45; fs.op = 0.4;
      S.air = true; push(); api.emit('air'); api.done('air');
      busy = false;
    }
    async function pickSalt(i, h) {
      if (busy || !S.air || loaded >= 0 || S[SALTS[i].id]) return false; busy = true;
      const p = dishes[i].pos;
      await K.moveTo(tw, loop, K.tipPose(TIP, 1.0, V3(p.x, p.y + 0.25, p.z)), 1.0, 0.45);
      await K.moveTo(tw, loop, K.tipPose(TIP, 1.0, p), 1.0, 0.3);
      loaded = i; sample.material.color.set(SALTS[i].salt); sample.visible = true;
      await K.moveTo(tw, loop, K.tipPose(TIP, 1.0, V3(p.x, p.y + 0.3, p.z)), 1.0, 0.3);
      await h.returnHome();
      busy = false;
    }
    async function burn(h) {
      if (busy || loaded < 0) return false; busy = true;
      const s = SALTS[loaded];
      await K.moveTo(tw, loop, K.tipPose(TIP, 1.15, flamePt), 1.15, 0.6);
      const c0 = new THREE.Color(BLUE), c1 = new THREE.Color(s.flame);
      api.emit('f_' + s.id);
      await tw.to(0.5, (k) => { fs.col.copy(c0).lerp(c1, k); fs.op = 0.4 + (s.op - 0.4) * k; fs.h = 0.45 + 0.2 * k; });
      S[s.id] = true; push();
      await tw.wait(2.6);
      sample.visible = false; loaded = -1; // 「清潔」線圈
      await tw.to(0.8, (k) => { fs.col.copy(c1).lerp(c0, k); fs.op = s.op + (0.4 - s.op) * k; fs.h = 0.65 - 0.2 * k; });
      await h.returnHome();
      busy = false;
      if (nextSalt() < 0) { api.done('flame'); launchFireworks(); api.emit('fireworks'); }
    }
    const hLoop = api.drag(loop, {
      label: { zh: '金屬線圈', en: 'Wire loop' }, lift: 0.9, extra: [holder], enabled: () => !busy && S.air,
      targets: () => (loaded >= 0
        ? [{ key: 'fl', pos: flamePt, r: 0.5, ringY: T, accept: () => loaded >= 0 }]
        : SALTS.map((s, i) => ({ key: 'd' + i, pos: dishes[i].pos, r: 0.38, ringY: T, accept: () => !S[s.id] && loaded < 0 }))),
      onDrop: (tg, h) => (tg.key === 'fl' ? burn(h) : pickSalt(Number(tg.key.slice(1)), h)),
      onTap: () => { if (busy || !S.air) return; if (loaded >= 0) hLoop.dropOn('fl'); else { const i = nextSalt(); if (i >= 0) hLoop.dropOn('d' + i); } },
    });
    api.tap(collarM, () => (S.air ? api.emit('collar') : openAir()), { zh: '進氣孔', en: 'Air hole' }, [hole, lCollar]);

    async function testNext() {
      if (!S.air || busy) return;
      if (loaded < 0) { const i = nextSalt(); if (i < 0) return; await hLoop.dropOn('d' + i); }
      while (busy) await tw.wait(0.1);
      await hLoop.dropOn('fl');
    }
    push();
    return {
      cam: { pos: [0, 3.7, 4.9], target: [0, 1.5, -0.1], fitW: 6.2 },
      openAir, testNext,
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (id === 'air') await openAir();
        if (id === 'flame') {
          for (let n = 0; n < 10 && nextSalt() >= 0; n++) { while (busy) await tw.wait(0.1); await testNext(); await api.waitSpeech(); }
        }
      },
      getHint(id) {
        if (busy) return null;
        if (id === 'air') return S.air ? null : { from: K.worldOf(collarM, 0.02) };
        if (id === 'flame') {
          if (!S.air) return null;
          if (loaded >= 0) return { from: K.worldOf(loop, 0.2), to: flamePt };
          const i = nextSalt(); return i < 0 ? null : { from: K.worldOf(loop, 0.2), to: dishes[i].pos };
        }
        return null;
      },
      update(dt, t) {
        // 黃火：高、搖擺、偏黃；藍火：矮、穩定、淡藍（測試時用 fs.col）
        const b = fs.blue, wob = (1 - b) * (Math.sin(t * 11) * 0.08 + Math.sin(t * 17) * 0.05);
        const testing = loaded >= 0 || busy ? 1 : 0;
        if (b < 1) col.copy(cY).lerp(cB, b); else col.copy(fs.col);
        const h = b < 1 ? 0.75 - 0.3 * b : fs.h;
        const op = b < 1 ? 0.85 - 0.45 * b : fs.op;
        outer.scale.set(1 + wob, h * (1 + wob + Math.sin(t * 23) * 0.03), 1 - wob); outer.position.set(Math.sin(t * 5) * 0.02 * (1 - b), h / 2, 0);
        outer.material.color.copy(col); outer.material.opacity = op;
        inner.scale.set(1, 0.18 * b + 0.001, 1); inner.position.y = 0.09 * b; inner.material.opacity = 0.8 * b;
        glow.material.color.copy(col); glow.material.opacity = 0.25 + 0.45 * op; glow.position.y = h * 0.45; glow.scale.setScalar(0.7 + h);
        fLight.color.copy(col); fLight.intensity = 0.6 + 1.6 * op + testing * 0.3;
        if (fwT >= 0) {
          fwT += dt;
          for (let i = 0; i < FW; i++) { fwVel[i * 3 + 1] -= dt * 0.9; for (let a = 0; a < 3; a++) fwPos[i * 3 + a] += fwVel[i * 3 + a] * dt; }
          fwGeo.attributes.position.needsUpdate = true;
          fwMat.opacity = fwT < 0.2 ? fwT / 0.2 : Math.max(0, 1 - (fwT - 0.2) / 2.0);
          if (fwT > 2.3) { fwT = -1; fw.visible = false; }
        }
      },
      reset() {
        tw.clear(); busy = false; loaded = -1; fwT = -1; fw.visible = false;
        SALTS.forEach((s) => { S[s.id] = false; }); S.air = false; push();
        Object.assign(fs, { h: 0.75, op: 0.85, blue: 0 }); fs.col.set(YELLOW);
        collar.rotation.y = 0; hole.scale.x = 0.15; sample.visible = false;
        hLoop.obj.position.copy(hLoop.home); hLoop.obj.rotation.copy(hLoop.homeRot); hLoop.busy = false;
      },
    };
  },
};
