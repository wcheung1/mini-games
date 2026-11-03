/* Topic 8.1 塑膠：加成聚合（乙烯 → 聚乙烯）同聚合物交聯（史萊姆） */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V2, V3 } = K;

const N = 4; // 要接上去嘅乙烯數目
const SLIME = '#4ade80';

function Panel({ S }) {
  const { lang } = useApp();
  const zh = lang === 'zh';
  const n = S.n || 0;
  const row = (label, val) => html`<div className="flex items-center gap-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2"><b className="flex-1 text-slate-700">${label}</b><span className="text-slate-600">${val}</span></div>`;
  return html`<div className="grid gap-1.5 text-sm">
    <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2">
      <b className="text-slate-700">${zh ? '🔗 聚乙烯長鏈：' : '🔗 Polyethene chain: '}</b><span className="text-slate-600">${1 + n} ${zh ? '粒單體' : 'monomers'}</span>
      <div className="mt-1 flex gap-1">${[...Array(N + 1)].map((_, i) => html`<span key=${i} className=${`h-3 flex-1 rounded-full ${i <= n ? 'bg-slate-700' : 'bg-slate-200'}`}></span>`)}</div>
    </div>
    ${row(zh ? '🧴 倒硼砂溶液' : '🧴 Borax added', S.pour ? '✅' : '—')}
    ${row(zh ? '🥄 攪勻' : '🥄 Stirred', S.stir ? (zh ? '變成史萊姆 ✅' : 'became slime ✅') : '—')}
    ${row(zh ? '🙌 拉長' : '🙌 Stretched', S.stretch ? (zh ? '可以拉長，用力扯會斷' : 'stretches, snaps if pulled hard') : '—')}
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    ${[0, 1, 2, 3, 4].map((i) => html`<g key=${i}><circle cx=${24 + i * 22} cy="30" r="8" fill="#1f2937" /><line x1=${32 + i * 22} y1="30" x2=${38 + i * 22} y2="30" stroke="#94a3b8" strokeWidth="4" /></g>`)}
    <path d="M110 92 q-8 -30 20 -36 q30 -6 40 14 q10 22 -16 26 q-26 6 -44 -4z" fill="#4ade80" stroke="#16a34a" strokeWidth="3" />
    <circle cx="140" cy="70" r="5" fill="#fff" opacity=".6" />
  </svg>`;
}

const events = {
  ch_add: { zh: '接多一粒！雙鍵打開，同隔籬嗰粒手拖手。', en: 'One more joined! The double bond opens and links to its neighbour.' },
  chAll: { zh: '四粒乙烯全部接埋，變成一條聚乙烯長鏈！', en: 'All four ethene molecules have joined into a long polyethene chain!' },
  mx_pour: { zh: '硼砂溶液倒咗落膠水度。而家撳個杯攪一攪！', en: 'The borax solution is in the glue. Now tap the cup to stir it!' },
  mx_need: { zh: '要先倒硼砂溶液落膠水，先好攪。', en: 'Pour the borax solution into the glue first, then stir.' },
  mx_stir: { zh: '攪下攪下，會流嘅膠水變成一嚿可以拉長、又唔會流晒嘅史萊姆！', en: 'Stir, stir… the runny glue turns into a lump of slime that stretches but does not run away!' },
  st_need: { zh: '要先整好史萊姆，先好拉。', en: 'Make the slime first, then stretch it.' },
  st_stretch: { zh: '史萊姆可以慢慢拉長，放手又縮返少少；但係用力一扯，就會斷開。', en: 'The slime stretches slowly and shrinks back a little when you let go, but if you pull hard, it snaps.' },
  glue: { zh: '呢杯係膠水溶液，入面有一種叫聚乙烯醇嘅長鏈分子。', en: 'This cup holds glue solution, which contains long chain molecules called polyvinyl alcohol.' },
  bottle: { zh: '膠樽都係由超長嘅分子鏈組成嘅塑膠。用完要回收。', en: 'Plastic bottles are made of very long chain molecules too. Recycle them after use.' },
  bag: { zh: '膠袋係聚乙烯整嘅。自備購物袋，就可以少用膠袋。', en: 'Plastic bags are made of polyethene. Bring your own shopping bag to use fewer.' },
  start: { zh: '呢粒係長鏈嘅起點。將其他乙烯拖過嚟接上去。', en: 'This is the start of the chain. Drag the other ethene molecules over to join it.' },
};

export default {
  id: 'slime', topics: ['8.1'], accent: '#16a34a', dark: '#166534', bg: 'linear-gradient(135deg,#dcfce7,#e0f2fe)', Art,
  title: { zh: '史萊姆', en: 'Slime Science' },
  desc: { zh: '砌一條聚乙烯長鏈，再整一嚿會拉長嘅史萊姆，認識塑膠同聚合物！', en: 'Build a polyethene chain, then make stretchy slime, and discover plastics and polymers!' },
  steps: [
    { tag: 'intro', zh: '膠袋、膠樽、玩具、衣服纖維……我哋身邊有好多「塑膠」同「聚合物」。佢哋都係由好多細細嘅分子，叫「單體」，手拖手連成嘅超長鏈。今日我哋先砌一條聚乙烯長鏈，再整一嚿史萊姆！安全提提你：硼砂唔可以食，玩完一定要洗手，唔好黐落衫同地氈。後面嘅物件可以撳嚟睇介紹。',
      en: 'Plastic bags, bottles, toys, clothing fibres… we are surrounded by plastics and polymers. They are all very long chains made of many small molecules, called monomers, holding hands. Today we will build a polyethene chain and then make slime! Safety first: borax must never be eaten, always wash your hands afterwards, and keep slime off clothes and carpets. Tap the objects at the back to learn about them.' },
    { tag: 'try', action: { id: 'chain', events: ['ch_'] }, zh: '將前面四粒「乙烯」單體，逐粒拖去長鏈嘅尾，接成一條長鏈。', en: 'Drag the four ethene monomers at the front, one at a time, to the end of the chain.' },
    { tag: 'observe', zh: '乙烯嘅雙鍵打開，同隔籬嘅乙烯連埋，一粒接一粒變成聚乙烯。呢種方法叫「加成聚合」。膠袋就係用聚乙烯整嘅，一條真正嘅鏈可以有幾千粒單體咁長！',
      en: 'Each ethene\'s double bond opens and links to the next one, building polyethene unit by unit. This is called addition polymerisation. Plastic bags are made of polyethene, and a real chain can be thousands of monomers long!' },
    { tag: 'try', action: { id: 'mix', events: ['mx_'] }, zh: '將硼砂溶液拖去倒入膠水溶液，然後撳個杯攪一攪。', en: 'Drag the borax solution over to pour it into the glue solution, then tap the cup to stir it.' },
    { tag: 'try', action: { id: 'stretch', events: ['st_'] }, zh: '撳一下史萊姆，將佢拉長睇下。', en: 'Tap the slime to stretch it.' },
    { tag: 'feynman', zh: '膠水入面有好多條長長嘅分子鏈，好似一碟意粉，條條都可以滑嚟滑去，所以會流。硼砂好似一條條橡筋，將唔同嘅意粉綁埋一齊，佢哋就唔可以自由咁滑，變成一嚿有彈性嘅史萊姆。',
      en: 'Glue contains many long molecular chains, like a plate of spaghetti: the strands slide past each other, so it flows. Borax acts like rubber bands that tie different strands together, so they can no longer slide freely, and you get a stretchy lump of slime.' },
    { tag: 'first', zh: '由最基本諗起：聚合物係由好多細單體連成嘅大分子。乙烯有雙鍵，雙鍵打開就可以一粒接一粒加上去，變成聚乙烯，呢個叫加成聚合。膠水入面嘅聚乙烯醇本身已經係長鏈；硼砂會喺唔同長鏈之間搭「橋」，叫做「交聯」。鏈越難滑動，物質就越稠。',
      en: 'Back to basics: a polymer is a giant molecule made by joining many small monomers. Ethene has a double bond that can open, so monomers add on one after another to make polyethene; this is addition polymerisation. The polyvinyl alcohol in glue is already a long chain; borax builds bridges between different chains, called cross-links. The harder the chains find it to slide, the thicker the material.' },
    { tag: 'life', zh: '生活應用：塑膠又輕又平又耐用，用途好多。但係好多塑膠喺大自然幾百年都唔會分解，會變成垃圾同微塑膠，傷害海洋生物。所以我哋要「走塑」：自備購物袋同水樽，做好回收。',
      en: 'Everyday life: plastics are light, cheap and long-lasting, so they have countless uses. But many plastics do not break down in nature for hundreds of years, becoming litter and microplastics that harm sea life. So we should use less plastic: bring our own bags and bottles, and recycle properly.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '點解好多塑膠喺大自然好難分解？', en: 'Why are many plastics so hard to break down in nature?' },
    options: [
      { zh: '因為塑膠係金屬', en: 'Because plastics are metals' },
      { zh: '因為佢哋由好穩定嘅超長分子鏈組成，細菌好難將佢哋拆開', en: 'Because they are made of very stable, very long chain molecules that bacteria find hard to break apart' },
      { zh: '因為塑膠太輕', en: 'Because plastics are too light' },
    ],
    correct: 1,
    right: { zh: '啱！大自然嘅細菌冇工具拆開呢啲超長鏈，所以塑膠可以喺環境留好耐。', en: 'Right! Bacteria in nature have no tools to break these super-long chains, so plastics stay in the environment for a very long time.' },
    wrong: { zh: '再諗下你啱啱砌嘅長鏈：塑膠係由咩組成？', en: 'Think about the chain you just built: what are plastics made of?' },
  },
  tools: [
    { id: 'c', label: { zh: '接下一粒乙烯', en: 'Add the next ethene' }, run: (c) => c.chainNext() },
    { id: 'm', label: { zh: '倒硼砂／攪勻', en: 'Pour borax / stir' }, run: (c) => c.mixNext() },
    { id: 's', label: { zh: '拉長史萊姆', en: 'Stretch the slime' }, run: (c) => c.stretch() },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = { n: 0, pour: false, stir: false, stretch: false };
    const push = () => api.state({ ...S });
    const C0 = V3(-2.0, T + 0.14, -0.55), STEP = 0.5;
    const cMat = K.stdMat('#1f2937', 0.35), hMat = K.stdMat('#f8fafc', 0.4), bMat = K.stdMat('#94a3b8', 0.4);
    // 乙烯單體：兩粒碳＋雙鍵＋四粒氫（原點喺中間）
    function makeEthene() {
      const g = new THREE.Group();
      [-0.1, 0.1].forEach((x) => {
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 12), cMat); c.position.x = x; g.add(c);
        [-1, 1].forEach((s) => { const h = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), hMat); h.position.set(x, 0.05, s * 0.12); g.add(h); });
      });
      const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.2, 8), bMat); b1.rotation.z = Math.PI / 2; b1.position.y = 0.03; g.add(b1);
      const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.2, 8), bMat); b2.rotation.z = Math.PI / 2; b2.position.y = -0.03; g.add(b2);
      const hit = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.35), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); g.add(hit); // 透明嘅捉手範圍
      g.userData.b2 = b2;
      return g;
    }
    const mat = new THREE.Mesh(new K.RoundedBoxGeometry(2.9, 0.03, 0.6, 2, 0.01), K.stdMat('#e0f2fe', 0.6)); mat.position.set(-1.0, T + 0.015, -0.55); scene.add(mat);
    const first = makeEthene(); first.position.copy(C0); first.userData.b2.visible = false; scene.add(first);
    api.tap(first, () => api.emit('start'), { zh: '長鏈起點', en: 'Start of chain' });
    const lChain = api.label((lang) => (S.n >= N ? (lang === 'zh' ? '聚乙烯（長鏈）' : 'Polyethene (long chain)') : (lang === 'zh' ? '長鏈起點' : 'Start of chain')), { border: '#334155', h: 0.15 }); lChain.position.set(-1.0, T + 0.5, -0.55);
    const links = [];
    const monos = [0, 1, 2, 3].map((i) => {
      const g = makeEthene(); g.position.set(-2.4 + i * 0.5, T + 0.12, 0.95); scene.add(g);
      return { g, home: g.position.clone() };
    });
    const lMono = api.label({ zh: '乙烯（單體）', en: 'Ethene (monomers)' }, { border: '#64748b', h: 0.15 }); lMono.position.set(-1.65, T + 0.1, 1.35);
    const endPos = () => V3(C0.x + (S.n + 1) * STEP, C0.y, C0.z);

    // 膠水杯、硼砂樽
    const CX = 1.35, CZ = -0.35, LV = 0.35;
    const cup = K.makeVessel(K.beakerProfile(0.34, 0.55), { liquidColor: '#eef2ff', level: LV, opacity: 0.85, sx: 0.94 });
    cup.group.position.set(CX, T + 0.01, CZ); scene.add(cup.group);
    const lCup = api.label({ zh: '膠水溶液', en: 'Glue solution' }, { border: '#6366f1', h: 0.15 }); lCup.position.set(CX, T + 0.1, CZ + 0.55);
    const blobMat = new THREE.MeshPhysicalMaterial({ color: SLIME, roughness: 0.15, clearcoat: 1 });
    const blob = new THREE.Mesh(new THREE.SphereGeometry(0.26, 32, 20), blobMat); blob.scale.set(1, 0.55, 1); blob.position.set(CX, T + 0.16, CZ); blob.visible = false; scene.add(blob);
    const spoon = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.7, 8), K.stdMat('#cbd5e1', 0.3, 0.8)); spoon.position.set(CX + 0.1, T + 0.5, CZ); spoon.rotation.z = 0.3; spoon.visible = false; scene.add(spoon);
    const borax = K.makeBottle({ body: '#f8fafc', cap: '#a855f7' }); borax.g.position.set(2.5, T, 0.95); scene.add(borax.g);
    const lBx = api.label({ zh: '硼砂溶液', en: 'Borax solution' }, { border: '#a855f7', h: 0.15 }); lBx.position.set(0, 0.1, 0.42); borax.g.add(lBx);
    // 後排：膠樽、膠袋
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.5, 20), new THREE.MeshPhysicalMaterial({ color: '#bae6fd', roughness: 0.1, transparent: true, opacity: 0.6 })); bottle.position.set(2.9, T + 0.25, -1.2); scene.add(bottle);
    const bag = new THREE.Mesh(new K.RoundedBoxGeometry(0.4, 0.48, 0.05, 3, 0.03), new THREE.MeshPhysicalMaterial({ color: '#f8fafc', roughness: 0.3, transparent: true, opacity: 0.8 })); bag.position.set(2.2, T + 0.24, -1.2); scene.add(bag);
    [[bottle, 'bottle', { zh: '膠樽', en: 'Plastic bottle' }, 2.9, 0.7], [bag, 'bag', { zh: '膠袋', en: 'Plastic bag' }, 2.2, 0.68]].forEach(([o, ev, name, x, y]) => {
      const l = api.label(name, { border: '#94a3b8', h: 0.14 }); l.position.set(x, T + y, -1.15);
      api.tap(o, () => api.emit(ev), name, [l]);
    });

    let busy = false;
    async function join(mi, h) {
      if (busy || S.n >= N || monos[mi].joined) return false; busy = true;
      const g = monos[mi].g, to = endPos();
      await K.moveTo(tw, g, V3(to.x, to.y + 0.3, to.z), 0, 0.4);
      await K.moveTo(tw, g, to, 0, 0.3);
      g.userData.b2.visible = false; // 雙鍵打開
      const link = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, STEP - 0.2, 8), bMat); link.rotation.z = Math.PI / 2; link.position.set(to.x - STEP / 2, to.y, to.z); scene.add(link); links.push(link);
      monos[mi].joined = true; h.setHome(to.clone());
      S.n += 1; push(); lChain.userData.refresh(); api.emit('ch_add');
      busy = false;
      if (S.n >= N) { api.done('chain'); api.emit('chAll'); K.popText(scene, tw, '聚乙烯 Polyethene!', V3(-1.0, T + 0.9, -0.55), '#334155'); }
    }
    async function pour(h = hB) {
      if (busy || S.pour) return false; busy = true;
      const target = V3(CX, T + 0.9, CZ);
      await K.moveTo(tw, borax.g, K.tipPose(V2(0, 0.86), 1.9, target), 1.9, 0.5);
      await K.dripDrop(scene, tw, target, V3(CX, T + LV, CZ), '#f5f3ff');
      S.pour = true; push(); api.emit('mx_pour');
      await h.returnHome();
      busy = false;
    }
    async function stir() {
      if (busy || S.stir) return;
      if (!S.pour) { api.emit('mx_need'); return; }
      busy = true; spoon.visible = true;
      const c0 = new THREE.Color('#eef2ff'), c1 = new THREE.Color(SLIME);
      await tw.to(2.0, (k) => { spoon.position.x = CX + Math.cos(k * 18) * 0.12; spoon.position.z = CZ + Math.sin(k * 18) * 0.12; cup.mat.color.copy(c0).lerp(c1, k); });
      spoon.visible = false; cup.setLevel(0); blob.visible = true;
      await tw.to(0.5, (k) => blob.scale.set(1, 0.55 * k + 0.01, 1));
      S.stir = true; push(); api.emit('mx_stir'); api.done('mix');
      busy = false;
    }
    async function stretch() {
      if (busy || S.stretch) return;
      if (!S.stir) { api.emit('st_need'); return; }
      busy = true;
      await K.moveTo(tw, blob, V3(CX - 0.9, T + 0.4, CZ + 0.5), 0, 0.6);
      await tw.to(1.4, (k) => blob.scale.set(1 + 1.6 * k, 0.55 - 0.3 * k, 1 - 0.4 * k));
      api.emit('st_stretch');
      await tw.to(1.0, (k) => blob.scale.set(2.6 - 1.2 * k, 0.25 + 0.15 * k, 0.6 + 0.2 * k));
      S.stretch = true; push(); api.done('stretch');
      busy = false;
    }
    const hM = monos.map((m, mi) => api.drag(m.g, { label: { zh: '乙烯', en: 'Ethene' }, lift: 0.6, enabled: () => !busy && !m.joined && S.n < N,
      targets: () => [{ key: 'end', pos: endPos(), r: 0.3, ringY: T, accept: () => S.n < N }],
      onDrop: (tg, h) => join(mi, h), onTap: () => { if (!busy && !m.joined && S.n < N) hM[mi].dropOn('end'); } }));
    const hB = api.drag(borax.g, { label: { zh: '硼砂溶液', en: 'Borax solution' }, lift: 0.9, enabled: () => !busy && !S.pour,
      targets: () => [{ key: 'cup', pos: V3(CX, T + 0.56, CZ), r: 0.45, ringY: T, accept: () => !S.pour }],
      onDrop: (tg, h) => pour(h), onTap: () => { if (!busy && !S.pour) hB.dropOn('cup'); } });
    // 史萊姆喺杯入面，撳中個杯都當撳史萊姆
    api.tap(cup.group, () => (S.stir ? stretch() : S.pour ? stir() : api.emit('glue')), { zh: '膠水溶液', en: 'Glue solution' }, [lCup]);
    api.tap(blob, () => stretch(), { zh: '史萊姆', en: 'Slime' });

    const nextMono = () => monos.findIndex((m) => !m.joined);
    push();
    return {
      cam: { pos: [0, 3.7, 4.9], target: [0, 1.2, -0.1], fitW: 6.6 },
      chainNext() { const i = nextMono(); if (!busy && i >= 0 && S.n < N) hM[i].dropOn('end'); },
      mixNext() { if (busy) return; if (!S.pour) hB.dropOn('cup'); else if (!S.stir) stir(); },
      stretch,
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (id === 'chain') for (let i = nextMono(), c = 0; i >= 0 && S.n < N && c < 6; i = nextMono(), c++) { while (busy) await tw.wait(0.1); await hM[i].dropOn('end'); }
        if (id === 'mix') { if (!S.pour) { await hB.dropOn('cup'); await api.waitSpeech(); } while (busy) await tw.wait(0.1); await stir(); }
        if (id === 'stretch') await stretch();
      },
      getHint(id) {
        if (busy) return null;
        if (id === 'chain') { const i = nextMono(); return i < 0 || S.n >= N ? null : { from: K.worldOf(monos[i].g), to: endPos() }; }
        if (id === 'mix') return !S.pour ? { from: K.worldOf(borax.g, 0.5), to: V3(CX, T + 0.56, CZ) } : !S.stir ? { from: K.worldOf(cup.group, 0.3) } : null;
        if (id === 'stretch') return S.stretch || !S.stir ? null : { from: K.worldOf(blob) };
        return null;
      },
      reset() {
        tw.clear(); busy = false;
        Object.assign(S, { n: 0, pour: false, stir: false, stretch: false }); push(); lChain.userData.refresh();
        links.forEach((l) => { scene.remove(l); l.geometry.dispose(); }); links.length = 0;
        monos.forEach((m, i) => { m.joined = false; m.g.userData.b2.visible = true; hM[i].setHome(m.home); });
        cup.setLevel(LV); cup.mat.color.set('#eef2ff'); blob.visible = false; blob.scale.set(1, 0.55, 1); blob.position.set(CX, T + 0.16, CZ); spoon.visible = false;
        [...hM, hB].forEach((h) => { h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.busy = false; });
      },
    };
  },
};
