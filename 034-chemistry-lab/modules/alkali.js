/* Topic 4.2 鹼：鹼的性質、鹼與金屬離子的沉澱反應 */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V2, V3 } = K;

const SOL = [
  { id: 'cu', zh: '含銅溶液', en: 'Copper solution', tag: { zh: '含銅溶液', en: 'Copper' }, liq: '#5ab8ea', after: '#b9def2', ppt: '#2d7fd3', pzh: '藍色', pen: 'blue' },
  { id: 'fe3', zh: '鐵(III) 溶液（黃色）', en: 'Iron(III) solution (yellow)', tag: { zh: '鐵(III) 溶液', en: 'Iron(III)' }, liq: '#e6b043', after: '#f3e2b8', ppt: '#9a4a1c', pzh: '紅啡色', pen: 'reddish-brown' },
  { id: 'fe2', zh: '鐵(II) 溶液（淺綠色）', en: 'Iron(II) solution (pale green)', tag: { zh: '鐵(II) 溶液', en: 'Iron(II)' }, liq: '#bfe3a0', after: '#e4f1d8', ppt: '#55703a', pzh: '暗綠色', pen: 'dirty green' },
];

function Panel({ S }) {
  const { pick, lang } = useApp();
  const zh = lang === 'zh';
  return html`<div className="grid gap-2 text-sm">
    <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2">
      <b className="text-slate-700">${zh ? '紅色石蕊試紙 ＋ 稀氫氧化鈉：' : 'Red litmus + dilute sodium hydroxide: '}</b>
      <span className="text-slate-600">${S.litmus ? (zh ? '變藍色 → 鹼性 ✅' : 'turns blue → alkaline ✅') : '—'}</span>
    </div>
    <div className="grid grid-cols-3 gap-2">
      ${SOL.map((s) => html`<div key=${s.id} className="rounded-xl bg-slate-50 ring-1 ring-slate-200 px-2 py-2 text-center">
        <div className="font-bold text-slate-700 leading-tight">${pick(s)}</div>
        ${S[s.id] ? html`<div className="mt-1 flex items-center justify-center gap-1"><span className="w-5 h-5 rounded-full inline-block" style=${{ background: s.ppt }}></span><span className="text-slate-600">${zh ? s.pzh + '沉澱' : s.pen + ' solid'}</span></div>` : html`<div className="mt-1 text-slate-400">—</div>`}
      </div>`)}
    </div>
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    ${[['#5ab8ea', '#2d7fd3', 50], ['#e6b043', '#9a4a1c', 100], ['#bfe3a0', '#55703a', 150]].map(([l, p, x]) => html`<g key=${x}>
      <rect x=${x - 14} y="8" width="28" height="92" rx="14" fill="#fff" fillOpacity=".9" stroke="#cbd5e1" strokeWidth="3" />
      <rect x=${x - 10} y="40" width="20" height="56" rx="10" fill=${l} />
      ${[0, 1, 2, 3, 4].map((i) => html`<circle key=${i} cx=${x - 6 + (i % 3) * 6} cy=${78 + Math.floor(i / 3) * 8} r="4" fill=${p} />`)}
    </g>`)}
  </svg>`;
}

const events = {
  litmus: { zh: '紅色石蕊試紙一蘸落稀氫氧化鈉溶液，就變咗藍色！所以稀氫氧化鈉係鹼。', en: 'As soon as the red litmus paper dips into the sodium hydroxide solution, it turns blue! So sodium hydroxide is an alkali.' },
  pre_cu: { zh: '哇！藍色溶液入面突然出現好多藍色、好似棉花咁嘅固體。佢叫做「沉澱」。', en: 'Wow! Lots of fluffy blue solid suddenly appears in the blue solution. It is called a precipitate.' },
  pre_fe3: { zh: '黃色嘅鐵(III) 溶液變出紅啡色嘅沉澱，好似鐵鏽嘅顏色！', en: 'The yellow iron(III) solution makes a reddish-brown precipitate, the colour of rust!' },
  pre_fe2: { zh: '淺綠色嘅鐵(II) 溶液變出暗綠色嘅沉澱。放耐咗，空氣入面嘅氧氣會將佢慢慢變成鐵(III)，所以會變啡色，同鐵生鏽一樣。', en: 'The pale green iron(II) solution makes a dirty green precipitate. If you leave it, oxygen in the air slowly turns it into iron(III), so it goes brown, just like rusting iron.' },
  feWhy: { zh: '兩支都係鐵，點解一黃一綠？因為鐵原子可以交出兩粒電子，變成「鐵(II) 離子」，又叫亞鐵離子，溶液係淺綠色；亦可以交出三粒電子，變成「鐵(III) 離子」，溶液係黃色。交出幾多粒電子唔同，溶液顏色唔同，遇到鹼變出嘅沉澱都唔同：鐵(II) 係暗綠色，鐵(III) 係紅啡色。', en: 'Both tubes contain iron, so why is one yellow and one green? An iron atom can give away two electrons to become an iron(II) ion, which makes a pale green solution. Or it can give away three electrons to become an iron(III) ion, which makes a yellow solution. Because they lose a different number of electrons, their solutions are different colours, and they make different precipitates with alkali: iron(II) gives dirty green, and iron(III) gives reddish-brown.' },
  allPre: { zh: '三支試管都試晒喇！三種唔同顏色嘅沉澱，話俾我哋知溶液入面有咩金屬。', en: 'All three tubes are done! The three colours tell us which metal is in each solution.' },
  soap: { zh: '番鹼係弱鹼性，可以將油污拉落水度沖走。', en: 'Soap is weakly alkaline. It helps pull grease into the water so it can be washed away.' },
  soda: { zh: '梳打粉係弱鹼，可以用嚟焗蛋糕，令蛋糕發起。', en: 'Baking soda is a weak alkali. It is used in baking to help cakes rise.' },
  drain: { zh: '通渠水係強鹼，好危險！佢可以溶解頭髮同油脂，但係都會傷皮膚同眼。一定要由大人戴手套使用。', en: 'Drain cleaner is a strong alkali and very dangerous! It dissolves hair and grease, but it can also hurt skin and eyes. Only grown-ups wearing gloves should use it.' },
  beaker: { zh: '呢杯係稀氫氧化鈉溶液，實驗室常用嘅鹼。睇落同清水一樣，所以一定要睇清楚標籤！', en: 'This is dilute sodium hydroxide solution, a common lab alkali. It looks just like water, so always read the label!' },
  tube: { zh: '呢啲試管裝住含金屬嘅溶液。用滴瓶加鹼落去，睇下會變出咩。', en: 'These tubes hold solutions containing metals. Add alkali with the dropper to see what appears.' },
};

export default {
  id: 'alkali', topics: ['4.2'], accent: '#0ea5e9', dark: '#0369a1', bg: 'linear-gradient(135deg,#e0f2fe,#e0e7ff)', Art,
  title: { zh: '鹼性大發現', en: 'Discovering Alkalis' },
  desc: { zh: '鹼係酸嘅「相反」。用石蕊試紙認出鹼，再用鹼變出彩色沉澱！', en: 'Alkalis are the "opposite" of acids. Spot an alkali with litmus paper, then use it to make coloured precipitates!' },
  steps: [
    { tag: 'intro', zh: '鹼可以話係酸嘅「相反」。屋企都有：番鹼、梳打粉係弱鹼，通渠水係強鹼。鹼味道苦，摸落滑潺潺。但係記住：千祈唔好試味，亦唔好摸實驗室嘅鹼！右邊嘅物件可以撳嚟睇介紹。',
      en: 'Alkalis are a bit like the "opposite" of acids. You have some at home: soap and baking soda are weak alkalis, and drain cleaner is a strong alkali. Alkalis taste bitter and feel slippery. But remember: never taste or touch lab alkalis! Tap the objects on the right to learn about them.' },
    { tag: 'try', action: { id: 'litmus', events: ['litmus'] }, zh: '點樣認出鹼？將紅色石蕊試紙拖落左邊嗰杯稀氫氧化鈉溶液，睇下佢會唔會變色。',
      en: 'How can we spot an alkali? Drag the red litmus paper into the beaker of dilute sodium hydroxide on the left and see if it changes colour.' },
    { tag: 'observe', zh: '紅色石蕊試紙變藍色！記住呢個口訣：「酸令藍變紅，鹼令紅變藍」。', en: 'The red litmus turns blue! Remember: acids turn blue litmus red, and alkalis turn red litmus blue.' },
    { tag: 'try', action: { id: 'pre', events: ['pre_'] }, zh: '鹼遇到某啲含金屬嘅溶液，會「變出」有顏色嘅固體。將稀氫氧化鈉滴瓶拖去三支試管，逐支試！',
      en: 'When an alkali meets certain solutions containing metals, it makes a coloured solid appear. Drag the sodium hydroxide dropper to each of the three tubes!' },
    { tag: 'observe', zh: '三支試管變出三種顏色嘅固體：藍色、紅啡色同暗綠色。呢啲由溶液入面突然出現、睇得見嘅固體，叫做「沉澱」。顏色好似指紋咁，話俾我哋知溶液入面係銅定係鐵。兩支鐵溶液顏色唔同，係因為一支係鐵(II)，一支係鐵(III)。可以撳「點解兩支鐵溶液唔同色？」聽詳細解釋。',
      en: 'The three tubes make three different coloured solids: blue, reddish-brown and dirty green. A solid that suddenly appears out of a solution is called a precipitate. Like a fingerprint, its colour tells us whether the solution has copper or iron in it. The two iron solutions look different because one contains iron(II) and the other iron(III). Tap "Why are the iron solutions different colours?" to find out more.' },
    { tag: 'feynman', zh: '點解鹼摸落滑潺潺？因為鹼會同你皮膚表面嘅油脂反應，變咗少少肥皂！即係話，鹼其實喺度蝕緊你嘅皮膚。所以實驗室嘅鹼，千祈唔好摸。',
      en: 'Why do alkalis feel slippery? Because the alkali reacts with the oils on your skin and turns a little of it into soap! That means the alkali is actually attacking your skin. So never touch lab alkalis.' },
    { tag: 'first', zh: '由最基本諗起：鹼溶喺水會放出「氫氧根離子」。佢同酸嘅氫離子係一對：一見面就會結合變成水，所以鹼可以抵消酸。氫氧根離子遇到銅、鐵呢類金屬離子，又會手拖手變成唔溶喺水嘅固體，即係沉澱。同一種金屬可以有唔同嘅離子，例如鐵(II) 同鐵(III)，所以沉澱顏色都唔同。',
      en: 'Back to basics: alkalis release hydroxide ions in water. Hydroxide ions and the hydrogen ions from acids are a pair: when they meet, they join to make water, which is why alkalis can cancel out acids. When hydroxide ions meet metal ions like copper or iron, they hold hands and make a solid that does not dissolve: a precipitate. The same metal can form different ions, such as iron(II) and iron(III), so their precipitates are different colours.' },
    { tag: 'life', zh: '生活應用：番鹼幫手洗走油污；梳打粉用嚟焗蛋糕；通渠水溶解塞住水渠嘅頭髮同油脂。檢驗人員亦會用沉澱嘅顏色，查出水入面有冇金屬。',
      en: 'Everyday life: soap helps wash away grease; baking soda helps cakes rise; drain cleaner dissolves hair and grease that block drains. Testers also use precipitate colours to check whether water contains metals.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '通渠水係強鹼。使用嘅時候，應該點做？', en: 'Drain cleaner is a strong alkali. How should it be used?' },
    options: [
      { zh: '用手直接撈勻佢', en: 'Mix it with your bare hands' },
      { zh: '由大人戴手套使用，小心唔好濺到皮膚同眼', en: 'A grown-up uses it wearing gloves, taking care not to splash skin or eyes' },
      { zh: '倒啲落飲品度試下味', en: 'Pour some into a drink to taste it' },
    ],
    correct: 1,
    right: { zh: '強鹼會蝕壞皮膚同眼，所以一定要由大人戴手套小心使用，用完要洗手。', en: 'Strong alkalis damage skin and eyes, so a grown-up must use them carefully with gloves, and wash their hands afterwards.' },
    wrong: { zh: '再諗下：鹼摸落滑潺潺，係因為佢喺度蝕緊皮膚。咁應該點保護自己？', en: 'Think again: alkalis feel slippery because they are attacking your skin. So how should we protect ourselves?' },
  },
  tools: [
    { id: 'l', label: { zh: '用紅色石蕊試紙', en: 'Use red litmus paper' }, run: (c) => c.litmus() },
    { id: 'p', label: { zh: '加鹼落下一支試管', en: 'Add alkali to the next tube' }, run: (c) => c.addNext() },
    { id: 'w', label: { zh: '🔍 點解兩支鐵溶液唔同色？', en: '🔍 Why are the iron solutions different colours?' }, run: (c) => c.whyIron() },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = { litmus: false, cu: false, fe3: false, fe2: false };
    const push = () => api.state({ ...S });
    // 左：稀氫氧化鈉燒杯
    const bk = K.makeVessel(K.beakerProfile(0.34, 0.75), { liquidColor: '#e8f1f8', level: 0.42, opacity: 0.7, sx: 0.94 });
    bk.group.position.set(-2.35, T + 0.01, -0.3); scene.add(bk.group);
    const lbk = api.label({ zh: '稀氫氧化鈉', en: 'Sodium hydroxide' }, { border: '#0ea5e9', h: 0.18 }); lbk.position.set(-2.35, T + 1.05, -0.3);
    api.tap(bk.group, () => api.emit('beaker'), { zh: '稀氫氧化鈉燒杯', en: 'Beaker of sodium hydroxide' }, [lbk]);
    const bkMouth = V3(-2.35, T + 0.8, -0.3);
    // 中：三支試管
    const xs = [-0.75, 0.35, 1.45], zT = -0.45, TY = T + 0.07, LV = 0.66;
    // 試管架以 0 為中心，所以孔位要減返架嘅位置
    const rack = K.makeRack(xs.map((x) => x - 0.35), 0.2, 3.3, 0.8); rack.position.set(0.35, T, zT); scene.add(rack);
    const tubes = SOL.map((s, i) => {
      const v = K.makeVessel(K.tubeProfile(0.17, 1.25), { liquidColor: s.liq, level: LV, opacity: 0.85 });
      v.group.position.set(xs[i], TY, zT); scene.add(v.group);
      const cloud = K.makeCloud(v.group, { color: s.ppt, count: 80, r: 0.11, yMin: 0.42, yMax: 0.64, yBottom: 0.06 });
      // 3D 標籤用短名，記錄表先用全名
      const lab = api.label(s.tag, { border: s.ppt, h: 0.17 }); lab.position.set(xs[i], T + 1.55, zT);
      api.tap(v.group, () => (!S[s.id] ? addTo(i) : api.emit(s.id === 'cu' ? 'tube' : 'feWhy')), { zh: s.zh, en: s.en }, [lab]);
      return { ...v, cloud, mouth: V3(xs[i], TY + 1.25, zT) };
    });
    // 右：家居鹼
    const soapBar = new THREE.Mesh(new K.RoundedBoxGeometry(0.42, 0.14, 0.28, 3, 0.05), K.stdMat('#f9c8dd', 0.5)); soapBar.position.set(3.0, T + 0.07, 0.75); scene.add(soapBar);
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.46, 0.2), K.stdMat('#f97316', 0.6)); box.position.set(3.0, T + 0.23, 0.0); scene.add(box);
    const drain = K.makeBottle({ body: '#1e293b', cap: '#facc15' }); drain.g.position.set(3.0, T, -0.8); drain.g.scale.setScalar(1.15); scene.add(drain.g);
    [[soapBar, 'soap', { zh: '番鹼', en: 'Soap' }, 0.75, 0.32], [box, 'soda', { zh: '梳打粉', en: 'Baking soda' }, 0.0, 0.62], [drain.g, 'drain', { zh: '通渠水（強鹼）', en: 'Drain cleaner (strong)' }, -0.8, 1.0]].forEach(([o, ev, name, z, y]) => {
      const l = api.label(name, { border: '#94a3b8', h: 0.16 }); l.position.set(3.0, T + y, z + 0.05);
      api.tap(o, () => api.emit(ev), name, [l]);
    });
    // 工具：紅色石蕊試紙
    const lit = new THREE.Group(); lit.position.set(-2.4, T + 0.05, 0.95); scene.add(lit);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.012), K.stdMat('#e2475a', 0.9)); strip.position.y = 0.3; lit.add(strip);
    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.09, 0.07), K.stdMat('#f59e0b', 0.5)); clip.position.y = 0.64; lit.add(clip);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.12, 20), K.stdMat('#e2e8f0', 0.5)); cup.position.set(-2.4, T + 0.06, 0.95); scene.add(cup);
    const lLit = api.label({ zh: '紅色石蕊試紙', en: 'Red litmus paper' }, { border: '#e2475a', h: 0.17 }); lLit.position.set(0, 0.0, 0.42); lit.add(lLit);
    // 工具：稀氫氧化鈉滴瓶
    const dr = K.makeBottle({ body: '#e8f1f8', cap: '#0369a1', dropper: true, glass: true }); dr.g.position.set(0.35, T, 0.95); scene.add(dr.g);
    const lDr = api.label({ zh: '稀氫氧化鈉滴瓶', en: 'Sodium hydroxide dropper' }, { border: '#0ea5e9', h: 0.17 }); lDr.position.set(0, 0.1, 0.42); dr.g.add(lDr);

    let busy = false;
    async function litmus(h = hLit) {
      if (busy || S.litmus) return false; busy = true;
      await K.moveTo(tw, lit, V3(-2.35, T + 1.4, -0.3), 0, 0.6);
      await tw.to(0.6, (k) => { lit.position.y = T + 1.4 - 1.1 * k; });
      api.emit('litmus');
      const from = strip.material.color.clone();
      await tw.to(1.0, (k) => strip.material.color.copy(from).lerp(new THREE.Color('#3f6fd8'), k));
      await tw.to(0.6, (k) => { lit.position.y = T + 0.3 + 1.1 * k; });
      S.litmus = true; push();
      await h.returnHome();
      busy = false; api.done('litmus');
    }
    async function addTo(i, h = hDr) {
      if (busy || S[SOL[i].id]) return false; busy = true;
      const target = V3(xs[i], T + 1.5, zT);
      await K.moveTo(tw, dr.g, K.tipPose(V2(0, 0.86), 2.1, target), 2.1, 0.6);
      api.emit('pre_' + SOL[i].id);
      await K.dripDrop(scene, tw, target, V3(xs[i], TY + LV, zT), '#e8f1f8');
      const tb = tubes[i]; const from = tb.mat.color.clone(), to = new THREE.Color(SOL[i].after);
      S[SOL[i].id] = true; push();
      const back = h.returnHome();
      await tw.to(1.6, (k) => { tb.cloud.set(k, 0); tb.mat.color.copy(from).lerp(to, k * 0.6); });
      await back;
      busy = false;
      // 沉澱慢慢沉落底
      tw.to(6, (k) => { tb.cloud.set(1, 0.45 * k); tb.mat.color.copy(from).lerp(to, 0.6 + 0.4 * k); });
      if (SOL.every((s) => S[s.id])) { api.done('pre'); api.emit('allPre'); }
    }
    const nextI = () => SOL.findIndex((s) => !S[s.id]);
    const hLit = api.drag(lit, { label: { zh: '紅色石蕊試紙', en: 'Red litmus paper' }, lift: 1.0, extra: [cup], enabled: () => !busy && !S.litmus,
      targets: () => [{ key: 'bk', pos: bkMouth, r: 0.55, ringY: T, accept: () => !S.litmus }], onDrop: (tg, h) => litmus(h), onTap: () => litmus() });
    const hDr = api.drag(dr.g, { label: { zh: '稀氫氧化鈉滴瓶', en: 'Sodium hydroxide dropper' }, lift: 0.9, enabled: () => !busy,
      targets: () => SOL.map((s, i) => ({ key: 't' + i, pos: tubes[i].mouth, r: 0.45, ringY: T, accept: () => !S[s.id] })),
      onDrop: (tg, h) => addTo(Number(tg.key.slice(1)), h), onTap: () => { const i = nextI(); if (i >= 0) hDr.dropOn('t' + i); } });

    push();
    return {
      cam: { pos: [0.3, 4.0, 5.2], target: [0.3, 1.45, -0.1], fitW: 6.9 },
      litmus: () => (S.litmus ? null : hLit.dropOn('bk')),
      addNext: () => { const i = nextI(); if (i >= 0 && !busy) hDr.dropOn('t' + i); },
      whyIron: () => api.emit('feWhy'),
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (id === 'litmus' && !S.litmus) await hLit.dropOn('bk');
        if (id === 'pre') {
          for (let i = nextI(); i >= 0; i = nextI()) { while (busy) await tw.wait(0.1); await hDr.dropOn('t' + i); await api.waitSpeech(); }
        }
      },
      getHint(id) {
        if (id === 'litmus') return { from: K.worldOf(lit, 0.4), to: bkMouth };
        if (id === 'pre') { const i = nextI(); return i < 0 ? null : { from: K.worldOf(dr.g, 0.5), to: tubes[i].mouth }; }
        return null;
      },
      reset() {
        tw.clear(); busy = false; Object.keys(S).forEach((k) => { S[k] = false; }); push();
        strip.material.color.set('#e2475a');
        tubes.forEach((tb, i) => { tb.cloud.set(0, 0); tb.mat.color.set(SOL[i].liq); });
        [hLit, hDr].forEach((h) => { h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.busy = false; });
      },
    };
  },
};
