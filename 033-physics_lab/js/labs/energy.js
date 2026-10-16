/* =====================================================================
 * 實驗枱：重力與能量台（energy）
 * 單元：🪶 重力、質量與重量（29, 32, 36）；🎢 能量過山車（37–43）
 * 模式：drop（落體管 + 彈簧秤）、coaster（U 形軌道 + 能量柱 + 摩打）
 * ===================================================================== */
export default function create(ctx) {
  const { THREE, kit, root } = ctx;
  const { std, mesh, tag, hiddenMat, glass, Hist, C, f } = kit;
  const L = kit.L2(ctx.lang);
  const clamp = THREE.MathUtils.clamp;

  const PLANETS = { earth: 9.8, moon: 1.6, mars: 3.7, jupiter: 24.8 };
  const PNAME = { earth: { zh: '地球', en: 'Earth' }, moon: { zh: '月球', en: 'Moon' }, mars: { zh: '火星', en: 'Mars' }, jupiter: { zh: '木星', en: 'Jupiter' } };
  // 物件：kOverM 由終端速度計出（有空氣時 a = g − k/m·v²）
  const OBJ = {
    ball: { zh: '鐵波', en: 'Steel ball', vt: 100 }, feather: { zh: '羽毛', en: 'Feather', vt: 0.5 },
    paper: { zh: '一張紙', en: 'Flat paper', vt: 1 }, paperball: { zh: '紙團', en: 'Paper ball', vt: 4 }
  };
  const objOpts = Object.keys(OBJ).map((v) => ({ v, label: OBJ[v] }));

  const DEF = { mode: 'drop', air: true, objL: 'ball', objR: 'feather', planet: 'earth', m: 2, mu: 0, P: 20 };
  const p = { ...DEF };
  const params = [
    { key: 'air', type: 'toggle', label: { zh: '💨 管內有空氣', en: '💨 Air in the tubes' }, hint: { zh: '關掉 = 抽成真空', en: 'Off = vacuum' } },
    { key: 'objL', type: 'select', label: { zh: '⬅️ 左管物件', en: '⬅️ Left tube' }, options: objOpts },
    { key: 'objR', type: 'select', label: { zh: '➡️ 右管物件', en: '➡️ Right tube' }, options: objOpts },
    { key: 'planet', type: 'select', label: { zh: '🪐 星球', en: '🪐 Planet' }, options: Object.keys(PLANETS).map((v) => ({ v, label: PNAME[v] })), hint: { zh: '不同星球的重力不同', en: 'Each planet pulls with a different strength' } },
    { key: 'm', label: { zh: '🚃 車的質量', en: '🚃 Cart mass' }, min: 0.5, max: 5, step: 0.5, unit: 'kg' },
    { key: 'mu', label: { zh: '🧱 摩擦力（μ）', en: '🧱 Friction (μ)' }, min: 0, max: 0.3, step: 0.02, unit: '', hint: { zh: '0 = 完全沒有摩擦', en: '0 = no friction at all' } },
    { key: 'P', label: { zh: '⚙️ 摩打功率', en: '⚙️ Motor power' }, min: 5, max: 100, step: 5, unit: 'W', hint: { zh: '功率越大，做同樣的功越快', en: 'More power does the same work faster' } }
  ];
  const graphs = [
    { id: 'v', tab: { zh: '速度 v–t', en: 'Velocity v–t' }, y: { zh: '下跌速度 v (m/s)', en: 'falling speed v (m/s)' }, min: 2, series: [['vL', { zh: '左管', en: 'Left' }, C.red], ['vR', { zh: '右管', en: 'Right' }, C.blue]] },
    { id: 'E', tab: { zh: '能量 E–t', en: 'Energy E–t' }, y: { zh: '能量 (J)', en: 'energy (J)' }, min: 5, total: 'ET',
      series: [['PE', { zh: '勢能', en: 'PE' }, C.blue], ['KE', { zh: '動能', en: 'KE' }, C.red], ['Q', { zh: '熱能', en: 'Heat' }, C.amber], ['ET', { zh: '總能量', en: 'Total' }, C.ink]] }
  ];
  const ALL = ['air', 'objL', 'objR', 'planet', 'm', 'mu', 'P'];
  const g = () => PLANETS[p.planet];

  /* ---------------- 狀態 ---------------- */
  const TOP = 4.2, BOT = 0.5;
  const drops = [{ y: TOP, v: 0, state: 'hold' }, { y: TOP, v: 0, state: 'hold' }];
  const yOf = (x) => 0.35 + 0.068 * x * x, dyOf = (x) => 0.136 * x, Y0 = 0.35, XLIM = 5.6;
  const car = { x: -5, v: 0, state: 'hold', heat: 0, lift: null };
  const S = { simT: 0, lastSample: -1, Emax: 1 };
  const H = new Hist(['vL', 'vR', 'PE', 'KE', 'Q', 'ET']);
  let ghost = null;

  /* ---------------- 教學：重力 ---------------- */
  const gravityStages = [
    { id: 'gr-intro', who: 'chan', title: { zh: '重力', en: 'Gravity' },
      say: { zh: '放手之後，點解啲嘢會跌落地？因為地球有一種叫重力嘅力，將所有嘢拉向地心。今日我哋用兩條長管做實驗：左邊放鐵波，右邊放羽毛。',
             en: "Why do things fall when you let go? Because the Earth pulls everything towards its centre with a force called gravity. Today we have two tall tubes: a steel ball on the left and a feather on the right." },
      setup: { mode: 'drop', air: true, objL: 'ball', objR: 'feather' }, items: [32] },
    { id: 'gr-air', who: 'chan', title: { zh: '有空氣：估一估', en: 'With air: predict' },
      say: { zh: '管入面有空氣。我哋同時放手。', en: "There's air in the tubes. We let go of both at the same moment." },
      cond: [{ zh: '同一高度、同時放手', en: 'Same height, released together' }, { zh: '管內有空氣', en: 'Air in the tubes' }],
      setup: { mode: 'drop', air: true, objL: 'ball', objR: 'feather' }, lock: ALL, graph: 'v',
      quiz: { q: { zh: '鐵波同羽毛，邊個先跌到底？', en: 'Which reaches the bottom first: the steel ball or the feather?' },
        opts: [{ zh: '鐵波', en: 'The steel ball' }, { zh: '羽毛', en: 'The feather' }, { zh: '一齊到', en: 'Both together' }], ans: 0,
        run: [['drop'], ['until', 'landed', 12]], watch: 0.4,
        why: { zh: '答案係：鐵波先到！羽毛好輕又好闊，空氣阻力好大，好似有隻手托住佢，所以跌得好慢。',
               en: 'The answer: the steel ball! The feather is light and wide, so air resistance pushes up on it a lot, like a hand holding it back. So it falls slowly.' } },
      chain: [{ zh: '羽毛受很大空氣阻力', en: 'Big air resistance on the feather' }, { zh: '向下的淨力很小', en: 'Small net downward force' }, { zh: '跌得慢', en: 'It falls slowly' }],
      items: [29] },
    { id: 'gr-vac', who: 'ming', title: { zh: '真空：估一估', en: 'In a vacuum: predict' },
      say: { zh: '如果將管入面嘅空氣抽走晒，變成真空，再試一次呢？', en: "What if we pump all the air out of the tubes, making a vacuum, and try again?" },
      cond: [{ zh: '只改變：抽走空氣', en: 'Only change: remove the air' }],
      setup: { mode: 'drop', air: false, objL: 'ball', objR: 'feather' }, lock: ALL, graph: 'v',
      quiz: { q: { zh: '冇咗空氣，邊個先到底？', en: 'With no air, which reaches the bottom first?' },
        opts: [{ zh: '鐵波', en: 'The steel ball' }, { zh: '羽毛', en: 'The feather' }, { zh: '一齊到', en: 'Both together' }], ans: 2,
        run: [['drop'], ['until', 'landed', 12]], watch: 0.4,
        why: { zh: '答案係：一齊到！冇空氣阻力，所有嘢都用同一個加速度跌落嚟，同輕重無關。太空人真係喺月球試過，鎚仔同羽毛一齊落地！',
               en: 'The answer: both together! With no air resistance, everything falls with the same acceleration, however heavy it is. Astronauts really tried this on the Moon: a hammer and a feather landed together!' } },
      chain: [{ zh: '沒有空氣阻力', en: 'No air resistance' }, { zh: '只受重力', en: 'Only gravity acts' }, { zh: '加速度一樣，一齊到底', en: 'Same acceleration, land together' }],
      items: [29] },
    { id: 'gr-g', who: 'chan', title: { zh: '重力加速度 g', en: 'Acceleration due to gravity, g' },
      say: { zh: '睇吓速度–時間圖：兩條線都係一條斜直線，速度每秒增加差唔多 9.8 米每秒。呢個就叫重力加速度 g。撳「放手」再試一次。',
             en: "Look at the velocity–time graph: both lines are straight slopes. The speed goes up by about 9.8 metres per second every second. This is called the acceleration due to gravity, g. Tap 'Drop' to try again." },
      task: { zh: '按「放手」，觀察速度–時間圖', en: "Tap 'Drop' and watch the velocity–time graph" },
      setup: { mode: 'drop', air: false, objL: 'ball', objR: 'feather' }, graph: 'v',
      goal: { type: 'landed' }, demo: [['drop']], settle: 1,
      adv: { zh: '自由落體：v = gt，g ≈ 9.8 m/s²。', en: 'Free fall: v = gt, with g ≈ 9.8 m/s².' }, items: [29] },
    { id: 'gr-mass', who: 'chan', title: { zh: '質量與重量', en: 'Mass and weight' },
      say: { zh: '右邊個彈簧秤吊住一個 1 kg 嘅鐵塊。質量係物件有幾多「料」；重量係重力拉佢有幾大力。',
             en: "The spring scale on the right holds a 1 kg block. Mass is how much stuff something has. Weight is how hard gravity pulls on it." },
      setup: { mode: 'drop', air: false, planet: 'earth' }, lock: ['air', 'objL', 'objR'],
      quiz: { q: { zh: '將 1 kg 嘅鐵塊帶上月球，佢嘅質量同重量會點？', en: 'If we take the 1 kg block to the Moon, what happens to its mass and weight?' },
        opts: [{ zh: '質量同重量都變細', en: 'Both get smaller' }, { zh: '質量唔變，重量變細', en: 'Mass stays the same; weight gets smaller' }, { zh: '兩樣都唔變', en: 'Neither changes' }], ans: 1,
        run: [['set', 'planet', 'moon']], watch: 1.2,
        why: { zh: '答案係：質量唔變，重量變細！鐵塊嘅「料」冇少過，所以質量仍然係 1 kg；但月球嘅重力弱好多，所以重量由 9.8 N 變成大約 1.6 N。',
               en: 'The answer: the mass stays the same, but the weight gets smaller! The block has just as much stuff, so its mass is still 1 kg. But the Moon pulls much more weakly, so its weight drops from 9.8 N to about 1.6 N.' } },
      adv: { zh: '重量 W = mg，單位係牛頓 (N)。質量單位係公斤 (kg)。', en: 'Weight W = mg, measured in newtons (N). Mass is measured in kilograms (kg).' },
      chain: [{ zh: '質量：物件有幾多料', en: 'Mass: how much stuff' }, { zh: '重量 = 質量 × g', en: 'Weight = mass × g' }, { zh: 'g 變細，重量變細', en: 'Smaller g, smaller weight' }],
      items: [36] },
    { id: 'gr-planet', who: 'ming', title: { zh: '去其他星球', en: 'Visit other planets' },
      say: { zh: '到你揀！喺工具箱揀一個星球，例如木星，再撳放手，睇吓啲嘢跌得幾快。',
             en: 'Your turn! Pick a planet in the toolbox, like Jupiter, then tap Drop and see how fast things fall.' },
      task: { zh: '揀一個地球以外的星球，再按「放手」', en: "Choose a planet other than Earth, then tap 'Drop'" },
      setup: { mode: 'drop', air: false, planet: 'earth' }, graph: 'v',
      goal: { type: 'landed', test: () => p.planet !== 'earth' }, demo: [['openTools'], ['set', 'planet', 'jupiter'], ['wait', 0.4], ['drop']], settle: 1,
      items: [29, 36] },
    { id: 'gr-sum', who: 'chan', title: { zh: '總結', en: 'Summary' },
      say: { zh: '記住：冇空氣阻力嘅時候，所有嘢跌落嚟嘅加速度都一樣；質量喺邊度都唔變，重量就要睇嗰度嘅重力有幾強。',
             en: "Remember: without air resistance, everything falls with the same acceleration. Mass is the same everywhere, but weight depends on how strong gravity is there." },
      chain: [{ zh: '重力拉一切向下', en: 'Gravity pulls everything down' }, { zh: '冇空氣：加速度一樣', en: 'No air: same acceleration' }, { zh: '重量 = mg', en: 'Weight = mg' }],
      finish: true }
  ];

  /* ---------------- 教學：能量過山車 ---------------- */
  const energyStages = [
    { id: 'en-intro', who: 'chan', title: { zh: '甚麼是能量？', en: 'What is energy?' },
      say: { zh: '能量就係「做嘢嘅本錢」。放喺高處嘅嘢有勢能，郁緊嘅嘢有動能，磨擦會產生熱能。右邊嘅能量柱會即時顯示車仔有幾多種能量。',
             en: "Energy is what you need to make things happen. Something high up has potential energy, something moving has kinetic energy, and rubbing makes heat. The bars on the right show the cart's energy live." },
      setup: { mode: 'coaster', mu: 0, x: -5 }, graph: 'E', items: [39, 40] },
    { id: 'en-pe', who: 'chan', title: { zh: '勢能變動能：估一估', en: 'PE into KE: predict' },
      say: { zh: '車仔喺左邊高處，冇摩擦力。我哋放手。', en: "The cart is high on the left, with no friction. Let's let go." },
      setup: { mode: 'coaster', mu: 0, x: -5 }, lock: ALL, graph: 'E',
      quiz: { q: { zh: '車去到最低點嗰陣，邊種能量最多？', en: 'At the lowest point, which kind of energy does the cart have most of?' },
        opts: [{ zh: '勢能', en: 'Potential energy' }, { zh: '動能', en: 'Kinetic energy' }, { zh: '冇能量', en: 'No energy' }], ans: 1,
        run: [['release']], watch: 1.6,
        why: { zh: '答案係：動能！車由高處落嚟，勢能慢慢變成動能。去到最低點，勢能最少，所以車最快、動能最多。',
               en: 'The answer: kinetic energy! As the cart rolls down, its potential energy turns into kinetic energy. At the bottom it has the least potential energy, so it is fastest and has the most kinetic energy.' } },
      chain: [{ zh: '高度減少', en: 'Height drops' }, { zh: '勢能變成動能', en: 'PE turns into KE' }, { zh: '速度增加', en: 'Speed rises' }],
      items: [39, 40, 42] },
    { id: 'en-cons', who: 'ming', title: { zh: '能量守恆：估一估', en: 'Conservation of energy: predict' },
      say: { zh: '冇摩擦力，車由左邊高處放手。', en: 'No friction. The cart is released from high on the left.' },
      setup: { mode: 'coaster', mu: 0, x: -5 }, lock: ALL, graph: 'E',
      quiz: { q: { zh: '車最高可以去到右邊幾高？', en: 'How high can the cart get on the right side?' },
        opts: [{ zh: '比原本低', en: 'Lower than it started' }, { zh: '同原本一樣高', en: 'Exactly as high as it started' }, { zh: '比原本高', en: 'Higher than it started' }], ans: 1,
        run: [['release']], watch: 4.2,
        why: { zh: '答案係：一樣高！冇摩擦力，能量冇流失，只係喺勢能同動能之間轉嚟轉去。睇吓黑色總能量線，一直都係平嘅。呢個就係能量守恆定律：能量唔會無端端出現，亦唔會消失。',
               en: "The answer: exactly as high! With no friction, no energy is lost; it just swaps between potential and kinetic. Look at the black total energy line: it stays flat. That is the law of conservation of energy: energy can't appear from nothing or disappear." } },
      chain: [{ zh: '沒有摩擦力', en: 'No friction' }, { zh: '總能量不變', en: 'Total energy stays the same' }, { zh: '回到同一高度', en: 'Back to the same height' }],
      items: [41, 42] },
    { id: 'en-fric', who: 'chan', title: { zh: '摩擦力與熱能', en: 'Friction and heat' },
      say: { zh: '而家加啲摩擦力。放手之後，睇吓橙色嘅熱能柱：車每次都爬得低啲，因為有啲能量變咗熱能，最後停喺最低點。',
             en: 'Now we add some friction. After letting go, watch the orange heat bar: the cart climbs a little lower each time, because some energy becomes heat. In the end it stops at the bottom.' },
      task: { zh: '按「放手」，看熱能柱慢慢升高', en: "Tap 'Release' and watch the heat bar grow" },
      setup: { mode: 'coaster', mu: 0.12, x: -5 }, graph: 'E', lock: ['m'],
      goal: { type: 'stop' }, demo: [['release']], settle: 1.5,
      chain: [{ zh: '摩擦力做功', en: 'Friction does work' }, { zh: '動能變熱能', en: 'KE becomes heat' }, { zh: '勢能＋動能減少，總能量不變', en: 'PE + KE drops; the total stays' }],
      adv: { zh: '克服摩擦力所作的功 = 摩擦力 × 距離，全部變成熱能。', en: 'Work done against friction = friction force × distance, and it all becomes heat.' },
      items: [38, 41] },
    { id: 'en-work', who: 'chan', title: { zh: '功', en: 'Work' },
      say: { zh: '用力令物件沿住力嘅方向移動，就叫做作功。功等於力乘以距離，單位係焦耳。',
             en: 'When a force moves something in the direction of the force, we say it does work. Work equals force times distance, measured in joules.' },
      quiz: { q: { zh: '以下邊個情況做咗功？', en: 'Which of these is doing work?' },
        opts: [{ zh: '用力推牆，但牆冇郁', en: "Pushing a wall that doesn't move" }, { zh: '將書包由地下攞上枱', en: 'Lifting a school bag from the floor onto a desk' }, { zh: '企喺度孭住書包唔郁', en: 'Standing still while carrying a bag' }], ans: 1,
        why: { zh: '答案係：將書包攞上枱！你向上用力，書包又向上移動，所以做咗功。推牆冇郁、企定唔郁，雖然好攰，但物件冇沿住力嘅方向移動，所以冇做功。',
               en: "The answer: lifting the bag onto the desk! You push upwards and the bag moves upwards, so you do work. Pushing a wall that doesn't move, or standing still, is tiring, but nothing moves along the force, so no work is done." } },
      adv: { zh: '功 W = Fs；舉起物件所做的功 = mgh = 增加的勢能。', en: 'Work W = Fs. Lifting something does work mgh, which becomes its potential energy.' },
      chain: [{ zh: '有力', en: 'A force acts' }, { zh: '物件沿力的方向移動', en: 'The object moves along it' }, { zh: '做了功', en: 'Work is done' }],
      items: [37] },
    { id: 'en-power', who: 'ming', title: { zh: '功率：估一估', en: 'Power: predict' },
      say: { zh: '左邊有部摩打，可以將車仔由最低點拉上高處。我哋用一部強摩打同一部弱摩打，將同一架車拉到同一個高度。',
             en: "The motor on the left can pull the cart from the bottom up to the top. We'll use a strong motor and a weak motor to lift the same cart to the same height." },
      setup: { mode: 'coaster', mu: 0, x: 0, P: 10 }, lock: ALL, graph: 'E',
      quiz: { q: { zh: '兩部摩打做嘅功一樣，強摩打有咩唔同？', en: 'Both motors do the same work. What is different about the strong motor?' },
        opts: [{ zh: '用嘅時間短啲', en: 'It takes less time' }, { zh: '做多啲功', en: 'It does more work' }, { zh: '冇分別', en: 'No difference' }], ans: 0,
        run: [['set', 'P', 10], ['lift'], ['until', 'lifted', 20], ['wait', 0.5], ['again'], ['set', 'P', 40], ['lift'], ['until', 'lifted', 12]], watch: 0.5,
        why: { zh: '答案係：用嘅時間短啲！功率就係「做功有幾快」，等於功除以時間。兩部摩打做嘅功一樣，強摩打用少啲時間，所以功率大啲。單位係瓦特。',
               en: 'The answer: it takes less time! Power is how fast work is done: work divided by time. Both motors do the same work, but the strong one takes less time, so it has more power. Power is measured in watts.' } },
      adv: { zh: '功率 P = W / t，1 瓦特 = 每秒 1 焦耳。', en: 'Power P = W / t. One watt is one joule per second.' },
      chain: [{ zh: '做同樣的功', en: 'Same work' }, { zh: '時間越短', en: 'Less time' }, { zh: '功率越大', en: 'More power' }],
      items: [43, 37] },
    { id: 'en-sum', who: 'chan', title: { zh: '總結', en: 'Summary' },
      say: { zh: '能量可以由一種變成另一種：勢能變動能，動能又可以變熱能，但總數永遠不變。做功就係轉移能量，功率就係轉移得有幾快。',
             en: "Energy changes from one form to another: potential to kinetic, kinetic to heat, but the total never changes. Doing work transfers energy, and power is how fast it is transferred." },
      chain: [{ zh: '勢能', en: 'PE' }, { zh: '動能', en: 'KE' }, { zh: '熱能', en: 'Heat' }, { zh: '總能量守恆', en: 'Total conserved' }],
      setup: { mode: 'coaster', mu: 0.03, x: -5 }, demo: [['release']], finish: true }
  ];

  /* =====================================================================
   * 3D 場景
   * ===================================================================== */
  const gDrop = new THREE.Group(), gCo = new THREE.Group();
  root.add(gDrop, gCo);
  let dropMeshes = [], tubeTags = [], scale = {}, carG, carHit, bars = [], barTags = [], liftTag, liftCable, readTag;
  function objMesh(kind) {
    const gr = new THREE.Group();
    if (kind === 'ball') mesh(new THREE.SphereGeometry(0.16, 24, 16), std(0x94a3b8, 0.25, 0.9), 0, 0, 0, gr);
    else if (kind === 'feather') { const m = mesh(new THREE.SphereGeometry(0.2, 16, 10), std(0xffffff, 0.9), 0, 0, 0, gr); m.scale.set(1.4, 0.12, 0.45); mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.6, 6), std(0xd6d3d1), 0, 0, 0, gr).rotation.z = Math.PI / 2; }
    else if (kind === 'paper') mesh(new THREE.BoxGeometry(0.5, 0.01, 0.4), std(0xfefce8, 0.9), 0, 0, 0, gr);
    else { const m = mesh(new THREE.IcosahedronGeometry(0.15, 0), std(0xfefce8, 0.95), 0, 0, 0, gr); m.rotation.set(0.4, 0.7, 0.2); }
    return gr;
  }
  function mount() {
    // 落體管
    [-1.5, 1.5].forEach((x, i) => {
      mesh(new THREE.CylinderGeometry(0.42, 0.42, TOP - BOT + 0.6, 32, 1, true), glass(0xbfdbfe, 0.22), x, (TOP + BOT) / 2, 0, gDrop, false);
      mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.2, 32), std(0x475569, 0.5, 0.4), x, BOT - 0.25, 0, gDrop);
      mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.15, 32), std(0x475569, 0.5, 0.4), x, TOP + 0.4, 0, gDrop);
      for (let h = 1; h <= 4; h++) mesh(new THREE.BoxGeometry(0.12, 0.012, 0.012), std(0x334155), x + 0.43, h, 0.05, gDrop, false);
      const holder = new THREE.Group(); holder.position.set(x, 0, 0); gDrop.add(holder);
      dropMeshes.push({ holder, kind: null, mesh: null });
      tubeTags.push(tag('readout light', gDrop, x, TOP + 0.85, 0));
    });
    // 彈簧秤
    const sx = 4.2;
    mesh(new THREE.BoxGeometry(0.15, 4.2, 0.15), std(0x64748b, 0.4, 0.5), sx + 0.7, 2.1, 0, gDrop);
    mesh(new THREE.BoxGeometry(1, 0.12, 0.15), std(0x64748b, 0.4, 0.5), sx + 0.25, 4.15, 0, gDrop);
    mesh(new THREE.BoxGeometry(1.4, 0.1, 0.8), std(0x475569), sx + 0.4, 0.05, 0, gDrop);
    const spring = mesh(new THREE.CylinderGeometry(0.1, 0.1, 1, 12, 1, true), std(0xfacc15, 0.3, 0.6, { wireframe: true }), sx, 3.6, 0, gDrop);
    const block = mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), std(0x334155, 0.3, 0.7), sx, 2.6, 0, gDrop);
    scale = { spring, block, sx, tag: tag('readout', gDrop, sx, 1.6, 0.4) };
    // 過山車軌道
    const pts = [];
    for (let x = -XLIM; x <= XLIM + 1e-6; x += 0.1) pts.push(new THREE.Vector3(x, yOf(x), 0));
    const curve = new THREE.CatmullRomCurve3(pts);
    for (const z of [-0.26, 0.26]) { const tube = mesh(new THREE.TubeGeometry(curve, 160, 0.045, 8), std(0xdc2626, 0.35, 0.4), 0, 0, z, gCo); tube.castShadow = true; }
    for (let x = -XLIM; x <= XLIM; x += 0.4) {
      const sl = mesh(new THREE.BoxGeometry(0.06, 0.04, 0.64), std(0x78350f, 0.8), x, yOf(x) - 0.04, 0, gCo); sl.rotation.z = Math.atan(dyOf(x));
      if (Math.abs(x) > 0.6 && Math.round(x * 10) % 12 === 0) mesh(new THREE.CylinderGeometry(0.04, 0.05, yOf(x), 8), std(0x94a3b8, 0.5, 0.5), x, yOf(x) / 2, 0, gCo);
    }
    mesh(new THREE.BoxGeometry(12.2, 0.05, 1.4), std(0xe0f2fe, 0.9), 0, 0.025, 0, gCo);
    // 高度標記
    for (let h = 0; h <= 2; h += 0.5) mesh(new THREE.BoxGeometry(0.25, 0.015, 0.015), std(0x334155), -6.0, Y0 + h, 0.35, gCo, false);
    // 車
    carG = new THREE.Group(); gCo.add(carG);
    mesh(new THREE.BoxGeometry(0.62, 0.28, 0.5), std(0x2563eb, 0.4), 0, 0.24, 0, carG);
    mesh(new THREE.BoxGeometry(0.36, 0.22, 0.44), std(0xbae6fd, 0.1, 0, { transparent: true, opacity: 0.7 }), -0.05, 0.47, 0, carG);
    for (const sx2 of [-0.2, 0.2]) for (const sz of [-0.26, 0.26]) { const w = mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 14), std(0x111827), sx2, 0.08, sz, carG); w.rotation.x = Math.PI / 2; }
    carHit = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), hiddenMat); carHit.position.y = 0.3; carG.add(carHit);
    readTag = tag('readout', carG, 0, 1.1, 0);
    // 摩打屋 + 纜索
    mesh(new THREE.BoxGeometry(0.8, 0.8, 0.9), std(0x475569, 0.5, 0.3), -6.4, yOf(-5.6) + 0.1, 0, gCo);
    mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.95, 20), std(0xf59e0b, 0.4, 0.4), -6.4, yOf(-5.6) + 0.1, 0, gCo).rotation.x = Math.PI / 2;
    liftCable = kit.beam(gCo, std(0x111827), 0.025); liftCable.visible = false;
    liftTag = tag('readout', gCo, -6.4, yOf(-5.6) + 0.9, 0);
    // 能量柱
    const cols = [0x2563eb, 0xdc2626, 0xd97706, 0x334155];
    const names = [{ zh: '勢能', en: 'PE' }, { zh: '動能', en: 'KE' }, { zh: '熱能', en: 'Heat' }, { zh: '總能量', en: 'Total' }];
    cols.forEach((c, i) => {
      const x = 6.6 + i * 0.55;
      mesh(new THREE.BoxGeometry(0.42, 0.04, 0.42), std(0x94a3b8), x, 0.02, 0.2, gCo);
      const b = mesh(new THREE.BoxGeometry(0.4, 1, 0.4), std(c, 0.5), x, 0.5, 0.2, gCo);
      bars.push(b); barTags.push({ t: tag('readout light', gCo, x, 0.3, 0.45), name: names[i] });
    });
  }

  function placeDropObjects() {
    [p.objL, p.objR].forEach((k, i) => {
      const d = dropMeshes[i];
      if (d.kind !== k) { if (d.mesh) d.holder.remove(d.mesh); d.mesh = objMesh(k); d.holder.add(d.mesh); d.kind = k; }
    });
  }

  /* ---------------- 物理 ---------------- */
  function stepDrop(dt) {
    let landed = 0;
    drops.forEach((d, i) => {
      if (d.state === 'fall') {
        const o = OBJ[i ? p.objR : p.objL], kOverM = 9.8 / (o.vt * o.vt);
        const a = g() - (p.air ? kOverM * d.v * d.v : 0);
        d.v += a * dt; d.y -= d.v * dt;
        if (d.y <= BOT) { d.y = BOT; d.v = 0; d.state = 'landed'; d.tLand = S.simT; ctx.sfx('tick'); ctx.emit('land', { id: i }); }
      }
      if (d.state === 'landed') landed++;
    });
    if (landed === 2 && !S.landedFired) { S.landedFired = true; ctx.emit('landed', {}); }
  }
  function stepCoaster(dt) {
    if (car.lift) {
      const lf = car.lift; lf.t += dt;
      const fr = Math.min(1, lf.t / lf.T);
      car.x = lf.x0 + (lf.x1 - lf.x0) * fr; car.v = 0;
      if (fr >= 1) { const W = p.m * g() * (yOf(lf.x1) - yOf(lf.x0)); car.lift = null; car.state = 'hold'; S.lastLift = { W, t: lf.T };
        ctx.emit('lifted', { W, t: lf.T });
        ctx.info('lift', () => L({ zh: '⚙️ 摩打做的功', en: '⚙️ Work done by the motor' }), () => L({
          zh: `做功 W = mgh = ${f(W, 1)} J，用了 ${f(lf.T, 1)} s，功率 = ${f(W / lf.T, 1)} W。`,
          en: `Work W = mgh = ${f(W, 1)} J in ${f(lf.T, 1)} s, so power = ${f(W / lf.T, 1)} W.` })); }
      return;
    }
    if (car.state !== 'run') return;
    const gg = g(), d1 = dyOf(car.x), th = Math.atan(d1), cos = Math.cos(th), sin = Math.sin(th);
    const kap = 0.136 / Math.pow(1 + d1 * d1, 1.5), Nm = gg * cos + car.v * car.v * kap;
    const fr = p.mu * Nm;
    if (Math.abs(car.v) < 0.03 && Math.abs(gg * sin) <= fr) { car.v = 0; car.state = 'stop'; ctx.emit('stop', {}); return; }
    let a = -gg * sin;
    if (car.v !== 0) a -= Math.sign(car.v) * fr; else a -= Math.sign(-gg * sin) * Math.min(fr, Math.abs(gg * sin));
    const v0 = car.v; car.v += a * dt;
    if (p.mu > 0 && v0 !== 0 && Math.sign(car.v) !== Math.sign(v0) && Math.abs(gg * sin) <= fr) car.v = 0;
    car.heat += p.m * fr * Math.abs(car.v) * dt;
    car.x += car.v * cos * dt;
    if (car.x < -XLIM) { car.x = -XLIM; car.v = Math.abs(car.v) * 0.3; }
    if (car.x > XLIM) { car.x = XLIM; car.v = -Math.abs(car.v) * 0.3; }
  }
  const energy = () => { const PE = p.m * g() * (yOf(car.x) - Y0), KE = 0.5 * p.m * car.v * car.v; return { PE, KE, Q: car.heat, ET: PE + KE + car.heat }; };
  function sample() {
    if (p.mode === 'drop') H.push(S.simT, { vL: drops[0].state === 'hold' ? NaN : drops[0].v, vR: drops[1].state === 'hold' ? NaN : drops[1].v });
    else { const e = energy(); H.push(S.simT, e); }
  }
  function resetState() {
    drops.forEach((d) => { d.y = TOP; d.v = 0; d.state = 'hold'; });
    S.landedFired = false;
    car.v = 0; car.heat = 0; car.state = 'hold'; car.lift = null;
    S.simT = 0; S.lastSample = -1; H.reset();
    S.Emax = Math.max(1, energy().ET);
  }
  function apply(s = {}) {
    Object.assign(p, DEF);
    for (const k of Object.keys(DEF)) if (s[k] !== undefined) p[k] = s[k];
    car.x = s.x ?? -5; S.home = car.x;
    ghost = null; resetState(); syncMode();
  }
  function syncMode() { gDrop.visible = p.mode === 'drop'; gCo.visible = p.mode === 'coaster'; placeDropObjects(); }
  function again() { if (H.n > 5) ghost = { t: H.t.slice(), c: Object.fromEntries(Object.entries(H.c).map(([k, v]) => [k, v.slice()])) }; car.x = S.home; resetState(); }
  function setParam(k, v) {
    p[k] = v;
    if (k === 'objL' || k === 'objR' || k === 'air') { drops.forEach((d) => { d.y = TOP; d.v = 0; d.state = 'hold'; }); S.landedFired = false; placeDropObjects(); }
    if (k === 'planet' || k === 'm') S.Emax = Math.max(S.Emax, energy().ET, 1);
  }
  function act(a) {
    if (a[0] === 'drop') { drops.forEach((d) => { d.y = TOP; d.v = 0; d.state = 'fall'; }); S.landedFired = false; S.simT = 0; S.lastSample = -1; H.reset(); ctx.sfx('click'); ctx.emit('drop', {}); }
    if (a[0] === 'release') { if (car.lift) return; car.heat = 0; S.Emax = Math.max(1, energy().ET); car.state = 'run'; S.simT = 0; S.lastSample = -1; H.reset(); ctx.sfx('click'); ctx.emit('release', {}); }
    if (a[0] === 'lift') {
      if (car.lift) return;
      car.x = 0; car.v = 0; car.heat = 0; car.state = 'hold';
      const x1 = -5, W = p.m * g() * (yOf(x1) - yOf(0));
      car.lift = { x0: 0, x1, t: 0, T: W / p.P };
      S.Emax = Math.max(1, p.m * g() * (yOf(x1) - Y0));
      ctx.sfx('click'); ctx.emit('lift', {});
    }
  }

  /* ---------------- 每幀 ---------------- */
  function update(dt) {
    const n = Math.max(1, Math.ceil(dt / (1 / 500)));
    for (let i = 0; i < n; i++) {
      const h = dt / n;
      if (p.mode === 'drop') stepDrop(h); else stepCoaster(h);
      S.simT += h;
      if (S.simT - S.lastSample >= 1 / 30) { S.lastSample = S.simT; sample(); }
    }
    if (p.mode === 'drop') {
      drops.forEach((d, i) => {
        const m = dropMeshes[i].mesh; if (!m) return;
        m.position.y = d.y;
        if ((i ? p.objR : p.objL) === 'feather' && d.state === 'fall' && p.air) { m.rotation.z = Math.sin(S.simT * 5 + i) * 0.4; m.position.x = Math.sin(S.simT * 3) * 0.12; }
        else { m.rotation.z = 0; m.position.x = 0; }
      });
      const W = 1 * g(), ext = clamp(W / 9.8, 0.1, 2.6) * 0.55;
      scale.spring.scale.y = ext; scale.spring.position.y = 4.05 - ext / 2; scale.block.position.y = 4.05 - ext - 0.22;
    } else {
      const d1 = dyOf(car.x);
      carG.position.set(car.x, yOf(car.x) + 0.02, 0); carG.rotation.z = Math.atan(d1);
      const e = energy(), Em = Math.max(S.Emax, e.ET, 1);
      [e.PE, e.KE, e.Q, e.ET].forEach((v, i) => { const h = Math.max(0.01, (v / Em) * 3); bars[i].scale.y = h; bars[i].position.y = h / 2 + 0.04; barTags[i].t.o.position.y = h + 0.3; });
      liftCable.visible = !!car.lift;
      if (car.lift) liftCable.set(-6.0, yOf(-5.6) + 0.1, 0, car.x - 0.3, yOf(car.x) + 0.25, 0);
    }
  }
  function labels() {
    tubeTags.forEach((t, i) => (t.el.innerHTML = `${L(OBJ[i ? p.objR : p.objL])}<small>${p.air ? L({ zh: '💨 有空氣', en: '💨 air' }) : L({ zh: '⚪ 真空', en: '⚪ vacuum' })}</small>`));
    scale.tag.el.innerHTML = L({ zh: `質量 1 kg`, en: `Mass 1 kg` }) + `<small>${L({ zh: '重量', en: 'Weight' })} ${f(g(), 1)} N · ${L(PNAME[p.planet])}</small>`;
    const e = energy();
    readTag.el.innerHTML = `${f(Math.abs(car.v), 1)} m/s<small>${L({ zh: '高度', en: 'height' })} ${f(yOf(car.x) - Y0, 2)} m</small>`;
    barTags.forEach((b, i) => (b.t.el.innerHTML = `${L(b.name)}<small>${f([e.PE, e.KE, e.Q, e.ET][i], 1)} J</small>`));
    liftTag.o.visible = p.mode === 'coaster';
    liftTag.el.innerHTML = `⚙️ ${p.P} W` + (car.lift ? `<small>${f(car.lift.t, 1)} / ${f(car.lift.T, 1)} s</small>` : '');
  }

  /* ---------------- 觸控：拖車到起點高度 ---------------- */
  const vplane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hp = new THREE.Vector3();
  let dragging = false;
  function pointerDown(e, ray) {
    if (p.mode !== 'coaster' || car.lift) return false;
    if (!ray.intersectObject(carHit, false).length) return false;
    dragging = true; car.state = 'hold'; car.v = 0; car.heat = 0; return true;
  }
  function pointerMove(e, ray) { if (!dragging) return; if (ray.ray.intersectPlane(vplane, hp)) { car.x = clamp(hp.x, -XLIM + 0.1, XLIM - 0.1); S.home = car.x; S.Emax = Math.max(1, energy().ET); } }
  function pointerUp() { if (!dragging) return; dragging = false; act(['release']); }
  function tap(ray) {
    if (p.mode === 'drop') {
      const hits = ray.intersectObject(scale.block, false);
      if (hits.length) { ctx.info('scale', () => L({ zh: '彈簧秤', en: 'Spring scale' }), () => L({ zh: `質量 1 kg 不論在哪裏都一樣；重量 = mg = ${f(g(), 1)} N（${PNAME[p.planet].zh}）。`, en: `A 1 kg mass is 1 kg anywhere; its weight = mg = ${f(g(), 1)} N on ${PNAME[p.planet].en}.` })); return true; }
      return false;
    }
    if (ray.intersectObject(carHit, false).length) { const e = energy(); ctx.info('car', () => L({ zh: '過山車', en: 'Coaster cart' }), () => L({ zh: `勢能 ${f(e.PE, 1)} J，動能 ${f(e.KE, 1)} J，熱能 ${f(e.Q, 1)} J，總能量 ${f(e.ET, 1)} J。`, en: `PE ${f(e.PE, 1)} J, KE ${f(e.KE, 1)} J, heat ${f(e.Q, 1)} J, total ${f(e.ET, 1)} J.` })); return true; }
    return false;
  }
  function screenPos(a) {
    let v;
    if (a[0] === 'drop') v = new THREE.Vector3(0, TOP + 0.4, 0);
    else if (a[0] === 'release') v = new THREE.Vector3(car.x, yOf(car.x) + 0.4, 0);
    else if (a[0] === 'lift') v = new THREE.Vector3(-6.4, yOf(-5.6) + 0.1, 0);
    else return null;
    v.project(ctx.camera); return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight };
  }
  function describeGraph(id) {
    const z = ctx.lang() === 'zh';
    if (id === 'v') return z ? '呢個係下跌速度對時間嘅圖。直線代表速度每秒增加一樣多，即係加速度不變。有空氣嘅時候，羽毛條線好快變平，因為空氣阻力令佢唔再加速。'
      : 'This graph shows falling speed against time. A straight line means the speed rises by the same amount each second: constant acceleration. With air, the feather’s line soon goes flat because air resistance stops it speeding up.';
    const e = energy();
    return z ? `呢個係能量對時間嘅圖。藍色係勢能，紅色係動能，橙色係熱能，黑色係總能量。勢能同動能會互相轉換，但黑色總能量線保持平。而家總能量係 ${f(e.ET, 1)} J。`
      : `This is an energy–time graph. Blue is potential energy, red is kinetic energy, orange is heat and black is the total. PE and KE swap back and forth, but the black total stays flat. Right now the total is ${f(e.ET, 1)} J.`;
  }

  return {
    board: { title: 'Gravity & Energy · 重力與能量', lines: ['W = mg', 'PE = mgh', 'KE = ½mv²', 'P = W/t'],
      info: { zh: '黑板上的公式：重量 W = mg；勢能 PE = mgh；動能 KE = ½mv²；功率 P = W/t。', en: 'Board formulas: weight W = mg; potential energy PE = mgh; kinetic energy KE = ½mv²; power P = W/t.' } },
    camera: { pos: [0, 4.6, 11.5], target: [0.5, 1.3, 0] },
    params, graphs,
    buttons: [{ label: { zh: '⬇️ 放手', en: '⬇️ Drop' }, act: ['drop'], cls: 'btn-primary', show: () => p.mode === 'drop' },
      { label: { zh: '▶️ 放手', en: '▶️ Release' }, act: ['release'], cls: 'btn-primary', show: () => p.mode === 'coaster' },
      { label: { zh: '⚙️ 摩打拉上去', en: '⚙️ Motor lift' }, act: ['lift'], show: () => p.mode === 'coaster' },
      { label: { zh: '🔄 重設', en: '🔄 Reset' }, act: ['again'] }],
    lessons: [
      { id: 'gravity', icon: '🪶', subs: ['2.1', '2.2'], items: [29, 32, 36],
        title: { zh: '重力、質量與重量', en: 'Gravity, mass and weight' },
        desc: { zh: '鐵波同羽毛邊個先到底？去月球你會變輕嗎？', en: 'Which lands first, a ball or a feather? Would you weigh less on the Moon?' },
        base: { mode: 'drop' }, params: ['air', 'objL', 'objR', 'planet'], graphs: ['v'],
        camera: { pos: [1.2, 3.8, 9.5], target: [1.2, 2.3, 0] }, stages: gravityStages },
      { id: 'energy', icon: '🎢', subs: ['2.3'], items: [37, 38, 39, 40, 41, 42, 43],
        title: { zh: '能量過山車：功、能量和功率', en: 'Energy coaster: work, energy and power' },
        desc: { zh: '勢能變動能、能量守恆、摩擦生熱、摩打的功率。', en: 'PE into KE, conservation of energy, friction and heat, and motor power.' },
        base: { mode: 'coaster' }, params: ['m', 'mu', 'P'], graphs: ['E'], stages: energyStages }
    ],
    mount, apply, again, act, update, labels, setParam,
    getParam: (k) => p[k], hist: () => H, ghost: () => ghost, simTime: () => S.simT,
    pointerDown, pointerMove, pointerUp, tap, screenPos, describeGraph
  };
}
