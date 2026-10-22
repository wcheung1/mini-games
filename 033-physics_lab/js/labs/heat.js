/* =====================================================================
 * 實驗枱：熱學與浮沉台（heat）
 * 單元：🌡️ 溫度與內能（1–6）、🍳 比熱容量（7–10）、☀️ 熱的轉移（11–12）、
 *       🧊 物態變化與潛熱（13–17）、💧 蒸發與沸騰（18–20）、🛟 浮與沉（P4）
 * 模式：beaker / curve / transfer / evap / float
 * 「粒子放大鏡」：用粒子模型解釋溫度、物態、蒸發；喺熱轉移模式會跟住實驗轉做
 *   傳導（棒的粒子＋自由電子）／對流（水粒子循環）／輻射（紅外線打落黑銀表面）
 * 撳放大鏡或者實驗器材 → 鏡頭近看（ctx.focus）
 * 每課有自己嘅黑板公式（lesson.board），每條公式都有對應嘅「🔬 進階」圖表
 * ===================================================================== */
export default function create(ctx) {
  const { THREE, kit, root } = ctx;
  const { std, mesh, tag, glass, Hist, C, f } = kit;
  const L = kit.L2(ctx.lang);
  const sc = (zh, en) => ({ zh, en });
  const clamp = THREE.MathUtils.clamp;
  const TABLE = 0.9;

  const LIQ = { water: { c: 4200, bp: 100, color: 0x60a5fa, zh: '水', en: 'Water' }, oil: { c: 2000, bp: 250, color: 0xf59e0b, zh: '食油', en: 'Cooking oil' } };
  // a：大約等於熱導率比例（銅 400、鋁 240、鐵 80、玻璃 1 W/m°C，玻璃略為放大方便睇）
  const ROD = [{ k: 'cu', zh: '銅', en: 'Copper', a: 1, col: 0xb45309 }, { k: 'al', zh: '鋁', en: 'Aluminium', a: 0.6, col: 0xcbd5e1 }, { k: 'fe', zh: '鐵', en: 'Iron', a: 0.2, col: 0x475569 }, { k: 'gl', zh: '玻璃', en: 'Glass', a: 0.01, col: 0xbae6fd }];
  const ROD_X0 = -3.6, ROD_LEN = 2.8, NCELL = 24, KROD = 2.5; // KROD：調校到銅第一粒蠟大約 1.5 秒跌，之後一粒粒慢慢跌
  const PIN_AT = [0, 1, 2, 3].map((k) => 0.5 + k * 0.6);
  const FLO = {
    wood: { zh: '木頭', en: 'Wood block', rho: 0.6, shape: 'box', size: [0.7, 0.35, 0.45], col: 0xb45309 },
    ice: { zh: '冰塊', en: 'Ice cube', rho: 0.92, shape: 'box', size: [0.35, 0.35, 0.35], col: 0xe0f2fe },
    apple: { zh: '蘋果', en: 'Apple', rho: 0.85, shape: 'ball', size: [0.22], col: 0xdc2626 },
    egg: { zh: '雞蛋', en: 'Egg', rho: 1.08, shape: 'egg', size: [0.15], col: 0xfef3c7 },
    steel: { zh: '細鐵波', en: 'Small steel ball', rho: 7.8, shape: 'ball', size: [0.1], col: 0x94a3b8 },
    stone: { zh: '石頭', en: 'Stone', rho: 2.6, shape: 'stone', size: [0.17], col: 0x78716c },
    boat: { zh: '鋼船', en: 'Steel boat', rho: 0.35, shape: 'boat', size: [0.8, 0.3, 0.4], col: 0x64748b },
    custom: { zh: '神秘方塊', en: 'Mystery block', rho: 1.5, shape: 'box', size: [0.4, 0.4, 0.4], col: 0xa855f7 }
  };
  const SLOT = { wood: -1.25, ice: -0.55, apple: 0.05, egg: 0.55, steel: 1.0, stone: 1.35, boat: -0.15, custom: 0.95 };

  // mag：熱轉移模式下放大鏡睇邊樣（cond 傳導／conv 對流／rad 輻射）；magRod：睇邊條棒
  const DEF = { mode: 'beaker', liquid: 'water', m: 0.5, P: 600, heat: false, speed: 10, mc: 0.1, loss: false, flame: false, lamp: false,
    windB: false, heatB: false, wideB: false, coverB: false, salt: false, dens: 1.5, mag: 'cond', magRod: 0 };
  const p = { ...DEF };
  const params = [
    { key: 'heat', type: 'toggle', label: { zh: '🔥 電熱器', en: '🔥 Heater' } },
    { key: 'liquid', type: 'select', label: { zh: '🧪 液體', en: '🧪 Liquid' }, options: [{ v: 'water', label: LIQ.water }, { v: 'oil', label: LIQ.oil }] },
    { key: 'm', label: { zh: '⚖️ 液體質量', en: '⚖️ Liquid mass' }, min: 0.2, max: 1, step: 0.1, unit: 'kg' },
    { key: 'mc', label: { zh: '🧊 冰的質量', en: '🧊 Ice mass' }, min: 0.05, max: 0.2, step: 0.05, unit: 'kg' },
    { key: 'P', label: { zh: '⚡ 電熱器功率', en: '⚡ Heater power' }, min: 200, max: 1000, step: 100, unit: 'W' },
    { key: 'loss', type: 'toggle', label: { zh: '💨 有熱散失到空氣', en: '💨 Heat escapes to the air' }, hint: { zh: '真實實驗一定有少少熱散失', en: 'Real experiments always lose a little heat' } },
    { key: 'flame', type: 'toggle', label: { zh: '🔥 加熱金屬棒和水杯', en: '🔥 Heat the rods and beaker' } },
    { key: 'lamp', type: 'toggle', label: { zh: '💡 紅外線燈', en: '💡 Infra-red lamp' } },
    { key: 'windB', type: 'toggle', label: { zh: '🌬️ 碟 B：風扇', en: '🌬️ Dish B: fan' } },
    { key: 'heatB', type: 'toggle', label: { zh: '🔥 碟 B：加熱', en: '🔥 Dish B: warm it' } },
    { key: 'wideB', type: 'toggle', label: { zh: '⭕ 碟 B：闊碟（表面積大）', en: '⭕ Dish B: wide dish (big surface)' } },
    { key: 'coverB', type: 'toggle', label: { zh: '🔔 碟 B：蓋住（空氣好潮濕）', en: '🔔 Dish B: covered (humid air)' } },
    { key: 'salt', type: 'toggle', label: { zh: '🧂 加鹽（鹽水）', en: '🧂 Add salt (salt water)' } },
    { key: 'dens', label: { zh: '🟪 神秘方塊密度', en: '🟪 Mystery block density' }, min: 0.2, max: 2, step: 0.1, unit: 'g/cm³' },
    { key: 'speed', label: { zh: '⏩ 時間快轉', en: '⏩ Fast-forward' }, min: 1, max: 40, step: 1, unit: '×' }
  ];

  /* ---------------- 進階圖表用的數據 ---------------- */
  const KB = 1.380649e-23, MW = 2.99e-26; // 波茲曼常數、一粒水分子的質量（kg）
  const vrms = (TK) => Math.sqrt((3 * KB * TK) / MW);
  const mbPct = (v, TK) => { const a = MW / (2 * KB * TK); return 4 * Math.PI * Math.pow(a / Math.PI, 1.5) * v * v * Math.exp(-a * v * v) * 1e4; }; // 每 100 m/s 的百分比
  const kePts = [];                     // [T(K), 平均動能 ×10⁻²¹ J]
  let etPts = [], etPrev = [];          // [ΔT, E(kJ)]：今次／上一次
  const etRun = { cur: null, prev: null };
  const rhoPts = {};                    // 物件 → [ρ, 浸入比例, 浮?, 鹽水?]
  const rodX = Array.from({ length: NCELL }, (_, i) => +(((i + 0.5) / NCELL) * 50).toFixed(2));

  const graphs = [
    { id: 'T', tab: { zh: '溫度 T–t', en: 'Temperature T–t' }, y: { zh: '溫度 T (°C)', en: 'temperature T (°C)' }, min: 30, zero: true, span: 1e9, minSpan: 30, series: [['T', { zh: '溫度', en: 'Temperature' }, C.red]] },
    { id: 'TT', tab: { zh: '罐的溫度', en: 'Can temperatures' }, y: { zh: '溫度 T (°C)', en: 'temperature T (°C)' }, min: 30, span: 1e9, minSpan: 30, series: [['Tb', { zh: '啞黑色罐', en: 'Dull black can' }, C.red], ['Ts', { zh: '光亮銀色罐', en: 'Shiny silver can' }, C.blue]] },
    { id: 'mass', tab: { zh: '水的質量', en: 'Water mass' }, y: { zh: '剩餘的水 (g)', en: 'water left (g)' }, min: 50, span: 1e9, minSpan: 30, series: [['wA', { zh: '碟 A（對照）', en: 'Dish A (control)' }, C.blue], ['wB', { zh: '碟 B', en: 'Dish B' }, C.red]] },
    // ---- 🔬 進階：每條黑板公式都有一幅圖 ----
    { id: 'mb', adv: true, mode: 'xy', tab: sc('🔬 速率分佈', '🔬 Speed spread'), y: sc('粒子比例 (% / 100 m/s)', 'share of particles (% per 100 m/s)'), x: sc('速率 v (m/s)', 'speed v (m/s)'), xRange: [0, 1600], min: 20,
      series: [['now', sc('現在', 'Now'), C.red], ['ref', sc('20 °C', '20 °C'), C.blue, { dash: true }]], data: () => mbData() },
    { id: 'ke', adv: true, mode: 'scatter', fit: true, tab: sc('🔬 動能–絕對溫度', '🔬 KE–absolute temperature'), y: sc('粒子平均動能 (×10⁻²¹ J)', 'average particle KE (×10⁻²¹ J)'), x: sc('絕對溫度 T (K)', 'absolute temperature T (K)'), xRange: [0, 400], min: 9,
      slope: sc('直線穿過 0 K：平均動能 ∝ T(K)', 'Straight line through 0 K: KE ∝ T(K)'), series: [['ke', sc('水粒子', 'Water particles'), C.red]], data: () => ({ pts: { ke: kePts } }) },
    { id: 'ET', adv: true, mode: 'scatter', fit: true, tab: sc('🔬 能量–升溫', '🔬 Energy–rise'), y: sc('供給能量 E (kJ)', 'energy in E (kJ)'), x: sc('升溫 ΔT (°C)', 'temperature rise ΔT (°C)'), min: 10,
      slope: sc('斜率 = mc ≈ {m} kJ/°C', 'slope = mc ≈ {m} kJ/°C'), series: [['cur', sc('今次', 'This run'), C.red], ['prev', sc('上一次', 'Last run'), C.blue]], data: () => ({ pts: { cur: etPts, prev: etPrev } }) },
    { id: 'TE', adv: true, mode: 'xy', tab: sc('🔬 溫度–能量', '🔬 Temperature–energy'), y: sc('溫度 T (°C)', 'temperature T (°C)'), x: sc('供給能量 E (kJ)', 'energy in E (kJ)'), min: 30,
      series: [['T', sc('量度', 'Measured'), C.red], ['Tf', sc('公式 mcΔT + mL', 'Formula mcΔT + mL'), C.blue, { dash: true }]], data: () => teData() },
    { id: 'rod', adv: true, mode: 'xy', tab: sc('🔬 棒上的溫度', '🔬 Along the rods'), y: sc('溫度 T (°C)', 'temperature T (°C)'), x: sc('離熱端 (cm)', 'from hot end (cm)'), xRange: [0, 50], fixed: [0, 320],
      series: [['cu', sc('銅', 'Copper'), C.red], ['al', sc('鋁', 'Aluminium'), C.amber], ['fe', sc('鐵', 'Iron'), C.teal], ['gl', sc('玻璃', 'Glass'), C.blue], ['wax', sc('蠟熔點 60 °C', 'Wax melts at 60 °C'), C.ink, { dash: true }]],
      data: () => ({ x: rodX, c: { cu: rods[0].T, al: rods[1].T, fe: rods[2].T, gl: rods[3].T, wax: [60, 60] }, xk: { wax: [0, 50] } }) },
    { id: 'pow', adv: true, tab: sc('🔬 吸收與散失', '🔬 Energy in and out'), y: sc('每秒能量 P (W)', 'power P (W)'), min: 10, span: 1e9, minSpan: 30,
      series: [['Pib', sc('黑罐吸收', 'Black in'), C.red], ['Pob', sc('黑罐散失', 'Black out'), C.red, { dash: true }], ['Pis', sc('銀罐吸收', 'Silver in'), C.blue], ['Pos', sc('銀罐散失', 'Silver out'), C.blue, { dash: true }]] },
    { id: 'evE', adv: true, tab: sc('🔬 蒸發帶走的能量', '🔬 Energy carried away'), y: sc('E = mL (kJ)', 'E = mL (kJ)'), min: 10, span: 1e9, minSpan: 30,
      series: [['EA', sc('碟 A', 'Dish A'), C.blue], ['EB', sc('碟 B', 'Dish B'), C.red]] },
    { id: 'rho', adv: true, mode: 'scatter', fit: true, tab: sc('🔬 密度與浸入比例', '🔬 Density and depth'), y: sc('浸在水中的比例', 'fraction under the surface'), x: sc('物件密度 ρ (g/cm³)', 'object density ρ (g/cm³)'), xRange: [0, 3], fixed: [0, 1.2],
      slope: sc('斜率 = 1 ÷ ρ液 ≈ {m}', 'slope = 1 ÷ ρ liquid ≈ {m}'),
      series: [['fl', sc('浮（清水）', 'Floats (fresh)'), C.red], ['fs', sc('浮（鹽水）', 'Floats (salty)'), C.amber], ['sk', sc('沉', 'Sinks'), C.blue, { fit: false }]], data: () => rhoData() }
  ];
  const GR = Object.fromEntries(graphs.map((g) => [g.id, g]));
  const ALL = params.map((q) => q.key).filter((k) => k !== 'speed');

  /* ---------------- 狀態 ---------------- */
  const S = { simT: 0, real: 0, lastSample: -1, T: 20, E: 0, fl: {} };
  const cur = { T: -20, phase: 'solid', melted: 0, boiled: 0, tMelt0: null, tMelt1: null, E: 0, fired: {} };
  const rods = ROD.map(() => ({ T: new Array(NCELL).fill(20), pins: [0, 1, 2, 3].map(() => ({ down: false, y: 0, vy: 0 })) }));
  const cans = { Tb: 20, Ts: 20, rb: 0, rs: 0, Pib: 0, Pob: 0, Pis: 0, Pos: 0, lampT: 0 };
  const dishes = { A: 50, B: 50 };
  const floats = {}; // key → { y, v, inTank, settledFired }
  const H = new Hist(['T', 'E', 'Tb', 'Ts', 'Pib', 'Pob', 'Pis', 'Pos', 'wA', 'wB', 'EA', 'EB'], 4000);
  let ghost = null;

  /* ================== 教學 ================== */
  const sayCh = (zh, en) => ({ zh, en });
  const tempStages = [
    { id: 't-intro', who: 'chan', title: { zh: '粒子與溫度', en: 'Particles and temperature' },
      say: sayCh('所有嘢都係由好細好細、不停郁動嘅粒子組成。右上角個放大鏡，俾你睇到杯水入面嘅粒子：紅色嘅郁得快，藍色嘅郁得慢。溫度就係講呢啲粒子平均郁得有幾快。撳一下放大鏡，可以走近啲睇清楚。',
        'Everything is made of tiny particles that never stop moving. The magnifier at the top right shows the particles in the water: red ones are fast and blue ones are slow. Temperature tells us how fast these particles move on average. Tap the magnifier to take a closer look.'),
      adv: sayCh('粒子平均動能 ∝ T(K)；T(K) = T(°C) + 273，所以 20 °C 即係 293 K。', 'Average particle KE ∝ T(K); T(K) = T(°C) + 273, so 20 °C is 293 K.'), advGraph: 'mb',
      setup: { mode: 'beaker', heat: false, speed: 10 }, items: [1, 2] },
    { id: 't-heat', who: 'chan', title: { zh: '加熱：估一估', en: 'Heating: predict' },
      say: sayCh('我哋開電熱器，加熱杯水。', "We'll switch on the heater and warm the water."),
      setup: { mode: 'beaker', heat: false, speed: 10 }, lock: ALL, graph: 'T', advGraph: 'ke',
      quiz: { q: sayCh('開咗電熱器之後，水入面啲粒子會點？', 'After the heater is switched on, what happens to the particles in the water?'),
        opts: [sayCh('郁得慢咗', 'They slow down'), sayCh('郁得快咗', 'They move faster'), sayCh('冇變', 'No change')], ans: 1,
        run: [['set', 'heat', true], ['until', 'warm', 25]], watch: 3,
        why: sayCh('答案係：郁得快咗！電熱器將能量傳俾水，粒子平均動能增加，郁得更快，溫度就升高。睇吓放大鏡，紅色嘅快粒子多咗好多。好似煲湯咁，越煲越熱，入面啲粒子就越郁越快。',
          'The answer: they move faster! The heater gives energy to the water, so the particles’ average kinetic energy rises and they move faster. That is what a higher temperature means. Look in the magnifier: there are many more fast red particles now. It’s like soup on the hob: the hotter it gets, the faster its particles move.') },
      adv: sayCh('平均動能 ∝ T(K)：由 293 K 升到 373 K，平均動能大約多咗 27%。', 'Average KE ∝ T(K): going from 293 K to 373 K raises the average KE by about 27%.'),
      chain: [sayCh('加熱', 'Heating'), sayCh('粒子平均動能增加', 'Average particle KE rises'), sayCh('溫度升高', 'Temperature rises')], items: [1, 2] },
    { id: 't-thermo', who: 'ming', title: { zh: '溫度計', en: 'The thermometer' },
      say: sayCh('溫度計入面嘅紅色液體，熱嘅時候會膨脹，液柱就會升高。我哋就係利用呢種會跟溫度改變嘅性質嚟量度溫度。開電熱器，睇吓紅色液柱。',
        'The red liquid in the thermometer expands when it gets hot, so the column rises. We measure temperature using properties like this that change with temperature. Switch on the heater and watch the red column.'),
      task: sayCh('開電熱器，觀察溫度計的液柱上升', 'Switch on the heater and watch the thermometer rise'),
      setup: { mode: 'beaker', heat: false, speed: 10 }, graph: 'T',
      goal: { type: 'param', test: () => p.heat }, demo: [['openTools'], ['set', 'heat', true]], settle: 3, items: [3] },
    { id: 't-fixed', who: 'chan', title: { zh: '攝氏溫標的定點', en: 'Fixed points of the Celsius scale' },
      say: sayCh('溫度計要有刻度先用得。攝氏溫標用咗兩個好容易重複得到嘅溫度做「定點」。', 'A thermometer needs a scale. The Celsius scale uses two temperatures that are easy to reproduce, called fixed points.'),
      quiz: { q: sayCh('攝氏溫標嘅 0 °C 同 100 °C 係點樣定出嚟？', 'How were 0 °C and 100 °C on the Celsius scale chosen?'),
        opts: [sayCh('純冰溶化同純水沸騰嘅溫度', 'The temperatures at which pure ice melts and pure water boils'), sayCh('人嘅體溫同發燒嘅溫度', 'Body temperature and fever temperature'), sayCh('隨便揀嘅', 'They were picked at random')], ans: 0,
        why: sayCh('答案係：純冰溶化同純水沸騰！喺標準大氣壓下，純冰溶化係 0 °C，純水沸騰係 100 °C，中間平均分成 100 格。',
          'The answer: melting pure ice and boiling pure water! At standard pressure, pure ice melts at 0 °C and pure water boils at 100 °C, and the gap is split into 100 equal steps.') },
      adv: sayCh('另一個溫標係絕對溫標：T(K) = T(°C) + 273，0 °C = 273 K，100 °C = 373 K。', 'Another scale is the absolute scale: T(K) = T(°C) + 273, so 0 °C = 273 K and 100 °C = 373 K.'), advGraph: 'ke',
      items: [4] },
    { id: 't-ie', who: 'chan', title: { zh: '熱、溫度和內能', en: 'Heat, temperature and internal energy' },
      say: sayCh('三個詞好易混淆：溫度係粒子平均郁得幾快；內能係所有粒子加埋嘅總能量；熱係因為溫度唔同而由熱嘅地方流去凍嘅地方嘅能量。',
        'Three words that are easy to mix up: temperature is how fast particles move on average; internal energy is the total energy of all the particles; heat is energy that flows from hot to cold because of a temperature difference.'),
      quiz: { q: sayCh('一大桶 40 °C 嘅暖水，同一細杯 80 °C 嘅熱水，邊個有多啲內能？', 'A big bucket of 40 °C water or a small cup of 80 °C water: which has more internal energy?'),
        opts: [sayCh('細杯熱水', 'The small cup of hot water'), sayCh('大桶暖水', 'The big bucket of warm water'), sayCh('一樣', 'The same')], ans: 1,
        why: sayCh('答案係：大桶暖水！細杯熱水溫度高啲，但大桶水有多好多粒子，全部能量加埋就多好多。溫度係「平均」，內能係「總數」。',
          'The answer: the big bucket! The small cup is hotter, but the bucket has far more particles, so their energy adds up to much more. Temperature is an average; internal energy is a total.') },
      chain: [sayCh('溫度：平均', 'Temperature: average'), sayCh('內能：總數', 'Internal energy: total'), sayCh('熱：由熱流向凍', 'Heat: flows hot → cold')], items: [5, 6] },
    { id: 't-sum', who: 'chan', title: { zh: '總結', en: 'Summary' },
      say: sayCh('記住：粒子郁得越快，溫度越高；內能係所有粒子嘅總能量；熱係由高溫流去低溫嘅能量。', 'Remember: faster particles mean a higher temperature; internal energy is the total energy of all particles; heat is energy flowing from hot to cold.'),
      finish: true }
  ];
  const shcStages = [
    { id: 'c-intro', who: 'chan', title: { zh: '同一個電熱器', en: 'The same heater' },
      say: sayCh('用同一個電熱器，加熱唔同嘅嘢，升溫快慢係唔一樣嘅。我哋用 0.5 kg 嘅水同 0.5 kg 嘅食油比較吓。', 'With the same heater, different things warm up at different speeds. Let’s compare 0.5 kg of water with 0.5 kg of cooking oil.'),
      setup: { mode: 'beaker', heat: false, liquid: 'water', m: 0.5, speed: 12 }, items: [7] },
    { id: 'c-oil', who: 'chan', title: { zh: '水 vs 油：估一估', en: 'Water vs oil: predict' },
      say: sayCh('兩樣嘢質量一樣，電熱器一樣，加熱時間一樣。', 'Same mass, same heater, same heating time.'),
      cond: [sayCh('只改變：液體種類', 'Only change: the liquid'), sayCh('不變：質量、功率、時間', 'Same: mass, power, time')],
      setup: { mode: 'beaker', heat: false, liquid: 'water', m: 0.5, speed: 12 }, lock: ALL, graph: 'T', advGraph: 'ET',
      quiz: { q: sayCh('邊個升溫多啲？', 'Which gets hotter?'), opts: [sayCh('水', 'Water'), sayCh('食油', 'Cooking oil'), sayCh('一樣', 'The same')], ans: 1,
        run: [['set', 'liquid', 'water'], ['set', 'heat', true], ['wait', 5], ['set', 'heat', false], ['wait', 1], ['again'], ['set', 'liquid', 'oil'], ['set', 'heat', true], ['wait', 5], ['set', 'heat', false]], watch: 2,
        why: sayCh('答案係：食油！睇吓溫度–時間圖，實線係油，虛線係水。水要用多一倍嘅能量先升到同樣溫度，因為水嘅比熱容量好大。所以煮飯時，鑊入面嘅油好快就熱。',
          'The answer: the oil! On the temperature–time graph, the solid line is oil and the dashed line is water. Water needs about twice the energy for the same rise, because its specific heat capacity is large. That’s why oil in a pan gets hot so quickly.') },
      adv: sayCh('E–ΔT 圖嘅斜率 = mc：0.5 kg 水大約 2.1 kJ/°C，0.5 kg 油大約 1.0 kJ/°C。', 'On the E–ΔT graph the slope = mc: about 2.1 kJ/°C for 0.5 kg of water and 1.0 kJ/°C for 0.5 kg of oil.'),
      chain: [sayCh('能量一樣', 'Same energy'), sayCh('水的比熱容量較大', "Water's specific heat capacity is bigger"), sayCh('水升溫較少', 'Water warms less')], items: [7] },
    { id: 'c-formula', who: 'chan', title: { zh: 'E = mcΔT', en: 'E = mcΔT' },
      say: sayCh('比熱容量就好似一樣嘢「食熱嘅胃口」：每 1 kg 升 1 °C 要食幾多能量。水嘅胃口好大，要 4200 焦耳；油細啲，大約 2000 焦耳。整件物件升 1 °C 要幾多能量，就叫熱容量。',
        'Specific heat capacity is like an appetite for heat: how much energy 1 kg needs to warm by 1 °C. Water has a big appetite, 4200 joules; oil about 2000. The energy a whole object needs per 1 °C is its heat capacity.'),
      adv: sayCh('需要的能量 E = mcΔT；熱容量 C = mc，即係 E–ΔT 圖嘅斜率。', 'Energy needed E = mcΔT; heat capacity C = mc, which is the slope of the E–ΔT graph.'), advGraph: 'ET',
      chain: [sayCh('質量 m', 'Mass m'), sayCh('比熱容量 c', 'Specific heat capacity c'), sayCh('升溫 ΔT', 'Temperature rise ΔT'), sayCh('能量 E = mcΔT', 'Energy E = mcΔT')], items: [7, 8, 9] },
    { id: 'c-mass', who: 'ming', title: { zh: '多一倍水：估一估', en: 'Twice the water: predict' },
      say: sayCh('如果水嘅質量加倍，用同一個電熱器加熱同樣時間呢？', 'What if we double the mass of water and heat it for the same time?'),
      cond: [sayCh('只改變：水的質量（0.5 → 1 kg）', 'Only change: water mass (0.5 → 1 kg)')],
      setup: { mode: 'beaker', heat: false, liquid: 'water', m: 0.5, speed: 12 }, lock: ALL, graph: 'T', advGraph: 'ET',
      quiz: { q: sayCh('升溫會點？', 'How much does it warm up?'), opts: [sayCh('一樣', 'The same'), sayCh('只有一半咁多', 'Only half as much'), sayCh('兩倍', 'Twice as much')], ans: 1,
        run: [['set', 'm', 0.5], ['set', 'heat', true], ['wait', 5], ['set', 'heat', false], ['wait', 1], ['again'], ['set', 'm', 1], ['set', 'heat', true], ['wait', 5], ['set', 'heat', false]], watch: 2,
        why: sayCh('答案係：只有一半！同樣嘅能量分俾多一倍嘅粒子，每粒分到嘅少咗一半，所以升溫只有一半。所以煲一大煲水，要等耐好多先滾。', 'The answer: only half! The same energy is shared between twice as many particles, so each gets half as much and the rise is halved. That’s why a big pan of water takes much longer to boil.') },
      adv: sayCh('m 加倍，mc 都加倍，所以同樣能量下 ΔT = E ÷ (mc) 減半。', 'Double m and mc doubles too, so with the same energy ΔT = E ÷ (mc) halves.'),
      items: [9] },
    { id: 'c-apply', who: 'chan', title: { zh: '水的妙用', en: 'Why water is useful' },
      say: sayCh('水嘅比熱容量好高，可以儲好多熱，又唔會好快變熱。', 'Water has a high specific heat capacity, so it can store a lot of heat without warming up quickly.'),
      quiz: { q: sayCh('點解暖水袋入面用水？', 'Why do hot-water bottles use water?'),
        opts: [sayCh('因為水平', 'Water is cheap'), sayCh('水嘅比熱容量高，可以儲好多熱，慢慢放出嚟', 'Water’s high specific heat capacity lets it store lots of heat and release it slowly'), sayCh('因為水好輕', 'Water is light')], ans: 1,
        why: sayCh('答案係：水可以儲好多熱，慢慢放出嚟！所以暖水袋可以暖好耐。汽車散熱器都用水，海邊嘅天氣亦冇咁極端。',
          'The answer: water stores lots of heat and releases it slowly! That’s why hot-water bottles stay warm for ages. Car radiators use water too, and seaside weather is milder.') },
      items: [10] },
    { id: 'c-sum', who: 'chan', title: { zh: '總結', en: 'Summary' },
      say: sayCh('同樣嘅能量，比熱容量大、質量大嘅嘢升溫少。記住公式 E = mcΔT。', 'With the same energy, things with a bigger specific heat capacity or more mass warm up less. Remember E = mcΔT.'),
      finish: true }
  ];
  const transferStages = [
    { id: 'tr-intro', who: 'chan', title: { zh: '熱點樣走？', en: 'How does heat travel?' },
      say: sayCh('熱有三種走法：傳導，好似排隊傳波，粒子一個傳一個；對流，好似搬屋，熱嘅液體或氣體自己郁去第二度；輻射，好似太陽光，唔使任何物質都可以直接飛過嚟。撳實驗嘅任何部分，都可以走近啲睇入面發生緊咩事。',
        'Heat travels in three ways. Conduction is like passing a ball down a line: particle to particle. Convection is like moving house: the warm liquid or gas itself moves. Radiation is like sunlight: it can fly across without anything in between. Tap any part of the experiment to take a closer look inside.'),
      setup: { mode: 'transfer', flame: false, lamp: false, speed: 1, mag: 'cond' }, items: [11] },
    { id: 'tr-cond', who: 'chan', title: { zh: '傳導：估一估', en: 'Conduction: predict' },
      say: sayCh('四條棒，一端一齊加熱，每條棒下面黐住蠟粒，熱到就會跌落嚟。橙色箭嘴會話俾你知熱傳咗去邊。', 'Four rods are heated at one end together. Wax beads stuck underneath drop off when they get hot. The orange arrows show how far the heat has travelled.'),
      setup: { mode: 'transfer', flame: false, lamp: false, speed: 1, mag: 'cond' }, lock: ALL, advGraph: 'rod',
      quiz: { q: sayCh('邊條棒上面嘅蠟粒最快跌落嚟？', 'On which rod do the wax beads drop first?'), opts: [sayCh('銅', 'Copper'), sayCh('鐵', 'Iron'), sayCh('玻璃', 'Glass')], ans: 0,
        run: [['set', 'flame', true], ['until', 'pin', 20]], watch: 6,
        why: sayCh('答案係：銅！睇吓橙色箭嘴，熱由火嗰邊沿住棒一路傳過去，銅棒嘅箭嘴行得最遠，蠟粒最先跌。金屬入面有好多可以自由郁動嘅電子，傳熱好快，叫良導體；玻璃傳熱好慢，叫不良導體。所以煲同鑊用金屬造，手柄就用膠或者木。',
          'The answer: copper! Look at the orange arrows: heat travels along each rod from the flame, and copper’s arrow goes furthest, so its wax drops first. Metals have lots of free electrons that pass heat along quickly, so they are good conductors. Glass passes heat slowly: a poor conductor. That’s why pans are metal but their handles are plastic or wood.') },
      adv: sayCh('熱流 ∝ k × ΔT ÷ L。k 係熱導率：銅大約係鐵嘅 5 倍，係玻璃嘅幾百倍。', 'Heat flow ∝ k × ΔT ÷ L, where k is the thermal conductivity: copper’s is about 5 times iron’s and hundreds of times glass’s.'),
      chain: [sayCh('金屬有自由電子', 'Metals have free electrons'), sayCh('傳熱快', 'Heat travels fast'), sayCh('蠟粒先跌', 'Wax drops first')], items: [11] },
    { id: 'tr-conv', who: 'ming', title: { zh: '對流', en: 'Convection' },
      say: sayCh('睇吓中間個杯：紅色箭嘴係底部熱咗嘅水，佢膨脹、密度變細，就浮上去；藍色箭嘴係上面凍啲嘅水沉落嚟，形成一個循環，叫對流。煲水、冷氣機放喺高處都係利用對流。',
        'Look at the beaker in the middle: the red arrows show warm water at the bottom expanding, becoming less dense and rising, while the blue arrows show cooler water sinking. This loop is called convection. Boiling water and air conditioners placed high up both use convection.'),
      setup: { mode: 'transfer', flame: true, lamp: false, speed: 1, mag: 'conv' },
      chain: [sayCh('底部受熱', 'Heated at the bottom'), sayCh('密度變細，上升', 'Less dense, rises'), sayCh('冷水下沉，形成循環', 'Cool water sinks: a loop')], items: [11] },
    { id: 'tr-rad', who: 'chan', title: { zh: '輻射：估一估', en: 'Radiation: predict' },
      say: sayCh('右邊有兩個一樣嘅罐，一個係啞黑色，一個係光亮銀色，用紅外線燈照住。波浪箭嘴就係紅外輻射。', 'On the right are two identical cans, one dull black and one shiny silver, under an infra-red lamp. The wavy arrows show the infra-red radiation.'),
      cond: [sayCh('只改變：表面顏色', 'Only change: surface colour')],
      setup: { mode: 'transfer', flame: false, lamp: false, speed: 1, mag: 'rad' }, lock: ALL, graph: 'TT', advGraph: 'pow',
      quiz: { q: sayCh('邊個罐升溫快啲？', 'Which can warms up faster?'), opts: [sayCh('啞黑色', 'Dull black'), sayCh('光亮銀色', 'Shiny silver'), sayCh('一樣', 'The same')], ans: 0,
        run: [['set', 'lamp', true], ['until', 'canLead', 25]], watch: 4,
        why: sayCh('答案係：啞黑色！啞黑色表面吸收紅外輻射最好；光亮表面就將大部分反射走，睇吓銀色罐上面彈返出去嘅箭嘴。所以夏天黑色嘅車會曬到好熱。',
          'The answer: dull black! Dull black surfaces absorb infra-red radiation best, while shiny surfaces reflect most of it away: look at the arrow bouncing off the silver can. That’s why a black car gets so hot in the summer sun.') },
      adv: sayCh('P吸 = a × P燈：a 係吸收比例，啞黑色大約 0.95，光亮銀色大約 0.12。', 'Power absorbed = a × lamp power, where a is the fraction absorbed: about 0.95 for dull black and 0.12 for shiny silver.'),
      chain: [sayCh('啞黑色吸收紅外線', 'Dull black absorbs infra-red'), sayCh('吸收更多能量', 'Takes in more energy'), sayCh('升溫更快', 'Warms faster')], items: [12] },
    { id: 'tr-eq', who: 'ming', title: { zh: '熱平衡：估一估', en: 'Balance: predict' },
      say: sayCh('燈一直照住，兩個罐都會升溫。不過銀色罐升到三十幾度，就好似停咗唔再升。我哋快轉時間，睇吓會點。', 'With the lamp on, both cans warm up. But the silver can seems to stop at about thirty degrees. Let’s fast-forward and see what happens.'),
      setup: { mode: 'transfer', flame: false, lamp: false, speed: 8, mag: 'rad' }, lock: ALL, graph: 'TT', advGraph: 'pow',
      quiz: { q: sayCh('燈仲著住，點解罐升到某個溫度就唔再升？', 'The lamp is still on. Why does a can stop warming at a certain temperature?'),
        opts: [sayCh('每秒吸收嘅熱，同每秒散失嘅熱一樣多', 'It loses heat each second as fast as it takes it in'), sayCh('個罐已經裝滿咗熱', 'The can is full of heat'), sayCh('燈冇再放出紅外線', 'The lamp stops giving out infra-red')], ans: 0,
        run: [['set', 'lamp', true], ['until', 'canSteady', 30]], watch: 3,
        why: sayCh('答案係：吸收同散失一樣多！罐越熱，散失去空氣嘅熱就越多。去到某個溫度，每秒吸收嘅熱啱啱等於每秒散失嘅熱，溫度就唔再變，叫熱平衡。黑色罐都會停，只係佢吸收得多，要熱好多先平衡。好似浴缸一邊入水一邊漏水，水位最後會停喺某個高度。',
          'The answer: it loses heat as fast as it takes it in! The hotter a can gets, the more heat it loses to the air. At a certain temperature the heat lost each second exactly matches the heat absorbed, so the temperature stops changing: this is called thermal equilibrium. The black can stops too, but it absorbs more, so it must get much hotter first. It’s like a bath with the tap on and the plug out: the water level ends up steady.') },
      adv: sayCh('平衡時 P吸 = P散；散失功率大約同（罐溫 − 室溫）成正比。', 'At balance, power in = power out, and power out is roughly proportional to (can temperature − room temperature).'),
      chain: [sayCh('罐變熱', 'The can warms up'), sayCh('散失的熱增加', 'It loses more heat'), sayCh('吸收 = 散失', 'Heat in = heat out'), sayCh('溫度不變', 'Temperature stays the same')], items: [12] },
    { id: 'tr-apply', who: 'chan', title: { zh: '生活中的熱轉移', en: 'Heat transfer in daily life' },
      say: sayCh('保溫瓶用真空擋住傳導同對流，再用光亮內壁反射紅外輻射。', 'A vacuum flask uses a vacuum to stop conduction and convection, and shiny walls to reflect infra-red radiation.'),
      quiz: { q: sayCh('點解夏天著淺色衫會涼啲？', 'Why do light-coloured clothes feel cooler in summer?'),
        opts: [sayCh('淺色會反射多啲紅外輻射', 'Light colours reflect more infra-red radiation'), sayCh('淺色衫比較薄', 'Light clothes are thinner'), sayCh('淺色吸收多啲熱', 'Light colours absorb more heat')], ans: 0,
        why: sayCh('答案係：淺色反射多啲紅外輻射！吸收少啲太陽嘅熱，所以涼啲。', 'The answer: light colours reflect more infra-red radiation, so they absorb less of the Sun’s heat and feel cooler.') },
      items: [11, 12] },
    { id: 'tr-sum', who: 'chan', title: { zh: '總結', en: 'Summary' },
      say: sayCh('熱有三種走法：傳導靠粒子一個傳一個，金屬最好；對流靠液體或氣體自己郁；輻射唔使任何物質，啞黑色表面吸收同放出都最好。吸收同散失一樣多嘅時候，溫度就唔再變。',
        'Three ways for heat to travel: conduction passes it particle to particle, best in metals; convection carries it as liquids or gases move; radiation needs nothing at all, and dull black surfaces absorb and give it off best. When heat in equals heat out, the temperature stays the same.'),
      chain: [sayCh('傳導', 'Conduction'), sayCh('對流', 'Convection'), sayCh('輻射', 'Radiation')], finish: true }
  ];
  const stateStages = [
    { id: 's-intro', who: 'chan', title: { zh: '冰、水、蒸氣', en: 'Ice, water, steam' },
      say: sayCh('杯入面有 0.1 kg、負 20 度嘅冰。放大鏡入面，固體嘅粒子排得好整齊，只係喺原位震。我哋會一路加熱，睇吓佢點樣變成水，再變成蒸氣。',
        'The beaker holds 0.1 kg of ice at minus 20 degrees. In the magnifier, the particles of a solid sit in neat rows and just jiggle in place. We will keep heating and watch it turn into water, then steam.'),
      setup: { mode: 'curve', heat: false, mc: 0.1, P: 500, loss: false, speed: 8 }, graph: 'T', items: [13] },
    { id: 's-melt', who: 'chan', title: { zh: '溶化：估一估', en: 'Melting: predict' },
      say: sayCh('開電熱器，一路加熱。', 'Switch the heater on and keep heating.'),
      setup: { mode: 'curve', heat: false, mc: 0.1, P: 500, loss: false, speed: 8 }, lock: ALL, graph: 'T', advGraph: 'TE',
      quiz: { q: sayCh('冰溶化嗰陣，我哋一直加熱，溫度會點？', 'While the ice is melting and we keep heating, what does the temperature do?'),
        opts: [sayCh('一直升', 'It keeps rising'), sayCh('停喺 0 °C 一段時間', 'It stays at 0 °C for a while'), sayCh('跌落嚟', 'It drops')], ans: 1,
        run: [['set', 'heat', true], ['until', 'melted', 30]], watch: 3,
        why: sayCh('答案係：停喺 0 °C！溶化嗰陣，能量用嚟拆開粒子之間嘅連結，唔係用嚟令粒子郁得快，所以溫度唔變。呢啲「收埋咗」嘅能量叫潛熱。所以凍飲入面嘅冰未溶晒之前，杯嘢飲都會保持好凍。',
          'The answer: it stays at 0 °C! While melting, the energy is used to break the bonds between particles, not to speed them up, so the temperature stays the same. This hidden energy is called latent heat. That’s why a cold drink stays icy until its ice has all melted.') },
      adv: sayCh('平線嘅闊度 = mL：0.1 kg × 3.34×10⁵ J/kg ≈ 33 kJ。', 'The width of the flat part = mL: 0.1 kg × 3.34×10⁵ J/kg ≈ 33 kJ.'),
      chain: [sayCh('加熱', 'Heating'), sayCh('能量用來拆開粒子連結', 'Energy breaks particle bonds'), sayCh('溫度不變', 'Temperature stays the same')], items: [13, 14, 15] },
    { id: 's-boil', who: 'ming', title: { zh: '沸騰', en: 'Boiling' },
      say: sayCh('繼續加熱！水升到 100 °C 就會沸騰，溫度又會停一段時間，而且停得仲耐，因為要將粒子完全分開變成氣體。', 'Keep heating! At 100 °C the water boils and the temperature stops again, for even longer, because the particles must be pulled completely apart to become a gas.'),
      task: sayCh('繼續加熱，直至水沸騰', 'Keep heating until the water boils'), graph: 'T', advGraph: 'TE', pre: [['set', 'speed', 14]],
      goal: { type: 'boil' }, demo: [['set', 'heat', true]], settle: 3, items: [13, 16] },
    { id: 's-compare', who: 'chan', title: { zh: '邊個要多啲能量？', en: 'Which needs more energy?' },
      say: sayCh('睇吓溫度–時間圖，兩段平線一長一短。', 'On the temperature–time graph, the two flat parts are different lengths.'), graph: 'T', advGraph: 'TE', pre: [['set', 'heat', true], ['set', 'speed', 20]],
      quiz: { q: sayCh('將 1 kg 冰溶成水，同將 1 kg 水變成蒸氣，邊個要多啲能量？', 'Which needs more energy: melting 1 kg of ice, or turning 1 kg of water into steam?'),
        opts: [sayCh('溶冰', 'Melting the ice'), sayCh('水變蒸氣', 'Turning water into steam'), sayCh('一樣', 'The same')], ans: 1,
        why: sayCh('答案係：水變蒸氣！液體變氣體要將粒子完全分開，所以需要多好多能量，差唔多係溶冰嘅七倍。所以俾 100 度嘅蒸氣辣親，會比俾 100 度嘅水辣親更傷。', 'The answer: turning water into steam! Going from liquid to gas pulls the particles completely apart, which needs far more energy: almost seven times as much as melting. That’s why a scald from 100 °C steam is worse than one from 100 °C water.') },
      adv: sayCh('E = mL：熔解比潛熱約 3.34×10⁵ J/kg，汽化比潛熱約 2.26×10⁶ J/kg。0.1 kg 水汽化要約 226 kJ，溶冰只要約 33 kJ。', 'E = mL: specific latent heat of fusion ≈ 3.34×10⁵ J/kg, of vaporisation ≈ 2.26×10⁶ J/kg. Boiling away 0.1 kg of water takes about 226 kJ; melting the ice only about 33 kJ.'), items: [15, 16] },
    { id: 's-error', who: 'chan', title: { zh: '實驗誤差', en: 'Experimental error' },
      say: sayCh('真實實驗入面，電熱器有啲熱會散失去空氣。我哋打開「熱散失」，再量一次溶冰需要嘅能量。', "In a real experiment, some of the heater’s heat escapes into the air. Let’s turn on heat loss and measure the energy to melt the ice again."),
      setup: { mode: 'curve', heat: false, mc: 0.1, P: 500, loss: true, speed: 8 }, lock: ALL, graph: 'T', advGraph: 'TE',
      quiz: { q: sayCh('我哋計出嚟嘅熔解比潛熱，會比書本數值大定細？點解？', 'Will our measured specific latent heat of fusion be bigger or smaller than the book value, and why?'),
        opts: [sayCh('大啲，因為有啲熱散失咗去空氣，冇俾冰吸收', 'Bigger, because some heat escaped to the air instead of the ice'), sayCh('細啲，因為冰太凍', 'Smaller, because the ice was too cold'), sayCh('一樣，實驗一定準', 'The same; experiments are always exact')], ans: 0,
        run: [['set', 'heat', true], ['until', 'melted', 40]], watch: 3,
        why: sayCh('答案係：大啲！我哋用電熱器俾出嘅能量去計，但有部分能量散失咗，冇用嚟溶冰，所以計出嚟偏大。可以加蓋、用隔熱物料包住，減少誤差。好似煲水唔冚蓋，要用多好多電先滾。',
          'The answer: bigger! We calculate using all the energy the heater gave out, but some escaped and never melted the ice, so our answer comes out too big. A lid and insulation reduce this error. It’s like boiling water without a lid: it takes much more energy.') },
      adv: sayCh('開咗熱散失：量度線嘅平線闊過公式虛線，因為電熱器有兩成能量散失咗。', 'With heat loss on, the measured flat part is wider than the dashed formula line, because a fifth of the heater’s energy escapes.'),
      items: [17] },
    { id: 's-sum', who: 'chan', title: { zh: '總結', en: 'Summary' },
      say: sayCh('物態改變嗰陣，溫度唔變，能量變成潛熱。溶化喺熔點，沸騰喺沸點。真實實驗會有熱散失，所以要諗辦法減少誤差。',
        'During a change of state the temperature stays the same and the energy becomes latent heat. Melting happens at the melting point, boiling at the boiling point. Real experiments lose heat, so we find ways to reduce the error.'),
      finish: true }
  ];
  const evapStages = [
    { id: 'e-intro', who: 'chan', title: { zh: '水去咗邊？', en: 'Where does the water go?' },
      say: sayCh('落完雨，地上啲水氹慢慢唔見咗，就係蒸發。放大鏡入面，表面最快嗰啲紅色粒子有足夠能量，會飛出水面變成水蒸氣。兩碟水放喺電子磅上面，碟 A 係對照組。',
        'After rain, puddles slowly disappear: that is evaporation. In the magnifier, the fastest red particles at the surface have enough energy to escape as water vapour. Two dishes of water sit on scales; dish A is the control.'),
      setup: { mode: 'evap', speed: 4 }, graph: 'mass', items: [18] },
    { id: 'e-wind', who: 'chan', title: { zh: '風：估一估', en: 'Wind: predict' },
      say: sayCh('碟 B 加一把風扇，其他條件同碟 A 一樣。', 'Dish B gets a fan; everything else is the same as dish A.'),
      cond: [sayCh('只改變：碟 B 有風', 'Only change: wind on dish B')],
      setup: { mode: 'evap', speed: 4 }, lock: ALL, graph: 'mass', advGraph: 'evE',
      quiz: { q: sayCh('邊碟水少得快啲？', 'Which dish loses water faster?'), opts: [sayCh('碟 A', 'Dish A'), sayCh('碟 B（有風扇）', 'Dish B (with the fan)'), sayCh('一樣', 'The same')], ans: 1,
        run: [['set', 'windB', true], ['until', 'evapLead', 20]], watch: 4,
        why: sayCh('答案係：碟 B！風會吹走水面上嘅水蒸氣，令飛走咗嘅粒子冇咁易返轉頭，所以蒸發得快啲。所以有風嘅日子，衫會乾得快啲。', 'The answer: dish B! Wind blows away the water vapour above the surface, so escaped particles are less likely to fall back in, and evaporation is faster. That’s why washing dries faster on a windy day.') },
      adv: sayCh('E = mL：每蒸發 1 g 水，就帶走大約 2260 J 能量。', 'E = mL: each gram of water that evaporates carries away about 2260 J.'),
      chain: [sayCh('有風', 'Wind'), sayCh('吹走水蒸氣', 'Vapour blown away'), sayCh('蒸發加快', 'Faster evaporation')], items: [19] },
    { id: 'e-factors', who: 'ming', title: { zh: '其他因素', en: 'Other factors' },
      say: sayCh('影響蒸發快慢仲有：溫度高啲、表面積大啲、空氣乾啲，都會蒸發得快啲。揀一樣嘢改變碟 B 試吓！記住每次只改一樣。',
        'Other things affect evaporation too: higher temperature, bigger surface area and drier air all make it faster. Change one thing for dish B and try it. Remember, only one at a time!'),
      task: sayCh('在工具箱只改變碟 B 的一個因素', 'In the toolbox, change one factor for dish B'),
      setup: { mode: 'evap', speed: 4 }, graph: 'mass',
      goal: { type: 'param', test: () => [p.heatB, p.wideB, p.coverB, p.windB].filter(Boolean).length === 1 }, demo: [['openTools'], ['set', 'wideB', true]], settle: 4,
      chain: [sayCh('溫度', 'Temperature'), sayCh('表面積', 'Surface area'), sayCh('風', 'Wind'), sayCh('濕度', 'Humidity')], items: [19] },
    { id: 'e-cool', who: 'chan', title: { zh: '蒸發令人變涼', en: 'Evaporation cools you' },
      say: sayCh('飛走嘅都係最快嘅粒子，留低嘅平均就慢咗，所以溫度會降低。', 'The particles that escape are the fastest ones, so those left behind are slower on average, and the temperature drops.'),
      quiz: { q: sayCh('游完水上岸，身體覺得凍，係因為？', 'Why do you feel cold when you get out of a swimming pool?'),
        opts: [sayCh('身上嘅水蒸發，帶走身體嘅熱', 'Water evaporating from your skin takes heat away'), sayCh('風太大', 'It is too windy'), sayCh('池水好凍', 'The pool water is cold')], ans: 0,
        why: sayCh('答案係：水蒸發帶走熱！最快嘅水粒子飛走，帶走能量，身體就變涼。出汗都係同一個道理。', 'The answer: evaporation takes heat away! The fastest water particles leave and carry energy with them, so your body cools. Sweating works the same way.') },
      adv: sayCh('E = mL：蒸發 1 g 汗，就由身體帶走大約 2260 J。', 'E = mL: evaporating 1 g of sweat takes about 2260 J from your body.'), advGraph: 'evE',
      chain: [sayCh('最快的粒子飛走', 'Fastest particles escape'), sayCh('剩下的平均較慢', 'The rest are slower on average'), sayCh('溫度下降', 'Temperature drops')], items: [18] },
    { id: 'e-boil', who: 'chan', title: { zh: '蒸發 vs 沸騰', en: 'Evaporation vs boiling' },
      say: sayCh('蒸發同沸騰都係液體變氣體，但係有啲唔同。', 'Evaporation and boiling both turn liquid into gas, but they are different.'),
      quiz: { q: sayCh('以下邊樣係沸騰先有嘅特點？', 'Which is true only of boiling?'),
        opts: [sayCh('喺任何溫度都會發生', 'It happens at any temperature'), sayCh('只喺液體表面發生', 'It happens only at the surface'), sayCh('喺液體入面形成氣泡，而且喺固定溫度發生', 'Bubbles form inside the liquid, at a fixed temperature')], ans: 2,
        why: sayCh('答案係：液體入面有氣泡，喺固定溫度發生！蒸發喺任何溫度、只喺表面、靜靜咁發生；沸騰就喺沸點、成杯液體入面都起泡。',
          'The answer: bubbles form inside the liquid at a fixed temperature! Evaporation happens quietly at any temperature and only at the surface; boiling happens at the boiling point, with bubbles throughout the liquid.') },
      chain: [sayCh('蒸發：任何溫度、表面', 'Evaporation: any temperature, surface'), sayCh('沸騰：沸點、整杯起泡', 'Boiling: boiling point, bubbles everywhere')], items: [20] },
    { id: 'e-sum', who: 'chan', title: { zh: '總結', en: 'Summary' },
      say: sayCh('蒸發係表面最快嘅粒子飛走，會令液體變涼。溫度、表面積、風同濕度都會影響蒸發快慢。', 'Evaporation is the fastest surface particles escaping, which cools the liquid. Temperature, surface area, wind and humidity all affect how fast it happens.'),
      finish: true }
  ];
  const floatStages = [
    { id: 'f-intro', who: 'chan', title: { zh: '浮定沉？', en: 'Float or sink?' },
      say: sayCh('有啲嘢放落水會浮，有啲會沉。係咪重嘅就一定沉、輕嘅就一定浮呢？我哋用一缸水試吓。', 'Some things float and some sink. Does heavy always mean sink and light always mean float? Let’s test it in a tank of water.'),
      setup: { mode: 'float', salt: false }, items: ['P4'] },
    { id: 'f-log', who: 'chan', title: { zh: '大木頭 vs 細鐵波：估一估', en: 'Big wood vs small steel: predict' },
      say: sayCh('一大舊木頭重過一粒細鐵波。', 'The big block of wood is heavier than the small steel ball.'),
      setup: { mode: 'float', salt: false }, lock: ALL, advGraph: 'rho',
      quiz: { q: sayCh('邊個會浮？', 'Which one floats?'), opts: [sayCh('大木頭', 'The big wood block'), sayCh('細鐵波', 'The small steel ball'), sayCh('兩樣都沉', 'Both sink')], ans: 0,
        run: [['drop', 'wood'], ['drop', 'steel'], ['until', 'settled', 8]], watch: 2,
        why: sayCh('答案係：大木頭！浮定沉唔係睇輕重，而係睇密度。木頭嘅粒子排得鬆，密度細過水；鐵排得好密，密度大過水。所以大木船可以浮，一粒細鐵釘就會沉。', 'The answer: the big wood block! Floating is not about heavy or light; it’s about density. Wood is loosely packed, less dense than water; steel is tightly packed, denser than water. That’s why a big wooden raft floats but a tiny iron nail sinks.') },
      chain: [sayCh('木頭密度細過水', 'Wood is less dense than water'), sayCh('浮力夠托起佢', 'Buoyancy can hold it up'), sayCh('浮', 'It floats')], items: ['P4'] },
    { id: 'f-dens', who: 'chan', title: { zh: '密度', en: 'Density' },
      say: sayCh('密度就係「每一份空間有幾多料」，等於質量除以體積。水嘅密度係每立方厘米 1 克。比水疏嘅會浮，比水密嘅會沉。冰同石頭試吓！',
        'Density is how much stuff is packed into each bit of space: mass divided by volume. Water’s density is 1 gram per cubic centimetre. Less dense things float; denser things sink. Let’s try ice and a stone!'),
      setup: { mode: 'float', salt: false }, demo: [['drop', 'ice'], ['drop', 'stone'], ['wait', 2.5]], advGraph: 'rho',
      adv: sayCh('密度 ρ = m ÷ V；浮着的物件，浸在水中的比例 = 物件密度 ÷ 液體密度。', 'Density ρ = m ÷ V. For a floating object, the fraction underwater = object density ÷ liquid density.'), items: ['P4'] },
    { id: 'f-boat', who: 'ming', title: { zh: '鋼船：估一估', en: 'Steel boat: predict' },
      say: sayCh('鐵會沉，咁用鋼鐵造嘅大船呢？', 'Steel sinks, so what about a big ship made of steel?'),
      setup: { mode: 'float', salt: false }, lock: ALL, advGraph: 'rho',
      quiz: { q: sayCh('鋼船點解唔會沉？', "Why doesn't a steel boat sink?"),
        opts: [sayCh('因為船好輕', 'Because boats are light'), sayCh('船入面有好多空氣，平均密度細過水', 'It holds lots of air, so its average density is less than water'), sayCh('因為海水會托起所有嘢', 'Because sea water holds everything up')], ans: 1,
        run: [['drop', 'boat'], ['until', 'settled', 8]], watch: 2,
        why: sayCh('答案係：船入面有好多空氣！成隻船連埋入面嘅空氣，平均密度細過水，所以會浮。如果船入水，空氣被水取代，就會沉。', 'The answer: it holds lots of air! The boat plus the air inside has an average density less than water, so it floats. If water floods in and replaces the air, it sinks.') },
      items: ['P4'] },
    { id: 'f-salt', who: 'chan', title: { zh: '鹽水：估一估', en: 'Salt water: predict' },
      say: sayCh('雞蛋喺清水入面會沉落底。', 'An egg sinks to the bottom in fresh water.'),
      setup: { mode: 'float', salt: false }, lock: ALL, pre: [['drop', 'egg']], advGraph: 'rho',
      quiz: { q: sayCh('加鹽之後，雞蛋會點？', 'What happens to the egg when we add salt?'), opts: [sayCh('浮起嚟', 'It floats up'), sayCh('沉得更快', 'It sinks faster'), sayCh('冇變', 'Nothing')], ans: 0,
        run: [['set', 'salt', true], ['until', 'settled', 8]], watch: 2,
        why: sayCh('答案係：浮起嚟！鹽水嘅密度大過雞蛋，所以雞蛋浮起。死海嘅水好鹹，人可以喺水面「瞓覺」！', 'The answer: it floats up! Salt water is denser than the egg, so the egg rises. The Dead Sea is so salty that people can lie on the surface!') },
      chain: [sayCh('加鹽', 'Add salt'), sayCh('液體密度變大', 'The liquid gets denser'), sayCh('雞蛋浮起', 'The egg floats')], items: ['P4'] },
    { id: 'f-try', who: 'ming', title: { zh: '神秘方塊', en: 'The mystery block' },
      say: sayCh('呢個神秘方塊而家會沉。調校佢嘅密度，令佢浮起嚟！', 'This mystery block sinks right now. Change its density to make it float!'),
      task: sayCh('調校神秘方塊的密度，令它浮起', 'Adjust the mystery block’s density so it floats'),
      setup: { mode: 'float', salt: false, dens: 1.5 }, pre: [['drop', 'custom']],
      goal: { type: 'float', test: (d) => d.key === 'custom' }, demo: [['openTools'], ['set', 'dens', 0.7]], settle: 2, items: ['P4'] },
    { id: 'f-sum', who: 'chan', title: { zh: '總結', en: 'Summary' },
      say: sayCh('浮定沉睇密度，唔係睇輕重。密度細過液體就浮，大過就沉；加鹽會令水嘅密度變大。', 'Float or sink depends on density, not weight. Less dense than the liquid floats; denser sinks. Adding salt makes water denser.'),
      finish: true }
  ];

  /* ---------------- 每課的黑板（每條公式都有對應的進階圖表） ---------------- */
  const advNote = sc('按「🔬 進階」，圖表會顯示這些公式怎樣運作。', 'Turn on 🔬 Advanced to see these formulas at work in the graphs.');
  const withNote = (zh, en) => sc(zh + advNote.zh, en + ' ' + advNote.en);
  const BOARD = {
    temp: { title: 'Temperature · 溫度', lines: ['T(K) = T(°C) + 273', '½mv² ∝ T(K)'],
      info: withNote('黑板上的公式：絕對溫度等於攝氏溫度加 273；粒子的平均動能與絕對溫度成正比，所以越熱，粒子平均越快。', 'Board formulas: absolute temperature = Celsius temperature + 273; the average kinetic energy of the particles is proportional to the absolute temperature, so hotter means faster.') },
    shc: { title: 'Specific heat · 比熱容量', lines: ['E = mcΔT', 'C = mc', 'c = E ÷ (mΔT)'],
      info: withNote('黑板上的公式：E = mcΔT 計升溫需要的能量；熱容量 C = mc；比熱容量 c = E ÷ (mΔT)。', 'Board formulas: E = mcΔT for the energy to warm something; heat capacity C = mc; specific heat capacity c = E ÷ (mΔT).') },
    transfer: { title: 'Heat transfer · 熱的轉移', lines: [sc('熱流 ∝ k·ΔT ÷ L', 'heat flow ∝ k·ΔT ÷ L'), sc('P吸 = a × P燈', 'P(in) = a × P(lamp)'), sc('平衡：P吸 = P散', 'balance: P(in) = P(out)')],
      info: withNote('黑板上的公式：傳導的熱流與熱導率 k 和溫度差成正比；罐子吸收的功率 = 吸收比例 a × 燈的功率；吸收和散失相等時，溫度不再改變。', 'Board formulas: conducted heat flow is proportional to the conductivity k and the temperature difference; power absorbed by a can = fraction absorbed a × lamp power; when power in equals power out, the temperature stops changing.') },
    state: { title: 'Changes of state · 物態變化', lines: ['E = mcΔT', 'E = mL'],
      info: withNote('黑板上的公式：E = mcΔT 計升溫需要的能量；E = mL 計物態改變的潛熱。', 'Board formulas: E = mcΔT for warming up; E = mL for the latent heat in a change of state.') },
    evap: { title: 'Evaporation · 蒸發', lines: ['E = mL', sc('L汽 ≈ 2260 J/g', 'L(vap) ≈ 2260 J/g')],
      info: withNote('黑板上的公式：E = mL。每蒸發 1 g 水，就帶走大約 2260 J 能量，所以蒸發會令東西變涼。', 'Board formulas: E = mL. Each gram of water that evaporates carries away about 2260 J, so evaporation cools things down.') },
    float: { title: 'Density · 密度', lines: ['ρ = m ÷ V', sc('浸入比例 = ρ物 ÷ ρ液', 'fraction under = ρ(object) ÷ ρ(liquid)')],
      info: withNote('黑板上的公式：密度 ρ = m ÷ V；浮着的物件，浸在液體中的比例 = 物件密度 ÷ 液體密度。', 'Board formulas: density ρ = m ÷ V; for a floating object, the fraction under the surface = object density ÷ liquid density.') }
  };

  /* ================== 3D 場景 ================== */
  const G = {};
  ['beaker', 'curve', 'transfer', 'evap', 'float'].forEach((k) => { G[k] = new THREE.Group(); root.add(G[k]); });
  const V = {};
  const amat = (c, extra = {}) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.92, depthWrite: false, ...extra });
  const UP = new THREE.Vector3(0, 1, 0);
  function arrowHead(parent, mat, r) { const h = new THREE.Mesh(new THREE.ConeGeometry(r, r * 2.6, 14), mat); parent.add(h); return h; }
  // 彎曲箭咀：沿住幾個點畫一條管，尾端加箭頭
  function curveArrow(parent, pts, mat, r = 0.022) {
    const curve = new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q)));
    const g = new THREE.Group(); parent.add(g);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 60, r, 8, false), mat); g.add(tube);
    const h = arrowHead(g, mat, r * 2.6), tan = curve.getTangentAt(1);
    h.position.copy(curve.getPointAt(1)).addScaledVector(tan, r * 2.6); h.quaternion.setFromUnitVectors(UP, tan);
    if (mat.depthTest === false) { tube.renderOrder = 6; h.renderOrder = 6; }
    g.userData.curve = curve; return g;
  }
  // 波浪線（輻射）
  function wavyPts(a, b, amp = 0.05, waves = 4, n = 60) {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), side = new THREE.Vector3(-d.y, d.x, 0).normalize();
    return Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return A.clone().addScaledVector(d, t).addScaledVector(side, Math.sin(t * waves * Math.PI * 2) * amp * Math.min(1, t * 6, (1 - t) * 6)).toArray(); });
  }
  function table(parent, w = 9, d = 2.6) {
    mesh(new THREE.BoxGeometry(w, 0.1, d), std(0xf8fafc, 0.6), 0, TABLE - 0.05, 0, parent);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) mesh(new THREE.BoxGeometry(0.1, TABLE - 0.1, 0.1), std(0x94a3b8, 0.5, 0.5), sx * (w / 2 - 0.2), (TABLE - 0.1) / 2, sz * (d / 2 - 0.2), parent);
  }
  function hotplate(parent, x, z = 0) {
    mesh(new THREE.BoxGeometry(1.1, 0.25, 1.1), std(0x334155, 0.4, 0.3), x, TABLE + 0.125, z, parent);
    const top = mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.03, 32), std(0x111827, 0.4, 0, { emissive: 0xff2200, emissiveIntensity: 0 }), x, TABLE + 0.265, z, parent);
    return top;
  }
  function beakerSet(parent, x, withIce) {
    const o = {};
    o.plate = hotplate(parent, x);
    const by = TABLE + 0.28;
    mesh(new THREE.CylinderGeometry(0.55, 0.52, 1.2, 32, 1, true), glass(0xe0f2fe, 0.25), x, by + 0.6, 0, parent, false);
    mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.03, 32), glass(0xe0f2fe, 0.35), x, by + 0.015, 0, parent, false);
    o.liq = mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 32), std(0x60a5fa, 0.1, 0, { transparent: true, opacity: 0.6 }), x, by + 0.3, 0, parent, false);
    o.by = by; o.x = x;
    if (withIce) { o.ice = new THREE.Group(); o.ice.position.set(x, by, 0); parent.add(o.ice); [[-0.15, 0, -0.1], [0.15, 0, 0.1], [0, 0.22, 0], [0.1, 0, -0.18]].forEach(([dx, dy, dz]) => mesh(new THREE.BoxGeometry(0.25, 0.22, 0.25), std(0xe0f2fe, 0.1, 0, { transparent: true, opacity: 0.85 }), dx, 0.14 + dy, dz, o.ice)); }
    // 溫度計
    const tx = x + 0.3;
    mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.7, 12), glass(0xffffff, 0.45), tx, by + 1.0, 0.2, parent, false);
    mesh(new THREE.SphereGeometry(0.08, 12, 10), std(0xdc2626, 0.3), tx, by + 0.18, 0.2, parent, false);
    o.col = mesh(new THREE.CylinderGeometry(0.025, 0.025, 1, 8), std(0xdc2626, 0.3), tx, by + 0.2, 0.2, parent, false);
    o.tag = tag('readout', parent, tx + 0.15, by + 2.0, 0.2);
    // 氣泡 + 蒸氣
    o.bub = []; o.steam = [];
    for (let i = 0; i < 14; i++) { const b = mesh(new THREE.SphereGeometry(0.035, 8, 6), std(0xffffff, 0.2, 0, { transparent: true, opacity: 0.7 }), x, by, 0, parent, false); b.userData.s = Math.random(); o.bub.push(b); }
    for (let i = 0; i < 14; i++) { const s = mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4, depthWrite: false }), x, by + 1.3, 0, parent, false); s.userData.s = Math.random(); o.steam.push(s); }
    return o;
  }

  /* ---------------- 粒子放大鏡 ---------------- */
  const MAG = { R: 0.62, n: 36, parts: [], el: [], snap: true };
  // 放大鏡位置：熱轉移模式會移到正在放大的實驗上面
  const MAGPOS = { beaker: [3.4, 2.75, 0.2], curve: [3.4, 2.75, 0.2], evap: [3.4, 2.75, 0.2], cond: [-2.3, 2.75, 0.9], conv: [-0.85, 2.5, 0.9], rad: [1.7, 2.95, 0.6] };
  const magKey = () => (p.mode === 'transfer' ? p.mag : p.mode);
  const magGoal = () => MAGPOS[magKey()] || MAGPOS.beaker;
  const CB = new THREE.Color(0x2563eb), CR = new THREE.Color(0xdc2626), COr = new THREE.Color(0xf97316);
  const gauss = () => { let u = 0; while (!u) u = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random()); };
  const maxw = () => Math.sqrt((gauss() ** 2 + gauss() ** 2 + gauss() ** 2) / 3); // 每粒粒子快慢唔同（Maxwell 分佈），平均約 0.92
  // 動畫速度：真實分子速率只會由 637 m/s（20 °C）升到 719 m/s（100 °C），肉眼睇唔到分別，所以動畫將差別放大
  const visSpeed = (TC) => 0.4 + 1.6 * clamp(TC / 100, -0.25, 1.4);
  function mountMag() {
    const g = new THREE.Group(); root.add(g); V.magG = g; g.position.set(...MAGPOS.beaker);
    V.magBall = mesh(new THREE.SphereGeometry(MAG.R + 0.06, 32, 20), glass(0xffffff, 0.16), 0, 0, 0, g, false);
    mesh(new THREE.TorusGeometry(MAG.R + 0.06, 0.05, 10, 40), std(0x334155, 0.4, 0.5), 0, 0, 0, g, false);
    V.magTag = tag('readout light', g, 0, MAG.R + 0.38, 0);
    // 連接線：由放大鏡指去被放大的地方
    V.magLine = kit.beam(root, new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.35, depthWrite: false }), 0.018);
    V.magDot = mesh(new THREE.TorusGeometry(0.09, 0.015, 8, 24), new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.6 }), 0, 0, 0, root, false);
    const geo = new THREE.SphereGeometry(0.055, 10, 8);
    for (let i = 0; i < MAG.n; i++) {
      const m = mesh(geo, std(0x2563eb, 0.3), 0, 0, 0, g, false);
      const ix = i % 4, iy = Math.floor(i / 16), iz = Math.floor(i / 4) % 4;
      const home = new THREE.Vector3((ix - 1.5) * 0.15, -0.38 + iy * 0.15, (iz - 1.5) * 0.15);
      const k = maxw();
      MAG.parts.push({ m, p: home.clone(), v: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(), home, esc: 0, k, k1: k, kt: Math.random(), ph: Math.random() * 6.3,
        s: i / MAG.n, zc: (((i * 7) % 5) - 2) * 0.07, ray: false });
    }
    // 傳導：自由電子（黃點）＋熱流箭咀
    const eg = new THREE.SphereGeometry(0.026, 8, 6);
    for (let i = 0; i < 12; i++) MAG.el.push({ m: mesh(eg, new THREE.MeshBasicMaterial({ color: 0xfbbf24 }), 0, 0, 0, g, false), p: new THREE.Vector3((Math.random() - 0.5) * 1.1, (Math.random() - 0.5) * 0.3, 0), v: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, 0).normalize() });
    V.magArrow = new THREE.Group(); g.add(V.magArrow);
    const om = amat(0xf97316);
    kit.beam(V.magArrow, om, 0.03).set(-0.5, 0.3, 0, 0.38, 0.3, 0);
    const hd = arrowHead(V.magArrow, om, 0.055); hd.rotation.z = -Math.PI / 2; hd.position.set(0.44, 0.3, 0);
    // 對流：杯底熱源
    V.magHot = mesh(new THREE.BoxGeometry(0.34, 0.04, 0.26), std(0x111827, 0.4, 0, { emissive: 0xff2200, emissiveIntensity: 0.9 }), 0, -0.52, 0, g, false);
    // 輻射：黑色和銀色表面
    V.magPl = [[-0.26, 0x111827, 0.95, 0], [0.26, 0xd1d5db, 0.2, 0.4]].map(([x, col, r, mt]) => {
      const pl = mesh(new THREE.BoxGeometry(0.42, 0.06, 0.3), std(col, r, mt), x, -0.4, 0, g, false);
      return { pl, t: tag('readout light', g, x, -0.58, 0) };
    });
  }
  function magFluid(dt, time, TC, frac, escape, colorBy) {
    const nS = Math.round(MAG.n * frac.s), nL = Math.round(MAG.n * frac.l);
    const vs = visSpeed(TC);
    MAG.parts.forEach((q, i) => {
      q.m.scale.setScalar(1);
      q.kt -= dt; if (q.kt <= 0) { q.kt = 0.5 + Math.random() * 1.2; q.k1 = maxw(); } // 碰撞：快慢會互相交換
      q.k += (q.k1 - q.k) * Math.min(1, dt * 3);
      const st = i < nS ? 's' : i < nS + nL ? 'l' : 'g';
      if (st === 's') {
        const a = 0.008 + 0.03 * clamp((TC + 40) / 40, 0, 1.2);
        q.p.set(q.home.x + Math.sin(time * 27 + q.ph) * a, q.home.y + Math.sin(time * 31 + q.ph * 2) * a, q.home.z + Math.sin(time * 23 + q.ph * 3) * a); q.esc = 0;
      } else {
        const s = (st === 'l' ? 0.32 : 0.9) * vs * q.k;
        if (st === 'l') { q.v.x += (Math.random() - 0.5) * 6 * dt; q.v.y += (Math.random() - 0.5) * 6 * dt - 1.2 * dt; q.v.z += (Math.random() - 0.5) * 6 * dt; }
        q.v.normalize(); q.p.addScaledVector(q.v, s * dt);
        const lim = MAG.R - 0.06, top = st === 'l' ? -0.05 : lim;
        if (st === 'l' && escape > 0 && q.esc <= 0 && q.p.y > top - 0.04 && q.k > 1.1 && Math.random() < escape * dt * 2.5) q.esc = 1.2; // 最快嘅粒子先飛得出水面
        if (q.esc > 0) { q.esc -= dt; q.p.y += 0.8 * dt; if (q.esc <= 0) { q.p.set((Math.random() - 0.5) * 0.4, -0.4, (Math.random() - 0.5) * 0.4); q.k = q.k1 = maxw(); } }
        else {
          if (q.p.length() > lim) { q.p.setLength(lim); q.v.reflect(q.p.clone().normalize()); }
          if (q.p.y > top) { q.p.y = top; q.v.y = -Math.abs(q.v.y); }
        }
      }
      if (colorBy === 'phase') q.m.material.color.set(st === 's' ? 0x2563eb : st === 'g' ? 0xf97316 : 0x0ea5e9);
      else q.m.material.color.lerpColors(CB, CR, clamp((vs * q.k - 0.8) / 0.9, 0, 1)); // 藍＝慢，紅＝快
      q.m.visible = q.esc <= 0 || q.p.y < MAG.R + 0.6;
      q.m.position.copy(q.p);
    });
  }
  function magCond(time) {
    const r = rods[p.magRod], metal = ROD[p.magRod].k !== 'gl';
    const hAt = (x) => clamp((r.T[Math.round(clamp((x + 0.55) / 1.1, 0, 1) * (NCELL - 1))] - 20) / 220, 0, 1);
    MAG.parts.forEach((q, i) => {
      const c = i % 12, row = Math.floor(i / 12), hx = -0.55 + c * 0.1, hy = -0.1 + row * 0.1;
      const h = hAt(hx), a = 0.006 + 0.036 * h; // 熱嘅粒子震得勁啲
      q.p.set(hx + Math.sin(time * 29 + q.ph) * a, hy + Math.sin(time * 33 + q.ph * 2) * a, Math.sin(time * 25 + q.ph * 3) * a);
      q.m.visible = true; q.m.scale.setScalar(0.85); q.m.position.copy(q.p);
      q.m.material.color.lerpColors(CB, CR, h);
    });
    return { metal, hAt };
  }
  function magElectrons(dt, on, hAt) {
    MAG.el.forEach((e) => {
      e.m.visible = on; if (!on) return;
      const sp = 0.25 + 1.2 * hAt(e.p.x);
      e.v.x += (Math.random() - 0.5) * 8 * dt; e.v.y += (Math.random() - 0.5) * 8 * dt; e.v.normalize();
      e.p.addScaledVector(e.v, sp * dt);
      if (Math.abs(e.p.x) > 0.6) { e.p.x = Math.sign(e.p.x) * 0.6; e.v.x *= -1; }
      if (Math.abs(e.p.y) > 0.17) { e.p.y = Math.sign(e.p.y) * 0.17; e.v.y *= -1; }
      e.m.position.set(e.p.x, e.p.y, 0.07);
    });
  }
  function magConv(dt, time) {
    MAG.parts.forEach((q, i) => {
      q.s = (q.s + dt * 0.11) % 1;
      const u = q.s * 4, side = i % 2 ? 1 : -1;
      let x, y, h;
      if (u < 1) { x = side * 0.05; y = -0.42 + u * 0.8; h = 1; }                              // 熱水上升
      else if (u < 2) { x = side * (0.05 + (u - 1) * 0.35); y = 0.38; h = 1 - (u - 1); }      // 喺水面散開、變凍
      else if (u < 3) { x = side * 0.4; y = 0.38 - (u - 2) * 0.8; h = 0; }                     // 凍水下沉
      else { x = side * (0.4 - (u - 3) * 0.35); y = -0.42; h = u - 3; }                        // 喺杯底再受熱
      q.p.set(x + Math.sin(time * 7 + q.ph) * 0.02, y + Math.sin(time * 9 + q.ph * 2) * 0.02, q.zc);
      q.m.visible = true; q.m.scale.setScalar(1); q.m.position.copy(q.p);
      q.m.material.color.lerpColors(CB, CR, h);
    });
  }
  function resetRay(q, stagger) { q.p.set(-0.62 + Math.random() * 0.95, 0.62 + (stagger ? Math.random() * 1.2 : 0.05), (Math.random() - 0.5) * 0.24); q.v.set(0.22, -1, 0).normalize(); q.ray = true; q.refl = false; }
  function magRad(dt) {
    const on = p.lamp;
    MAG.parts.forEach((q, i) => {
      if (!on || i >= 24) { q.m.visible = false; q.ray = false; return; }
      if (!q.ray) resetRay(q, true);
      q.p.addScaledVector(q.v, 0.8 * dt);
      if (q.v.y < 0 && q.p.y <= -0.35 && Math.abs(q.p.x) < 0.48) {
        if (q.p.x < 0 || Math.random() < 0.12) resetRay(q, false); // 黑色：吸收；銀色：大部分反射
        else { q.v.y = Math.abs(q.v.y); q.refl = true; }
      }
      if (q.p.y > 0.7 || q.p.x > 0.7 || q.p.y < -0.6) resetRay(q, false);
      q.m.visible = q.p.length() < MAG.R; q.m.scale.setScalar(0.6); q.m.position.copy(q.p);
      q.m.material.color.copy(COr);
    });
  }
  function magTarget() { // 放大鏡放大緊邊度（世界座標）
    const k = magKey();
    if (k === 'beaker') return [V.b.x, V.b.by + 0.35, 0];
    if (k === 'curve') return [V.c.x, V.c.by + 0.2, 0];
    if (k === 'evap') return [V.dish[1].x, TABLE + 0.27, 0];
    if (k === 'cond') return [ROD_X0 + 0.6, TABLE + 0.75, -0.75 + p.magRod * 0.5];
    if (k === 'conv') return [V.conv.x, V.conv.by + 0.45, 0];
    return [3.25, TABLE + 0.85, 0];
  }
  function updMag(dt, time, o) {
    const g = V.magG, goal = new THREE.Vector3(...magGoal());
    if (MAG.snap) { g.position.copy(goal); MAG.snap = false; } else g.position.lerp(goal, Math.min(1, dt * 4));
    const k = magKey(), cond = k === 'cond', conv = k === 'conv', rad = k === 'rad';
    V.magArrow.visible = cond && p.flame; V.magHot.visible = conv && p.flame;
    V.magPl.forEach((x) => { x.pl.visible = rad; x.t.o.visible = rad; });
    if (cond) { const c = magCond(time); magElectrons(dt, c.metal, c.hAt); } else magElectrons(dt, false);
    if (p.mode === 'beaker') magFluid(dt, time, S.T, { s: 0, l: 1 }, S.T > 60 ? (S.T - 60) / 30 : 0, 'speed');
    else if (p.mode === 'curve') magFluid(dt, time, cur.T, o.frac, cur.phase === 'boil' ? 2 : 0, 'phase');
    else if (p.mode === 'evap') magFluid(dt, time, p.heatB ? 55 : 20, { s: 0, l: 1 }, o.escape, 'speed');
    else if (conv) { if (p.flame) magConv(dt, time); else magFluid(dt, time, 20, { s: 0, l: 1 }, 0, 'speed'); }
    else if (rad) magRad(dt);
    // 連接線
    const tg = new THREE.Vector3(...magTarget()), dir = tg.clone().sub(g.position);
    const a = g.position.clone().addScaledVector(dir.clone().normalize(), MAG.R + 0.07);
    V.magLine.set(a.x, a.y, a.z, tg.x, tg.y, tg.z); V.magLine.visible = V.magG.visible && dir.length() > MAG.R + 0.2;
    V.magDot.position.copy(tg); V.magDot.visible = V.magLine.visible; V.magDot.quaternion.copy(ctx.camera.quaternion);
  }

  function mount() {
    for (const k of Object.keys(G)) table(G[k]);
    V.b = beakerSet(G.beaker, -1.2, false);
    V.c = beakerSet(G.curve, -1.2, true);
    // 熱轉移：四條棒
    const tg = G.transfer;
    mesh(new THREE.BoxGeometry(0.5, 0.6, 2.0), std(0x475569, 0.5, 0.4), -3.9, TABLE + 0.6, 0, tg);
    V.flame = mesh(new THREE.ConeGeometry(0.18, 0.5, 16), new THREE.MeshBasicMaterial({ color: 0xff7a00, transparent: true, opacity: 0.85 }), -3.9, TABLE + 0.25, 0, tg, false);
    V.rodSeg = []; V.pins = []; V.rodTags = []; V.rodArrow = [];
    ROD.forEach((r, ri) => {
      const z = -0.75 + ri * 0.5, segs = [];
      for (let i = 0; i < NCELL; i++) segs.push(mesh(new THREE.BoxGeometry(ROD_LEN / NCELL, 0.08, 0.08), std(r.col, 0.4, r.k === 'gl' ? 0 : 0.6, { emissive: 0xff3300, emissiveIntensity: 0 }), ROD_X0 + (i + 0.5) * (ROD_LEN / NCELL), TABLE + 0.75, z, tg));
      segs.forEach((s) => (s.userData.rod = ri));
      V.rodSeg.push(segs);
      V.pins.push(PIN_AT.map((d) => mesh(new THREE.SphereGeometry(0.05, 10, 8), std(0xfef08a, 0.6), ROD_X0 + d, TABLE + 0.66, z, tg)));
      V.rodTags.push(tag('readout light', tg, -0.55, TABLE + 0.78, z));
      // 熱傳導箭咀：箭頭跟住「熱傳到邊」
      const m = amat(0xf97316), shaft = kit.beam(tg, m, 0.03), head = arrowHead(tg, m, 0.05);
      head.rotation.z = -Math.PI / 2;
      const dot = mesh(new THREE.SphereGeometry(0.032, 10, 8), amat(0xfef08a), 0, 0, 0, tg, false);
      V.rodArrow.push({ shaft, head, dot, z });
    });
    V.flameArrow = curveArrow(tg, [[-3.95, TABLE + 0.2, 1.12], [-4.0, TABLE + 0.7, 1.12], [-3.8, TABLE + 1.05, 1.05], [-3.45, TABLE + 1.0, 0.9]], amat(0xf97316), 0.024);
    V.rodHit = mesh(new THREE.BoxGeometry(3.4, 0.5, 2.0), kit.hiddenMat, -2.2, TABLE + 0.75, 0, tg, false);
    // 對流杯
    V.conv = beakerSet(tg, 0.6, false); V.conv.dye = [];
    [...V.conv.bub, ...V.conv.steam].forEach((m) => (m.visible = false));
    for (let i = 0; i < 16; i++) { const d = mesh(new THREE.SphereGeometry(0.05, 8, 6), std(0x7c3aed, 0.5), 0.6, 0, 0, tg, false); d.userData.s = i / 16; V.conv.dye.push(d); }
    // 對流箭咀：紅＝熱水上升，藍＝冷水下沉（一直顯示喺最上面，唔會俾水擋住）
    V.convArrows = new THREE.Group(); tg.add(V.convArrows);
    const cx = V.conv.x, cy = V.conv.by, red = amat(0xdc2626, { depthTest: false }), blue = amat(0x2563eb, { depthTest: false });
    for (const s of [-1, 1]) {
      curveArrow(V.convArrows, [[cx + s * 0.03, cy + 0.12, 0.12], [cx + s * 0.03, cy + 0.45, 0.12], [cx + s * 0.07, cy + 0.66, 0.12], [cx + s * 0.22, cy + 0.7, 0.12], [cx + s * 0.31, cy + 0.64, 0.12]], red);
      curveArrow(V.convArrows, [[cx + s * 0.38, cy + 0.55, 0.12], [cx + s * 0.4, cy + 0.32, 0.12], [cx + s * 0.35, cy + 0.14, 0.12], [cx + s * 0.18, cy + 0.09, 0.12], [cx + s * 0.08, cy + 0.1, 0.12]], blue);
    }
    V.convHit = mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.4, 12), kit.hiddenMat, cx, cy + 0.6, 0, tg, false);
    // 輻射：兩個罐 + 燈（銀色罐：唔可以用 metalness 1，冇環境貼圖會變黑色）
    V.cans = [[2.6, 0x111827, 0.95], [3.9, 0xe5e7eb, 0.12]].map(([x, col, ab], i) => {
      const c = mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.8, 32), i ? std(col, 0.22, 0.35, { emissive: 0x9ca3af, emissiveIntensity: 0.18 }) : std(col, 0.95, 0), x, TABLE + 0.4, 0, tg);
      return { c, t: tag('readout', tg, x, TABLE + 1.15, 0.35), ab, x };
    });
    mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 8), std(0x334155), 3.25, TABLE + 1.7, -0.5, tg);
    V.lamp = mesh(new THREE.SphereGeometry(0.22, 16, 12), std(0x7f1d1d, 0.4, 0, { emissive: 0xff2200, emissiveIntensity: 0 }), 3.25, TABLE + 2.2, 0, tg);
    mesh(new THREE.ConeGeometry(0.4, 0.35, 20, 1, true), std(0x94a3b8, 0.3, 0.8, { side: THREE.DoubleSide }), 3.25, TABLE + 2.32, 0, tg);
    // 輻射箭咀（波浪）：燈 → 兩個罐；銀色罐反射走
    V.radArrows = new THREE.Group(); tg.add(V.radArrows);
    const ir = amat(0xf97316), irR = amat(0xfb923c, { opacity: 0.8 });
    V.radPaths = [
      curveArrow(V.radArrows, wavyPts([3.08, TABLE + 2.0, 0.05], [2.68, TABLE + 1.0, 0.05]), ir, 0.016),
      curveArrow(V.radArrows, wavyPts([3.42, TABLE + 2.0, 0.05], [3.82, TABLE + 1.0, 0.05]), ir, 0.016),
      curveArrow(V.radArrows, wavyPts([3.98, TABLE + 0.98, 0.05], [4.55, TABLE + 1.85, 0.05], 0.045, 3), irR, 0.016)
    ];
    V.radDots = V.radPaths.map((pa, i) => [0, 1, 2].map((k) => { const d = mesh(new THREE.SphereGeometry(0.035, 10, 8), amat(0xfef08a), 0, 0, 0, V.radArrows, false); d.userData = { c: pa.userData.curve, o: k / 3 + i * 0.1 }; return d; })).flat();
    V.radHit = mesh(new THREE.BoxGeometry(2.4, 2.6, 1.2), kit.hiddenMat, 3.25, TABLE + 1.25, 0, tg, false);
    // 蒸發：兩個碟 + 電子磅
    const eg = G.evap;
    V.dish = ['A', 'B'].map((k, i) => {
      const x = i ? 1.4 : -1.4;
      mesh(new THREE.BoxGeometry(1.4, 0.18, 1.2), std(0xe2e8f0, 0.5), x, TABLE + 0.09, 0, eg);
      const dish = mesh(new THREE.CylinderGeometry(0.42, 0.36, 0.12, 32), glass(0xffffff, 0.5), x, TABLE + 0.26, 0, eg, false);
      const water = mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.06, 32), std(0x60a5fa, 0.1, 0, { transparent: true, opacity: 0.75 }), x, TABLE + 0.24, 0, eg, false);
      const t = tag('readout', eg, x, TABLE + 0.9, 0.5);
      const nm = tag('readout light', eg, x, TABLE + 0.32, 0.75);
      return { dish, water, t, nm, x, k };
    });
    V.fanB = new THREE.Group(); V.fanB.position.set(2.7, TABLE + 0.45, 0); eg.add(V.fanB);
    mesh(new THREE.TorusGeometry(0.3, 0.03, 8, 24), std(0x94a3b8, 0.4, 0.5), 0, 0, 0, V.fanB).rotation.y = Math.PI / 2;
    V.fanBl = new THREE.Group(); V.fanB.add(V.fanBl);
    for (let k = 0; k < 3; k++) { const piv = new THREE.Group(); piv.rotation.x = (k * 2 * Math.PI) / 3; V.fanBl.add(piv); mesh(new THREE.BoxGeometry(0.02, 0.26, 0.09), std(0x0ea5e9), 0, 0.13, 0, piv); }
    V.heatB = mesh(new THREE.BoxGeometry(1.0, 0.04, 1.0), std(0x111827, 0.4, 0, { emissive: 0xff2200, emissiveIntensity: 0.6 }), 1.4, TABLE + 0.195, 0, eg, false);
    V.coverB = mesh(new THREE.SphereGeometry(0.62, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), glass(0xffffff, 0.25), 1.4, TABLE + 0.18, 0, eg, false);
    // 浮沉水缸
    const fg = G.float;
    V.tankY0 = TABLE; V.waterTop = TABLE + 1.1;
    mesh(new THREE.BoxGeometry(3.4, 1.5, 1.4), glass(0xe0f2fe, 0.18), 0, TABLE + 0.75, 0, fg, false);
    V.water = mesh(new THREE.BoxGeometry(3.3, 1.1, 1.3), std(0x60a5fa, 0.1, 0, { transparent: true, opacity: 0.45, depthWrite: false }), 0, TABLE + 0.55, 0, fg, false);
    V.fl = {};
    for (const [k, o] of Object.entries(FLO)) {
      const gg = new THREE.Group(); fg.add(gg);
      let h;
      if (o.shape === 'box') { mesh(new THREE.BoxGeometry(...o.size), std(o.col, 0.6), 0, o.size[1] / 2, 0, gg); h = o.size[1]; }
      else if (o.shape === 'ball') { mesh(new THREE.SphereGeometry(o.size[0], 20, 14), std(o.col, k === 'steel' ? 0.2 : 0.5, k === 'steel' ? 0.9 : 0), 0, o.size[0], 0, gg); h = o.size[0] * 2; }
      else if (o.shape === 'egg') { const e = mesh(new THREE.SphereGeometry(o.size[0], 20, 14), std(o.col, 0.6), 0, o.size[0] * 1.3, 0, gg); e.scale.set(1, 1.3, 1); h = o.size[0] * 2.6; }
      else if (o.shape === 'stone') { const s = mesh(new THREE.DodecahedronGeometry(o.size[0], 0), std(o.col, 0.9), 0, o.size[0], 0, gg); s.scale.set(1.2, 0.8, 1); h = o.size[0] * 1.6; }
      else { mesh(new THREE.BoxGeometry(o.size[0], 0.05, o.size[2]), std(o.col, 0.4, 0.8), 0, 0.025, 0, gg); for (const sz of [-1, 1]) mesh(new THREE.BoxGeometry(o.size[0], o.size[1], 0.04), std(o.col, 0.4, 0.8), 0, o.size[1] / 2, sz * o.size[2] / 2, gg); for (const sx of [-1, 1]) mesh(new THREE.BoxGeometry(0.04, o.size[1], o.size[2]), std(o.col, 0.4, 0.8), sx * o.size[0] / 2, o.size[1] / 2, 0, gg); h = o.size[1]; }
      const t = tag('readout light', gg, 0, h + 0.25, 0);
      V.fl[k] = { g: gg, h, t };
      gg.visible = false;
    }
    mountMag();
  }

  /* ================== 物理 ================== */
  const emitOnce = (ev, d) => { if (!S.fl[ev]) { S.fl[ev] = 1; ctx.emit(ev, d || {}); } };
  const KLOSS = 1.5;
  function stepBeaker(dt) {
    const L0 = LIQ[p.liquid];
    const P = p.heat ? p.P : 0;
    S.E += P * dt;
    S.T += (P - KLOSS * (S.T - 20)) / (p.m * L0.c) * dt;
    if (S.T > L0.bp) S.T = L0.bp;
    if (S.T >= 32) emitOnce('warm'); // 「估一估」：升溫已經清楚睇得到
    // 進階數據
    const TK = S.T + 273.15;
    if (!kePts.length || TK - kePts[kePts.length - 1][0] >= 3) kePts.push([+TK.toFixed(1), +(0.020709 * TK).toFixed(3)]);
    if (p.heat) {
      if (!etRun.cur) etRun.cur = { liq: p.liquid, m: p.m };
      const dT = S.T - 20, lastT = etPts.length ? etPts[etPts.length - 1][0] : 0;
      if (dT - lastT >= 1) etPts.push([+dT.toFixed(2), +(S.E / 1000).toFixed(2)]);
    }
  }
  const CI = 2100, CW = 4200, CS = 2000, LF = 334000, LV = 2260000;
  function stepCurve(dt) {
    if (!p.heat) return;
    const Pin = p.P * (p.loss ? 0.8 : 1), m = p.mc;
    let Q = Pin * dt; cur.E += p.P * dt;
    while (Q > 1e-9) {
      if (cur.phase === 'solid') { const need = m * CI * (0 - cur.T); if (Q < need) { cur.T += Q / (m * CI); Q = 0; } else { Q -= need; cur.T = 0; cur.phase = 'melt'; cur.tMelt0 = S.simT; cur.E0 = cur.E; if (!cur.fired.melting) { cur.fired.melting = 1; ctx.emit('melting', {}); } } }
      else if (cur.phase === 'melt') { const need = (m - cur.melted) * LF; if (Q < need) { cur.melted += Q / LF; Q = 0; } else { Q -= need; cur.melted = m; cur.phase = 'liquid'; cur.tMelt1 = S.simT; meltedInfo(); } }
      else if (cur.phase === 'liquid') { const need = m * CW * (100 - cur.T); if (Q < need) { cur.T += Q / (m * CW); Q = 0; } else { Q -= need; cur.T = 100; cur.phase = 'boil'; if (!cur.fired.boil) { cur.fired.boil = 1; ctx.sfx('pop'); ctx.emit('boil', {}); } } }
      else if (cur.phase === 'boil') { const need = (m - cur.boiled) * LV; if (Q < need) { cur.boiled += Q / LV; Q = 0; } else { Q -= need; cur.boiled = m; cur.phase = 'steam'; ctx.emit('boiled', {}); } }
      else { cur.T = Math.min(130, cur.T + Q / (m * CS)); Q = 0; }
    }
  }
  function meltedInfo() {
    const Em = cur.E - (cur.E0 ?? 0), Lm = Em / p.mc;
    ctx.emit('melted', { L: Lm });
    ctx.info('melt', () => L({ zh: '🧊 量度結果', en: '🧊 Measurement' }), () => L({
      zh: `溶冰用了 ${f(Em / 1000, 1)} kJ，計出熔解比潛熱 ≈ ${f(Lm / 1e5, 2)} × 10⁵ J/kg（書本：3.34 × 10⁵）。`,
      en: `Melting used ${f(Em / 1000, 1)} kJ, so the specific latent heat of fusion ≈ ${f(Lm / 1e5, 2)} × 10⁵ J/kg (book value: 3.34 × 10⁵).` }));
  }
  // 公式預測的「溫度–能量」線（冇熱散失）
  function teData() {
    const xm = H.c.E, ym = H.c.T;
    let emax = 0; for (const e of xm) if (Number.isFinite(e)) emax = Math.max(emax, e);
    const cut = Math.max(20, emax * 1.1), m = p.mc, pts = [[0, -20]]; let E = 0;
    const seg = (dE, T) => { E += dE / 1000; pts.push([E, T]); };
    seg(m * CI * 20, 0); seg(m * LF, 0); seg(m * CW * 100, 100); seg(m * LV, 100); seg(m * CS * 30, 130);
    const tx = [], ty = [];
    for (let i = 0; i < pts.length; i++) {
      const [x, y] = pts[i];
      if (x <= cut) { tx.push(x); ty.push(y); continue; }
      const [xa, ya] = pts[i - 1]; tx.push(cut); ty.push(ya + ((y - ya) * (cut - xa)) / (x - xa)); break;
    }
    return { x: xm, c: { T: ym, Tf: ty }, xk: { Tf: tx } };
  }
  function mbData() {
    const x = [], now = [], ref = [], TK = S.T + 273.15;
    for (let v = 0; v <= 1600; v += 20) { x.push(v); now.push(mbPct(v, TK)); ref.push(mbPct(v, 293.15)); }
    return { x, c: { now, ref } };
  }
  function rhoData() {
    const fl = [], fs = [], sk = [];
    for (const [rho, sub, floats_, salt] of Object.values(rhoPts)) (!floats_ ? sk : salt ? fs : fl).push([Math.min(rho, 2.95), sub]);
    return { pts: { fl, fs, sk } };
  }
  function stepTransfer(dt) {
    rods.forEach((r, ri) => {
      const a = ROD[ri].a, T = r.T, n = T.length;
      if (p.flame) T[0] = 300; else T[0] += (20 - T[0]) * 0.5 * dt;
      const K = a * KROD, sub = Math.max(1, Math.ceil((K * dt) / 0.45)), h = dt / sub; // 顯式差分要細步長先穩定
      for (let s = 0; s < sub; s++) {
        const nT = T.slice();
        for (let i = 1; i < n; i++) { const right = i < n - 1 ? T[i + 1] : T[i]; nT[i] = T[i] + (K * (T[i - 1] - 2 * T[i] + right) - 0.02 * (T[i] - 20)) * h; }
        for (let i = 1; i < n; i++) T[i] = nT[i];
      }
      r.pins.forEach((pin, k) => {
        const idx = Math.round((PIN_AT[k] / ROD_LEN) * NCELL);
        if (!pin.down && T[Math.min(idx, n - 1)] > 60) { pin.down = true; pin.vy = 0; ctx.sfx('tick'); ctx.emit('pin', { rod: ROD[ri].k, k }); }
      });
    });
    // 輻射：吸收 P吸 = a × P燈；散失 = (對流 + 輻射放出) × (T − 室溫)；啞黑色放出輻射都多啲
    const I = p.lamp ? 40 : 0, HC = 0.35, HR = 0.35, CAN_C = 17;
    if (p.lamp) cans.lampT += dt; else cans.lampT = 0;
    const aB = V.cans[0].ab, aS = V.cans[1].ab;
    cans.Pib = aB * I; cans.Pob = (HC + aB * HR) * (cans.Tb - 20);
    cans.Pis = aS * I; cans.Pos = (HC + aS * HR) * (cans.Ts - 20);
    cans.rb = (cans.Pib - cans.Pob) / CAN_C; cans.rs = (cans.Pis - cans.Pos) / CAN_C;
    cans.Tb += cans.rb * dt; cans.Ts += cans.rs * dt;
    if (p.lamp && cans.Tb - cans.Ts >= 5) emitOnce('canLead');
    if (p.lamp && cans.lampT > 3 && Math.abs(cans.rb) < 0.03 && Math.abs(cans.rs) < 0.03) emitOnce('canSteady');
  }
  const evRate = (wind, heat, wide, cover) => 0.18 * (wide ? 2.2 : 1) * (1 + (wind ? 1.6 : 0)) * Math.exp(((heat ? 55 : 20) - 20) / 18) * (cover ? 0.12 : 1);
  function stepEvap(dt) {
    dishes.A = Math.max(0, dishes.A - evRate(false, false, false, false) * dt);
    dishes.B = Math.max(0, dishes.B - evRate(p.windB, p.heatB, p.wideB, p.coverB) * dt);
    if (Math.abs(dishes.A - dishes.B) >= 2) emitOnce('evapLead');
  }
  const rhoL = () => (p.salt ? 1.2 : 1.0);
  function stepFloat(dt) {
    for (const [k, s] of Object.entries(floats)) {
      const o = FLO[k], h = V.fl[k].h, rho = k === 'custom' ? p.dens : o.rho;
      const bottom = s.y, sub = clamp((V.waterTop - bottom) / h, 0, 1);
      let a = 9.8 * (sub * rhoL() / rho - 1) - (sub > 0 ? 3.5 : 0.2) * s.v;
      s.v += a * dt; s.y += s.v * dt;
      if (s.y <= V.tankY0 + 0.02) { s.y = V.tankY0 + 0.02; s.v = Math.max(0, s.v); }
      if (!s.splashed && sub > 0) { s.splashed = true; ctx.sfx('splash'); }
      const settled = Math.abs(s.v) < 0.02 && s.age > 1.2;
      s.age += dt;
      const floatsNow = rhoL() > rho;
      if (settled) rhoPts[k + (p.salt ? '~salt' : '')] = [rho, +sub.toFixed(3), floatsNow, p.salt];
      if (settled && s.state !== (floatsNow ? 'float' : 'sink')) {
        s.state = floatsNow ? 'float' : 'sink'; ctx.emit(s.state, { key: k });
        if (Object.values(floats).every((q) => q.state)) ctx.emit('settled', {}); // 「估一估」：全部物件都停定咗，結果清楚
      }
    }
  }
  function dropObj(k) {
    if (!FLO[k]) return;
    floats[k] = { y: V.waterTop + 1.0, v: 0, age: 0, state: null, splashed: false };
    V.fl[k].g.visible = true; ctx.sfx('click'); ctx.emit('drop', { key: k });
  }

  /* ---------------- 取樣 / 重設 ---------------- */
  function sample() {
    const m = p.mode, tr = m === 'transfer', ev = m === 'evap';
    H.push(S.simT, { T: m === 'beaker' ? S.T : m === 'curve' ? cur.T : NaN, E: m === 'curve' ? cur.E / 1000 : NaN,
      Tb: tr ? cans.Tb : NaN, Ts: tr ? cans.Ts : NaN, Pib: tr ? cans.Pib : NaN, Pob: tr ? cans.Pob : NaN, Pis: tr ? cans.Pis : NaN, Pos: tr ? cans.Pos : NaN,
      wA: ev ? dishes.A : NaN, wB: ev ? dishes.B : NaN, EA: ev ? (50 - dishes.A) * 2.26 : NaN, EB: ev ? (50 - dishes.B) * 2.26 : NaN });
  }
  function resetState() {
    S.T = 20; S.E = 0; S.simT = 0; S.real = 0; S.lastSample = -1; S.fl = {};
    Object.assign(cur, { T: -20, phase: 'solid', melted: 0, boiled: 0, tMelt0: null, tMelt1: null, E: 0, E0: 0, fired: {} });
    rods.forEach((r) => { r.T.fill(20); r.pins.forEach((pin) => { pin.down = false; pin.y = 0; pin.vy = 0; }); });
    Object.assign(cans, { Tb: 20, Ts: 20, rb: 0, rs: 0, Pib: 0, Pob: 0, Pis: 0, Pos: 0, lampT: 0 }); dishes.A = dishes.B = 50;
    for (const k of Object.keys(floats)) { delete floats[k]; V.fl[k].g.visible = false; }
    kePts.length = 0; etPts = []; etRun.cur = null;
    H.reset();
  }
  function apply(s = {}) {
    Object.assign(p, DEF);
    for (const k of Object.keys(DEF)) if (s[k] !== undefined) p[k] = s[k];
    ghost = null; etPrev = []; etRun.prev = null; resetState(); sync();
  }
  function sync() { for (const k of Object.keys(G)) G[k].visible = p.mode === k; V.magG.visible = p.mode !== 'float'; MAG.snap = true; }
  function again() {
    if (H.n > 5) ghost = { t: H.t.slice(), c: Object.fromEntries(Object.entries(H.c).map(([k, v]) => [k, v.slice()])) };
    if (etPts.length) { etPrev = etPts; etRun.prev = etRun.cur; }
    resetState(); p.heat = false; p.flame = false; p.lamp = false;
  }
  function setParam(k, v) {
    p[k] = v;
    if (k === 'liquid' || k === 'm') { if (p.mode === 'beaker' && !p.heat) { S.T = 20; } }
    if (k === 'mode') sync();
  }
  /* ---------------- 近看（鏡頭） ---------------- */
  // target＝想睇嘅中心（core 會自動預留下面對話框／圖表的位置）
  const VIEWS = {
    mag: () => { const c = magGoal(); return { pos: [c[0] + 0.15, c[1] + 0.1, c[2] + 4.2], target: [c[0], c[1] - 0.2, c[2]] }; },
    rods: () => ({ pos: [-2.3, 3.1, 5.7], target: [-2.3, 2.4, 0.5] }),
    conv: () => ({ pos: [-0.1, 2.95, 5.4], target: [-0.1, 2.25, 0.5] }),
    cans: () => ({ pos: [2.8, 3.2, 5.8], target: [2.8, 2.5, 0.3] })
  };
  function zoom(key) {
    if (!key || ctx.focusKey() === key) return ctx.focus(null);
    if (key !== 'mag' && p.mode !== 'transfer') return;
    if (key === 'rods') p.mag = 'cond'; else if (key === 'conv') p.mag = 'conv'; else if (key === 'cans') p.mag = 'rad';
    ctx.focus(VIEWS[key](), key);
  }
  function act(a) { if (a[0] === 'drop') dropObj(a[1]); else if (a[0] === 'zoom') zoom(a[1]); }

  /* ================== 每幀 ================== */
  function update(dt, time) {
    S.real += dt;
    const sp = p.mode === 'float' ? 1 : p.speed, sdt = dt * sp;
    const n = Math.max(1, Math.ceil(sdt / 0.05));
    const every = Math.max(0.1, sp / 30, p.mode === 'curve' ? 0.5 : 0);
    for (let i = 0; i < n; i++) {
      const h = sdt / n;
      if (p.mode === 'beaker') stepBeaker(h); else if (p.mode === 'curve') stepCurve(h); else if (p.mode === 'transfer') stepTransfer(h); else if (p.mode === 'evap') stepEvap(h);
      S.simT += h;
      if (S.simT - S.lastSample >= every) { S.lastSample = S.simT; sample(); }
    }
    if (p.mode === 'float') { const m = Math.max(1, Math.ceil(dt / 0.004)); for (let i = 0; i < m; i++) stepFloat(dt / m); }
    // 畫面
    const beakerVis = (o, T, level, col, heating, boiling) => {
      o.plate.material.emissiveIntensity = heating ? 0.8 + Math.sin(time * 6) * 0.1 : 0;
      o.liq.scale.y = Math.max(0.01, level); o.liq.position.y = o.by + 0.02 + level / 2; o.liq.material.color.set(col); o.liq.visible = level > 0.012;
      const hcol = clamp((T + 20) / 140, 0.01, 1); o.col.scale.y = hcol * 1.45; o.col.position.y = o.by + 0.2 + (hcol * 1.45) / 2;
      o.bub.forEach((b) => { b.visible = boiling && level > 0.05; if (b.visible) { b.userData.s = (b.userData.s + dt * 0.8) % 1; b.position.set(o.x + Math.sin(b.userData.s * 40 + b.id) * 0.3, o.by + 0.05 + b.userData.s * level, Math.cos(b.userData.s * 30 + b.id) * 0.25); } });
      o.steam.forEach((s) => { s.visible = boiling; if (s.visible) { s.userData.s = (s.userData.s + dt * 0.4) % 1; s.position.set(o.x + Math.sin(s.userData.s * 9 + s.id) * 0.25, o.by + 1.25 + s.userData.s * 1.3, Math.cos(s.id) * 0.2); s.material.opacity = 0.45 * (1 - s.userData.s); s.scale.setScalar(0.6 + s.userData.s); } });
    };
    const mo = { frac: { s: 0, l: 1 }, escape: 0 };
    if (p.mode === 'beaker') {
      beakerVis(V.b, S.T, 0.25 + p.m * 0.75, LIQ[p.liquid].color, p.heat, p.liquid === 'water' && S.T >= 99.9);
    } else if (p.mode === 'curve') {
      const iceFrac = cur.phase === 'solid' ? 1 : cur.phase === 'melt' ? 1 - cur.melted / p.mc : 0;
      const waterFrac = cur.phase === 'melt' ? cur.melted / p.mc : cur.phase === 'liquid' ? 1 : cur.phase === 'boil' ? 1 - cur.boiled / p.mc : 0;
      V.c.ice.visible = iceFrac > 0.01; V.c.ice.scale.setScalar(Math.max(0.05, Math.cbrt(iceFrac)));
      beakerVis(V.c, cur.T, waterFrac * 0.45, 0x60a5fa, p.heat, cur.phase === 'boil');
      mo.frac = { s: iceFrac, l: waterFrac };
    } else if (p.mode === 'transfer') {
      V.flame.visible = p.flame; V.flame.scale.y = 1 + Math.sin(time * 18) * 0.12;
      V.flameArrow.visible = p.flame;
      rods.forEach((r, ri) => {
        V.rodSeg[ri].forEach((s, i) => (s.material.emissiveIntensity = clamp((r.T[i] - 40) / 300, 0, 0.9)));
        r.pins.forEach((pin, k) => {
          if (pin.down && pin.y > -0.61) { pin.vy -= 6 * dt; pin.y = Math.max(-0.61, pin.y + pin.vy * dt); } // 用真實時間跌落枱面
          V.pins[ri][k].position.y = TABLE + 0.66 + pin.y;
        });
        // 熱傳導箭咀：由加熱端指去「熱傳到嘅最遠位置」
        let fi = 0; for (let k = 1; k < NCELL; k++) if (r.T[k] > 32) fi = k;
        const A = V.rodArrow[ri], x0 = ROD_X0 + 0.05, xf = ROD_X0 + (fi + 1) * (ROD_LEN / NCELL), y = TABLE + 0.87, on = xf - x0 > 0.22;
        if (on) { A.shaft.set(x0, y, A.z, xf - 0.1, y, A.z); A.head.position.set(xf - 0.03, y, A.z); const u = (time * 0.5 + ri * 0.27) % 1; A.dot.position.set(x0 + u * (xf - 0.12 - x0), y, A.z); }
        A.shaft.visible = A.head.visible = A.dot.visible = on;
      });
      V.lamp.material.emissiveIntensity = p.lamp ? 1.2 : 0;
      V.radArrows.visible = p.lamp;
      if (p.lamp) V.radDots.forEach((d) => d.position.copy(d.userData.c.getPointAt((time * 0.45 + d.userData.o) % 1)));
      V.conv.plate.material.emissiveIntensity = p.flame ? 0.8 : 0;
      V.convArrows.visible = p.flame;
      V.conv.liq.scale.y = 0.75; V.conv.liq.position.y = V.conv.by + 0.395;
      V.conv.dye.forEach((d) => {
        if (p.flame) d.userData.s = (d.userData.s + dt * 0.18) % 1;
        const s = d.userData.s, side = (d.id % 2 ? 1 : -1), u = s * 4;
        let x, y, hot;
        if (u < 1) { x = 0; y = 0.08 + u * 0.62; hot = 1; } else if (u < 2) { x = side * (u - 1) * 0.38; y = 0.7; hot = 2 - u; } else if (u < 3) { x = side * 0.38; y = 0.7 - (u - 2) * 0.62; hot = 0; } else { x = side * 0.38 * (1 - (u - 3)); y = 0.08; hot = u - 3; }
        d.position.set(V.conv.x + x, V.conv.by + y, (d.id % 3 - 1) * 0.12);
        if (p.flame) d.material.color.lerpColors(CB, CR, hot); else d.material.color.set(0x7c3aed);
      });
    } else if (p.mode === 'evap') {
      [['A', false, false, false, false], ['B', p.windB, p.heatB, p.wideB, p.coverB]].forEach(([k, w, h, wd], i) => {
        const d = V.dish[i], lv = dishes[k] / 50;
        d.dish.scale.set(wd ? 1.45 : 1, 1, wd ? 1.45 : 1); d.water.scale.set(wd ? 1.45 : 1, Math.max(0.02, lv), wd ? 1.45 : 1); d.water.visible = lv > 0.01;
      });
      V.fanB.visible = p.windB; if (p.windB) V.fanBl.rotation.x += dt * 25;
      V.heatB.visible = p.heatB; V.coverB.visible = p.coverB;
      mo.escape = evRate(p.windB, p.heatB, p.wideB, p.coverB) * 4;
    } else {
      V.water.material.color.set(p.salt ? 0x38bdf8 : 0x60a5fa);
      for (const [k, s] of Object.entries(floats)) V.fl[k].g.position.set(SLOT[k], s.y, 0);
    }
    if (V.magG.visible) updMag(dt, time, mo); else { V.magLine.visible = false; V.magDot.visible = false; }
  }
  function runName(r, now) {
    if (!r) return now ? sc('今次', 'This run') : sc('上一次', 'Last run');
    const liq = LIQ[r.liq];
    return now ? sc(`今次：${liq.zh} ${r.m} kg`, `This run: ${liq.en.toLowerCase()} ${r.m} kg`) : sc(`上一次：${liq.zh} ${r.m} kg`, `Last run: ${liq.en.toLowerCase()} ${r.m} kg`);
  }
  function labels() {
    const tl = (T) => `${f(T, 1)} °C`, adv = ctx.adv();
    let bt = tl(S.T) + `<small>${L({ zh: '供給能量', en: 'energy in' })} ${f(S.E / 1000, 1)} kJ</small>`;
    if (adv && S.T - 20 >= 2) bt += `<small>c ≈ E ÷ (mΔT) ≈ ${Math.round(S.E / (p.m * (S.T - 20)) / 10) * 10} J/kg°C</small>`;
    V.b.tag.el.innerHTML = bt;
    const ph = { solid: { zh: '固體', en: 'solid' }, melt: { zh: '溶化中', en: 'melting' }, liquid: { zh: '液體', en: 'liquid' }, boil: { zh: '沸騰中', en: 'boiling' }, steam: { zh: '氣體', en: 'gas' } };
    let ct = tl(cur.T) + `<small>${L(ph[cur.phase])} · ${f(cur.E / 1000, 1)} kJ</small>`;
    if (adv) ct += `<small>${L({ zh: '已溶', en: 'melted' })} ${f(cur.melted * 1000, 0)} g · ${L({ zh: '已汽化', en: 'boiled off' })} ${f(cur.boiled * 1000, 0)} g</small>`;
    V.c.tag.el.innerHTML = ct;
    V.conv.tag.o.visible = false;
    V.rodTags.forEach((t, i) => (t.el.textContent = L(ROD[i])));
    const absorb = p.lamp ? [sc('大部分吸收', 'mostly absorbed'), sc('大部分反射', 'mostly reflected')] : [null, null];
    V.cans[0].t.el.innerHTML = `${tl(cans.Tb)}<small>${L({ zh: '啞黑色', en: 'dull black' })}${absorb[0] ? ' · ' + L(absorb[0]) : ''}</small>`;
    V.cans[1].t.el.innerHTML = `${tl(cans.Ts)}<small>${L({ zh: '光亮銀色', en: 'shiny silver' })}${absorb[1] ? ' · ' + L(absorb[1]) : ''}</small>`;
    V.dish.forEach((d, i) => { d.t.el.innerHTML = `${f(i ? dishes.B : dishes.A, 1)} g`; d.nm.el.textContent = L({ zh: '碟 ' + d.k, en: 'Dish ' + d.k }); });
    for (const [k, o] of Object.entries(FLO)) { const rho = k === 'custom' ? p.dens : o.rho, s = floats[k]; V.fl[k].t.el.innerHTML = `${L(o)} · ${rho} g/cm³` + (s && s.state ? `<small>${s.state === 'float' ? L({ zh: '浮 🛟', en: 'floats 🛟' }) : L({ zh: '沉 ⚓', en: 'sinks ⚓' })}</small>` : ''); }
    // 放大鏡標籤
    const rod = ROD[p.magRod], metal = rod.k !== 'gl';
    const magMsg = {
      beaker: [sc('🔍 水的粒子：紅＝快，藍＝慢', '🔍 Water particles: red = fast, blue = slow'), adv ? sc(`平均速率 ≈ ${Math.round(vrms(S.T + 273.15))} m/s（動畫放大了快慢差別）`, `average speed ≈ ${Math.round(vrms(S.T + 273.15))} m/s (the animation exaggerates the difference)`) : null],
      curve: [sc('🔍 粒子：藍＝固體，淺藍＝液體，橙＝氣體', '🔍 Particles: blue = solid, light blue = liquid, orange = gas'), null],
      evap: [sc('🔍 最快的粒子（紅）飛出水面', '🔍 The fastest (red) particles escape'), null],
      cond: [sc(`🔍 ${rod.zh}棒的粒子`, `🔍 ${rod.en} rod particles`), metal ? sc('近火（左）震得最厲害 · 黃點＝自由電子', 'hot end (left) jiggles most · yellow = free electrons') : sc('近火（左）震得最厲害 · 沒有自由電子', 'hot end (left) jiggles most · no free electrons')],
      conv: [sc('🔍 水的粒子', '🔍 Water particles'), p.flame ? sc('熱水（紅）上升，冷水（藍）下沉', 'warm (red) rises, cool (blue) sinks') : sc('開火就會看到對流', 'turn on the flame to see convection')],
      rad: [sc('🔍 紅外線打在罐的表面', '🔍 Infra-red hitting the cans'), p.lamp ? sc('黑色吸收，光亮反射', 'black absorbs, shiny reflects') : sc('開燈就會看到紅外線', 'switch on the lamp to see the infra-red')]
    }[magKey()] || [sc('🔍', '🔍'), null];
    V.magTag.el.innerHTML = L(magMsg[0]) + (magMsg[1] ? `<small>${L(magMsg[1])}</small>` : '');
    V.magPl[0].t.el.textContent = L({ zh: '啞黑色', en: 'dull black' }); V.magPl[1].t.el.textContent = L({ zh: '光亮銀色', en: 'shiny silver' });
    // 進階圖表：系列名稱跟住今次／上一次用咩液體
    GR.ET.series[0][1] = runName(etRun.cur, true); GR.ET.series[1][1] = runName(etRun.prev, false);
  }
  function tap(ray) {
    if (p.mode === 'float') {
      for (const [k, o] of Object.entries(FLO)) if (V.fl[k].g.visible && ray.intersectObject(V.fl[k].g, true).length) {
        const rho = k === 'custom' ? p.dens : o.rho;
        ctx.info('fl' + k, () => L(o), () => L({ zh: `密度 ${rho} g/cm³，液體密度 ${rhoL()} g/cm³，所以會${rho < rhoL() ? '浮' : '沉'}。`, en: `Density ${rho} g/cm³ vs liquid ${rhoL()} g/cm³, so it ${rho < rhoL() ? 'floats' : 'sinks'}.` })); return true;
      }
    }
    if (V.magG.visible && ray.intersectObject(V.magBall, false).length) {
      zoom('mag');
      ctx.info('mag', () => L({ zh: '粒子放大鏡', en: 'Particle magnifier' }), () => L({ zh: '所有物質都由不停郁動的粒子組成。溫度越高，粒子平均郁得越快。固體粒子只在原位震動，液體粒子可以互相滑過，氣體粒子到處亂飛。動畫把快慢的差別放大了，方便觀察。再按一下放大鏡就會返回全景。', en: 'All matter is made of particles that never stop moving. The hotter it is, the faster they move on average. Solid particles jiggle in place, liquid particles slide past each other, and gas particles fly everywhere. The animation exaggerates the speed differences so they are easy to see. Tap the magnifier again to go back.' })); return true;
    }
    if (p.mode === 'transfer') {
      const segHit = ray.intersectObjects(V.rodSeg.flat(), false)[0];
      if (segHit || ray.intersectObject(V.rodHit, false).length) {
        if (segHit) p.magRod = segHit.object.userData.rod;
        if (ctx.focusKey() !== 'rods') zoom('rods'); else p.mag = 'cond';
        const r = ROD[p.magRod];
        ctx.info('rod' + r.k, () => L({ zh: '🔥 傳導：' + r.zh + '棒', en: '🔥 Conduction: ' + r.en.toLowerCase() + ' rod' }), () => L({ zh: `熱由加熱的一端，經粒子一個傳一個向另一端傳去，橙色箭咀顯示熱已傳到哪裏。銅、鋁、鐵是金屬，有很多自由電子，傳熱快；玻璃沒有自由電子，傳熱很慢。放大鏡現在顯示${r.zh}棒的粒子，按其他棒可以比較。`, en: `Heat passes from the hot end along the rod, particle to particle; the orange arrow shows how far it has got. Copper, aluminium and iron are metals with lots of free electrons, so they conduct quickly; glass has none and conducts slowly. The magnifier now shows the ${r.en.toLowerCase()} rod's particles; tap another rod to compare.` })); return true;
      }
      if (ray.intersectObject(V.convHit, false).length) {
        zoom(ctx.focusKey() === 'conv' ? null : 'conv'); p.mag = 'conv';
        ctx.info('conv', () => L({ zh: '💧 對流', en: '💧 Convection' }), () => L({ zh: '杯底的水受熱膨脹，密度變小而上升（紅色箭咀）；上面較冷的水密度較大而下沉（藍色箭咀），形成循環。放大鏡顯示水粒子的移動路徑。', en: 'Water at the bottom warms, expands, becomes less dense and rises (red arrows); cooler water at the top is denser and sinks (blue arrows), making a loop. The magnifier shows the path of the water particles.' })); return true;
      }
      if (ray.intersectObject(V.radHit, false).length) {
        zoom(ctx.focusKey() === 'cans' ? null : 'cans'); p.mag = 'rad';
        ctx.info('rad', () => L({ zh: '☀️ 輻射', en: '☀️ Radiation' }), () => L({ zh: '紅外線燈的能量以輻射形式傳到罐子，不需要任何物質。啞黑色表面吸收大部分紅外線；光亮銀色表面反射大部分紅外線，所以升溫較慢。', en: 'Energy from the infra-red lamp reaches the cans as radiation, with nothing in between. The dull black surface absorbs most of the infra-red; the shiny silver surface reflects most of it, so it warms more slowly.' })); return true;
      }
    }
    return false;
  }
  function screenPos(a) {
    if (a[0] !== 'drop' || !FLO[a[1]]) return null;
    const v = new THREE.Vector3(SLOT[a[1]], V.waterTop + 1.0, 0).project(ctx.camera);
    return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight };
  }
  const fitSlope = (pts) => { let a = 0, b = 0; pts.forEach(([x, y]) => { a += x * y; b += x * x; }); return b ? a / b : NaN; };
  function describeGraph(id) {
    const z = ctx.lang() === 'zh';
    if (id === 'T') return z ? '呢個係溫度對時間圖。條線向上斜代表溫度上升；條線變平，代表溫度唔變，可能係物態改變緊，或者冷熱達到平衡。'
      : 'This is a temperature–time graph. A rising line means the temperature is going up; a flat line means it isn’t changing, perhaps because the state is changing or heat in equals heat out.';
    if (id === 'TT') return z ? `紅線係啞黑色罐，藍線係光亮銀色罐。黑色罐而家 ${f(cans.Tb, 1)} 度，銀色罐 ${f(cans.Ts, 1)} 度。條線變平，即係吸收同散失一樣多。` : `Red is the dull black can and blue is the shiny can. The black can is at ${f(cans.Tb, 1)} degrees and the shiny can at ${f(cans.Ts, 1)} degrees. When a line goes flat, heat in equals heat out.`;
    if (id === 'mb') { const v = Math.round(vrms(S.T + 273.15)); return z ? `呢幅係水粒子嘅速率分佈。紅線係而家，藍色虛線係二十度嗰陣。水越熱，成座山就向右移，即係快嘅粒子多咗。而家平均速率大約 ${v} 米每秒。` : `This shows how the water particles' speeds are spread out. Red is now; the blue dashed line is at 20 degrees. As the water warms, the hump moves right: more fast particles. The average speed is now about ${v} metres per second.`; }
    if (id === 'ke') return z ? '橫軸係絕對溫度，直軸係水粒子嘅平均動能。啲點排成一條穿過零開爾文嘅直線，即係平均動能同絕對溫度成正比。零開爾文即係負二百七十三度，粒子差唔多完全唔郁。' : 'Across is absolute temperature, up is the average kinetic energy of the water particles. The points lie on a straight line through zero kelvin, so average kinetic energy is proportional to absolute temperature. Zero kelvin is minus 273 degrees, where particles barely move.';
    if (id === 'ET') { const m = fitSlope(etPts); return z ? `橫軸係升咗幾多度，直軸係電熱器俾咗幾多能量。每組點嘅斜率就係 m 乘 c。${Number.isFinite(m) ? `今次斜率大約 ${f(m, 2)} 千焦耳每度。` : ''}斜率越大，即係升一度要越多能量。` : `Across is the temperature rise, up is the energy from the heater. The slope of each set of points is m times c. ${Number.isFinite(m) ? `This run's slope is about ${f(m, 2)} kilojoules per degree. ` : ''}A steeper slope means more energy for each degree.`; }
    if (id === 'TE') return z ? `橫軸係供給嘅能量，直軸係溫度。實線係量度，虛線係用 E 等於 m c delta T 同 E 等於 m L 計出嚟嘅預測。兩段平線嘅闊度就係 m L：溶冰大約 33 千焦耳，汽化大約 226 千焦耳。${p.loss ? '開咗熱散失，所以實線嘅平線闊過虛線。' : ''}` : `Across is the energy supplied, up is the temperature. The solid line is measured; the dashed line is predicted with E equals m c delta T and E equals m L. The flat parts are m L wide: about 33 kilojoules to melt and 226 to boil. ${p.loss ? 'Heat loss is on, so the measured flat part is wider than the prediction.' : ''}`;
    if (id === 'rod') return z ? '呢幅圖顯示每條棒唔同位置嘅溫度，左邊係加熱嗰端。紅線係銅，熱傳得最遠；黑色虛線係蠟嘅熔點六十度，條線高過虛線嘅地方，蠟粒就會跌落嚟。' : 'This shows the temperature along each rod, with the heated end on the left. Red is copper: heat reaches furthest. The black dashed line is the wax melting point, 60 degrees; wherever a line is above it, the wax drops off.';
    if (id === 'pow') return z ? '實線係罐每秒吸收嘅能量，虛線係每秒散失嘅能量。罐越熱，散失越多；當虛線追到實線，吸收等於散失，溫度就唔再升。' : 'Solid lines show the energy each can absorbs per second; dashed lines show the energy it loses per second. The hotter the can, the more it loses; when the dashed line catches the solid one, heat in equals heat out and the temperature stops rising.';
    if (id === 'evE') return z ? `呢幅圖用 E 等於 m L 計蒸發帶走嘅能量，每蒸發一克水大約帶走二千二百六十焦耳。碟 B 已經帶走 ${f((50 - dishes.B) * 2.26, 1)} 千焦耳。` : `This uses E equals m L to show the energy carried away by evaporation: about 2260 joules for every gram. Dish B has lost ${f((50 - dishes.B) * 2.26, 1)} kilojoules.`;
    if (id === 'rho') return z ? '橫軸係物件密度，直軸係浸咗喺水入面嘅比例。浮嘅物件排成一條直線，斜率係一除以液體密度；密度大過液體嘅就沉落底，比例係一。密度大過三嘅，畫喺最右邊。' : 'Across is the object’s density, up is the fraction under the surface. Floating objects lie on a straight line whose slope is one divided by the liquid density; denser objects sink, so their fraction is one. Anything denser than 3 is drawn at the right edge.';
    return z ? `呢個係剩餘水量對時間圖。條線跌得越快，代表蒸發得越快。碟 A 剩 ${f(dishes.A, 1)} 克，碟 B 剩 ${f(dishes.B, 1)} 克。` : `This graph shows water left over time. The steeper the drop, the faster the evaporation. Dish A has ${f(dishes.A, 1)} g left and dish B ${f(dishes.B, 1)} g.`;
  }

  const btnAgain = { label: { zh: '🔄 重設', en: '🔄 Reset' }, act: ['again'] };
  const zb = (zh, en, k, show) => ({ label: { zh, en }, act: ['zoom', k], show });
  const zoomBtns = [
    zb('🔍 放大鏡近看', '🔍 Magnifier close-up', 'mag', () => p.mode !== 'float' && ctx.focusKey() !== 'mag'),
    zb('🔍 近看傳導', '🔍 Close-up: conduction', 'rods', () => p.mode === 'transfer' && ctx.focusKey() !== 'rods'),
    zb('🔍 近看對流', '🔍 Close-up: convection', 'conv', () => p.mode === 'transfer' && ctx.focusKey() !== 'conv'),
    zb('🔍 近看輻射', '🔍 Close-up: radiation', 'cans', () => p.mode === 'transfer' && ctx.focusKey() !== 'cans'),
    { label: { zh: '↩️ 返回全景', en: '↩️ Back to whole view' }, act: ['zoom', null], show: () => !!ctx.focusKey() }
  ];
  const dropBtns = Object.keys(FLO).map((k) => ({ label: { zh: '⬇️ ' + FLO[k].zh, en: '⬇️ ' + FLO[k].en }, act: ['drop', k] }));
  const cam = { pos: [0.6, 3.6, 8.2], target: [0.6, 1.6, 0] };
  return {
    board: { title: 'Heat · 熱學', lines: ['E = mcΔT', 'E = mL', 'ρ = m/V'],
      info: { zh: '黑板上的公式：E = mcΔT 計升溫需要的能量；E = mL 計物態改變的潛熱；ρ = m/V 是密度。', en: 'Board formulas: E = mcΔT for warming up; E = mL for latent heat; ρ = m/V for density.' } },
    camera: cam, params, graphs, buttons: [...zoomBtns, btnAgain],
    lessons: [
      { id: 'temp', icon: '🌡️', subs: ['1.1'], items: [1, 2, 3, 4, 5, 6], title: { zh: '溫度、熱和內能', en: 'Temperature, heat and internal energy' },
        desc: { zh: '用粒子放大鏡看溫度，認識溫度計和攝氏定點。', en: 'See temperature through a particle magnifier, and meet the thermometer and Celsius scale.' },
        board: BOARD.temp, base: { mode: 'beaker' }, params: ['heat', 'P', 'speed'], graphs: ['T', 'mb', 'ke'], stages: tempStages },
      { id: 'shc', icon: '🍳', subs: ['1.1'], items: [7, 8, 9, 10], title: { zh: '比熱容量', en: 'Specific heat capacity' },
        desc: { zh: '水和油誰升溫快？E = mcΔT 和水的妙用。', en: 'Water or oil: which warms faster? E = mcΔT and why water is useful.' },
        board: BOARD.shc, base: { mode: 'beaker' }, params: ['heat', 'liquid', 'm', 'P', 'speed'], graphs: ['T', 'ET'], stages: shcStages },
      { id: 'transfer', icon: '☀️', subs: ['1.2'], items: [11, 12], title: { zh: '傳導、對流和輻射', en: 'Conduction, convection and radiation' },
        desc: { zh: '金屬棒掉蠟粒、對流循環、黑罐和銀罐比賽。', en: 'Wax drops off metal rods, a convection loop, and a black can vs a shiny can.' },
        board: BOARD.transfer, base: { mode: 'transfer' }, camera: { pos: [0.25, 4.5, 8.0], target: [0.25, 1.45, 0] }, params: ['flame', 'lamp', 'speed'], graphs: ['TT', 'rod', 'pow'], stages: transferStages },
      { id: 'state', icon: '🧊', subs: ['1.3'], items: [13, 14, 15, 16, 17], title: { zh: '物態變化與潛熱', en: 'Changes of state and latent heat' },
        desc: { zh: '冰變水變蒸氣，溫度為甚麼會停？實驗為甚麼有誤差？', en: 'Ice to water to steam: why does the temperature pause, and why do experiments have errors?' },
        board: BOARD.state, base: { mode: 'curve' }, params: ['heat', 'mc', 'P', 'loss', 'speed'], graphs: ['T', 'TE'], stages: stateStages },
      { id: 'evap', icon: '💧', subs: ['1.3'], items: [18, 19, 20], title: { zh: '蒸發與沸騰', en: 'Evaporation and boiling' },
        desc: { zh: '公平測試影響蒸發的因素，蒸發為甚麼會令人變涼。', en: 'Fair-test what affects evaporation, and find out why it cools you down.' },
        board: BOARD.evap, base: { mode: 'evap' }, params: ['windB', 'heatB', 'wideB', 'coverB', 'speed'], graphs: ['mass', 'evE'], stages: evapStages },
      { id: 'float', icon: '🛟', subs: ['2.6'], items: ['P4'], title: { zh: '浮與沉：密度', en: 'Floating and sinking: density' },
        desc: { zh: '大木頭浮、細鐵波沉？鋼船為甚麼不會沉？', en: 'Why does a big log float but a small steel ball sink? Why doesn’t a steel ship sink?' },
        board: BOARD.float, base: { mode: 'float' }, params: ['salt', 'dens'], graphs: ['rho'], buttons: [...dropBtns, btnAgain], camera: { pos: [0, 3.2, 6.6], target: [0, 1.5, 0] }, stages: floatStages }
    ],
    mount, apply, again, act, update, labels, setParam,
    activate: () => { for (const k of Object.keys(rhoPts)) delete rhoPts[k]; },
    getParam: (k) => p[k], hist: () => H, ghost: () => ghost, simTime: () => S.real,
    tap, screenPos, describeGraph
  };
}
