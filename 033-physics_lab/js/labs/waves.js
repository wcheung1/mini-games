/* =====================================================================
 * 實驗枱：波動與聲音台（waves）
 * 單元：〰️ 波的基本（48–55）、💧 水波槽（56–60）、🎵 干涉（61–64）、🔊 聲音與超聲波（76–78）
 * 模式：rope（繩波／彈簧波）、tank（水波槽：二維波動方程數值模擬）、sound（喇叭＋空氣粒子）、sonar（聲納船）
 * ===================================================================== */
export default function create(ctx) {
  const { THREE, kit, root } = ctx;
  const { std, mesh, tag, glass, Hist, C, f } = kit;
  const L = kit.L2(ctx.lang);
  const clamp = THREE.MathUtils.clamp;
  const sc = (zh, en) => ({ zh, en });

  const DEF = { mode: 'rope', wtype: 'trans', rf: 1, A: 0.35, wv: 2, run: false, scen: 'plane', fq: 3, gap: 0.6, sep: 1.6, sf: 2, sA: 0.6, air: true, depth: 300 };
  const p = { ...DEF };
  const SCEN = ['plane', 'reflect', 'concave', 'convex', 'refract', 'gap', 'two'];
  const SCN = { plane: sc('直線波', 'Straight waves'), reflect: sc('平面障礙物', 'Flat barrier'), concave: sc('凹面', 'Concave'), convex: sc('凸面', 'Convex'), refract: sc('深水→淺水', 'Deep → shallow'), gap: sc('窄縫', 'Narrow gap'), two: sc('兩個波源', 'Two sources') };
  const params = [
    { key: 'wtype', type: 'select', label: sc('〰️ 波的種類', '〰️ Wave type'), options: [{ v: 'trans', label: sc('橫波（繩）', 'Transverse (rope)') }, { v: 'long', label: sc('縱波（彈簧）', 'Longitudinal (slinky)') }] },
    { key: 'rf', label: sc('🔁 頻率 f', '🔁 Frequency f'), min: 0.5, max: 2, step: 0.25, unit: 'Hz', hint: sc('每秒振動幾多次', 'Vibrations per second') },
    { key: 'A', label: sc('↕️ 振幅 A', '↕️ Amplitude A'), min: 0.1, max: 0.6, step: 0.05, unit: 'm' },
    { key: 'wv', label: sc('💨 波速 v', '💨 Wave speed v'), min: 1, max: 4, step: 0.5, unit: 'm/s' },
    { key: 'scen', type: 'select', label: sc('🌊 水波槽實驗', '🌊 Ripple tank set-up'), options: SCEN.map((v) => ({ v, label: SCN[v] })) },
    { key: 'fq', label: sc('🔁 水波頻率', '🔁 Ripple frequency'), min: 1, max: 5, step: 1, unit: '', hint: sc('頻率越高，波長越短', 'Higher frequency, shorter wavelength') },
    { key: 'gap', label: sc('↔️ 縫的闊度', '↔️ Gap width'), min: 0.3, max: 2.4, step: 0.15, unit: 'm' },
    { key: 'sep', label: sc('↔️ 兩個波源的距離', '↔️ Source separation'), min: 0.6, max: 3, step: 0.2, unit: 'm' },
    { key: 'sf', label: sc('🎵 音調（頻率）', '🎵 Pitch (frequency)'), min: 1, max: 5, step: 1, unit: '', fmt: (v) => [220, 330, 440, 660, 880][v - 1] + ' Hz' },
    { key: 'sA', label: sc('🔊 響度（振幅）', '🔊 Loudness (amplitude)'), min: 0.2, max: 1, step: 0.1, unit: '' },
    { key: 'air', type: 'toggle', label: sc('💨 有空氣', '💨 Air present'), hint: sc('關掉 = 真空', 'Off = vacuum') },
    { key: 'depth', label: sc('🌊 海床深度', '🌊 Sea depth'), min: 100, max: 600, step: 50, unit: 'm' }
  ];
  const graphs = [
    { id: 'yx', mode: 'xy', tab: sc('位移–距離', 'Displacement–distance'), y: sc('位移 (m)', 'displacement (m)'), x: sc('距離 x (m)', 'distance x (m)'), fixed: [-0.7, 0.7], xRange: [0, 10],
      series: [['d', sc('每一點的位移', 'Each point'), C.red]], data: () => ropeSnapshot() },
    { id: 'yt', tab: sc('位移–時間', 'Displacement–time'), y: sc('紅點位移 (m)', 'red bead displacement (m)'), fixed: [-0.7, 0.7], series: [['bead', sc('紅色珠', 'Red bead'), C.red]] },
    { id: 'probe', tab: sc('探測點', 'Probe'), y: sc('水面高度', 'water height'), fixed: [-2.5, 2.5], series: [['probe', sc('探測點', 'Probe'), C.blue]] },
    { id: 'mic', tab: sc('咪高峰', 'Microphone'), y: sc('空氣粒子位移', 'air particle displacement'), fixed: [-1.2, 1.2], span: 4, series: [['mic', sc('咪高峰', 'Microphone'), C.teal]] }
  ];
  const ALL = params.map((q) => q.key);

  /* ---------------- 狀態 ---------------- */
  const S = { simT: 0, lastSample: -1, t0: 0, tw: 0 };
  const NB = 40, X0 = -5, DX = 10 / (NB - 1);
  const H = new Hist(['bead', 'probe', 'mic']);
  let ghost = null;
  const ropeDisp = (i, t) => { const d = i * DX, tt = t - d / p.wv; return tt < 0 ? 0 : (p.wtype === 'long' ? 0.32 : 1) * p.A * Math.sin(2 * Math.PI * p.rf * tt); };
  function ropeSnapshot() { const x = [], d = []; for (let i = 0; i < NB; i++) { x.push(i * DX); d.push(p.run ? ropeDisp(i, S.tw) : 0); } return { x, c: { d } }; }

  /* ---------------- 水波槽（FDTD） ---------------- */
  const NX = 160, NY = 96, CELL = 0.06, TW = NX * CELL, TH = NY * CELL;
  const u = new Float32Array(NX * NY), up = new Float32Array(NX * NY), kk = new Float32Array(NX * NY), mask = new Uint8Array(NX * NY), damp = new Float32Array(NX * NY);
  const id = (x, y) => y * NX + x;
  let srcs = [], lineSrc = false, nStep = 0, probe = null, focus = null;
  const K_DEEP = 0.4, K_SHALLOW = 0.13;
  const fStep = () => 0.012 + 0.006 * p.fq, lamCells = () => Math.sqrt(K_DEEP) / fStep();
  for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) { const e = Math.min(x, y, NX - 1 - x, NY - 1 - y); damp[id(x, y)] = e < 12 ? 0.12 * Math.pow((12 - e) / 12, 2) : 0; }
  function buildScenario() {
    u.fill(0); up.fill(0); kk.fill(K_DEEP); mask.fill(1); srcs = []; lineSrc = false; nStep = 0; focus = null;
    const wall = (x, y) => { for (let dx = 0; dx < 2; dx++) for (let dy = 0; dy < 2; dy++) { const X = x + dx, Y = y + dy; if (X >= 0 && X < NX && Y >= 0 && Y < NY) mask[id(X, Y)] = 0; } };
    const s = p.scen;
    if (s !== 'two') lineSrc = true;
    if (s === 'reflect') for (let t = 0; t <= 1; t += 0.004) wall(Math.round(95 + 45 * t), Math.round(8 + 80 * t));
    if (s === 'concave') { for (let y = 14; y <= 82; y++) wall(Math.round(140 - ((y - 48) ** 2) / 80), y); focus = [120, 48]; }
    if (s === 'convex') for (let y = 14; y <= 82; y++) wall(Math.round(112 + ((y - 48) ** 2) / 80), y);
    if (s === 'refract') for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) if (x > 70 + (y - 48) * 0.55) kk[id(x, y)] = K_SHALLOW;
    if (s === 'gap') { const g = Math.round(p.gap / CELL / 2); for (let y = 0; y < NY; y++) if (Math.abs(y - 48) > g) wall(60, y); }
    if (s === 'two') { const h = Math.round(p.sep / CELL / 2); srcs = [[40, 48 - h], [40, 48 + h]]; }
    probe = s === 'two' ? [110, 48 + Math.round(1.0 / CELL)] : null;
    S.tankDirty = true;
  }
  function stepTank() {
    const w = 2 * Math.PI * fStep(), amp = Math.sin(w * nStep);
    if (lineSrc) for (let y = 12; y < NY - 12; y++) if (mask[id(14, y)]) u[id(14, y)] = amp;
    for (const [x, y] of srcs) u[id(x, y)] = 1.6 * amp;
    for (let y = 1; y < NY - 1; y++) {
      for (let x = 1; x < NX - 1; x++) {
        const i = id(x, y);
        if (!mask[i]) { up[i] = 0; continue; }
        const lap = u[i - 1] + u[i + 1] + u[i - NX] + u[i + NX] - 4 * u[i];
        up[i] = (2 * u[i] - up[i] + kk[i] * lap) * (1 - damp[i]);
      }
    }
    for (let i = 0; i < u.length; i++) { const t = u[i]; u[i] = up[i]; up[i] = t; }
    nStep++;
  }

  /* ---------------- 教學 ---------------- */
  const basicsStages = [
    { id: 'w-intro', who: 'chan', title: sc('波傳送能量', 'Waves carry energy'),
      say: sc('波會將能量由一處傳去另一處，但唔會將物質搬走。好似球場入面嘅人浪：每個人只係企起身再坐低，但個人浪就由一邊走到另一邊。撳「開始」，睇吓條繩。',
        "Waves carry energy from place to place without carrying the stuff along. Think of a Mexican wave in a stadium: each person just stands up and sits down, but the wave travels all the way round. Tap 'Start' and watch the rope."),
      task: sc('按「開始」產生波', "Tap 'Start' to make a wave"), setup: { mode: 'rope', wtype: 'trans', run: false }, graph: 'yx',
      goal: { type: 'start' }, demo: [['start']], settle: 3, items: [48, 55] },
    { id: 'w-bead', who: 'chan', title: sc('紅色珠：估一估', 'The red bead: predict'),
      say: sc('留意條繩上面嗰粒紅色珠。', 'Keep an eye on the red bead on the rope.'),
      setup: { mode: 'rope', wtype: 'trans', run: false }, lock: ALL, graph: 'yt',
      quiz: { q: sc('波經過嘅時候，紅色珠會點郁？', 'As the wave passes, how does the red bead move?'),
        opts: [sc('跟住個波一齊向右走', 'It travels to the right with the wave'), sc('只係上下郁，留喺原位', 'It just moves up and down, staying in place'), sc('完全唔郁', 'It doesn’t move at all')], ans: 1,
        run: [['start']], watch: 5,
        why: sc('答案係：只係上下郁！波向右走，但每粒珠只係喺原位附近振動。位移–時間圖就係記錄住呢粒珠嘅上上落落。', 'The answer: it just moves up and down! The wave travels right, but each bead only vibrates about its own spot. The displacement–time graph records the red bead going up and down.') },
      chain: [sc('波傳送能量', 'The wave carries energy'), sc('粒子只在原位振動', 'Particles vibrate in place'), sc('物質沒有被搬走', 'No stuff is carried along')], items: [55, 49, 50] },
    { id: 'w-long', who: 'ming', title: sc('橫波與縱波', 'Transverse and longitudinal'),
      say: sc('條繩嘅珠係上下郁，同波前進嘅方向成直角，叫橫波。換做彈簧，珠會前後郁，同波前進嘅方向一樣，叫縱波。試吓切換做縱波！',
        'On the rope, beads move up and down, at right angles to the wave’s direction: a transverse wave. On a slinky, they move back and forth along the direction of the wave: a longitudinal wave. Switch to longitudinal and see!'),
      task: sc('在工具箱揀「縱波」', "Choose 'Longitudinal' in the toolbox"), setup: { mode: 'rope', wtype: 'trans', run: true }, graph: 'yx',
      goal: { type: 'param', test: () => p.wtype === 'long' }, demo: [['openTools'], ['set', 'wtype', 'long']], settle: 4,
      chain: [sc('橫波：振動 ⟂ 前進方向', 'Transverse: vibration ⟂ travel'), sc('縱波：振動 ∥ 前進方向', 'Longitudinal: vibration ∥ travel'), sc('縱波有疏部和密部', 'Longitudinal waves have compressions and rarefactions')], items: [48] },
    { id: 'w-graphs', who: 'chan', title: sc('兩種波形圖', 'Two kinds of wave graph'),
      say: sc('位移–距離圖好似影一張相：同一時刻，每一點喺邊。位移–時間圖好似拍一段片：一粒珠點樣隨時間上落。兩幅圖都係波浪形，但橫軸意思完全唔同！',
        'A displacement–distance graph is like a photo: where every point is at one moment. A displacement–time graph is like a video of one bead moving over time. Both look wavy, but their horizontal axes mean completely different things!'),
      setup: { mode: 'rope', wtype: 'trans', run: true }, graph: 'yx',
      adv: sc('位移–距離圖兩個波峰之間係波長 λ；位移–時間圖兩個波峰之間係周期 T。', 'On a displacement–distance graph, crest to crest is the wavelength λ; on a displacement–time graph, it is the period T.'), items: [49, 50, 51, 52, 53] },
    { id: 'w-eq', who: 'chan', title: sc('波動方程：估一估', 'Wave equation: predict'),
      say: sc('波速唔變，我哋將手搖快一倍，即係頻率加倍。', 'With the wave speed unchanged, we shake twice as fast: double the frequency.'),
      cond: [sc('只改變：頻率（1 → 2 Hz）', 'Only change: frequency (1 → 2 Hz)'), sc('不變：波速', 'Same: wave speed')],
      setup: { mode: 'rope', wtype: 'trans', run: true, rf: 1 }, lock: ALL, graph: 'yx',
      quiz: { q: sc('波長會點？', 'What happens to the wavelength?'), opts: [sc('加倍', 'It doubles'), sc('減半', 'It halves'), sc('唔變', 'It stays the same')], ans: 1,
        run: [['set', 'rf', 2], ['start']], watch: 5,
        why: sc('答案係：減半！每秒走嘅距離（波速）唔變，但每秒要塞多一倍嘅波，所以每個波要短一半。呢個就係波動方程 v = fλ。',
          'The answer: it halves! The distance travelled each second (the wave speed) stays the same, but twice as many waves must fit in, so each one is half as long. That is the wave equation v = fλ.') },
      adv: sc('v = fλ：2 m/s = 2 Hz × 1 m。', 'v = fλ: 2 m/s = 2 Hz × 1 m.'), chain: [sc('波速不變', 'Same speed'), sc('頻率加倍', 'Double frequency'), sc('波長減半', 'Half the wavelength')], items: [54] },
    { id: 'w-sum', who: 'chan', title: sc('總結', 'Summary'),
      say: sc('波傳送能量，粒子只係喺原位振動。橫波振動同前進方向垂直，縱波就平行。記住 v = fλ！', 'Waves carry energy while particles just vibrate in place. Transverse waves vibrate across the direction of travel; longitudinal waves vibrate along it. Remember v = fλ!'),
      finish: true }
  ];
  const rippleStages = [
    { id: 'r-intro', who: 'chan', title: sc('水波槽', 'The ripple tank'),
      say: sc('呢個係水波槽，由上面望落去。左邊有條棒上下郁，造出一條條直線嘅水波。光亮嘅位係波峰，深色嘅位係波谷。', 'This is a ripple tank, seen from above. A bar on the left moves up and down, making straight water waves. Bright lines are crests and dark lines are troughs.'),
      setup: { mode: 'tank', scen: 'plane', fq: 3 }, items: [56] },
    { id: 'r-reflect', who: 'chan', title: sc('反射：估一估', 'Reflection: predict'),
      say: sc('我哋放一塊斜斜嘅平面障礙物。', 'We put a flat barrier in at an angle.'), setup: { mode: 'tank', scen: 'plane', fq: 3 }, lock: ALL,
      quiz: { q: sc('波撞到平面障礙物，反射角同入射角有咩關係？', 'When waves hit a flat barrier, how does the angle of reflection compare with the angle of incidence?'),
        opts: [sc('兩個角相等', 'They are equal'), sc('反射角大啲', 'The reflection angle is bigger'), sc('冇關係', 'No relationship')], ans: 0,
        run: [['set', 'scen', 'reflect']], watch: 4,
        why: sc('答案係：相等！好似波子撞牆彈返咁，入射角等於反射角。反射之後，波速、頻率同波長都冇變。', 'The answer: they are equal! Like a marble bouncing off a wall, the angle of incidence equals the angle of reflection. The speed, frequency and wavelength don’t change.') },
      chain: [sc('波撞到障礙物', 'Waves hit the barrier'), sc('入射角 = 反射角', 'Incidence = reflection'), sc('波長不變', 'Same wavelength')], items: [56] },
    { id: 'r-curve', who: 'ming', title: sc('凹面與凸面', 'Concave and convex'),
      say: sc('換做彎嘅障礙物！凹面會將反射波聚埋喺一點，叫焦點，好似衛星天線咁。凸面就會將反射波散開。', 'Now curved barriers! A concave barrier gathers the reflected waves into one point, the focus, like a satellite dish. A convex barrier spreads them out.'),
      task: sc('揀「凹面」看波聚焦', "Choose 'Concave' to see the waves focus"), setup: { mode: 'tank', scen: 'plane', fq: 3 },
      goal: { type: 'param', test: () => p.scen === 'concave' || p.scen === 'convex' }, demo: [['openTools'], ['set', 'scen', 'concave'], ['wait', 4], ['set', 'scen', 'convex']], settle: 4,
      chain: [sc('凹面：聚焦', 'Concave: focuses'), sc('凸面：散開', 'Convex: spreads out')], items: [57, 58] },
    { id: 'r-refract', who: 'chan', title: sc('折射：估一估', 'Refraction: predict'),
      say: sc('右邊有一塊斜斜嘅淺水區，水波喺淺水會走得慢啲。', 'On the right is a sloping shallow region, where waves travel more slowly.'), setup: { mode: 'tank', scen: 'plane', fq: 3 }, lock: ALL,
      quiz: { q: sc('波由深水去到淺水，波長會點？', 'When waves go from deep to shallow water, what happens to the wavelength?'),
        opts: [sc('變長', 'It gets longer'), sc('變短', 'It gets shorter'), sc('唔變', 'It stays the same')], ans: 1,
        run: [['set', 'scen', 'refract']], watch: 5,
        why: sc('答案係：變短！頻率由波源決定，唔會變；波速慢咗，所以波長變短。斜斜咁入淺水，前進方向仲會轉彎，叫折射。', 'The answer: shorter! The frequency is set by the source and doesn’t change; the speed drops, so the wavelength shortens. Entering at an angle, the waves also change direction: that is refraction.') },
      chain: [sc('淺水波速較慢', 'Slower in shallow water'), sc('頻率不變', 'Same frequency'), sc('波長變短、方向轉彎', 'Shorter wavelength, direction bends')], items: [59] },
    { id: 'r-gap', who: 'chan', title: sc('衍射：估一估', 'Diffraction: predict'),
      say: sc('中間有一道牆，只留一條縫。我哋將條縫收窄到同波長差唔多。', 'A wall with a single gap. We narrow the gap until it is about one wavelength wide.'),
      setup: { mode: 'tank', scen: 'gap', gap: 2.1, fq: 3 }, lock: ALL,
      quiz: { q: sc('條縫越窄，波穿過之後會點？', 'With a narrower gap, what happens to the waves after they pass through?'),
        opts: [sc('散得越開', 'They spread out more'), sc('散得越少', 'They spread out less'), sc('冇波穿過', 'No waves get through')], ans: 0,
        run: [['set', 'gap', 0.6]], watch: 5,
        why: sc('答案係：散得越開！波穿過縫隙或者繞過障礙物會散開，叫衍射。縫嘅闊度同波長差唔多，衍射最明顯。所以喺牆後面都聽到人講嘢！',
          'The answer: they spread out more! Waves spread out through gaps and round obstacles: diffraction. It is strongest when the gap is about one wavelength wide. That is why you can hear people round a corner!') },
      chain: [sc('縫寬 ≈ 波長', 'Gap ≈ wavelength'), sc('衍射最明顯', 'Strongest diffraction'), sc('波向四面散開', 'Waves spread out')], items: [60] },
    { id: 'r-sum', who: 'chan', title: sc('總結', 'Summary'),
      say: sc('水波槽教識我哋四件事：反射時入射角等於反射角；凹面聚焦、凸面散開；入淺水會折射，波長變短；穿過窄縫會衍射。光同聲都有呢啲特性！',
        'The ripple tank showed us four things: reflection with equal angles; concave focuses and convex spreads; refraction into shallow water with a shorter wavelength; and diffraction through narrow gaps. Light and sound do all of this too!'),
      setup: { mode: 'tank', scen: 'gap', gap: 0.6, fq: 3 }, finish: true }
  ];
  const interfStages = [
    { id: 'i-intro', who: 'chan', title: sc('兩個波源', 'Two sources'),
      say: sc('而家有兩個點波源，一齊上下郁，發出一圈圈嘅水波。兩組波相遇會點？', 'Now two point sources bob up and down together, sending out circular ripples. What happens where the two sets meet?'),
      setup: { mode: 'tank', scen: 'two', sep: 1.6, fq: 3 }, graph: 'probe', items: [61] },
    { id: 'i-cons', who: 'chan', title: sc('波峰遇波峰', 'Crest meets crest'),
      say: sc('諗吓兩個波疊埋嘅情況。', 'Think about two waves adding together.'), setup: { mode: 'tank', scen: 'two', sep: 1.6, fq: 3 }, graph: 'probe',
      quiz: { q: sc('兩個波峰喺同一點相遇，會點？', 'What happens where two crests meet?'),
        opts: [sc('互相抵消', 'They cancel out'), sc('疊埋變得更高', 'They add up to a bigger crest'), sc('互相彈開', 'They bounce off each other')], ans: 1,
        why: sc('答案係：疊埋變得更高！波峰加波峰變成更大嘅波峰，叫相長干涉。', 'The answer: they add up to a bigger crest! Crest plus crest makes a bigger crest: constructive interference.') }, items: [62] },
    { id: 'i-dest', who: 'ming', title: sc('波峰遇波谷', 'Crest meets trough'),
      say: sc('咁如果一個係波峰，一個係波谷呢？', 'And if one is a crest and the other a trough?'), setup: { mode: 'tank', scen: 'two', sep: 1.6, fq: 3 }, graph: 'probe',
      quiz: { q: sc('波峰遇到波谷，會點？', 'What happens where a crest meets a trough?'),
        opts: [sc('互相抵消，水面幾乎唔郁', 'They cancel and the water barely moves'), sc('變得更高', 'It gets higher'), sc('冇變', 'Nothing changes')], ans: 0,
        why: sc('答案係：互相抵消！波峰同波谷一上一落，加埋變成零，叫相消干涉。水波槽入面嗰啲好平靜嘅線，就係相消干涉嘅位置，叫節線。', 'The answer: they cancel! Up plus down makes zero: destructive interference. The calm lines in the tank are where this happens; they are called nodal lines.') },
      chain: [sc('波峰 + 波谷', 'Crest + trough'), sc('互相抵消', 'They cancel'), sc('形成節線', 'Nodal lines form')], items: [63] },
    { id: 'i-path', who: 'chan', title: sc('程差', 'Path difference'),
      say: sc('點樣知道一點係相長定相消？計吓由兩個波源去到嗰點嘅距離差，叫程差。程差係整數個波長就相長，係半個波長就相消。輕按水面放一個探測點試吓！',
        'How can we tell whether a point is constructive or destructive? Work out the difference in distance from the two sources: the path difference. A whole number of wavelengths means constructive; a half wavelength means destructive. Tap the water to place a probe!'),
      task: sc('輕按水面，放置探測點', 'Tap the water to place a probe'), setup: { mode: 'tank', scen: 'two', sep: 1.6, fq: 3 }, graph: 'probe',
      goal: { type: 'probe' }, demo: [['probe', 105, 62]], settle: 4,
      adv: sc('相長：程差 = nλ；相消：程差 = (n + ½)λ。', 'Constructive: path difference = nλ. Destructive: path difference = (n + ½)λ.'), items: [64] },
    { id: 'i-sep', who: 'chan', title: sc('移近波源：估一估', 'Closer sources: predict'),
      say: sc('我哋將兩個波源移近啲。', 'We move the two sources closer together.'), setup: { mode: 'tank', scen: 'two', sep: 2.4, fq: 3 }, lock: ALL,
      quiz: { q: sc('啲平靜嘅節線會點？', 'What happens to the calm nodal lines?'), opts: [sc('散開啲，數目少咗', 'They spread out and there are fewer'), sc('密咗，數目多咗', 'They get closer and there are more'), sc('唔變', 'No change')], ans: 0,
        run: [['set', 'sep', 0.8]], watch: 5,
        why: sc('答案係：散開啲！波源越近，程差改變得越慢，節線之間就越闊。降噪耳筒都係用相消干涉，將噪音抵消。', 'The answer: they spread out! With closer sources, the path difference changes more slowly, so the nodal lines are further apart. Noise-cancelling headphones use destructive interference to cancel noise.') },
      items: [61] },
    { id: 'i-sum', who: 'chan', title: sc('總結', 'Summary'),
      say: sc('兩組波相遇會干涉：波峰遇波峰相長，波峰遇波谷相消。用程差就可以預測結果。', 'When two sets of waves meet they interfere: crest on crest is constructive, crest on trough is destructive, and the path difference predicts which.'),
      finish: true }
  ];
  const soundStages = [
    { id: 'so-intro', who: 'chan', title: sc('聲音係縱波', 'Sound is a longitudinal wave'),
      say: sc('喇叭個膜前後震動，推動空氣粒子，形成一疏一密嘅縱波，傳到右邊個咪高峰。聲音需要空氣、水或者固體去傳送。', 'The speaker cone vibrates back and forth, pushing air particles into compressions and rarefactions: a longitudinal wave that travels to the microphone. Sound needs air, water or a solid to travel through.'),
      setup: { mode: 'sound', air: true, sf: 2, sA: 0.6 }, graph: 'mic', items: [76] },
    { id: 'so-vac', who: 'chan', title: sc('太空：估一估', 'In space: predict'),
      say: sc('我哋將空氣抽走，變成真空。', 'We pump away the air, leaving a vacuum.'), setup: { mode: 'sound', air: true, sf: 2, sA: 0.6 }, lock: ALL, graph: 'mic',
      quiz: { q: sc('太空入面聽唔聽到爆炸聲？', 'Could you hear an explosion in space?'), opts: [sc('聽到', 'Yes'), sc('聽唔到，因為冇空氣傳聲', 'No, because there is no air to carry sound'), sc('聽到，但細聲啲', 'Yes, but quieter')], ans: 1,
        run: [['set', 'air', false]], watch: 2.5,
        why: sc('答案係：聽唔到！冇粒子就冇嘢傳遞振動，咪高峰嘅線變咗一條平線。太空係真空，所以好安靜。', 'The answer: no! Without particles, nothing passes the vibration along, so the microphone line goes flat. Space is a vacuum, so it is silent.') },
      chain: [sc('冇空氣', 'No air'), sc('冇粒子傳振動', 'No particles to pass it on'), sc('聽唔到聲', 'No sound')], items: [76] },
    { id: 'so-pitch', who: 'ming', title: sc('音調與響度', 'Pitch and loudness'),
      say: sc('撳「聽聲」可以真係聽到喇叭嘅聲！頻率越高，聲音越尖；振幅越大，聲音越響。', "Tap 'Listen' to really hear the speaker! Higher frequency sounds higher-pitched; bigger amplitude sounds louder."),
      setup: { mode: 'sound', air: true, sf: 2, sA: 0.6 }, graph: 'mic',
      quiz: { q: sc('頻率越高，聲音會點？', 'What does a higher frequency sound like?'), opts: [sc('越大聲', 'Louder'), sc('越尖，音調越高', 'Higher-pitched'), sc('越慢', 'Slower')], ans: 1,
        run: [['set', 'sf', 2], ['listen'], ['wait', 1.2], ['set', 'sf', 5], ['listen']], watch: 1.5,
        why: sc('答案係：越尖！頻率係每秒振動幾多次，振得越快音調越高。響度就由振幅決定。人耳大約聽到每秒 20 次到 20000 次嘅振動。', 'The answer: higher-pitched! Frequency is vibrations per second; faster vibrations give a higher pitch. Loudness depends on amplitude. Human ears hear roughly 20 to 20,000 vibrations per second.') },
      chain: [sc('頻率高 → 音調高', 'Higher frequency → higher pitch'), sc('振幅大 → 聲音響', 'Bigger amplitude → louder')], items: [76] },
    { id: 'so-sonar', who: 'chan', title: sc('超聲波量海深：估一估', 'Ultrasound sea depth: predict'),
      say: sc('超聲波係頻率高過 20000 赫茲、人耳聽唔到嘅聲音。船底發出超聲波，撞到海床再彈返嚟。', 'Ultrasound is sound above 20,000 hertz, too high for us to hear. The ship sends ultrasound down; it bounces off the sea bed and comes back.'),
      setup: { mode: 'sonar', depth: 300 }, lock: ALL,
      quiz: { q: sc('回聲用咗 0.4 秒返嚟，海水中聲速係每秒 1500 米。海有幾深？', 'The echo returns after 0.4 s. Sound travels at 1500 m/s in sea water. How deep is the sea?'),
        opts: [sc('600 m', '600 m'), sc('300 m', '300 m'), sc('150 m', '150 m')], ans: 1,
        run: [['ping'], ['until', 'echo', 6]], watch: 0.5,
        why: sc('答案係：300 米！聲音行咗 1500 × 0.4 = 600 米，但係去咗又返，所以深度係一半，300 米。', 'The answer: 300 m! The sound travelled 1500 × 0.4 = 600 m, but that is there and back, so the depth is half: 300 m.') },
      adv: sc('深度 = 聲速 × 時間 ÷ 2。', 'Depth = speed × time ÷ 2.'), chain: [sc('聲音去咗又返', 'Sound goes down and back'), sc('距離 = 速度 × 時間', 'Distance = speed × time'), sc('深度 = 一半', 'Depth = half of that')], items: [77] },
    { id: 'so-apply', who: 'chan', title: sc('超聲波的應用', 'Uses of ultrasound'),
      say: sc('蝙蝠同海豚用超聲波搵路，醫生用超聲波睇 BB，工廠用超聲波檢查金屬有冇裂縫。', 'Bats and dolphins use ultrasound to find their way, doctors use it to check on babies, and factories use it to find cracks in metal.'),
      quiz: { q: sc('醫生用超聲波睇 BB，最大好處係？', 'What is the main advantage of using ultrasound to look at an unborn baby?'),
        opts: [sc('冇輻射，對 BB 安全', 'No harmful radiation, so it is safe'), sc('好大聲', 'It is loud'), sc('睇骨頭最清楚', 'It shows bones most clearly')], ans: 0,
        why: sc('答案係：安全！超聲波唔係輻射，唔會傷害 BB，所以用嚟做產前檢查。', 'The answer: it is safe! Ultrasound is not harmful radiation, so it is used for checks during pregnancy.') }, items: [78] },
    { id: 'so-sum', who: 'chan', title: sc('總結', 'Summary'),
      say: sc('聲音係縱波，需要介質先傳到；頻率決定音調，振幅決定響度；超聲波可以量深度同做醫療檢查。', 'Sound is a longitudinal wave that needs a medium; frequency sets the pitch and amplitude the loudness; ultrasound can measure depth and help doctors.'),
      finish: true }
  ];

  /* ================== 3D 場景 ================== */
  const G = { rope: new THREE.Group(), tank: new THREE.Group(), sound: new THREE.Group(), sonar: new THREE.Group() };
  Object.values(G).forEach((g) => root.add(g));
  const V = {};
  function mount() {
    // 繩波
    const rg = G.rope, RY = 1.6;
    mesh(new THREE.BoxGeometry(11, 0.08, 1.2), std(0xe2e8f0, 0.8), 0, 0.04, 0, rg);
    mesh(new THREE.BoxGeometry(0.3, RY + 0.3, 0.3), std(0x64748b, 0.4, 0.4), X0 - 0.4, (RY + 0.3) / 2, 0, rg);
    V.hand = mesh(new THREE.BoxGeometry(0.4, 0.25, 0.4), std(0xf59e0b, 0.5), X0 - 0.2, RY, 0, rg);
    mesh(new THREE.BoxGeometry(0.3, RY + 0.3, 0.3), std(0x64748b, 0.4, 0.4), X0 + 10.4, (RY + 0.3) / 2, 0, rg);
    const bg = new THREE.SphereGeometry(0.09, 12, 10);
    V.beads = []; for (let i = 0; i < NB; i++) V.beads.push(mesh(bg, std(i === 12 ? 0xdc2626 : 0x2563eb, 0.4), X0 + i * DX, RY, 0, rg));
    V.links = kit.beamPool(rg, 0.025);
    V.ruler = []; for (let m = 0; m <= 10; m++) { mesh(new THREE.BoxGeometry(0.02, 0.01, 0.3), std(0x334155), X0 + m, 0.09, 0.4, rg, false); if (m % 2 === 0) tag('readout light', rg, X0 + m, 0.12, 0.65).el.textContent = m + ' m'; }
    V.ropeTag = tag('readout', rg, 0, RY + 1.0, 0);
    // 水波槽
    const tg = G.tank, TY = 0.8;
    mesh(new THREE.BoxGeometry(TW + 0.4, 0.1, TH + 0.4), std(0x475569, 0.5, 0.3), 0, TY - 0.06, 0, tg);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) mesh(new THREE.BoxGeometry(0.12, TY - 0.1, 0.12), std(0x94a3b8, 0.5, 0.5), sx * (TW / 2), (TY - 0.1) / 2, sz * (TH / 2), tg);
    V.tex = new THREE.DataTexture(new Uint8Array(NX * NY * 4), NX, NY, THREE.RGBAFormat); V.tex.needsUpdate = true; V.tex.magFilter = THREE.LinearFilter;
    V.tex.colorSpace = THREE.SRGBColorSpace;
    const geo = new THREE.PlaneGeometry(TW, TH, 80, 48); geo.rotateX(-Math.PI / 2);
    V.water = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: V.tex, roughness: 0.25, metalness: 0.1 }));
    V.water.position.y = TY + 0.02; tg.add(V.water);
    V.walls = new THREE.Group(); tg.add(V.walls);
    V.probe = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 10), std(0xf59e0b, 0.4), 0, TY + 0.3, 0, tg); V.probe.visible = false;
    V.probeTag = tag('readout', V.probe, 0, 0.6, 0);
    V.dippers = [0, 1].map(() => mesh(new THREE.SphereGeometry(0.1, 12, 10), std(0x111827, 0.4), 0, TY + 0.15, 0, tg));
    V.bar = mesh(new THREE.BoxGeometry(0.1, 0.1, TH - 1.4), std(0x111827, 0.4), -TW / 2 + 14 * CELL, TY + 0.1, 0, tg);
    V.focus = mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 20), std(0xfacc15, 0.3), 0, TY + 0.1, 0, tg); V.focus.rotation.x = Math.PI / 2;
    V.tankTag = tag('readout', tg, 0, TY + 0.9, -TH / 2);
    // 聲音
    const sg = G.sound;
    mesh(new THREE.BoxGeometry(11, 0.08, 2), std(0xe2e8f0, 0.8), 0, 0.04, 0, sg);
    mesh(new THREE.BoxGeometry(0.7, 1.4, 1.2), std(0x1f2937, 0.6), -5.2, 1.1, 0, sg);
    V.cone = mesh(new THREE.ConeGeometry(0.45, 0.35, 24, 1, true), std(0x94a3b8, 0.6, 0.2, { side: THREE.DoubleSide }), -4.75, 1.2, 0, sg); V.cone.rotation.z = Math.PI / 2;
    const NC = 44, NR = 8, NZ = 3;
    V.air = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 6, 5), std(0x0ea5e9, 0.4), NC * NR * NZ); sg.add(V.air);
    V.airN = [NC, NR, NZ];
    V.mic = new THREE.Group(); V.mic.position.set(4.9, 1.2, 0); sg.add(V.mic);
    mesh(new THREE.SphereGeometry(0.16, 16, 12), std(0x334155, 0.5, 0.5), 0, 0, 0, V.mic);
    mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 10), std(0x111827), 0.1, -0.6, 0, V.mic);
    V.soundTag = tag('readout', sg, 0, 2.3, 0);
    V.dome = mesh(new THREE.BoxGeometry(10.4, 2.2, 2.0), glass(0xe0f2fe, 0.12), 0, 1.2, 0, sg, false);
    // 聲納
    const ng = G.sonar;
    V.sea = mesh(new THREE.BoxGeometry(10, 1, 2.2), std(0x1d4ed8, 0.2, 0, { transparent: true, opacity: 0.55, depthWrite: false }), 0, 0, 0, ng, false);
    V.bed = mesh(new THREE.BoxGeometry(10.4, 0.3, 2.4), std(0xa16207, 0.9), 0, 0, 0, ng);
    V.ship = new THREE.Group(); ng.add(V.ship);
    mesh(new THREE.BoxGeometry(2.2, 0.4, 0.8), std(0xdc2626, 0.5), 0, 0.2, 0, V.ship);
    mesh(new THREE.BoxGeometry(0.8, 0.5, 0.6), std(0xffffff, 0.6), -0.3, 0.65, 0, V.ship);
    V.pulse = mesh(new THREE.TorusGeometry(0.3, 0.04, 8, 24), new THREE.MeshBasicMaterial({ color: 0xfde047 }), 0, 0, 0, ng, false); V.pulse.rotation.x = Math.PI / 2; V.pulse.visible = false;
    V.sonarTag = tag('readout', ng, 2.6, 4.6, 0);
    V.depthTag = tag('readout light', ng, -4.2, 2, 1.2);
    buildScenario(); syncSonar();
  }
  const SURF = 4.2;
  function syncSonar() {
    const d = (p.depth / 600) * 3.6;
    V.sea.scale.y = d; V.sea.position.y = SURF - d / 2; V.bed.position.y = SURF - d - 0.15;
    V.ship.position.set(0, SURF, 0); V.depthTag.o.position.y = SURF - d / 2;
  }
  function rebuildWalls() {
    V.walls.clear();
    const m = std(0x334155, 0.6);
    const g = new THREE.BoxGeometry(CELL * 1.05, 0.18, CELL * 1.05);
    for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) if (!mask[id(x, y)] && (x + y) % 1 === 0) { const b = new THREE.Mesh(g, m); b.position.set(-TW / 2 + (x + 0.5) * CELL, 0.89, -TH / 2 + (y + 0.5) * CELL); V.walls.add(b); }
    S.tankDirty = false;
  }
  function paintTank() {
    const d = V.tex.image.data, pos = V.water.geometry.attributes.position;
    for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) {
      const i = id(x, y), j = ((NY - 1 - y) * NX + x) * 4;
      if (!mask[i]) { d[j] = 51; d[j + 1] = 65; d[j + 2] = 85; d[j + 3] = 255; continue; }
      const v = clamp(u[i] * 0.6, -1, 1), sh = kk[i] < K_DEEP ? 1 : 0;
      d[j] = clamp(40 + sh * 25 + v * 150, 0, 255); d[j + 1] = clamp(120 + sh * 30 + v * 130, 0, 255); d[j + 2] = clamp(200 + v * 60, 0, 255); d[j + 3] = 255;
    }
    V.tex.needsUpdate = true;
    for (let k = 0; k < pos.count; k++) {
      const px = pos.getX(k), pz = pos.getZ(k);
      const gx = clamp(Math.round((px + TW / 2) / CELL), 0, NX - 1), gy = clamp(Math.round((pz + TH / 2) / CELL), 0, NY - 1);
      pos.setY(k, mask[id(gx, gy)] ? u[id(gx, gy)] * 0.05 : 0);
    }
    pos.needsUpdate = true;
  }
  const gridToWorld = (x, y) => [-TW / 2 + (x + 0.5) * CELL, -TH / 2 + (y + 0.5) * CELL];

  /* ================== 物理 ================== */
  const sonar = { on: false, t: 0, done: false };
  function sample() {
    const micV = p.mode === 'sound' && p.air ? Math.sin(2 * Math.PI * (0.4 + 0.3 * p.sf) * S.simT - (2 * Math.PI / (3.2 / (0.6 + 0.35 * p.sf))) * 9.6) * p.sA : p.mode === 'sound' ? 0 : NaN;
    H.push(S.simT, { bead: p.mode === 'rope' ? (p.run ? ropeDisp(12, S.tw) : 0) : NaN, probe: p.mode === 'tank' && probe ? u[id(probe[0], probe[1])] : NaN, mic: micV });
  }
  function update(dt, time) {
    S.simT += dt; if (p.run) S.tw += dt;
    if (S.simT - S.lastSample >= 1 / 30) { S.lastSample = S.simT; sample(); }
    if (p.mode === 'rope') {
      const RY = 1.6, segs = [];
      V.hand.position.y = RY + (p.run ? ropeDisp(0, S.tw) : 0) * (p.wtype === 'long' ? 0 : 1);
      V.hand.position.x = X0 - 0.2 + (p.wtype === 'long' && p.run ? ropeDisp(0, S.tw) : 0);
      for (let i = 0; i < NB; i++) {
        const d = p.run ? ropeDisp(i, S.tw) : 0, b = V.beads[i];
        if (p.wtype === 'trans') b.position.set(X0 + i * DX, RY + d, 0); else b.position.set(X0 + i * DX + d, RY, 0);
        if (i) segs.push({ a: V.beads[i - 1].position.toArray(), b: b.position.toArray(), color: 0x64748b });
      }
      V.links.draw(segs);
    } else if (p.mode === 'tank') {
      if (S.tankDirty) rebuildWalls();
      const steps = clamp(Math.round(dt * 60 * 2.5), 1, 8);
      for (let s = 0; s < steps; s++) stepTank();
      paintTank();
      const amp = Math.sin(2 * Math.PI * fStep() * nStep);
      V.bar.visible = lineSrc; V.bar.position.y = 0.9 + amp * 0.04;
      V.dippers.forEach((dp, i) => { dp.visible = !!srcs[i]; if (srcs[i]) { const [wx, wz] = gridToWorld(...srcs[i]); dp.position.set(wx, 0.92 + amp * 0.05, wz); } });
      V.focus.visible = !!focus; if (focus) { const [wx, wz] = gridToWorld(...focus); V.focus.position.set(wx, 0.86, wz); }
      V.probe.visible = !!probe; if (probe) { const [wx, wz] = gridToWorld(...probe); V.probe.position.set(wx, 1.1, wz); }
    } else if (p.mode === 'sound') {
      const fv = 0.4 + 0.3 * p.sf, lam = 3.2 / (0.6 + 0.35 * p.sf), k = (2 * Math.PI) / lam, [NC, NR, NZ] = V.airN, m4 = new THREE.Matrix4();
      V.cone.position.x = -4.75 + Math.sin(2 * Math.PI * fv * S.simT) * 0.08 * p.sA;
      let n = 0;
      for (let c = 0; c < NC; c++) for (let r = 0; r < NR; r++) for (let z = 0; z < NZ; z++) {
        const x0 = -4.4 + c * 0.215 + ((r + z) % 2) * 0.1, dx = p.air ? Math.sin(2 * Math.PI * fv * S.simT - k * (x0 + 4.4)) * 0.11 * p.sA : 0;
        m4.makeTranslation(x0 + dx, 0.5 + r * 0.2, -0.5 + z * 0.5); V.air.setMatrixAt(n++, m4);
      }
      V.air.instanceMatrix.needsUpdate = true; V.air.visible = p.air; V.dome.visible = !p.air;
    } else if (p.mode === 'sonar') {
      if (sonar.on) {
        sonar.t += dt; const T = 3, d = (p.depth / 600) * 3.6, fr = sonar.t / T;
        V.pulse.visible = true;
        const y = fr < 0.5 ? SURF - 0.1 - fr * 2 * d : SURF - 0.1 - (1 - fr) * 2 * d;
        V.pulse.position.set(0, y, 0); V.pulse.scale.setScalar(1 + fr * 2);
        if (fr >= 1) { sonar.on = false; sonar.done = true; V.pulse.visible = false; ctx.sfx('pop'); ctx.emit('echo', {});
          const tt = (2 * p.depth) / 1500;
          ctx.info('sonar', () => L(sc('📡 聲納結果', '📡 Sonar result')), () => L(sc(`回聲時間 ${f(tt, 2)} s → 深度 = 1500 × ${f(tt, 2)} ÷ 2 = ${p.depth} m。`, `Echo time ${f(tt, 2)} s → depth = 1500 × ${f(tt, 2)} ÷ 2 = ${p.depth} m.`))); }
      }
    }
  }
  function labels() {
    V.ropeTag.el.innerHTML = `v = f λ<small>${p.wv} m/s = ${p.rf} Hz × ${f(p.wv / p.rf, 2)} m</small>`;
    V.tankTag.el.innerHTML = L(SCN[p.scen]) + `<small>λ ≈ ${f(lamCells() * CELL, 2)} m</small>`;
    if (probe && srcs.length === 2) {
      const d1 = Math.hypot(probe[0] - srcs[0][0], probe[1] - srcs[0][1]), d2 = Math.hypot(probe[0] - srcs[1][0], probe[1] - srcs[1][1]);
      const n = Math.abs(d1 - d2) / lamCells(), fr = n - Math.floor(n), kind = fr < 0.2 || fr > 0.8 ? sc('相長 ✨', 'constructive ✨') : fr > 0.3 && fr < 0.7 ? sc('相消 😶', 'destructive 😶') : sc('介乎兩者', 'in between');
      V.probeTag.el.innerHTML = L(sc('程差', 'path diff.')) + ` ${f(n, 2)} λ<small>${L(kind)}</small>`;
    }
    const hz = [220, 330, 440, 660, 880][p.sf - 1];
    V.soundTag.el.innerHTML = p.air ? `${hz} Hz<small>${L(sc('疏部同密部向右傳', 'compressions travel right'))}</small>` : L(sc('真空：聲音傳唔到！', 'Vacuum: no sound gets through!'));
    V.sonarTag.el.innerHTML = L(sc('海水中聲速', 'speed in sea water')) + '<small>1500 m/s</small>';
    V.depthTag.el.textContent = L(sc('深度 ', 'depth ')) + (sonar.done ? p.depth + ' m' : '?');
  }

  /* ---------------- 重設 / 參數 / 動作 ---------------- */
  function sync() { for (const k of Object.keys(G)) G[k].visible = p.mode === k; }
  function apply(s = {}) {
    Object.assign(p, DEF);
    for (const k of Object.keys(DEF)) if (s[k] !== undefined) p[k] = s[k];
    S.tw = 0; S.simT = 0; S.lastSample = -1; H.reset(); ghost = null; sonar.on = false; sonar.done = false;
    buildScenario(); syncSonar(); sync();
  }
  function again() { if (H.n > 5) ghost = { t: H.t.slice(), c: Object.fromEntries(Object.entries(H.c).map(([k, v]) => [k, v.slice()])) }; S.tw = 0; S.simT = 0; S.lastSample = -1; H.reset(); if (p.mode === 'tank') buildScenario(); sonar.done = false; }
  function setParam(k, v) {
    p[k] = v;
    if (['scen', 'gap', 'sep', 'fq'].includes(k)) { const pr = probe; buildScenario(); if (pr && p.scen === 'two') probe = pr; }
    if (k === 'rf' || k === 'wv' || k === 'wtype') S.tw = 0;
    if (k === 'depth') { syncSonar(); sonar.done = false; }
  }
  function act(a) {
    if (a[0] === 'start') { p.run = true; S.tw = 0; S.simT = 0; S.lastSample = -1; H.reset(); ctx.sfx('click'); ctx.emit('start', {}); }
    if (a[0] === 'listen') {
      if (!p.air) { ctx.toast(sc('真空入面聽唔到聲！', "You can't hear anything in a vacuum!")); return; }
      ctx.sound([220, 330, 440, 660, 880][p.sf - 1], 0.03 + p.sA * 0.12, 1.1); ctx.emit('listen', {});
    }
    if (a[0] === 'ping') { sonar.on = true; sonar.t = 0; ctx.sfx('click'); }
    if (a[0] === 'probe') { probe = [a[1], a[2]]; ctx.emit('probe', {}); }
  }
  const tankPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.82), hp = new THREE.Vector3();
  function tap(ray) {
    if (p.mode === 'tank' && ray.ray.intersectPlane(tankPlane, hp)) {
      const gx = Math.round((hp.x + TW / 2) / CELL - 0.5), gy = Math.round((hp.z + TH / 2) / CELL - 0.5);
      if (gx > 2 && gx < NX - 2 && gy > 2 && gy < NY - 2) { probe = [gx, gy]; ctx.sfx('pop'); ctx.emit('probe', {}); return true; }
    }
    return false;
  }
  function screenPos(a) {
    let v;
    if (a[0] === 'probe') { const [wx, wz] = gridToWorld(a[1], a[2]); v = new THREE.Vector3(wx, 0.9, wz); }
    else if (a[0] === 'start') v = V.hand.position.clone();
    else if (a[0] === 'ping') v = new THREE.Vector3(0, SURF + 0.3, 0);
    else return null;
    v.project(ctx.camera); return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight };
  }
  function describeGraph(gid) {
    const z = ctx.lang() === 'zh';
    if (gid === 'yx') return z ? '呢個係位移–距離圖，好似幫條繩影咗張相。橫軸係沿住條繩嘅距離，直軸係每一點偏離中間幾多。兩個波峰之間嘅距離就係波長。' : 'This displacement–distance graph is like a photo of the rope. The horizontal axis is distance along the rope; the vertical axis is how far each point is from the middle. Crest to crest is one wavelength.';
    if (gid === 'yt') return z ? '呢個係位移–時間圖，記錄紅色珠隨時間上上落落。兩個波峰之間嘅時間就係周期。' : 'This displacement–time graph follows the red bead over time. The time from crest to crest is the period.';
    if (gid === 'probe') return z ? '呢個係探測點嘅水面高度。上落得好大，代表相長干涉；幾乎係平線，代表相消干涉。' : 'This shows the water height at the probe. Big swings mean constructive interference; an almost flat line means destructive interference.';
    return z ? '呢個係咪高峰收到嘅空氣振動。波越密，頻率越高；上落越大，聲音越響。' : 'This is the air vibration picked up by the microphone. Closer waves mean higher frequency; bigger swings mean louder sound.';
  }

  const startBtn = { label: sc('▶️ 開始', '▶️ Start'), act: ['start'], cls: 'btn-primary' };
  return {
    board: { title: 'Waves · 波動', lines: ['v = fλ', 'f = 1/T', 'nλ / (n+½)λ'],
      info: sc('黑板上：波動方程 v = fλ；頻率是周期的倒數；程差 nλ 相長、(n+½)λ 相消。', 'On the board: the wave equation v = fλ; frequency is 1 over the period; path difference nλ is constructive and (n+½)λ destructive.') },
    camera: { pos: [0, 4.2, 10], target: [0, 1.4, 0] }, people: [[-6.4, -3.4, 0.5], [6.4, -3.4, -0.5]],
    params, graphs, buttons: [startBtn, { label: sc('🔄 重設', '🔄 Reset'), act: ['again'] }],
    lessons: [
      { id: 'wavebasics', icon: '〰️', subs: ['3.1'], items: [48, 49, 50, 51, 52, 53, 54, 55], title: sc('波的基本：橫波、縱波和 v = fλ', 'Wave basics: transverse, longitudinal and v = fλ'),
        desc: sc('人浪、繩波、彈簧波，兩種波形圖。', 'Mexican waves, rope and slinky waves, and two kinds of wave graph.'),
        base: { mode: 'rope' }, params: ['wtype', 'rf', 'A', 'wv'], graphs: ['yx', 'yt'], stages: basicsStages },
      { id: 'ripple', icon: '💧', subs: ['3.1'], items: [56, 57, 58, 59, 60], title: sc('水波槽：反射、折射和衍射', 'Ripple tank: reflection, refraction and diffraction'),
        desc: sc('平面和曲面反射、深水去淺水、窄縫衍射。', 'Flat and curved reflection, deep to shallow water, and diffraction through a gap.'),
        base: { mode: 'tank' }, params: ['scen', 'fq', 'gap'], graphs: [], camera: { pos: [0, 7.6, 5.6], target: [0, 0.8, 0.3] }, buttons: [{ label: sc('🔄 重設', '🔄 Reset'), act: ['again'] }], stages: rippleStages },
      { id: 'interf', icon: '🎵', subs: ['3.1'], items: [61, 62, 63, 64], title: sc('干涉與程差', 'Interference and path difference'),
        desc: sc('兩個波源相遇：相長、相消，用程差預測。', 'Two sources meet: constructive and destructive interference, predicted by path difference.'),
        base: { mode: 'tank', scen: 'two' }, params: ['sep', 'fq'], graphs: ['probe'], camera: { pos: [0, 7.6, 5.6], target: [0, 0.8, 0.3] }, buttons: [{ label: sc('🔄 重設', '🔄 Reset'), act: ['again'] }], stages: interfStages },
      { id: 'sound', icon: '🔊', subs: ['3.3'], items: [76, 77, 78], title: sc('聲音與超聲波', 'Sound and ultrasound'),
        desc: sc('聲音是縱波，太空聽不到聲，用超聲波量海深。', 'Sound is a longitudinal wave, space is silent, and ultrasound measures the sea.'),
        base: { mode: 'sound' }, params: ['sf', 'sA', 'air', 'depth'], graphs: ['mic'],
        buttons: [{ label: sc('🔊 聽聲', '🔊 Listen'), act: ['listen'], cls: 'btn-primary', show: () => p.mode === 'sound' }, { label: sc('📡 發出超聲波', '📡 Send ultrasound'), act: ['ping'], cls: 'btn-primary', show: () => p.mode === 'sonar' }], stages: soundStages }
    ],
    mount, apply, again, act, update, labels, setParam,
    getParam: (k) => p[k], hist: () => H, ghost: () => ghost, simTime: () => S.simT,
    tap, screenPos, describeGraph
  };
}
