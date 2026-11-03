/* Topic 3.1 金屬的存在和提取：用碳由氧化銅提取銅 */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V2, V3 } = K;

function Panel({ S }) {
  const { lang } = useApp();
  const zh = lang === 'zh';
  const row = (label, val) => html`<div className="flex items-center gap-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2"><b className="flex-1 text-slate-700">${label}</b><span className="text-slate-600">${val}</span></div>`;
  return html`<div className="grid gap-1.5 text-sm">
    ${row(zh ? '⚫ 氧化銅（黑色粉末）' : '⚫ Copper oxide (black powder)', S.cuo ? '✅' : '—')}
    ${row(zh ? '◼️ 碳粉' : '◼️ Carbon powder', S.c ? '✅' : '—')}
    ${row(zh ? '🔥 加熱' : '🔥 Heating', S.heat ? (zh ? '發出紅光 ✅' : 'glowed red ✅') : '—')}
    ${row(zh ? '🧪 石灰水' : '🧪 Limewater', S.heat ? (zh ? '變奶白 → 有二氧化碳' : 'milky → carbon dioxide') : '—')}
    ${row(zh ? '🟠 倒出嚟' : '🟠 Poured out', S.pour ? (zh ? '紅啡色嘅銅粒 ✅' : 'red-brown copper bits ✅') : '—')}
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    <path d="M40 70 l30 -40 l18 -6 l-4 18 l-30 40 a10 10 0 0 1 -14 -12z" fill="#57534e" />
    <path d="M60 40 l6 -8 l8 6" stroke="#2f7f6f" strokeWidth="5" fill="none" />
    <path d="M100 55 h22 l-6 -6 m6 6 l-6 6" stroke="#64748b" strokeWidth="4" fill="none" strokeLinecap="round" />
    ${[[150, 60], [165, 52], [158, 72], [175, 66], [143, 74]].map(([x, y]) => html`<circle key=${x + '' + y} cx=${x} cy=${y} r="7" fill="#c46a35" stroke="#7c2d12" strokeWidth="2" />`)}
  </svg>`;
}

const events = {
  mx_cuo: { zh: '黑色嘅氧化銅倒咗入試管。', en: 'The black copper oxide is in the test tube.' },
  mx_c: { zh: '碳粉倒咗入試管。', en: 'The carbon powder is in the test tube.' },
  mixAll: { zh: '混合好喇！我幫你塞好膠塞，駁好導管去石灰水。', en: 'Mixed! I have put in the stopper and connected the tube to the limewater.' },
  hx_need: { zh: '要先將氧化銅同碳粉倒入試管，先好加熱。', en: 'Put the copper oxide and carbon into the test tube first, then heat.' },
  hx_on: { zh: '開始加熱……留意試管同石灰水。', en: 'Heating… Watch the test tube and the limewater.' },
  hx_done: { zh: '混合物發出紅光！石灰水冒泡變奶白色，證明有二氧化碳產生。', en: 'The mixture glows red! The limewater bubbles and turns milky, so carbon dioxide has been made.' },
  po_need: { zh: '要先加熱，等試管凍咗先好倒出嚟。', en: 'Heat it first, and let the tube cool before pouring.' },
  po_copper: { zh: '睇！黑色粉末入面有好多紅啡色、亮晶晶嘅銅粒！', en: 'Look! The black powder has lots of shiny red-brown bits of copper in it!' },
  burner: { zh: '本生燈由老師點火同調校。加熱完嘅試管好熱，唔好掂。', en: 'A teacher lights and adjusts the Bunsen burner. The heated test tube is very hot, so do not touch it.' },
  ore: { zh: '呢塊係孔雀石，係一種含銅嘅礦石，綠色好靚。', en: 'This is malachite, a beautiful green ore that contains copper.' },
  gold: { zh: '金好唔活潑，喺大自然可以直接搵到一粒粒嘅金，唔使提取。', en: 'Gold is so unreactive that it can be found as nuggets in nature, with no extraction needed.' },
  alu: { zh: '鋁好活潑，要用電解先提取到。兩百年前，鋁曾經比金仲貴！', en: 'Aluminium is very reactive and must be extracted by electrolysis. About two hundred years ago it was even more precious than gold!' },
  lime: { zh: '石灰水用嚟測試有冇二氧化碳產生。', en: 'The limewater tests whether carbon dioxide is made.' },
};

export default {
  id: 'extract', topics: ['3.1'], accent: '#b45309', dark: '#7c2d12', bg: 'linear-gradient(135deg,#ffedd5,#e7e5e4)', Art,
  title: { zh: '由石頭變金屬', en: 'From Rock to Metal' },
  desc: { zh: '金屬藏喺礦石入面！用碳將氧化銅變返閃亮嘅銅，認識人類點樣提取金屬。', en: 'Metals hide inside rocks! Use carbon to turn copper oxide back into shiny copper and learn how people extract metals.' },
  steps: [
    { tag: 'intro', zh: '金屬喺大自然入面點樣存在？除咗金同少量嘅銀同銅，大部分金屬都同氧等元素結合埋，藏喺「礦石」入面。今日我哋由黑色嘅氧化銅（代表礦石）提取出銅！安全提提你：加熱由老師做，要戴護目鏡；試管加熱之後好熱，唔好掂。後面嘅物件可以撳嚟睇介紹。',
      en: 'How are metals found in nature? Apart from gold and small amounts of silver and copper, most metals are joined to other elements such as oxygen and hidden inside rocks called ores. Today we will extract copper from black copper oxide, which stands in for an ore! Safety first: a teacher does the heating, everyone wears goggles, and the heated tube is very hot, so do not touch it. Tap the objects at the back to learn about them.' },
    { tag: 'try', action: { id: 'mix', events: ['mx_'] }, zh: '將黑色嘅氧化銅粉同碳粉，逐樣拖去試管倒入去。',
      en: 'Drag the black copper oxide and the carbon powder to the test tube, one at a time.' },
    { tag: 'observe', zh: '試管入面係黑色嘅混合物，暫時睇唔到有銅。試管已經塞好膠塞，導管會將氣體帶去石灰水。',
      en: 'The tube holds a black mixture, with no copper to be seen yet. The stopper is in, and a delivery tube carries any gas to the limewater.' },
    { tag: 'try', action: { id: 'heat', events: ['hx_'] }, zh: '撳本生燈開始加熱，我哋會快轉時間。留意試管同石灰水。',
      en: 'Tap the Bunsen burner to start heating. We will fast-forward. Watch the test tube and the limewater.' },
    { tag: 'observe', zh: '混合物燒到發出紅光，石灰水冒泡變奶白色，即係有二氧化碳產生。',
      en: 'The mixture glows red, and the limewater bubbles and turns milky, which means carbon dioxide is being made.' },
    { tag: 'try', action: { id: 'pour', events: ['po_'] }, zh: '等試管凍咗，將試管拖去右邊嘅蒸發皿，倒出入面嘅嘢。',
      en: 'Once the tube has cooled, drag it to the evaporating dish on the right and pour out what is inside.' },
    { tag: 'feynman', zh: '氧化銅就係銅同氧手拖手。碳比銅更加鍾意同氧一齊，所以加熱嗰陣，碳就將氧由銅身邊「搶走」，自己變成二氧化碳飛走，剩低嘅就係銅。',
      en: 'Copper oxide is copper and oxygen holding hands. Carbon likes oxygen even more than copper does, so when heated, carbon "steals" the oxygen from copper and flies off as carbon dioxide, leaving copper behind.' },
    { tag: 'first', zh: '由最基本諗起：金屬越活潑，就越鍾意同氧結合，越難分開。金好唔活潑，大自然有現成嘅金；銅同鐵中等，可以用碳搶走氧；鋁同鈉好活潑，連碳都搶唔贏，要用電解先提取到（記得電鍍魔法嗎？）。所以人類用金屬嘅歷史，同金屬嘅活潑性有好大關係。',
      en: 'Back to basics: the more reactive a metal, the more strongly it holds on to oxygen, and the harder it is to separate. Gold is very unreactive, so it is found ready-made; copper and iron are in the middle, so carbon can steal their oxygen; aluminium and sodium are so reactive that even carbon cannot win, so electrolysis is needed (remember Electroplating Magic?). That is why the history of metals is linked to how reactive they are.' },
    { tag: 'life', zh: '生活應用：人類最先用金同銅，之後學識用碳煉銅同錫，進入「青銅時代」；再之後識得煉鐵，進入「鐵器時代」。鋁要到大約兩百年前先提取到，當年鋁曾經比金仲貴，法國皇帝拿破崙三世仲用鋁餐具招呼最尊貴嘅客人。今日我哋要回收金屬，慳返礦石同能源。',
      en: 'Everyday life: people first used gold and copper, then learned to smelt copper and tin with carbon, starting the Bronze Age; later they learned to smelt iron, starting the Iron Age. Aluminium was only extracted about two hundred years ago, and it was once more precious than gold: the French emperor Napoleon III served his most honoured guests with aluminium cutlery. Today we recycle metals to save ores and energy.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '點解人類用金同銅嘅歷史，比用鋁長好多？', en: 'Why have people used gold and copper for much longer than aluminium?' },
    options: [
      { zh: '因為鋁好難睇', en: 'Because aluminium looks ugly' },
      { zh: '因為鋁好活潑，好難由礦石提取，要用電解先得', en: 'Because aluminium is very reactive, so it is hard to extract from its ore and needs electrolysis' },
      { zh: '因為地球冇鋁', en: 'Because there is no aluminium on Earth' },
    ],
    correct: 1,
    right: { zh: '啱！其實鋁係地殼入面最多嘅金屬，不過佢同氧結合得好實，要到識得用電解先提取到。', en: 'Right! Aluminium is actually the most common metal in the Earth\'s crust, but it holds on to oxygen so tightly that it could only be extracted once electrolysis was discovered.' },
    wrong: { zh: '再諗下：金屬越活潑，同氧結合得越實定越鬆？', en: 'Think again: the more reactive a metal, the more tightly or loosely does it hold on to oxygen?' },
  },
  tools: [
    { id: 'm', label: { zh: '倒下一樣粉末', en: 'Add the next powder' }, run: (c) => c.mixNext() },
    { id: 'h', primary: true, label: { zh: '🔥 加熱', en: '🔥 Heat' }, run: (c) => c.heat() },
    { id: 'p', label: { zh: '倒出嚟', en: 'Pour out' }, run: (c) => c.pour() },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = { cuo: false, c: false, heat: false, pour: false };
    const push = () => api.state({ ...S });
    const BX = -0.5, BZ = -0.3, TBY = T + 0.72, TBH = 1.0;
    // 鐵架
    const standMat = K.stdMat('#475569', 0.4, 0.6);
    const sBase = new THREE.Mesh(new K.RoundedBoxGeometry(0.5, 0.05, 0.4, 2, 0.02), standMat); sBase.position.set(BX - 0.65, T + 0.025, BZ); scene.add(sBase);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.8, 10), standMat); rod.position.set(BX - 0.75, T + 0.9, BZ); scene.add(rod);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.04, 0.04), standMat); arm.position.set(BX - 0.38, T + 1.45, BZ); scene.add(arm);
    // 本生燈
    const burner = new THREE.Group(); burner.position.set(BX, T, BZ); scene.add(burner);
    const bBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.06, 28), K.stdMat('#334155', 0.5, 0.4)); bBase.position.y = 0.03; burner.add(bBase);
    const bBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.4, 18), K.stdMat('#94a3b8', 0.3, 0.8)); bBarrel.position.y = 0.25; burner.add(bBarrel);
    const addMat = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending });
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.065, 1, 20, 1, true), addMat('#5b9dff', 0.5)); flame.renderOrder = 6; flame.visible = false; burner.add(flame);
    const lB = api.label({ zh: '🔥 本生燈', en: '🔥 Bunsen burner' }, { border: '#64748b', h: 0.15 }); lB.position.set(BX + 0.35, T + 0.12, BZ + 0.4);
    // 試管（原點喺管底）
    const tube = new THREE.Group(); tube.position.set(BX, TBY, BZ); scene.add(tube);
    const glass = new THREE.Mesh(new THREE.LatheGeometry(K.tubeProfile(0.12, TBH), 32), K.glassMat()); glass.renderOrder = 3; tube.add(glass);
    const mixMat = new THREE.MeshStandardMaterial({ color: '#1c1917', roughness: 0.95, emissive: '#ff3d00', emissiveIntensity: 0 });
    const mix = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.07, 1, 20), mixMat); mix.position.y = 0.04; mix.scale.y = 0.001; mix.visible = false; tube.add(mix);
    const flecks = K.makeCloud(tube, { color: '#c46a35', count: 30, r: 0.08, yMin: 0.03, yMax: 0.14 });
    const stopper = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.1, 20), K.stdMat('#7c2d12', 0.8)); stopper.position.y = TBH + 0.03; stopper.visible = false; tube.add(stopper);
    const lTube = api.label({ zh: '試管', en: 'Test tube' }, { border: '#b45309', h: 0.15 }); lTube.position.set(BX + 0.32, TBY + 0.85, BZ);
    const MOUTH = V3(BX, TBY + TBH, BZ);
    // 石灰水試管同導管
    const LX = 0.85;
    const rack = K.makeRack([0], 0.2, 0.7, 0.6); rack.position.set(LX, T, BZ); scene.add(rack);
    const lime = K.makeVessel(K.tubeProfile(0.17, 1.2), { liquidColor: '#eef6fb', level: 0.62, opacity: 0.45 }); lime.group.position.set(LX, T + 0.07, BZ); scene.add(lime.group);
    const limeBub = K.makeBubbles(lime.group, { max: 80, size: 0.02 });
    const lLime = api.label({ zh: '石灰水', en: 'Limewater' }, { border: '#64748b', h: 0.15 }); lLime.position.set(LX, T + 1.5, BZ);
    api.tap(lime.group, () => api.emit('lime'), { zh: '石灰水', en: 'Limewater' }, [lLime]);
    const pipe = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3(BX, TBY + TBH + 0.06, BZ), V3(BX, TBY + TBH + 0.35, BZ), V3(LX, TBY + TBH + 0.35, BZ), V3(LX, T + 0.25, BZ)]), 60, 0.018, 8, false), K.glassMat());
    pipe.visible = false; scene.add(pipe);
    // 蒸發皿
    const DX = 2.0, DZ = 0.55;
    const dish = new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 10, 0, Math.PI * 2, Math.PI * 0.62, Math.PI * 0.38), K.stdMat('#e2e8f0', 0.4)); dish.position.set(DX, T + 0.32, DZ); scene.add(dish);
    const dishPile = K.makeCloud(scene, { color: '#292524', count: 40, r: 0.17, yMin: 0, yMax: 0.04, yBottom: 0 }); dishPile.mesh.position.set(DX, T + 0.07, DZ);
    const dishCu = K.makeCloud(scene, { color: '#c46a35', count: 34, r: 0.17, yMin: 0.02, yMax: 0.06, yBottom: 0 }); dishCu.mesh.position.set(DX, T + 0.07, DZ);
    const lDish = api.label({ zh: '蒸發皿', en: 'Evaporating dish' }, { border: '#94a3b8', h: 0.15 }); lDish.position.set(DX, T + 0.1, DZ + 0.45);
    // 粉末匙羹
    const mkSpoon = (x, color, name, border) => {
      const g = new THREE.Group(); g.position.set(x, T, 0.95); scene.add(g);
      const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.4, side: THREE.DoubleSide })); bowl.position.y = 0.16; g.add(bowl); // 下半球 = 開口向上嘅碗
      const pile = new THREE.Mesh(new THREE.SphereGeometry(0.13, 18, 8), K.stdMat(color, 0.95)); pile.scale.y = 0.35; pile.position.y = 0.15; g.add(pile);
      const l = api.label(name, { border, h: 0.15 }); l.position.set(0, -0.04, 0.32); g.add(l);
      return g;
    };
    const cuo = mkSpoon(-2.5, '#111111', { zh: '氧化銅（黑色）', en: 'Copper oxide (black)' }, '#111827');
    const carbon = mkSpoon(-1.55, '#57534e', { zh: '碳粉', en: 'Carbon powder' }, '#57534e');
    // 後排：孔雀石、金塊、鋁罐
    const ore = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 0), K.stdMat('#2f7f6f', 0.7)); ore.position.set(-2.85, T + 0.15, -1.15); scene.add(ore);
    const gold = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1, 1), K.stdMat('#f5c542', 0.25, 1)); gold.scale.set(1.3, 0.7, 1); gold.position.set(-2.2, T + 0.08, -1.2); scene.add(gold);
    const can = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.4, 24), K.stdMat('#cbd5e1', 0.25, 0.9)); can.position.set(2.85, T + 0.2, -1.15); scene.add(can);
    [[ore, 'ore', { zh: '孔雀石（銅礦）', en: 'Malachite (copper ore)' }, -2.85, 0.45], [gold, 'gold', { zh: '金塊', en: 'Gold nugget' }, -2.2, 0.3], [can, 'alu', { zh: '鋁罐', en: 'Aluminium can' }, 2.85, 0.62]].forEach(([o, ev, name, x, y]) => {
      const l = api.label(name, { border: '#94a3b8', h: 0.14 }); l.position.set(x, T + y, -1.15);
      api.tap(o, () => api.emit(ev), name, [l]);
    });

    let busy = false, heating = 0;
    const setFill = (h) => { mix.visible = h > 0; mix.scale.y = Math.max(0.001, h); mix.position.y = 0.02 + h / 2; };
    async function addPowder(which, h) {
      if (busy || S[which]) return false; busy = true;
      const obj = which === 'cuo' ? cuo : carbon;
      const target = V3(MOUTH.x, MOUTH.y + 0.3, MOUTH.z);
      await K.moveTo(tw, obj, K.tipPose(V2(0, 0.16), 1.9, target), 1.9, 0.5);
      await K.dripDrop(scene, tw, target, V3(MOUTH.x, TBY + 0.12, BZ), which === 'cuo' ? '#111111' : '#57534e');
      S[which] = true;
      setFill(S.cuo && S.c ? 0.13 : 0.07); mixMat.color.set(S.cuo && S.c ? '#262220' : which === 'cuo' ? '#111111' : '#57534e');
      push(); api.emit(which === 'cuo' ? 'mx_cuo' : 'mx_c');
      await h.returnHome();
      if (S.cuo && S.c) { stopper.visible = true; pipe.visible = true; api.done('mix'); api.emit('mixAll'); }
      busy = false;
    }
    async function heat() {
      if (busy || S.heat) return;
      if (!(S.cuo && S.c)) { api.emit('hx_need'); return; }
      busy = true; flame.visible = true; heating = 1; api.emit('hx_on');
      const l0 = new THREE.Color('#eef6fb'), l1 = new THREE.Color('#f8fafc');
      await tw.to(6, (k) => {
        mixMat.emissiveIntensity = 1.4 * Math.sin(Math.min(1, k * 1.15) * Math.PI);
        lime.mat.color.copy(l0).lerp(l1, k); lime.mat.opacity = 0.45 + 0.5 * k;
        flecks.set(k, 0);
      }, K.lin);
      heating = 0; flame.visible = false; mixMat.emissiveIntensity = 0;
      S.heat = true; push();
      await api.waitSpeech();
      api.emit('hx_done'); api.done('heat');
      busy = false;
    }
    async function pour(h = hTube) {
      if (busy || S.pour) return false;
      if (!S.heat) { api.emit('po_need'); return false; }
      busy = true;
      stopper.visible = false; pipe.visible = false;
      await K.moveTo(tw, tube, V3(DX - 0.95, T + 0.55, DZ), -1.9, 0.8); // 管口對準蒸發皿
      await tw.to(0.8, (k) => { setFill(0.13 * (1 - k)); flecks.set(1 - k, 0); dishPile.set(k, 0); dishCu.set(k, 0); });
      mix.visible = false;
      await h.returnHome();
      S.pour = true; push(); api.emit('po_copper'); api.done('pour');
      busy = false;
    }
    const tgTube = () => [{ key: 'tube', pos: MOUTH, r: 0.4, ringY: T, accept: () => !(S.cuo && S.c) }];
    const hCuo = api.drag(cuo, { label: { zh: '氧化銅', en: 'Copper oxide' }, lift: 1.9, enabled: () => !busy && !S.cuo, targets: tgTube,
      onDrop: (tg, h) => addPowder('cuo', h), onTap: () => { if (!busy && !S.cuo) hCuo.dropOn('tube'); } });
    const hC = api.drag(carbon, { label: { zh: '碳粉', en: 'Carbon powder' }, lift: 1.9, enabled: () => !busy && !S.c, targets: tgTube,
      onDrop: (tg, h) => addPowder('c', h), onTap: () => { if (!busy && !S.c) hC.dropOn('tube'); } });
    const hTube = api.drag(tube, { label: { zh: '試管', en: 'Test tube' }, lift: 0.3, enabled: () => !busy && S.heat && !S.pour,
      targets: () => [{ key: 'dish', pos: V3(DX, T + 0.2, DZ), r: 0.5, ringY: T, accept: () => S.heat && !S.pour }],
      onDrop: (tg, h) => pour(h), onTap: () => { if (busy || S.pour) return; if (!S.heat) api.emit('po_need'); else hTube.dropOn('dish'); } });
    api.tap(burner, () => (S.heat ? api.emit('burner') : heat()), { zh: '本生燈', en: 'Bunsen burner' }, [lB]);

    push();
    return {
      cam: { pos: [0, 3.9, 5.0], target: [0, 1.5, -0.1], fitW: 6.6 },
      heat, pour: () => { if (!busy && S.heat && !S.pour) hTube.dropOn('dish'); },
      mixNext() { if (busy) return; if (!S.cuo) hCuo.dropOn('tube'); else if (!S.c) hC.dropOn('tube'); },
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (id === 'mix') {
          if (!S.cuo) { await hCuo.dropOn('tube'); await api.waitSpeech(); }
          while (busy) await tw.wait(0.1);
          if (!S.c) await hC.dropOn('tube');
        }
        if (id === 'heat') await heat();
        if (id === 'pour' && !S.pour) await hTube.dropOn('dish');
      },
      getHint(id) {
        if (busy) return null;
        if (id === 'mix') return !S.cuo ? { from: K.worldOf(cuo, 0.15), to: MOUTH } : !S.c ? { from: K.worldOf(carbon, 0.15), to: MOUTH } : null;
        if (id === 'heat') return S.heat ? null : { from: K.worldOf(bBase, 0.05) };
        if (id === 'pour') return S.heat && !S.pour ? { from: K.worldOf(tube, 0.5), to: V3(DX, T + 0.2, DZ) } : null;
        return null;
      },
      update(dt, t) {
        if (flame.visible) { const fh = 0.32 * (1 + Math.sin(t * 22) * 0.05); flame.scale.set(1, fh, 1); flame.position.y = 0.45 + fh / 2; }
        if (heating && Math.random() < dt * 20) limeBub.spawn((Math.random() - 0.5) * 0.12, 0.18, (Math.random() - 0.5) * 0.12, 0.6, 0.9);
        limeBub.update(dt, t);
      },
      reset() {
        tw.clear(); busy = false; heating = 0;
        Object.assign(S, { cuo: false, c: false, heat: false, pour: false }); push();
        setFill(0); flecks.set(0, 0); dishPile.set(0, 0); dishCu.set(0, 0); mixMat.emissiveIntensity = 0; flame.visible = false;
        stopper.visible = false; pipe.visible = false; limeBub.clear(); lime.mat.color.set('#eef6fb'); lime.mat.opacity = 0.45;
        [hCuo, hC, hTube].forEach((h) => { h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.busy = false; });
      },
    };
  },
};
