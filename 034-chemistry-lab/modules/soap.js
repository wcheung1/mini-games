/* Topic 8.2 清潔劑：肥皂的問題（硬水同浮渣）和解決方法（合成清潔劑） */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V2, V3 } = K;

// foam = 搖完之後泡泡高度；scum = 會唔會有浮渣
const TUBES = [
  { zh: '純水', en: 'Pure water', liq: '#e0f2fe', foam: 0.5, scum: false, ev: 'pure' },
  { zh: '自來水', en: 'Tap water', liq: '#dbeafe', foam: 0.44, scum: false, ev: 'tap' },
  { zh: '硬水', en: 'Hard water', liq: '#e5e7eb', foam: 0.07, scum: true, ev: 'hard' },
  { zh: '硬水（清潔劑）', en: 'Hard water (detergent)', liq: '#e5e7eb', foam: 0.48, scum: false, ev: 'hard2' },
];

function Panel({ S }) {
  const { pick, lang } = useApp();
  const zh = lang === 'zh';
  return html`<div className="grid gap-1.5 text-sm">
    <div className="grid grid-cols-[1.3fr_0.9fr_1.4fr_0.8fr] gap-2 px-3 font-black text-slate-500 text-xs">
      <span>${zh ? '試管' : 'Tube'}</span><span>${zh ? '加咗' : 'Added'}</span><span>${zh ? '泡泡' : 'Foam'}</span><span>${zh ? '浮渣' : 'Scum'}</span>
    </div>
    ${TUBES.map((tb, i) => html`<div key=${i} className="grid grid-cols-[1.3fr_0.9fr_1.4fr_0.8fr] gap-2 items-center rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2">
      <span className="font-bold text-slate-700 leading-tight">${i + 1}. ${pick(tb)}</span>
      <span className="text-slate-600 text-xs">${S['a' + i] ? (i === 3 ? (zh ? '洗潔精' : 'detergent') : (zh ? '番鹼' : 'soap')) : '—'}</span>
      <div className="h-3 rounded-full bg-slate-200 overflow-hidden"><div className="h-full rounded-full bg-pink-400" style=${{ width: `${S['k' + i] ? Math.max(6, (tb.foam / 0.5) * 100) : 0}%` }}></div></div>
      <span className="text-slate-600">${S['k' + i] ? (tb.scum ? (zh ? '有 ⚠️' : 'yes ⚠️') : (zh ? '冇' : 'none')) : '—'}</span>
    </div>`)}
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    ${[[40, 34], [85, 30], [130, 6], [175, 32]].map(([x, f], i) => html`<g key=${x}>
      <rect x=${x - 13} y="10" width="26" height="92" rx="13" fill="#fff" fillOpacity=".9" stroke="#cbd5e1" strokeWidth="3" />
      <rect x=${x - 9} y="62" width="18" height="36" rx="9" fill=${i >= 2 ? '#e5e7eb' : '#dbeafe'} />
      ${[...Array(Math.round(f / 5))].map((_, k) => html`<circle key=${k} cx=${x - 5 + (k % 3) * 5} cy=${60 - Math.floor(k / 3) * 6} r="4" fill="#fff" stroke="#f9a8d4" />`)}
      ${i === 2 ? html`<rect x=${x - 9} y="60" width="18" height="4" fill="#a8a29e" />` : null}
    </g>`)}
  </svg>`;
}

const events = {
  sp_add: { zh: '加咗幾滴番鹼液。', en: 'A few drops of soap solution are in.' },
  sp_no4: { zh: '第四支試管留俾洗潔精㗎，番鹼加落頭三支就得。', en: 'The fourth tube is saved for the detergent. Soap goes into the first three only.' },
  soapAll: { zh: '三支試管都加咗番鹼！', en: 'All three tubes have soap!' },
  sk_need: { zh: '要先加番鹼，先好搖。', en: 'Add soap first, then shake.' },
  sk_0: { zh: '純水：搖完起咗好多泡泡！', en: 'Pure water: lots of foam after shaking!' },
  sk_1: { zh: '自來水：都起咗好多泡泡！香港嘅自來水屬於軟水。', en: 'Tap water: lots of foam too! Hong Kong tap water is soft water.' },
  sk_2: { zh: '硬水：只係起咗少少泡，水面仲浮住一層白色嘅浮渣！', en: 'Hard water: only a little foam, and a layer of white scum floats on top!' },
  shakeAll: { zh: '比較一下：硬水起泡最少，仲有浮渣。', en: 'Compare them: hard water makes the least foam, and it has scum.' },
  dg_add: { zh: '洗潔精加咗落第四支硬水試管。而家撳佢搖一搖！', en: 'The detergent is in the fourth tube of hard water. Now tap it to shake it!' },
  dg_wrong: { zh: '呢支已經有番鹼喇。洗潔精要加落第四支硬水試管。', en: 'This tube already has soap. The detergent goes into the fourth tube of hard water.' },
  dg_need: { zh: '先將洗潔精加落第四支試管，先好搖。', en: 'Add the detergent to the fourth tube first, then shake it.' },
  dg_shake: { zh: '硬水加洗潔精，都起咗好多泡泡，而且冇浮渣！', en: 'Hard water with detergent makes lots of foam, and no scum at all!' },
  info_pure: { zh: '第一支係純水，入面幾乎冇溶到其他嘢。', en: 'Tube 1 is pure water, with almost nothing dissolved in it.' },
  info_tap: { zh: '第二支係香港嘅自來水，屬於軟水。', en: 'Tube 2 is Hong Kong tap water, which is soft.' },
  info_hard: { zh: '第三支係硬水，入面溶咗好多鈣同鎂。', en: 'Tube 3 is hard water, with lots of calcium and magnesium dissolved in it.' },
  info_hard2: { zh: '第四支都係硬水，留俾洗潔精用。', en: 'Tube 4 is also hard water, saved for the detergent.' },
  soapbar: { zh: '番鹼係用油脂同鹼一齊煮出嚟嘅。記得鹼性大發現嗎？', en: 'Soap is made by heating fats with an alkali. Remember Discovering Alkalis?' },
  kettle: { zh: '硬水煲滾之後，會喺水煲入面留低白色嘅水垢。', en: 'When hard water is boiled, it leaves white scale inside the kettle.' },
};

export default {
  id: 'soap', topics: ['8.2'], accent: '#ec4899', dark: '#be185d', bg: 'linear-gradient(135deg,#fce7f3,#e0f2fe)', Art,
  title: { zh: '肥皂同硬水', en: 'Soap and Hard Water' },
  desc: { zh: '番鹼喺唔同嘅水入面起泡一樣咩？泡泡大比拼，揭開硬水嘅秘密！', en: 'Does soap foam the same in every kind of water? Hold a foam contest and uncover the secret of hard water!' },
  steps: [
    { tag: 'intro', zh: '洗手用番鹼，洗碗用洗潔精，佢哋點樣洗走污漬？原來水都分「軟水」同「硬水」！硬水入面溶咗好多鈣同鎂，會搞亂番鹼。今日我哋做一場泡泡大比拼。安全提提你：番鹼同清潔劑唔好入口，入眼要即刻用清水沖。後面嘅物件可以撳嚟睇介紹。',
      en: 'We wash our hands with soap and our dishes with washing-up liquid, but how do they clean? Did you know water can be "soft" or "hard"? Hard water has lots of calcium and magnesium dissolved in it, and that confuses soap. Today we will hold a foam contest. Safety first: never swallow soap or detergent, and if any gets in your eyes, rinse them with clean water straight away. Tap the objects at the back to learn about them.' },
    { tag: 'try', action: { id: 'soap', events: ['sp_'] }, zh: '將番鹼液滴瓶拖去頭三支試管：純水、自來水同硬水。每支都加一樣份量。',
      en: 'Drag the soap dropper to the first three tubes: pure water, tap water and hard water. Each gets the same amount.' },
    { tag: 'try', action: { id: 'shake', events: ['sk_'] }, zh: '逐支試管撳一下，搖一搖，睇下邊支起最多泡。',
      en: 'Tap each tube to shake it, and see which one makes the most foam.' },
    { tag: 'observe', zh: '純水同自來水起好多泡，硬水淨係起少少泡，水面仲浮住一層白色、污糟糟嘅「浮渣」。香港嘅自來水屬於軟水，所以好容易起泡。',
      en: 'Pure water and tap water make lots of foam, but hard water makes only a little, and a layer of dirty white "scum" floats on top. Hong Kong tap water is soft, so it foams easily.' },
    { tag: 'try', action: { id: 'detergent', events: ['dg_'] }, zh: '第四支試管都係硬水。將右邊嘅洗潔精拖落去，然後撳佢搖一搖。',
      en: 'The fourth tube is hard water too. Drag the washing-up liquid on the right into it, then tap the tube to shake it.' },
    { tag: 'feynman', zh: '番鹼分子好似一隻蝌蚪：個頭鍾意水，條尾怕水但係鍾意油。洗嘢嗰陣，好多條尾一齊鑽入油污，個頭就向住水，將油污成舊包住，一沖就走。',
      en: 'A soap molecule is like a tadpole: its head loves water, and its tail avoids water but loves oil. When you wash, lots of tails dig into the grease while the heads face the water. They wrap the grease up so it rinses away.' },
    { tag: 'first', zh: '由最基本諗起：硬水入面有鈣離子同鎂離子。番鹼分子個頭一遇到佢哋，就會黐埋一齊，變成唔溶喺水嘅浮渣，番鹼就咁浪費咗，起唔到泡。合成清潔劑（例如洗潔精）嘅個頭唔同，遇到鈣同鎂都唔會變成浮渣，所以喺硬水入面都洗得乾淨。',
      en: 'Back to basics: hard water contains calcium ions and magnesium ions. When the heads of soap molecules meet them, they stick together and form scum, which does not dissolve. The soap is wasted and cannot foam. Synthetic detergents, like washing-up liquid, have different heads that do not form scum with calcium and magnesium, so they still clean well in hard water.' },
    { tag: 'life', zh: '生活應用：浴缸邊同玻璃上面白色嘅污漬，好多都係番鹼浮渣；硬水煲滾仲會積水垢。香港自來水屬軟水，但係有啲地方嘅水好硬，所以洗衫粉入面會加軟水成分。',
      en: 'Everyday life: the white marks around baths and on glass are often soap scum, and boiling hard water leaves scale in kettles. Hong Kong tap water is soft, but in places with very hard water, washing powders contain water softeners.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '喺一個水好硬嘅地方洗衫，用咩洗會好啲？', en: 'In a place with very hard water, what is better for washing clothes?' },
    options: [
      { zh: '番鹼，用多啲就得', en: 'Soap, just use more of it' },
      { zh: '合成清潔劑，例如洗衫粉', en: 'A synthetic detergent, such as washing powder' },
      { zh: '用熱水就唔使清潔劑', en: 'Hot water, so no detergent is needed' },
    ],
    correct: 1,
    right: { zh: '啱！合成清潔劑遇到鈣同鎂唔會變成浮渣，喺硬水都起泡，洗得乾淨。', en: 'Right! Synthetic detergents do not form scum with calcium and magnesium, so they foam and clean well even in hard water.' },
    wrong: { zh: '再諗下第三同第四支試管：邊樣嘢喺硬水入面都起好多泡，又冇浮渣？', en: 'Think about tubes 3 and 4: which one foamed well in hard water with no scum?' },
  },
  tools: [
    { id: 's', label: { zh: '加番鹼落下一支', en: 'Add soap to the next tube' }, run: (c) => c.soapNext() },
    { id: 'k', label: { zh: '搖下一支試管', en: 'Shake the next tube' }, run: (c) => c.shakeNext() },
    { id: 'd', label: { zh: '加洗潔精', en: 'Add washing-up liquid' }, run: (c) => c.addDetergent() },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = {}; TUBES.forEach((tb, i) => { S['a' + i] = false; S['k' + i] = false; });
    const push = () => api.state({ ...S });
    const xs = [-1.4, -0.45, 0.5, 1.45], zT = -0.4, TY = T + 0.07, LV = 0.72, TH = 1.3;
    const rack = K.makeRack(xs.map((x) => x - 0.025), 0.2, 3.8, 0.8); rack.position.set(0.025, T, zT); scene.add(rack);
    const tubes = TUBES.map((tb, i) => {
      const v = K.makeVessel(K.tubeProfile(0.17, TH), { liquidColor: tb.liq, level: LV, opacity: 0.6 });
      v.group.position.set(xs[i], TY, zT); scene.add(v.group);
      // 泡泡：由液面向上排，搖完先顯示到某個高度
      const N = 70, foam = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 10, 8), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9, transparent: true, opacity: 0.92 }), N);
      foam.frustumCulled = false; foam.renderOrder = 4; v.group.add(foam);
      const fp = [...Array(N)].map((_, k) => { const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * 0.12; return { x: Math.cos(a) * r, z: Math.sin(a) * r, dy: (k / N) * 0.6, s: 0.6 + Math.random() * 0.8 }; });
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3();
      const setFoam = (h) => { fp.forEach((d, k) => { p.set(d.x, LV + d.dy, d.z); sc.setScalar(d.dy <= h ? d.s : 0.0001); foam.setMatrixAt(k, m4.compose(p, q, sc)); }); foam.instanceMatrix.needsUpdate = true; };
      setFoam(-1);
      const scum = K.makeCloud(v.group, { color: '#a8a29e', count: 36, r: 0.13, yMin: LV - 0.03, yMax: LV + 0.01 });
      const lab = api.label({ zh: `${i + 1}. ${tb.zh}`, en: `${i + 1}. ${tb.en}` }, { border: i >= 2 ? '#78716c' : '#38bdf8', h: 0.15 }); lab.position.set(xs[i], T + 1.62, zT);
      api.tap(v.group, () => tapTube(i), tb, [lab]);
      return { ...v, setFoam, scum, mouth: V3(xs[i], TY + TH, zT) };
    });
    // 工具：番鹼液滴瓶、洗潔精
    const dr = K.makeBottle({ body: '#fdf2f8', cap: '#ec4899', dropper: true, glass: true }); dr.g.position.set(-2.55, T, 0.9); scene.add(dr.g);
    const lDr = api.label({ zh: '番鹼液', en: 'Soap solution' }, { border: '#ec4899', h: 0.17 }); lDr.position.set(0, 0.1, 0.42); dr.g.add(lDr);
    const det = K.makeBottle({ body: '#bbf7d0', cap: '#16a34a' }); det.g.position.set(2.55, T, 0.9); det.g.scale.setScalar(1.1); scene.add(det.g);
    const lDet = api.label({ zh: '洗潔精', en: 'Washing-up liquid' }, { border: '#16a34a', h: 0.17 }); lDet.position.set(0, 0.1, 0.42); det.g.add(lDet);
    // 後排：番鹼、水煲
    const bar = new THREE.Mesh(new K.RoundedBoxGeometry(0.42, 0.14, 0.28, 3, 0.05), K.stdMat('#f9c8dd', 0.5)); bar.position.set(-2.85, T + 0.07, -1.15); scene.add(bar);
    const kettle = new THREE.Group(); kettle.position.set(2.85, T, -1.15); scene.add(kettle);
    const kBody = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.4, 24), K.stdMat('#cbd5e1', 0.25, 0.8)); kBody.position.y = 0.2; kettle.add(kBody);
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.25, 12), K.stdMat('#cbd5e1', 0.25, 0.8)); spout.rotation.z = -0.9; spout.position.set(0.3, 0.3, 0); kettle.add(spout);
    [[bar, 'soapbar', { zh: '番鹼', en: 'Soap bar' }, -2.85, 0.35], [kettle, 'kettle', { zh: '水煲', en: 'Kettle' }, 2.85, 0.65]].forEach(([o, ev, name, x, y]) => {
      const l = api.label(name, { border: '#94a3b8', h: 0.15 }); l.position.set(x, T + y, -1.15);
      api.tap(o, () => api.emit(ev), name, [l]);
    });

    let busy = false;
    const soapDone = () => [0, 1, 2].every((i) => S['a' + i]);
    const nextSoap = () => [0, 1, 2].find((i) => !S['a' + i]) ?? -1;
    const nextShake = () => [0, 1, 2].find((i) => S['a' + i] && !S['k' + i]) ?? -1;
    async function addSoap(i, h = hDr) {
      if (busy || S['a' + i]) return false;
      if (i === 3) { api.emit('sp_no4'); return false; }
      busy = true;
      const target = V3(xs[i], TY + TH + 0.25, zT);
      await K.moveTo(tw, dr.g, K.tipPose(V2(0, 0.86), 2.1, target), 2.1, 0.5);
      await K.dripDrop(scene, tw, target, V3(xs[i], TY + LV, zT), '#f9a8d4');
      S['a' + i] = true; push(); api.emit('sp_add');
      await h.returnHome();
      busy = false;
      if (soapDone()) { api.done('soap'); api.emit('soapAll'); }
    }
    async function addDet(i, h = hDet) {
      if (busy || S.a3) return false;
      if (i !== 3) { api.emit('dg_wrong'); return false; }
      busy = true;
      const target = V3(xs[3], TY + TH + 0.2, zT);
      await K.moveTo(tw, det.g, K.tipPose(V2(0, 0.86 * 1.1), 2.0, target), 2.0, 0.5);
      await K.dripDrop(scene, tw, target, V3(xs[3], TY + LV, zT), '#86efac');
      S.a3 = true; push(); api.emit('dg_add');
      await h.returnHome();
      busy = false;
    }
    async function shake(i) {
      if (busy || !S['a' + i] || S['k' + i]) return false; busy = true;
      const g = tubes[i].group, tb = TUBES[i];
      await tw.to(1.1, (k) => { g.rotation.z = Math.sin(k * Math.PI * 8) * 0.22 * (1 - k); g.position.y = TY + Math.abs(Math.sin(k * Math.PI * 8)) * 0.06 * (1 - k); }, K.lin);
      g.rotation.z = 0; g.position.y = TY;
      S['k' + i] = true; push();
      api.emit(i === 3 ? 'dg_shake' : 'sk_' + i);
      await tw.to(1.2, (k) => { tubes[i].setFoam(tb.foam * k); if (tb.scum) tubes[i].scum.set(k, 0); });
      busy = false;
      if (i === 3) api.done('detergent');
      else if ([0, 1, 2].every((j) => S['k' + j])) { api.done('shake'); api.emit('shakeAll'); }
    }
    function tapTube(i) {
      if (busy) return;
      if (S['a' + i] && !S['k' + i]) shake(i);
      else if (!S['a' + i] && soapDone()) api.emit(i === 3 ? 'dg_need' : 'sk_need');
      else api.emit('info_' + TUBES[i].ev);
    }
    const tubeTargets = (accept) => () => tubes.map((tb, i) => ({ key: 't' + i, pos: tb.mouth, r: 0.4, ringY: T, accept: () => accept(i) }));
    const hDr = api.drag(dr.g, { label: { zh: '番鹼液滴瓶', en: 'Soap dropper' }, lift: 0.9, enabled: () => !busy && !soapDone(),
      targets: tubeTargets((i) => !S['a' + i]), onDrop: (tg, h) => addSoap(Number(tg.key.slice(1)), h),
      onTap: () => { const i = nextSoap(); if (!busy && i >= 0) hDr.dropOn('t' + i); } });
    const hDet = api.drag(det.g, { label: { zh: '洗潔精', en: 'Washing-up liquid' }, lift: 0.9, enabled: () => !busy && !S.a3,
      targets: tubeTargets((i) => i === 3 ? !S.a3 : S['a' + i]), onDrop: (tg, h) => addDet(Number(tg.key.slice(1)), h),
      onTap: () => { if (!busy && !S.a3) hDet.dropOn('t3'); } });

    push();
    return {
      cam: { pos: [0.05, 3.9, 5.0], target: [0.05, 1.5, -0.1], fitW: 6.7 },
      soapNext() { const i = nextSoap(); if (!busy && i >= 0) hDr.dropOn('t' + i); },
      shakeNext() { const i = nextShake(); if (i >= 0) shake(i); else if (S.a3 && !S.k3) shake(3); },
      addDetergent() { if (!busy && !S.a3) hDet.dropOn('t3'); },
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (id === 'soap') for (let i = nextSoap(); i >= 0; i = nextSoap()) { while (busy) await tw.wait(0.1); await hDr.dropOn('t' + i); await api.waitSpeech(); }
        if (id === 'shake') for (let i = nextShake(); i >= 0; i = nextShake()) { while (busy) await tw.wait(0.1); await shake(i); await api.waitSpeech(); }
        if (id === 'detergent') {
          if (!S.a3) { await hDet.dropOn('t3'); await api.waitSpeech(); }
          while (busy) await tw.wait(0.1);
          await shake(3);
        }
      },
      getHint(id) {
        if (busy) return null;
        if (id === 'soap') { const i = nextSoap(); return i < 0 ? null : { from: K.worldOf(dr.g, 0.5), to: tubes[i].mouth }; }
        if (id === 'shake') { const i = nextShake(); return i < 0 ? null : { from: K.worldOf(tubes[i].group, 0.35) }; }
        if (id === 'detergent') return !S.a3 ? { from: K.worldOf(det.g, 0.5), to: tubes[3].mouth } : !S.k3 ? { from: K.worldOf(tubes[3].group, 0.35) } : null;
        return null;
      },
      reset() {
        tw.clear(); busy = false;
        Object.keys(S).forEach((key) => { S[key] = false; }); push();
        tubes.forEach((tb) => { tb.setFoam(-1); tb.scum.set(0, 0); tb.group.rotation.z = 0; tb.group.position.y = TY; });
        [hDr, hDet].forEach((h) => { h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.busy = false; });
      },
    };
  },
};
