/* =====================================================================
 * 實驗枱：熱學與浮沉台（heat）
 * 單元：🌡️ 溫度與內能（1–6）、🍳 比熱容量（7–10）、☀️ 熱的轉移（11–12）、
 *       🧊 物態變化與潛熱（13–17）、💧 蒸發與沸騰（18–20）、🛟 浮與沉（P4）
 * 模式：beaker / curve / transfer / evap / float
 * 右上方有「粒子放大鏡」：用粒子模型解釋溫度、物態和蒸發
 * ===================================================================== */
export default function create(ctx) {
  const { THREE, kit, root } = ctx;
  const { std, mesh, tag, glass, Hist, C, f } = kit;
  const L = kit.L2(ctx.lang);
  const clamp = THREE.MathUtils.clamp;
  const TABLE = 0.9;

  const LIQ = { water: { c: 4200, bp: 100, color: 0x60a5fa, zh: '水', en: 'Water' }, oil: { c: 2000, bp: 250, color: 0xf59e0b, zh: '食油', en: 'Cooking oil' } };
  const ROD = [{ k: 'cu', zh: '銅', en: 'Copper', a: 1, col: 0xb45309 }, { k: 'al', zh: '鋁', en: 'Aluminium', a: 0.8, col: 0xcbd5e1 }, { k: 'fe', zh: '鐵', en: 'Iron', a: 0.2, col: 0x475569 }, { k: 'gl', zh: '玻璃', en: 'Glass', a: 0.012, col: 0xbae6fd }];
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

  const DEF = { mode: 'beaker', liquid: 'water', m: 0.5, P: 600, heat: false, speed: 10, mc: 0.1, loss: false, flame: false, lamp: false,
    windB: false, heatB: false, wideB: false, coverB: false, salt: false, dens: 1.5 };
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
  const graphs = [
    { id: 'T', tab: { zh: '溫度 T–t', en: 'Temperature T–t' }, y: { zh: '溫度 T (°C)', en: 'temperature T (°C)' }, min: 30, zero: true, span: 1e9, minSpan: 30, series: [['T', { zh: '溫度', en: 'Temperature' }, C.red]] },
    { id: 'TT', tab: { zh: '罐的溫度', en: 'Can temperatures' }, y: { zh: '溫度 T (°C)', en: 'temperature T (°C)' }, min: 30, span: 1e9, minSpan: 30, series: [['Tb', { zh: '啞黑色罐', en: 'Dull black can' }, C.red], ['Ts', { zh: '光亮銀色罐', en: 'Shiny silver can' }, C.blue]] },
    { id: 'mass', tab: { zh: '水的質量', en: 'Water mass' }, y: { zh: '剩餘的水 (g)', en: 'water left (g)' }, min: 50, span: 1e9, minSpan: 30, series: [['wA', { zh: '碟 A（對照）', en: 'Dish A (control)' }, C.blue], ['wB', { zh: '碟 B', en: 'Dish B' }, C.red]] }
  ];
  const ALL = params.map((q) => q.key).filter((k) => k !== 'speed');

  /* ---------------- 狀態 ---------------- */
  const S = { simT: 0, real: 0, lastSample: -1, T: 20, E: 0 };
  const cur = { T: -20, phase: 'solid', melted: 0, boiled: 0, tMelt0: null, tMelt1: null, E: 0, fired: {} };
  const rods = ROD.map(() => ({ T: new Array(24).fill(20), pins: [0, 1, 2, 3].map(() => ({ down: false, y: 0 })) }));
  const cans = { Tb: 20, Ts: 20 };
  const dishes = { A: 50, B: 50 };
  const floats = {}; // key → { y, v, inTank, settledFired }
  const H = new Hist(['T', 'Tb', 'Ts', 'wA', 'wB']);
  let ghost = null;

  /* ================== 教學 ================== */
  const sayCh = (zh, en) => ({ zh, en });
  const tempStages = [
    { id: 't-intro', who: 'chan', title: { zh: '粒子與溫度', en: 'Particles and temperature' },
      say: sayCh('所有嘢都係由好細好細、不停郁動嘅粒子組成。右上角個放大鏡，俾你睇到杯水入面嘅粒子。溫度就係講呢啲粒子平均郁得有幾快。',
        'Everything is made of tiny particles that never stop moving. The magnifier at the top right shows the particles in the water. Temperature tells us how fast these particles move on average.'),
      setup: { mode: 'beaker', heat: false, speed: 10 }, items: [1, 2] },
    { id: 't-heat', who: 'chan', title: { zh: '加熱：估一估', en: 'Heating: predict' },
      say: sayCh('我哋開電熱器，加熱杯水。', "We'll switch on the heater and warm the water."),
      setup: { mode: 'beaker', heat: false, speed: 10 }, lock: ALL, graph: 'T',
      quiz: { q: sayCh('開咗電熱器之後，水入面啲粒子會點？', 'After the heater is switched on, what happens to the particles in the water?'),
        opts: [sayCh('郁得慢咗', 'They slow down'), sayCh('郁得快咗', 'They move faster'), sayCh('冇變', 'No change')], ans: 1,
        run: [['set', 'heat', true]], watch: 4,
        why: sayCh('答案係：郁得快咗！電熱器將能量傳俾水，粒子平均動能增加，郁得更快，溫度就升高。溫度越高，粒子平均郁得越快。',
          'The answer: they move faster! The heater gives energy to the water, so the particles’ average kinetic energy rises and they move faster. That is what a higher temperature means.') },
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
      setup: { mode: 'beaker', heat: false, liquid: 'water', m: 0.5, speed: 12 }, lock: ALL, graph: 'T',
      quiz: { q: sayCh('邊個升溫多啲？', 'Which gets hotter?'), opts: [sayCh('水', 'Water'), sayCh('食油', 'Cooking oil'), sayCh('一樣', 'The same')], ans: 1,
        run: [['set', 'liquid', 'water'], ['set', 'heat', true], ['wait', 4], ['again'], ['set', 'liquid', 'oil'], ['set', 'heat', true], ['wait', 4]], watch: 0.3,
        why: sayCh('答案係：食油！睇吓溫度–時間圖，實線係油，虛線係水。水要用多一倍嘅能量先升到同樣溫度，因為水嘅比熱容量好大。',
          'The answer: the oil! On the temperature–time graph, the solid line is oil and the dashed line is water. Water needs about twice the energy for the same rise, because its specific heat capacity is large.') },
      chain: [sayCh('能量一樣', 'Same energy'), sayCh('水的比熱容量較大', "Water's specific heat capacity is bigger"), sayCh('水升溫較少', 'Water warms less')], items: [7] },
    { id: 'c-formula', who: 'chan', title: { zh: 'E = mcΔT', en: 'E = mcΔT' },
      say: sayCh('比熱容量就好似一樣嘢「食熱嘅胃口」：每 1 kg 升 1 °C 要食幾多能量。水嘅胃口好大，要 4200 焦耳；油細啲，大約 2000 焦耳。整件物件升 1 °C 要幾多能量，就叫熱容量。',
        'Specific heat capacity is like an appetite for heat: how much energy 1 kg needs to warm by 1 °C. Water has a big appetite, 4200 joules; oil about 2000. The energy a whole object needs per 1 °C is its heat capacity.'),
      adv: sayCh('需要的能量 E = mcΔT；熱容量 C = mc。', 'Energy needed E = mcΔT; heat capacity C = mc.'),
      chain: [sayCh('質量 m', 'Mass m'), sayCh('比熱容量 c', 'Specific heat capacity c'), sayCh('升溫 ΔT', 'Temperature rise ΔT'), sayCh('能量 E = mcΔT', 'Energy E = mcΔT')], items: [7, 8, 9] },
    { id: 'c-mass', who: 'ming', title: { zh: '多一倍水：估一估', en: 'Twice the water: predict' },
      say: sayCh('如果水嘅質量加倍，用同一個電熱器加熱同樣時間呢？', 'What if we double the mass of water and heat it for the same time?'),
      cond: [sayCh('只改變：水的質量（0.5 → 1 kg）', 'Only change: water mass (0.5 → 1 kg)')],
      setup: { mode: 'beaker', heat: false, liquid: 'water', m: 0.5, speed: 12 }, lock: ALL, graph: 'T',
      quiz: { q: sayCh('升溫會點？', 'How much does it warm up?'), opts: [sayCh('一樣', 'The same'), sayCh('只有一半咁多', 'Only half as much'), sayCh('兩倍', 'Twice as much')], ans: 1,
        run: [['set', 'm', 0.5], ['set', 'heat', true], ['wait', 4], ['again'], ['set', 'm', 1], ['set', 'heat', true], ['wait', 4]], watch: 0.3,
        why: sayCh('答案係：只有一半！同樣嘅能量分俾多一倍嘅粒子，每粒分到嘅少咗一半，所以升溫只有一半。', 'The answer: only half! The same energy is shared between twice as many particles, so each gets half as much and the rise is halved.') },
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
      say: sayCh('熱有三種走法：傳導，好似排隊傳波，粒子一個傳一個；對流，好似搬屋，熱嘅液體或氣體自己郁去第二度；輻射，好似太陽光，唔使任何物質都可以直接飛過嚟。',
        'Heat travels in three ways. Conduction is like passing a ball down a line: particle to particle. Convection is like moving house: the warm liquid or gas itself moves. Radiation is like sunlight: it can fly across without anything in between.'),
      setup: { mode: 'transfer', flame: false, lamp: false, speed: 6 }, items: [11] },
    { id: 'tr-cond', who: 'chan', title: { zh: '傳導：估一估', en: 'Conduction: predict' },
      say: sayCh('四條棒，一端一齊加熱，每條棒下面黐住蠟粒，熱到就會跌落嚟。', 'Four rods are heated at one end together. Wax beads stuck underneath drop off when they get hot.'),
      setup: { mode: 'transfer', flame: false, lamp: false, speed: 6 }, lock: ALL,
      quiz: { q: sayCh('邊條棒上面嘅蠟粒最快跌落嚟？', 'On which rod do the wax beads drop first?'), opts: [sayCh('銅', 'Copper'), sayCh('鐵', 'Iron'), sayCh('玻璃', 'Glass')], ans: 0,
        run: [['set', 'flame', true]], watch: 6,
        why: sayCh('答案係：銅！金屬入面有好多可以自由郁動嘅電子，傳熱好快，叫良導體。玻璃傳熱好慢，叫不良導體。',
          'The answer: copper! Metals have lots of free electrons that pass heat along quickly, so they are good conductors. Glass passes heat slowly: a poor conductor.') },
      chain: [sayCh('金屬有自由電子', 'Metals have free electrons'), sayCh('傳熱快', 'Heat travels fast'), sayCh('蠟粒先跌', 'Wax drops first')], items: [11] },
    { id: 'tr-conv', who: 'ming', title: { zh: '對流', en: 'Convection' },
      say: sayCh('睇吓中間個杯：底部熱咗嘅水會脹，密度變細，就浮上去；上面凍啲嘅水沉落嚟，形成一個循環，叫對流。煲水、冷氣機放喺高處都係利用對流。',
        'Look at the beaker in the middle: warm water at the bottom expands, becomes less dense and rises, while cooler water sinks, making a loop called convection. Boiling water and air conditioners placed high up both use convection.'),
      setup: { mode: 'transfer', flame: true, lamp: false, speed: 6 },
      chain: [sayCh('底部受熱', 'Heated at the bottom'), sayCh('密度變細，上升', 'Less dense, rises'), sayCh('凍水下沉，形成循環', 'Cool water sinks: a loop')], items: [11] },
    { id: 'tr-rad', who: 'chan', title: { zh: '輻射：估一估', en: 'Radiation: predict' },
      say: sayCh('右邊有兩個一樣嘅罐，一個係啞黑色，一個係光亮銀色，用紅外線燈照住。', 'On the right are two identical cans, one dull black and one shiny silver, under an infra-red lamp.'),
      cond: [sayCh('只改變：表面顏色', 'Only change: surface colour')],
      setup: { mode: 'transfer', flame: false, lamp: false, speed: 6 }, lock: ALL, graph: 'TT',
      quiz: { q: sayCh('邊個罐升溫快啲？', 'Which can warms up faster?'), opts: [sayCh('啞黑色', 'Dull black'), sayCh('光亮銀色', 'Shiny silver'), sayCh('一樣', 'The same')], ans: 0,
        run: [['set', 'lamp', true]], watch: 6,
        why: sayCh('答案係：啞黑色！啞黑色表面吸收紅外輻射最好，光亮表面就將大部分反射走。啞黑色表面放出紅外輻射都最好。',
          'The answer: dull black! Dull black surfaces absorb infra-red radiation best, while shiny surfaces reflect most of it away. Dull black surfaces are also the best at giving it off.') },
      chain: [sayCh('啞黑色吸收紅外線', 'Dull black absorbs infra-red'), sayCh('吸收更多能量', 'Takes in more energy'), sayCh('升溫更快', 'Warms faster')], items: [12] },
    { id: 'tr-apply', who: 'chan', title: { zh: '生活中的熱轉移', en: 'Heat transfer in daily life' },
      say: sayCh('保溫瓶用真空擋住傳導同對流，再用光亮內壁反射紅外輻射。', 'A vacuum flask uses a vacuum to stop conduction and convection, and shiny walls to reflect infra-red radiation.'),
      quiz: { q: sayCh('點解夏天著淺色衫會涼啲？', 'Why do light-coloured clothes feel cooler in summer?'),
        opts: [sayCh('淺色會反射多啲紅外輻射', 'Light colours reflect more infra-red radiation'), sayCh('淺色衫比較薄', 'Light clothes are thinner'), sayCh('淺色吸收多啲熱', 'Light colours absorb more heat')], ans: 0,
        why: sayCh('答案係：淺色反射多啲紅外輻射！吸收少啲太陽嘅熱，所以涼啲。', 'The answer: light colours reflect more infra-red radiation, so they absorb less of the Sun’s heat and feel cooler.') },
      items: [11, 12] },
    { id: 'tr-sum', who: 'chan', title: { zh: '總結', en: 'Summary' },
      say: sayCh('熱有三種走法：傳導靠粒子一個傳一個，金屬最好；對流靠液體或氣體自己郁；輻射唔使任何物質，啞黑色表面吸收同放出都最好。',
        'Three ways for heat to travel: conduction passes it particle to particle, best in metals; convection carries it as liquids or gases move; radiation needs nothing at all, and dull black surfaces absorb and give it off best.'),
      chain: [sayCh('傳導', 'Conduction'), sayCh('對流', 'Convection'), sayCh('輻射', 'Radiation')], finish: true }
  ];
  const stateStages = [
    { id: 's-intro', who: 'chan', title: { zh: '冰、水、蒸氣', en: 'Ice, water, steam' },
      say: sayCh('杯入面有 0.1 kg、負 20 度嘅冰。放大鏡入面，固體嘅粒子排得好整齊，只係喺原位震。我哋會一路加熱，睇吓佢點樣變成水，再變成蒸氣。',
        'The beaker holds 0.1 kg of ice at minus 20 degrees. In the magnifier, the particles of a solid sit in neat rows and just jiggle in place. We will keep heating and watch it turn into water, then steam.'),
      setup: { mode: 'curve', heat: false, mc: 0.1, P: 500, loss: false, speed: 25 }, graph: 'T', items: [13] },
    { id: 's-melt', who: 'chan', title: { zh: '溶化：估一估', en: 'Melting: predict' },
      say: sayCh('開電熱器，一路加熱。', 'Switch the heater on and keep heating.'),
      setup: { mode: 'curve', heat: false, mc: 0.1, P: 500, loss: false, speed: 25 }, lock: ALL, graph: 'T',
      quiz: { q: sayCh('冰溶化嗰陣，我哋一直加熱，溫度會點？', 'While the ice is melting and we keep heating, what does the temperature do?'),
        opts: [sayCh('一直升', 'It keeps rising'), sayCh('停喺 0 °C 一段時間', 'It stays at 0 °C for a while'), sayCh('跌落嚟', 'It drops')], ans: 1,
        run: [['set', 'heat', true], ['until', 'melted', 20]], watch: 0.5,
        why: sayCh('答案係：停喺 0 °C！溶化嗰陣，能量用嚟拆開粒子之間嘅連結，唔係用嚟令粒子郁得快，所以溫度唔變。呢啲「收埋咗」嘅能量叫潛熱。',
          'The answer: it stays at 0 °C! While melting, the energy is used to break the bonds between particles, not to speed them up, so the temperature stays the same. This hidden energy is called latent heat.') },
      chain: [sayCh('加熱', 'Heating'), sayCh('能量用來拆開粒子連結', 'Energy breaks particle bonds'), sayCh('溫度不變', 'Temperature stays the same')], items: [13, 14, 15] },
    { id: 's-boil', who: 'ming', title: { zh: '沸騰', en: 'Boiling' },
      say: sayCh('繼續加熱！水升到 100 °C 就會沸騰，溫度又會停一段時間，而且停得仲耐，因為要將粒子完全分開變成氣體。', 'Keep heating! At 100 °C the water boils and the temperature stops again, for even longer, because the particles must be pulled completely apart to become a gas.'),
      task: sayCh('繼續加熱，直至水沸騰', 'Keep heating until the water boils'), graph: 'T',
      goal: { type: 'boil' }, demo: [['set', 'heat', true]], settle: 3, items: [13, 16] },
    { id: 's-compare', who: 'chan', title: { zh: '邊個要多啲能量？', en: 'Which needs more energy?' },
      say: sayCh('睇吓溫度–時間圖，兩段平線一長一短。', 'On the temperature–time graph, the two flat parts are different lengths.'), graph: 'T',
      quiz: { q: sayCh('將 1 kg 冰溶成水，同將 1 kg 水變成蒸氣，邊個要多啲能量？', 'Which needs more energy: melting 1 kg of ice, or turning 1 kg of water into steam?'),
        opts: [sayCh('溶冰', 'Melting the ice'), sayCh('水變蒸氣', 'Turning water into steam'), sayCh('一樣', 'The same')], ans: 1,
        why: sayCh('答案係：水變蒸氣！液體變氣體要將粒子完全分開，所以需要多好多能量，差唔多係溶冰嘅七倍。', 'The answer: turning water into steam! Going from liquid to gas pulls the particles completely apart, which needs far more energy: almost seven times as much as melting.') },
      adv: sayCh('E = mL；熔解比潛熱約 3.34×10⁵ J/kg，汽化比潛熱約 2.26×10⁶ J/kg。', 'E = mL; specific latent heat of fusion ≈ 3.34×10⁵ J/kg, of vaporization ≈ 2.26×10⁶ J/kg.'), items: [15, 16] },
    { id: 's-error', who: 'chan', title: { zh: '實驗誤差', en: 'Experimental error' },
      say: sayCh('真實實驗入面，電熱器有啲熱會散失去空氣。我哋打開「熱散失」，再量一次溶冰需要嘅能量。', "In a real experiment, some of the heater’s heat escapes into the air. Let’s turn on heat loss and measure the energy to melt the ice again."),
      setup: { mode: 'curve', heat: false, mc: 0.1, P: 500, loss: true, speed: 25 }, lock: ALL, graph: 'T',
      quiz: { q: sayCh('我哋計出嚟嘅熔解比潛熱，會比書本數值大定細？點解？', 'Will our measured specific latent heat of fusion be bigger or smaller than the book value, and why?'),
        opts: [sayCh('大啲，因為有啲熱散失咗去空氣，冇俾冰吸收', 'Bigger, because some heat escaped to the air instead of the ice'), sayCh('細啲，因為冰太凍', 'Smaller, because the ice was too cold'), sayCh('一樣，實驗一定準', 'The same; experiments are always exact')], ans: 0,
        run: [['set', 'heat', true], ['until', 'melted', 20]], watch: 0.6,
        why: sayCh('答案係：大啲！我哋用電熱器俾出嘅能量去計，但有部分能量散失咗，冇用嚟溶冰，所以計出嚟偏大。可以加蓋、用隔熱物料包住，減少誤差。',
          'The answer: bigger! We calculate using all the energy the heater gave out, but some escaped and never melted the ice, so our answer comes out too big. A lid and insulation reduce this error.') },
      items: [17] },
    { id: 's-sum', who: 'chan', title: { zh: '總結', en: 'Summary' },
      say: sayCh('物態改變嗰陣，溫度唔變，能量變成潛熱。溶化喺熔點，沸騰喺沸點。真實實驗會有熱散失，所以要諗辦法減少誤差。',
        'During a change of state the temperature stays the same and the energy becomes latent heat. Melting happens at the melting point, boiling at the boiling point. Real experiments lose heat, so we find ways to reduce the error.'),
      finish: true }
  ];
  const evapStages = [
    { id: 'e-intro', who: 'chan', title: { zh: '水去咗邊？', en: 'Where does the water go?' },
      say: sayCh('落完雨，地上啲水氹慢慢唔見咗，就係蒸發。放大鏡入面，表面最快嗰啲粒子有足夠能量，會飛出水面變成水蒸氣。兩碟水放喺電子磅上面，碟 A 係對照組。',
        'After rain, puddles slowly disappear: that is evaporation. In the magnifier, the fastest particles at the surface have enough energy to escape as water vapour. Two dishes of water sit on scales; dish A is the control.'),
      setup: { mode: 'evap', speed: 12 }, graph: 'mass', items: [18] },
    { id: 'e-wind', who: 'chan', title: { zh: '風：估一估', en: 'Wind: predict' },
      say: sayCh('碟 B 加一把風扇，其他條件同碟 A 一樣。', 'Dish B gets a fan; everything else is the same as dish A.'),
      cond: [sayCh('只改變：碟 B 有風', 'Only change: wind on dish B')],
      setup: { mode: 'evap', speed: 12 }, lock: ALL, graph: 'mass',
      quiz: { q: sayCh('邊碟水少得快啲？', 'Which dish loses water faster?'), opts: [sayCh('碟 A', 'Dish A'), sayCh('碟 B（有風扇）', 'Dish B (with the fan)'), sayCh('一樣', 'The same')], ans: 1,
        run: [['set', 'windB', true]], watch: 5,
        why: sayCh('答案係：碟 B！風會吹走水面上嘅水蒸氣，令飛走咗嘅粒子冇咁易返轉頭，所以蒸發得快啲。', 'The answer: dish B! Wind blows away the water vapour above the surface, so escaped particles are less likely to fall back in, and evaporation is faster.') },
      chain: [sayCh('有風', 'Wind'), sayCh('吹走水蒸氣', 'Vapour blown away'), sayCh('蒸發加快', 'Faster evaporation')], items: [19] },
    { id: 'e-factors', who: 'ming', title: { zh: '其他因素', en: 'Other factors' },
      say: sayCh('影響蒸發快慢仲有：溫度高啲、表面積大啲、空氣乾啲，都會蒸發得快啲。揀一樣嘢改變碟 B 試吓！記住每次只改一樣。',
        'Other things affect evaporation too: higher temperature, bigger surface area and drier air all make it faster. Change one thing for dish B and try it. Remember, only one at a time!'),
      task: sayCh('在工具箱只改變碟 B 的一個因素', 'In the toolbox, change one factor for dish B'),
      setup: { mode: 'evap', speed: 12 }, graph: 'mass',
      goal: { type: 'param', test: () => [p.heatB, p.wideB, p.coverB, p.windB].filter(Boolean).length === 1 }, demo: [['openTools'], ['set', 'wideB', true]], settle: 4,
      chain: [sayCh('溫度', 'Temperature'), sayCh('表面積', 'Surface area'), sayCh('風', 'Wind'), sayCh('濕度', 'Humidity')], items: [19] },
    { id: 'e-cool', who: 'chan', title: { zh: '蒸發令人變涼', en: 'Evaporation cools you' },
      say: sayCh('飛走嘅都係最快嘅粒子，留低嘅平均就慢咗，所以溫度會降低。', 'The particles that escape are the fastest ones, so those left behind are slower on average, and the temperature drops.'),
      quiz: { q: sayCh('游完水上岸，身體覺得凍，係因為？', 'Why do you feel cold when you get out of a swimming pool?'),
        opts: [sayCh('身上嘅水蒸發，帶走身體嘅熱', 'Water evaporating from your skin takes heat away'), sayCh('風太大', 'It is too windy'), sayCh('池水好凍', 'The pool water is cold')], ans: 0,
        why: sayCh('答案係：水蒸發帶走熱！最快嘅水粒子飛走，帶走能量，身體就變涼。出汗都係同一個道理。', 'The answer: evaporation takes heat away! The fastest water particles leave and carry energy with them, so your body cools. Sweating works the same way.') },
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
      setup: { mode: 'float', salt: false }, lock: ALL,
      quiz: { q: sayCh('邊個會浮？', 'Which one floats?'), opts: [sayCh('大木頭', 'The big wood block'), sayCh('細鐵波', 'The small steel ball'), sayCh('兩樣都沉', 'Both sink')], ans: 0,
        run: [['drop', 'wood'], ['drop', 'steel'], ['wait', 2.5]], watch: 0.3,
        why: sayCh('答案係：大木頭！浮定沉唔係睇輕重，而係睇密度。木頭嘅粒子排得鬆，密度細過水；鐵排得好密，密度大過水。', 'The answer: the big wood block! Floating is not about heavy or light; it’s about density. Wood is loosely packed, less dense than water; steel is tightly packed, denser than water.') },
      chain: [sayCh('木頭密度細過水', 'Wood is less dense than water'), sayCh('浮力夠托起佢', 'Buoyancy can hold it up'), sayCh('浮', 'It floats')], items: ['P4'] },
    { id: 'f-dens', who: 'chan', title: { zh: '密度', en: 'Density' },
      say: sayCh('密度就係「每一份空間有幾多料」，等於質量除以體積。水嘅密度係每立方厘米 1 克。比水疏嘅會浮，比水密嘅會沉。冰同石頭試吓！',
        'Density is how much stuff is packed into each bit of space: mass divided by volume. Water’s density is 1 gram per cubic centimetre. Less dense things float; denser things sink. Let’s try ice and a stone!'),
      setup: { mode: 'float', salt: false }, demo: [['drop', 'ice'], ['drop', 'stone'], ['wait', 2.5]],
      adv: sayCh('密度 ρ = m ÷ V；浮着的物件，浸在水中的比例 = 物件密度 ÷ 液體密度。', 'Density ρ = m ÷ V. For a floating object, the fraction underwater = object density ÷ liquid density.'), items: ['P4'] },
    { id: 'f-boat', who: 'ming', title: { zh: '鋼船：估一估', en: 'Steel boat: predict' },
      say: sayCh('鐵會沉，咁用鋼鐵造嘅大船呢？', 'Steel sinks, so what about a big ship made of steel?'),
      setup: { mode: 'float', salt: false }, lock: ALL,
      quiz: { q: sayCh('鋼船點解唔會沉？', "Why doesn't a steel boat sink?"),
        opts: [sayCh('因為船好輕', 'Because boats are light'), sayCh('船入面有好多空氣，平均密度細過水', 'It holds lots of air, so its average density is less than water'), sayCh('因為海水會托起所有嘢', 'Because sea water holds everything up')], ans: 1,
        run: [['drop', 'boat'], ['wait', 2.5]], watch: 0.3,
        why: sayCh('答案係：船入面有好多空氣！成隻船連埋入面嘅空氣，平均密度細過水，所以會浮。如果船入水，空氣被水取代，就會沉。', 'The answer: it holds lots of air! The boat plus the air inside has an average density less than water, so it floats. If water floods in and replaces the air, it sinks.') },
      items: ['P4'] },
    { id: 'f-salt', who: 'chan', title: { zh: '鹽水：估一估', en: 'Salt water: predict' },
      say: sayCh('雞蛋喺清水入面會沉落底。', 'An egg sinks to the bottom in fresh water.'),
      setup: { mode: 'float', salt: false }, lock: ALL, pre: [['drop', 'egg']],
      quiz: { q: sayCh('加鹽之後，雞蛋會點？', 'What happens to the egg when we add salt?'), opts: [sayCh('浮起嚟', 'It floats up'), sayCh('沉得更快', 'It sinks faster'), sayCh('冇變', 'Nothing')], ans: 0,
        run: [['set', 'salt', true], ['wait', 3]], watch: 0.3,
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

  /* ================== 3D 場景 ================== */
  const G = {};
  ['beaker', 'curve', 'transfer', 'evap', 'float'].forEach((k) => { G[k] = new THREE.Group(); root.add(G[k]); });
  const V = {};
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
  // 粒子放大鏡
  const MAG = { c: new THREE.Vector3(3.4, 2.75, 0.2), R: 0.62, n: 36, parts: [] };
  function mountMag() {
    const g = new THREE.Group(); root.add(g); V.magG = g;
    mesh(new THREE.SphereGeometry(MAG.R + 0.06, 32, 20), glass(0xffffff, 0.16), MAG.c.x, MAG.c.y, MAG.c.z, g, false);
    const rim = mesh(new THREE.TorusGeometry(MAG.R + 0.06, 0.05, 10, 40), std(0x334155, 0.4, 0.5), MAG.c.x, MAG.c.y, MAG.c.z, g, false); rim.rotation.x = 0;
    mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8), std(0x334155, 0.4, 0.5), MAG.c.x + 0.45, MAG.c.y - 0.95, MAG.c.z, g, false).rotation.z = 0.5;
    V.magTag = tag('readout light', g, MAG.c.x, MAG.c.y + MAG.R + 0.35, MAG.c.z);
    const geo = new THREE.SphereGeometry(0.055, 10, 8);
    for (let i = 0; i < MAG.n; i++) {
      const m = mesh(geo, std(0x2563eb, 0.3), 0, 0, 0, g, false);
      const ix = i % 4, iy = Math.floor(i / 16), iz = Math.floor(i / 4) % 4;
      const home = new THREE.Vector3((ix - 1.5) * 0.15, -0.38 + iy * 0.15, (iz - 1.5) * 0.15);
      MAG.parts.push({ m, p: home.clone(), v: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(), home, esc: 0 });
    }
  }
  function updMag(dt, TK, frac, escape) {
    const nS = Math.round(MAG.n * frac.s), nL = Math.round(MAG.n * frac.l);
    const sp = Math.sqrt(Math.max(TK, 50) / 293);
    MAG.parts.forEach((q, i) => {
      const st = i < nS ? 's' : i < nS + nL ? 'l' : 'g';
      if (st === 's') { const a = 0.012 + 0.03 * (TK / 273); q.p.set(q.home.x + (Math.random() - 0.5) * a, q.home.y + (Math.random() - 0.5) * a, q.home.z + (Math.random() - 0.5) * a); q.m.material.color.set(0x2563eb); }
      else {
        const s = st === 'l' ? 0.28 * sp : 0.9 * sp;
        if (st === 'l') { q.v.x += (Math.random() - 0.5) * 6 * dt; q.v.y += (Math.random() - 0.5) * 6 * dt - 1.2 * dt; q.v.z += (Math.random() - 0.5) * 6 * dt; }
        q.v.normalize(); q.p.addScaledVector(q.v, s * dt);
        const lim = MAG.R - 0.06, top = st === 'l' ? -0.05 : lim;
        if (st === 'l' && escape > 0 && q.p.y > top - 0.03 && Math.random() < escape * dt) q.esc = 1.2;
        if (q.esc > 0) { q.esc -= dt; q.p.y += 0.8 * dt; if (q.esc <= 0) q.p.set((Math.random() - 0.5) * 0.4, -0.4, (Math.random() - 0.5) * 0.4); }
        else {
          if (q.p.length() > lim) { q.p.setLength(lim); q.v.reflect(q.p.clone().normalize()); }
          if (q.p.y > top) { q.p.y = top; q.v.y = -Math.abs(q.v.y); }
        }
        q.m.material.color.set(st === 'g' ? 0xf97316 : 0x0ea5e9);
      }
      q.m.visible = q.esc <= 0 || q.p.y < MAG.R + 0.6;
      q.m.position.set(MAG.c.x + q.p.x, MAG.c.y + q.p.y, MAG.c.z + q.p.z);
    });
  }
  function mount() {
    for (const k of Object.keys(G)) table(G[k]);
    V.b = beakerSet(G.beaker, -1.2, false);
    V.c = beakerSet(G.curve, -1.2, true);
    // 熱轉移：四條棒
    const tg = G.transfer;
    mesh(new THREE.BoxGeometry(0.5, 0.6, 2.0), std(0x475569, 0.5, 0.4), -3.9, TABLE + 0.6, 0, tg);
    V.flame = mesh(new THREE.ConeGeometry(0.18, 0.5, 16), new THREE.MeshBasicMaterial({ color: 0xff7a00, transparent: true, opacity: 0.85 }), -3.9, TABLE + 0.25, 0, tg, false);
    V.rodSeg = []; V.pins = []; V.rodTags = [];
    ROD.forEach((r, ri) => {
      const z = -0.75 + ri * 0.5, segs = [];
      for (let i = 0; i < 24; i++) segs.push(mesh(new THREE.BoxGeometry(2.8 / 24, 0.08, 0.08), std(r.col, 0.4, r.k === 'gl' ? 0 : 0.6, { emissive: 0xff3300, emissiveIntensity: 0 }), -3.6 + (i + 0.5) * (2.8 / 24), TABLE + 0.75, z, tg));
      V.rodSeg.push(segs);
      V.pins.push([0, 1, 2, 3].map((k) => mesh(new THREE.SphereGeometry(0.05, 10, 8), std(0xfef08a, 0.6), -3.6 + 0.5 + k * 0.6, TABLE + 0.66, z, tg)));
      V.rodTags.push(tag('readout light', tg, -0.55, TABLE + 0.78, z));
    });
    // 對流杯
    V.conv = beakerSet(tg, 0.6, false); V.conv.dye = [];
    [...V.conv.bub, ...V.conv.steam].forEach((m) => (m.visible = false));
    for (let i = 0; i < 16; i++) { const d = mesh(new THREE.SphereGeometry(0.05, 8, 6), std(0x7c3aed, 0.5), 0.6, 0, 0, tg, false); d.userData.s = i / 16; V.conv.dye.push(d); }
    // 輻射：兩個罐 + 燈
    V.cans = [[2.6, 0x111827, 0.95], [3.9, 0xe5e7eb, 0.15]].map(([x, col, ab]) => {
      const c = mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.8, 24), std(col, col === 0x111827 ? 0.95 : 0.08, col === 0x111827 ? 0 : 1), x, TABLE + 0.4, 0, tg);
      return { c, t: tag('readout', tg, x, TABLE + 1.15, 0.35), ab };
    });
    mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 8), std(0x334155), 3.25, TABLE + 1.7, -0.5, tg);
    V.lamp = mesh(new THREE.SphereGeometry(0.22, 16, 12), std(0x7f1d1d, 0.4, 0, { emissive: 0xff2200, emissiveIntensity: 0 }), 3.25, TABLE + 2.2, 0, tg);
    mesh(new THREE.ConeGeometry(0.4, 0.35, 20, 1, true), std(0x94a3b8, 0.3, 0.8, { side: THREE.DoubleSide }), 3.25, TABLE + 2.32, 0, tg);
    // 蒸發：兩個碟 + 電子磅
    const eg = G.evap;
    V.dish = ['A', 'B'].map((k, i) => {
      const x = i ? 1.4 : -1.4;
      mesh(new THREE.BoxGeometry(1.4, 0.18, 1.2), std(0xe2e8f0, 0.5), x, TABLE + 0.09, 0, eg);
      const dish = mesh(new THREE.CylinderGeometry(0.42, 0.36, 0.12, 32), glass(0xffffff, 0.5), x, TABLE + 0.26, 0, eg, false);
      const water = mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.06, 32), std(0x60a5fa, 0.1, 0, { transparent: true, opacity: 0.75 }), x, TABLE + 0.24, 0, eg, false);
      const t = tag('readout', eg, x, TABLE + 0.9, 0.5);
      tag('readout light', eg, x, TABLE + 0.32, 0.75).el.textContent = k === 'A' ? L({ zh: '碟 A', en: 'Dish A' }) : L({ zh: '碟 B', en: 'Dish B' });
      return { dish, water, t, x };
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
  const KLOSS = 1.5;
  function stepBeaker(dt) {
    const L0 = LIQ[p.liquid];
    const P = p.heat ? p.P : 0;
    S.E += P * dt;
    S.T += (P - KLOSS * (S.T - 20)) / (p.m * L0.c) * dt;
    if (S.T > L0.bp) S.T = L0.bp;
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
  function stepTransfer(dt) {
    rods.forEach((r, ri) => {
      const a = ROD[ri].a * 0.9, T = r.T, n = T.length;
      if (p.flame) T[0] = 300; else T[0] += (20 - T[0]) * 0.5 * dt;
      const K = a * 18, sub = Math.max(1, Math.ceil((K * dt) / 0.45)), h = dt / sub; // 顯式差分要細步長先穩定
      for (let s = 0; s < sub; s++) {
        const nT = T.slice();
        for (let i = 1; i < n; i++) { const right = i < n - 1 ? T[i + 1] : T[i]; nT[i] = T[i] + (K * (T[i - 1] - 2 * T[i] + right) - 0.02 * (T[i] - 20)) * h; }
        for (let i = 1; i < n; i++) T[i] = nT[i];
      }
      r.pins.forEach((pin, k) => {
        const idx = Math.round(((0.5 + k * 0.6) / 2.8) * 24);
        if (!pin.down && T[Math.min(idx, n - 1)] > 60) { pin.down = true; ctx.sfx('tick'); ctx.emit('pin', { rod: ROD[ri].k, k }); }
        if (pin.down && pin.y > -0.6) pin.y -= 2 * dt;
      });
    });
    const I = p.lamp ? 40 : 0;
    cans.Tb += (V.cans[0].ab * I - 0.6 * (cans.Tb - 20)) / 30 * dt;
    cans.Ts += (V.cans[1].ab * I - 0.6 * (cans.Ts - 20)) / 30 * dt;
  }
  const evRate = (wind, heat, wide, cover) => 0.18 * (wide ? 2.2 : 1) * (1 + (wind ? 1.6 : 0)) * Math.exp(((heat ? 55 : 20) - 20) / 18) * (cover ? 0.12 : 1);
  function stepEvap(dt) {
    dishes.A = Math.max(0, dishes.A - evRate(false, false, false, false) * dt);
    dishes.B = Math.max(0, dishes.B - evRate(p.windB, p.heatB, p.wideB, p.coverB) * dt);
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
      if (settled && s.state !== (floatsNow ? 'float' : 'sink')) { s.state = floatsNow ? 'float' : 'sink'; ctx.emit(s.state, { key: k }); }
    }
  }
  function dropObj(k) {
    if (!FLO[k]) return;
    floats[k] = { y: V.waterTop + 1.0, v: 0, age: 0, state: null, splashed: false };
    V.fl[k].g.visible = true; ctx.sfx('click'); ctx.emit('drop', { key: k });
  }

  /* ---------------- 取樣 / 重設 ---------------- */
  function sample() {
    const m = p.mode;
    H.push(S.simT, { T: m === 'beaker' ? S.T : m === 'curve' ? cur.T : NaN, Tb: m === 'transfer' ? cans.Tb : NaN, Ts: m === 'transfer' ? cans.Ts : NaN, wA: m === 'evap' ? dishes.A : NaN, wB: m === 'evap' ? dishes.B : NaN });
  }
  function resetState() {
    S.T = 20; S.E = 0; S.simT = 0; S.real = 0; S.lastSample = -1;
    Object.assign(cur, { T: -20, phase: 'solid', melted: 0, boiled: 0, tMelt0: null, tMelt1: null, E: 0, E0: 0, fired: {} });
    rods.forEach((r) => { r.T.fill(20); r.pins.forEach((pin) => { pin.down = false; pin.y = 0; }); });
    cans.Tb = cans.Ts = 20; dishes.A = dishes.B = 50;
    for (const k of Object.keys(floats)) { delete floats[k]; V.fl[k].g.visible = false; }
    H.reset();
  }
  function apply(s = {}) {
    Object.assign(p, DEF);
    for (const k of Object.keys(DEF)) if (s[k] !== undefined) p[k] = s[k];
    ghost = null; resetState(); sync();
  }
  function sync() { for (const k of Object.keys(G)) G[k].visible = p.mode === k; V.magG.visible = p.mode !== 'float'; }
  function again() {
    if (H.n > 5) ghost = { t: H.t.slice(), c: Object.fromEntries(Object.entries(H.c).map(([k, v]) => [k, v.slice()])) };
    const keep = { heat: p.heat }; resetState(); p.heat = false; p.flame = false; p.lamp = false; void keep;
  }
  function setParam(k, v) {
    p[k] = v;
    if (k === 'liquid' || k === 'm') { if (p.mode === 'beaker' && !p.heat) { S.T = 20; } }
    if (k === 'mode') sync();
  }
  function act(a) { if (a[0] === 'drop') dropObj(a[1]); }

  /* ================== 每幀 ================== */
  function update(dt, time) {
    S.real += dt;
    const sp = p.mode === 'float' ? 1 : p.speed, sdt = dt * sp;
    const n = Math.max(1, Math.ceil(sdt / 0.05));
    for (let i = 0; i < n; i++) {
      const h = sdt / n;
      if (p.mode === 'beaker') stepBeaker(h); else if (p.mode === 'curve') stepCurve(h); else if (p.mode === 'transfer') stepTransfer(h); else if (p.mode === 'evap') stepEvap(h);
      S.simT += h;
      if (S.simT - S.lastSample >= Math.max(1 / 30, sp / 30)) { S.lastSample = S.simT; sample(); }
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
    if (p.mode === 'beaker') {
      beakerVis(V.b, S.T, 0.25 + p.m * 0.75, LIQ[p.liquid].color, p.heat, p.liquid === 'water' && S.T >= 99.9);
      updMag(dt, S.T + 273, { s: 0, l: 1 }, S.T > 60 ? (S.T - 60) / 30 : 0);
    } else if (p.mode === 'curve') {
      const iceFrac = cur.phase === 'solid' ? 1 : cur.phase === 'melt' ? 1 - cur.melted / p.mc : 0;
      const waterFrac = cur.phase === 'melt' ? cur.melted / p.mc : cur.phase === 'liquid' ? 1 : cur.phase === 'boil' ? 1 - cur.boiled / p.mc : 0;
      V.c.ice.visible = iceFrac > 0.01; V.c.ice.scale.setScalar(Math.max(0.05, Math.cbrt(iceFrac)));
      beakerVis(V.c, cur.T, waterFrac * 0.45, 0x60a5fa, p.heat, cur.phase === 'boil');
      updMag(dt, cur.T + 273, { s: iceFrac, l: waterFrac }, cur.phase === 'boil' ? 2 : 0);
    } else if (p.mode === 'transfer') {
      V.flame.visible = p.flame; V.flame.scale.y = 1 + Math.sin(time * 18) * 0.12;
      rods.forEach((r, ri) => {
        V.rodSeg[ri].forEach((s, i) => (s.material.emissiveIntensity = clamp((r.T[i] - 40) / 300, 0, 0.9)));
        r.pins.forEach((pin, k) => { const m = V.pins[ri][k]; m.position.y = TABLE + 0.66 + pin.y; m.visible = pin.y > -0.6; });
      });
      V.lamp.material.emissiveIntensity = p.lamp ? 1.2 : 0;
      V.conv.plate.material.emissiveIntensity = p.flame ? 0.8 : 0;
      V.conv.liq.scale.y = 0.75; V.conv.liq.position.y = V.conv.by + 0.395;
      V.conv.dye.forEach((d) => {
        if (p.flame) d.userData.s = (d.userData.s + dt * 0.18) % 1;
        const s = d.userData.s, side = (d.id % 2 ? 1 : -1), u = s * 4;
        let x, y;
        if (u < 1) { x = 0; y = 0.08 + u * 0.62; } else if (u < 2) { x = side * (u - 1) * 0.38; y = 0.7; } else if (u < 3) { x = side * 0.38; y = 0.7 - (u - 2) * 0.62; } else { x = side * 0.38 * (1 - (u - 3)); y = 0.08; }
        d.position.set(V.conv.x + x, V.conv.by + y, (d.id % 3 - 1) * 0.12);
      });
      updMag(dt, 293 + (p.flame ? 40 : 0), { s: 1, l: 0 }, 0);
    } else if (p.mode === 'evap') {
      [['A', false, false, false, false], ['B', p.windB, p.heatB, p.wideB, p.coverB]].forEach(([k, w, h, wd], i) => {
        const d = V.dish[i], lv = dishes[k] / 50;
        d.dish.scale.set(wd ? 1.45 : 1, 1, wd ? 1.45 : 1); d.water.scale.set(wd ? 1.45 : 1, Math.max(0.02, lv), wd ? 1.45 : 1); d.water.visible = lv > 0.01;
      });
      V.fanB.visible = p.windB; if (p.windB) V.fanBl.rotation.x += dt * 25;
      V.heatB.visible = p.heatB; V.coverB.visible = p.coverB;
      const rB = evRate(p.windB, p.heatB, p.wideB, p.coverB);
      updMag(dt, 293 + (p.heatB ? 35 : 0), { s: 0, l: 1 }, rB * 4);
    } else {
      V.water.material.color.set(p.salt ? 0x38bdf8 : 0x60a5fa);
      for (const [k, s] of Object.entries(floats)) V.fl[k].g.position.set(SLOT[k], s.y, 0);
    }
  }
  function labels() {
    const tl = (T) => `${f(T, 1)} °C`;
    V.b.tag.el.innerHTML = tl(S.T) + `<small>${L({ zh: '供給能量', en: 'energy in' })} ${f(S.E / 1000, 1)} kJ</small>`;
    const ph = { solid: { zh: '固體', en: 'solid' }, melt: { zh: '溶化中', en: 'melting' }, liquid: { zh: '液體', en: 'liquid' }, boil: { zh: '沸騰中', en: 'boiling' }, steam: { zh: '氣體', en: 'gas' } };
    V.c.tag.el.innerHTML = tl(cur.T) + `<small>${L(ph[cur.phase])} · ${f(cur.E / 1000, 1)} kJ</small>`;
    V.conv.tag.o.visible = false;
    V.rodTags.forEach((t, i) => (t.el.textContent = L(ROD[i])));
    V.cans[0].t.el.innerHTML = `${tl(cans.Tb)}<small>${L({ zh: '啞黑色', en: 'dull black' })}</small>`;
    V.cans[1].t.el.innerHTML = `${tl(cans.Ts)}<small>${L({ zh: '光亮銀色', en: 'shiny silver' })}</small>`;
    V.dish.forEach((d, i) => (d.t.el.innerHTML = `${f(i ? dishes.B : dishes.A, 1)} g`));
    for (const [k, o] of Object.entries(FLO)) { const rho = k === 'custom' ? p.dens : o.rho, s = floats[k]; V.fl[k].t.el.innerHTML = `${L(o)} · ${rho} g/cm³` + (s && s.state ? `<small>${s.state === 'float' ? L({ zh: '浮 🛟', en: 'floats 🛟' }) : L({ zh: '沉 ⚓', en: 'sinks ⚓' })}</small>` : ''); }
    const magMsg = { beaker: { zh: '🔍 水的粒子', en: '🔍 Water particles' }, curve: { zh: '🔍 粒子：藍＝固體，淺藍＝液體，橙＝氣體', en: '🔍 Particles: blue = solid, light blue = liquid, orange = gas' }, transfer: { zh: '🔍 金屬棒的粒子', en: '🔍 Rod particles' }, evap: { zh: '🔍 最快的粒子飛出水面', en: '🔍 The fastest particles escape' } };
    V.magTag.el.textContent = L(magMsg[p.mode] || magMsg.beaker);
  }
  function tap(ray) {
    if (p.mode === 'float') {
      for (const [k, o] of Object.entries(FLO)) if (V.fl[k].g.visible && ray.intersectObject(V.fl[k].g, true).length) {
        const rho = k === 'custom' ? p.dens : o.rho;
        ctx.info('fl' + k, () => L(o), () => L({ zh: `密度 ${rho} g/cm³，液體密度 ${rhoL()} g/cm³，所以會${rho < rhoL() ? '浮' : '沉'}。`, en: `Density ${rho} g/cm³ vs liquid ${rhoL()} g/cm³, so it ${rho < rhoL() ? 'floats' : 'sinks'}.` })); return true;
      }
    }
    if (V.magG.visible && ray.intersectObject(V.magG, true).length) {
      ctx.info('mag', () => L({ zh: '粒子放大鏡', en: 'Particle magnifier' }), () => L({ zh: '所有物質都由不停郁動的粒子組成。溫度越高，粒子平均郁得越快。固體粒子只在原位震動，液體粒子可以互相滑過，氣體粒子到處亂飛。', en: 'All matter is made of particles that never stop moving. The hotter it is, the faster they move on average. Solid particles jiggle in place, liquid particles slide past each other, and gas particles fly everywhere.' })); return true;
    }
    return false;
  }
  function screenPos(a) {
    if (a[0] !== 'drop' || !FLO[a[1]]) return null;
    const v = new THREE.Vector3(SLOT[a[1]], V.waterTop + 1.0, 0).project(ctx.camera);
    return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight };
  }
  function describeGraph(id) {
    const z = ctx.lang() === 'zh';
    if (id === 'T') return z ? '呢個係溫度對時間圖。條線向上斜代表溫度上升；條線變平，代表溫度唔變，可能係物態改變緊，或者冷熱達到平衡。'
      : 'This is a temperature–time graph. A rising line means the temperature is going up; a flat line means it isn’t changing, perhaps because the state is changing or heat in equals heat out.';
    if (id === 'TT') return z ? `紅線係啞黑色罐，藍線係光亮銀色罐。黑色罐而家 ${f(cans.Tb, 1)} 度，銀色罐 ${f(cans.Ts, 1)} 度。` : `Red is the dull black can and blue is the shiny can. The black can is at ${f(cans.Tb, 1)} degrees and the shiny can at ${f(cans.Ts, 1)} degrees.`;
    return z ? `呢個係剩餘水量對時間圖。條線跌得越快，代表蒸發得越快。碟 A 剩 ${f(dishes.A, 1)} 克，碟 B 剩 ${f(dishes.B, 1)} 克。` : `This graph shows water left over time. The steeper the drop, the faster the evaporation. Dish A has ${f(dishes.A, 1)} g left and dish B ${f(dishes.B, 1)} g.`;
  }

  const btnAgain = { label: { zh: '🔄 重設', en: '🔄 Reset' }, act: ['again'] };
  const dropBtns = Object.keys(FLO).map((k) => ({ label: { zh: '⬇️ ' + FLO[k].zh, en: '⬇️ ' + FLO[k].en }, act: ['drop', k] }));
  const cam = { pos: [0.6, 3.6, 8.2], target: [0.6, 1.6, 0] };
  return {
    board: { title: 'Heat · 熱學', lines: ['E = mcΔT', 'E = mL', 'ρ = m/V'],
      info: { zh: '黑板上的公式：E = mcΔT 計升溫需要的能量；E = mL 計物態改變的潛熱；ρ = m/V 是密度。', en: 'Board formulas: E = mcΔT for warming up; E = mL for latent heat; ρ = m/V for density.' } },
    camera: cam, params, graphs, buttons: [btnAgain],
    lessons: [
      { id: 'temp', icon: '🌡️', subs: ['1.1'], items: [1, 2, 3, 4, 5, 6], title: { zh: '溫度、熱和內能', en: 'Temperature, heat and internal energy' },
        desc: { zh: '用粒子放大鏡看溫度，認識溫度計和攝氏定點。', en: 'See temperature through a particle magnifier, and meet the thermometer and Celsius scale.' },
        base: { mode: 'beaker' }, params: ['heat', 'P', 'speed'], graphs: ['T'], stages: tempStages },
      { id: 'shc', icon: '🍳', subs: ['1.1'], items: [7, 8, 9, 10], title: { zh: '比熱容量', en: 'Specific heat capacity' },
        desc: { zh: '水和油誰升溫快？E = mcΔT 和水的妙用。', en: 'Water or oil: which warms faster? E = mcΔT and why water is useful.' },
        base: { mode: 'beaker' }, params: ['heat', 'liquid', 'm', 'P', 'speed'], graphs: ['T'], stages: shcStages },
      { id: 'transfer', icon: '☀️', subs: ['1.2'], items: [11, 12], title: { zh: '傳導、對流和輻射', en: 'Conduction, convection and radiation' },
        desc: { zh: '金屬棒掉蠟粒、對流循環、黑罐和銀罐比賽。', en: 'Wax drops off metal rods, a convection loop, and a black can vs a shiny can.' },
        base: { mode: 'transfer' }, params: ['flame', 'lamp', 'speed'], graphs: ['TT'], stages: transferStages },
      { id: 'state', icon: '🧊', subs: ['1.3'], items: [13, 14, 15, 16, 17], title: { zh: '物態變化與潛熱', en: 'Changes of state and latent heat' },
        desc: { zh: '冰變水變蒸氣，溫度為甚麼會停？實驗為甚麼有誤差？', en: 'Ice to water to steam: why does the temperature pause, and why do experiments have errors?' },
        base: { mode: 'curve' }, params: ['heat', 'mc', 'P', 'loss', 'speed'], graphs: ['T'], stages: stateStages },
      { id: 'evap', icon: '💧', subs: ['1.3'], items: [18, 19, 20], title: { zh: '蒸發與沸騰', en: 'Evaporation and boiling' },
        desc: { zh: '公平測試影響蒸發的因素，蒸發為甚麼會令人變涼。', en: 'Fair-test what affects evaporation, and find out why it cools you down.' },
        base: { mode: 'evap' }, params: ['windB', 'heatB', 'wideB', 'coverB', 'speed'], graphs: ['mass'], stages: evapStages },
      { id: 'float', icon: '🛟', subs: ['2.6'], items: ['P4'], title: { zh: '浮與沉：密度', en: 'Floating and sinking: density' },
        desc: { zh: '大木頭浮、細鐵波沉？鋼船為甚麼不會沉？', en: 'Why does a big log float but a small steel ball sink? Why doesn’t a steel ship sink?' },
        base: { mode: 'float' }, params: ['salt', 'dens'], graphs: [], buttons: [...dropBtns, btnAgain], camera: { pos: [0, 3.2, 6.6], target: [0, 1.5, 0] }, stages: floatStages }
    ],
    mount, apply, again, act, update, labels, setParam,
    getParam: (k) => p[k], hist: () => H, ghost: () => ghost, simTime: () => S.real,
    tap, screenPos, describeGraph
  };
}
