/* Topic 1.1 大氣：空氣的組成（濕鐵絨生鏽，量度空氣入面氧氣嘅份量） */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V2, V3 } = K;

const GREY = '#9ca3af', RUST = '#9a4a1c';

function Panel({ S }) {
  const { lang } = useApp();
  const zh = lang === 'zh';
  const row = (label, val) => html`<div className="flex items-center gap-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2"><b className="flex-1 text-slate-700">${label}</b><span className="text-slate-600">${val}</span></div>`;
  const parts = [[78, '#60a5fa', zh ? '氮 78%' : 'Nitrogen 78%'], [21, '#f87171', zh ? '氧 21%' : 'Oxygen 21%'], [1, '#94a3b8', zh ? '其他 1%' : 'Others 1%']];
  return html`<div className="grid gap-1.5 text-sm">
    ${row(zh ? '濕鐵絨放入量筒' : 'Damp steel wool in tube', S.wool ? '✅' : '—')}
    ${row(zh ? '量筒倒轉入水槽' : 'Tube upside down in water', S.tube ? '✅' : '—')}
    ${row(zh ? '⏰ 時間' : '⏰ Time', `${Math.round(S.day || 0)} ${zh ? '日' : (Math.round(S.day || 0) === 1 ? 'day' : 'days')}`)}
    ${row(zh ? '水位升到' : 'Water rose to', S.read ? (zh ? '20 格 → 大約五分一 ✅' : 'mark 20 → about one fifth ✅') : '—')}
    ${S.read ? html`<div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2">
      <b className="text-slate-700">${zh ? '空氣嘅組成' : 'What air is made of'}</b>
      <div className="mt-1 flex h-4 rounded-full overflow-hidden">${parts.map(([p, c]) => html`<div key=${c} style=${{ width: p + '%', background: c }}></div>`)}</div>
      <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-slate-600">${parts.map(([p, c, l]) => html`<span key=${c} className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style=${{ background: c }}></span>${l}</span>`)}</div>
    </div>` : null}
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    <rect x="30" y="66" width="140" height="36" rx="8" fill="#bae6fd" stroke="#94a3b8" strokeWidth="3" />
    <path d="M86 98 v-80 a14 14 0 0 1 28 0 v80" fill="#fff" fillOpacity=".85" stroke="#94a3b8" strokeWidth="3" />
    <rect x="89" y="50" width="22" height="48" fill="#7dd3fc" />
    <circle cx="100" cy="22" r="9" fill="#9a4a1c" />
    ${[30, 42, 54, 66, 78].map((y) => html`<line key=${y} x1="114" y1=${y} x2="122" y2=${y} stroke="#64748b" strokeWidth="2" />`)}
    <path d="M140 50 l-14 0 l6 -5 m-6 5 l6 5" stroke="#ef4444" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>`;
}

const events = {
  st_wool: { zh: '濕鐵絨塞咗入量筒底。', en: 'The damp steel wool is pushed into the bottom of the tube.' },
  st_tube: { zh: '量筒倒轉插入水槽，困住咗一筒空氣，而家水位喺「0」格。', en: 'The tube is upside down in the water, trapping some air. The water is at mark 0.' },
  st_needWool: { zh: '先將濕鐵絨放入量筒，先好倒轉佢。', en: 'Put the damp steel wool into the tube first, then turn it upside down.' },
  setAll: { zh: '準備好喇！外面嘅空氣入唔到量筒。', en: 'Ready! No outside air can get into the tube.' },
  w_need: { zh: '先放好鐵絨同量筒，先好快轉時間。', en: 'Set up the steel wool and the tube first, then fast-forward.' },
  w_go: { zh: '時間快轉中……鐵絨慢慢生鏽，水位慢慢上升。', en: 'Fast-forwarding… The steel wool slowly rusts and the water slowly rises.' },
  w_done: { zh: '一個星期之後：鐵絨變咗啡色，水位升高咗，之後就再冇升。', en: 'One week later: the steel wool has turned brown and the water has risen, and now it has stopped rising.' },
  clockDone: { zh: '已經過咗一個星期喇。', en: 'A week has already passed.' },
  rd_ok: { zh: '啱喇！水升到 20 格，即係大約五分一嘅空氣被用走咗，嗰啲就係氧氣。', en: 'Correct! The water rose to mark 20, so about one fifth of the air was used up. That was the oxygen.' },
  rd_no: { zh: '再睇清楚，水位而家喺邊一格？', en: 'Look again: which mark is the water level at now?' },
  trough: { zh: '水槽入面嘅水會封住量筒個口，外面嘅空氣就入唔到去。', en: 'The water in the trough seals the mouth of the tube, so no outside air can get in.' },
  oxygen: { zh: '醫院嘅氧氣樽裝住純氧，幫助呼吸有困難嘅病人。', en: 'Hospital oxygen cylinders hold pure oxygen to help patients who find it hard to breathe.' },
  chips: { zh: '薯片包入面充咗氮氣。氮氣唔活潑，薯片就唔會咁快變壞。', en: 'Crisp packets are filled with nitrogen. Nitrogen is unreactive, so the crisps stay fresh for longer.' },
};

export default {
  id: 'airoxygen', topics: ['1.1'], accent: '#06b6d4', dark: '#0e7490', bg: 'linear-gradient(135deg,#cffafe,#e0f2fe)', Art,
  title: { zh: '鐵絨食氧氣', en: 'Steel Wool Eats Oxygen' },
  desc: { zh: '空氣入面有幾多氧氣？請濕鐵絨做偵探，等佢生鏽「食」走氧氣，再睇水位升幾多！', en: 'How much of the air is oxygen? Let damp steel wool rust and "eat" the oxygen, then see how far the water rises!' },
  steps: [
    { tag: 'intro', zh: '我哋日日都呼吸空氣，但係空氣入面其實有幾種唔同嘅氣體。記得鐵釘生鏽偵探嗎？鐵生鏽要用到空氣入面嘅氧氣。今日我哋請濕鐵絨做偵探，量度空氣入面有幾多氧氣。安全提提你：鐵絨有好幼嘅尖刺，要戴手套。後面嘅物件可以撳嚟睇介紹。',
      en: 'We breathe air every day, but air is actually a mixture of different gases. Remember the Rusty Nail Detective? Iron needs oxygen from the air to rust. Today, damp steel wool will be our detective to measure how much of the air is oxygen. Safety first: steel wool has tiny sharp strands, so wear gloves. Tap the objects at the back to learn about them.' },
    { tag: 'try', action: { id: 'set', events: ['st_'] }, zh: '將濕鐵絨拖入量筒入面，再將量筒拖去水槽，佢會倒轉插入水度。',
      en: 'Drag the damp steel wool into the measuring tube, then drag the tube to the water trough. It will go in upside down.' },
    { tag: 'observe', zh: '量筒入面困住咗一啲空氣，水封住咗個開口，外面嘅空氣入唔到去。而家水位喺「0」格。',
      en: 'Some air is trapped in the tube, and the water seals the opening so no outside air can get in. The water is at mark 0.' },
    { tag: 'try', action: { id: 'wait', events: ['w_'] }, zh: '撳右邊嘅時鐘，快轉一個星期，睇下會點。',
      en: 'Tap the clock on the right to fast-forward one week and see what happens.' },
    { tag: 'observe', zh: '鐵絨生鏽變咗啡色，量筒入面嘅水位仲升高咗！因為鐵生鏽用走咗量筒入面嘅氧氣，少咗氣體，水就升上去補位。',
      en: 'The steel wool has rusted brown, and the water inside the tube has risen! Rusting used up the oxygen in the tube, so there was less gas, and the water moved up to take its place.' },
    { tag: 'try', action: { id: 'read', events: ['rd_'] }, zh: '水升到第幾格？將紅色箭嘴拖去水位嘅刻度。',
      en: 'Which mark did the water reach? Drag the red arrow to the mark at the water level.' },
    { tag: 'feynman', zh: '想像量筒入面有 100 粒空氣粒子：大約 21 粒係氧，78 粒係氮，仲有 1 粒係其他氣體。鐵生鏽只會「食」氧，所以大約五分一嘅空氣唔見咗，水就升高咗大約 20 格。剩低嘅主要係氮氣，佢唔會令鐵生鏽，亦都唔會幫助燃燒。',
      en: 'Imagine 100 air particles in the tube: about 21 are oxygen, 78 are nitrogen and 1 is another gas. Rusting only "eats" oxygen, so about one fifth of the air disappears, and the water rises about 20 marks. What is left is mainly nitrogen, which does not make iron rust and does not help things burn.' },
    { tag: 'first', zh: '由最基本諗起：鐵、水同氧氣會結合成鐵鏽。氧氣粒子變成鐵鏽嘅一部分，唔再係氣體，所以量筒入面嘅氣體少咗，外面嘅空氣就壓住水槽嘅水，將水推上量筒，直到啲氧氣用晒為止。所以水升高嘅份量，就等於原本氧氣嘅份量。',
      en: 'Back to basics: iron, water and oxygen join together to make rust. The oxygen particles become part of the rust and are no longer a gas, so there is less gas in the tube. The air outside presses on the water in the trough and pushes water up into the tube until all the oxygen is used up. So the amount the water rises equals the amount of oxygen there was.' },
    { tag: 'life', zh: '生活應用：醫院用氧氣樽幫助病人呼吸；薯片包入面充咗氮氣，因為氮氣唔活潑，薯片唔會咁快變壞；工廠會將空氣冷到變成液體，再分開氧氣、氮氣同氬氣，呢個叫做「空氣分餾」。',
      en: 'Everyday life: hospitals use oxygen cylinders to help patients breathe; crisp packets are filled with nitrogen because it is unreactive and keeps the crisps fresh; factories cool air until it turns liquid and then separate out oxygen, nitrogen and argon. This is called the fractional distillation of air.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '點解薯片包入面要充氮氣，而唔充普通空氣？', en: 'Why are crisp packets filled with nitrogen instead of ordinary air?' },
    options: [
      { zh: '因為氮氣有薯片味', en: 'Because nitrogen tastes of crisps' },
      { zh: '因為氮氣唔活潑，唔會好似氧氣咁令薯片變壞', en: 'Because nitrogen is unreactive, so it does not spoil the crisps like oxygen does' },
      { zh: '因為氮氣可以令薯片變大塊', en: 'Because nitrogen makes the crisps bigger' },
    ],
    correct: 1,
    right: { zh: '啱！氧氣好活潑，會同食物入面嘅油反應令佢變壞；氮氣就好少同其他物質反應。', en: 'Right! Oxygen is very reactive and reacts with the oil in food, making it go stale; nitrogen hardly reacts with anything.' },
    wrong: { zh: '再諗下鐵絨：令鐵生鏽嘅係邊種氣體？剩低嗰種氣體又會唔會令嘢變壞？', en: 'Think about the steel wool: which gas made the iron rust? Does the gas that was left make things go off?' },
  },
  tools: [
    { id: 's', label: { zh: '放好下一樣', en: 'Set up the next item' }, run: (c) => c.setNext() },
    { id: 'f', primary: true, label: { zh: '⏩ 快轉一星期', en: '⏩ Fast-forward a week' }, run: (c) => c.fastForward() },
    { id: 'r', label: { zh: '讀刻度', en: 'Read the scale' }, run: (c) => c.readNext() },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = { wool: false, tube: false, day: 0, read: false };
    const push = () => api.state({ ...S });
    // 水槽
    const TX = -0.4, TZ = -0.25, WL = 0.3;
    const trough = K.makeVessel(K.beakerProfile(0.75, 0.42), { liquidColor: '#7dd3fc', level: WL, opacity: 0.55, sx: 0.97 });
    trough.group.position.set(TX, T + 0.01, TZ); scene.add(trough.group);
    const lTr = api.label({ zh: '水槽', en: 'Water trough' }, { border: '#0ea5e9', h: 0.16 }); lTr.position.set(TX, T + 0.1, TZ + 0.95);
    api.tap(trough.group, () => api.emit('trough'), { zh: '水槽', en: 'Water trough' }, [lTr]);

    // 量筒（原點喺開口；倒轉之後開口向下）
    const TH = 1.34, R = 0.13, Y0 = WL - 0.04, TOP = 1.28, L0 = TOP - Y0;
    const tube = new THREE.Group(); tube.position.set(1.6, T + TH + 0.02, 0.85); tube.rotation.x = Math.PI; scene.add(tube);
    const prof = [V2(R, 0), V2(R, TH - 0.06), V2(R - 0.03, TH - 0.01), V2(0, TH)];
    const shell = new THREE.Mesh(new THREE.LatheGeometry(prof, 32), K.glassMat()); shell.renderOrder = 3; tube.add(shell);
    const waterMat = K.liquidMat('#7dd3fc', 0.6);
    const water = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.012, R - 0.012, 1, 24), waterMat); water.renderOrder = 2; water.visible = false; tube.add(water);
    const setWater = (top) => { water.scale.y = Math.max(0.001, top); water.position.y = top / 2; };
    const ticks = [], tickLabs = [];
    [0, 20, 40, 60, 80, 100].forEach((n, i) => {
      const y = Y0 + (n / 100) * L0;
      const tk = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.012, 0.012), K.stdMat('#334155', 0.5)); tk.position.set(R + 0.02, y, 0.04); tube.add(tk); ticks.push(tk);
      const l = api.label({ zh: String(n), en: String(n) }, { border: '#64748b', h: 0.11 }); l.position.set(TX + R + 0.2, T + 0.05 + y, TZ + 0.05); l.visible = false; tickLabs.push(l);
    });
    const lTube = api.label({ zh: '量筒', en: 'Measuring tube' }, { border: '#06b6d4', h: 0.16 }); lTube.position.set(1.6, T + 0.1, 1.35);
    const tubeIn = V3(TX, T + 0.05, TZ);
    const markPos = (n) => V3(TX + R + 0.2, T + 0.05 + Y0 + (n / 100) * L0, TZ + 0.05);

    // 濕鐵絨
    const wool = new THREE.Group(); wool.position.set(-2.4, T + 0.08, 0.95); scene.add(wool);
    const woolMat = K.stdMat(GREY, 1, 0.3);
    [[0, 0, 0], [0.05, 0.02, 0.03], [-0.04, 0.01, -0.03]].forEach(([x, y, z], i) => { const m = new THREE.Mesh(new THREE.TorusKnotGeometry(0.05, 0.015, 48, 6, 2 + i, 3), woolMat); m.position.set(x, y, z); wool.add(m); });
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.22, 0.04, 28), K.stdMat('#e2e8f0', 0.5)); dish.position.set(-2.4, T + 0.02, 0.95); scene.add(dish);
    const lWool = api.label({ zh: '濕鐵絨', en: 'Damp steel wool' }, { border: '#64748b', h: 0.16 }); lWool.position.set(0, -0.06, 0.38); wool.add(lWool);

    // 紅色箭嘴（讀刻度用）
    const arrow = new THREE.Group(); arrow.position.set(-1.4, T + 0.1, 1.0); scene.add(arrow);
    const aHead = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 16), K.stdMat('#ef4444', 0.4)); aHead.rotation.z = Math.PI / 2; aHead.position.x = -0.07; arrow.add(aHead);
    const aTail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.04), K.stdMat('#ef4444', 0.4)); aTail.position.x = 0.08; arrow.add(aTail);
    const lArrow = api.label({ zh: '箭嘴', en: 'Arrow' }, { border: '#ef4444', h: 0.15 }); lArrow.position.set(0, -0.08, 0.3); arrow.add(lArrow);

    // 時鐘
    const clock = new THREE.Group(); clock.position.set(2.6, T, 0.75); scene.add(clock);
    const face = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 32), K.stdMat('#ecfeff', 0.5)); face.rotation.x = Math.PI / 2; face.position.y = 0.34; clock.add(face);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.03, 10, 40), K.stdMat('#06b6d4', 0.4)); rim.position.y = 0.34; clock.add(rim);
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.02), K.stdMat('#1e293b', 0.5)); hand.geometry.translate(0, 0.1, 0); hand.position.set(0, 0.34, 0.05); clock.add(hand);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.18), K.stdMat('#06b6d4', 0.5)); foot.position.y = 0.03; clock.add(foot);
    const lClock = api.label((lang) => (lang === 'zh' ? `⏰ 第 ${Math.round(S.day)} 日` : `⏰ Day ${Math.round(S.day)}`), { border: '#06b6d4', h: 0.17 }); lClock.position.set(2.6, T + 0.85, 0.75);
    // 後排：氧氣樽、薯片包
    const tank = new THREE.Group(); tank.position.set(-2.85, T, -1.15); scene.add(tank);
    const tBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.5, 6, 16), K.stdMat('#f8fafc', 0.4)); tBody.position.y = 0.38; tank.add(tBody);
    const tValve = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 12), K.stdMat('#64748b', 0.3, 0.8)); tValve.position.y = 0.76; tank.add(tValve);
    const chips = new THREE.Mesh(new K.RoundedBoxGeometry(0.4, 0.5, 0.18, 4, 0.08), K.stdMat('#facc15', 0.5)); chips.position.set(2.85, T + 0.25, -1.15); scene.add(chips);
    [[tank, 'oxygen', { zh: '氧氣樽', en: 'Oxygen cylinder' }, -2.85, 1.05], [chips, 'chips', { zh: '薯片包', en: 'Crisp packet' }, 2.85, 0.68]].forEach(([o, ev, name, x, y]) => {
      const l = api.label(name, { border: '#94a3b8', h: 0.15 }); l.position.set(x, T + y, -1.15);
      api.tap(o, () => api.emit(ev), name, [l]);
    });

    let busy = false, waterTop = Y0;
    async function addWool(h = hWool) {
      if (busy || S.wool) return false; busy = true;
      lWool.visible = false;
      const top = V3(tube.position.x, tube.position.y + 0.3, tube.position.z);
      await K.moveTo(tw, wool, top, 0, 0.45);
      await K.moveTo(tw, wool, V3(top.x, T + 0.16, top.z), 0, 0.5); // 跌落量筒底（倒轉之後就喺頂）
      tube.attach(wool); S.wool = true; push(); api.emit('st_wool');
      busy = false;
    }
    async function invert(h = hTube) {
      if (busy || S.tube) return false;
      if (!S.wool) { api.emit('st_needWool'); return false; }
      busy = true;
      await K.moveTo(tw, tube, V3(TX, T + 1.0, TZ), 0, 0.6, 0);
      await K.moveTo(tw, tube, tubeIn, 0, 0.6, 0);
      K.ripple(scene, tw, V3(TX, T + 0.01 + WL, TZ));
      h.setHome(tubeIn.clone()); h.homeRot.set(0, 0, 0);
      water.visible = true; setWater(Y0); tickLabs.forEach((l) => { l.visible = true; });
      S.tube = true; push(); api.emit('st_tube');
      busy = false;
      api.done('set'); api.emit('setAll');
    }
    async function fastForward() {
      if (busy) return;
      if (S.day >= 7) { api.emit('clockDone'); return; }
      if (!S.tube) { api.emit('w_need'); return; }
      busy = true; api.emit('w_go');
      const c0 = new THREE.Color(GREY), c1 = new THREE.Color(RUST);
      await tw.to(6, (k) => {
        S.day = 7 * k; lClock.userData.refresh(); hand.rotation.z = -Math.PI * 2 * k * 3;
        const u = 1 - Math.pow(1 - k, 2); // 一開始升得快，之後慢落嚟
        waterTop = Y0 + 0.2 * L0 * u; setWater(waterTop); woolMat.color.copy(c0).lerp(c1, u);
      }, K.lin);
      S.day = 7; push();
      await api.waitSpeech();
      api.emit('w_done'); api.done('wait');
      busy = false;
    }
    async function placeArrow(n, h = hArrow) {
      if (busy || S.read || S.day < 7) return false;
      if (n !== 20) { api.emit('rd_no'); return false; }
      busy = true;
      const p = markPos(20).add(V3(0.22, 0, 0));
      lArrow.visible = false;
      await K.moveTo(tw, arrow, p, 0, 0.45);
      h.setHome(p.clone());
      S.read = true; push(); api.emit('rd_ok'); api.done('read');
      busy = false;
    }

    const hWool = api.drag(wool, { label: { zh: '濕鐵絨', en: 'Damp steel wool' }, lift: 1.6, extra: [dish], enabled: () => !busy && !S.wool,
      targets: () => [{ key: 'tube', pos: V3(tube.position.x, tube.position.y, tube.position.z), r: 0.4, ringY: T, accept: () => !S.wool }],
      onDrop: (tg, h) => addWool(h), onTap: () => { if (!busy && !S.wool) hWool.dropOn('tube'); } });
    const hTube = api.drag(tube, { label: { zh: '量筒', en: 'Measuring tube' }, lift: 0.4, enabled: () => !busy && S.wool && !S.tube,
      targets: () => [{ key: 'tr', pos: V3(TX, T + 0.45, TZ), r: 0.75, ringY: T, accept: () => !S.tube }],
      onDrop: (tg, h) => invert(h), onTap: () => { if (busy || S.tube) return; if (!S.wool) api.emit('st_needWool'); else hTube.dropOn('tr'); } });
    const MARKS = [0, 20, 40, 60, 80];
    const hArrow = api.drag(arrow, { label: { zh: '箭嘴', en: 'Arrow' }, lift: 0.6, enabled: () => !busy && S.day >= 7 && !S.read,
      targets: () => MARKS.map((n) => ({ key: 'm' + n, pos: markPos(n), r: 0.16, ringY: T, accept: () => S.day >= 7 && !S.read })),
      onDrop: (tg, h) => placeArrow(Number(tg.key.slice(1)), h), onTap: () => { if (!busy && S.day >= 7 && !S.read) hArrow.dropOn('m20'); } });
    api.tap(clock, () => fastForward(), { zh: '快轉時鐘', en: 'Fast-forward clock' }, [lClock]);

    const homes = { tube: tube.position.clone(), arrow: arrow.position.clone() };
    push();
    return {
      cam: { pos: [0.1, 3.9, 5.0], target: [0.1, 1.5, -0.1], fitW: 6.6 },
      fastForward,
      setNext() { if (busy) return; if (!S.wool) hWool.dropOn('tube'); else if (!S.tube) hTube.dropOn('tr'); },
      readNext() { if (!busy && S.day >= 7 && !S.read) hArrow.dropOn('m20'); },
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (id === 'set') {
          if (!S.wool) { await hWool.dropOn('tube'); await api.waitSpeech(); }
          while (busy) await tw.wait(0.1);
          if (!S.tube) await hTube.dropOn('tr');
        }
        if (id === 'wait') await fastForward();
        if (id === 'read' && !S.read) await hArrow.dropOn('m20');
      },
      getHint(id) {
        if (busy) return null;
        if (id === 'set') return !S.wool ? { from: K.worldOf(wool, 0.05), to: V3(tube.position.x, tube.position.y, tube.position.z) } : !S.tube ? { from: K.worldOf(tube, -0.6), to: V3(TX, T + 0.45, TZ) } : null;
        if (id === 'wait') return S.day >= 7 ? null : { from: K.worldOf(clock, 0.34) };
        if (id === 'read') return S.read || S.day < 7 ? null : { from: K.worldOf(arrow), to: markPos(20) };
        return null;
      },
      reset() {
        tw.clear(); busy = false;
        Object.assign(S, { wool: false, tube: false, day: 0, read: false }); push(); lClock.userData.refresh();
        hand.rotation.z = 0; woolMat.color.set(GREY); water.visible = false; waterTop = Y0;
        scene.attach(wool); wool.rotation.set(0, 0, 0); lWool.visible = true; lArrow.visible = true;
        tickLabs.forEach((l) => { l.visible = false; });
        hTube.setHome(homes.tube); hTube.homeRot.set(Math.PI, 0, 0); hArrow.setHome(homes.arrow);
        [hWool, hTube, hArrow].forEach((h) => { h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.busy = false; });
      },
    };
  },
};
