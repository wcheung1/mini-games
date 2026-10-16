/* =====================================================================
 * 實驗枱：光學枱（optics）
 * 單元：🪞 光和反射（65–67）、🔦 折射與全內反射（68–71）、🔍 透鏡（72–75）、🌈 色散與彩虹（L1）
 * 模式：spectrum / mirror / block / depth / semi / fibre / lens / prism
 * 內含一個二維光線追蹤器：反射、折射（斯涅耳定律）、全內反射、部分反射、薄透鏡、色散
 * ===================================================================== */
export default function create(ctx) {
  const { THREE, kit, root } = ctx;
  const { std, mesh, tag, glass, canvasTex, C, f } = kit;
  const L = kit.L2(ctx.lang);
  const clamp = THREE.MathUtils.clamp;
  const sc = (zh, en) => ({ zh, en });
  const D2R = Math.PI / 180, TY = 0.85;

  const DEF = { mode: 'mirror', inc: 30, img: false, od: 1.5, n: 1.5, mat: 'glass', fin: 8, lensType: 'convex', uo: 4, fl: 1.5, white: true };
  const p = { ...DEF };
  const MATS = { water: 1.33, glass: 1.5, diamond: 2.42 };
  const params = [
    { key: 'inc', label: sc('📐 入射角', '📐 Angle of incidence'), min: 0, max: 80, step: 5, unit: '°' },
    { key: 'img', type: 'toggle', label: sc('🕯️ 顯示鏡中的像', '🕯️ Show the image in the mirror') },
    { key: 'od', label: sc('↔️ 物件與鏡的距離', '↔️ Object distance from mirror'), min: 0.5, max: 2.5, step: 0.25, unit: 'm' },
    { key: 'n', label: sc('💎 折射率 n', '💎 Refractive index n'), min: 1.2, max: 2.0, step: 0.05, unit: '' },
    { key: 'mat', type: 'select', label: sc('💎 物料', '💎 Material'), options: [{ v: 'water', label: sc('水 (1.33)', 'Water (1.33)') }, { v: 'glass', label: sc('玻璃 (1.5)', 'Glass (1.5)') }, { v: 'diamond', label: sc('鑽石 (2.42)', 'Diamond (2.42)') }] },
    { key: 'fin', label: sc('🔦 光纖射入角度', '🔦 Fibre entry angle'), min: -20, max: 20, step: 2, unit: '°' },
    { key: 'lensType', type: 'select', label: sc('🔍 透鏡', '🔍 Lens'), options: [{ v: 'convex', label: sc('凸透鏡', 'Convex') }, { v: 'concave', label: sc('凹透鏡', 'Concave') }] },
    { key: 'uo', label: sc('🕯️ 物距 u', '🕯️ Object distance u'), min: 0.5, max: 5, step: 0.25, unit: 'm' },
    { key: 'fl', label: sc('🎯 焦距 f', '🎯 Focal length f'), min: 1, max: 2.5, step: 0.25, unit: 'm' },
    { key: 'white', type: 'toggle', label: sc('⚪ 白光（關＝紅色激光）', '⚪ White light (off = red laser)') }
  ];
  const recs = [];
  const graphs = [
    { id: 'snell', mode: 'scatter', fit: true, tab: sc('sin i – sin r', 'sin i vs sin r'), y: sc('sin i', 'sin i'), x: sc('sin r', 'sin r'), fixed: [0, 1.05], xRange: [0, 1],
      series: [['pts', sc('記錄的數據', 'Recorded points'), C.red]], data: () => ({ pts: { pts: recs } }) }
  ];

  /* ================== 光線追蹤 ================== */
  const V2 = (x, y) => ({ x, y });
  const sub = (a, b) => V2(a.x - b.x, a.y - b.y), add = (a, b) => V2(a.x + b.x, a.y + b.y), mul = (a, s) => V2(a.x * s, a.y * s), dot = (a, b) => a.x * b.x + a.y * b.y;
  const norm = (a) => { const l = Math.hypot(a.x, a.y) || 1; return V2(a.x / l, a.y / l); };
  let scene2 = { mirrors: [], polys: [], lens: null, bounds: [-5.6, 5.6, -2.6, 2.6] };
  function polyEdges(pts, n) {
    let area = 0; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; area += a.x * b.y - b.x * a.y; }
    if (area < 0) pts = pts.slice().reverse();
    return { n, pts, edges: pts.map((a, i) => { const b = pts[(i + 1) % pts.length]; return { a, b, nrm: norm(V2(b.y - a.y, -(b.x - a.x))) }; }) };
  }
  function hitSeg(o, d, a, b) {
    const e = sub(b, a), den = d.x * e.y - d.y * e.x; if (Math.abs(den) < 1e-12) return null;
    const w = sub(a, o), t = (w.x * e.y - w.y * e.x) / den, s = (w.x * d.y - w.y * d.x) / den;
    return t > 1e-6 && s >= 0 && s <= 1 ? t : null;
  }
  function trace(o, d, I, color, out, depth = 0, nIn = 1, nOf = null) {
    if (depth > 40 || I < 0.04) return;
    let best = Infinity, hit = null;
    for (const m of scene2.mirrors) { const t = hitSeg(o, d, m.a, m.b); if (t && t < best) { best = t; hit = { kind: 'mirror', m }; } }
    for (const P of scene2.polys) for (const e of P.edges) { const t = hitSeg(o, d, e.a, e.b); if (t && t < best) { best = t; hit = { kind: 'edge', P, e }; } }
    if (scene2.lens) { const ln = scene2.lens, t = hitSeg(o, d, ln.a, ln.b); if (t && t < best) { best = t; hit = { kind: 'lens' }; } }
    if (!hit) { // 射出邊界
      const [x0, x1, y0, y1] = scene2.bounds; let t = 30;
      if (d.x > 0) t = Math.min(t, (x1 - o.x) / d.x); if (d.x < 0) t = Math.min(t, (x0 - o.x) / d.x);
      if (d.y > 0) t = Math.min(t, (y1 - o.y) / d.y); if (d.y < 0) t = Math.min(t, (y0 - o.y) / d.y);
      out.push({ a: o, b: add(o, mul(d, Math.max(0, t))), I, color }); return;
    }
    const q = add(o, mul(d, best));
    out.push({ a: o, b: q, I, color, hit: q });
    if (hit.kind === 'mirror') { const nm = hit.m.nrm, r = sub(d, mul(nm, 2 * dot(d, nm))); out.lastHit = { q, nm }; trace(q, norm(r), I * 0.95, color, out, depth + 1, nIn, nOf); return; }
    if (hit.kind === 'lens') {
      const ln = scene2.lens, h = q.y - ln.cy, sg = Math.sign(d.x) || 1, s = d.y / Math.abs(d.x), s2 = s - h / ln.f;
      trace(q, norm(V2(sg, s2)), I, color, out, depth + 1, nIn, nOf); return;
    }
    const { P, e } = hit, entering = dot(d, e.nrm) < 0;
    const n1 = entering ? 1 : (nOf ? nOf(P, color) : P.n), n2 = entering ? (nOf ? nOf(P, color) : P.n) : 1;
    const nm = entering ? e.nrm : mul(e.nrm, -1); // 指向入射光一邊
    const cosi = -dot(d, nm), eta = n1 / n2, k = 1 - eta * eta * (1 - cosi * cosi);
    out.events = out.events || []; out.events.push({ q, nm, n1, n2, cosi, tir: k < 0 });
    if (k < 0) { const r = sub(d, mul(nm, -2 * cosi)); trace(q, norm(r), I, color, out, depth + 1); return; }
    const cost = Math.sqrt(k), tdir = norm(add(mul(d, eta), mul(nm, eta * cosi - cost)));
    const R0 = ((n1 - n2) / (n1 + n2)) ** 2, c = n1 <= n2 ? cosi : cost, R = R0 + (1 - R0) * Math.pow(1 - c, 5);
    trace(q, tdir, I * (1 - R), color, out, depth + 1, nIn, nOf);
    if (I * R > 0.06) trace(q, norm(sub(d, mul(nm, -2 * cosi))), I * R, color, out, depth + 1, nIn, nOf);
  }

  /* ================== 教學 ================== */
  const lightStages = [
    { id: 'o-spec', who: 'chan', title: sc('光係電磁波', 'Light is an electromagnetic wave'),
      say: sc('光係一種電磁波，喺真空入面每秒行三億米，係宇宙最快嘅速度。電磁波家族仲有無線電波、微波、紅外線、紫外線、X 光同伽瑪射線，我哋眼睇得到嘅可見光只係好細嘅一段。',
        'Light is an electromagnetic wave. In a vacuum it travels 300 million metres per second, the fastest speed in the universe. The electromagnetic family also includes radio waves, microwaves, infra-red, ultraviolet, X-rays and gamma rays. The visible light our eyes can see is only a tiny slice.'),
      setup: { mode: 'spectrum' }, items: [65] },
    { id: 'o-em-q', who: 'chan', title: sc('邊個唔係電磁波？', 'Which is not electromagnetic?'),
      say: sc('考吓你。', 'Quick quiz.'), setup: { mode: 'spectrum' },
      quiz: { q: sc('以下邊個唔係電磁波？', 'Which of these is not an electromagnetic wave?'), opts: [sc('無線電波', 'Radio waves'), sc('X 光', 'X-rays'), sc('聲波', 'Sound waves')], ans: 2,
        why: sc('答案係：聲波！聲波要靠空氣粒子傳送，係縱波；電磁波係橫波，喺真空都傳到，所以太陽光可以穿過太空照到地球。', 'The answer: sound waves! Sound needs air particles to travel and is longitudinal; electromagnetic waves are transverse and cross a vacuum, which is how sunlight reaches us through space.') }, items: [65] },
    { id: 'o-refl', who: 'chan', title: sc('反射定律：估一估', 'Law of reflection: predict'),
      say: sc('激光筆射向一塊平面鏡。白色虛線叫法線，同鏡面成直角。光線同法線之間嘅角就係入射角。', 'A laser shines at a flat mirror. The white dashed line is the normal, at right angles to the mirror. The angle between the ray and the normal is the angle of incidence.'),
      setup: { mode: 'mirror', inc: 20 }, lock: ['inc', 'img', 'od'],
      quiz: { q: sc('入射角係 30°，反射角係幾多？', 'If the angle of incidence is 30°, what is the angle of reflection?'), opts: [sc('30°', '30°'), sc('60°', '60°'), sc('90°', '90°')], ans: 0,
        run: [['set', 'inc', 30]], watch: 1.5,
        why: sc('答案係：30°！反射角永遠等於入射角，而且入射光、反射光同法線喺同一個平面上。呢個就係反射定律。', 'The answer: 30°! The angle of reflection always equals the angle of incidence, and the incident ray, reflected ray and normal lie in the same plane. That is the law of reflection.') },
      chain: [sc('光射向鏡面', 'Light hits a mirror'), sc('入射角 = 反射角', 'Incidence = reflection'), sc('像波子撞牆彈返', 'Like a marble off a wall')], items: [66] },
    { id: 'o-try', who: 'ming', title: sc('自己試', 'Try it'),
      say: sc('拉吓入射角，睇吓反射角係咪一直都一樣。', 'Change the angle of incidence and check that the reflection angle always matches.'),
      task: sc('把入射角改成 50° 或以上', 'Set the angle of incidence to 50° or more'), setup: { mode: 'mirror', inc: 20 },
      goal: { type: 'param', test: () => p.inc >= 50 }, demo: [['openTools'], ['set', 'inc', 55]], settle: 2.5, items: [66] },
    { id: 'o-image', who: 'chan', title: sc('平面鏡的像：估一估', 'Plane mirror image: predict'),
      say: sc('蠟燭放喺鏡前面 1.5 米。眼睛睇到嘅光，好似由鏡後面一點射出嚟，嗰度就係蠟燭嘅像。', 'A candle stands 1.5 m in front of the mirror. The light reaching the eye seems to come from a point behind the mirror: that is the candle’s image.'),
      setup: { mode: 'mirror', img: true, od: 1.5 }, lock: ['inc', 'img', 'od'],
      quiz: { q: sc('你企喺鏡前 2 米，鏡入面嘅你喺鏡後幾遠？', 'If you stand 2 m in front of a mirror, how far behind the mirror is your image?'), opts: [sc('1 米', '1 m'), sc('2 米', '2 m'), sc('4 米', '4 m')], ans: 1,
        run: [['set', 'od', 2]], watch: 1.5,
        why: sc('答案係：2 米！平面鏡嘅像同物件一樣大，像距等於物距，係正立嘅虛像，而且左右倒轉。虛像嘅意思係光線冇真正去到嗰度，只係「好似」由嗰度嚟。',
          'The answer: 2 m! A plane mirror image is the same size as the object, as far behind the mirror as the object is in front, upright, virtual and left–right reversed. Virtual means the light doesn’t really go there; it only seems to come from there.') },
      chain: [sc('光線反射入眼', 'Reflected light enters the eye'), sc('大腦以為光走直線', 'The brain assumes straight lines'), sc('見到鏡後的虛像', 'We see a virtual image behind')], items: [67] },
    { id: 'o-sum', who: 'chan', title: sc('總結', 'Summary'),
      say: sc('光係電磁波，好快好快。反射時入射角等於反射角；平面鏡嘅像同物件一樣大、一樣遠、正立、左右倒轉。', 'Light is a very fast electromagnetic wave. In reflection, incidence equals reflection; a plane mirror image is the same size, the same distance away, upright and left–right reversed.'),
      setup: { mode: 'mirror', img: true, od: 1.5 }, finish: true }
  ];
  const refractStages = [
    { id: 'rf-intro', who: 'chan', title: sc('光會轉彎', 'Light bends'),
      say: sc('光由空氣射入玻璃，速度會慢咗，方向就會轉彎，叫折射。好似一架車由馬路斜斜咁駛入沙灘，一邊車轆先慢落嚟，架車就轉彎。', 'When light goes from air into glass it slows down and changes direction: refraction. It is like a car driving at an angle from a road onto sand: one wheel slows first, so the car turns.'),
      setup: { mode: 'block', inc: 40, n: 1.5 }, graph: 'snell', items: [68] },
    { id: 'rf-q', who: 'chan', title: sc('估一估', 'Predict'),
      say: sc('光斜斜射入玻璃磚。', 'Light enters the glass block at an angle.'), setup: { mode: 'block', inc: 0, n: 1.5 }, lock: ['inc', 'n'],
      quiz: { q: sc('光由空氣射入玻璃，會點屈？', 'How does light bend going from air into glass?'), opts: [sc('屈向法線', 'Towards the normal'), sc('屈離法線', 'Away from the normal'), sc('唔會屈', 'It doesn’t bend')], ans: 0,
        run: [['set', 'inc', 45]], watch: 1.5,
        why: sc('答案係：屈向法線！光入到密啲嘅物質會慢落嚟，所以屈向法線，折射角細過入射角。由玻璃出返去空氣，就會屈離法線。', 'The answer: towards the normal! Light slows down in a denser material, so it bends towards the normal and the angle of refraction is smaller. Coming back out into air, it bends away from the normal.') },
      chain: [sc('光進入玻璃', 'Light enters glass'), sc('速度變慢', 'It slows down'), sc('屈向法線', 'Bends towards the normal')], items: [68] },
    { id: 'rf-graph', who: 'ming', title: sc('用圖求折射率', 'Find n from a graph'),
      say: sc('我哋喺三個唔同角度記錄 sin i 同 sin r，畫成圖。所有點會排成一條穿過原點嘅直線，條線嘅斜率就係折射率 n。', 'We record sin i and sin r at three different angles and plot them. The points lie on a straight line through the origin, and its slope is the refractive index n.'),
      task: sc('揀三個不同入射角，每次按「記錄」', "Pick three different angles and tap 'Record' each time"), setup: { mode: 'block', inc: 20, n: 1.5 }, graph: 'snell', lock: ['n'],
      goal: { type: 'record', test: (d) => d.count >= 3 }, demo: [['openTools'], ['set', 'inc', 20], ['record'], ['set', 'inc', 40], ['record'], ['set', 'inc', 60], ['record']], settle: 2.5,
      adv: sc('斯涅耳定律：sin i ÷ sin r = n（常數）。', "Snell's law: sin i ÷ sin r = n, a constant."), items: [68, 69] },
    { id: 'rf-depth', who: 'chan', title: sc('實深與視深：估一估', 'Real and apparent depth: predict'),
      say: sc('水池底有一個銀仔。光由銀仔射出水面時會屈離法線，眼睛以為光走直線。', 'A coin lies at the bottom of a pool. Light from the coin bends away from the normal as it leaves the water, but the eye assumes light travels straight.'),
      setup: { mode: 'depth', n: 1.33 }, lock: ['n'], camera: { pos: [0, 2.8, 8], target: [0, 2.0, 0] },
      quiz: { q: sc('從上面望落水池，池底睇落會點？', 'Looking down into a pool, how deep does the bottom look?'), opts: [sc('比實際淺', 'Shallower than it really is'), sc('比實際深', 'Deeper than it really is'), sc('一樣', 'The same')], ans: 0,
        why: sc('答案係：比實際淺！虛線係眼睛「以為」嘅光路，佢指向一個高啲嘅位置。所以喺泳池要小心，水其實深過睇落去；飲管放落水都好似斷咗。', 'The answer: shallower! The dashed line is the path the eye assumes, pointing to a higher spot. So pools are deeper than they look, and a straw in water looks bent.') },
      adv: sc('垂直往下望時，視深 ≈ 實深 ÷ n。', 'Looking straight down, apparent depth ≈ real depth ÷ n.'), items: [70] },
    { id: 'rf-tir', who: 'chan', title: sc('全內反射：估一估', 'Total internal reflection: predict'),
      say: sc('光由玻璃射出空氣，會屈離法線。入射角越大，折射光就越貼住表面。入射角大到某個度數，叫臨界角。', 'Going from glass into air, light bends away from the normal. The bigger the angle, the closer the refracted ray hugs the surface. At a certain angle, called the critical angle, something special happens.'),
      setup: { mode: 'semi', inc: 20, mat: 'glass' }, lock: ['inc', 'mat'],
      quiz: { q: sc('入射角大過臨界角，會點？', 'What happens when the angle is bigger than the critical angle?'), opts: [sc('全部光反射返入玻璃', 'All the light reflects back into the glass'), sc('全部光射出去', 'All the light escapes'), sc('光消失咗', 'The light disappears')], ans: 0,
        run: [['set', 'inc', 35], ['wait', 1], ['set', 'inc', 42], ['wait', 1], ['set', 'inc', 50]], watch: 1.5,
        why: sc('答案係：全部反射返入玻璃！叫全內反射。要有兩個條件：光由密嘅物質射去疏嘅物質，而且入射角大過臨界角。玻璃嘅臨界角大約 42°。',
          'The answer: all of it reflects back into the glass! This is total internal reflection. It needs two conditions: light going from a denser to a less dense material, and an angle bigger than the critical angle, about 42° for glass.') },
      chain: [sc('由密去疏', 'Dense to less dense'), sc('入射角 > 臨界角', 'Angle > critical angle'), sc('全內反射', 'Total internal reflection')],
      adv: sc('臨界角 c：sin c = 1 ÷ n。', 'Critical angle c: sin c = 1 ÷ n.'), items: [71] },
    { id: 'rf-fibre', who: 'ming', title: sc('光纖', 'Optical fibres'),
      say: sc('光纖就係利用全內反射，令光喺彎彎曲曲嘅玻璃絲入面一直反射，傳去好遠都唔會漏走。上網、醫生嘅內窺鏡都用光纖！試吓改變射入嘅角度。',
        'Optical fibres use total internal reflection to bounce light along a bendy glass thread without leaking out, even over long distances. The internet and doctors’ endoscopes use them! Try changing the entry angle.'),
      task: sc('改變光射入光纖的角度', 'Change the angle light enters the fibre'), setup: { mode: 'fibre', fin: 8 },
      goal: { type: 'param', test: () => p.fin !== 8 }, demo: [['openTools'], ['set', 'fin', -14]], settle: 2.5, items: [71] },
    { id: 'rf-sum', who: 'chan', title: sc('總結', 'Summary'),
      say: sc('光入密啲嘅物質會屈向法線，sin i 除 sin r 等於折射率；水池睇落淺過實際；入射角大過臨界角就會全內反射，光纖就係咁傳光。',
        'Light bends towards the normal entering a denser material, and sin i divided by sin r equals the refractive index. Pools look shallower than they are, and beyond the critical angle we get total internal reflection, which is how fibres carry light.'),
      finish: true }
  ];
  const lensStages = [
    { id: 'l-intro', who: 'chan', title: sc('凸透鏡', 'The convex lens'),
      say: sc('凸透鏡中間厚、邊薄，會將平行光聚埋喺一點，叫焦點 F。透鏡中心去焦點嘅距離叫焦距。', 'A convex lens is thick in the middle and thin at the edges. It brings parallel light together at a point called the focus, F. The distance from the centre to F is the focal length.'),
      setup: { mode: 'lens', lensType: 'convex', uo: 4, fl: 1.5 }, items: [72] },
    { id: 'l-rules', who: 'chan', title: sc('三條作圖規則', 'Three ray rules'),
      say: sc('畫光路圖有三條規則：第一，平行於主軸嘅光，折射後穿過焦點；第二，穿過透鏡中心嘅光，方向唔變；第三，穿過焦點嘅光，折射後同主軸平行。三條光線相交嘅位置，就係像。',
        'Three rules for ray diagrams. One: a ray parallel to the axis passes through the focus after the lens. Two: a ray through the centre goes straight on. Three: a ray through the focus comes out parallel. Where the rays meet is the image.'),
      setup: { mode: 'lens', lensType: 'convex', uo: 4, fl: 1.5 },
      chain: [sc('平行光 → 過焦點', 'Parallel → through F'), sc('過中心 → 直走', 'Through the centre → straight'), sc('過焦點 → 平行', 'Through F → parallel')], items: [72] },
    { id: 'l-far', who: 'chan', title: sc('物件好遠：估一估', 'Far object: predict'),
      say: sc('物件放喺好遠，超過兩倍焦距。', 'The object is far away, beyond twice the focal length.'), setup: { mode: 'lens', lensType: 'convex', uo: 2.5, fl: 1.5 }, lock: ['uo', 'fl', 'lensType'],
      quiz: { q: sc('個像會係點？', 'What is the image like?'), opts: [sc('倒立、縮細嘅實像', 'Inverted, smaller and real'), sc('正立、放大嘅虛像', 'Upright, bigger and virtual'), sc('冇像', 'No image')], ans: 0,
        run: [['set', 'uo', 4.5]], watch: 1.5,
        why: sc('答案係：倒立、縮細嘅實像！實像係光線真正聚埋嘅位置，可以投影喺屏幕上。相機同眼睛就係咁成像。', 'The answer: inverted, smaller and real! A real image is where light really meets, so it can be shown on a screen. Cameras and eyes form images this way.') }, items: [74] },
    { id: 'l-mag', who: 'ming', title: sc('放大鏡：估一估', 'Magnifying glass: predict'),
      say: sc('如果物件好近，喺焦點以內呢？', 'What if the object is very close, inside the focus?'), setup: { mode: 'lens', lensType: 'convex', uo: 2.5, fl: 1.5 }, lock: ['uo', 'fl', 'lensType'],
      quiz: { q: sc('個像會係點？', 'What is the image like?'), opts: [sc('正立、放大嘅虛像', 'Upright, bigger and virtual'), sc('倒立、縮細嘅實像', 'Inverted, smaller and real'), sc('冇像', 'No image')], ans: 0,
        run: [['set', 'uo', 1]], watch: 1.5,
        why: sc('答案係：正立、放大嘅虛像！折射後嘅光線散開，眼睛跟住虛線向後睇，見到一個放大咗嘅像。放大鏡就係咁用。', 'The answer: upright, bigger and virtual! The rays spread apart after the lens, and the eye traces the dashed lines back to a magnified image. That is how a magnifying glass works.') }, items: [74] },
    { id: 'l-concave', who: 'chan', title: sc('凹透鏡', 'The concave lens'),
      say: sc('凹透鏡中間薄、邊厚，會將光散開。無論物件放喺邊，佢都只會形成正立、縮細嘅虛像。近視眼鏡就係用凹透鏡。試吓轉做凹透鏡！',
        'A concave lens is thin in the middle and thick at the edges, so it spreads light out. Wherever the object is, it always makes an upright, smaller, virtual image. Glasses for short sight use concave lenses. Switch to a concave lens!'),
      task: sc('把透鏡換成凹透鏡', 'Change to a concave lens'), setup: { mode: 'lens', lensType: 'convex', uo: 3, fl: 1.5 },
      goal: { type: 'param', test: () => p.lensType === 'concave' }, demo: [['openTools'], ['set', 'lensType', 'concave']], settle: 2.5, items: [73] },
    { id: 'l-wave', who: 'chan', title: sc('光的波動性', 'The wave nature of light'),
      say: sc('光好似水波咁會繞射同干涉。用激光照兩條好窄嘅縫，屏幕上會出現光暗相間嘅條紋。', 'Light diffracts and interferes just like water waves. Shine a laser through two very narrow slits and you get bright and dark stripes on a screen.'),
      quiz: { q: sc('光可以干涉同繞射，證明咗光係？', 'Light can interfere and diffract. What does that show?'), opts: [sc('一種波', 'Light is a wave'), sc('一種聲音', 'Light is a sound'), sc('一種固體', 'Light is a solid')], ans: 0,
        why: sc('答案係：光係一種波！只有波先會互相疊加、相長相消，所以光暗條紋證明咗光嘅波動性。', 'The answer: light is a wave! Only waves add up and cancel like that, so the bright and dark stripes show that light behaves as a wave.') }, items: [75] },
    { id: 'l-sum', who: 'chan', title: sc('總結', 'Summary'),
      say: sc('凸透鏡聚光：物件遠就成倒立實像，物件喺焦點以內就成放大虛像。凹透鏡散光，永遠成正立縮細虛像。光仲係一種波！',
        'Convex lenses converge light: far objects give real inverted images, objects inside F give magnified virtual images. Concave lenses diverge light and always give upright, smaller virtual images. And light is a wave!'),
      setup: { mode: 'lens', lensType: 'convex', uo: 3, fl: 1.5 }, finish: true }
  ];
  const rainbowStages = [
    { id: 'rb-intro', who: 'chan', title: sc('白光的秘密', 'The secret of white light'),
      say: sc('白光其實係由好多種顏色混合而成。我哋用一個三稜鏡去拆開佢。', 'White light is really a mixture of many colours. We’ll use a prism to split it up.'),
      setup: { mode: 'prism', white: false }, items: ['L1'] },
    { id: 'rb-q', who: 'chan', title: sc('估一估', 'Predict'),
      say: sc('而家用一束白光照入三稜鏡。', 'Now we shine a beam of white light into the prism.'), setup: { mode: 'prism', white: false }, lock: ['white'],
      quiz: { q: sc('白光穿過三稜鏡之後會點？', 'What happens to white light after passing through the prism?'), opts: [sc('分開成彩虹七色', 'It splits into the colours of the rainbow'), sc('變成黑色', 'It turns black'), sc('冇變', 'Nothing changes')], ans: 0,
        run: [['set', 'white', true]], watch: 1.5,
        why: sc('答案係：分開成七色！呢個現象叫色散。紅、橙、黃、綠、藍、靛、紫一齊出現。', 'The answer: it splits into colours! This is called dispersion: red, orange, yellow, green, blue, indigo and violet appear.') }, items: ['L1'] },
    { id: 'rb-why', who: 'ming', title: sc('點解會分開？', 'Why do they separate?'),
      say: sc('唔同顏色嘅光喺玻璃入面嘅速度有少少唔同，所以屈嘅角度都唔同。', 'Different colours travel at slightly different speeds in glass, so they bend by different amounts.'), setup: { mode: 'prism', white: true },
      quiz: { q: sc('邊種顏色屈得最多？', 'Which colour bends the most?'), opts: [sc('紅色', 'Red'), sc('紫色', 'Violet'), sc('全部一樣', 'They all bend the same')], ans: 1,
        why: sc('答案係：紫色！紫光喺玻璃入面最慢，折射率最大，所以屈得最多；紅光屈得最少。', 'The answer: violet! Violet light is slowest in glass, with the biggest refractive index, so it bends most; red bends least.') },
      chain: [sc('不同顏色速度不同', 'Colours travel at different speeds'), sc('折射角不同', 'They bend by different amounts'), sc('分開成光譜', 'They spread into a spectrum')], items: ['L1'] },
    { id: 'rb-rain', who: 'chan', title: sc('彩虹', 'Rainbows'),
      say: sc('落完雨，空氣中有好多細水滴，每一滴都好似一個細細嘅三稜鏡。太陽喺你背後照過嚟，光入水滴折射、反射、再折射，就分開成彩虹！',
        'After rain, the air is full of tiny water drops, and each acts like a little prism. With the Sun behind you, light refracts into a drop, reflects inside and refracts out again, splitting into a rainbow!'),
      setup: { mode: 'prism', white: true }, chain: [sc('陽光入水滴', 'Sunlight enters raindrops'), sc('折射＋反射＋折射', 'Refract, reflect, refract'), sc('色散成彩虹', 'Dispersion makes a rainbow')], items: ['L1'] },
    { id: 'rb-sum', who: 'chan', title: sc('總結', 'Summary'),
      say: sc('白光係七色光混合而成；唔同顏色屈嘅角度唔同，所以會色散。彩虹就係陽光被水滴色散嘅結果。', 'White light is a mix of colours; each colour bends by a different amount, so they disperse. A rainbow is sunlight dispersed by raindrops.'),
      setup: { mode: 'prism', white: true }, finish: true }
  ];

  /* ================== 3D 場景 ================== */
  const G = {}; ['spectrum', 'mirror', 'block', 'depth', 'semi', 'fibre', 'lens', 'prism'].forEach((k) => { G[k] = new THREE.Group(); root.add(G[k]); });
  const V = {};
  const W3 = (u, v, h = 0.06) => (p.mode === 'depth' ? [u, TY + v, 0] : [u, TY + h, v]);
  function slab(parent, pts2, color, opacity, h = 0.3) { // 平放的多邊形玻璃
    const sh = new THREE.Shape(pts2.map((q) => new THREE.Vector2(q.x, -q.y)));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false }); geo.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(geo, glass(color, opacity)); m.position.y = TY; parent.add(m); return m;
  }
  function mount() {
    // 枱
    const tbl = new THREE.Group(); root.add(tbl);
    mesh(new THREE.BoxGeometry(11.6, 0.1, 5.6), std(0x1e293b, 0.8), 0, TY - 0.05, 0, tbl);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) mesh(new THREE.BoxGeometry(0.12, TY - 0.1, 0.12), std(0x64748b, 0.5, 0.5), sx * 5.6, (TY - 0.1) / 2, sz * 2.6, tbl);
    V.rays = kit.beamPool(root, 0.035); V.dash = kit.beamPool(root, 0.02);
    V.tags = [0, 1, 2].map(() => tag('readout', root, 0, 0, 0));
    // 光譜板
    const bands = [['radio', sc('無線電波', 'Radio'), '#94a3b8'], ['micro', sc('微波', 'Microwave'), '#a8a29e'], ['ir', sc('紅外線', 'Infra-red'), '#b91c1c'], ['vis', sc('可見光', 'Visible'), 'rainbow'], ['uv', sc('紫外線', 'Ultraviolet'), '#7c3aed'], ['x', sc('X 光', 'X-rays'), '#475569'], ['g', sc('伽瑪射線', 'Gamma'), '#111827']];
    const tex = canvasTex(1400, 300, (g, w, h) => {
      g.fillStyle = '#f8fafc'; g.fillRect(0, 0, w, h);
      const bw = w / bands.length;
      bands.forEach(([, , col], i) => {
        if (col === 'rainbow') { const gr = g.createLinearGradient(i * bw, 0, (i + 1) * bw, 0); ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#4f46e5', '#a855f7'].forEach((c, k) => gr.addColorStop(k / 6, c)); g.fillStyle = gr; }
        else g.fillStyle = col;
        g.globalAlpha = col === 'rainbow' ? 1 : 0.35; g.fillRect(i * bw + 4, 150, bw - 8, 120); g.globalAlpha = 1;
      });
      g.strokeStyle = '#1e293b'; g.lineWidth = 5; g.beginPath();
      for (let x = 0; x <= w; x += 2) { const k = 0.004 + (x / w) ** 2.2 * 0.6; g.lineTo(x, 75 + 45 * Math.sin(x * k * 6)); } g.stroke();
      g.fillStyle = '#334155'; g.font = 'bold 30px sans-serif'; g.fillText('λ 長 long', 20, 30); g.textAlign = 'right'; g.fillText('λ 短 short', w - 20, 30);
    });
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(9, 2), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }));
    panel.position.set(0, TY + 1.3, -0.5); G.spectrum.add(panel);
    mesh(new THREE.BoxGeometry(9.2, 2.2, 0.08), std(0x334155), 0, TY + 1.3, -0.56, G.spectrum);
    bands.forEach(([, nm], i) => { const t = tag('readout light', G.spectrum, -4.5 + (i + 0.5) * (9 / 7), TY + 0.15, -0.4); t.el.dataset.k = i; V['band' + i] = { t, nm }; });
    V.specTag = tag('readout', G.spectrum, 0, TY + 2.6, -0.5);
    // 平面鏡
    V.mirror = mesh(new THREE.BoxGeometry(0.08, 0.6, 3.2), std(0xe2e8f0, 0.05, 1), 2, TY + 0.3, 0, G.mirror);
    mesh(new THREE.BoxGeometry(0.06, 0.6, 3.2), std(0x334155), 2.07, TY + 0.3, 0, G.mirror);
    V.laser = new THREE.Group(); root.add(V.laser);
    mesh(new THREE.BoxGeometry(0.6, 0.18, 0.18), std(0x111827, 0.4, 0.5), -0.3, 0, 0, V.laser);
    V.candle = new THREE.Group(); G.mirror.add(V.candle);
    mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 16), std(0xfef3c7, 0.6), 0, TY + 0.25, 0, V.candle);
    mesh(new THREE.ConeGeometry(0.06, 0.16, 12), new THREE.MeshBasicMaterial({ color: 0xf59e0b }), 0, TY + 0.6, 0, V.candle);
    V.ghost = V.candle.clone(); V.ghost.traverse((o) => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.35; } }); G.mirror.add(V.ghost);
    V.eye = tag('readout light', G.mirror, 0, TY + 0.3, 0); V.eye.el.textContent = '👁️';
    // 玻璃磚
    V.blockPts = [V2(-1.5, -1), V2(1.5, -1), V2(1.5, 1), V2(-1.5, 1)];
    slab(G.block, V.blockPts, 0xbfdbfe, 0.4);
    // 水缸（實深視深，豎直平面）
    const dg = G.depth;
    mesh(new THREE.BoxGeometry(4.2, 2.6, 1.2), glass(0xe0f2fe, 0.15), 0, TY + 1.3, 0, dg, false);
    V.depthWater = mesh(new THREE.BoxGeometry(4.0, 2.4, 1.0), std(0x60a5fa, 0.1, 0, { transparent: true, opacity: 0.35, depthWrite: false }), 0, TY + 1.2, 0, dg, false);
    V.coin = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 20), std(0xfacc15, 0.3, 0.9), 0.8, TY + 0.05, 0, dg);
    V.coinG = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 20), new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.4 }), 0.8, TY + 0.6, 0, dg, false);
    V.eyeD = tag('readout light', dg, -1.6, TY + 4.6, 0); V.eyeD.el.textContent = '👁️';
    // 半圓玻璃
    const semi = []; for (let k = 0; k <= 24; k++) { const a = Math.PI / 2 + (k / 24) * Math.PI; semi.push(V2(1.6 * Math.cos(a), 1.6 * Math.sin(a))); }
    V.semiPts = semi; V.semiMesh = slab(G.semi, semi, 0xbfdbfe, 0.4);
    // 光纖
    const path = []; for (let k = 0; k <= 40; k++) { const t = k / 40, x = -4.6 + 9.2 * t; path.push(V2(x, 0.9 * Math.sin(t * Math.PI * 1.2) - 0.3)); }
    const up = [], dn = []; path.forEach((q, i) => { const r = path[Math.min(i + 1, path.length - 1)], s = path[Math.max(i - 1, 0)], tg = norm(sub(r, s)), nm = V2(-tg.y, tg.x); up.push(add(q, mul(nm, 0.28))); dn.push(sub(q, mul(nm, 0.28))); });
    V.fibrePts = [...up, ...dn.reverse()]; V.fibrePath = path;
    slab(G.fibre, V.fibrePts, 0x99f6e4, 0.45, 0.2);
    // 透鏡
    V.lensCv = mesh(new THREE.SphereGeometry(1, 32, 16), glass(0xbfdbfe, 0.45), 0, TY + 0.25, 0, G.lens, false); V.lensCv.scale.set(0.16, 0.25, 1.7);
    V.lensCc = new THREE.Group(); G.lens.add(V.lensCc);
    for (const s of [-1, 1]) { const m = mesh(new THREE.BoxGeometry(0.34, 0.5, 0.25), glass(0xbfdbfe, 0.45), 0, TY + 0.25, s * 1.55, V.lensCc, false); void m; }
    mesh(new THREE.BoxGeometry(0.1, 0.5, 2.9), glass(0xbfdbfe, 0.45), 0, TY + 0.25, 0, V.lensCc, false);
    V.axis = kit.beam(G.lens, new THREE.MeshBasicMaterial({ color: 0x64748b }), 0.015); V.axis.set(-5.5, TY + 0.03, 0, 5.5, TY + 0.03, 0);
    V.F = [0, 1].map(() => { const m = mesh(new THREE.SphereGeometry(0.07, 12, 8), new THREE.MeshBasicMaterial({ color: 0xfacc15 }), 0, TY + 0.05, 0, G.lens, false); m.userData.t = tag('readout light', m, 0, 0.25, 0); return m; });
    V.objArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(), 0.8, 0xdc2626, 0.22, 0.16); G.lens.add(V.objArrow);
    V.imgArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(), 0.8, 0x2563eb, 0.22, 0.16); G.lens.add(V.imgArrow);
    // 三稜鏡
    const tri = [0, 1, 2].map((k) => { const a = Math.PI / 2 + (k * 2 * Math.PI) / 3; return V2(1.3 * Math.cos(a), 1.3 * Math.sin(a) + 0.2); });
    V.triPts = tri; slab(G.prism, tri, 0xe0f2fe, 0.4, 0.5);
    V.screen = mesh(new THREE.BoxGeometry(0.1, 0.8, 3.6), std(0xffffff, 0.9), 5.0, TY + 0.4, 0, G.prism);
  }

  /* ================== 每次參數改變就重新追蹤光線 ================== */
  let segs = [], dashes = [], readouts = [];
  function build() {
    segs = []; dashes = []; readouts = [];
    const out = []; let n;
    scene2 = { mirrors: [], polys: [], lens: null, bounds: [-5.6, 5.6, -2.6, 2.6] };
    const ray = (o, d, color = 0xff2d2d, nOf) => { const o2 = []; trace(o, norm(d), 1, color, o2, 0, 1, nOf); o2.forEach((s) => segs.push(s)); return o2; };
    const normalLine = (q, nm, len = 1.2) => { for (let k = -len; k < len; k += 0.16) dashes.push({ a: add(q, mul(nm, k)), b: add(q, mul(nm, k + 0.08)) }); };
    const i = p.inc * D2R;
    if (p.mode === 'mirror') {
      const M = { a: V2(2, -1.6), b: V2(2, 1.6), nrm: V2(-1, 0) }; scene2.mirrors.push(M);
      if (!p.img) {
        const hit = V2(2, 0), src = V2(2 - 3.4 * Math.cos(i), -3.4 * Math.sin(i));
        ray(src, sub(hit, src)); normalLine(hit, V2(1, 0), 1.6);
        V.laserAt = { src, dir: sub(hit, src) };
        readouts = [{ at: V2(0.6, -1.9), html: L(sc('入射角', 'incidence')) + ` i = ${p.inc}°` }, { at: V2(0.6, 1.9), html: L(sc('反射角', 'reflection')) + ` r = ${p.inc}°` }];
      } else {
        const O = V2(2 - p.od, 0.9), I = V2(2 + p.od, 0.9);
        for (const E of [V2(-2.4, -1.8), V2(-1.4, -2.3)]) {
          const t = (2 - I.x) / (E.x - I.x), Mq = V2(2, I.y + (E.y - I.y) * t);
          segs.push({ a: O, b: Mq, I: 1, color: 0xff2d2d }, { a: Mq, b: E, I: 1, color: 0xff2d2d });
          for (let k = 0; k < 1; k += 0.08) dashes.push({ a: add(Mq, mul(sub(I, Mq), k)), b: add(Mq, mul(sub(I, Mq), k + 0.04)) });
        }
        V.laserAt = null;
        readouts = [{ at: V2(2 - p.od / 2, 1.7), html: L(sc('物距', 'object distance')) + ` ${p.od} m` }, { at: V2(2 + p.od / 2, 1.7), html: L(sc('像距', 'image distance')) + ` ${p.od} m` }];
      }
    } else if (p.mode === 'block') {
      scene2.polys.push(polyEdges(V.blockPts, p.n));
      const hit = V2(-1.5, 0), src = add(hit, mul(V2(-Math.cos(i), -Math.sin(i)), 3.4));
      const o = ray(src, sub(hit, src)); normalLine(hit, V2(1, 0), 1.2);
      const r = Math.asin(Math.sin(i) / p.n); S.sinI = Math.sin(i); S.sinR = Math.sin(r);
      V.laserAt = { src, dir: sub(hit, src) };
      readouts = [{ at: V2(-3.4, -1.9), html: `i = ${p.inc}°<small>sin i = ${f(Math.sin(i), 2)}</small>` }, { at: V2(0, 1.6), html: `r = ${f(r / D2R, 1)}°<small>sin r = ${f(Math.sin(r), 2)}</small>` }, { at: V2(0, -1.6), html: `n = sin i ÷ sin r = ${f(p.n, 2)}` }];
      void o;
    } else if (p.mode === 'depth') {
      n = p.n; const C0 = V2(0.8, 0.05), Eye = V2(-1.6, 4.6), surf = 2.4;
      let lo = -1.95, hi = 0.8, xs = 0;
      for (let k = 0; k < 60; k++) { // 二分法找水面上的折射點
        xs = (lo + hi) / 2; const dw = norm(sub(V2(xs, surf), C0)), sinw = Math.abs(dw.x), sina = clamp(n * sinw, -1, 1);
        const da = V2(Math.sign(dw.x) * sina, Math.sqrt(1 - sina * sina)), tE = (Eye.y - surf) / da.y, xe = xs + da.x * tE;
        if (xe > Eye.x) hi = xs; else lo = xs;
      }
      const Q = V2(xs, surf);
      segs.push({ a: C0, b: Q, I: 1, color: 0xff2d2d }, { a: Q, b: Eye, I: 1, color: 0xff2d2d });
      const back = norm(sub(Q, Eye)), tA = (C0.x - Q.x) / back.x, A = add(Q, mul(back, tA));
      for (let k = 0; k < 1; k += 0.08) dashes.push({ a: add(Q, mul(sub(A, Q), k)), b: add(Q, mul(sub(A, Q), k + 0.04)) });
      S.app = { real: surf - C0.y, app: surf - A.y, y: A.y };
      normalLine(Q, V2(0, 1), 0.8);
      readouts = [{ at: V2(2.6, 1.2), html: L(sc('實深', 'real depth')) + ` ${f(S.app.real, 2)} m<small>${L(sc('視深', 'apparent depth'))} ${f(S.app.app, 2)} m</small>` }];
    } else if (p.mode === 'semi') {
      n = MATS[p.mat]; scene2.polys.push(polyEdges(V.semiPts, n));
      const src = V2(-3.2 * Math.cos(i), -3.2 * Math.sin(i));
      ray(src, sub(V2(0, 0), src)); normalLine(V2(0, 0), V2(1, 0), 1.6);
      V.laserAt = { src, dir: sub(V2(0, 0), src) };
      const cA = Math.asin(1 / n) / D2R, tir = p.inc > cA;
      readouts = [{ at: V2(-1.2, -2.1), html: `i = ${p.inc}°` }, { at: V2(1.9, -2.1), html: L(sc('臨界角', 'critical angle')) + ` c = ${f(cA, 1)}°` + (tir ? `<small>${L(sc('全內反射！', 'Total internal reflection!'))}</small>` : '') }];
      S.tir = tir;
    } else if (p.mode === 'fibre') {
      scene2.polys.push(polyEdges(V.fibrePts, 1.5));
      const st = V.fibrePath[0], a = p.fin * D2R, src = add(st, V2(-0.9, -0.9 * Math.tan(a)));
      ray(src, V2(Math.cos(a), Math.sin(a)));
      V.laserAt = { src, dir: V2(Math.cos(a), Math.sin(a)) };
      readouts = [{ at: V2(0, 2.0), html: L(sc('光不斷全內反射，沿光纖前進', 'Light keeps reflecting along the fibre')) }];
    } else if (p.mode === 'lens') {
      const fl = p.lensType === 'convex' ? p.fl : -p.fl, h = 0.8, u0 = p.uo, T = V2(-u0, h);
      const vI = 1 / (1 / fl - 1 / u0), hI = -h * vI / u0, real = vI > 0;
      const push = (a, b) => segs.push({ a, b, I: 1, color: 0xff2d2d }), dashTo = (a, b) => { for (let k = 0; k < 1; k += 0.06) dashes.push({ a: add(a, mul(sub(b, a), k)), b: add(a, mul(sub(b, a), k + 0.03)) }); };
      const end = (q, d) => add(q, mul(norm(d), 12));
      // 光線 1：平行 → 經焦點
      const P1 = V2(0, h), d1 = sub(V2(fl, 0), P1); push(T, P1); push(P1, end(P1, fl > 0 ? d1 : mul(d1, -1)));
      // 光線 2：經中心
      push(T, end(T, sub(V2(0, 0), T)));
      // 光線 3：經焦點 → 平行
      const v3 = fl > 0 ? -h * fl / (u0 - fl) : h * (-fl) / (-fl + u0);
      if (Number.isFinite(v3) && Math.abs(v3) < 2.5) { const P3 = V2(0, v3); push(T, P3); push(P3, V2(5.6, v3)); if (!real) dashTo(P3, V2(vI, v3)); }
      if (!real) { dashTo(P1, V2(vI, hI)); }
      S.img = { vI, hI, real, mag: Math.abs(hI / h) };
      readouts = Number.isFinite(vI) && Math.abs(vI) < 40 ? [{ at: V2(clamp(vI, -5, 5), clamp(hI, -2, 2) + (hI > 0 ? 0.45 : -0.45)), html: `${L(real ? sc('實像', 'real') : sc('虛像', 'virtual'))} · ${L(hI * h < 0 ? sc('倒立', 'inverted') : sc('正立', 'upright'))}<small>${L(S.img.mag > 1.02 ? sc('放大', 'magnified') : S.img.mag < 0.98 ? sc('縮細', 'diminished') : sc('同樣大小', 'same size'))} · v = ${f(Math.abs(vI), 2)} m</small>` }]
        : [{ at: V2(2, 1.8), html: L(sc('像在無限遠', 'Image at infinity')) }];
      V.laserAt = null;
    } else if (p.mode === 'prism') {
      const COL = [[0xef4444, 1.50], [0xf97316, 1.51], [0xfacc15, 1.52], [0x22c55e, 1.53], [0x3b82f6, 1.545], [0x4f46e5, 1.555], [0xa855f7, 1.57]];
      const P = polyEdges(V.triPts, 1.52); scene2.polys.push(P);
      scene2.mirrors.push({ a: V2(4.95, -1.8), b: V2(4.95, 1.8), nrm: V2(-1, 0), screen: true });
      const src = V2(-4.8, -1.6), d = norm(sub(V2(-0.55, 0.05), src));
      const list = p.white ? COL : [COL[0]];
      list.forEach(([c, nn], k) => {
        const o = []; trace(src, d, 1, c, o, 0, 1, () => nn);
        o.forEach((s, j) => { if (j === 0 && p.white) s.color = 0xffffff; if (s.b.x > 4.9) s.b.x = 4.95; });
        segs.push(...o.filter((s) => s.a.x < 4.94)); void k;
      });
      V.laserAt = { src, dir: d };
      readouts = [{ at: V2(4.6, 2.1), html: L(p.white ? sc('紅 → 紫：屈得越來越多', 'Red → violet: bending more and more') : sc('紅色激光：只得一種顏色', 'Red laser: just one colour')) }];
    } else { V.laserAt = null; }
    draw();
  }
  function draw() {
    V.rays.draw(segs.map((s) => ({ a: W3(s.a.x, s.a.y), b: W3(s.b.x, s.b.y), color: s.color ?? 0xff2d2d, opacity: clamp(s.I, 0.18, 1) })));
    V.dash.draw(dashes.map((s) => ({ a: W3(s.a.x, s.a.y, 0.05), b: W3(s.b.x, s.b.y, 0.05), color: 0xffffff, opacity: 0.8 })));
    V.tags.forEach((t, k) => { const r = readouts[k]; t.o.visible = !!r; if (r) { t.o.position.set(...W3(r.at.x, r.at.y, 0.4)); t.el.innerHTML = r.html; } });
    V.laser.visible = !!V.laserAt;
    if (V.laserAt) { const { src, dir } = V.laserAt, a = Math.atan2(dir.y, dir.x); V.laser.position.set(...W3(src.x, src.y, 0.1)); V.laser.rotation.set(0, p.mode === 'depth' ? 0 : -a, p.mode === 'depth' ? a : 0); }
    // 其他模型
    if (p.mode === 'mirror') {
      V.candle.visible = V.ghost.visible = p.img; V.eye.o.visible = p.img;
      V.candle.position.set(2 - p.od, 0, 0.9); V.ghost.position.set(2 + p.od, 0, 0.9); V.eye.o.position.set(-2.4, TY + 0.3, -1.8);
    }
    if (p.mode === 'lens') {
      V.lensCv.visible = p.lensType === 'convex'; V.lensCc.visible = !V.lensCv.visible;
      const fl = p.fl; V.F[0].position.set(-fl, TY + 0.05, 0); V.F[1].position.set(fl, TY + 0.05, 0);
      V.F[0].userData.t.el.textContent = 'F'; V.F[1].userData.t.el.textContent = "F'";
      V.objArrow.position.set(-p.uo, TY + 0.08, 0); V.objArrow.setDirection(new THREE.Vector3(0, 0, 1)); V.objArrow.setLength(0.8, 0.2, 0.14);
      const im = S.img; V.imgArrow.visible = !!im && Number.isFinite(im.vI) && Math.abs(im.vI) < 6;
      if (V.imgArrow.visible) { V.imgArrow.position.set(im.vI, TY + 0.1, 0); V.imgArrow.setDirection(new THREE.Vector3(0, 0, Math.sign(im.hI) || 1)); V.imgArrow.setLength(Math.max(0.05, Math.abs(im.hI)), Math.min(0.2, Math.abs(im.hI) * 0.5), 0.14); V.imgArrow.line.material.transparent = true; V.imgArrow.line.material.opacity = im.real ? 1 : 0.45; V.imgArrow.cone.material.transparent = true; V.imgArrow.cone.material.opacity = im.real ? 1 : 0.45; }
    }
    if (p.mode === 'depth' && S.app) { V.coinG.position.y = TY + S.app.y; V.depthWater.scale.y = 1; }
  }
  const S = {};

  /* ---------------- 介面 ---------------- */
  function sync() { for (const k of Object.keys(G)) G[k].visible = p.mode === k; }
  function apply(s = {}) {
    Object.assign(p, DEF);
    for (const k of Object.keys(DEF)) if (s[k] !== undefined) p[k] = s[k];
    if (p.mode === 'block') recs.length = 0;
    sync(); build();
  }
  function again() { recs.length = 0; build(); }
  function setParam(k, v) { p[k] = v; build(); }
  function act(a) {
    if (a[0] === 'record' && p.mode === 'block') {
      recs.push([S.sinR, S.sinI]); ctx.sfx('pop'); ctx.emit('record', { count: recs.length });
      ctx.toast(sc(`已記錄第 ${recs.length} 點`, `Recorded point ${recs.length}`));
    }
  }
  const simT = { t: 0 };
  function update(dt) { simT.t += dt; }
  let lastLang = null;
  function labels() {
    if (lastLang !== ctx.lang()) { lastLang = ctx.lang(); build(); }
    for (let i = 0; i < 7; i++) { const b = V['band' + i]; if (b) b.t.el.textContent = L(b.nm); }
    V.specTag.el.innerHTML = L(sc('電磁波譜', 'The electromagnetic spectrum')) + `<small>${L(sc('全部在真空中以 3×10⁸ m/s 傳播', 'All travel at 3×10⁸ m/s in a vacuum'))}</small>`;
    if (V.tags.some((t) => t.o.visible)) V.tags.forEach((t, k) => { const r = readouts[k]; if (r) t.el.innerHTML = r.html; });
  }
  function screenPos(a) {
    if (a[0] !== 'record') return null;
    const v = new THREE.Vector3(-1.5, TY + 0.4, 0).project(ctx.camera);
    return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight };
  }
  function describeGraph() {
    return ctx.lang() === 'zh' ? `呢幅圖橫軸係 sin r，直軸係 sin i。啲點會排成一條穿過原點嘅直線，條線嘅斜率就係折射率。已經記錄咗 ${recs.length} 點。`
      : `This graph has sin r across and sin i up. The points form a straight line through the origin, and its slope is the refractive index. ${recs.length} points recorded so far.`;
  }
  function tap(ray) {
    if (p.mode === 'lens') { ctx.info('lens', () => L(sc('透鏡', 'Lens')), () => L(S.img && S.img.real ? sc('而家係實像：光線真正聚埋，可以投影喺屏幕。', 'This is a real image: the light really meets here and could be shown on a screen.') : sc('而家係虛像：光線冇真正聚埋，只係好似由嗰度嚟。', 'This is a virtual image: the light doesn’t really meet; it only seems to come from there.'))); return true; }
    return false;
  }
  // 語言改變時重算讀數
  const relabel = () => build();

  return {
    board: { title: 'Light · 光', lines: ['i = r', 'n = sin i / sin r', 'sin c = 1/n'],
      info: sc('黑板上：反射定律 i = r；斯涅耳定律 n = sin i ÷ sin r；臨界角 sin c = 1 ÷ n。', "On the board: the law of reflection i = r; Snell's law n = sin i ÷ sin r; critical angle sin c = 1 ÷ n.") },
    camera: { pos: [0, 6.6, 6.4], target: [0, 0.9, 0.2] }, people: [[-6.9, -3.2, 0.5], [6.9, -3.2, -0.5]],
    params, graphs,
    buttons: [{ label: sc('📝 記錄', '📝 Record'), act: ['record'], cls: 'btn-primary', show: () => p.mode === 'block' }, { label: sc('🔄 重設', '🔄 Reset'), act: ['again'] }],
    lessons: [
      { id: 'light', icon: '🪞', subs: ['3.2'], items: [65, 66, 67], title: sc('光和平面鏡', 'Light and plane mirrors'),
        desc: sc('電磁波譜、反射定律、鏡中的像。', 'The electromagnetic spectrum, the law of reflection, and images in a mirror.'),
        base: { mode: 'mirror' }, params: ['inc', 'img', 'od'], graphs: [], camera: { pos: [-0.5, 5.4, 6.6], target: [0, 1.2, 0] }, stages: lightStages },
      { id: 'refract', icon: '🔦', subs: ['3.2'], items: [68, 69, 70, 71], title: sc('折射與全內反射', 'Refraction and total internal reflection'),
        desc: sc('光會轉彎、用圖求折射率、水池變淺、光纖。', 'Light bends, n from a graph, pools look shallow, and optical fibres.'),
        base: { mode: 'block' }, params: ['inc', 'n', 'mat', 'fin'], graphs: ['snell'], stages: refractStages },
      { id: 'lens', icon: '🔍', subs: ['3.2'], items: [72, 73, 74, 75], title: sc('透鏡成像', 'Images formed by lenses'),
        desc: sc('凸透鏡和凹透鏡的作圖規則、實像虛像、放大鏡。', 'Ray rules for convex and concave lenses, real and virtual images, magnifying glasses.'),
        base: { mode: 'lens' }, params: ['lensType', 'uo', 'fl'], graphs: [], stages: lensStages },
      { id: 'rainbow', icon: '🌈', subs: ['3.2'], items: ['L1'], title: sc('色散與彩虹', 'Dispersion and rainbows'),
        desc: sc('三稜鏡把白光拆成七色，彩虹怎樣形成。', 'A prism splits white light into colours, and how rainbows form.'),
        base: { mode: 'prism' }, params: ['white'], graphs: [], stages: rainbowStages }
    ],
    mount, apply, again, act, update, labels, setParam, relabel,
    getParam: (k) => p[k], hist: () => ({ t: [], c: {}, ev: [] }), ghost: () => null, simTime: () => simT.t,
    tap, screenPos, describeGraph
  };
}
