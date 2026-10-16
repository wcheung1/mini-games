/* =====================================================================
 * 實驗枱：原子實驗枱（atom）
 * 單元：⚛️ 原子結構與同位素（128–129）、☢️ 輻射（119, 120, 124, 126, 127）、⏳ 衰變與半衰期（121–123, 125）、☀️ 核能（130–132）
 * 模式：atom / radiation / decay / nuclear
 * ===================================================================== */
export default function create(ctx) {
  const { THREE, kit, root } = ctx;
  const { std, mesh, tag, glass, canvasTex, Hist, C, f } = kit;
  const L = kit.L2(ctx.lang);
  const clamp = THREE.MathUtils.clamp;
  const sc = (zh, en) => ({ zh, en });
  const TY = 0.85;

  const EL = [null, ['H', '氫', 'Hydrogen', 0], ['He', '氦', 'Helium', 2], ['Li', '鋰', 'Lithium', 4], ['Be', '鈹', 'Beryllium', 5], ['B', '硼', 'Boron', 6], ['C', '碳', 'Carbon', 6], ['N', '氮', 'Nitrogen', 7], ['O', '氧', 'Oxygen', 8], ['F', '氟', 'Fluorine', 10], ['Ne', '氖', 'Neon', 10]];
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹', SUB = '₀₁₂₃₄₅₆₇₈₉';
  const sup = (n) => String(n).split('').map((d) => SUP[+d]).join(''), subs = (n) => String(n).split('').map((d) => SUB[+d]).join('');
  const DEF = { mode: 'atom', Z: 1, Nn: 0, ne: 1, src: 'alpha', paper: false, al: false, lead: false, bfield: false, dist: 1, xray: false, T: 4, rods: 0, proc: 'fission', temp: 5 };
  const p = { ...DEF };
  const params = [
    { key: 'Z', label: sc('🔴 質子數目', '🔴 Protons'), min: 1, max: 10, step: 1, unit: '' },
    { key: 'Nn', label: sc('⚪ 中子數目', '⚪ Neutrons'), min: 0, max: 12, step: 1, unit: '' },
    { key: 'ne', label: sc('🔵 電子數目', '🔵 Electrons'), min: 0, max: 10, step: 1, unit: '' },
    { key: 'src', type: 'select', label: sc('☢️ 放射源', '☢️ Source'), options: [{ v: 'alpha', label: sc('α', 'α') }, { v: 'beta', label: sc('β', 'β') }, { v: 'gamma', label: sc('γ', 'γ') }, { v: 'none', label: sc('移走放射源', 'No source') }] },
    { key: 'paper', type: 'toggle', label: sc('📄 一張紙', '📄 A sheet of paper') },
    { key: 'al', type: 'toggle', label: sc('🥫 幾毫米厚的鋁片', '🥫 A few mm of aluminium') },
    { key: 'lead', type: 'toggle', label: sc('🧱 幾厘米厚的鉛板', '🧱 A few cm of lead') },
    { key: 'bfield', type: 'toggle', label: sc('🧲 加磁場', '🧲 Add a magnetic field') },
    { key: 'dist', label: sc('📏 探測器距離', '📏 Detector distance'), min: 1, max: 3, step: 0.5, unit: '×' },
    { key: 'xray', type: 'toggle', label: sc('🩻 X 光片', '🩻 X-ray image') },
    { key: 'T', label: sc('⏳ 半衰期', '⏳ Half-life'), min: 2, max: 10, step: 1, unit: 's' },
    { key: 'rods', label: sc('🎛️ 控制棒（吸收中子）', '🎛️ Control rods (absorb neutrons)'), min: 0, max: 0.9, step: 0.1, unit: '', fmt: (v) => Math.round(v * 100) + '%' },
    { key: 'proc', type: 'select', label: sc('⚛️ 核反應', '⚛️ Reaction'), options: [{ v: 'fission', label: sc('核裂變', 'Fission') }, { v: 'fusion', label: sc('核聚變', 'Fusion') }] },
    { key: 'temp', label: sc('🌡️ 溫度（百萬 °C）', '🌡️ Temperature (million °C)'), min: 1, max: 15, step: 1, unit: '' }
  ];
  const graphs = [
    { id: 'N', tab: sc('未衰變數目 N–t', 'Undecayed N–t'), y: sc('未衰變原子核數目', 'undecayed nuclei'), fixed: [0, 105], span: 1e9, minSpan: 12, total: 'Nth', evNote: sc('橙色虛線＝每過一個半衰期', 'orange dashed = each half-life'),
      series: [['N', sc('實驗', 'Experiment'), C.red], ['Nth', sc('理論 N₀(½)^(t/T)', 'Theory N₀(½)^(t/T)'), C.ink]] },
    { id: 'cr', tab: sc('計數率', 'Count rate'), y: sc('計數率（次/分鐘）', 'count rate (per minute)'), min: 60, span: 20, series: [['cr', sc('計數器', 'Counter'), C.teal]] }
  ];
  const ALL = params.map((q) => q.key);

  /* ---------------- 狀態 ---------------- */
  const S = { t: 0, lastSample: -1 };
  const rad = { parts: [], acc: 0, counts: [], bgAcc: 0 };
  const dec = { on: false, t: 0, n: [], hl: 0 };
  const nuc = { nuclei: [], neutrons: [], frags: [], fissions: 0, fuse: null };
  const H = new Hist(['N', 'Nth', 'cr']);
  let ghost = null;

  /* ---------------- 教學 ---------------- */
  const atomStages = [
    { id: 'at-intro', who: 'chan', title: sc('原子有幾細？', 'How small is an atom?'),
      say: sc('原子細到一粒沙入面已經有幾十億億粒。原子中間有一個好細嘅原子核，入面有帶正電嘅質子同唔帶電嘅中子；外面有帶負電嘅電子圍住轉。', 'Atoms are so small that one grain of sand holds billions of billions of them. In the middle is a tiny nucleus with positive protons and neutral neutrons, and negative electrons move around it.'),
      setup: { mode: 'atom', Z: 1, Nn: 0, ne: 1 }, items: [128] },
    { id: 'at-build', who: 'ming', title: sc('砌一粒碳原子', 'Build a carbon atom'),
      say: sc('碳原子有 6 粒質子、6 粒中子同 6 粒電子。打開工具箱，砌一粒碳原子！', 'A carbon atom has 6 protons, 6 neutrons and 6 electrons. Open the toolbox and build one!'),
      task: sc('把質子數目調到 6', 'Set the number of protons to 6'), setup: { mode: 'atom', Z: 1, Nn: 0, ne: 1 },
      goal: { type: 'param', test: () => p.Z === 6 }, demo: [['openTools'], ['set', 'Nn', 6], ['set', 'ne', 6], ['wait', 0.8], ['set', 'Z', 6]], settle: 2.5, items: [128] },
    { id: 'at-what', who: 'chan', title: sc('元素由咩決定？', 'What decides the element?'),
      say: sc('留意上面個名：改變唔同粒子嘅數目，原子會點變？', 'Watch the name above the atom. What changes when we change each kind of particle?'), setup: { mode: 'atom', Z: 6, Nn: 6, ne: 6 },
      quiz: { q: sc('原子係咩元素，由咩決定？', 'What decides which element an atom is?'), opts: [sc('質子數目', 'The number of protons'), sc('中子數目', 'The number of neutrons'), sc('電子數目', 'The number of electrons')], ans: 0,
        why: sc('答案係：質子數目！質子數目叫原子序，6 粒質子一定係碳，7 粒就變咗氮。電子數目改變只會令原子變成離子，帶電。', 'The answer: the number of protons! It is called the atomic number. 6 protons is always carbon; 7 makes nitrogen. Changing the electrons only turns the atom into a charged ion.') }, items: [128, 129] },
    { id: 'at-iso', who: 'chan', title: sc('同位素：估一估', 'Isotopes: predict'),
      say: sc('碳原子再加兩粒中子。', 'We add two more neutrons to the carbon atom.'), setup: { mode: 'atom', Z: 6, Nn: 6, ne: 6 }, lock: ALL,
      quiz: { q: sc('8 粒中子嘅碳，係咩嚟？', 'What is carbon with 8 neutrons?'), opts: [sc('仍然係碳，叫同位素', 'Still carbon: an isotope'), sc('變咗氮', 'It becomes nitrogen'), sc('唔再係原子', 'It is no longer an atom')], ans: 0,
        run: [['set', 'Nn', 8]], watch: 1.5,
        why: sc('答案係：仍然係碳！質子數目一樣、中子數目唔同，叫同位素。碳-14 會慢慢衰變，考古學家用佢嚟計古物有幾老。', 'The answer: still carbon! Same protons, different neutrons: an isotope. Carbon-14 slowly decays, and archaeologists use it to date ancient objects.') },
      chain: [sc('質子數目相同', 'Same protons'), sc('中子數目不同', 'Different neutrons'), sc('同一元素的同位素', 'Isotopes of one element')], items: [129] },
    { id: 'at-sym', who: 'chan', title: sc('符號表示法', 'Symbolic notation'),
      say: sc('科學家寫原子會喺符號左上角寫質量數，即係質子加中子；左下角寫原子序，即係質子數。例如碳-14 寫做左上 14、左下 6 嘅 C。', 'Scientists write the mass number, protons plus neutrons, at the top left of the symbol, and the atomic number, the protons, at the bottom left. Carbon-14 is C with 14 on top and 6 below.'),
      setup: { mode: 'atom', Z: 6, Nn: 8, ne: 6 },
      adv: sc('質量數 A = 質子數 Z + 中子數 N。', 'Mass number A = atomic number Z + neutron number N.'),
      chain: [sc('左上：質量數 A', 'Top left: mass number A'), sc('左下：原子序 Z', 'Bottom left: atomic number Z')], items: [129] },
    { id: 'at-sum', who: 'chan', title: sc('總結', 'Summary'),
      say: sc('原子由質子、中子同電子組成；質子數目決定係咩元素；中子數目唔同就係同位素。', 'Atoms are made of protons, neutrons and electrons; the number of protons decides the element; different neutron numbers make isotopes.'),
      setup: { mode: 'atom', Z: 8, Nn: 8, ne: 8 }, finish: true }
  ];
  const radStages = [
    { id: 'ra-intro', who: 'chan', title: sc('三種輻射', 'Three kinds of radiation'),
      say: sc('有啲原子核唔穩定，會放出輻射。主要有三種：α 粒子係兩粒質子加兩粒中子，又大又重；β 粒子係高速電子；γ 射線係能量好高嘅電磁波。右邊個探測器會數到幾多輻射。', 'Some nuclei are unstable and give out radiation. There are three main kinds: alpha particles are two protons and two neutrons, big and heavy; beta particles are fast electrons; gamma rays are high-energy electromagnetic waves. The detector on the right counts them.'),
      setup: { mode: 'radiation', src: 'alpha' }, graph: 'cr', items: [120, 126] },
    { id: 'ra-paper', who: 'chan', title: sc('紙：估一估', 'Paper: predict'),
      say: sc('我哋喺放射源前面放一張紙。', 'We put a sheet of paper in front of the source.'), setup: { mode: 'radiation', src: 'alpha' }, lock: ALL, graph: 'cr',
      quiz: { q: sc('邊種輻射一張紙就擋得住？', 'Which radiation is stopped by a sheet of paper?'), opts: [sc('α', 'Alpha'), sc('β', 'Beta'), sc('γ', 'Gamma')], ans: 0,
        run: [['set', 'paper', true]], watch: 3,
        why: sc('答案係：α！α 粒子又大又重，好快就撞停，一張紙甚至幾厘米空氣都擋得住。但係如果食咗入肚就好危險。', 'The answer: alpha! Alpha particles are big and heavy and stop very quickly: a sheet of paper or a few centimetres of air is enough. But they are very dangerous if swallowed.') },
      chain: [sc('α 最大最重', 'Alpha is biggest and heaviest'), sc('好快撞停', 'Stops very quickly'), sc('穿透力最弱', 'Weakest penetration')], items: [120] },
    { id: 'ra-pen', who: 'ming', title: sc('β 同 γ', 'Beta and gamma'),
      say: sc('β 粒子穿得過紙，但幾毫米厚嘅鋁片就擋得住；γ 射線穿透力最強，要好厚嘅鉛先可以大大減弱。試吓揀 γ，再加鉛板！', 'Beta particles go through paper but are stopped by a few millimetres of aluminium; gamma rays are the most penetrating and need thick lead to reduce them a lot. Try choosing gamma and adding lead!'),
      task: sc('揀 γ 射線，再放鉛板', 'Choose gamma, then add the lead sheet'), setup: { mode: 'radiation', src: 'beta', paper: true }, graph: 'cr',
      goal: { type: 'param', test: () => p.src === 'gamma' && p.lead }, demo: [['openTools'], ['set', 'al', true], ['wait', 2], ['set', 'src', 'gamma'], ['wait', 1.5], ['set', 'lead', true]], settle: 3,
      chain: [sc('α：紙', 'Alpha: paper'), sc('β：鋁', 'Beta: aluminium'), sc('γ：厚鉛', 'Gamma: thick lead')], items: [120] },
    { id: 'ra-field', who: 'chan', title: sc('磁場偏轉：估一估', 'Deflection: predict'),
      say: sc('我哋喺中間加一個磁場。帶電嘅粒子經過磁場會轉彎。', 'We add a magnetic field in the middle. Charged particles curve as they pass through it.'), setup: { mode: 'radiation', src: 'gamma' }, lock: ALL,
      quiz: { q: sc('喺磁場入面，邊種輻射完全唔會轉彎？', 'Which radiation does not bend at all in the magnetic field?'), opts: [sc('α', 'Alpha'), sc('β', 'Beta'), sc('γ', 'Gamma')], ans: 2,
        run: [['set', 'bfield', true], ['set', 'src', 'beta'], ['wait', 1.5], ['set', 'src', 'alpha'], ['wait', 1.5], ['set', 'src', 'gamma'], ['wait', 1.5]], watch: 0.5,
        why: sc('答案係：γ！γ 射線唔帶電，所以唔會轉彎。α 帶正電、β 帶負電，所以轉向相反方向；β 好輕，轉得最急。喺電場入面都係一樣道理。', 'The answer: gamma! Gamma rays carry no charge, so they go straight. Alpha is positive and beta negative, so they bend opposite ways, and the very light beta bends most. Electric fields do the same.') },
      chain: [sc('γ 不帶電：直行', 'Gamma: no charge, straight'), sc('α 正、β 負：轉向相反', 'Alpha +, beta −: opposite bends'), sc('β 最輕：轉得最急', 'Beta lightest: bends most')], items: [124] },
    { id: 'ra-bg', who: 'chan', title: sc('背景輻射', 'Background radiation'),
      say: sc('將放射源拎走，探測器都仲會間中響。呢啲係背景輻射，來自岩石、泥土、食物，甚至太空。量度輻射時要減去背景計數。', 'Take the source away and the detector still clicks now and then. That is background radiation from rocks, soil, food and even outer space. When measuring a source, we subtract the background count.'),
      task: sc('移走放射源，聽吓背景輻射', 'Remove the source and listen to the background'), setup: { mode: 'radiation', src: 'alpha' }, graph: 'cr',
      goal: { type: 'param', test: () => p.src === 'none' }, demo: [['openTools'], ['set', 'src', 'none']], settle: 4, items: [126] },
    { id: 'ra-safe', who: 'chan', title: sc('X 光與輻射安全', 'X-rays and radiation safety'),
      say: sc('X 光同 γ 射線一樣係電磁波，可以穿過肌肉，但會被骨頭擋住，所以醫生用嚟睇骨折。不過輻射會傷害細胞，所以要小心。', 'X-rays are electromagnetic waves like gamma rays. They pass through flesh but are stopped by bone, so doctors use them to see broken bones. But radiation can damage cells, so we must be careful.'),
      setup: { mode: 'radiation', src: 'gamma', xray: true },
      quiz: { q: sc('做 X 光時，醫護人員離開房間或者著鉛衣，係因為？', 'Why do hospital staff leave the room or wear lead aprons during X-rays?'), opts: [sc('減少接觸輻射', 'To reduce their exposure to radiation'), sc('因為房間好熱', 'The room is hot'), sc('因為好嘈', 'It is noisy')], ans: 0,
        run: [['set', 'xray', false], ['set', 'dist', 3]], watch: 2,
        why: sc('答案係：減少接觸輻射！保護自己有三招：時間越短越好、距離越遠越好、中間加屏障例如鉛。睇吓計數率：探測器遠咗，計數率大大減少。', 'The answer: to reduce exposure! Three ways to stay safe: less time, more distance, and shielding such as lead. Look at the count rate: with the detector further away, it drops a lot.') },
      chain: [sc('時間短', 'Less time'), sc('距離遠', 'More distance'), sc('加屏障', 'Shielding')], items: [119, 127] },
    { id: 'ra-sum', who: 'chan', title: sc('總結', 'Summary'),
      say: sc('α 被紙擋住、β 被鋁擋住、γ 要厚鉛；帶電嘅 α 同 β 喺磁場會轉彎；背景輻射無處不在；用時間、距離同屏障保護自己。', 'Alpha is stopped by paper, beta by aluminium, gamma needs thick lead; charged alpha and beta bend in fields; background radiation is everywhere; and time, distance and shielding keep us safe.'),
      setup: { mode: 'radiation', src: 'beta', bfield: true }, finish: true }
  ];
  const decayStages = [
    { id: 'de-intro', who: 'chan', title: sc('放射衰變', 'Radioactive decay'),
      say: sc('呢度有 100 粒不穩定嘅原子核。每粒都會喺某一刻衰變，好似爆谷咁：你估唔到邊一粒先爆，但係可以估到大約幾多粒爆咗。', 'Here are 100 unstable nuclei. Each will decay at some moment, like popcorn popping: you can’t predict which one pops next, but you can predict roughly how many will have popped.'),
      setup: { mode: 'decay', T: 4 }, graph: 'N', items: [121] },
    { id: 'de-q', who: 'chan', title: sc('半衰期：估一估', 'Half-life: predict'),
      say: sc('呢種原子核嘅半衰期係 4 秒。', 'These nuclei have a half-life of 4 seconds.'), setup: { mode: 'decay', T: 4 }, lock: ALL, graph: 'N',
      quiz: { q: sc('100 粒原子核，4 秒後大約剩低幾多粒未衰變？', 'Starting with 100 nuclei, about how many are left after 4 seconds?'), opts: [sc('大約 50 粒', 'About 50'), sc('0 粒', 'None'), sc('大約 25 粒', 'About 25')], ans: 0,
        run: [['start'], ['wait', 4.2]], watch: 0.3,
        why: sc('答案係：大約 50 粒！半衰期就係一半原子核衰變所需嘅時間。因為衰變係隨機嘅，所以未必啱啱好 50，但會好接近。', 'The answer: about 50! The half-life is the time for half of the nuclei to decay. Because decay is random, it may not be exactly 50, but it will be close.') },
      chain: [sc('過了一個半衰期', 'One half-life passes'), sc('一半已衰變', 'Half have decayed'), sc('剩下約一半', 'About half remain')], items: [121, 123] },
    { id: 'de-random', who: 'ming', title: sc('隨機', 'Random'),
      say: sc('我仲有一個問題。', 'I have another question.'),
      quiz: { q: sc('可唔可以估到邊一粒原子核下一粒衰變？', 'Can we predict which nucleus will decay next?'), opts: [sc('可以', 'Yes'), sc('唔可以，衰變係隨機嘅', 'No, decay is random'), sc('只可以估最大嗰粒', 'Only the biggest one')], ans: 1,
        why: sc('答案係：唔可以！衰變係隨機、自發嘅，溫度同壓力都改變唔到。但係數目夠多，整體就好有規律。', 'The answer: no! Decay is random and spontaneous; even temperature and pressure can’t change it. But with lots of nuclei, the overall pattern is very regular.') }, items: [122] },
    { id: 'de-graph', who: 'chan', title: sc('從圖求半衰期', 'Half-life from a graph'),
      say: sc('睇吓圖：每過一個半衰期，數目就減一半：100、50、25、12……條線越來越平但永遠唔會到零。到你試：改變半衰期，再撳開始。', 'Look at the graph: each half-life, the number halves: 100, 50, 25, 12… The curve flattens but never quite reaches zero. Your turn: change the half-life and tap Start.'),
      task: sc('改變半衰期，再按「開始衰變」', "Change the half-life, then tap 'Start decay'"), setup: { mode: 'decay', T: 4 }, graph: 'N',
      goal: { type: 'start', test: () => p.T !== 4 }, demo: [['openTools'], ['set', 'T', 8], ['start'], ['wait', 4]], settle: 4, items: [123] },
    { id: 'de-two', who: 'chan', title: sc('兩個半衰期', 'Two half-lives'),
      say: sc('最後一條數。', 'One last calculation.'),
      quiz: { q: sc('經過兩個半衰期，剩低幾多分之幾？', 'After two half-lives, what fraction is left?'), opts: [sc('二分之一', 'One half'), sc('四分之一', 'One quarter'), sc('零', 'None')], ans: 1,
        why: sc('答案係：四分之一！一半嘅一半就係四分之一。三個半衰期就剩八分之一。', 'The answer: one quarter! Half of a half is a quarter. After three half-lives, one eighth is left.') },
      adv: sc('N = N₀ × (½)^(t ÷ T)；碳-14 半衰期約 5730 年，可以用嚟計古物年齡。', 'N = N₀ × (½)^(t ÷ T). Carbon-14 has a half-life of about 5730 years, which is used to date ancient objects.'), items: [125] },
    { id: 'de-sum', who: 'chan', title: sc('總結', 'Summary'),
      say: sc('衰變係隨機嘅，但整體有規律；半衰期係一半原子核衰變需要嘅時間，可以喺 N–t 圖讀出嚟。', 'Decay is random but follows an overall pattern; the half-life is the time for half the nuclei to decay, and you can read it off an N–t graph.'),
      finish: true }
  ];
  const nuclearStages = [
    { id: 'nu-intro', who: 'chan', title: sc('原子核的能量', 'Energy in the nucleus'),
      say: sc('原子核入面儲住極大嘅能量。愛因斯坦話過，少少質量都可以變成好大嘅能量。核電廠同太陽都係利用呢種能量。', 'The nucleus stores an enormous amount of energy. Einstein showed that a tiny bit of mass can turn into a huge amount of energy. Nuclear power stations and the Sun both use it.'),
      setup: { mode: 'nuclear', proc: 'fission', rods: 0 }, adv: sc('E = mc²：c 係光速，所以少少質量都等於好大能量。', 'E = mc²: c is the speed of light, so a little mass equals a lot of energy.'), items: [130] },
    { id: 'nu-fission', who: 'chan', title: sc('核裂變：估一估', 'Fission: predict'),
      say: sc('一粒中子射向鈾-235 原子核。', 'A neutron is fired at a uranium-235 nucleus.'), setup: { mode: 'nuclear', proc: 'fission', rods: 0 }, lock: ALL,
      quiz: { q: sc('會發生咩事？', 'What happens?'), opts: [sc('分裂成兩粒細啲嘅原子核，再放出中子同能量', 'It splits into two smaller nuclei, releasing neutrons and energy'), sc('兩粒黐埋', 'They stick together'), sc('冇反應', 'Nothing')], ans: 0,
        run: [['fire'], ['wait', 3]], watch: 0.5,
        why: sc('答案係：分裂！叫核裂變。分裂出嚟嘅中子又會撞其他鈾核，引發連鎖反應，放出極多能量。', 'The answer: it splits! This is nuclear fission. The released neutrons hit more uranium nuclei, setting off a chain reaction that releases a vast amount of energy.') },
      chain: [sc('中子撞鈾核', 'A neutron hits uranium'), sc('分裂並放出更多中子', 'It splits and releases more neutrons'), sc('連鎖反應', 'Chain reaction')], items: [130] },
    { id: 'nu-rods', who: 'ming', title: sc('控制棒', 'Control rods'),
      say: sc('核電廠用控制棒吸收多餘嘅中子，令連鎖反應保持穩定，唔會失控。將控制棒推入去 60% 或以上，再發射中子！', 'Power stations use control rods to soak up extra neutrons, keeping the chain reaction steady instead of running away. Push the control rods to 60% or more, then fire a neutron!'),
      task: sc('把控制棒調到 60% 或以上，再發射中子', 'Set the control rods to 60% or more, then fire a neutron'), setup: { mode: 'nuclear', proc: 'fission', rods: 0 },
      goal: { type: 'fire', test: () => p.rods >= 0.6 }, demo: [['openTools'], ['set', 'rods', 0.7], ['wait', 0.6], ['fire']], settle: 4, items: [130] },
    { id: 'nu-fusion', who: 'chan', title: sc('核聚變：估一估', 'Fusion: predict'),
      say: sc('太陽入面，兩粒好細嘅氫原子核喺極高溫下撞埋一齊。', 'Inside the Sun, two tiny hydrogen nuclei crash together at extremely high temperature.'), setup: { mode: 'nuclear', proc: 'fusion', temp: 3 }, lock: ALL,
      quiz: { q: sc('太陽發光發熱係靠？', 'What makes the Sun shine?'), opts: [sc('核聚變', 'Nuclear fusion'), sc('燒煤', 'Burning coal'), sc('核裂變', 'Nuclear fission')], ans: 0,
        run: [['collide'], ['wait', 2], ['set', 'temp', 12], ['collide'], ['wait', 2]], watch: 0.5,
        why: sc('答案係：核聚變！溫度唔夠高，兩粒帶正電嘅原子核會互相推開；溫度夠高、夠快，就可以黐埋變成氦，放出巨大能量。', 'The answer: nuclear fusion! At low temperature, the two positive nuclei repel each other; hot and fast enough, they fuse into helium and release huge energy.') },
      chain: [sc('極高溫', 'Extremely high temperature'), sc('氫核克服排斥撞埋', 'Hydrogen nuclei overcome repulsion'), sc('變成氦並放出能量', 'They form helium and release energy')], items: [131] },
    { id: 'nu-pros', who: 'chan', title: sc('核電的優點和缺點', 'Pros and cons of nuclear power'),
      say: sc('核電發電量大、幾乎唔排二氧化碳；但係有放射性廢料要好耐先安全，萬一出事會好嚴重。兩邊都有道理，我哋要用證據比較。', 'Nuclear power produces lots of electricity with almost no carbon dioxide, but it leaves radioactive waste that stays dangerous for a long time, and accidents can be very serious. Both sides have a point, so we compare the evidence.'),
      quiz: { q: sc('以下邊樣係核電嘅缺點？', 'Which of these is a drawback of nuclear power?'), opts: [sc('會產生要長時間處理嘅放射性廢料', 'It produces radioactive waste that must be stored for a very long time'), sc('排放大量二氧化碳', 'It releases lots of carbon dioxide'), sc('發電量好細', 'It produces very little electricity')], ans: 0,
        why: sc('答案係：放射性廢料！其他兩個其實係核電嘅優點相反：核電幾乎唔排二氧化碳，發電量亦好大。做決定要考慮安全、環境同成本。', 'The answer: radioactive waste! The other two are actually the opposite of the truth: nuclear power releases almost no carbon dioxide and generates a lot of electricity. Decisions must weigh safety, environment and cost.') }, items: [132] },
    { id: 'nu-sum', who: 'chan', title: sc('總結', 'Summary'),
      say: sc('核裂變係重原子核分裂，用控制棒控制連鎖反應；核聚變係輕原子核結合，太陽靠佢發光。核電有好處亦有風險，要理性討論。', 'Fission splits heavy nuclei, with control rods keeping the chain reaction in check; fusion joins light nuclei and powers the Sun. Nuclear power has benefits and risks that deserve calm, evidence-based discussion.'),
      setup: { mode: 'nuclear', proc: 'fission', rods: 0.5 }, finish: true }
  ];

  /* ================== 3D 場景 ================== */
  const G = {}; ['atom', 'radiation', 'decay', 'nuclear'].forEach((k) => { G[k] = new THREE.Group(); root.add(G[k]); });
  const V = {};
  const AC = new THREE.Vector3(0, 2.3, 0);
  const matP = std(0xdc2626, 0.4), matN = std(0x94a3b8, 0.4), matE = std(0x2563eb, 0.3, 0, { emissive: 0x1d4ed8, emissiveIntensity: 0.4 });
  function cluster(n) { const out = []; for (let k = 0; k < n; k++) { const r = 0.14 * Math.cbrt(k + 1), th = k * 2.39996, y = 1 - (2 * (k + 0.5)) / Math.max(n, 1); const rr = Math.sqrt(Math.max(0, 1 - y * y)); out.push(new THREE.Vector3(Math.cos(th) * rr * r, y * r, Math.sin(th) * rr * r)); } return out; }
  function mount() {
    mesh(new THREE.BoxGeometry(11, 0.1, 5), std(0xcbd5e1, 0.8), 0, TY - 0.05, 0, root);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) mesh(new THREE.BoxGeometry(0.12, TY - 0.1, 0.12), std(0x64748b, 0.5, 0.5), sx * 5.3, (TY - 0.1) / 2, sz * 2.3, root);
    // 原子
    const gA = G.atom;
    V.nuc = []; for (let i = 0; i < 22; i++) V.nuc.push(mesh(new THREE.SphereGeometry(0.11, 16, 12), matP, 0, 0, 0, gA, false));
    V.shells = [1.0, 1.6].map((r) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.008, 6, 80), new THREE.MeshBasicMaterial({ color: 0x94a3b8 })); m.position.copy(AC); m.rotation.x = Math.PI / 2.3; gA.add(m); return m; });
    V.els = []; for (let i = 0; i < 10; i++) V.els.push(mesh(new THREE.SphereGeometry(0.07, 12, 10), matE, 0, 0, 0, gA, false));
    V.aTag = tag('readout', gA, 0, AC.y + 2.0, 0);
    V.legend = tag('readout light', gA, 0, TY + 0.25, 1.6);
    // 輻射
    const gR = G.radiation;
    mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), std(0x475569, 0.5, 0.6), -4.4, TY + 0.4, 0, gR);
    V.srcTag = tag('readout', gR, -4.4, TY + 1.2, 0);
    V.paper = mesh(new THREE.BoxGeometry(0.02, 1, 1), std(0xfefce8, 0.9), -2.6, TY + 0.6, 0, gR);
    V.al = mesh(new THREE.BoxGeometry(0.08, 1, 1), std(0xcbd5e1, 0.3, 0.9), -1.8, TY + 0.6, 0, gR);
    V.lead = mesh(new THREE.BoxGeometry(0.4, 1, 1), std(0x52525b, 0.6, 0.4), -0.9, TY + 0.6, 0, gR);
    V.field = mesh(new THREE.BoxGeometry(3, 0.05, 3.6), new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.18, depthWrite: false }), 1.0, TY + 0.02, 0, gR, false);
    V.fieldTag = tag('readout light', gR, 1.0, TY + 0.2, 1.6);
    V.det = new THREE.Group(); gR.add(V.det);
    mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.8, 16), std(0x334155, 0.4, 0.5), 0, 0, 0, V.det).rotation.z = Math.PI / 2;
    V.detTag = tag('readout', V.det, 0, 0.6, 0);
    V.pPool = []; for (let i = 0; i < 90; i++) V.pPool.push(mesh(new THREE.SphereGeometry(1, 10, 8), std(0xffffff), 0, -9, 0, gR, false));
    V.xray = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.8), new THREE.MeshBasicMaterial({ map: canvasTex(360, 460, (g, w, h) => {
      g.fillStyle = '#0f172a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e2e8f0'; g.lineCap = 'round';
      const bone = (x1, y1, x2, y2, wd) => { g.lineWidth = wd; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); };
      g.fillStyle = 'rgba(148,163,184,.25)'; g.beginPath(); g.ellipse(180, 300, 110, 140, 0, 0, Math.PI * 2); g.fill();
      bone(150, 450, 165, 340, 22); bone(215, 450, 200, 340, 18);
      [[95, 90], [135, 50], [180, 40], [225, 55], [285, 170]].forEach(([x, y], i) => { const bx = 120 + i * 30; bone(bx, 300, x, y + 90, 12); bone(x, y + 90, x, y, 9); });
    }) }));
    V.xray.position.set(3.2, TY + 1.6, -0.6); gR.add(V.xray);
    // 衰變
    const gD = G.decay;
    V.dn = []; for (let i = 0; i < 100; i++) { const m = mesh(new THREE.SphereGeometry(0.12, 14, 10), std(0x22c55e, 0.3, 0, { emissive: 0x16a34a, emissiveIntensity: 0.5 }), -2.25 + (i % 10) * 0.5, TY + 0.15, -1.5 + Math.floor(i / 10) * 0.333, gD); V.dn.push(m); }
    V.dTag = tag('readout', gD, 0, TY + 1.0, -1.9);
    // 核能
    const gN = G.nuclear;
    V.uPool = []; for (let i = 0; i < 14; i++) { const g = new THREE.Group(); gN.add(g); mesh(new THREE.SphereGeometry(0.28, 18, 14), std(0x16a34a, 0.4), 0, 0, 0, g); V.uPool.push(g); }
    V.nPool = []; for (let i = 0; i < 60; i++) V.nPool.push(mesh(new THREE.SphereGeometry(0.07, 8, 6), std(0xf8fafc, 0.4), 0, -9, 0, gN, false));
    V.fPool = []; for (let i = 0; i < 30; i++) V.fPool.push(mesh(new THREE.SphereGeometry(0.18, 12, 10), std(0xf97316, 0.4), 0, -9, 0, gN, false));
    V.flash = []; for (let i = 0; i < 14; i++) { const m = mesh(new THREE.SphereGeometry(0.5, 12, 10), new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0, depthWrite: false }), 0, -9, 0, gN, false); m.userData.t = 0; V.flash.push(m); }
    V.rodsG = new THREE.Group(); gN.add(V.rodsG);
    for (let i = 0; i < 4; i++) mesh(new THREE.BoxGeometry(0.15, 2.6, 0.15), std(0x111827, 0.5), -1.8 + i * 1.2, 0, 0.9, V.rodsG);
    V.nTag = tag('readout', gN, 0, TY + 2.7, 0);
    V.h = [0, 1].map((i) => { const g = new THREE.Group(); gN.add(g); mesh(new THREE.SphereGeometry(0.16, 12, 10), matP, 0, 0, 0, g); mesh(new THREE.SphereGeometry(0.16, 12, 10), matN, 0.2, 0.05, 0, g); if (i) mesh(new THREE.SphereGeometry(0.16, 12, 10), matN, 0.05, 0.22, 0.1, g); return g; });
    V.he = new THREE.Group(); gN.add(V.he); cluster(4).forEach((v, i) => mesh(new THREE.SphereGeometry(0.16, 12, 10), i % 2 ? matN : matP, v.x * 1.8, v.y * 1.8, v.z * 1.8, V.he));
  }

  /* ---------------- 各模式邏輯 ---------------- */
  function resetNuclear() {
    nuc.nuclei = []; nuc.neutrons = []; nuc.frags = []; nuc.fissions = 0; nuc.fuse = null;
    for (let i = 0; i < 14; i++) { const x = -3 + (i % 7) * 1.0 + (Math.floor(i / 7) % 2) * 0.5, y = TY + 1.1 + Math.floor(i / 7) * 1.0; nuc.nuclei.push({ x, y, z: 0, alive: true }); }
  }
  function resetDecay() { dec.on = false; dec.t = 0; dec.n = new Array(100).fill(true); dec.hl = 0; }
  function fire() {
    if (p.proc === 'fission') nuc.neutrons.push({ x: -4.6, y: nuc.nuclei[0].y, z: 0, vx: 2.4, vy: 0, vz: 0, life: 6 });
  }
  function emitRad(dt) {
    if (p.src === 'none') return;
    rad.acc += dt * 6;
    while (rad.acc > 1) { rad.acc -= 1; rad.parts.push({ k: p.src, x: -4.0, y: TY + 0.4 + (Math.random() - 0.5) * 0.2, z: (Math.random() - 0.5) * 0.3, vz: 0, alive: true }); }
  }
  const detX = () => 1.4 + p.dist * 1.0;
  function stepRad(dt) {
    emitRad(dt);
    const sp = { alpha: 2.2, beta: 4.0, gamma: 6.5 };
    for (const q of rad.parts) {
      if (!q.alive) continue;
      const ox = q.x; q.x += sp[q.k] * dt;
      if (p.bfield && q.x > -0.5 && q.x < 2.5) { if (q.k === 'alpha') q.vz += 0.6 * dt; if (q.k === 'beta') q.vz -= 2.6 * dt; }
      q.z += q.vz * dt;
      const cross = (bx) => ox < bx && q.x >= bx;
      if (p.paper && cross(-2.6) && q.k === 'alpha') q.alive = false;
      if (p.al && cross(-1.8) && q.k !== 'gamma') q.alive = false;
      if (p.lead && cross(-0.9) && (q.k !== 'gamma' || Math.random() < 0.85)) q.alive = false;
      if (q.alive && cross(detX())) { q.alive = false; if (Math.abs(q.z) < 0.35 && Math.random() < 1 / (p.dist * p.dist)) count(); }
      if (q.x > 5.3 || Math.abs(q.z) > 2.4) q.alive = false;
    }
    rad.parts = rad.parts.filter((q) => q.alive);
    rad.bgAcc += dt * 0.35 * Math.random() * 2;
    if (rad.bgAcc > 1) { rad.bgAcc = 0; count(); }
  }
  function count() { rad.counts.push(S.t); ctx.sfx('tick'); ctx.emit('count', {}); }
  function countRate() { const now = S.t; rad.counts = rad.counts.filter((t) => now - t < 10); return (rad.counts.length / Math.min(10, Math.max(now, 1))) * 60; }
  function stepDecay(dt) {
    if (!dec.on) return;
    dec.t += dt;
    const pr = 1 - Math.pow(0.5, dt / p.T);
    for (let i = 0; i < 100; i++) if (dec.n[i] && Math.random() < pr) { dec.n[i] = false; V.dn[i].userData.flash = 0.4; if (Math.random() < 0.4) ctx.sfx('tick'); }
    const N = dec.n.filter(Boolean).length;
    const k = Math.floor(dec.t / p.T);
    if (k > dec.hl) { dec.hl = k; H.ev.push({ t: dec.t, type: 'hl' }); }
    if (N <= 50 && !dec.halfFired) { dec.halfFired = true; ctx.emit('halflife', {}); }
  }
  function flashAt(x, y, z) { const f2 = V.flash.find((m) => m.userData.t <= 0); if (f2) { f2.position.set(x, y, z); f2.userData.t = 0.6; } }
  function stepNuclear(dt) {
    if (p.proc === 'fission') {
      for (const n of nuc.neutrons) {
        if (n.life <= 0) continue;
        n.x += n.vx * dt; n.y += n.vy * dt; n.life -= dt;
        if (Math.random() < p.rods * dt * 2.2) { n.life = 0; continue; }
        for (const u of nuc.nuclei) {
          if (!u.alive) continue;
          if ((n.x - u.x) ** 2 + (n.y - u.y) ** 2 < 0.12) {
            u.alive = false; n.life = 0; nuc.fissions++; flashAt(u.x, u.y, u.z); ctx.sfx('boom'); ctx.emit('fission', { n: nuc.fissions });
            nuc.frags.push({ x: u.x, y: u.y, vx: -1.2, vy: 0.8, life: 2 }, { x: u.x, y: u.y, vx: 1.2, vy: -0.8, life: 2 });
            for (let k = 0; k < 3; k++) { const a = Math.random() * Math.PI * 2; nuc.neutrons.push({ x: u.x, y: u.y, z: 0, vx: Math.cos(a) * 2.4, vy: Math.sin(a) * 2.4, vz: 0, life: 3 }); }
            if (nuc.fissions === 5) ctx.emit('chain', {});
            break;
          }
        }
        if (n.y < TY + 0.4 || n.y > TY + 3.4) n.vy *= -1;
      }
      nuc.neutrons = nuc.neutrons.filter((n) => n.life > 0).slice(-60);
      for (const fr of nuc.frags) { fr.x += fr.vx * dt; fr.y += fr.vy * dt; fr.life -= dt; }
      nuc.frags = nuc.frags.filter((q) => q.life > 0).slice(-30);
    } else if (nuc.fuse) {
      const F = nuc.fuse; F.t += dt;
      const ok = p.temp >= 10, meet = 1.0;
      if (F.t < meet) F.d = 2.4 * (1 - F.t / meet) + 0.2;
      else if (ok) { if (!F.done) { F.done = true; flashAt(0, TY + 1.6, 0); ctx.sfx('boom'); ctx.emit('fused', {}); } }
      else { F.d = 0.2 + (F.t - meet) * 2.4; if (!F.bounced) { F.bounced = true; ctx.sfx('tick'); ctx.emit('bounced', {}); } }
      if (F.t > 3 && !F.done) nuc.fuse = null;
    }
  }

  /* ================== 每幀 ================== */
  function sample() {
    const N = dec.n.filter(Boolean).length;
    H.push(S.t, { N: p.mode === 'decay' && dec.on ? N : NaN, Nth: p.mode === 'decay' && dec.on ? 100 * Math.pow(0.5, dec.t / p.T) : NaN, cr: p.mode === 'radiation' ? countRate() : NaN });
  }
  function update(dt, time) {
    S.t += dt; if (p.mode === 'decay' && dec.on) S.dt = dec.t;
    if (p.mode === 'radiation') stepRad(dt); else if (p.mode === 'decay') stepDecay(dt); else if (p.mode === 'nuclear') stepNuclear(dt);
    if (S.t - S.lastSample >= 1 / 15) { S.lastSample = S.t; if (p.mode === 'decay') { if (dec.on) H.push(dec.t, { N: dec.n.filter(Boolean).length, Nth: 100 * Math.pow(0.5, dec.t / p.T), cr: NaN }); } else sample(); }
    if (p.mode === 'atom') {
      const tot = p.Z + p.Nn, pts = cluster(tot);
      let pi = 0, ni = 0;
      V.nuc.forEach((m, i) => {
        m.visible = i < tot; if (!m.visible) return;
        const wantP = pi < p.Z && (ni >= p.Nn || i % 2 === 0); m.material = wantP ? matP : matN; if (wantP) pi++; else ni++;
        m.position.copy(AC).add(pts[i].multiplyScalar(1.6));
      });
      V.els.forEach((m, i) => {
        m.visible = i < p.ne; if (!m.visible) return;
        const shell = i < 2 ? 0 : 1, n = shell ? Math.max(1, p.ne - 2) : Math.min(2, p.ne), k = shell ? i - 2 : i, r = shell ? 1.6 : 1.0, a = time * (shell ? 0.8 : 1.3) + (k / n) * Math.PI * 2;
        m.position.set(AC.x + Math.cos(a) * r, AC.y + Math.sin(a) * r * 0.208, AC.z + Math.sin(a) * r * 0.978);
      });
    } else if (p.mode === 'radiation') {
      const col = { alpha: 0xdc2626, beta: 0x2563eb, gamma: 0xfacc15 }, size = { alpha: 0.11, beta: 0.05, gamma: 0.05 };
      V.pPool.forEach((m, i) => { const q = rad.parts[i]; m.visible = !!q; if (q) { m.position.set(q.x, q.y, q.z); m.scale.set(q.k === 'gamma' ? 0.16 : size[q.k], size[q.k], size[q.k]); m.material.color.set(col[q.k]); } });
      V.paper.visible = p.paper; V.al.visible = p.al; V.lead.visible = p.lead; V.field.visible = V.fieldTag.o.visible = p.bfield;
      V.det.position.set(detX() + 0.4, TY + 0.4, 0); V.xray.visible = p.xray;
    } else if (p.mode === 'decay') {
      V.dn.forEach((m, i) => { const alive = dec.n[i]; m.material.color.set(alive ? 0x22c55e : 0x475569); m.material.emissiveIntensity = alive ? 0.5 : 0; const fl = m.userData.flash || 0; if (fl > 0) m.userData.flash = fl - dt; m.scale.setScalar(alive ? 1 : 0.7 + Math.max(0, fl) * 1.5); });
    } else if (p.mode === 'nuclear') {
      const fis = p.proc === 'fission';
      V.uPool.forEach((g, i) => { const u = nuc.nuclei[i]; g.visible = fis && !!u && u.alive; if (g.visible) g.position.set(u.x, u.y, u.z); });
      V.nPool.forEach((m, i) => { const n = nuc.neutrons[i]; m.visible = fis && !!n; if (n) m.position.set(n.x, n.y, 0); });
      V.fPool.forEach((m, i) => { const q = nuc.frags[i]; m.visible = fis && !!q; if (q) m.position.set(q.x, q.y, 0.2); });
      V.rodsG.visible = fis; V.rodsG.position.y = TY + 1.6 + (1 - p.rods) * 2.4;
      const F = nuc.fuse;
      V.h.forEach((g, i) => { g.visible = !fis && (!F || !F.done); const d = F ? F.d : 2.4; g.position.set((i ? 1 : -1) * d / 2, TY + 1.6, 0); });
      V.he.visible = !fis && !!F && F.done; V.he.position.set(0, TY + 1.6, 0);
    }
    V.flash.forEach((m) => { if (m.userData.t > 0) { m.userData.t -= dt; m.material.opacity = Math.max(0, m.userData.t / 0.6) * 0.8; m.scale.setScalar(1 + (0.6 - m.userData.t) * 3); } else m.material.opacity = 0; });
  }
  function labels() {
    if (p.mode === 'atom') {
      const e = EL[p.Z], A = p.Z + p.Nn, ch = p.Z - p.ne, common = e[3];
      V.aTag.el.innerHTML = `${sup(A)}${subs(p.Z)}${e[0]} · ${L({ zh: e[1], en: e[2] })}-${A}` + `<small>${L(sc('質子', 'protons'))} ${p.Z} · ${L(sc('中子', 'neutrons'))} ${p.Nn} · ${L(sc('電子', 'electrons'))} ${p.ne}${ch ? ' · ' + L(sc('離子', 'ion')) + ' ' + (ch > 0 ? '+' + ch : ch) : ''}${p.Nn !== common ? ' · ' + L(sc('同位素', 'isotope')) : ''}</small>`;
      V.legend.el.innerHTML = `🔴 ${L(sc('質子 +', 'proton +'))} · ⚪ ${L(sc('中子 0', 'neutron 0'))} · 🔵 ${L(sc('電子 −', 'electron −'))}`;
    } else if (p.mode === 'radiation') {
      V.srcTag.el.innerHTML = p.src === 'none' ? L(sc('冇放射源', 'no source')) : `${{ alpha: 'α', beta: 'β', gamma: 'γ' }[p.src]} ${L(sc('放射源', 'source'))}`;
      V.detTag.el.innerHTML = L(sc('計數率', 'count rate')) + ` ${Math.round(countRate())}<small>${L(sc('次/分鐘', 'per minute'))}</small>`;
      V.fieldTag.el.textContent = L(sc('⊗ 磁場（指入枱面）', '⊗ magnetic field (into the table)'));
    } else if (p.mode === 'decay') {
      const N = dec.n.filter(Boolean).length;
      V.dTag.el.innerHTML = L(sc('未衰變', 'undecayed')) + ` ${N} / 100<small>t = ${f(dec.t, 1)} s · ${L(sc('半衰期', 'half-life'))} ${p.T} s</small>`;
    } else if (p.mode === 'nuclear') {
      V.nTag.el.innerHTML = p.proc === 'fission' ? L(sc('核裂變次數', 'fissions')) + ` ${nuc.fissions}<small>⚡ ${L(sc('放出能量', 'energy released'))} ≈ ${nuc.fissions * 200} MeV</small>`
        : (nuc.fuse && nuc.fuse.done ? L(sc('聚變成功！氫 → 氦 + 能量', 'Fusion! Hydrogen → helium + energy')) : nuc.fuse && nuc.fuse.bounced ? L(sc('溫度唔夠，互相彈開', 'Not hot enough: they bounce apart')) : L(sc('溫度', 'temperature')) + ` ${p.temp} ${L(sc('百萬 °C', 'million °C'))}`);
    }
  }
  function sync() { for (const k of Object.keys(G)) G[k].visible = p.mode === k; }
  function apply(s = {}) {
    Object.assign(p, DEF); for (const k of Object.keys(DEF)) if (s[k] !== undefined) p[k] = s[k];
    rad.parts = []; rad.counts = []; resetDecay(); resetNuclear(); S.t = 0; S.lastSample = -1; H.reset(); ghost = null; dec.halfFired = false; sync();
  }
  function again() {
    if (p.mode === 'decay' && H.n > 5) ghost = { t: H.t.slice(), c: { N: H.c.N.slice(), Nth: [], cr: [] } };
    rad.parts = []; rad.counts = []; resetDecay(); resetNuclear(); dec.halfFired = false; if (p.mode === 'decay') H.reset();
  }
  function setParam(k, v) { p[k] = v; if (k === 'proc') { resetNuclear(); } if (k === 'src') rad.counts = []; if (k === 'T' && !dec.on) resetDecay(); }
  function act(a) {
    if (a[0] === 'start') { if (H.n > 5 && p.mode === 'decay') ghost = { t: H.t.slice(), c: { N: H.c.N.slice(), Nth: [], cr: [] } }; resetDecay(); dec.halfFired = false; H.reset(); dec.on = true; ctx.sfx('click'); ctx.emit('start', {}); }
    if (a[0] === 'fire') { if (nuc.nuclei.filter((u) => u.alive).length < 14) resetNuclear(); fire(); ctx.sfx('click'); ctx.emit('fire', {}); }
    if (a[0] === 'collide') { nuc.fuse = { t: 0, d: 2.4, done: false }; ctx.sfx('click'); }
  }
  function screenPos(a) {
    let v;
    if (a[0] === 'start') v = new THREE.Vector3(0, TY + 0.4, 0); else if (a[0] === 'fire') v = new THREE.Vector3(-4.6, TY + 1.1, 0); else if (a[0] === 'collide') v = new THREE.Vector3(0, TY + 1.6, 0); else return null;
    v.project(ctx.camera); return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight };
  }
  function tap(ray) {
    if (p.mode === 'atom' && ray.intersectObjects(V.nuc, false).length) { ctx.info('nuc', () => L(sc('原子核', 'Nucleus')), () => L(sc('原子核好細，但幾乎所有質量都喺度。質子帶正電，中子唔帶電。', 'The nucleus is tiny but holds almost all the mass. Protons are positive; neutrons have no charge.'))); return true; }
    return false;
  }
  function describeGraph(id) {
    const z = ctx.lang() === 'zh';
    if (id === 'N') return z ? '呢幅係未衰變原子核數目對時間嘅圖。紅線係實驗，黑線係理論。每過一個半衰期，數目就減一半，條曲線越來越平。' : 'This graph shows undecayed nuclei against time. Red is the experiment and black the theory. Each half-life the number halves, so the curve gets flatter and flatter.';
    return z ? `呢幅係探測器嘅計數率。放射源近啲、冇屏障，計數率就高；而家大約每分鐘 ${Math.round(countRate())} 次。` : `This is the detector's count rate. A closer, unshielded source gives a higher rate; right now it is about ${Math.round(countRate())} counts per minute.`;
  }
  return {
    board: { title: 'Atomic Physics · 原子物理', lines: ['A = Z + N', 'N = N₀(½)^(t/T)', 'E = mc²'],
      info: sc('黑板上：原子符號表示法；衰變公式 N = N₀(½)^(t/T)；愛因斯坦的 E = mc²。', "On the board: atomic notation; the decay formula N = N₀(½)^(t/T); and Einstein's E = mc²."), lines2: [] },
    camera: { pos: [0, 4.4, 8.2], target: [0, 1.6, 0] }, people: [[-6.6, -3.0, 0.5], [6.6, -3.0, -0.5]],
    params, graphs,
    buttons: [{ label: sc('▶️ 開始衰變', '▶️ Start decay'), act: ['start'], cls: 'btn-primary', show: () => p.mode === 'decay' }, { label: sc('💥 發射中子', '💥 Fire a neutron'), act: ['fire'], cls: 'btn-primary', show: () => p.mode === 'nuclear' && p.proc === 'fission' },
      { label: sc('☀️ 令兩粒氫核相撞', '☀️ Collide two hydrogen nuclei'), act: ['collide'], cls: 'btn-primary', show: () => p.mode === 'nuclear' && p.proc === 'fusion' }, { label: sc('🔄 重設', '🔄 Reset'), act: ['again'] }],
    lessons: [
      { id: 'atom', icon: '⚛️', subs: ['5.2'], items: [128, 129], title: sc('原子結構與同位素', 'Atomic structure and isotopes'),
        desc: sc('砌原子、元素由質子決定、同位素和符號表示法。', 'Build atoms, see how protons decide the element, and meet isotopes and notation.'),
        base: { mode: 'atom' }, params: ['Z', 'Nn', 'ne'], graphs: [], camera: { pos: [0, 3.4, 4.8], target: [0, 3.0, 0] }, stages: atomStages },
      { id: 'radiation', icon: '☢️', subs: ['5.1'], items: [119, 120, 124, 126, 127], title: sc('α、β、γ 輻射與安全', 'Alpha, beta, gamma and safety'),
        desc: sc('穿透力、磁場偏轉、背景輻射、X 光和輻射安全。', 'Penetration, deflection, background radiation, X-rays and safety.'),
        base: { mode: 'radiation' }, params: ['src', 'paper', 'al', 'lead', 'bfield', 'dist', 'xray'], graphs: ['cr'], camera: { pos: [0, 6.8, 9.6], target: [0, 2.2, 0] }, stages: radStages },
      { id: 'decay', icon: '⏳', subs: ['5.1'], items: [121, 122, 123, 125], title: sc('放射衰變與半衰期', 'Radioactive decay and half-life'),
        desc: sc('100 粒原子核隨機衰變，從圖讀出半衰期。', '100 nuclei decay at random; read the half-life from the graph.'),
        base: { mode: 'decay' }, params: ['T'], graphs: ['N'], camera: { pos: [0, 5.4, 5.6], target: [0, 0.9, 0] }, stages: decayStages },
      { id: 'nuclear', icon: '☀️', subs: ['5.3'], items: [130, 131, 132], title: sc('核裂變與核聚變', 'Nuclear fission and fusion'),
        desc: sc('連鎖反應、控制棒、太陽的核聚變和核電的利弊。', 'Chain reactions, control rods, fusion in the Sun, and the pros and cons of nuclear power.'),
        base: { mode: 'nuclear' }, params: ['proc', 'rods', 'temp'], graphs: [], camera: { pos: [0, 5.4, 7.8], target: [0, 3.3, 0] }, stages: nuclearStages }
    ],
    mount, apply, again, act, update, labels, setParam,
    getParam: (k) => p[k], hist: () => H, ghost: () => ghost, simTime: () => S.t,
    tap, screenPos, describeGraph
  };
}
