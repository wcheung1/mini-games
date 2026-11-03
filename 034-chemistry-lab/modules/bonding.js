/* Topic 2.3 離子鍵和共價鍵：送電子（氯化鈉）同共用電子（水分子） */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V3 } = K;

function Panel({ S }) {
  const { lang } = useApp();
  const zh = lang === 'zh';
  const card = (title, done, before, after) => html`<div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2">
    <div className="flex items-center gap-2"><b className="flex-1 text-slate-700">${title}</b><span>${done ? '✅' : '—'}</span></div>
    <div className="text-xs text-slate-600">${done ? after : before}</div>
  </div>`;
  return html`<div className="grid gap-1.5 text-sm">
    ${card(zh ? '🎁 離子鍵：鈉 ＋ 氯' : '🎁 Ionic bond: sodium + chlorine', S.ionic,
      zh ? '鈉 2,8,1　氯 2,8,7' : 'Na 2,8,1   Cl 2,8,7',
      zh ? '鈉離子 2,8（帶正電）＋ 氯離子 2,8,8（帶負電）→ 氯化鈉（食鹽）' : 'Na⁺ 2,8 (positive) + Cl⁻ 2,8,8 (negative) → sodium chloride (salt)')}
    ${card(zh ? '🤝 共價鍵：氧 ＋ 2 粒氫' : '🤝 Covalent bonds: oxygen + 2 hydrogens', S.covalent,
      zh ? `氧 2,6　已經連咗 ${S.h || 0} / 2 粒氫` : `O 2,6   joined ${S.h || 0} / 2 hydrogens`,
      zh ? '共用 2 對電子 → 水分子 H₂O' : 'sharing 2 pairs of electrons → water molecule H₂O')}
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    <circle cx="40" cy="55" r="22" fill="#c4b5fd" /><text x="40" y="61" fontSize="16" fontWeight="900" textAnchor="middle" fill="#3730a3">+</text>
    <circle cx="86" cy="55" r="26" fill="#86efac" /><text x="86" y="61" fontSize="16" fontWeight="900" textAnchor="middle" fill="#166534">−</text>
    <circle cx="150" cy="60" r="22" fill="#fca5a5" /><circle cx="128" cy="38" r="12" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" /><circle cx="172" cy="38" r="12" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
  </svg>`;
}

const events = {
  io_give: { zh: '鈉將最外層嗰粒電子送咗俾氯！鈉變成帶正電嘅鈉離子，氯變成帶負電嘅氯離子，正負相吸，黐埋一齊。', en: 'Sodium has given its outer electron to chlorine! Sodium becomes a positive sodium ion and chlorine a negative chloride ion. Opposites attract, so they stick together.' },
  co_one: { zh: '一粒氫同氧共用咗一對電子。仲差一粒氫！', en: 'One hydrogen now shares a pair of electrons with oxygen. One more hydrogen to go!' },
  co_two: { zh: '兩粒氫都同氧共用電子，砌成一粒水分子！', en: 'Both hydrogens share electrons with oxygen, making a water molecule!' },
  na: { zh: '鈉：2,8,1。最外層得 1 粒電子，送走佢，外層就變返 8 粒滿晒。', en: 'Sodium: 2,8,1. It has just 1 outer electron; giving it away leaves a full outer shell of 8.' },
  cl: { zh: '氯：2,8,7。最外層有 7 粒，差 1 粒就滿。', en: 'Chlorine: 2,8,7. It has 7 outer electrons and needs just 1 more to be full.' },
  oxy: { zh: '氧：2,6。最外層有 6 粒，差 2 粒先滿。', en: 'Oxygen: 2,6. It has 6 outer electrons and needs 2 more to be full.' },
  salt: { zh: '食鹽就係氯化鈉，由無數粒鈉離子同氯離子排成整齊嘅晶體。', en: 'Table salt is sodium chloride: countless sodium and chloride ions packed in a neat crystal.' },
  water: { zh: '一杯水入面有好多好多粒水分子，每粒都係一粒氧加兩粒氫。', en: 'A glass of water holds an enormous number of water molecules, each one oxygen and two hydrogens.' },
};

export default {
  id: 'bonding', topics: ['2.3'], accent: '#7c3aed', dark: '#5b21b6', bg: 'linear-gradient(135deg,#ede9fe,#dcfce7)', Art,
  title: { zh: '原子手拖手', en: 'Atoms Holding Hands' },
  desc: { zh: '原子點樣連埋一齊？送電子變成離子鍵，共用電子變成共價鍵！', en: 'How do atoms join up? Giving electrons makes ionic bonds, and sharing them makes covalent bonds!' },
  steps: [
    { tag: 'intro', zh: '原子點樣手拖手變成物質？大部分原子都想最外層電子「填滿」，好似惰性氣體咁穩定。佢哋有兩個方法：送電子或者收電子，叫「離子鍵」；同人共用電子，叫「共價鍵」。後面嘅物件可以撳嚟睇介紹。',
      en: 'How do atoms hold hands to make substances? Most atoms want a full outer shell of electrons, to be as stable as a noble gas. There are two ways: giving or taking electrons, which makes ionic bonds, or sharing electrons, which makes covalent bonds. Tap the objects at the back to learn about them.' },
    { tag: 'try', action: { id: 'ionic', events: ['io_'] }, zh: '鈉最外層得 1 粒電子，氯最外層有 7 粒，差 1 粒就滿。將鈉嗰粒黃色嘅外層電子，拖去俾氯。',
      en: 'Sodium has 1 outer electron and chlorine has 7, just 1 short of full. Drag sodium\'s yellow outer electron over to chlorine.' },
    { tag: 'observe', zh: '鈉送出電子，變成帶正電嘅鈉離子；氯收到電子，變成帶負電嘅氯離子。正負相吸，佢哋就黐埋一齊，呢種叫「離子鍵」，砌出嚟就係食鹽，即係氯化鈉。',
      en: 'Sodium gives away an electron and becomes a positive sodium ion; chlorine gains it and becomes a negative chloride ion. Opposites attract, so they stick together. This is an ionic bond, and it makes table salt, sodium chloride.' },
    { tag: 'try', action: { id: 'covalent', events: ['co_'] }, zh: '氧最外層有 6 粒電子，差 2 粒；氫得 1 粒，差 1 粒。將兩粒氫原子拖去氧原子兩邊，同佢共用電子。',
      en: 'Oxygen has 6 outer electrons and needs 2 more; hydrogen has 1 and needs 1 more. Drag the two hydrogen atoms to either side of the oxygen to share electrons.' },
    { tag: 'observe', zh: '每粒氫同氧共用一對電子，大家外層都好似填滿咗。呢種共用電子嘅連接叫「共價鍵」，砌成一粒水分子。',
      en: 'Each hydrogen shares a pair of electrons with oxygen, so everyone\'s outer shell is effectively full. This sharing is called a covalent bond, and it makes a water molecule.' },
    { tag: 'feynman', zh: '離子鍵好似交換禮物：鈉將一粒電子送俾氯，一個變正、一個變負，於是互相吸引。共價鍵好似兩個人一齊揸住一條跳繩：條繩（電子）係大家共用嘅，所以兩個人分唔開。',
      en: 'An ionic bond is like giving a present: sodium gives an electron to chlorine, one becomes positive and the other negative, so they attract. A covalent bond is like two people holding the same skipping rope: the rope (the electrons) belongs to both, so they stay together.' },
    { tag: 'first', zh: '由最基本諗起：最外層有 8 粒電子（氫同氦就係 2 粒）會特別穩定。金屬原子容易失去電子，非金屬原子容易得到電子，所以金屬同非金屬之間多數形成離子鍵；非金屬同非金屬之間，就靠共用電子形成共價鍵。',
      en: 'Back to basics: a full outer shell of 8 electrons (2 for hydrogen and helium) is especially stable. Metal atoms lose electrons easily and non-metal atoms gain them easily, so metals and non-metals usually form ionic bonds; non-metals joining with non-metals share electrons in covalent bonds.' },
    { tag: 'life', zh: '生活應用：食鹽係離子化合物，熔點好高，溶喺水之後可以導電；水、二氧化碳同糖，都係由共價鍵組成嘅分子。',
      en: 'Everyday life: table salt is an ionic compound with a very high melting point, and it conducts electricity when dissolved in water; water, carbon dioxide and sugar are molecules held together by covalent bonds.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '鉀係金屬，氯係非金屬。佢哋結合成氯化鉀，會用咩鍵？', en: 'Potassium is a metal and chlorine is a non-metal. What kind of bond holds them together in potassium chloride?' },
    options: [{ zh: '離子鍵：鉀送電子俾氯', en: 'An ionic bond: potassium gives an electron to chlorine' }, { zh: '共價鍵：佢哋共用電子', en: 'A covalent bond: they share electrons' }, { zh: '冇鍵，佢哋唔會結合', en: 'No bond: they do not join' }],
    correct: 0,
    right: { zh: '啱！鉀同鈉一樣，最外層得 1 粒電子，好容易送俾氯，形成離子鍵。', en: 'Right! Like sodium, potassium has 1 outer electron that it readily gives to chlorine, forming an ionic bond.' },
    wrong: { zh: '再諗下鈉同氯：金屬同非金屬之間，係送電子定係共用電子？', en: 'Think about sodium and chlorine: between a metal and a non-metal, are electrons given or shared?' },
  },
  tools: [
    { id: 'i', label: { zh: '送電子', en: 'Give the electron' }, run: (c) => c.give() },
    { id: 'c', label: { zh: '連下一粒氫', en: 'Join the next hydrogen' }, run: (c) => c.hNext() },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = { ionic: false, covalent: false, h: 0 };
    const push = () => api.state({ ...S });
    const eMat = K.stdMat('#3b82f6', 0.3), outerMat = K.stdMat('#facc15', 0.3);
    // 簡化原子模型：原子核＋電子層圓環＋電子
    function makeAtom(shells, color, radii, opts = {}) {
      const g = new THREE.Group();
      const nuc = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 14), K.stdMat(color, 0.35)); g.add(nuc);
      const rings = [], dots = [];
      shells.forEach((n, k) => {
        const r = radii[k];
        const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.008, 6, 64), new THREE.MeshStandardMaterial({ color: '#94a3b8', transparent: true, opacity: 0.85 })); g.add(ring); rings.push(ring);
        for (let i = 0; i < n; i++) {
          if (opts.skipOuter && k === shells.length - 1) continue;
          const a = Math.PI / 2 + (i / Math.max(n, 1)) * Math.PI * 2 + (opts.offset || 0);
          const e = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), eMat); e.position.set(Math.cos(a) * r, Math.sin(a) * r, 0); g.add(e); dots.push(e);
        }
      });
      return { g, nuc, rings, dots };
    }
    // 左邊：鈉同氯
    const Y = T + 1.25, Z = -0.5, NA = V3(-2.2, Y, Z), CL = V3(-0.85, Y, Z);
    const na = makeAtom([2, 8, 1], '#a78bfa', [0.18, 0.32, 0.46], { skipOuter: true }); na.g.position.copy(NA); scene.add(na.g);
    const cl = makeAtom([2, 8, 7], '#4ade80', [0.18, 0.32, 0.46]); cl.g.position.copy(CL); scene.add(cl.g);
    const lNa = api.label((lang) => (S.ionic ? (lang === 'zh' ? '鈉離子 Na⁺（2,8）' : 'Sodium ion Na⁺ (2,8)') : (lang === 'zh' ? '鈉 Na（2,8,1）' : 'Sodium Na (2,8,1)')), { border: '#8b5cf6', h: 0.14 }); lNa.position.set(NA.x, T + 0.55, Z);
    const lCl = api.label((lang) => (S.ionic ? (lang === 'zh' ? '氯離子 Cl⁻（2,8,8）' : 'Chloride ion Cl⁻ (2,8,8)') : (lang === 'zh' ? '氯 Cl（2,8,7）' : 'Chlorine Cl (2,8,7)')), { border: '#16a34a', h: 0.14 }); lCl.position.set(CL.x, T + 0.55, Z);
    api.tap(na.g, () => api.emit('na'), { zh: '鈉原子', en: 'Sodium atom' }, [lNa]);
    api.tap(cl.g, () => api.emit('cl'), { zh: '氯原子', en: 'Chlorine atom' }, [lCl]);
    // 鈉嘅外層電子（可以拖）
    const eOut = new THREE.Group(); eOut.position.set(NA.x, NA.y + 0.46, Z); scene.add(eOut);
    const eBall = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), outerMat); eOut.add(eBall);
    const eHit = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); eOut.add(eHit); // 透明嘅捉手範圍
    const GAP = V3(CL.x, CL.y + 0.46, Z); // 氯外層嘅空位（最頂）
    const gapMark = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.01, 6, 20), new THREE.MeshBasicMaterial({ color: '#facc15' })); gapMark.position.copy(GAP); scene.add(gapMark);
    // 重新排氯外層，留個空位喺最頂
    cl.dots.slice(-7).forEach((e, i) => { const a = Math.PI / 2 + ((i + 1) / 8) * Math.PI * 2; e.position.set(Math.cos(a) * 0.46, Math.sin(a) * 0.46, 0); });
    // 右邊：氧同兩粒氫
    const OX = V3(1.35, Y - 0.05, Z);
    const oxy = makeAtom([2, 6], '#f87171', [0.18, 0.34]); oxy.g.position.copy(OX); scene.add(oxy.g);
    const lO = api.label((lang) => (S.covalent ? (lang === 'zh' ? '水分子 H₂O' : 'Water molecule H₂O') : (lang === 'zh' ? '氧 O（2,6）' : 'Oxygen O (2,6)')), { border: '#ef4444', h: 0.14 }); lO.position.set(OX.x, T + 0.55, Z);
    api.tap(oxy.g, () => api.emit('oxy'), { zh: '氧原子', en: 'Oxygen atom' }, [lO]);
    const ANG = (104.5 / 2) * Math.PI / 180;
    const SLOTS = [-1, 1].map((s) => V3(OX.x + s * Math.sin(ANG) * 0.5, OX.y - Math.cos(ANG) * 0.5, Z));
    const slotUsed = [false, false];
    const hs = [0, 1].map((i) => {
      const a = makeAtom([1], '#e2e8f0', [0.16]);
      const g = new THREE.Group(); g.add(a.g); g.position.set(0.7 + i * 1.3, T + 0.3, 0.95); scene.add(g);
      const hit = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); g.add(hit);
      const l = api.label({ zh: '氫 H（1）', en: 'Hydrogen H (1)' }, { border: '#94a3b8', h: 0.13 }); l.position.set(0, -0.3, 0.1); g.add(l);
      return { g, l, home: g.position.clone(), slot: -1 };
    });
    const bonds = [];
    // 後排：鹽、水杯
    const saltG = new THREE.Group(); saltG.position.set(-2.85, T, -1.2); scene.add(saltG);
    for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), K.stdMat('#ffffff', 0.3)); c.position.set((i % 3) * 0.1 - 0.1, 0.04 + Math.floor(i / 3) * 0.08, 0); saltG.add(c); }
    const glass = K.makeVessel(K.beakerProfile(0.15, 0.32), { liquidColor: '#bae6fd', level: 0.24, opacity: 0.6 }); glass.group.position.set(2.85, T, -1.2); scene.add(glass.group);
    [[saltG, 'salt', { zh: '食鹽', en: 'Table salt' }, -2.85, 0.35], [glass.group, 'water', { zh: '一杯水', en: 'A glass of water' }, 2.85, 0.55]].forEach(([o, ev, name, x, y]) => {
      const l = api.label(name, { border: '#94a3b8', h: 0.14 }); l.position.set(x, T + y, -1.15);
      api.tap(o, () => api.emit(ev), name, [l]);
    });

    let busy = false;
    async function give(h = hE) {
      if (busy || S.ionic) return false; busy = true;
      await K.moveTo(tw, eOut, GAP, 0, 0.5);
      gapMark.visible = false;
      na.rings[2].material.opacity = 0.12; // 鈉嘅外層冇咗電子
      S.ionic = true; push(); lNa.userData.refresh(); lCl.userData.refresh();
      api.emit('io_give');
      // 正負相吸：鈉離子行近氯離子
      const n0 = na.g.position.clone(), to = V3(CL.x - 0.85, Y, Z);
      await tw.to(1.0, (k) => { na.g.position.lerpVectors(n0, to, k); na.g.scale.setScalar(1 - 0.15 * k); cl.g.scale.setScalar(1 + 0.05 * k); });
      h.setHome(eOut.position.clone());
      busy = false; api.done('ionic');
    }
    async function joinH(i, si, h) {
      if (busy || hs[i].slot >= 0 || slotUsed[si]) return false; busy = true;
      const g = hs[i].g, to = SLOTS[si];
      hs[i].l.visible = false;
      await K.moveTo(tw, g, V3(to.x, to.y + 0.3, to.z + 0.3), 0, 0.4);
      await K.moveTo(tw, g, to, 0, 0.3);
      slotUsed[si] = true; hs[i].slot = si; h.setHome(to.clone());
      // 共用電子對：兩條黃色短線
      const mid = to.clone().lerp(OX, 0.5);
      const bond = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.12, 4, 10), outerMat); bond.position.copy(mid); bond.lookAt(OX); bond.rotateX(Math.PI / 2); scene.add(bond); bonds.push(bond);
      S.h += 1; push();
      if (S.h >= 2) { S.covalent = true; push(); lO.userData.refresh(); api.emit('co_two'); api.done('covalent'); } else api.emit('co_one');
      busy = false;
    }
    const hE = api.drag(eOut, { label: { zh: '鈉嘅外層電子', en: 'Sodium\'s outer electron' }, lift: 0.4, enabled: () => !busy && !S.ionic,
      targets: () => [{ key: 'gap', pos: GAP, r: 0.25, ringY: T, accept: () => !S.ionic }], onDrop: (tg, h) => give(h), onTap: () => { if (!busy && !S.ionic) hE.dropOn('gap'); } });
    const hH = hs.map((hh, i) => api.drag(hh.g, { label: { zh: '氫原子', en: 'Hydrogen atom' }, lift: 0.8, enabled: () => !busy && hh.slot < 0,
      targets: () => SLOTS.map((p, si) => ({ key: 'o' + si, pos: p, r: 0.3, ringY: T, accept: () => !slotUsed[si] })),
      onDrop: (tg, h) => joinH(i, Number(tg.key.slice(1)), h), onTap: () => { const si = slotUsed.indexOf(false); if (!busy && hh.slot < 0 && si >= 0) hH[i].dropOn('o' + si); } }));

    const nextH = () => hs.findIndex((hh) => hh.slot < 0);
    push();
    return {
      cam: { pos: [-0.2, 3.1, 5.0], target: [-0.2, 1.3, -0.3], fitW: 6.4 },
      give: () => { if (!busy && !S.ionic) hE.dropOn('gap'); },
      hNext() { const i = nextH(), si = slotUsed.indexOf(false); if (!busy && i >= 0 && si >= 0) hH[i].dropOn('o' + si); },
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (id === 'ionic' && !S.ionic) await hE.dropOn('gap');
        if (id === 'covalent') for (let i = nextH(), c = 0; i >= 0 && c < 3; i = nextH(), c++) { while (busy) await tw.wait(0.1); await hH[i].dropOn('o' + slotUsed.indexOf(false)); await api.waitSpeech(); }
      },
      getHint(id) {
        if (busy) return null;
        if (id === 'ionic') return S.ionic ? null : { from: K.worldOf(eOut), to: GAP };
        if (id === 'covalent') { const i = nextH(), si = slotUsed.indexOf(false); return i < 0 || si < 0 ? null : { from: K.worldOf(hs[i].g), to: SLOTS[si] }; }
        return null;
      },
      update(dt, t) { gapMark.scale.setScalar(1 + 0.25 * Math.sin(t * 5)); },
      reset() {
        tw.clear(); busy = false;
        Object.assign(S, { ionic: false, covalent: false, h: 0 }); push(); [lNa, lCl, lO].forEach((l) => l.userData.refresh());
        na.g.position.copy(NA); na.g.scale.setScalar(1); cl.g.scale.setScalar(1); na.rings[2].material.opacity = 0.85; gapMark.visible = true;
        bonds.forEach((b) => { scene.remove(b); b.geometry.dispose(); }); bonds.length = 0; slotUsed.fill(false);
        hs.forEach((hh, i) => { hh.slot = -1; hh.l.visible = true; hH[i].setHome(hh.home); });
        hE.setHome(V3(NA.x, NA.y + 0.46, Z));
        [hE, ...hH].forEach((h) => { h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.busy = false; });
      },
    };
  },
};
