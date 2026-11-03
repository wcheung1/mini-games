/* Topic 5.1 簡單化學電池：檸檬電池（鋅、銅、串聯） */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V3 } = K;

const VOLT = 0.9; // 每個檸檬電池大約嘅電壓

function Panel({ S }) {
  const { lang } = useApp();
  const zh = lang === 'zh';
  const n = S.n || 0;
  return html`<div className="grid gap-1.5 text-sm">
    <div className="grid grid-cols-3 gap-2 px-3 font-black text-slate-500 text-xs">
      <span>${zh ? '檸檬數目' : 'Lemons'}</span><span>${zh ? '電壓' : 'Voltage'}</span><span>LED</span>
    </div>
    ${[1, 2, 3].map((k) => html`<div key=${k} className=${`grid grid-cols-3 gap-2 items-center rounded-xl px-3 py-2 ring-1 ${n >= k ? 'bg-yellow-50 ring-yellow-200' : 'bg-slate-50 ring-slate-200'}`}>
      <span className="font-bold text-slate-700">${'🍋'.repeat(k)}</span>
      <span className="text-slate-600 font-bold">${n >= k ? `${(k * VOLT).toFixed(1)} ${zh ? '伏特' : 'V'}` : '—'}</span>
      <span className="text-slate-600">${n >= k ? (k >= 3 ? (zh ? '💡 著咗' : '💡 on') : (zh ? '⚫ 唔著' : '⚫ off')) : '—'}</span>
    </div>`)}
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    ${[35, 85, 135].map((x) => html`<g key=${x}>
      <ellipse cx=${x} cy="78" rx="22" ry="16" fill="#facc15" stroke="#ca8a04" strokeWidth="2.5" />
      <rect x=${x - 11} y="48" width="5" height="26" fill="#94a3b8" /><rect x=${x + 6} y="48" width="5" height="26" fill="#d97706" />
    </g>`)}
    <path d="M44 48 q16 -20 32 0 M94 48 q16 -20 32 0 M144 48 q20 -30 34 2" stroke="#334155" strokeWidth="2.5" fill="none" />
    <circle cx="178" cy="56" r="14" fill="#ef4444" opacity=".35" /><circle cx="178" cy="56" r="8" fill="#ef4444" />
  </svg>`;
}

const events = {
  pl_one: { zh: '插好一塊喇！淨係一種金屬未得，要插埋另一種金屬先會有電。', en: 'One plate is in! One metal is not enough. You need the other metal too.' },
  pl_volt: { zh: '兩塊金屬片都插好，電線亦自動接上！電壓錶顯示大約 0.9 伏特，但係 LED 冇著。', en: 'Both plates are in, and the wires connect themselves! The voltmeter shows about 0.9 volts, but the LED stays off.' },
  ch_2: { zh: '兩個檸檬串聯：1.8 伏特！LED 仲未著，仲差少少。', en: 'Two lemons in a row: 1.8 volts! The LED is still off. Almost there.' },
  ch_3: { zh: '三個檸檬：2.7 伏特！LED 著咗紅燈喇！雖然唔算好光，但真係由檸檬電池點著㗎！', en: 'Three lemons: 2.7 volts! The LED glows red! It is not very bright, but it really is lit by lemon batteries!' },
  lemon: { zh: '檸檬汁入面有檸檬酸，可以導電，幫手接通成條電路。', en: 'Lemon juice contains citric acid. It conducts electricity and helps complete the circuit.' },
  cell: { zh: '遙控器用嘅乾電池，入面都有鋅㗎！原理同檸檬電池差唔多。', en: 'The dry cells in a remote control have zinc inside too! They work in a similar way to a lemon battery.' },
  socket: { zh: '牆上面嘅電插座電力好強，可以電死人。千祈唔好用手指或者金屬插入去！', en: 'The electricity in a wall socket is very strong and can kill. Never poke fingers or metal into it!' },
  meter: { zh: '電壓錶量度電池嘅「推力」，單位係伏特。', en: 'The voltmeter measures how hard the battery pushes. The unit is the volt.' },
  led: { zh: 'LED 係一種好慳電嘅細燈膽。紅色 LED 要大約 2 伏特先會著。', en: 'An LED is a tiny light that uses very little electricity. A red LED needs about 2 volts to light up.' },
};

export default {
  id: 'lemon', topics: ['5.1'], accent: '#eab308', dark: '#a16207', bg: 'linear-gradient(135deg,#fef9c3,#ecfccb)', Art,
  title: { zh: '檸檬電池', en: 'Lemon Battery' },
  desc: { zh: '用檸檬、鋅片同銅片整電池！串連幾個檸檬，令 LED 著燈。', en: 'Make a battery from lemons, zinc and copper! Join a few lemons together to light an LED.' },
  steps: [
    { tag: 'intro', zh: '遙控器、電筒、玩具車都要用電池。電池入面其實係化學物質！今日我哋用檸檬、鋅片同銅片，自己整一個「檸檬電池」，睇下夠唔夠電令 LED 燈著。安全提提你：做完實驗嘅檸檬唔好食；千祈唔好拆開真電池，亦唔好玩電插座。後面嘅物件可以撳嚟睇介紹。',
      en: 'Remote controls, torches and toy cars all need batteries. Inside a battery there are chemicals! Today we will use a lemon, a zinc plate and a copper plate to make our own lemon battery, and see if it can light an LED. Safety first: do not eat the lemons afterwards, never open a real battery, and never play with wall sockets. Tap the objects at the back to learn about them.' },
    { tag: 'try', action: { id: 'plates', events: ['pl_'] }, zh: '將前面嘅鋅片（灰色）同銅片（橙色）拖落左邊嗰個檸檬，兩塊都要插。',
      en: 'Drag the zinc plate (grey) and the copper plate (orange) at the front into the lemon on the left. Both plates need to go in.' },
    { tag: 'observe', zh: '一個檸檬電池大約有 0.9 伏特。「伏特」係量度電池推力嘅單位。紅色 LED 要大約 2 伏特先會著，所以一個檸檬唔夠力。',
      en: 'One lemon battery gives about 0.9 volts. The volt is the unit for how hard a battery pushes. A red LED needs about 2 volts, so one lemon is not strong enough.' },
    { tag: 'try', action: { id: 'chain', events: ['ch_'] }, zh: '一個唔夠，就加多幾個！將右邊嘅後備檸檬逐個拖去檯面上發光嘅位置。電線會自動將佢哋一個接一個咁連埋，呢種接法叫「串聯」。',
      en: 'One is not enough, so add more! Drag the spare lemons on the right, one at a time, to the glowing spots on the table. The wires join them one after another automatically. This is called connecting them in series.' },
    { tag: 'observe', zh: '兩個檸檬有 1.8 伏特，仲差少少；三個檸檬有 2.7 伏特，LED 終於著喇！串聯越多個，電壓就越大。電線上面嘅黃色小點代表電子，佢哋由鋅片出發，經過電線同 LED，流去銅片。',
      en: 'Two lemons give 1.8 volts, still not quite enough; three lemons give 2.7 volts, and the LED finally lights up! The more cells in series, the bigger the voltage. The yellow dots on the wires stand for electrons. They leave the zinc plate, travel through the wires and the LED, and arrive at the copper plate.' },
    { tag: 'feynman', zh: '好多人以為電係由檸檬嚟，其實唔係！真正提供能量嘅係鋅片：鋅好似一個泵，將電子推出去。檸檬汁只係幫手接通成條電路。串聯就好似疊樓梯，每個檸檬加多一級，疊得越高，推力就越大。',
      en: 'Lots of people think the electricity comes from the lemon, but it does not! The energy really comes from the zinc: zinc is like a pump that pushes electrons out. The lemon juice just helps complete the circuit. Connecting in series is like stacking steps: each lemon adds one more step, and the higher the stack, the bigger the push.' },
    { tag: 'first', zh: '由最基本諗起：鋅比銅活潑（記得金屬冒泡大比拼嗎？），所以鋅原子會交出電子，變成鋅離子溶入檸檬汁。電子穿唔過檸檬汁，只可以沿住電線行去銅片，喺度俾檸檬酸嘅氫離子攞走，變成氫氣。電子沿住電線流動，就係電流！化學能變成電能，再喺 LED 變成光能。如果兩塊都係同一種金屬，兩邊推力一樣，就唔會有電流。',
      en: 'Back to basics: zinc is more reactive than copper (remember the Metal Bubble Race?), so zinc atoms give away electrons and become zinc ions in the lemon juice. The electrons cannot pass through the lemon juice, so they travel along the wire to the copper plate, where hydrogen ions from the citric acid take them and become hydrogen gas. Electrons flowing along a wire are an electric current! Chemical energy becomes electrical energy, and the LED turns it into light. If both plates were the same metal, both sides would push equally, and there would be no current.' },
    { tag: 'life', zh: '生活應用：遙控器同電筒用嘅乾電池入面都有鋅，原理同檸檬電池差唔多；手機就用鋰電池。電池用完要放入回收箱，唔好掉落垃圾桶。千祈唔好拆開或者咬電池，入面嘅化學物質會傷身。',
      en: 'Everyday life: the dry cells in remote controls and torches contain zinc and work in a similar way to a lemon battery; mobile phones use lithium batteries. Put used batteries in a recycling box, not the bin. Never open or bite a battery, because the chemicals inside can hurt you.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '如果三個檸檬入面，兩塊都用銅片，唔用鋅片，LED 會點？', en: 'If every lemon had two copper plates and no zinc plate, what would happen to the LED?' },
    options: [
      { zh: '會更加光', en: 'It would be brighter' },
      { zh: '唔會著，因為要兩種唔同嘅金屬先有電流', en: 'It would not light, because you need two different metals to get a current' },
      { zh: '淨係夜晚先會著', en: 'It would only light at night' },
    ],
    correct: 1,
    right: { zh: '啱！電池要靠兩種活潑程度唔同嘅金屬。兩邊都係銅，推力一樣，電子就唔會流動。', en: 'Right! A battery needs two metals with different reactivity. With copper on both sides, the pushes are equal, so the electrons do not flow.' },
    wrong: { zh: '再諗下：邊塊金屬負責將電子推出去？如果冇咗佢，仲會唔會有電流？', en: 'Think again: which metal pushes the electrons out? Without it, would there still be a current?' },
  },
  tools: [
    { id: 'p', label: { zh: '插金屬片', en: 'Insert a plate' }, run: (c) => c.plateNext() },
    { id: 'l', label: { zh: '加多一個檸檬', en: 'Add another lemon' }, run: (c) => c.lemonNext() },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = { n: 0, zn: false, cu: false };
    const push = () => api.state({ ...S });
    const LZ = -0.2, LY = T + 0.36, lx = [-2.5, -1.1, 0.3], SPX = [0.75, 2.05];
    const plateGeo = new THREE.BoxGeometry(0.035, 0.6, 0.16);
    const znMat = K.stdMat('#9aa7b4', 0.35, 0.8), cuMat = K.stdMat('#d9783a', 0.3, 0.85);
    const PIN = 0.75 - 0.36; // 插好之後，金屬片中心比檸檬中心高幾多
    function makeLemon() {
      const g = new THREE.Group();
      const mat = K.stdMat('#facc15', 0.55);
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 20), mat); body.scale.set(1.35, 0.85, 0.95); g.add(body);
      [-1, 1].forEach((s) => { const tip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.14, 16), mat); tip.rotation.z = -s * Math.PI / 2; tip.position.x = s * 0.6; g.add(tip); });
      return g;
    }
    // 檸檬 1 號
    const lem1 = makeLemon(); lem1.position.set(lx[0], LY, LZ); scene.add(lem1);
    const lLem = api.label({ zh: '檸檬 1 號', en: 'Lemon 1' }, { border: '#ca8a04', h: 0.17 }); lLem.position.set(lx[0], T + 0.1, LZ + 0.6);
    api.tap(lem1, () => api.emit('lemon'), { zh: '檸檬', en: 'Lemon' }, [lLem]);
    // 鋅片、銅片（企喺前面）
    const mkPlate = (mat, x, name, border) => {
      const g = new THREE.Group(); g.position.set(x, T + 0.3, 1.05); scene.add(g);
      const m = new THREE.Mesh(plateGeo, mat); g.add(m);
      const l = api.label(name, { border, h: 0.17 }); l.position.set(0, -0.15, 0.3); g.add(l);
      return { g, l };
    };
    const zn = mkPlate(znMat, -2.9, { zh: '鋅片 −', en: 'Zinc −' }, '#64748b');
    const cu = mkPlate(cuMat, -2.1, { zh: '銅片 ＋', en: 'Copper +' }, '#d9783a');
    const stand = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.05, 0.3), K.stdMat('#e2e8f0', 0.6)); stand.position.set(-2.5, T + 0.025, 1.05); scene.add(stand);
    const slot = { zn: V3(lx[0] - 0.2, LY + PIN, LZ), cu: V3(lx[0] + 0.2, LY + PIN, LZ) };

    // 後備檸檬（已經插好金屬片）
    const spares = SPX.map((x) => {
      const g = makeLemon(); g.position.set(x, LY, 1.0); scene.add(g);
      [[-0.2, znMat], [0.2, cuMat]].forEach(([px, mat]) => { const p = new THREE.Mesh(plateGeo, mat); p.position.set(px, PIN, 0); g.add(p); });
      g.scale.setScalar(0.85);
      return g;
    });
    const plate = new THREE.Mesh(new K.RoundedBoxGeometry(2.6, 0.04, 0.85, 2, 0.02), K.stdMat('#f8fafc', 0.4)); plate.position.set(1.4, T + 0.02, 1.0); scene.add(plate);
    const lSpare = api.label({ zh: '後備檸檬', en: 'Spare lemons' }, { border: '#ca8a04', h: 0.16 }); lSpare.position.set(1.4, T + 0.1, 1.55);
    // 檯面上嘅位置記號
    const spots = [1, 2].map((i) => { const r = K.makeHint(0.5); r.position.set(lx[i], T + 0.012, LZ); scene.add(r); return r; });

    // 右邊：電路板、LED、電壓錶
    const BX = 2.3;
    const board = new THREE.Mesh(new K.RoundedBoxGeometry(1.4, 0.08, 1.0, 2, 0.03), K.stdMat('#15803d', 0.6)); board.position.set(BX, T + 0.04, -0.2); scene.add(board);
    const termN = V3(BX - 0.55, T + 0.12, 0.1), termP = V3(BX - 0.55, T + 0.12, -0.5);
    [[termN, '#111827'], [termP, '#dc2626']].forEach(([p, c]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16), K.stdMat(c, 0.4)); m.position.copy(p); m.position.y -= 0.02; scene.add(m); });
    const led = new THREE.Group(); led.position.set(BX - 0.15, T + 0.08, -0.2); scene.add(led);
    [-0.04, 0.04].forEach((x) => { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 6), K.stdMat('#cbd5e1', 0.3, 0.9)); leg.position.set(x, 0.1, 0); led.add(leg); });
    const ledMat = new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.2, transparent: true, opacity: 0.85, emissive: '#ff2020', emissiveIntensity: 0 });
    const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.12, 20), ledMat); dome.position.y = 0.26; led.add(dome);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), ledMat); cap.position.y = 0.32; led.add(cap);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: K.softCircleTexture(), color: '#ff3b3b', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.scale.setScalar(1.4); glow.position.y = 0.3; led.add(glow);
    const ledLight = new THREE.PointLight('#ff3030', 0, 3); ledLight.position.y = 0.35; led.add(ledLight);
    const lLed = api.label({ zh: 'LED 燈', en: 'LED' }, { border: '#ef4444', h: 0.16 }); lLed.position.set(BX - 0.15, T + 0.68, -0.2);
    api.tap(led, () => api.emit('led'), { zh: 'LED 燈', en: 'LED' }, [lLed]);
    const meter = new THREE.Mesh(new K.RoundedBoxGeometry(0.52, 0.38, 0.14, 2, 0.03), K.stdMat('#fbbf24', 0.5)); meter.position.set(BX + 0.38, T + 0.27, -0.3); scene.add(meter);
    let volts = 0;
    const lVolt = api.label(() => `${volts.toFixed(1)} V`, { border: '#334155', bg: '#ecfccb', h: 0.2 }); lVolt.position.set(BX + 0.38, T + 0.3, -0.2);
    const lMeter = api.label({ zh: '電壓錶', en: 'Voltmeter' }, { border: '#f59e0b', h: 0.15 }); lMeter.position.set(BX + 0.38, T + 0.62, -0.3);
    api.tap(meter, () => api.emit('meter'), { zh: '電壓錶', en: 'Voltmeter' }, [lVolt, lMeter]);
    const setVolts = (v) => { volts = v; lVolt.userData.refresh(); };

    // 後排：乾電池、電插座
    const cell = new THREE.Group(); cell.position.set(-2.95, T + 0.1, -1.25); scene.add(cell);
    const cBody = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 24), K.stdMat('#1d4ed8', 0.4)); cBody.rotation.z = Math.PI / 2; cell.add(cBody);
    const cTip = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 16), K.stdMat('#cbd5e1', 0.3, 0.9)); cTip.rotation.z = Math.PI / 2; cTip.position.x = 0.27; cell.add(cTip);
    const socket = new THREE.Group(); socket.position.set(1.15, T, -1.3); scene.add(socket);
    const sBox = new THREE.Mesh(new K.RoundedBoxGeometry(0.42, 0.42, 0.1, 2, 0.03), K.stdMat('#f8fafc', 0.5)); sBox.position.y = 0.21; socket.add(sBox);
    [[-0.08, 0.27], [0.08, 0.27], [0, 0.14]].forEach(([x, y]) => { const h = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.07, 0.02), K.stdMat('#1f2937', 0.6)); h.position.set(x, y, 0.05); socket.add(h); });
    [[cell, 'cell', { zh: '乾電池', en: 'Dry cell' }, -2.95, 0.42], [socket, 'socket', { zh: '電插座', en: 'Wall socket' }, 1.15, 0.6]].forEach(([o, ev, name, x, y]) => {
      const l = api.label(name, { border: '#94a3b8', h: 0.15 }); l.position.set(x, T + y, -1.2);
      api.tap(o, () => api.emit(ev), name, [l]);
    });

    // 電線（曲線方向 = 電子流動方向：由鋅嗰邊去銅嗰邊）
    const tipOf = (i, metal) => V3(lx[i] + (metal === 'zn' ? -0.2 : 0.2), LY + PIN + 0.29, LZ);
    let wires = [];
    const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.03, 10, 8), new THREE.MeshBasicMaterial({ color: '#fde047' }), 40);
    dots.count = 0; dots.frustumCulled = false; dots.renderOrder = 5; scene.add(dots);
    function arc(a, b, h = 0.35) { const m = a.clone().lerp(b, 0.5); m.y = Math.max(a.y, b.y) + h; return new THREE.CatmullRomCurve3([a, m, b]); }
    function clearWires() { wires.forEach((w) => { scene.remove(w.mesh); w.mesh.geometry.dispose(); w.mesh.material.dispose(); }); wires = []; }
    function rebuildWires() {
      clearWires();
      if (!(S.zn && S.cu)) return;
      const n = S.n, add = (curve, color) => { const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.016, 8, false), K.stdMat(color, 0.5)); scene.add(mesh); wires.push({ mesh, curve }); };
      // 黑線沿檯面前面行，唔好穿過檸檬
      const z0 = tipOf(0, 'zn');
      add(new THREE.CatmullRomCurve3([z0, V3(z0.x - 0.3, T + 0.5, LZ + 0.55), V3(z0.x + 0.2, T + 0.05, LZ + 0.7), V3(BX - 1.0, T + 0.05, LZ + 0.7), termN], false, 'centripetal'), '#111827');
      for (let i = 0; i < n - 1; i++) add(arc(tipOf(i + 1, 'zn'), tipOf(i, 'cu'), 0.25), '#64748b');
      add(arc(termP, tipOf(n - 1, 'cu'), 0.55), '#dc2626');
    }
    function setLit(k) { ledMat.emissiveIntensity = 2.2 * k; glow.material.opacity = k; ledLight.intensity = 4 * k; }

    let busy = false, lit = 0;
    async function insert(which) {
      if (busy || S[which]) return false; busy = true;
      const P = which === 'zn' ? zn : cu, to = slot[which];
      P.l.visible = false;
      await K.moveTo(tw, P.g, V3(to.x, to.y + 0.55, to.z), 0, 0.5);
      await tw.to(0.5, (k) => { P.g.position.y = to.y + 0.55 * (1 - k); });
      S[which] = true;
      if (S.zn && S.cu) { S.n = 1; rebuildWires(); setVolts(VOLT); push(); api.emit('pl_volt'); api.done('plates'); } else { push(); api.emit('pl_one'); }
      busy = false;
    }
    async function addLemon(si, h) {
      const i = S.n; // 下一個空位
      if (busy || !(S.zn && S.cu) || i >= 3 || !spares[si].visible || spares[si].userData.placed) return false;
      busy = true;
      const g = spares[si];
      await K.moveTo(tw, g, V3(lx[i], LY + 0.6, LZ), 0, 0.45);
      await tw.to(0.45, (k) => { g.position.y = LY + 0.6 * (1 - k); g.scale.setScalar(0.85 + 0.15 * k); });
      g.userData.placed = true; h.setHome(g.position.clone());
      spots[i - 1].visible = false;
      S.n = i + 1; rebuildWires(); push();
      const v0 = volts; await tw.to(0.6, (k) => setVolts(v0 + (S.n * VOLT - v0) * k));
      setVolts(S.n * VOLT);
      if (S.n >= 3) { api.emit('ch_3'); await tw.to(0.8, (k) => { lit = k; setLit(k); }); api.done('chain'); } else api.emit('ch_2');
      busy = false;
    }
    const tgPlate = (which) => () => [{ key: which, pos: slot[which], r: 0.4, ringY: T, accept: () => !S[which] }];
    const hZn = api.drag(zn.g, { label: { zh: '鋅片', en: 'Zinc plate' }, lift: 0.9, enabled: () => !busy && !S.zn, targets: tgPlate('zn'), onDrop: () => insert('zn'), onTap: () => { if (!busy && !S.zn) hZn.dropOn('zn'); } });
    const hCu = api.drag(cu.g, { label: { zh: '銅片', en: 'Copper plate' }, lift: 0.9, enabled: () => !busy && !S.cu, targets: tgPlate('cu'), onDrop: () => insert('cu'), onTap: () => { if (!busy && !S.cu) hCu.dropOn('cu'); } });
    const nextSpare = () => spares.findIndex((g) => !g.userData.placed);
    const spotTarget = () => (S.zn && S.cu && S.n < 3 ? [{ key: 's', pos: V3(lx[S.n], LY + 0.3, LZ), r: 0.55, ringY: T, accept: () => S.n < 3 }] : []);
    const hSp = spares.map((g, si) => api.drag(g, { label: { zh: '後備檸檬', en: 'Spare lemon' }, lift: 0.7, extra: si === 0 ? [plate] : [],
      enabled: () => !busy && !g.userData.placed && S.zn && S.cu, targets: spotTarget, onDrop: (tg, h) => addLemon(si, h), onTap: () => { if (g.userData.placed) api.emit('lemon'); else if (!busy && S.zn && S.cu && S.n < 3) hSp[si].dropOn('s'); } }));

    push();
    return {
      cam: { pos: [-0.1, 3.9, 5.0], target: [-0.1, 1.4, -0.1], fitW: 7.2 },
      plateNext() { if (busy) return; if (!S.zn) hZn.dropOn('zn'); else if (!S.cu) hCu.dropOn('cu'); },
      lemonNext() { const si = nextSpare(); if (si >= 0 && S.zn && S.cu && !busy) hSp[si].dropOn('s'); },
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (id === 'plates') {
          if (!S.zn) { await hZn.dropOn('zn'); await api.waitSpeech(); }
          while (busy) await tw.wait(0.1);
          if (!S.cu) await hCu.dropOn('cu');
        }
        if (id === 'chain') {
          for (let si = nextSpare(); si >= 0 && S.n < 3; si = nextSpare()) { while (busy) await tw.wait(0.1); await hSp[si].dropOn('s'); await api.waitSpeech(); }
        }
      },
      getHint(id) {
        if (busy) return null;
        if (id === 'plates') { const w = !S.zn ? 'zn' : !S.cu ? 'cu' : null; return w ? { from: K.worldOf(w === 'zn' ? zn.g : cu.g, 0.1), to: slot[w] } : null; }
        if (id === 'chain') { const si = nextSpare(); return si < 0 || S.n >= 3 ? null : { from: K.worldOf(spares[si], 0.15), to: V3(lx[S.n], LY + 0.3, LZ) }; }
        return null;
      },
      update(dt, t) {
        spots.forEach((s, k) => { if (s.visible) { const p = Math.sin(t * 4 + k); s.material.opacity = S.zn && S.cu && S.n === k + 1 ? 0.45 + 0.35 * p : 0.12; } });
        // 電子（黃色小點）沿電線流動
        if (lit > 0 && wires.length) {
          let c = 0; const m4 = new THREE.Matrix4();
          wires.forEach((w) => { for (let j = 0; j < 6 && c < 40; j++) { const u = (t * 0.25 + j / 6) % 1; m4.makeTranslation(w.curve.getPointAt(u)); dots.setMatrixAt(c++, m4); } });
          dots.count = c; dots.instanceMatrix.needsUpdate = true;
        } else dots.count = 0;
        if (lit > 0) setLit(lit * (0.93 + 0.07 * Math.sin(t * 9)));
      },
      reset() {
        tw.clear(); busy = false; lit = 0; setLit(0); clearWires(); dots.count = 0;
        Object.assign(S, { n: 0, zn: false, cu: false }); push(); setVolts(0);
        zn.l.visible = true; cu.l.visible = true; spots.forEach((s) => { s.visible = true; });
        spares.forEach((g, si) => { g.userData.placed = false; g.scale.setScalar(0.85); hSp[si].setHome(V3(SPX[si], LY, 1.0)); });
        [hZn, hCu, ...hSp].forEach((h) => { h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.busy = false; });
      },
    };
  },
};
