/* =====================================================================
 * 實驗枱：電路枱（circuits）
 * 單元：🔋 電流、電動勢與短路（86–89）、Ω 電阻與歐姆定律（90–96）、💡 電功率與電費（97–100）、🏠 家居用電安全（101–106）
 * 模式：simple / ohm / sp（串聯並聯）/ power / home
 * 藍色小點＝電子（由電池負極流出）；電流方向（習慣上）由正極流出
 * ===================================================================== */
export default function create(ctx) {
  const { THREE, kit, root } = ctx;
  const { std, mesh, tag, glass, C, f } = kit;
  const L = kit.L2(ctx.lang);
  const clamp = THREE.MathUtils.clamp;
  const sc = (zh, en) => ({ zh, en });
  const TY = 0.85, WY = TY + 0.06;

  const APP = { led: { zh: 'LED 燈', en: 'LED lamp', P: 10, icon: '💡' }, fan: { zh: '風扇', en: 'Fan', P: 60, icon: '🌀' }, tv: { zh: '電視', en: 'TV', P: 150, icon: '📺' },
    heater: { zh: '暖爐', en: 'Heater', P: 2000, icon: '🔥' }, kettle: { zh: '電熱水煲', en: 'Kettle', P: 2200, icon: '🫖' } };
  const DEF = { mode: 'simple', cells: 1, sw: true, short: false, V: 6, load: 'res', R: 10, len: 1, thick: 2, mat: 'cu', rh: 0, topo: 'series', broken: false,
    app: 'led', hours: 1, price: 1.3, fault: false, earth: true, fuse: 13, nApp: 1 };
  const p = { ...DEF };
  const params = [
    { key: 'cells', label: sc('🔋 電池數目', '🔋 Number of cells'), min: 1, max: 4, step: 1, unit: '', fmt: (v) => `${v} × 1.5 V = ${f(v * 1.5, 1)} V` },
    { key: 'sw', type: 'toggle', label: sc('🔘 開關', '🔘 Switch') },
    { key: 'short', type: 'toggle', label: sc('⚠️ 用電線直接駁住燈泡兩邊（短路）', '⚠️ Wire across the bulb (short circuit)') },
    { key: 'V', label: sc('🔋 電源電壓', '🔋 Supply voltage'), min: 0, max: 12, step: 1, unit: 'V' },
    { key: 'load', type: 'select', label: sc('🧩 測試的元件', '🧩 Component under test'), options: [{ v: 'res', label: sc('電阻器', 'Resistor') }, { v: 'bulb', label: sc('燈泡', 'Bulb') }, { v: 'wire', label: sc('電線樣本', 'Wire sample') }] },
    { key: 'R', label: sc('Ω 電阻值', 'Ω Resistance'), min: 2, max: 20, step: 1, unit: 'Ω' },
    { key: 'len', label: sc('📏 電線長度', '📏 Wire length'), min: 0.5, max: 2, step: 0.25, unit: 'm' },
    { key: 'thick', label: sc('⭕ 電線粗幼（截面積）', '⭕ Wire thickness (area)'), min: 1, max: 4, step: 0.5, unit: 'mm²' },
    { key: 'mat', type: 'select', label: sc('🧪 電線物料', '🧪 Wire material'), options: [{ v: 'cu', label: sc('銅', 'Copper') }, { v: 'ni', label: sc('鎳鉻合金', 'Nichrome') }] },
    { key: 'rh', label: sc('🎚️ 變阻器', '🎚️ Rheostat'), min: 0, max: 20, step: 1, unit: 'Ω', hint: sc('調高電阻 = 電流變細，好似調光器', 'More resistance = less current, like a dimmer') },
    { key: 'topo', type: 'select', label: sc('🔗 接法', '🔗 Connection'), options: [{ v: 'series', label: sc('串聯', 'Series') }, { v: 'parallel', label: sc('並聯', 'Parallel') }] },
    { key: 'broken', type: 'toggle', label: sc('🪛 扭鬆第二個燈泡', '🪛 Unscrew bulb 2') },
    { key: 'app', type: 'select', label: sc('🔌 電器', '🔌 Appliance'), options: Object.keys(APP).map((v) => ({ v, label: { zh: APP[v].icon + ' ' + APP[v].zh, en: APP[v].icon + ' ' + APP[v].en } })) },
    { key: 'hours', label: sc('⏱️ 使用時間', '⏱️ Hours used'), min: 0.5, max: 10, step: 0.5, unit: 'h' },
    { key: 'price', label: sc('💲 每度電價錢', '💲 Price per kWh'), min: 0.8, max: 2, step: 0.1, unit: '', fmt: (v) => 'HK$' + v.toFixed(1) },
    { key: 'fault', type: 'toggle', label: sc('⚡ 故障：火線掂到金屬外殼', '⚡ Fault: live wire touches the metal case') },
    { key: 'earth', type: 'toggle', label: sc('🟢 駁好地線', '🟢 Earth wire connected') },
    { key: 'fuse', type: 'select', label: sc('🧯 保險絲', '🧯 Fuse'), options: [3, 5, 13].map((v) => ({ v, label: sc(v + ' A', v + ' A') })) },
    { key: 'nApp', label: sc('🔌 拖板上的大電器數目', '🔌 Big appliances on the adaptor'), min: 1, max: 4, step: 1, unit: '', fmt: (v) => `${v} × 1000 W` }
  ];
  const recs = [];
  const graphs = [{ id: 'iv', mode: 'scatter', fit: true, tab: sc('I–V 圖', 'I–V graph'), y: sc('電流 I (A)', 'current I (A)'), x: sc('電壓 V (V)', 'voltage V (V)'), min: 0.5, xRange: [0, 13],
    series: [['pts', sc('記錄的數據', 'Recorded points'), C.red]], data: () => ({ pts: { pts: recs } }) }];

  /* ---------------- 電路計算 ---------------- */
  const S = { t: 0 };
  function wireR() { return (p.mat === 'ni' ? 6 : 0.6) * p.len / p.thick + 0.2; }
  function solve() {
    const o = {};
    if (p.mode === 'simple') {
      const emf = 1.5 * p.cells, r = 0.3 * p.cells, Rb = 6;
      if (!p.sw) Object.assign(o, { I: 0, Vb: 0, emf });
      else if (p.short) { const I = emf / (r + 0.05); Object.assign(o, { I, Vb: I * 0.05, emf, short: true }); }
      else { const I = emf / (r + Rb); Object.assign(o, { I, Vb: I * Rb, emf }); }
      o.P = o.short ? 0 : o.Vb * o.Vb / 6; o.bright = clamp(o.P / 3, 0, 1.4);
    } else if (p.mode === 'ohm') {
      let R = p.load === 'res' ? p.R : p.load === 'wire' ? wireR() : 4;
      let I = 0;
      for (let k = 0; k < 30; k++) { I = p.V / (R + p.rh); if (p.load === 'bulb') R = 4 * (1 + 0.5 * (I * I * R)); }
      o.R = R; o.I = I; o.VL = I * R; o.bright = p.load === 'bulb' ? clamp(I * I * R / 6, 0, 1.4) : 0;
    } else if (p.mode === 'sp') {
      const V = 6, Rb = 6;
      if (p.topo === 'series') { const I = p.broken ? 0 : V / (2 * Rb); o.I1 = o.I2 = I; o.It = I; }
      else { o.I1 = V / Rb; o.I2 = p.broken ? 0 : V / Rb; o.It = o.I1 + o.I2; }
      o.b1 = clamp(o.I1 * o.I1 * Rb / 6, 0, 1.4); o.b2 = clamp(o.I2 * o.I2 * Rb / 6, 0, 1.4);
    } else if (p.mode === 'power') {
      const P = APP[p.app].P; o.P = P; o.I = P / 220; o.kWh = P / 1000 * p.hours; o.cost = o.kWh * p.price; o.J = P * 3600 * p.hours;
    } else if (p.mode === 'home') {
      o.Inorm = (p.nApp * 1000) / 220;
      o.Ifault = p.fault && p.earth ? 220 / 0.5 : 0;
      o.I = S.blown ? 0 : o.Inorm + o.Ifault;
      o.danger = p.fault && !p.earth && !S.blown;
    }
    return o;
  }

  /* ---------------- 教學 ---------------- */
  const currentStages = [
    { id: 'cu-intro', who: 'chan', title: sc('電流係電荷流動', 'Current is flowing charge'),
      say: sc('電池好似一個水泵，推動電路入面嘅電子流動，就好似水喺水管入面流咁。藍色小點就係電子。電路一定要係一個完整嘅圈，電子先流得動。', 'A battery is like a pump that pushes electrons round a circuit, like water in a pipe. The blue dots are electrons. The circuit must be a complete loop for them to flow.'),
      setup: { mode: 'simple', cells: 1, sw: true }, items: [86, 94] },
    { id: 'cu-sw', who: 'chan', title: sc('開關：估一估', 'The switch: predict'),
      say: sc('我哋打開開關。', "We're going to open the switch."), setup: { mode: 'simple', cells: 1, sw: true }, lock: ['cells', 'sw', 'short'],
      quiz: { q: sc('打開開關之後，燈泡會點？', 'What happens to the bulb when the switch is opened?'), opts: [sc('繼續著', 'It stays on'), sc('熄咗，因為電路斷咗', 'It goes out because the circuit is broken'), sc('暗少少', 'It gets a little dimmer')], ans: 1,
        run: [['set', 'sw', false]], watch: 2,
        why: sc('答案係：熄咗！電路斷咗一個位，電子就流唔過，所以全部停低，電流變成零。', 'The answer: it goes out! With a gap in the circuit, electrons can’t get through, so they all stop and the current becomes zero.') },
      adv: sc('電流 I = 電荷 Q ÷ 時間 t，單位係安培 (A)。', 'Current I = charge Q ÷ time t, measured in amperes (A).'),
      chain: [sc('電路斷開', 'Circuit broken'), sc('電子無法流動', 'Electrons can’t flow'), sc('燈泡熄滅', 'Bulb goes out')], items: [86] },
    { id: 'cu-emf', who: 'chan', title: sc('電動勢與電勢差', 'E.m.f. and p.d.'),
      say: sc('電池俾每個電荷能量，叫電動勢；電荷經過燈泡，將能量變成光同熱，燈泡兩端嘅電壓叫電勢差。兩樣都用伏特做單位，可以話係「每個電荷帶住幾多能量」。',
        'The battery gives energy to each charge: that is the e.m.f. As charges pass through the bulb, they turn that energy into light and heat; the voltage across the bulb is the potential difference. Both are measured in volts: how much energy each charge carries.'),
      setup: { mode: 'simple', cells: 1, sw: true },
      chain: [sc('電池給電荷能量（電動勢）', 'Battery gives charges energy (e.m.f.)'), sc('電荷流到燈泡', 'Charges reach the bulb'), sc('能量變光和熱（電勢差）', 'Energy becomes light and heat (p.d.)')], items: [87, 88] },
    { id: 'cu-cells', who: 'ming', title: sc('多一粒電池：估一估', 'One more cell: predict'),
      say: sc('我哋串聯多一粒電池。', 'We add another cell in series.'), setup: { mode: 'simple', cells: 1, sw: true }, lock: ['cells', 'sw', 'short'],
      quiz: { q: sc('燈泡會點？', 'What happens to the bulb?'), opts: [sc('暗啲', 'Dimmer'), sc('光啲', 'Brighter'), sc('一樣', 'The same')], ans: 1,
        run: [['set', 'cells', 2]], watch: 2,
        why: sc('答案係：光啲！兩粒電池串聯，電動勢加倍，推電子推得大力啲，電流大咗，燈泡就光啲。', 'The answer: brighter! Two cells in series double the e.m.f., pushing the electrons harder, so the current rises and the bulb is brighter.') }, items: [87] },
    { id: 'cu-short', who: 'chan', title: sc('短路：估一估', 'Short circuit: predict'),
      say: sc('如果有條電線直接駁住燈泡兩邊呢？', 'What if a wire connects straight across the bulb?'), setup: { mode: 'simple', cells: 2, sw: true }, lock: ['cells', 'sw', 'short'],
      quiz: { q: sc('會發生咩事？', 'What happens?'), opts: [sc('燈泡更光', 'The bulb gets brighter'), sc('燈泡熄咗，電流變得好大，電線會好熱好危險', 'The bulb goes out, the current becomes huge and the wire gets dangerously hot'), sc('冇事', 'Nothing')], ans: 1,
        run: [['set', 'short', true]], watch: 2,
        why: sc('答案係：燈泡熄咗，電流好大！電子會揀幾乎冇電阻嘅捷徑走，唔經燈泡。電阻好細，電流就好大，電線同電池會變得好熱，可能起火。所以短路好危險！',
          'The answer: the bulb goes out and the current gets huge! The electrons take the shortcut with almost no resistance, skipping the bulb. With tiny resistance the current is enormous, and the wire and battery get very hot and could catch fire. Short circuits are dangerous!') },
      chain: [sc('電流走捷徑', 'Current takes the shortcut'), sc('電阻極細，電流極大', 'Tiny resistance, huge current'), sc('發熱，可能起火', 'Heating, possible fire')], items: [89] },
    { id: 'cu-sum', who: 'chan', title: sc('總結', 'Summary'),
      say: sc('電流係電荷流動，要完整電路先有；電動勢係電池俾電荷嘅能量；電勢差係元件用咗嘅能量；短路會令電流極大，好危險。', 'Current is flowing charge and needs a complete circuit; e.m.f. is the energy the battery gives each charge; p.d. is the energy a component uses; short circuits make huge, dangerous currents.'),
      setup: { mode: 'simple', cells: 1, sw: true }, finish: true }
  ];
  const ohmStages = [
    { id: 'oh-intro', who: 'chan', title: sc('電阻', 'Resistance'),
      say: sc('電阻就係電流有幾難通過，好似水管入面塞咗啲沙。電阻越大，同一個電壓推出嚟嘅電流就越細。', 'Resistance is how hard it is for current to get through, like sand partly blocking a pipe. The bigger the resistance, the smaller the current for the same voltage.'),
      setup: { mode: 'ohm', load: 'res', R: 10, V: 6 }, graph: 'iv', items: [93, 90] },
    { id: 'oh-q', who: 'chan', title: sc('歐姆定律：估一估', "Ohm's law: predict"),
      say: sc('電阻器嘅電阻係 10 Ω，電壓由 6 V 加到 12 V。', 'A 10 Ω resistor; the voltage goes from 6 V up to 12 V.'), setup: { mode: 'ohm', load: 'res', R: 10, V: 6 }, lock: ['V', 'R', 'load', 'rh'],
      quiz: { q: sc('電壓加倍，電流會點？', 'If the voltage doubles, what happens to the current?'), opts: [sc('減半', 'It halves'), sc('加倍', 'It doubles'), sc('唔變', 'It stays the same')], ans: 1,
        run: [['set', 'V', 12]], watch: 1.5,
        why: sc('答案係：加倍！溫度不變嘅金屬導體，電流同電壓成正比，呢個就係歐姆定律：V = IR。', "The answer: it doubles! For a metal conductor at a steady temperature, current is proportional to voltage. That is Ohm's law: V = IR.") },
      chain: [sc('電壓加倍', 'Double the voltage'), sc('電阻不變', 'Same resistance'), sc('電流加倍', 'Double the current')], items: [90] },
    { id: 'oh-graph', who: 'ming', title: sc('畫 I–V 圖', 'Plot an I–V graph'),
      say: sc('揀三個唔同電壓，每次撳「記錄」。電阻器嘅點會排成一條穿過原點嘅直線，條線嘅斜率等於 1 ÷ R。', "Pick three voltages and tap 'Record' each time. A resistor's points form a straight line through the origin, and its slope equals 1 ÷ R."),
      task: sc('記錄三個不同電壓的讀數', 'Record readings at three different voltages'), setup: { mode: 'ohm', load: 'res', R: 10, V: 3 }, graph: 'iv', lock: ['R', 'load'],
      goal: { type: 'record', test: (d) => d.count >= 3 }, demo: [['openTools'], ['set', 'V', 3], ['record'], ['set', 'V', 6], ['record'], ['set', 'V', 9], ['record']], settle: 2.5,
      adv: sc('用電流錶串聯、電壓錶並聯量 V 同 I，就可以計 R = V ÷ I。量好細嘅電阻要用大電流；量好大嘅電阻，電壓錶本身都會分走電流，要小心接法。',
        'Measure V with a voltmeter in parallel and I with an ammeter in series, then R = V ÷ I. For very small resistances use a large current; for very large ones the voltmeter itself draws current, so the connection matters.'), items: [90, 95, 96] },
    { id: 'oh-bulb', who: 'chan', title: sc('燈泡唔跟歐姆定律', 'A bulb breaks the rule'),
      say: sc('換做燈泡，再記錄幾點。', 'Swap in a bulb and record a few points.'), setup: { mode: 'ohm', load: 'bulb', V: 2 }, graph: 'iv', lock: ['V', 'R', 'load', 'rh'],
      quiz: { q: sc('燈泡嘅 I–V 線會向下彎，原因係？', "Why does the bulb's I–V line bend over?"), opts: [sc('燈絲變熱，電阻變大', 'The filament heats up and its resistance increases'), sc('電池冇電', 'The battery is running out'), sc('電線斷咗', 'A wire is broken')], ans: 0,
        run: [['set', 'V', 2], ['record'], ['set', 'V', 5], ['record'], ['set', 'V', 8], ['record'], ['set', 'V', 12], ['record']], watch: 1,
        why: sc('答案係：燈絲變熱，電阻變大！電壓越大，燈絲越熱，電阻越大，所以電流增加得越來越慢，條線就向下彎。', 'The answer: the filament heats up and its resistance increases! Higher voltage makes the filament hotter and its resistance bigger, so the current rises more and more slowly and the line curves.') }, items: [90, 93] },
    { id: 'oh-wire', who: 'chan', title: sc('影響電阻的因素：估一估', 'What affects resistance: predict'),
      say: sc('換做一條電線樣本，我哋將佢拉長。', 'Now a wire sample. We make it longer.'), setup: { mode: 'ohm', load: 'wire', V: 6, len: 1, thick: 2, mat: 'ni' }, lock: ['V', 'len', 'thick', 'mat', 'load', 'rh'],
      quiz: { q: sc('電線越長，電阻會點？', 'What happens to resistance as the wire gets longer?'), opts: [sc('越大', 'It increases'), sc('越細', 'It decreases'), sc('唔變', 'It stays the same')], ans: 0,
        run: [['set', 'len', 2]], watch: 1.5,
        why: sc('答案係：越大！電線越長，電子要撞過嘅原子越多；電線越粗，就好似水管越闊，電阻越細；唔同物料電阻都唔同。變阻器就係用改變電線長度去調校電流，好似調光器。',
          'The answer: it increases! A longer wire means more atoms for electrons to bump into; a thicker wire is like a wider pipe with less resistance; and different materials resist differently. A rheostat changes the length of wire in use to adjust the current, like a dimmer switch.') },
      chain: [sc('越長 → 電阻越大', 'Longer → more resistance'), sc('越粗 → 電阻越細', 'Thicker → less resistance'), sc('物料不同 → 電阻不同', 'Material matters')], items: [91] },
    { id: 'oh-sp', who: 'ming', title: sc('串聯與並聯：估一估', 'Series and parallel: predict'),
      say: sc('兩個燈泡串聯，一個接一個排成一條路。我哋扭鬆其中一個。', 'Two bulbs in series, one after the other in a single path. We unscrew one of them.'), setup: { mode: 'sp', topo: 'series', broken: false }, lock: ['topo', 'broken'],
      quiz: { q: sc('另一個燈泡會點？', 'What happens to the other bulb?'), opts: [sc('都熄埋', 'It goes out too'), sc('更光', 'It gets brighter'), sc('冇變', 'No change')], ans: 0,
        run: [['set', 'broken', true]], watch: 2,
        why: sc('答案係：都熄埋！串聯只得一條路，斷咗一個位，全部停。並聯就有幾條路，一個壞咗，其他照著，所以屋企嘅電器全部係並聯。', 'The answer: it goes out too! A series circuit has only one path, so one break stops everything. Parallel circuits have several paths, so the others stay on. That is why home appliances are wired in parallel.') },
      chain: [sc('串聯：一條路', 'Series: one path'), sc('斷一處全部停', 'One break stops all'), sc('並聯：幾條路，互不影響', 'Parallel: separate paths')], items: [92, 94] },
    { id: 'oh-par', who: 'chan', title: sc('並聯', 'Parallel'),
      say: sc('轉做並聯，再扭鬆第二個燈泡，第一個燈泡依然著。並聯時每個燈泡都有成個電池嘅電壓，所以仲光過串聯。', 'Switch to parallel and unscrew bulb 2: bulb 1 stays lit. In parallel, each bulb gets the full battery voltage, so they shine brighter than in series.'),
      task: sc('揀「並聯」', "Choose 'Parallel'"), setup: { mode: 'sp', topo: 'series', broken: false },
      goal: { type: 'param', test: () => p.topo === 'parallel' }, demo: [['openTools'], ['set', 'topo', 'parallel'], ['wait', 1], ['set', 'broken', true]], settle: 3, items: [92] },
    { id: 'oh-sum', who: 'chan', title: sc('總結', 'Summary'),
      say: sc('歐姆定律：V = IR。電阻受長度、粗幼同物料影響；燈泡變熱電阻會變大；串聯一條路，並聯幾條路。', "Ohm's law: V = IR. Resistance depends on length, thickness and material; a hot bulb's resistance rises; series has one path, parallel has several."),
      finish: true }
  ];
  const powerStages = [
    { id: 'pw-intro', who: 'chan', title: sc('電功率', 'Electrical power'),
      say: sc('功率就係每秒用幾多電能，單位係瓦特。插蘇有 220 伏特，電器功率越大，每秒用嘅電就越多，錶入面個轉盤轉得越快。', 'Power is how much electrical energy is used each second, measured in watts. The socket supplies 220 volts; the more powerful the appliance, the more energy it uses each second and the faster the meter disc spins.'),
      setup: { mode: 'power', app: 'led', hours: 1 }, items: [97] },
    { id: 'pw-q', who: 'chan', title: sc('估一估', 'Predict'),
      say: sc('比較 10 W 嘅 LED 燈同 2200 W 嘅電熱水煲。', 'Compare a 10 W LED lamp with a 2200 W kettle.'), setup: { mode: 'power', app: 'led', hours: 1 }, lock: ['app', 'hours', 'price'],
      quiz: { q: sc('兩樣都用 1 個鐘，邊個用電多？', 'If both run for 1 hour, which uses more electricity?'), opts: [sc('電熱水煲用多好多', 'The kettle, by far'), sc('一樣', 'The same'), sc('LED 燈多啲', 'The LED lamp')], ans: 0,
        run: [['set', 'app', 'kettle']], watch: 2,
        why: sc('答案係：電熱水煲！佢嘅功率係 LED 燈嘅 220 倍，同樣時間就用多 220 倍電能。產生熱嘅電器通常功率最大。', 'The answer: the kettle! Its power is 220 times the LED lamp’s, so in the same time it uses 220 times the energy. Appliances that make heat usually have the highest power.') }, items: [97, 98] },
    { id: 'pw-pvi', who: 'ming', title: sc('P = VI', 'P = VI'),
      say: sc('功率等於電壓乘電流。電熱水煲 2200 瓦，喺 220 伏特下面，電流就係 10 安培，好大！所以大電器要用粗啲嘅電線。', 'Power equals voltage times current. A 2200 W kettle at 220 V draws 10 amps, which is a lot! That is why big appliances need thicker cables.'),
      setup: { mode: 'power', app: 'kettle', hours: 1 },
      adv: sc('P = VI = I²R；電阻器耗散的電能 E = Pt = VIt。', 'P = VI = I²R; energy dissipated by a resistor E = Pt = VIt.'), items: [97, 98] },
    { id: 'pw-rating', who: 'chan', title: sc('功率額定值', 'Power ratings'),
      say: sc('每件電器背面都有一個標籤，寫住佢嘅額定電壓同功率。', 'Every appliance has a label on the back showing its rated voltage and power.'),
      quiz: { q: sc('電器上面寫住「220 V 1000 W」係咩意思？', "What does '220 V 1000 W' on an appliance mean?"), opts: [sc('接 220 V 時，每秒用 1000 焦耳電能', 'On 220 V it uses 1000 joules of electrical energy each second'), sc('可以用 1000 年', 'It lasts 1000 years'), sc('重 1000 克', 'It weighs 1000 grams')], ans: 0,
        why: sc('答案係：接 220 V 時每秒用 1000 焦耳！1 瓦特就係每秒 1 焦耳。如果接錯電壓，電器可能唔夠力或者燒壞。', 'The answer: on 220 V it uses 1000 joules each second! One watt is one joule per second. On the wrong voltage, an appliance may work poorly or burn out.') }, items: [99] },
    { id: 'pw-cost', who: 'chan', title: sc('計電費', 'Work out the bill'),
      say: sc('電力公司用「度」計錢，一度電就係 1 千瓦用 1 個鐘，即係 1 千瓦時。', 'Power companies charge by the unit: one unit is 1 kilowatt used for 1 hour, a kilowatt-hour.'), setup: { mode: 'power', app: 'heater', hours: 1 }, lock: ['app', 'hours', 'price'],
      quiz: { q: sc('2 kW 嘅暖爐開 3 個鐘，用咗幾多度電？', 'A 2 kW heater runs for 3 hours. How many units does it use?'), opts: [sc('6 度', '6 units'), sc('5 度', '5 units'), sc('1.5 度', '1.5 units')], ans: 0,
        run: [['set', 'hours', 3]], watch: 1.5,
        why: sc('答案係：6 度！度數 = 千瓦 × 小時 = 2 × 3 = 6。如果每度 1.3 蚊，就要 7.8 蚊。', 'The answer: 6 units! Units = kilowatts × hours = 2 × 3 = 6. At HK$1.3 per unit, that costs HK$7.80.') },
      adv: sc('電費 = 功率 (kW) × 時間 (h) × 每度電價。', 'Cost = power (kW) × time (h) × price per kWh.'), items: [100] },
    { id: 'pw-sum', who: 'chan', title: sc('總結', 'Summary'),
      say: sc('功率係每秒用幾多能量，P = VI。電費按千瓦時計：功率越大、用得越耐，就越貴。', 'Power is energy per second, P = VI. Electricity is charged by the kilowatt-hour: more power for longer costs more.'),
      setup: { mode: 'power', app: 'heater', hours: 3 }, finish: true }
  ];
  const homeStages = [
    { id: 'hm-intro', who: 'chan', title: sc('家居電路', 'Home wiring'),
      say: sc('屋企嘅電係 220 伏特交流電，好危險，千祈唔好玩。插頭入面有三條線：啡色係火線，藍色係中性線，黃綠色係地線。', 'Home electricity is 220-volt alternating current. It is dangerous, so never play with it. A plug has three wires: brown is live, blue is neutral, and green-and-yellow is earth.'),
      setup: { mode: 'home', fault: false, earth: true, fuse: 13, nApp: 1 }, items: [101, 102] },
    { id: 'hm-wires', who: 'chan', title: sc('三條線', 'Three wires'),
      say: sc('考吓你記唔記得。', "Let's see if you remember."), setup: { mode: 'home' },
      quiz: { q: sc('黃綠色嘅係邊條線？', 'Which wire is green and yellow?'), opts: [sc('火線', 'Live'), sc('地線', 'Earth'), sc('中性線', 'Neutral')], ans: 1,
        why: sc('答案係：地線！地線駁住電器嘅金屬外殼，出事嗰陣將電流引落地底。火線有危險電壓，保險絲同開關都要裝喺火線上。', 'The answer: earth! The earth wire connects to the metal case and carries current safely to the ground if something goes wrong. The live wire carries the dangerous voltage, so fuses and switches go on the live wire.') }, items: [103, 105] },
    { id: 'hm-fault', who: 'chan', title: sc('地線救命：估一估', 'Earth to the rescue: predict'),
      say: sc('多士爐入面條火線鬆咗，掂到金屬外殼。地線係駁好咗嘅。', "Inside the toaster, the live wire has come loose and touches the metal case. The earth wire is connected."),
      setup: { mode: 'home', fault: false, earth: true, fuse: 5, nApp: 1 }, lock: ['fault', 'earth', 'fuse', 'nApp'],
      quiz: { q: sc('會發生咩事？', 'What happens?'), opts: [sc('好大電流經地線流走，保險絲燒斷，安全', 'A big current flows down the earth wire, the fuse blows, and it is safe'), sc('外殼帶電，好危險', 'The case becomes live and dangerous'), sc('冇事發生', 'Nothing happens')], ans: 0,
        run: [['set', 'fault', true]], watch: 2,
        why: sc('答案係：保險絲燒斷，安全！地線電阻好細，好大電流即刻經地線流走，保險絲受唔住就燒斷，切斷電源。如果冇地線，外殼就會帶電，有人掂到就會觸電。',
          'The answer: the fuse blows and it is safe! The earth wire has very low resistance, so a huge current rushes through it and the fuse melts, cutting off the power. Without the earth wire, the case would stay live and anyone touching it could get a shock.') },
      chain: [sc('火線碰到外殼', 'Live touches the case'), sc('大電流經地線流走', 'Big current flows to earth'), sc('保險絲燒斷，切斷電源', 'Fuse blows, power cut off')], items: [103, 104] },
    { id: 'hm-fuse', who: 'ming', title: sc('揀保險絲', 'Choosing a fuse'),
      say: sc('保險絲要比電器正常電流大少少，咁先唔會無端端燒斷，但出事時又會燒斷。', 'A fuse should be rated just above the normal current, so it doesn’t blow for no reason but does blow when there is a fault.'),
      quiz: { q: sc('電器正常用 2 A，應該揀幾多 A 嘅保險絲？', 'An appliance normally draws 2 A. Which fuse should it have?'), opts: [sc('3 A', '3 A'), sc('13 A', '13 A'), sc('1 A', '1 A')], ans: 0,
        why: sc('答案係：3 A！1 A 太細，一開就燒斷；13 A 太大，出事時電流未夠大都唔會燒斷，保護唔到。', 'The answer: 3 A! A 1 A fuse would blow straight away; a 13 A fuse is too big and might not blow in a fault, so it wouldn’t protect you.') }, items: [104] },
    { id: 'hm-over', who: 'chan', title: sc('過載：估一估', 'Overloading: predict'),
      say: sc('一個拖板插晒四部 1000 瓦嘅大電器。', 'One adaptor with four 1000 W appliances plugged in.'), setup: { mode: 'home', fault: false, earth: true, fuse: 13, nApp: 1 }, lock: ['fault', 'earth', 'fuse', 'nApp'],
      quiz: { q: sc('會點？', 'What happens?'), opts: [sc('電流太大，電線過熱，保險絲燒斷', 'Too much current: wires overheat and the fuse blows'), sc('冇事', 'Nothing'), sc('慳電', 'It saves electricity')], ans: 0,
        run: [['set', 'nApp', 4]], watch: 2,
        why: sc('答案係：電流太大！4000 瓦除 220 伏特，大約 18 安培，超過 13 A 保險絲，所以燒斷。如果冇保險絲，電線過熱可能引致火警。', 'The answer: too much current! 4000 W ÷ 220 V is about 18 A, more than the 13 A fuse, so it blows. Without a fuse, the overheated wires could start a fire.') }, items: [101, 105, 106] },
    { id: 'hm-save', who: 'chan', title: sc('慳電', 'Saving electricity'),
      say: sc('慳電可以慳錢，又可以保護環境。', 'Saving electricity saves money and protects the environment.'),
      quiz: { q: sc('以下邊樣最慳電？', 'Which of these saves electricity?'), opts: [sc('離開房間熄燈', 'Switch off lights when leaving a room'), sc('冷氣開到 16 度', 'Set the air conditioner to 16 degrees'), sc('雪櫃門長期打開', 'Leave the fridge door open')], ans: 0,
        why: sc('答案係：熄燈！仲可以：冷氣設定喺 25 度左右、用 LED 燈、揀有能源標籤嘅電器、唔用嘅電器拔插頭。', 'The answer: switch off the lights! Also: set the air conditioner around 25 degrees, use LED lamps, choose energy-label appliances, and unplug things you aren’t using.') }, items: [106] },
    { id: 'hm-sum', who: 'chan', title: sc('總結', 'Summary'),
      say: sc('火線、中性線、地線各有用途；地線同保險絲保護我哋；唔好過載；記得慳電。濕手千祈唔好掂電器！', 'Live, neutral and earth each have a job; the earth wire and fuse protect us; don’t overload sockets; and save electricity. Never touch electrical things with wet hands!'),
      setup: { mode: 'home' }, finish: true }
  ];

  /* ================== 3D 場景 ================== */
  const G = {}; ['simple', 'ohm', 'sp', 'power', 'home'].forEach((k) => { G[k] = new THREE.Group(); root.add(G[k]); });
  const V = {};
  function board(parent, w = 10, d = 4.6) {
    mesh(new THREE.BoxGeometry(w + 0.6, 0.1, d + 0.6), std(0xf1f5f9, 0.8), 0, TY - 0.05, 0, parent);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) mesh(new THREE.BoxGeometry(0.12, TY - 0.1, 0.12), std(0x94a3b8, 0.5, 0.5), sx * (w / 2), (TY - 0.1) / 2, sz * (d / 2), parent);
  }
  const wireMat = std(0xb45309, 0.5, 0.6);
  function wire(parent, pts, mat = wireMat, w = 0.05) { for (let i = 0; i < pts.length - 1; i++) kit.beam(parent, mat, w).set(pts[i][0], WY, pts[i][1], pts[i + 1][0], WY, pts[i + 1][1]); }
  function battery(parent, x, z, n, vertical = true) {
    const g = new THREE.Group(); g.position.set(x, WY + 0.12, z); parent.add(g);
    const cells = [];
    for (let i = 0; i < 4; i++) {
      const c = new THREE.Group(); g.add(c);
      mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.5, 18), std(0x111827, 0.4), 0, 0, 0, c).rotation.x = Math.PI / 2;
      mesh(new THREE.CylinderGeometry(0.145, 0.145, 0.12, 18), std(0xf59e0b, 0.4), 0, 0, -0.2, c).rotation.x = Math.PI / 2;
      c.position.z = (i - 1.5) * 0.52; cells.push(c);
    }
    if (!vertical) g.rotation.y = Math.PI / 2;
    const t = tag('readout light', g, 0.45, 0.2, 0);
    return { g, cells, t };
  }
  function bulb(parent, x, z) {
    const g = new THREE.Group(); g.position.set(x, WY, z); parent.add(g);
    mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.2, 16), std(0x94a3b8, 0.3, 0.8), 0, 0.1, 0, g);
    const glassM = new THREE.MeshStandardMaterial({ color: 0xfef9c3, roughness: 0.1, transparent: true, opacity: 0.55, emissive: 0xfacc15, emissiveIntensity: 0 });
    const gl = mesh(new THREE.SphereGeometry(0.24, 20, 16), glassM, 0, 0.42, 0, g, false);
    const halo = mesh(new THREE.SphereGeometry(0.5, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0, depthWrite: false }), 0, 0.42, 0, g, false);
    return { g, gl, halo, set(b) { glassM.emissiveIntensity = b * 1.8; halo.material.opacity = Math.min(0.45, b * 0.35); halo.scale.setScalar(0.8 + b * 0.6); } };
  }
  function meter(parent, x, z, letter) {
    const g = new THREE.Group(); g.position.set(x, WY, z); parent.add(g);
    mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.14, 24), std(0xffffff, 0.5), 0, 0.07, 0, g);
    const needle = mesh(new THREE.BoxGeometry(0.02, 0.02, 0.26), std(0xdc2626), 0, 0.16, 0, g, false); needle.geometry.translate(0, 0, -0.13);
    const t = tag('readout', g, 0, 0.55, 0);
    const l = tag('readout light', g, 0, 0.2, 0.42); l.el.textContent = letter;
    return { g, needle, t, set(frac) { needle.rotation.y = clamp(frac, 0, 1) * 1.6 - 0.8; } };
  }
  function pathOf(pts) { // 折線：累計長度
    const segs = []; let tot = 0;
    for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]); segs.push({ a, b, l, s0: tot }); tot += l; }
    return { segs, tot, at(s) { s = ((s % tot) + tot) % tot; const g = segs.find((q) => s <= q.s0 + q.l) || segs[segs.length - 1], t = (s - g.s0) / g.l; return [g.a[0] + (g.b[0] - g.a[0]) * t, g.a[1] + (g.b[1] - g.a[1]) * t]; } };
  }
  const NE = 70;
  function mount() {
    for (const k of Object.keys(G)) board(G[k]);
    // 簡單電路
    const gS = G.simple;
    wire(gS, [[-3, 1.2], [-3, -1.2], [-1.4, -1.2]]); wire(gS, [[-0.6, -1.2], [3, -1.2], [3, -0.25]]); wire(gS, [[3, 0.25], [3, 1.2], [0.4, 1.2]]); wire(gS, [[-0.4, 1.2], [-3, 1.2]]);
    V.sBat = battery(gS, -3, 0, 4); V.sBulb = bulb(gS, 3, 0);
    V.sw = new THREE.Group(); V.sw.position.set(-1.4, WY + 0.05, -1.2); gS.add(V.sw);
    mesh(new THREE.BoxGeometry(0.9, 0.06, 0.25), std(0x334155), 0.4, 0, 0, gS).position.set(-1, WY, -1.2);
    V.swLever = mesh(new THREE.BoxGeometry(0.8, 0.05, 0.06), std(0x94a3b8, 0.3, 0.8), 0.4, 0.05, 0, V.sw); V.swLever.geometry.translate(0, 0, 0);
    V.sAm = meter(gS, 0, 1.2, 'A'); V.sVm = meter(gS, 4.3, 0, 'V');
    wire(gS, [[3, -0.6], [4.3, -0.6], [4.3, -0.3]], std(0x64748b), 0.03); wire(gS, [[3, 0.6], [4.3, 0.6], [4.3, 0.3]], std(0x64748b), 0.03);
    V.shortW = new THREE.Group(); gS.add(V.shortW); wire(V.shortW, [[3, -0.8], [2.3, -0.8], [2.3, 0.8], [3, 0.8]], std(0xef4444, 0.4, 0, { emissive: 0xff2200, emissiveIntensity: 0.6 }), 0.06);
    V.warn = tag('readout warn', gS, 1.6, WY + 1.2, 0);
    V.pathMain = pathOf([[-3, 1.0], [-3, -1.2], [3, -1.2], [3, 1.2], [-3, 1.2], [-3, 1.0]]);
    V.pathShort = pathOf([[-3, 1.0], [-3, -1.2], [3, -1.2], [3, -0.8], [2.3, -0.8], [2.3, 0.8], [3, 0.8], [3, 1.2], [-3, 1.2], [-3, 1.0]]);
    // 歐姆
    const gO = G.ohm;
    wire(gO, [[-3, 1.2], [-3, -1.2], [-1.0, -1.2]]); wire(gO, [[1.0, -1.2], [3, -1.2], [3, 1.2], [0.4, 1.2]]); wire(gO, [[-0.4, 1.2], [-1.7, 1.2]]); wire(gO, [[-2.5, 1.2], [-3, 1.2]]);
    V.oBat = battery(gO, -3, 0, 4);
    V.res = new THREE.Group(); V.res.position.set(0, WY + 0.1, -1.2); gO.add(V.res);
    mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.2, 16), std(0xd6b88a, 0.6), 0, 0, 0, V.res).rotation.z = Math.PI / 2;
    [0x92400e, 0x111827, 0xdc2626, 0xfacc15].forEach((c, i) => mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.06, 16), std(c), -0.35 + i * 0.2, 0, 0, V.res).rotation.z = Math.PI / 2);
    V.oBulb = bulb(gO, 0, -1.2);
    V.wireS = mesh(new THREE.CylinderGeometry(0.03, 0.03, 2, 10), std(0x94a3b8, 0.3, 0.9), 0, WY + 0.05, -1.2, gO); V.wireS.rotation.z = Math.PI / 2;
    V.rheo = new THREE.Group(); V.rheo.position.set(-2.1, WY, 1.2); gO.add(V.rheo);
    mesh(new THREE.BoxGeometry(0.9, 0.2, 0.35), std(0x334155), 0, 0.1, 0, V.rheo);
    V.rheoS = mesh(new THREE.BoxGeometry(0.08, 0.16, 0.42), std(0xf59e0b), 0, 0.28, 0, V.rheo);
    V.oAm = meter(gO, 0, 1.2, 'A'); V.oVm = meter(gO, 0, -2.4, 'V');
    wire(gO, [[-0.9, -1.2], [-0.9, -2.4], [-0.3, -2.4]], std(0x64748b), 0.03); wire(gO, [[0.9, -1.2], [0.9, -2.4], [0.3, -2.4]], std(0x64748b), 0.03);
    V.pathO = pathOf([[-3, 1.0], [-3, -1.2], [3, -1.2], [3, 1.2], [-3, 1.2], [-3, 1.0]]);
    V.oTag = tag('readout', gO, 2.2, WY + 1.2, 0);
    // 串聯並聯
    const gP = G.sp;
    V.pBat = battery(gP, -3, 0, 4);
    V.spSeries = new THREE.Group(); gP.add(V.spSeries); wire(V.spSeries, [[-3, 1.2], [-3, -1.2], [3, -1.2], [3, -0.9]]); wire(V.spSeries, [[3, -0.3], [3, 0.3]]); wire(V.spSeries, [[3, 0.9], [3, 1.2], [-3, 1.2]]);
    V.spPar = new THREE.Group(); gP.add(V.spPar); wire(V.spPar, [[-3, 1.2], [-3, -1.2], [4.3, -1.2], [4.3, -0.3]]); wire(V.spPar, [[1.5, -1.2], [1.5, -0.3]]); wire(V.spPar, [[1.5, 0.3], [1.5, 1.2]]); wire(V.spPar, [[4.3, 0.3], [4.3, 1.2], [-3, 1.2]]);
    V.b1 = bulb(gP, 3, -0.6); V.b2 = bulb(gP, 3, 0.6);
    V.b1t = tag('readout', gP, 0, 0, 0); V.b2t = tag('readout', gP, 0, 0, 0);
    V.pTot = tag('readout', gP, -3.6, WY + 1.1, 0);
    V.pathSer = pathOf([[-3, 1.0], [-3, -1.2], [3, -1.2], [3, 1.2], [-3, 1.2], [-3, 1.0]]);
    V.pathP1 = pathOf([[-3, 1.0], [-3, -1.2], [1.5, -1.2], [1.5, 1.2], [-3, 1.2], [-3, 1.0]]);
    V.pathP2 = pathOf([[-3, 1.0], [-3, -1.2], [4.3, -1.2], [4.3, 1.2], [-3, 1.2], [-3, 1.0]]);
    // 功率
    const gW = G.power;
    mesh(new THREE.BoxGeometry(0.7, 0.9, 0.12), std(0xf8fafc, 0.6), -3.6, WY + 0.45, -1.6, gW);
    mesh(new THREE.BoxGeometry(1.2, 1.2, 0.4), std(0xe2e8f0, 0.5), 3.3, WY + 0.6, -1.4, gW);
    V.disc = mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.03, 30), std(0x94a3b8, 0.3, 0.8), 3.3, WY + 0.5, -1.15, gW); V.disc.rotation.x = Math.PI / 2;
    mesh(new THREE.BoxGeometry(0.06, 0.03, 0.4), std(0xdc2626), 0, 0, 0, V.disc).position.set(0.25, 0.02, 0);
    V.meterT = tag('readout', gW, 3.3, WY + 1.5, -1.4);
    V.appG = new THREE.Group(); V.appG.position.set(-0.4, WY, 0.3); gW.add(V.appG);
    V.appBox = mesh(new THREE.BoxGeometry(1.4, 1, 1), std(0xffffff, 0.5), 0, 0.5, 0, V.appG);
    V.appT = tag('readout light', V.appG, 0, 1.5, 0);
    wire(gW, [[-3.6, -1.5], [-3.6, 0.3], [-1.1, 0.3]], std(0x111827), 0.06); wire(gW, [[0.3, 0.3], [2.7, 0.3], [2.7, -1.2]], std(0x111827), 0.06);
    V.powT = tag('readout', gW, -0.4, WY + 2.3, 0.3);
    // 家居
    const gH = G.home;
    mesh(new THREE.BoxGeometry(1.4, 1.6, 0.3), std(0xf8fafc, 0.6), -4, WY + 0.8, -1.5, gH);
    V.plug = new THREE.Group(); V.plug.position.set(-1.8, WY, 0); gH.add(V.plug);
    mesh(new THREE.BoxGeometry(1.6, 0.5, 1.6), std(0x111827, 0.5, 0, { transparent: true, opacity: 0.35 }), 0, 0.25, 0, V.plug);
    const brown = std(0x92400e, 0.5), blue = std(0x2563eb, 0.5), gy = std(0x84cc16, 0.5);
    V.lw = [[brown, -0.45], [blue, 0.45], [gy, 0]].map(([m, z]) => { const b = kit.beam(V.plug, m, 0.08); b.set(-0.7, 0.25, z, 0.7, 0.25, z * 0.6); return b; });
    V.fuseM = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 14), std(0xf8fafc, 0.3, 0, { transparent: true, opacity: 0.85 }), -0.2, 0.32, -0.45, V.plug); V.fuseM.rotation.z = Math.PI / 2;
    V.fuseWire = kit.beam(V.plug, std(0x94a3b8, 0.3, 0.9), 0.015); V.fuseWire.set(-0.42, 0.32, -0.45, 0.02, 0.32, -0.45);
    V.toaster = new THREE.Group(); V.toaster.position.set(2.2, WY, 0); gH.add(V.toaster);
    V.case = mesh(new THREE.BoxGeometry(1.6, 1, 1), std(0xcbd5e1, 0.25, 0.9, { emissive: 0xff0000, emissiveIntensity: 0 }), 0, 0.5, 0, V.toaster);
    for (const z of [-0.2, 0.2]) mesh(new THREE.BoxGeometry(1.2, 0.05, 0.12), std(0x111827), 0, 1.01, z, V.toaster);
    wire(gH, [[-3.4, -1.4], [-3.4, 0], [-2.6, 0]], std(0x111827), 0.07); wire(gH, [[-1.0, 0], [1.4, 0]], std(0x111827), 0.07);
    V.earthW = kit.beam(gH, gy, 0.05); V.earthW.set(-1.0, WY + 0.1, 0.3, 1.4, WY + 0.1, 0.4);
    V.adapt = []; for (let i = 0; i < 4; i++) { const m = mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), std([0xf97316, 0x0ea5e9, 0xa855f7, 0x22c55e][i], 0.5), -4 + i * 0.6, WY + 0.25, 1.4, gH); V.adapt.push(m); }
    V.hTag = tag('readout', gH, 0, WY + 2.0, 0); V.fuseT = tag('readout light', V.plug, 0, 1.0, -0.45);
    // 電子
    V.el = new THREE.InstancedMesh(new THREE.SphereGeometry(0.055, 8, 6), new THREE.MeshBasicMaterial({ color: 0x2563eb }), NE * 2); root.add(V.el);
  }

  /* ================== 每幀 ================== */
  let phase = [0, 0];
  const m4 = new THREE.Matrix4();
  function placeElectrons(paths) { // paths: [{path, I}]
    let n = 0;
    paths.forEach((q, k) => {
      if (!q.path) return;
      phase[k] = (phase[k] - q.I * 0.9 * S.dt) % 1e6;
      const cnt = Math.round(NE * (q.path.tot / 13));
      for (let i = 0; i < cnt && n < NE * 2; i++) { const [x, z] = q.path.at(phase[k] + (i / cnt) * q.path.tot); m4.makeTranslation(x, WY + 0.06, z); V.el.setMatrixAt(n++, m4); }
    });
    V.el.count = n; V.el.instanceMatrix.needsUpdate = true;
  }
  function update(dt) {
    S.t += dt; S.dt = dt;
    const o = solve(); S.o = o;
    const sp = (I) => clamp(I, 0, 3) * 1.4;
    V.el.visible = p.mode !== 'power' && p.mode !== 'home';
    if (p.mode === 'simple') {
      V.sBat.cells.forEach((c, i) => (c.visible = i < p.cells)); V.sBulb.set(o.bright);
      V.swLever.rotation.y = p.sw ? 0 : -0.6; V.shortW.visible = p.short;
      V.sAm.set(o.I / 6); V.sVm.set(o.Vb / 6);
      placeElectrons([{ path: p.sw ? (p.short ? V.pathShort : V.pathMain) : null, I: sp(o.I) }]);
      if (!p.sw) placeElectrons([{ path: V.pathMain, I: 0 }]);
    } else if (p.mode === 'ohm') {
      V.oBat.cells.forEach((c, i) => (c.visible = i < Math.max(1, Math.ceil(p.V / 3))));
      V.res.visible = p.load === 'res'; V.oBulb.g.visible = p.load === 'bulb'; V.wireS.visible = p.load === 'wire';
      if (p.load === 'wire') { V.wireS.scale.set(p.thick / 2, p.len, p.thick / 2); V.wireS.material.color.set(p.mat === 'ni' ? 0x94a3b8 : 0xd97706); }
      V.oBulb.set(o.bright); V.rheoS.position.x = -0.4 + (p.rh / 20) * 0.8;
      V.oAm.set(o.I / 3); V.oVm.set(o.VL / 12);
      placeElectrons([{ path: V.pathO, I: sp(o.I) }]);
    } else if (p.mode === 'sp') {
      const par = p.topo === 'parallel';
      V.spSeries.visible = !par; V.spPar.visible = par;
      V.b1.g.position.set(par ? 1.5 : 3, WY, par ? 0 : -0.6); V.b2.g.position.set(par ? 4.3 : 3, WY + (p.broken ? 0.35 : 0), par ? 0 : 0.6);
      V.b1.set(o.b1); V.b2.set(o.b2);
      V.b1t.o.position.set(V.b1.g.position.x - 0.7, WY + 0.9, V.b1.g.position.z); V.b2t.o.position.set(V.b2.g.position.x + 0.7, WY + 0.9, V.b2.g.position.z);
      placeElectrons(par ? [{ path: V.pathP1, I: sp(o.I1) }, { path: o.I2 ? V.pathP2 : null, I: sp(o.I2) }] : [{ path: V.pathSer, I: sp(o.It) }]);
    } else if (p.mode === 'power') {
      V.disc.rotation.y += dt * o.P / 300;
      const col = { led: 0xfef9c3, fan: 0xbae6fd, tv: 0x111827, heater: 0xfca5a5, kettle: 0xe2e8f0 }[p.app];
      V.appBox.material.color.set(col);
    } else if (p.mode === 'home') {
      if (!S.blown && (o.Inorm + o.Ifault) > p.fuse) { S.blown = true; ctx.sfx('zap'); ctx.emit('fuse', {}); }
      V.fuseWire.visible = !S.blown; V.fuseM.material.color.set(S.blown ? 0x57534e : 0xf8fafc);
      V.earthW.visible = p.earth;
      V.case.material.emissiveIntensity = o.danger ? 0.5 + Math.sin(S.t * 10) * 0.3 : 0;
      V.adapt.forEach((m, i) => (m.visible = i < p.nApp));
      if (o.danger && !S.dangerFired) { S.dangerFired = true; ctx.emit('danger', {}); }
    }
  }
  function labels() {
    const o = S.o || solve();
    if (p.mode === 'simple') {
      V.sBat.t.el.innerHTML = `${f(1.5 * p.cells, 1)} V<small>${L(sc('電動勢', 'e.m.f.'))}</small>`;
      V.sAm.t.el.innerHTML = `I = ${f(o.I, 2)} A`; V.sVm.t.el.innerHTML = `V = ${f(o.Vb, 2)} V`;
      V.warn.o.visible = !!o.short; V.warn.el.innerHTML = L(sc('⚠️ 短路！電流極大，電線發熱', '⚠️ Short circuit! Huge current, the wire heats up'));
    } else if (p.mode === 'ohm') {
      V.oBat.t.el.innerHTML = `${p.V} V`;
      V.oAm.t.el.innerHTML = `I = ${f(o.I, 2)} A`; V.oVm.t.el.innerHTML = `V = ${f(o.VL, 2)} V`;
      V.oTag.el.innerHTML = `R = V ÷ I = ${o.I > 1e-6 ? f(o.VL / o.I, 1) : '—'} Ω` + (p.rh ? `<small>${L(sc('變阻器', 'rheostat'))} ${p.rh} Ω</small>` : '');
    } else if (p.mode === 'sp') {
      V.pBat.t.el.innerHTML = '6 V';
      V.b1t.el.innerHTML = `${L(sc('燈 1', 'Bulb 1'))}<small>${f(o.I1, 2)} A</small>`; V.b2t.el.innerHTML = `${L(sc('燈 2', 'Bulb 2'))}<small>${p.broken ? L(sc('已扭鬆', 'unscrewed')) : f(o.I2, 2) + ' A'}</small>`;
      V.pTot.el.innerHTML = L(sc('總電流', 'total current')) + ` ${f(o.It, 2)} A<small>${L(p.topo === 'series' ? sc('串聯', 'series') : sc('並聯', 'parallel'))}</small>`;
    } else if (p.mode === 'power') {
      const a = APP[p.app];
      V.appT.el.innerHTML = `${a.icon} ${L(a)}<small>220 V · ${a.P} W</small>`;
      V.powT.el.innerHTML = `I = P ÷ V = ${f(o.I, 2)} A<small>${L(sc('用電', 'energy'))} ${f(o.kWh, 2)} kWh · ${L(sc('電費', 'cost'))} HK$${f(o.cost, 2)}</small>`;
      V.meterT.el.innerHTML = L(sc('電錶', 'Meter')) + `<small>${a.P} W</small>`;
    } else if (p.mode === 'home') {
      V.hTag.el.className = 'readout ' + (o.danger ? 'warn' : S.blown ? 'ok' : '');
      V.hTag.el.innerHTML = o.danger ? L(sc('⚠️ 外殼帶電！觸碰會觸電', '⚠️ The case is live! Touching it could give a shock')) : S.blown ? L(sc('保險絲燒斷，電源已切斷 ✅', 'Fuse blown, power cut off ✅')) : `I = ${f(o.Inorm, 1)} A<small>${L(sc('正常運作', 'working normally'))}</small>`;
      V.fuseT.el.innerHTML = L(sc('保險絲', 'Fuse')) + ` ${p.fuse} A`;
    }
  }

  function sync() { for (const k of Object.keys(G)) G[k].visible = p.mode === k; }
  function apply(s = {}) { Object.assign(p, DEF); for (const k of Object.keys(DEF)) if (s[k] !== undefined) p[k] = s[k]; S.blown = false; S.dangerFired = false; if (p.mode === 'ohm') recs.length = 0; sync(); }
  function again() { recs.length = 0; S.blown = false; S.dangerFired = false; }
  function setParam(k, v) { p[k] = v; if (['fault', 'earth', 'fuse', 'nApp'].includes(k) && !p.fault && (p.nApp * 1000) / 220 <= p.fuse) S.blown = false; if (k === 'fault' || k === 'earth') S.dangerFired = false; if (k === 'load') recs.length = 0; }
  function act(a) {
    if (a[0] === 'record' && p.mode === 'ohm') { const o = solve(); recs.push([o.VL, o.I]); ctx.sfx('pop'); ctx.emit('record', { count: recs.length }); ctx.toast(sc(`已記錄第 ${recs.length} 點`, `Recorded point ${recs.length}`)); }
    if (a[0] === 'refuse') { S.blown = false; S.dangerFired = false; }
  }
  function tap(ray) {
    const hits = (g) => ray.intersectObject(g, true).length;
    if (p.mode === 'simple' && hits(V.sw)) { p.sw = !p.sw; ctx.sfx('click'); ctx.emit('param', { key: 'sw', value: p.sw }); return true; }
    if (p.mode === 'home' && hits(V.case)) { ctx.info('case', () => L(sc('金屬外殼', 'Metal case')), () => L(S.o && S.o.danger ? sc('外殼帶電！冇地線，電流會經過觸碰嘅人落地，好危險。', 'The case is live! With no earth wire, current would flow through anyone who touches it.') : sc('外殼接住地線，出事時電流會經地線流走。', 'The case is earthed, so fault current flows away through the earth wire.'))); return true; }
    return false;
  }
  function screenPos(a) {
    if (a[0] !== 'record') return null;
    const v = new THREE.Vector3(0, WY + 0.3, 1.2).project(ctx.camera);
    return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight };
  }
  function describeGraph() {
    return ctx.lang() === 'zh' ? `呢幅係 I–V 圖：橫軸係電壓，直軸係電流。電阻器嘅點會排成穿過原點嘅直線，斜率等於 1 ÷ R；燈泡條線會向下彎。已記錄 ${recs.length} 點。`
      : `This is an I–V graph: voltage across, current up. A resistor's points lie on a straight line through the origin with slope 1 ÷ R; a bulb's line curves over. ${recs.length} points recorded.`;
  }
  return {
    board: { title: 'Electricity · 電', lines: ['I = Q/t', 'V = IR', 'P = VI', 'kWh'],
      info: sc('黑板上：電流 I = Q/t；歐姆定律 V = IR；電功率 P = VI；電費以千瓦時 (kWh) 計。', "On the board: current I = Q/t; Ohm's law V = IR; power P = VI; electricity is billed in kilowatt-hours.") },
    camera: { pos: [0, 6.8, 6.6], target: [0.4, 0.9, 0.2] }, people: [[-6.6, -3.2, 0.5], [6.6, -3.2, -0.5]],
    params, graphs, buttons: [{ label: sc('📝 記錄', '📝 Record'), act: ['record'], cls: 'btn-primary', show: () => p.mode === 'ohm' }, { label: sc('🧯 換過保險絲', '🧯 Replace the fuse'), act: ['refuse'], show: () => p.mode === 'home' }, { label: sc('🔄 重設', '🔄 Reset'), act: ['again'] }],
    lessons: [
      { id: 'current', icon: '🔋', subs: ['4.2'], items: [86, 87, 88, 89, 94], title: sc('電流、電動勢與短路', 'Current, e.m.f. and short circuits'),
        desc: sc('電子流動、開關、加電池、危險的短路。', 'Flowing electrons, switches, adding cells and dangerous short circuits.'),
        base: { mode: 'simple' }, params: ['cells', 'sw', 'short'], graphs: [], stages: currentStages },
      { id: 'ohm', icon: 'Ω', subs: ['4.2'], items: [90, 91, 92, 93, 95, 96], title: sc('電阻、歐姆定律與串並聯', "Resistance, Ohm's law, series and parallel"),
        desc: sc('I–V 圖、燈泡變熱、電線長短粗幼、串聯和並聯。', 'I–V graphs, hot bulbs, wire length and thickness, series and parallel.'),
        base: { mode: 'ohm' }, params: ['V', 'load', 'R', 'len', 'thick', 'mat', 'rh', 'topo', 'broken'], graphs: ['iv'], stages: ohmStages },
      { id: 'power', icon: '💡', subs: ['4.2'], items: [97, 98, 99, 100], title: sc('電功率與電費', 'Electrical power and the bill'),
        desc: sc('P = VI、功率標籤、千瓦時和計電費。', 'P = VI, power ratings, kilowatt-hours and working out the bill.'),
        base: { mode: 'power' }, params: ['app', 'hours', 'price'], graphs: [], stages: powerStages },
      { id: 'home', icon: '🏠', subs: ['4.2'], items: [101, 102, 103, 104, 105, 106], title: sc('家居用電安全', 'Electrical safety at home'),
        desc: sc('火線中性線地線、保險絲、過載和慳電。', 'Live, neutral and earth wires, fuses, overloading and saving electricity.'),
        base: { mode: 'home' }, params: ['fault', 'earth', 'fuse', 'nApp'], graphs: [], stages: homeStages }
    ],
    mount, apply, again, act, update, labels, setParam,
    getParam: (k) => p[k], hist: () => ({ t: [], c: {}, ev: [] }), ghost: () => null, simTime: () => S.t,
    tap, screenPos, describeGraph
  };
}
