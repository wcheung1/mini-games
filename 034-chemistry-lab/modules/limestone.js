/* Topic 1.3 岩石和礦物：粉筆、石灰石和大理石；鈣鹽（石灰石循環） */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V2, V3 } = K;

const STAGES = [
  { zh: '石灰石（碳酸鈣）', en: 'Limestone (calcium carbonate)' },
  { zh: '生石灰（氧化鈣）', en: 'Quicklime (calcium oxide)' },
  { zh: '熟石灰（氫氧化鈣）', en: 'Slaked lime (calcium hydroxide)' },
  { zh: '石灰水', en: 'Limewater' },
  { zh: '變返碳酸鈣（奶白色）', en: 'Calcium carbonate again (milky)' },
];

function Panel({ S }) {
  const { pick, lang } = useApp();
  const zh = lang === 'zh';
  const st = S.stage || 0;
  return html`<div className="grid gap-1.5 text-sm">
    ${STAGES.map((s, i) => html`<div key=${i} className=${`flex items-center gap-2 rounded-xl px-3 py-2 ring-1 ${i <= st ? 'bg-stone-50 ring-stone-300' : 'bg-slate-50 ring-slate-200 opacity-60'}`}>
      <span className="w-6 h-6 shrink-0 rounded-full grid place-items-center text-xs font-black text-white" style=${{ background: i <= st ? '#78716c' : '#cbd5e1' }}>${i + 1}</span>
      <span className="flex-1 font-bold text-slate-700">${pick(s)}</span>
      <span>${i < st || (i === st && st === 4) ? '✅' : i === st ? '👈' : ''}</span>
    </div>`)}
    ${st === 4 ? html`<p className="rounded-xl bg-amber-50 ring-1 ring-amber-200 px-3 py-2 text-amber-900">🔄 ${zh ? '轉咗一個圈，返到碳酸鈣！' : 'Full circle: back to calcium carbonate!'}</p>` : null}
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    <circle cx="100" cy="55" r="38" fill="none" stroke="#a8a29e" strokeWidth="4" strokeDasharray="8 6" />
    <path d="M136 46 l6 10 l6 -10" fill="none" stroke="#a8a29e" strokeWidth="4" />
    ${[[100, 17, '#a8a29e'], [138, 55, '#f8fafc'], [100, 93, '#e7e5e4'], [62, 55, '#bae6fd']].map(([x, y, c]) => html`<circle key=${x + '' + y} cx=${x} cy=${y} r="13" fill=${c} stroke="#78716c" strokeWidth="3" />`)}
    <path d="M100 4 q-6 -2 -4 4" stroke="#f97316" strokeWidth="3" fill="none" />
  </svg>`;
}

const events = {
  ht_on: { zh: '開始強熱……石灰石慢慢發出耀眼嘅白光！', en: 'Heating strongly… The limestone starts to glow with a dazzling white light!' },
  ht_done: { zh: '強熱之後，石灰石變成白色、鬆脆嘅生石灰。我用鉗將佢夾去白瓷碟度凍。', en: 'After strong heating, the limestone has become white, crumbly quicklime. I have moved it to a white tile with tongs to cool.' },
  wt_need: { zh: '要先強熱石灰石，變成生石灰先好加水。', en: 'Heat the limestone first to make quicklime, then add water.' },
  wt_hiss: { zh: '嘶嘶！生石灰冒出蒸氣、變得好熱，仲散開變成白色粉末，呢個就係熟石灰！', en: 'Hiss! The quicklime steams, gets very hot and crumbles into a white powder. This is slaked lime!' },
  wt_lime: { zh: '將熟石灰溶落水，攪勻再過濾，就得到清澈嘅石灰水。', en: 'Stir the slaked lime into water and filter it, and you get clear limewater.' },
  bw_need: { zh: '要先整好石灰水，先好吹氣。', en: 'Make the limewater first, then blow into it.' },
  bw_milky: { zh: '石灰水變咗奶白色！我哋呼出嘅二氧化碳，令佢變返碳酸鈣。', en: 'The limewater has turned milky! The carbon dioxide we breathe out turns it back into calcium carbonate.' },
  burner: { zh: '本生燈開到最猛嘅藍色火焰，先夠熱分解石灰石。強熱一定要由老師做。', en: 'The Bunsen burner\'s hottest blue flame is needed to break down limestone. Only a teacher should do strong heating.' },
  chalk: { zh: '粉筆、石灰石同大理石，主要成分都係碳酸鈣。', en: 'Chalk, limestone and marble are all mainly calcium carbonate.' },
  cement: { zh: '水泥係用石灰石同黏土一齊燒製出嚟嘅。', en: 'Cement is made by heating limestone with clay.' },
  lime: { zh: '呢杯水等陣會變成石灰水。', en: 'This water will soon become limewater.' },
};

export default {
  id: 'limestone', topics: ['1.3'], accent: '#78716c', dark: '#44403c', bg: 'linear-gradient(135deg,#f5f5f4,#e0f2fe)', Art,
  title: { zh: '石灰石三變', en: 'The Limestone Cycle' },
  desc: { zh: '一粒石灰石，強熱、加水、吹氣，變三變之後竟然變返原狀！', en: 'Heat it, add water, blow into it: a lump of limestone changes three times and ends up back where it started!' },
  steps: [
    { tag: 'intro', zh: '石灰石、粉筆同大理石，主要成分都係碳酸鈣。今日我哋將一粒石灰石變三變：強熱變生石灰，加水變熟石灰，溶喺水變石灰水，最後再變返碳酸鈣！安全提提你：強熱一定要由老師做，要戴護目鏡；生石灰有腐蝕性，加水會變得好熱；用飲管只可以吹氣，千祈唔好吸。後面嘅物件可以撳嚟睇介紹。',
      en: 'Limestone, chalk and marble are all mainly calcium carbonate. Today we will change a lump of limestone three times: strong heat turns it into quicklime, water turns that into slaked lime, which dissolves to make limewater, and finally it turns back into calcium carbonate! Safety first: only a teacher does strong heating, and everyone wears goggles. Quicklime is corrosive and gets very hot with water. With the straw, only blow out, never suck in. Tap the objects at the back to learn about them.' },
    { tag: 'try', action: { id: 'heat', events: ['ht_'] }, zh: '將石灰石拖上本生燈上面嘅鐵絲網，老師會用最猛嘅火強熱佢。',
      en: 'Drag the limestone onto the gauze above the Bunsen burner. The teacher will heat it strongly with the hottest flame.' },
    { tag: 'observe', zh: '石灰石強熱嗰陣發出好光嘅白光，之後變成白色、鬆脆嘅「生石灰」。佢放走咗二氧化碳，所以仲輕咗。',
      en: 'While being heated strongly, the limestone glows brilliantly white, then turns into white, crumbly quicklime. It has given off carbon dioxide, so it is lighter too.' },
    { tag: 'try', action: { id: 'water', events: ['wt_'] }, zh: '生石灰已經喺白瓷碟凍咗。將滴管拖過去，滴幾滴水落去，睇下會點。',
      en: 'The quicklime has cooled on the white tile. Drag the dropper over and add a few drops of water. What happens?' },
    { tag: 'observe', zh: '生石灰「嘶嘶」聲、冒出蒸氣、變熱，仲散開變成白色粉末，呢個叫「熟石灰」。將熟石灰溶落水再過濾，就得到清澈嘅「石灰水」。',
      en: 'The quicklime hisses, steams, gets hot and crumbles into a white powder called slaked lime. Dissolve slaked lime in water and filter it, and you get clear limewater.' },
    { tag: 'try', action: { id: 'blow', events: ['bw_'] }, zh: '將飲管拖入石灰水，輕輕吹氣，睇下會點。記住：只可以吹，唔好吸！',
      en: 'Drag the straw into the limewater and blow gently. What happens? Remember: only blow out, never suck in!' },
    { tag: 'feynman', zh: '呢個實驗好似行一個圓圈：碳酸鈣受熱，放走二氧化碳，變成生石灰；生石灰食咗水，變成熟石灰；熟石灰溶喺水，就係石灰水；石灰水遇到我哋呼出嘅二氧化碳，又變返碳酸鈣。轉咗一個圈，返到起點！',
      en: 'This experiment goes round in a circle: heated calcium carbonate gives off carbon dioxide and becomes quicklime; quicklime takes in water and becomes slaked lime; slaked lime dissolves to make limewater; limewater meets the carbon dioxide we breathe out and becomes calcium carbonate again. Round the circle and back to the start!' },
    { tag: 'first', zh: '由最基本諗起：碳酸鈣入面有鈣、碳同氧。強熱令佢拆開，二氧化碳飛走，剩低氧化鈣，即係生石灰。氧化鈣同水結合，變成氫氧化鈣，即係熟石灰，呢個反應會放出好多熱。氫氧化鈣少少溶喺水，就係石灰水；佢遇到二氧化碳，又會重新砌返碳酸鈣，因為碳酸鈣唔溶喺水，所以石灰水會變奶白色。',
      en: 'Back to basics: calcium carbonate contains calcium, carbon and oxygen. Strong heat breaks it apart: carbon dioxide escapes and calcium oxide, or quicklime, is left. Calcium oxide joins with water to make calcium hydroxide, or slaked lime, and this reaction gives out lots of heat. A little calcium hydroxide dissolves in water to make limewater. When it meets carbon dioxide, calcium carbonate forms again, and because it does not dissolve, the limewater turns milky.' },
    { tag: 'life', zh: '生活應用：石灰石可以用嚟整水泥同玻璃；農夫會用熟石灰中和太酸嘅泥土（記得中和魔法嗎？）；石灰水係實驗室測試二氧化碳嘅方法。以前戲院用燒熱嘅生石灰發出強光照住舞台，所以英文「limelight」即係「焦點」嘅意思。',
      en: 'Everyday life: limestone is used to make cement and glass; farmers use slaked lime to neutralise soil that is too acidic (remember Neutralisation Magic?); and limewater is how labs test for carbon dioxide. Theatres once lit their stages by heating quicklime until it glowed, which is why being in the "limelight" means being the centre of attention.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '石灰水遇到二氧化碳會變奶白色。個奶白色嘅固體係咩？', en: 'Limewater turns milky with carbon dioxide. What is the milky solid?' },
    options: [
      { zh: '鹽', en: 'Salt' },
      { zh: '碳酸鈣，即係石灰石嘅成分', en: 'Calcium carbonate, the same as limestone' },
      { zh: '冰', en: 'Ice' },
    ],
    correct: 1,
    right: { zh: '啱！石灰水同二氧化碳重新砌返碳酸鈣，即係轉咗一個圈，返到石灰石。', en: 'Right! Limewater and carbon dioxide rebuild calcium carbonate, so we have come full circle back to limestone.' },
    wrong: { zh: '再諗下個圓圈：由石灰石出發，最後變返咩？', en: 'Think about the circle: we started with limestone, so what did we end up with?' },
  },
  tools: [
    { id: 'h', label: { zh: '強熱石灰石', en: 'Heat the limestone' }, run: (c) => c.heat() },
    { id: 'w', label: { zh: '滴水', en: 'Add water' }, run: (c) => c.addWater() },
    { id: 'b', label: { zh: '吹氣', en: 'Blow' }, run: (c) => c.blow() },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = { stage: 0 };
    const push = () => api.state({ ...S });
    // 本生燈、三腳架、鐵絲網
    const BX = -0.7, BZ = -0.3;
    const burner = new THREE.Group(); burner.position.set(BX, T, BZ); scene.add(burner);
    const bBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.06, 28), K.stdMat('#334155', 0.5, 0.4)); bBase.position.y = 0.03; burner.add(bBase);
    const bBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.5, 18), K.stdMat('#94a3b8', 0.3, 0.8)); bBarrel.position.y = 0.3; burner.add(bBarrel);
    const addMat = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending });
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.07, 1, 20, 1, true), addMat('#5b9dff', 0.5)); flame.renderOrder = 6; burner.add(flame);
    const flameIn = new THREE.Mesh(new THREE.ConeGeometry(0.035, 1, 16, 1, true), addMat('#bfdbfe', 0.8)); flameIn.renderOrder = 7; burner.add(flameIn);
    const legMat = K.stdMat('#475569', 0.4, 0.6);
    [0, 1, 2].forEach((k) => { const a = k * Math.PI * 2 / 3; const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.9, 8), legMat); leg.position.set(BX + Math.cos(a) * 0.32, T + 0.45, BZ + Math.sin(a) * 0.32); scene.add(leg); });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.015, 8, 36), legMat); ring.rotation.x = Math.PI / 2; ring.position.set(BX, T + 0.9, BZ); scene.add(ring);
    const gauze = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.012, 0.62), K.stdMat('#9ca3af', 0.8, 0.3)); gauze.position.set(BX, T + 0.905, BZ); scene.add(gauze);
    const glowLight = new THREE.PointLight('#ffb36b', 0, 2.5); glowLight.position.set(BX, T + 1.0, BZ); scene.add(glowLight);
    const lB = api.label({ zh: '本生燈（老師強熱）', en: 'Bunsen burner (teacher heats)' }, { border: '#64748b', h: 0.15 }); lB.position.set(BX, T + 0.1, BZ + 0.55);
    api.tap(bBase, () => api.emit('burner'), { zh: '本生燈', en: 'Bunsen burner' }, [bBarrel, lB]);
    const GAUZE = V3(BX, T + 0.96, BZ);

    // 石灰石（喺碟度）
    const chipMat = new THREE.MeshStandardMaterial({ color: '#a8a29e', roughness: 0.9, emissive: '#ffd2a0', emissiveIntensity: 0 });
    const chip = new THREE.Mesh(new THREE.DodecahedronGeometry(0.11, 0), chipMat); chip.scale.set(1.2, 0.8, 1); chip.position.set(-2.4, T + 0.1, 0.9); scene.add(chip);
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.22, 0.04, 28), K.stdMat('#e2e8f0', 0.5)); dish.position.set(-2.4, T + 0.02, 0.9); scene.add(dish);
    const lChip = api.label({ zh: '石灰石', en: 'Limestone' }, { border: '#78716c', h: 0.16 }); lChip.position.set(-2.4, T + 0.08, 1.3);
    // 白瓷碟、滴管
    const TILE = V3(0.55, T, 0.2);
    const tile = new THREE.Mesh(new K.RoundedBoxGeometry(0.6, 0.04, 0.6, 2, 0.02), K.stdMat('#ffffff', 0.4)); tile.position.set(TILE.x, T + 0.02, TILE.z); scene.add(tile);
    const lTile = api.label({ zh: '白瓷碟', en: 'White tile' }, { border: '#94a3b8', h: 0.14 }); lTile.position.set(TILE.x, T + 0.08, TILE.z + 0.45);
    const powder = K.makeCloud(scene, { color: '#f5f5f4', count: 50, r: 0.18, yMin: 0, yMax: 0.06, yBottom: 0 }); powder.mesh.position.set(TILE.x, T + 0.06, TILE.z);
    const steam = K.makeSteam(scene);
    const dr = K.makeBottle({ body: '#e0f2fe', cap: '#0ea5e9', dropper: true, glass: true }); dr.g.position.set(-1.7, T, 0.95); scene.add(dr.g);
    const lDr = api.label({ zh: '水滴管', en: 'Water dropper' }, { border: '#0ea5e9', h: 0.16 }); lDr.position.set(0, 0.1, 0.42); dr.g.add(lDr);
    // 石灰水燒杯、飲管
    const LX = 1.9, LZ = -0.35, LV = 0.4;
    const bk = K.makeVessel(K.beakerProfile(0.32, 0.62), { liquidColor: '#e0f2fe', level: LV, opacity: 0.45, sx: 0.94 });
    bk.group.position.set(LX, T + 0.01, LZ); scene.add(bk.group);
    const bkBub = K.makeBubbles(bk.group, { max: 120, size: 0.025 });
    const lBk = api.label((lang) => (S.stage >= 3 ? (lang === 'zh' ? '石灰水' : 'Limewater') : (lang === 'zh' ? '清水' : 'Water')), { border: '#0ea5e9', h: 0.16 }); lBk.position.set(LX, T + 0.1, LZ + 0.5);
    api.tap(bk.group, () => api.emit('lime'), { zh: '燒杯', en: 'Beaker' }, [lBk]);
    const straw = new THREE.Group(); straw.position.set(2.5, T + 0.03, 0.9); straw.rotation.z = Math.PI / 2; scene.add(straw);
    const sBody = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 12), K.stdMat('#f472b6', 0.5)); sBody.position.y = 0.4; straw.add(sBody);
    const sHit = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.8, 8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); sHit.position.y = 0.4; straw.add(sHit); // 透明嘅捉手範圍
    const lStraw = api.label({ zh: '飲管', en: 'Straw' }, { border: '#f472b6', h: 0.15 }); lStraw.position.set(-0.25, 0.4, 0.1); straw.add(lStraw);
    const MOUTH = V3(LX, T + 0.65, LZ);
    // 後排：粉筆、水泥包
    const chalk = new THREE.Group(); chalk.position.set(-2.85, T, -1.15); scene.add(chalk);
    ['#ffffff', '#fde68a', '#bfdbfe'].forEach((c, k) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 12), K.stdMat(c, 0.95)); m.rotation.z = Math.PI / 2; m.position.set(0, 0.035, -0.09 + k * 0.09); chalk.add(m); });
    const cement = new THREE.Mesh(new K.RoundedBoxGeometry(0.42, 0.5, 0.22, 3, 0.06), K.stdMat('#d6d3d1', 0.9)); cement.position.set(2.85, T + 0.25, -1.15); scene.add(cement);
    [[chalk, 'chalk', { zh: '粉筆', en: 'Chalk' }, -2.85, 0.25], [cement, 'cement', { zh: '水泥', en: 'Cement' }, 2.85, 0.68]].forEach(([o, ev, name, x, y]) => {
      const l = api.label(name, { border: '#94a3b8', h: 0.15 }); l.position.set(x, T + y, -1.15);
      api.tap(o, () => api.emit(ev), name, [l]);
    });

    let busy = false, heatK = 0, bubbling = false, steamOn = 0;
    async function heat(h = hChip) {
      if (busy || S.stage > 0) return false; busy = true;
      lChip.visible = false;
      await K.moveTo(tw, chip, V3(GAUZE.x, GAUZE.y + 0.4, GAUZE.z), 0, 0.5);
      await K.moveTo(tw, chip, GAUZE, 0, 0.35);
      api.emit('ht_on');
      const c0 = new THREE.Color('#a8a29e'), c1 = new THREE.Color('#fafaf9');
      await tw.to(5, (k) => {
        heatK = 1;
        const glow = Math.sin(Math.min(1, k * 1.2) * Math.PI); chipMat.emissiveIntensity = 1.6 * glow; glowLight.intensity = 3 * glow;
        chipMat.color.copy(c0).lerp(c1, k); chipMat.roughness = 0.9 + 0.1 * k;
      }, K.lin);
      heatK = 0; chipMat.emissiveIntensity = 0; glowLight.intensity = 0;
      S.stage = 1; push();
      await api.waitSpeech();
      api.emit('ht_done');
      await K.moveTo(tw, chip, V3(TILE.x, T + 0.5, TILE.z), 0, 0.6);
      await K.moveTo(tw, chip, V3(TILE.x, T + 0.1, TILE.z), 0, 0.4);
      h.setHome(chip.position.clone());
      busy = false; api.done('heat');
    }
    async function addWater(h = hDr) {
      if (busy || S.stage !== 1) { if (!busy && S.stage < 1) api.emit('wt_need'); return false; }
      busy = true;
      const target = V3(TILE.x, T + 0.55, TILE.z);
      await K.moveTo(tw, dr.g, K.tipPose(V2(0, 0.86), 2.1, target), 2.1, 0.5);
      await K.dripDrop(scene, tw, target, V3(TILE.x, T + 0.12, TILE.z), '#7dd3fc');
      const back = h.returnHome();
      api.emit('wt_hiss'); steamOn = 2.5;
      K.popText(scene, tw, '嘶嘶！Hiss!', V3(TILE.x, T + 0.6, TILE.z), '#78716c');
      await tw.to(1.5, (k) => { chip.scale.set(1.2 * (1 - k), 0.8 * (1 - k), 1 - k); powder.set(k, 0); });
      chip.visible = false; await back;
      S.stage = 2; push();
      await api.waitSpeech();
      // 將熟石灰溶落水再過濾 → 石灰水
      api.emit('wt_lime');
      const w0 = new THREE.Color('#e0f2fe'), cl = new THREE.Color('#f1f5f9');
      await tw.to(1.0, (k) => { powder.set(1 - k, 0); bk.mat.color.copy(w0).lerp(cl, k); bk.mat.opacity = 0.45 + 0.4 * k; });
      await tw.to(1.2, (k) => { bk.mat.color.copy(cl).lerp(new THREE.Color('#ecfeff'), k); bk.mat.opacity = 0.85 - 0.4 * k; });
      S.stage = 3; push(); lBk.userData.refresh();
      busy = false; api.done('water');
    }
    async function blow(h = hStraw) {
      if (busy || S.stage !== 3) { if (!busy && S.stage < 3) api.emit('bw_need'); return false; }
      busy = true;
      lStraw.visible = false;
      await K.moveTo(tw, straw, V3(LX + 0.08, T + 0.75, LZ), 0.12, 0.5);
      await K.moveTo(tw, straw, V3(LX + 0.06, T + 0.08, LZ), 0.12, 0.4);
      bubbling = true;
      const c0 = bk.mat.color.clone(), c1 = new THREE.Color('#f8fafc');
      await tw.to(2.4, (k) => { bk.mat.color.copy(c0).lerp(c1, k); bk.mat.opacity = 0.45 + 0.5 * k; });
      bubbling = false;
      S.stage = 4; push(); api.emit('bw_milky');
      await h.returnHome(); lStraw.visible = true;
      busy = false; api.done('blow');
    }

    const hChip = api.drag(chip, { label: { zh: '石灰石', en: 'Limestone' }, lift: 1.2, extra: [dish], enabled: () => !busy && S.stage === 0,
      targets: () => [{ key: 'g', pos: GAUZE, r: 0.45, ringY: T, accept: () => S.stage === 0 }], onDrop: (tg, h) => heat(h), onTap: () => { if (!busy && S.stage === 0) hChip.dropOn('g'); } });
    const hDr = api.drag(dr.g, { label: { zh: '水滴管', en: 'Water dropper' }, lift: 0.9, enabled: () => !busy && S.stage === 1,
      targets: () => [{ key: 't', pos: V3(TILE.x, T + 0.15, TILE.z), r: 0.45, ringY: T, accept: () => S.stage === 1 }], onDrop: (tg, h) => addWater(h),
      onTap: () => { if (busy) return; if (S.stage === 1) hDr.dropOn('t'); else if (S.stage < 1) api.emit('wt_need'); } });
    const hStraw = api.drag(straw, { label: { zh: '飲管', en: 'Straw' }, lift: 0.9, enabled: () => !busy && S.stage === 3,
      targets: () => [{ key: 'b', pos: MOUTH, r: 0.4, ringY: T, accept: () => S.stage === 3 }], onDrop: (tg, h) => blow(h),
      onTap: () => { if (busy) return; if (S.stage === 3) hStraw.dropOn('b'); else if (S.stage < 3) api.emit('bw_need'); } });

    const homes = { chip: chip.position.clone() };
    push();
    return {
      cam: { pos: [0, 3.9, 5.0], target: [0, 1.45, -0.1], fitW: 6.6 },
      heat: () => { if (!busy && S.stage === 0) hChip.dropOn('g'); },
      addWater: () => { if (!busy && S.stage === 1) hDr.dropOn('t'); },
      blow: () => { if (!busy && S.stage === 3) hStraw.dropOn('b'); },
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (id === 'heat' && S.stage === 0) await hChip.dropOn('g');
        if (id === 'water' && S.stage === 1) await hDr.dropOn('t');
        if (id === 'blow' && S.stage === 3) await hStraw.dropOn('b');
      },
      getHint(id) {
        if (busy) return null;
        if (id === 'heat') return S.stage === 0 ? { from: K.worldOf(chip), to: GAUZE } : null;
        if (id === 'water') return S.stage === 1 ? { from: K.worldOf(dr.g, 0.5), to: V3(TILE.x, T + 0.15, TILE.z) } : null;
        if (id === 'blow') return S.stage === 3 ? { from: straw.localToWorld(V3(0, 0.4, 0)), to: MOUTH } : null;
        return null;
      },
      update(dt, t) {
        const fh = heatK ? 0.42 : 0.3;
        flame.scale.set(1, fh * (1 + Math.sin(t * 20) * 0.04), 1); flame.position.y = 0.55 + fh / 2;
        flameIn.scale.set(1, fh * 0.45, 1); flameIn.position.y = 0.55 + fh * 0.22;
        if (steamOn > 0) steamOn -= dt;
        steam.update(dt, t, steamOn > 0, V3(TILE.x, T + 0.12, TILE.z), 0.2);
        if (bubbling && Math.random() < dt * 30) bkBub.spawn(0.06 + (Math.random() - 0.5) * 0.1, 0.08, (Math.random() - 0.5) * 0.1, LV - 0.01, 1);
        bkBub.update(dt, t);
      },
      reset() {
        tw.clear(); busy = false; heatK = 0; bubbling = false; steamOn = 0;
        S.stage = 0; push(); lBk.userData.refresh();
        chip.visible = true; chip.scale.set(1.2, 0.8, 1); chipMat.color.set('#a8a29e'); chipMat.emissiveIntensity = 0; chipMat.roughness = 0.9; glowLight.intensity = 0;
        powder.set(0, 0); steam.clear(); bkBub.clear(); bk.mat.color.set('#e0f2fe'); bk.mat.opacity = 0.45;
        lChip.visible = true; lStraw.visible = true; hChip.setHome(homes.chip);
        [hChip, hDr, hStraw].forEach((h) => { h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.busy = false; });
      },
    };
  },
};
