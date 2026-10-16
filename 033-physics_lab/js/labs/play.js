/* =====================================================================
 * 實驗枱：遊樂場（play）⭐ 加料
 * 單元：⚖️ 蹺蹺板與力矩（P1）、🏀 拋射運動（P2）、🌀 圓周運動（P3）
 * 模式：seesaw / proj / circ
 * ===================================================================== */
export default function create(ctx) {
  const { THREE, kit, root } = ctx;
  const { std, mesh, tag, hiddenMat, Hist, C, f } = kit;
  const L = kit.L2(ctx.lang);
  const clamp = THREE.MathUtils.clamp;
  const G = 9.8;

  const DEF = { mode: 'seesaw', mL: 40, dL: 1.5, mR: 20, dR: 1.5, angle: 45, v: 8, tower: false, cv: 3, r: 2 };
  const p = { ...DEF };
  const params = [
    { key: 'mL', label: { zh: '👨 左邊重量', en: '👨 Left mass' }, min: 10, max: 60, step: 5, unit: 'kg' },
    { key: 'dL', label: { zh: '↔️ 左邊距離支點', en: '↔️ Left distance from pivot' }, min: 0.5, max: 3, step: 0.25, unit: 'm' },
    { key: 'mR', label: { zh: '👦 右邊重量', en: '👦 Right mass' }, min: 10, max: 60, step: 5, unit: 'kg' },
    { key: 'dR', label: { zh: '↔️ 右邊距離支點', en: '↔️ Right distance from pivot' }, min: 0.5, max: 3, step: 0.25, unit: 'm' },
    { key: 'angle', label: { zh: '📐 發射角度', en: '📐 Launch angle' }, min: 0, max: 85, step: 5, unit: '°' },
    { key: 'v', label: { zh: '💨 發射速度', en: '💨 Launch speed' }, min: 3, max: 11, step: 0.5, unit: 'm/s' },
    { key: 'tower', type: 'toggle', label: { zh: '🗼 由 3 m 高台發射，並同時放下另一個波', en: '🗼 Launch from a 3 m tower and drop a second ball' } },
    { key: 'cv', label: { zh: '💨 轉動速度', en: '💨 Spinning speed' }, min: 1, max: 6, step: 0.5, unit: 'm/s' },
    { key: 'r', label: { zh: '📏 繩長（半徑）', en: '📏 String length (radius)' }, min: 1, max: 3, step: 0.25, unit: 'm' }
  ];
  const graphs = [
    { id: 'traj', mode: 'xy', tab: { zh: '軌跡 y–x', en: 'Path y–x' }, y: { zh: '高度 y (m)', en: 'height y (m)' }, x: { zh: '水平距離 x (m)', en: 'distance x (m)' }, min: 2,
      series: [['y', { zh: '射出的波', en: 'Launched ball' }, C.red], ['y2', { zh: '放下的波', en: 'Dropped ball' }, C.blue]],
      data: () => ({ x: trail.x, c: { y: trail.y, y2: trail.y2 }, ghost: lastTrail ? { x: lastTrail.x, c: { y: lastTrail.y } } : null }) },
    { id: 'yt', tab: { zh: '高度 y–t', en: 'Height y–t' }, y: { zh: '高度 y (m)', en: 'height y (m)' }, min: 2, series: [['hy', { zh: '射出的波', en: 'Launched ball' }, C.red], ['hy2', { zh: '放下的波', en: 'Dropped ball' }, C.blue]] }
  ];
  const ALL = ['mL', 'dL', 'mR', 'dR', 'angle', 'v', 'tower', 'cv', 'r'];

  /* ---------------- 狀態 ---------------- */
  const S = { simT: 0, lastSample: -1 };
  const see = { th: 0, w: 0, balancedFired: false };
  const X0 = -5.5;
  const ball = { on: false, x: X0, y: 0.5, vx: 0, vy: 0, t: 0 }, ball2 = { on: false, y: 3, vy: 0 };
  let trail = { x: [], y: [], y2: [] }, lastTrail = null;
  const circ = { a: 0, free: false, px: 0, pz: 0, vx: 0, vz: 0 };
  const H = new Hist(['hy', 'hy2']);
  let ghost = null;

  /* ---------------- 教學 ---------------- */
  const leverStages = [
    { id: 'lv-intro', who: 'chan', title: { zh: '蹺蹺板', en: 'The seesaw' },
      say: { zh: '爸爸 40 kg，小明 20 kg，兩個都坐喺離中間 1.5 米。蹺蹺板向爸爸嗰邊沉落去。點樣先可以平衡呢？',
             en: 'Dad is 40 kg and Ming is 20 kg, both sitting 1.5 metres from the middle. The seesaw tips down on Dad’s side. How can we balance it?' },
      setup: { mode: 'seesaw', mL: 40, dL: 1.5, mR: 20, dR: 1.5 }, items: ['P1'] },
    { id: 'lv-predict', who: 'chan', title: { zh: '估一估', en: 'Predict' },
      say: { zh: '爸爸唔郁，只可以改變小明坐嘅位置。', en: "Dad stays put. We can only change where Ming sits." },
      setup: { mode: 'seesaw', mL: 40, dL: 1.5, mR: 20, dR: 1.5 }, lock: ALL,
      quiz: { q: { zh: '小明應該坐喺邊度，先可以令蹺蹺板平衡？', en: 'Where should Ming sit to balance the seesaw?' },
        opts: [{ zh: '坐近啲中間', en: 'Closer to the middle' }, { zh: '坐遠啲，去到兩倍距離', en: 'Further out, at twice the distance' }, { zh: '冇可能平衡', en: "It can't be balanced" }], ans: 1,
        run: [['set', 'dR', 3]], watch: 2.5,
        why: { zh: '答案係：坐遠啲，去到 3 米！小明輕一半，所以要坐遠一倍。重量乘距離兩邊一樣，蹺蹺板就平衡。',
               en: "The answer: further out, at 3 metres! Ming is half as heavy, so he sits twice as far. When weight times distance is the same on both sides, the seesaw balances." } },
      chain: [{ zh: '小明輕一半', en: 'Ming is half as heavy' }, { zh: '坐遠一倍', en: 'Sits twice as far' }, { zh: '兩邊力矩相等，平衡', en: 'Equal moments: balanced' }],
      items: ['P1'] },
    { id: 'lv-moment', who: 'chan', title: { zh: '力矩', en: 'Moments' },
      say: { zh: '令物件轉動嘅效果叫力矩，等於力乘以力同支點嘅距離。好似推門：喺門柄度推好易，喺門鉸度推就好難，因為距離太短，力矩太細。',
             en: "The turning effect of a force is called a moment: the force times its distance from the pivot. Think of pushing a door: easy at the handle, hard near the hinges, because the distance is short and the moment is small." },
      setup: { mode: 'seesaw', mL: 40, dL: 1.5, mR: 20, dR: 3 },
      adv: { zh: '力矩 = F × d；平衡時，順時針力矩 = 逆時針力矩。', en: 'Moment = F × d. In balance, clockwise moments = anticlockwise moments.' },
      chain: [{ zh: '力越大', en: 'Bigger force' }, { zh: '距離越遠', en: 'Further from the pivot' }, { zh: '力矩越大', en: 'Bigger moment' }],
      items: ['P1'] },
    { id: 'lv-try', who: 'ming', title: { zh: '到你平衡', en: 'Your turn to balance' },
      say: { zh: '左邊 30 kg 坐 2 米，右邊 20 kg 坐 1 米。調校右邊距離，令蹺蹺板平衡！', en: 'Left: 30 kg at 2 metres. Right: 20 kg at 1 metre. Adjust the right-hand distance to balance the seesaw!' },
      task: { zh: '只改變右邊距離，令蹺蹺板平衡', en: 'Change only the right distance to balance it' },
      setup: { mode: 'seesaw', mL: 30, dL: 2, mR: 20, dR: 1 }, lock: ['mL', 'dL', 'mR'],
      goal: { type: 'balanced' }, demo: [['openTools'], ['set', 'dR', 3]], settle: 1.5,
      adv: { zh: '30 × 2 = 60，所以右邊要 20 × d = 60，d = 3 m。', en: '30 × 2 = 60, so the right needs 20 × d = 60, giving d = 3 m.' }, items: ['P1'] },
    { id: 'lv-apply', who: 'chan', title: { zh: '生活中的槓桿', en: 'Levers in daily life' },
      say: { zh: '剪刀、開瓶器、扳手都係槓桿，都係用力矩幫我哋慳力。', en: 'Scissors, bottle openers and spanners are all levers. They use moments to make work easier.' },
      quiz: { q: { zh: '扭螺絲用長柄扳手有咩好處？', en: 'Why use a long spanner to turn a bolt?' },
        opts: [{ zh: '用細啲力都扭得郁', en: 'A smaller force can turn it' }, { zh: '螺絲會轉得快啲', en: 'The bolt spins faster' }, { zh: '冇分別', en: 'It makes no difference' }], ans: 0,
        why: { zh: '答案係：用細啲力都扭得郁！距離長咗，同一個力矩只需要細啲嘅力。', en: 'The answer: a smaller force can turn it! With a longer distance, the same moment needs a smaller force.' } },
      chain: [{ zh: '柄更長', en: 'Longer handle' }, { zh: '距離更遠', en: 'Bigger distance' }, { zh: '用較小的力', en: 'Less force needed' }], items: ['P1'] },
    { id: 'lv-sum', who: 'chan', title: { zh: '總結', en: 'Summary' },
      say: { zh: '記住：力矩等於力乘距離。兩邊力矩一樣，就會平衡。想慳力，就將力用喺遠離支點嘅地方。',
             en: 'Remember: moment equals force times distance. Equal moments on both sides means balance. To save effort, push far from the pivot.' },
      setup: { mode: 'seesaw', mL: 40, dL: 1.5, mR: 20, dR: 3 }, finish: true }
  ];

  const projStages = [
    { id: 'pj-intro', who: 'chan', title: { zh: '發射！', en: 'Launch!' },
      say: { zh: '呢部發射器可以調角度同速度。撳「發射」，睇吓個波飛出去嘅路線，係一條彎彎嘅拋物線。',
             en: "This launcher can change its angle and speed. Tap 'Launch' and watch the ball's path: a curved shape called a parabola." },
      task: { zh: '按「發射」', en: "Tap 'Launch'" },
      setup: { mode: 'proj', angle: 45, v: 8, tower: false }, graph: 'traj',
      goal: { type: 'land' }, demo: [['launch']], settle: 1.2, items: ['P2'] },
    { id: 'pj-drop', who: 'chan', title: { zh: '打橫射 vs 直接跌：估一估', en: 'Fired sideways vs dropped: predict' },
      say: { zh: '而家喺 3 米高台上面，一個波打橫射出去，另一個波同時直接放手。', en: 'Now from a 3 metre tower, one ball is fired sideways while another is simply dropped at the same moment.' },
      setup: { mode: 'proj', angle: 0, v: 6, tower: true }, lock: ALL, graph: 'yt',
      quiz: { q: { zh: '邊個波先落地？', en: 'Which ball lands first?' },
        opts: [{ zh: '打橫射出嗰個', en: 'The one fired sideways' }, { zh: '直接放手嗰個', en: 'The dropped one' }, { zh: '一齊落地', en: 'They land together' }], ans: 2,
        run: [['launch'], ['until', 'landed2', 4]], watch: 0.4,
        why: { zh: '答案係：一齊落地！睇吓高度–時間圖，兩條線重疊。打橫嘅速度唔會影響向下跌嘅速度，重力對兩個波都一樣。',
               en: "The answer: they land together! On the height–time graph the two lines overlap. Moving sideways doesn't change how fast a ball falls; gravity pulls both the same." } },
      chain: [{ zh: '水平速度不影響下跌', en: "Sideways speed doesn't affect falling" }, { zh: '兩個波下跌一樣快', en: 'Both fall equally fast' }, { zh: '同時落地', en: 'They land together' }],
      items: ['P2'] },
    { id: 'pj-indep', who: 'ming', title: { zh: '兩個方向，各自獨立', en: 'Two independent directions' },
      say: { zh: '我明喇！拋射可以拆開兩樣嘢諗：打橫方向冇力推，所以速度不變；直向就好似自由落體咁，越跌越快。',
             en: 'I get it! Split a throw into two parts: sideways there is no force, so the speed stays the same; up and down it is just like free fall, getting faster and faster.' },
      setup: { mode: 'proj', angle: 0, v: 6, tower: true }, graph: 'traj', demo: [['launch'], ['until', 'landed2', 4]],
      chain: [{ zh: '水平：速度不變', en: 'Sideways: constant speed' }, { zh: '垂直：自由落體', en: 'Vertical: free fall' }, { zh: '合埋就係拋物線', en: 'Together: a parabola' }], items: ['P2'] },
    { id: 'pj-angle', who: 'chan', title: { zh: '最遠的角度：估一估', en: 'Best angle: predict' },
      say: { zh: '速度唔變，我哋試三個角度：30°、45° 同 60°。', en: "Keeping the speed the same, we'll try three angles: 30°, 45° and 60°." },
      cond: [{ zh: '只改變：角度', en: 'Only change: angle' }, { zh: '保持不變：速度 8 m/s', en: 'Kept the same: 8 m/s' }],
      setup: { mode: 'proj', angle: 30, v: 8, tower: false }, lock: ALL, graph: 'traj',
      quiz: { q: { zh: '速度一樣，用咩角度射得最遠？', en: 'At the same speed, which angle goes furthest?' },
        opts: [{ zh: '30°', en: '30°' }, { zh: '45°', en: '45°' }, { zh: '60°', en: '60°' }], ans: 1,
        run: [['set', 'angle', 30], ['launch'], ['until', 'land', 3], ['again'], ['set', 'angle', 60], ['launch'], ['until', 'land', 3], ['again'], ['set', 'angle', 45], ['launch'], ['until', 'land', 3]], watch: 0.4,
        why: { zh: '答案係：45°！角度太低，波好快落地；角度太高，波飛得高但唔夠遠。45° 啱啱好。仲有，30° 同 60° 會落喺差唔多同一個位！',
               en: 'The answer: 45°! Too low, and the ball lands too soon; too high, and it goes up but not far. 45° is just right. Also, 30° and 60° land in almost the same place!' } },
      adv: { zh: '冇空氣阻力時，射程 R = v² sin 2θ ÷ g，θ = 45° 時最大。', en: 'Without air resistance, range R = v² sin 2θ ÷ g, which is greatest at θ = 45°.' }, items: ['P2'] },
    { id: 'pj-try', who: 'ming', title: { zh: '自己試', en: 'Try it yourself' },
      say: { zh: '試吓 20° 同 70°，佢哋會唔會都落喺同一個位？', en: 'Try 20° and 70°. Will they land in the same place too?' },
      task: { zh: '轉一個新角度再發射', en: 'Pick a new angle and launch' },
      setup: { mode: 'proj', angle: 20, v: 8, tower: false }, graph: 'traj',
      goal: { type: 'land', test: () => p.angle >= 65 }, demo: [['launch'], ['until', 'land', 3], ['again'], ['openTools'], ['set', 'angle', 70], ['launch']], settle: 1.5, items: ['P2'] },
    { id: 'pj-sum', who: 'chan', title: { zh: '總結', en: 'Summary' },
      say: { zh: '拋射運動 = 打橫勻速 + 直向自由落體。冇空氣阻力時，45° 射得最遠。打籃球、踢足球都用得著！',
             en: 'Projectile motion = steady sideways motion + vertical free fall. Without air resistance, 45° goes furthest. Handy for basketball and football!' },
      finish: true }
  ];

  const circStages = [
    { id: 'ci-intro', who: 'chan', title: { zh: '轉圈圈', en: 'Going round' },
      say: { zh: '一個波綁住條繩，喺中間條柱度轉圈。綠色箭咀係波嘅速度方向，橙色箭咀係繩拉住波嘅力。',
             en: 'A ball on a string is swinging round a post. The green arrow shows which way the ball is moving; the orange arrow is the string pulling on it.' },
      setup: { mode: 'circ', cv: 3, r: 2 }, items: ['P3'] },
    { id: 'ci-why', who: 'chan', title: { zh: '為甚麼會轉圈？', en: 'Why does it go round?' },
      say: { zh: '記得牛頓第一定律嗎？冇外力，郁緊嘅嘢會一直直線郁。', en: "Remember Newton's first law? With no outside force, a moving thing keeps going in a straight line." },
      quiz: { q: { zh: '點解個波會一直轉圈，而唔係直線飛走？', en: 'Why does the ball keep going round instead of flying off in a straight line?' },
        opts: [{ zh: '因為條繩一直向中心拉住佢', en: 'The string keeps pulling it towards the centre' }, { zh: '因為個波鍾意轉圈', en: 'The ball likes going round' }, { zh: '因為有風', en: "Because of the wind" }], ans: 0,
        why: { zh: '答案係：條繩一直向中心拉！每一刻，繩都將個波拉向中心，令佢轉彎。呢個指向中心嘅力叫向心力。',
               en: 'The answer: the string keeps pulling it towards the centre! At every moment, the string pulls the ball inwards and makes it turn. This inward force is called the centripetal force.' } },
      chain: [{ zh: '繩向中心拉', en: 'The string pulls inwards' }, { zh: '波不斷轉彎', en: 'The ball keeps turning' }, { zh: '走一個圓圈', en: 'It goes in a circle' }], items: ['P3'] },
    { id: 'ci-cut', who: 'ming', title: { zh: '剪斷條繩：估一估', en: 'Cut the string: predict' },
      say: { zh: '如果條繩突然斷咗呢？', en: 'What if the string suddenly breaks?' },
      setup: { mode: 'circ', cv: 3, r: 2 }, lock: ALL,
      quiz: { q: { zh: '條繩斷咗之後，個波會點飛？', en: 'After the string breaks, how does the ball move?' },
        opts: [{ zh: '向外直飛，遠離中心', en: 'Straight outwards, away from the centre' }, { zh: '沿住圓圈嘅切線直線飛走', en: 'Straight along the tangent of the circle' }, { zh: '繼續轉圈', en: 'It keeps going round' }], ans: 1,
        run: [['release']], watch: 1.5,
        why: { zh: '答案係：沿住切線直線飛走！繩一斷，就冇力再拉佢轉彎，所以個波會跟住當刻嘅速度方向直線郁，呢個正正係牛頓第一定律。',
               en: "The answer: straight along the tangent! Once the string breaks, nothing pulls it round any more, so it carries on in a straight line in whatever direction it was moving. That's Newton's first law again." } },
      chain: [{ zh: '繩斷了', en: 'The string breaks' }, { zh: '冇向心力', en: 'No inward force' }, { zh: '沿切線直線走', en: 'Straight along the tangent' }], items: ['P3'] },
    { id: 'ci-fast', who: 'chan', title: { zh: '轉得快啲：估一估', en: 'Faster: predict' },
      say: { zh: '繩長不變，個波轉得快一倍。', en: 'Same string length, but the ball goes twice as fast.' },
      setup: { mode: 'circ', cv: 3, r: 2 }, lock: ALL,
      quiz: { q: { zh: '條繩要用幾大力先拉得住？', en: 'How hard must the string pull now?' },
        opts: [{ zh: '一樣', en: 'The same' }, { zh: '兩倍', en: 'Twice as hard' }, { zh: '四倍', en: 'Four times as hard' }], ans: 2,
        run: [['set', 'cv', 6]], watch: 1.5,
        why: { zh: '答案係：四倍！睇吓繩上面嘅讀數。向心力同速度嘅平方有關，速度加倍，力就變四倍。所以車轉彎太快會好危險。',
               en: "The answer: four times! Check the reading on the string. The inward force depends on speed squared, so doubling the speed makes it four times bigger. That's why turning a corner too fast is dangerous." } },
      adv: { zh: '向心力 F = mv² ÷ r。', en: 'Centripetal force F = mv² ÷ r.' }, items: ['P3'] },
    { id: 'ci-try', who: 'ming', title: { zh: '生活中的圓周運動', en: 'Circular motion in life' },
      say: { zh: '洗衣機脫水、車轉彎、遊樂場嘅旋轉木馬都係圓周運動。試吓將條繩放長，睇吓拉力有咩變化。',
             en: 'Spin-drying clothes, cars turning corners and merry-go-rounds are all circular motion. Try a longer string and see how the pull changes.' },
      task: { zh: '把繩長調到 3 m', en: 'Set the string length to 3 m' },
      setup: { mode: 'circ', cv: 3, r: 2 },
      goal: { type: 'param', test: () => p.r >= 3 }, demo: [['openTools'], ['set', 'r', 3]], settle: 2,
      chain: [{ zh: '半徑變大', en: 'Bigger radius' }, { zh: '轉彎比較緩', en: 'Gentler turn' }, { zh: '需要的力變小', en: 'Less force needed' }], items: ['P3'] },
    { id: 'ci-sum', who: 'chan', title: { zh: '總結', en: 'Summary' },
      say: { zh: '轉圈需要一個一直指向中心嘅力。冇咗呢個力，物件就會沿切線直線飛走。速度越快、半徑越細，需要嘅力就越大。',
             en: 'Going in a circle needs a force that always points to the centre. Without it, things fly off in a straight line along the tangent. The faster the speed and the tighter the circle, the bigger the force needed.' },
      finish: true }
  ];

  /* =====================================================================
   * 3D 場景
   * ===================================================================== */
  const gSee = new THREE.Group(), gProj = new THREE.Group(), gCirc = new THREE.Group();
  root.add(gSee, gProj, gCirc);
  let plank, kidL, kidR, momTags = [], balTag, cannon, ballM, ball2M, tower, dots = [], ghostDots = [], rangeTag, circBall, circStr, arrV, arrF, circTag, circPost;
  function kid(color, hairColor) {
    const g = new THREE.Group();
    mesh(new THREE.CapsuleGeometry(0.22, 0.4, 6, 12), std(color, 0.6), 0, 0.45, 0, g);
    mesh(new THREE.SphereGeometry(0.2, 16, 12), std(0xf2c9a0, 0.7), 0, 0.98, 0, g);
    mesh(new THREE.SphereGeometry(0.21, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), std(hairColor, 0.9), 0, 1.0, 0, g);
    const t = tag('readout light', g, 0, 1.55, 0);
    g.userData.tag = t;
    return g;
  }
  function mount() {
    // 蹺蹺板
    const piv = mesh(new THREE.ConeGeometry(0.45, 0.8, 3), std(0x64748b, 0.4, 0.4), 0, 0.4, 0, gSee); piv.rotation.y = Math.PI / 6;
    plank = new THREE.Group(); plank.position.set(0, 0.85, 0); gSee.add(plank);
    mesh(new THREE.BoxGeometry(6.4, 0.12, 0.7), std(0xd97706, 0.7), 0, 0, 0, plank);
    for (let d = -3; d <= 3; d += 0.5) mesh(new THREE.BoxGeometry(0.02, 0.01, 0.7), std(0x78350f), d, 0.065, 0, plank, false);
    kidL = kid(0x2563eb, 0x111827); kidR = kid(0xdc2626, 0x111827); plank.add(kidL, kidR);
    mesh(new THREE.BoxGeometry(8, 0.04, 2), std(0xbbf7d0, 0.95), 0, 0.02, 0, gSee);
    momTags = [tag('readout', gSee, -2.6, 2.9, 0), tag('readout', gSee, 2.6, 2.9, 0)];
    balTag = tag('readout', gSee, 0, 3.5, 0);
    // 拋射
    mesh(new THREE.BoxGeometry(17, 0.04, 2.4), std(0x86efac, 0.95), 2.3, 0.02, 0, gProj);
    for (let d = 0; d <= 15; d++) {
      mesh(new THREE.BoxGeometry(0.04, 0.012, d % 5 ? 0.5 : 1.2), std(0xffffff), X0 + d, 0.045, 0, gProj, false);
      if (d % 5 === 0) tag('readout light', gProj, X0 + d, 0.15, 0.9).el.textContent = d + ' m';
    }
    tower = mesh(new THREE.BoxGeometry(1, 3, 1), std(0x94a3b8, 0.6), X0 - 0.1, 1.5, 0, gProj);
    cannon = new THREE.Group(); gProj.add(cannon);
    mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.3, 16), std(0x334155), 0, 0, 0, cannon);
    const barrel = new THREE.Group(); cannon.add(barrel); cannon.userData.barrel = barrel;
    const bm = mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.8, 16), std(0x1e293b, 0.3, 0.6), 0, 0.4, 0, barrel); bm.position.set(0.4, 0, 0); bm.rotation.z = -Math.PI / 2;
    ballM = mesh(new THREE.SphereGeometry(0.13, 20, 14), std(0xf97316, 0.4), 0, 0, 0, gProj);
    ball2M = mesh(new THREE.SphereGeometry(0.13, 20, 14), std(0x2563eb, 0.4), 0, 0, 0, gProj);
    const dg = new THREE.SphereGeometry(0.04, 8, 6), dm = std(0xf97316, 0.5), gm = new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.3 });
    for (let i = 0; i < 120; i++) { const d = mesh(dg, dm, 0, -5, 0, gProj, false); dots.push(d); const gd = mesh(dg, gm, 0, -5, 0, gProj, false); ghostDots.push(gd); }
    rangeTag = tag('readout', gProj, 0, 0.6, 0);
    // 圓周
    circPost = mesh(new THREE.CylinderGeometry(0.07, 0.1, 1.4, 12), std(0x334155, 0.4, 0.5), 0, 0.7, 0, gCirc);
    mesh(new THREE.CylinderGeometry(3.6, 3.6, 0.04, 48), std(0xe0f2fe, 0.9), 0, 0.02, 0, gCirc);
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.98, 2.02, 64), new THREE.MeshBasicMaterial({ color: 0x94a3b8, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.05; gCirc.add(ring); gCirc.userData.ring = ring;
    circBall = mesh(new THREE.SphereGeometry(0.2, 20, 14), std(0xf97316, 0.4), 2, 1.2, 0, gCirc);
    circStr = kit.beam(gCirc, std(0x111827), 0.02);
    arrV = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1, 0x16a34a, 0.25, 0.16); gCirc.add(arrV);
    arrF = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1, 0xf97316, 0.25, 0.16); gCirc.add(arrF);
    circTag = tag('readout', gCirc, 0, 2.2, 0);
  }

  /* ---------------- 物理 ---------------- */
  const netMoment = () => (p.mR * p.dR - p.mL * p.dL) * G; // 正 = 右邊向下
  function stepSee(dt) {
    const I = p.mL * p.dL * p.dL + p.mR * p.dR * p.dR + 70;
    const tau = netMoment() * Math.cos(see.th);
    see.w += (tau / I - 2.2 * see.w) * dt;
    see.th += see.w * dt;
    const lim = 0.26;
    if (see.th > lim) { see.th = lim; see.w = 0; } if (see.th < -lim) { see.th = -lim; see.w = 0; }
    const bal = Math.abs(p.mR * p.dR - p.mL * p.dL) < 0.5;
    if (bal) { see.th *= 1 - Math.min(1, dt * 1.5); }
    if (bal && Math.abs(see.th) < 0.02 && !see.balancedFired) { see.balancedFired = true; ctx.sfx('pop'); ctx.emit('balanced', {}); }
    if (!bal) see.balancedFired = false;
  }
  function launch() {
    const y0 = p.tower ? 3.15 : 0.55, th = (p.angle * Math.PI) / 180;
    if (trail.x.length > 3) lastTrail = { x: trail.x.slice(), y: trail.y.slice() };
    Object.assign(ball, { on: true, x: X0 + 0.5 * Math.cos(th), y: y0 + 0.5 * Math.sin(th), vx: p.v * Math.cos(th), vy: p.v * Math.sin(th), t: 0, y0 });
    Object.assign(ball2, { on: p.tower, y: y0, vy: 0, landed: !p.tower });
    trail = { x: [], y: [], y2: [] }; H.reset(); S.simT = 0; S.lastSample = -1; S.landFired = false;
    ctx.sfx('pop'); ctx.emit('launch', {});
  }
  function stepProj(dt) {
    if (ball.on) {
      ball.vy -= G * dt; ball.x += ball.vx * dt; ball.y += ball.vy * dt; ball.t += dt;
      if (ball.y <= 0.13) { ball.y = 0.13; ball.on = false; ball.range = ball.x - X0; ctx.sfx('tick'); ctx.emit('land', { range: ball.range });
        ctx.info('range', () => L({ zh: '🎯 結果', en: '🎯 Result' }), () => L({ zh: `角度 ${p.angle}°，速度 ${p.v} m/s → 射程 ${f(ball.range, 2)} m，飛行時間 ${f(ball.t, 2)} s。`, en: `Angle ${p.angle}°, speed ${p.v} m/s → range ${f(ball.range, 2)} m, flight time ${f(ball.t, 2)} s.` })); }
    }
    if (ball2.on) { ball2.vy -= G * dt; ball2.y += ball2.vy * dt; if (ball2.y <= 0.13) { ball2.y = 0.13; ball2.on = false; ball2.landed = true; ctx.sfx('tick'); } }
    if (!ball.on && ball2.landed && !S.landFired && ball.range != null) { S.landFired = true; if (p.tower) ctx.emit('landed2', {}); }
  }
  function stepCirc(dt) {
    if (!circ.free) { circ.a += (p.cv / p.r) * dt; return; }
    circ.px += circ.vx * dt; circ.pz += circ.vz * dt;
    if (Math.hypot(circ.px, circ.pz) > 7) { circ.vx *= 0.9; circ.vz *= 0.9; }
  }
  function sample() {
    if (p.mode !== 'proj') return;
    if (ball.on || ball2.on) H.push(S.simT, { hy: ball.on || ball.t ? ball.y : NaN, hy2: p.tower ? ball2.y : NaN });
    if (ball.on) { trail.x.push(ball.x - X0); trail.y.push(ball.y); trail.y2.push(p.tower ? ball2.y : NaN); }
  }
  function apply(s = {}) {
    Object.assign(p, DEF);
    for (const k of Object.keys(DEF)) if (s[k] !== undefined) p[k] = s[k];
    see.th = Math.sign(netMoment()) * 0.26; see.w = 0; see.balancedFired = false;
    ball.on = false; ball2.on = false; ball.range = null; ball.t = 0; trail = { x: [], y: [], y2: [] }; lastTrail = null;
    circ.free = false; circ.a = 0;
    H.reset(); S.simT = 0; S.lastSample = -1; ghost = null; sync();
  }
  function sync() { gSee.visible = p.mode === 'seesaw'; gProj.visible = p.mode === 'proj'; gCirc.visible = p.mode === 'circ'; }
  function again() {
    if (p.mode === 'proj') { if (trail.x.length > 3) lastTrail = { x: trail.x.slice(), y: trail.y.slice() }; ball.on = false; ball2.on = false; ball.range = null; ball.t = 0; trail = { x: [], y: [], y2: [] }; H.reset(); }
    if (p.mode === 'circ') { circ.free = false; circ.a = 0; }
    if (p.mode === 'seesaw') { see.th = Math.sign(netMoment()) * 0.26; see.w = 0; }
  }
  function setParam(k, v) { p[k] = v; if (k === 'r' || k === 'cv') circ.free = false; }
  function act(a) {
    if (a[0] === 'launch') launch();
    if (a[0] === 'release' && !circ.free) {
      const r = p.r, w = p.cv / r;
      circ.px = r * Math.cos(circ.a); circ.pz = r * Math.sin(circ.a);
      circ.vx = -p.cv * Math.sin(circ.a); circ.vz = p.cv * Math.cos(circ.a);
      circ.free = true; ctx.sfx('zap'); ctx.emit('released', {});
    }
  }

  /* ---------------- 每幀 ---------------- */
  function update(dt) {
    const n = Math.max(1, Math.ceil(dt / (1 / 300)));
    for (let i = 0; i < n; i++) {
      const h = dt / n;
      if (p.mode === 'seesaw') stepSee(h); else if (p.mode === 'proj') stepProj(h); else stepCirc(h);
      S.simT += h;
      if (S.simT - S.lastSample >= 1 / 30) { S.lastSample = S.simT; sample(); }
    }
    if (p.mode === 'seesaw') {
      plank.rotation.z = -see.th;
      kidL.position.set(-p.dL, 0.06, 0); kidR.position.set(p.dR, 0.06, 0);
      kidL.scale.setScalar(0.6 + p.mL / 100); kidR.scale.setScalar(0.6 + p.mR / 100);
    } else if (p.mode === 'proj') {
      const th = (p.angle * Math.PI) / 180, y0 = p.tower ? 3.15 : 0.55;
      cannon.position.set(X0, y0 - 0.15, 0); cannon.userData.barrel.rotation.z = th; tower.visible = p.tower;
      ballM.visible = ball.on || ball.range != null; ballM.position.set(ball.on || ball.range != null ? ball.x : X0, ball.on || ball.range != null ? ball.y : y0, 0);
      ball2M.visible = p.tower; ball2M.position.set(X0 + 0.05, ball2.on || ball2.landed ? ball2.y : y0, 0.4);
      dots.forEach((d, i) => { const k = Math.floor((i / dots.length) * trail.x.length); d.visible = i < trail.x.length && trail.x.length > 1; if (d.visible) d.position.set(trail.x[Math.min(k, trail.x.length - 1)] + X0, trail.y[Math.min(k, trail.y.length - 1)], 0); });
      ghostDots.forEach((d, i) => { const T = lastTrail; d.visible = !!T && T.x.length > 1; if (d.visible) { const k = Math.floor((i / ghostDots.length) * T.x.length); d.position.set(T.x[k] + X0, T.y[k], 0); } });
    } else {
      const r = p.r, ring = gCirc.userData.ring;
      ring.scale.setScalar(r / 2);
      let bx, bz, vx, vz;
      if (!circ.free) { bx = r * Math.cos(circ.a); bz = r * Math.sin(circ.a); vx = -Math.sin(circ.a); vz = Math.cos(circ.a); }
      else { bx = circ.px; bz = circ.pz; const s = Math.hypot(circ.vx, circ.vz) || 1; vx = circ.vx / s; vz = circ.vz / s; }
      circBall.position.set(bx, 1.2, bz);
      circStr.visible = !circ.free; if (!circ.free) circStr.set(0, 1.35, 0, bx, 1.2, bz);
      arrV.position.set(bx, 1.2, bz); arrV.setDirection(new THREE.Vector3(vx, 0, vz)); arrV.setLength(0.4 + p.cv * 0.18, 0.22, 0.14);
      arrF.visible = !circ.free;
      if (!circ.free) { const F = (0.5 * p.cv * p.cv) / r; arrF.position.set(bx, 1.2, bz); arrF.setDirection(new THREE.Vector3(-bx, 0, -bz).normalize()); arrF.setLength(Math.min(1.8, 0.3 + F * 0.08), 0.22, 0.14); }
      circTag.o.position.set(bx * 0.5, 1.9, bz * 0.5);
    }
  }
  function labels() {
    kidL.userData.tag.el.textContent = `${p.mL} kg`; kidR.userData.tag.el.textContent = `${p.mR} kg`;
    const ML = p.mL * G * p.dL, MR = p.mR * G * p.dR;
    momTags[0].el.innerHTML = L({ zh: '左邊力矩', en: 'Left moment' }) + `<small>${p.mL}×${G}×${p.dL} = ${Math.round(ML)} N·m</small>`;
    momTags[1].el.innerHTML = L({ zh: '右邊力矩', en: 'Right moment' }) + `<small>${p.mR}×${G}×${p.dR} = ${Math.round(MR)} N·m</small>`;
    const bal = Math.abs(MR - ML) < 5;
    balTag.el.className = 'readout ' + (bal ? 'ok' : '');
    balTag.el.textContent = bal ? L({ zh: '⚖️ 平衡！', en: '⚖️ Balanced!' }) : MR > ML ? L({ zh: '右邊較重 ↘', en: 'Right side heavier ↘' }) : L({ zh: '↙ 左邊較重', en: '↙ Left side heavier' });
    rangeTag.o.visible = ball.range != null;
    if (ball.range != null) { rangeTag.o.position.set(ball.x, 0.6, 0); rangeTag.el.textContent = `${f(ball.range, 2)} m`; }
    const F = (0.5 * p.cv * p.cv) / p.r;
    circTag.el.innerHTML = circ.free ? L({ zh: '繩斷了！沿切線飛走', en: 'String broken! Flying off on a tangent' }) : L({ zh: `繩的拉力 ${f(F, 2)} N`, en: `String pull ${f(F, 2)} N` }) + `<small>v ${p.cv} m/s · r ${p.r} m</small>`;
  }
  function tap(ray) {
    if (p.mode === 'seesaw' && ray.intersectObject(plank, true).length) {
      ctx.info('see', () => L({ zh: '蹺蹺板', en: 'Seesaw' }), () => L({ zh: `左邊力矩 ${Math.round(p.mL * G * p.dL)} N·m，右邊力矩 ${Math.round(p.mR * G * p.dR)} N·m。兩邊一樣就會平衡。`, en: `Left moment ${Math.round(p.mL * G * p.dL)} N·m, right moment ${Math.round(p.mR * G * p.dR)} N·m. Equal moments balance.` })); return true;
    }
    if (p.mode === 'circ' && ray.intersectObject(circBall, false).length) { act(['release']); return true; }
    return false;
  }
  function screenPos(a) {
    let v;
    if (a[0] === 'launch') v = new THREE.Vector3(X0, p.tower ? 3.2 : 0.6, 0);
    else if (a[0] === 'release') v = circBall.position.clone();
    else return null;
    v.project(ctx.camera); return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight };
  }
  function describeGraph(id) {
    const z = ctx.lang() === 'zh';
    if (id === 'traj') return z ? '呢個係軌跡圖：橫軸係水平距離，直軸係高度。條線就係個波飛過嘅路線，係一條拋物線。淡色虛線係上一次發射。'
      : 'This is a path graph: the horizontal axis is distance and the vertical axis is height. The line is the path the ball flew along: a parabola. The faint dashed line is the previous launch.';
    return z ? '呢個係高度對時間圖。紅線係射出嘅波，藍線係直接放下嘅波。兩條線重疊，代表佢哋跌落嚟一樣快。'
      : 'This is a height–time graph. Red is the launched ball and blue is the dropped ball. The lines overlap, so they fall just as fast.';
  }
  const cams = { seesaw: { pos: [0, 3.6, 8.5], target: [0, 1.3, 0] }, proj: { pos: [1.5, 4.5, 13], target: [1.5, 1.6, 0] }, circ: { pos: [0, 6.5, 7.5], target: [0, 0.8, 0] } };
  return {
    board: { title: 'Playground Physics · 遊樂場物理', lines: ['M = F × d', 'R = v²sin2θ/g', 'F = mv²/r'],
      info: { zh: '黑板上的公式：力矩 = 力 × 距離；射程公式；向心力 F = mv²/r。', en: 'Board formulas: moment = force × distance; the range formula; centripetal force F = mv²/r.' } },
    camera: cams.seesaw, people: [[-7.4, -2.9, 0.5], [7.4, -2.9, -0.5]],
    params, graphs,
    buttons: [{ label: { zh: '🚀 發射', en: '🚀 Launch' }, act: ['launch'], cls: 'btn-primary', show: () => p.mode === 'proj' },
      { label: { zh: '✂️ 剪斷繩', en: '✂️ Cut the string' }, act: ['release'], cls: 'btn-red', show: () => p.mode === 'circ' },
      { label: { zh: '🔄 重設', en: '🔄 Reset' }, act: ['again'] }],
    lessons: [
      { id: 'lever', icon: '⚖️', subs: ['2.5'], items: ['P1'], title: { zh: '蹺蹺板與力矩', en: 'Seesaws and moments' },
        desc: { zh: '輕的小朋友怎樣跟重的爸爸玩蹺蹺板？', en: 'How can a light child balance a heavy dad on a seesaw?' },
        base: { mode: 'seesaw' }, params: ['mL', 'dL', 'mR', 'dR'], graphs: [], camera: cams.seesaw, stages: leverStages },
      { id: 'projectile', icon: '🏀', subs: ['2.5'], items: ['P2'], title: { zh: '拋射運動', en: 'Projectile motion' },
        desc: { zh: '打橫射和直接跌，邊個先落地？幾多度射得最遠？', en: 'Fired sideways or dropped: which lands first? Which angle goes furthest?' },
        base: { mode: 'proj' }, params: ['angle', 'v', 'tower'], graphs: ['traj', 'yt'], camera: cams.proj, stages: projStages },
      { id: 'circular', icon: '🌀', subs: ['2.5'], items: ['P3'], title: { zh: '圓周運動', en: 'Circular motion' },
        desc: { zh: '為甚麼會轉圈？繩斷了會飛去哪裏？', en: 'Why do things go round? Where do they fly when the string breaks?' },
        base: { mode: 'circ' }, params: ['cv', 'r'], graphs: [], camera: cams.circ, stages: circStages }
    ],
    mount, apply, again, act, update, labels, setParam,
    getParam: (k) => p[k], hist: () => H, ghost: () => ghost, simTime: () => S.simT,
    tap, screenPos, describeGraph
  };
}
