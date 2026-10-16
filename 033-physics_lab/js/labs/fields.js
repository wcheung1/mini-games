/* =====================================================================
 * 實驗枱：電場磁場枱（fields）
 * 單元：🎈 靜電（79–85）、🧲 磁場與電磁鐵（107–112）、⚙️ 直流電動機與電流計（113–116）、🔁 電磁感應（117–118）
 * 模式：static / magnet / motor / induction
 * 枱面上有一格格小箭咀（指南針），顯示電場或磁場的方向
 * ===================================================================== */
export default function create(ctx) {
  const { THREE, kit, root } = ctx;
  const { std, mesh, tag, glass, Hist, C, f } = kit;
  const L = kit.L2(ctx.lang);
  const clamp = THREE.MathUtils.clamp;
  const sc = (zh, en) => ({ zh, en });
  const TY = 0.85;

  const DEF = { mode: 'static', qA: 2, qB: 2, rod: 'metal', src: 'bar', flip: false, I: 3, N: 40, core: false, filings: false, mI: 2, mDir: 1, mN: 20, strong: true, spd: 1.5, iN: 100 };
  const p = { ...DEF };
  const params = [
    { key: 'qA', label: sc('🔴 A 球電荷', '🔴 Charge on sphere A'), min: -3, max: 3, step: 1, unit: '', fmt: (v) => (v > 0 ? '+' : '') + v },
    { key: 'qB', label: sc('🔵 B 球電荷', '🔵 Charge on sphere B'), min: -3, max: 3, step: 1, unit: '', fmt: (v) => (v > 0 ? '+' : '') + v },
    { key: 'rod', type: 'select', label: sc('🥢 用來接觸的棒', '🥢 Rod to touch with'), options: [{ v: 'metal', label: sc('金屬棒（導體）', 'Metal (conductor)') }, { v: 'plastic', label: sc('膠棒（絕緣體）', 'Plastic (insulator)') }] },
    { key: 'src', type: 'select', label: sc('🧲 磁場來源', '🧲 Field source'), options: [{ v: 'bar', label: sc('一塊磁鐵', 'One magnet') }, { v: 'two', label: sc('兩塊磁鐵', 'Two magnets') }, { v: 'wire', label: sc('通電直導線', 'Current-carrying wire') }, { v: 'coil', label: sc('電磁鐵', 'Electromagnet') }] },
    { key: 'flip', type: 'toggle', label: sc('🔄 反轉第二塊磁鐵', '🔄 Flip the second magnet') },
    { key: 'filings', type: 'toggle', label: sc('✨ 撒鐵粉', '✨ Sprinkle iron filings') },
    { key: 'I', label: sc('⚡ 電流', '⚡ Current'), min: 0, max: 5, step: 0.5, unit: 'A' },
    { key: 'N', label: sc('🌀 線圈匝數', '🌀 Turns of wire'), min: 10, max: 100, step: 10, unit: '' },
    { key: 'core', type: 'toggle', label: sc('🔩 加入鐵芯', '🔩 Add an iron core') },
    { key: 'mI', label: sc('⚡ 摩打電流', '⚡ Motor current'), min: 0, max: 4, step: 0.5, unit: 'A' },
    { key: 'mDir', type: 'select', label: sc('↔️ 電流方向', '↔️ Current direction'), options: [{ v: 1, label: sc('正向', 'Forward') }, { v: -1, label: sc('反向', 'Reversed') }] },
    { key: 'mN', label: sc('🌀 線圈匝數', '🌀 Coil turns'), min: 10, max: 50, step: 10, unit: '' },
    { key: 'strong', type: 'toggle', label: sc('🧲 強力磁鐵', '🧲 Strong magnets') },
    { key: 'spd', label: sc('💨 磁鐵移動速度', '💨 Magnet speed'), min: 0.5, max: 4, step: 0.5, unit: 'm/s' },
    { key: 'iN', label: sc('🌀 線圈匝數', '🌀 Coil turns'), min: 50, max: 200, step: 50, unit: '' }
  ];
  const graphs = [{ id: 'I', tab: sc('感生電流 I–t', 'Induced current I–t'), y: sc('電流 I (mA)', 'current I (mA)'), sym: true, min: 5, span: 8, series: [['I', sc('感生電流', 'Induced current'), C.teal]] }];
  const ALL = params.map((q) => q.key);

  /* ---------------- 狀態 ---------------- */
  const S = { t: 0, lastSample: -1 };
  const st = { charged: false, rubT: 0, touchT: 0, qA: 2 };
  const motor = { th: 0, w: 0 };
  const ind = { x: -3.8, v: 0, target: null, I: 0, phiPrev: 0, fired: false };
  const H = new Hist(['I']);
  let ghost = null;

  /* ---------------- 場的計算（枱面 x–z 平面） ---------------- */
  function sources() {
    const out = [];
    if (p.mode === 'static') { out.push({ k: 'q', x: -1.4, z: 0, q: st.qA }); out.push({ k: 'q', x: 1.4, z: 0, q: p.qB }); }
    else if (p.mode === 'magnet') {
      if (p.src === 'bar') out.push({ k: 'q', x: 0.8, z: 0, q: 3 }, { k: 'q', x: -0.8, z: 0, q: -3 });
      if (p.src === 'two') { out.push({ k: 'q', x: -0.6, z: 0, q: 3 }, { k: 'q', x: -2.2, z: 0, q: -3 }); const s = p.flip ? 1 : -1; out.push({ k: 'q', x: 0.6, z: 0, q: 3 * s }, { k: 'q', x: 2.2, z: 0, q: -3 * s }); }
      if (p.src === 'wire') out.push({ k: 'w', x: 0, z: 0, I: p.I });
      if (p.src === 'coil') { const m = coilStrength() / 40; out.push({ k: 'q', x: 0.9, z: 0, q: m }, { k: 'q', x: -0.9, z: 0, q: -m }); }
    } else if (p.mode === 'motor') { const b = p.strong ? 3 : 1.4; out.push({ k: 'q', x: -1.9, z: 0, q: b }, { k: 'q', x: 1.9, z: 0, q: -b }); }
    else if (p.mode === 'induction') out.push({ k: 'q', x: ind.x + 0.55, z: 0, q: 3 }, { k: 'q', x: ind.x - 0.55, z: 0, q: -3 });
    return out;
  }
  const coilStrength = () => p.N * p.I * (p.core ? 6 : 1);
  function field(x, z) {
    let bx = 0, bz = 0;
    for (const s of sources()) {
      const dx = x - s.x, dz = z - s.z, r2 = Math.max(dx * dx + dz * dz, 0.04), r = Math.sqrt(r2);
      if (s.k === 'q') { bx += (s.q * dx) / (r2 * r); bz += (s.q * dz) / (r2 * r); }
      else { bx += (-s.I * dz) / r2; bz += (s.I * dx) / r2; }
    }
    return [bx, bz];
  }

  /* ---------------- 教學 ---------------- */
  const staticStages = [
    { id: 'st-intro', who: 'chan', title: sc('電荷', 'Electric charge'),
      say: sc('所有物質都有正電荷同負電荷。用氣球擦羊毛，電子會由羊毛走去氣球，氣球就帶負電，羊毛就帶正電。撳「擦氣球」試吓！', "All matter contains positive and negative charges. Rub a balloon on wool and electrons move from the wool to the balloon, so the balloon becomes negative and the wool positive. Tap 'Rub the balloon'!"),
      task: sc('按「擦氣球」', "Tap 'Rub the balloon'"), setup: { mode: 'static', qA: 0, qB: 0 }, goal: { type: 'rubbed' }, demo: [['rub']], settle: 3, items: [79, 82] },
    { id: 'st-paper', who: 'chan', title: sc('氣球與紙碎', 'Balloon and paper bits'),
      say: sc('帶咗電嘅氣球放近紙碎。', 'The charged balloon is brought near some paper bits.'), setup: { mode: 'static', qA: 0, qB: 0 },
      quiz: { q: sc('用氣球擦頭髮之後，氣球可以吸起紙碎，原因係？', 'After rubbing, the balloon can pick up paper bits. Why?'), opts: [sc('帶電物件會吸引細小嘅物件', 'Charged objects attract small light objects'), sc('氣球有磁力', 'The balloon is magnetic'), sc('氣球有膠水', 'The balloon is sticky')], ans: 0,
        run: [['rub']], watch: 2.5,
        why: sc('答案係：帶電物件會吸引細小物件！氣球嘅負電荷會將紙碎入面嘅電荷推開少少，近氣球嗰邊變成正，所以被吸過去。呢個就係電力存在嘅證據。',
          "The answer: charged objects attract small light objects! The balloon's negative charge pushes charges in the paper apart a little, leaving the near side positive, so the paper is pulled up. That is evidence of the electric force.") },
      chain: [sc('摩擦令電子轉移', 'Rubbing moves electrons'), sc('氣球帶負電', 'The balloon becomes negative'), sc('吸引紙碎', 'It attracts paper bits')], items: [80, 82] },
    { id: 'st-like', who: 'ming', title: sc('同性電荷：估一估', 'Like charges: predict'),
      say: sc('兩個金屬球，A 帶正電，B 而家冇電。我哋令 B 都帶正電。', 'Two metal spheres: A is positive and B is neutral. Now we make B positive too.'), setup: { mode: 'static', qA: 2, qB: 0 }, lock: ALL,
      quiz: { q: sc('兩個都帶正電，會點？', 'What happens when both are positive?'), opts: [sc('互相推開', 'They push each other apart'), sc('互相吸引', 'They pull together'), sc('冇反應', 'Nothing')], ans: 0,
        run: [['set', 'qB', 2]], watch: 2,
        why: sc('答案係：互相推開！同性電荷互相排斥，異性電荷互相吸引。電荷越多、距離越近，力就越大。', 'The answer: they push apart! Like charges repel and unlike charges attract. More charge and less distance mean a bigger force.') },
      chain: [sc('同性相拒', 'Like charges repel'), sc('異性相吸', 'Unlike charges attract')], items: [79, 80] },
    { id: 'st-field', who: 'chan', title: sc('電場', 'Electric field'),
      say: sc('電荷周圍有一個「電場」，會推或者拉其他電荷。枱面上嘅小箭咀顯示電場方向：由正電荷出發，指向負電荷。將 A 球改做負電，睇吓箭咀點變！',
        'Around a charge is an electric field that pushes or pulls other charges. The little arrows show its direction: out of positive charges and into negative ones. Make sphere A negative and watch the arrows change!'),
      task: sc('把 A 球的電荷改成負數', "Make sphere A's charge negative"), setup: { mode: 'static', qA: 2, qB: 2 },
      goal: { type: 'param', test: () => p.qA < 0 }, demo: [['openTools'], ['set', 'qA', -2]], settle: 3,
      chain: [sc('正電荷：箭咀向外', 'Positive: arrows point out'), sc('負電荷：箭咀向內', 'Negative: arrows point in')], items: [83] },
    { id: 'st-cond', who: 'chan', title: sc('導體與絕緣體：估一估', 'Conductors and insulators: predict'),
      say: sc('A 球帶電。我哋用一支駁咗落地嘅棒去掂佢。', 'Sphere A is charged. We touch it with a rod that is connected to the ground.'), setup: { mode: 'static', qA: 3, qB: 0, rod: 'plastic' }, lock: ALL,
      quiz: { q: sc('邊種棒可以將 A 球嘅電荷導走？', "Which rod can carry sphere A's charge away?"), opts: [sc('金屬棒', 'The metal rod'), sc('膠棒', 'The plastic rod'), sc('兩種都得', 'Both')], ans: 0,
        run: [['touch'], ['wait', 1.5], ['set', 'rod', 'metal'], ['touch']], watch: 2,
        why: sc('答案係：金屬棒！金屬係導體，電荷可以喺入面自由流動，流落地底，叫放電或者接地。膠棒係絕緣體，電荷流唔過。', 'The answer: the metal rod! Metal is a conductor, so charge flows freely through it to the ground: discharging, or earthing. Plastic is an insulator, so charge can’t flow through it.') },
      chain: [sc('金屬是導體', 'Metal conducts'), sc('電荷流到地面', 'Charge flows to the ground'), sc('A 球放電', 'Sphere A is discharged')], items: [81, 82] },
    { id: 'st-safe', who: 'chan', title: sc('靜電的危險與應用', 'Hazards and uses of static'),
      say: sc('靜電可以好有用，例如影印機、噴油同埋煙囪除塵；但係佢亦可以好危險，例如閃電，同埋喺油站引起火花。', 'Static can be very useful, in photocopiers, spray painting and chimney dust removal, but it can also be dangerous, like lightning or sparks at a petrol station.'),
      quiz: { q: sc('運油車點解要拖住一條鏈落地？', 'Why does a fuel tanker trail a chain to the ground?'), opts: [sc('將靜電導走，避免火花', 'To conduct static away and avoid sparks'), sc('裝飾', 'For decoration'), sc('令車行得穩', 'To keep it steady')], ans: 0,
        why: sc('答案係：將靜電導走！車同空氣摩擦會積聚靜電，如果放出火花，燃油就可能爆炸。高樓頂嘅避雷針都係同一個道理。', 'The answer: to conduct static away! Friction with the air builds up charge, and a spark could ignite the fuel. Lightning conductors on tall buildings work the same way.') }, items: [84, 85] },
    { id: 'st-sum', who: 'chan', title: sc('總結', 'Summary'),
      say: sc('摩擦令電子轉移，物件就帶電；同性相拒、異性相吸；電荷周圍有電場；導體可以將電荷導走。', 'Rubbing moves electrons and charges objects; like charges repel and unlike attract; charges are surrounded by electric fields; conductors let charge flow away.'),
      setup: { mode: 'static', qA: 2, qB: -2 }, finish: true }
  ];
  const magnetStages = [
    { id: 'mg-intro', who: 'chan', title: sc('磁場', 'Magnetic field'),
      say: sc('磁鐵有 N 極同 S 極。周圍嘅指南針會跟住磁場方向轉，由 N 極出發，繞去 S 極。', 'A magnet has a north pole and a south pole. The compasses around it line up with the magnetic field, which runs out of N and round into S.'),
      setup: { mode: 'magnet', src: 'bar' }, items: [107] },
    { id: 'mg-poles', who: 'chan', title: sc('兩塊磁鐵：估一估', 'Two magnets: predict'),
      say: sc('兩塊磁鐵，N 極對住 N 極。', "Two magnets with north pole facing north pole."), setup: { mode: 'magnet', src: 'bar' }, lock: ALL,
      quiz: { q: sc('N 極對 N 極，會點？', 'What happens with north facing north?'), opts: [sc('互相推開', 'They push apart'), sc('互相吸住', 'They pull together')], ans: 0,
        run: [['set', 'src', 'two']], watch: 2,
        why: sc('答案係：推開！同極相拒，異極相吸。睇吓中間啲指南針，兩邊嘅磁場互相頂住，中間有一點係冇磁場嘅。', 'The answer: they push apart! Like poles repel and unlike poles attract. Look at the compasses in the middle: the two fields push against each other, leaving a spot with no field.') },
      chain: [sc('同極相拒', 'Like poles repel'), sc('異極相吸', 'Unlike poles attract')], items: [108] },
    { id: 'mg-filings', who: 'ming', title: sc('磁感線', 'Field lines'),
      say: sc('撒啲鐵粉落去，鐵粉會排成一條條線，叫磁感線。線越密，磁場越強；兩極附近最密。', 'Sprinkle some iron filings and they line up into curves called field lines. Where the lines are closer, the field is stronger: closest near the poles.'),
      task: sc('打開「撒鐵粉」', "Turn on 'Sprinkle iron filings'"), setup: { mode: 'magnet', src: 'bar', filings: false },
      goal: { type: 'param', test: () => p.filings }, demo: [['openTools'], ['set', 'filings', true]], settle: 3, items: [107, 109] },
    { id: 'mg-wire', who: 'chan', title: sc('電流產生磁場：估一估', 'Current makes a field: predict'),
      say: sc('有條直電線垂直穿過枱面，通咗電流。', 'A straight wire passes upright through the table, carrying a current.'), setup: { mode: 'magnet', src: 'bar', filings: false }, lock: ALL,
      quiz: { q: sc('電線周圍嘅磁場係咩形狀？', 'What shape is the magnetic field around the wire?'), opts: [sc('一圈圈圍住電線', 'Circles around the wire'), sc('直線', 'Straight lines'), sc('冇磁場', 'No field at all')], ans: 0,
        run: [['set', 'src', 'wire']], watch: 2,
        why: sc('答案係：一圈圈！有電流就有磁場。用右手握住電線，拇指指住電流方向，四隻手指捲嘅方向就係磁場方向。', 'The answer: circles! Wherever there is current there is a magnetic field. Grip the wire with your right hand, thumb along the current, and your fingers curl the way the field goes.') },
      chain: [sc('電流通過', 'Current flows'), sc('產生磁場', 'A magnetic field forms'), sc('磁場成圓圈', 'The field forms circles')], items: [110] },
    { id: 'mg-coil', who: 'chan', title: sc('電磁鐵：估一估', 'Electromagnet: predict'),
      say: sc('將電線捲成線圈，就變成電磁鐵，可以吸起萬字夾。', 'Coil the wire up and it becomes an electromagnet that can pick up paper clips.'), setup: { mode: 'magnet', src: 'coil', N: 20, I: 3, core: false }, lock: ALL,
      quiz: { q: sc('加多啲線圈匝數，電磁鐵會點？', 'What happens if we add more turns of wire?'), opts: [sc('吸到多啲萬字夾', 'It picks up more clips'), sc('吸少啲', 'Fewer clips'), sc('一樣', 'No change')], ans: 0,
        run: [['set', 'N', 80]], watch: 2,
        why: sc('答案係：吸到多啲！匝數越多、電流越大，電磁鐵就越強；加入軟鐵芯仲會強好多。電磁鐵嘅好處係可以隨時開關，廢鐵場嘅起重機就用佢。', 'The answer: more clips! More turns and more current make a stronger electromagnet, and a soft iron core makes it far stronger. Electromagnets can be switched on and off, so scrapyard cranes use them.') },
      chain: [sc('匝數多、電流大、有鐵芯', 'More turns, more current, iron core'), sc('磁場更強', 'Stronger field'), sc('吸起更多', 'Picks up more')], items: [111] },
    { id: 'mg-force', who: 'ming', title: sc('磁力推動電線', 'Magnetic force on a wire'),
      say: sc('如果將一條通電嘅電線放喺磁鐵中間，佢會被推郁！', 'Put a current-carrying wire between magnets and it gets pushed!'),
      quiz: { q: sc('通電電線放喺磁場入面會點？', 'What happens to a current-carrying wire in a magnetic field?'), opts: [sc('會受力被推動', 'It feels a force and moves'), sc('冇反應', 'Nothing'), sc('會變凍', 'It gets cold')], ans: 0,
        why: sc('答案係：會受力被推動！電線自己嘅磁場同磁鐵嘅磁場互相推拉，就產生力。呢個就係摩打可以轉動嘅秘密。', "The answer: it feels a force! The wire's own field and the magnet's field push and pull on each other. That is the secret behind electric motors.") },
      adv: sc('力的方向可以用弗林明左手定則找出：食指＝磁場，中指＝電流，拇指＝力。', "Fleming's left-hand rule gives the direction: first finger = field, second finger = current, thumb = force."), items: [112] },
    { id: 'mg-sum', who: 'chan', title: sc('總結', 'Summary'),
      say: sc('磁場由 N 去 S；同極相拒；電流會產生磁場；線圈加鐵芯變成強力電磁鐵；通電電線喺磁場入面會受力。', 'Magnetic fields run from N to S; like poles repel; currents make magnetic fields; a coil with an iron core makes a strong electromagnet; and a current-carrying wire feels a force in a magnetic field.'),
      setup: { mode: 'magnet', src: 'coil', N: 80, I: 4, core: true, filings: true }, finish: true }
  ];
  const motorStages = [
    { id: 'mo-intro', who: 'chan', title: sc('直流電動機', 'The d.c. motor'),
      say: sc('摩打入面有一個線圈，放喺兩塊磁鐵中間。電流流過線圈，兩邊受力方向相反，線圈就轉起嚟。', 'Inside a motor, a coil sits between two magnets. Current through the coil makes its two sides feel forces in opposite directions, so it turns.'),
      setup: { mode: 'motor', mI: 2, mDir: 1, mN: 20, strong: true }, items: [113] },
    { id: 'mo-rev', who: 'chan', title: sc('反轉電流：估一估', 'Reverse the current: predict'),
      say: sc('我哋將電流方向反轉。', 'We reverse the direction of the current.'), setup: { mode: 'motor', mI: 2, mDir: 1, mN: 20, strong: true }, lock: ALL,
      quiz: { q: sc('摩打會點？', 'What does the motor do?'), opts: [sc('轉返反方向', 'Spins the other way'), sc('停低', 'Stops'), sc('轉快啲', 'Spins faster')], ans: 0,
        run: [['set', 'mDir', -1]], watch: 3,
        why: sc('答案係：轉返反方向！電流反轉，力嘅方向都反轉。電動車倒車就係咁做。', 'The answer: it spins the other way! Reverse the current and the forces reverse too. That is how electric cars reverse.') }, items: [113] },
    { id: 'mo-fast', who: 'ming', title: sc('轉快啲', 'Faster!'),
      say: sc('想摩打轉快啲，可以加大電流、加多匝數，或者用強啲嘅磁鐵。試吓將電流加到 3.5 A！', 'To make a motor spin faster, increase the current, add more turns or use stronger magnets. Try raising the current to 3.5 A!'),
      task: sc('把摩打電流調到 3.5 A 或以上', 'Set the motor current to 3.5 A or more'), setup: { mode: 'motor', mI: 1, mDir: 1, mN: 20, strong: true },
      goal: { type: 'param', test: () => p.mI >= 3.5 }, demo: [['openTools'], ['set', 'mI', 4]], settle: 3,
      chain: [sc('電流更大／匝數更多／磁鐵更強', 'More current, turns or magnet strength'), sc('力更大', 'Bigger force'), sc('轉得更快', 'Faster spin')], items: [113] },
    { id: 'mo-comm', who: 'chan', title: sc('換向器', 'The commutator'),
      say: sc('線圈轉咗半圈之後，如果電流唔變方向，力就會將佢推返轉頭。', 'After half a turn, if the current kept the same direction, the forces would push the coil back again.'),
      quiz: { q: sc('換向器嘅作用係？', 'What does the commutator do?'), opts: [sc('每半圈改變線圈電流方向，令佢一直向同一方向轉', 'Reverses the coil current every half turn so it keeps spinning the same way'), sc('令摩打靜啲', 'Makes the motor quieter'), sc('儲電', 'Stores electricity')], ans: 0,
        why: sc('答案係：每半圈換一次電流方向！咁樣線圈就可以一直向同一方向轉。', 'The answer: it reverses the current every half turn! That keeps the coil turning in the same direction.') }, items: [113] },
    { id: 'mo-galv', who: 'chan', title: sc('動圈式電流計', 'The moving-coil galvanometer'),
      say: sc('電流計同摩打好似：線圈喺磁場入面受力轉動，但有條彈簧拉住，所以只會轉一個角度，電流越大轉得越多，指針就顯示電流大小。', "A galvanometer is like a motor: a coil turns in a magnetic field, but a spring holds it back, so it only turns so far. More current, more turn, and the pointer shows the current."),
      setup: { mode: 'motor', mI: 2, mDir: 1, mN: 20, strong: true },
      quiz: { q: sc('想將電流計改裝成量大電流嘅電流表，要點做？', 'How do we turn a galvanometer into an ammeter for large currents?'), opts: [sc('並聯一個好細嘅電阻（分流器）', 'Connect a very small resistor in parallel (a shunt)'), sc('串聯一個好大嘅電阻', 'Connect a very large resistor in series'), sc('唔使改', 'No change needed')], ans: 0,
        why: sc('答案係：並聯一個細電阻，叫分流器！大部分電流會經分流器走，只有少少經過電流計。如果要改成電壓錶，就要串聯一個好大嘅電阻，叫倍增器。', 'The answer: a small resistor in parallel, called a shunt! Most of the current takes the shunt and only a little goes through the meter. To make a voltmeter, add a very large resistor in series, called a multiplier.') },
      chain: [sc('分流器：並聯小電阻 → 電流表', 'Shunt: small parallel resistor → ammeter'), sc('倍增器：串聯大電阻 → 電壓錶', 'Multiplier: big series resistor → voltmeter')], items: [114, 115, 116] },
    { id: 'mo-sum', who: 'chan', title: sc('總結', 'Summary'),
      say: sc('摩打靠磁場對電流嘅力轉動；換向器令佢一直轉；電流計用同一個原理量電流，加分流器或倍增器就變成電流表或電壓錶。', "Motors turn because magnetic fields push on currents; the commutator keeps them turning; galvanometers use the same idea to measure current, and a shunt or multiplier turns them into ammeters or voltmeters."),
      setup: { mode: 'motor', mI: 3, mDir: 1, mN: 30, strong: true }, finish: true }
  ];
  const inductionStages = [
    { id: 'in-intro', who: 'chan', title: sc('用磁鐵發電？', 'Making electricity with a magnet?'),
      say: sc('右邊有個線圈駁住電流計。磁鐵唔郁嘅時候，指針停喺零。', 'On the right is a coil connected to a galvanometer. While the magnet is still, the pointer stays at zero.'),
      setup: { mode: 'induction' }, graph: 'I', items: [118] },
    { id: 'in-push', who: 'chan', title: sc('推入磁鐵：估一估', 'Push the magnet in: predict'),
      say: sc('我哋將磁鐵推入線圈。', "We'll push the magnet into the coil."), setup: { mode: 'induction' }, lock: ALL, graph: 'I',
      quiz: { q: sc('電流計指針會點？', 'What does the galvanometer pointer do?'), opts: [sc('郁，有電流', 'It moves: there is a current'), sc('冇反應', 'Nothing happens')], ans: 0,
        run: [['push'], ['wait', 2.5]], watch: 0.5,
        why: sc('答案係：有電流！線圈入面嘅磁場改變緊，就會產生感生電流。磁鐵停低，磁場唔再變，電流就冇咗。重點係「改變」！', "The answer: a current flows! When the magnetic field inside the coil changes, a current is induced. When the magnet stops, the field stops changing and the current disappears. Change is the key!") },
      chain: [sc('磁鐵移動', 'The magnet moves'), sc('線圈內磁場改變', 'The field in the coil changes'), sc('產生感生電流', 'A current is induced')], items: [118] },
    { id: 'in-fast', who: 'ming', title: sc('快啲推：估一估', 'Push faster: predict'),
      say: sc('今次用快啲嘅速度推入去。', "This time we push it in faster."), setup: { mode: 'induction', spd: 1 }, lock: ALL, graph: 'I',
      quiz: { q: sc('感生電流會點？', 'What happens to the induced current?'), opts: [sc('更大', 'It is bigger'), sc('更細', 'It is smaller'), sc('一樣', 'The same')], ans: 0,
        run: [['push'], ['wait', 2], ['pull'], ['wait', 2], ['set', 'spd', 3.5], ['push'], ['wait', 1.5]], watch: 0.5,
        why: sc('答案係：更大！磁場改變得越快，感生電流越大。線圈匝數越多、磁鐵越強，電流都會越大。睇吓圖：拉出嚟嗰陣，電流方向會相反。', 'The answer: bigger! The faster the field changes, the bigger the induced current. More turns and a stronger magnet help too. On the graph, pulling the magnet out makes the current flow the other way.') }, items: [118] },
    { id: 'in-lenz', who: 'chan', title: sc('楞次定律', "Lenz's law"),
      say: sc('留意線圈左邊嘅標籤：磁鐵 N 極推入嚟，線圈近磁鐵嗰端會變成咩極？', "Watch the label on the coil's left end. When the magnet's north pole is pushed in, what pole does that end of the coil become?"), setup: { mode: 'induction', spd: 1.5 },
      quiz: { q: sc('磁鐵 N 極推入線圈，線圈近磁鐵嗰端會變成？', 'As the N pole goes in, the near end of the coil becomes…'), opts: [sc('N 極，推開磁鐵', 'An N pole, pushing the magnet away'), sc('S 極，吸住磁鐵', 'An S pole, pulling the magnet in'), sc('冇極', 'No pole')], ans: 0,
        run: [['push'], ['wait', 1]], watch: 0.5,
        why: sc('答案係：N 極，推開磁鐵！感生電流嘅方向，總係會阻止令佢產生嘅改變，呢個叫楞次定律。所以推磁鐵入去要用力，嗰啲功就變成電能，符合能量守恆。',
          "The answer: an N pole, pushing it away! The induced current always opposes the change that causes it: Lenz's law. So you must push to move the magnet in, and that work becomes electrical energy. Energy is conserved.") },
      chain: [sc('磁鐵靠近', 'The magnet approaches'), sc('線圈產生同極推開它', 'The coil makes a like pole to repel it'), sc('要做功 → 變成電能', 'Work is needed → electrical energy')], items: [117] },
    { id: 'in-try', who: 'ming', title: sc('發電機', 'Generators'),
      say: sc('發電廠、單車嘅發電燈、無線充電，全部都係用電磁感應。到你試：用手指拖住磁鐵，快速推入同拉出線圈！', 'Power stations, bicycle dynamos and wireless chargers all use electromagnetic induction. Your turn: drag the magnet quickly in and out of the coil!'),
      task: sc('拖動磁鐵進出線圈，產生電流', 'Drag the magnet in and out of the coil'), setup: { mode: 'induction' }, graph: 'I',
      goal: { type: 'induce' }, demo: [['set', 'spd', 3], ['push'], ['wait', 1.2], ['pull']], settle: 2, items: [118] },
    { id: 'in-sum', who: 'chan', title: sc('總結', 'Summary'),
      say: sc('線圈入面嘅磁場改變，就會產生感生電流；改變越快、匝數越多、磁鐵越強，電流越大；感生電流總係阻止改變，呢個就係楞次定律。', "A changing magnetic field in a coil induces a current; faster change, more turns and a stronger magnet give more current; and the induced current always opposes the change: Lenz's law."),
      finish: true }
  ];

  /* ================== 3D 場景 ================== */
  const G = {}; ['static', 'magnet', 'motor', 'induction'].forEach((k) => { G[k] = new THREE.Group(); root.add(G[k]); });
  const V = {};
  const GX = 17, GZ = 7, NNEED = GX * GZ;
  function magnetBar(parent, len = 1.6) {
    const g = new THREE.Group(); parent.add(g);
    mesh(new THREE.BoxGeometry(len / 2, 0.3, 0.5), std(0xdc2626, 0.4), len / 4, 0.15, 0, g);
    mesh(new THREE.BoxGeometry(len / 2, 0.3, 0.5), std(0x2563eb, 0.4), -len / 4, 0.15, 0, g);
    const n = tag('readout light', g, len / 4, 0.45, 0); n.el.textContent = 'N';
    const s = tag('readout light', g, -len / 4, 0.45, 0); s.el.textContent = 'S';
    return g;
  }
  function mount() {
    mesh(new THREE.BoxGeometry(11, 0.1, 5.4), std(0xf8fafc, 0.8), 0, TY - 0.05, 0, root);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) mesh(new THREE.BoxGeometry(0.12, TY - 0.1, 0.12), std(0x94a3b8, 0.5, 0.5), sx * 5.3, (TY - 0.1) / 2, sz * 2.5, root);
    // 指南針格
    const tipG = new THREE.ConeGeometry(0.06, 0.2, 6); tipG.rotateZ(-Math.PI / 2); tipG.translate(0.1, 0, 0);
    const tailG = new THREE.ConeGeometry(0.06, 0.2, 6); tailG.rotateZ(Math.PI / 2); tailG.translate(-0.1, 0, 0);
    V.tip = new THREE.InstancedMesh(tipG, new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 }), NNEED);
    V.tail = new THREE.InstancedMesh(tailG, new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 }), NNEED);
    root.add(V.tip, V.tail);
    V.grid = []; for (let i = 0; i < GX; i++) for (let k = 0; k < GZ; k++) V.grid.push([-4.8 + i * 0.6, -2.1 + k * 0.7]);
    V.fil = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.008, 0.012), new THREE.MeshBasicMaterial({ color: 0x334155 }), 1400); root.add(V.fil);
    V.filPts = []; for (let i = 0; i < 1400; i++) V.filPts.push([-5 + Math.random() * 10, -2.4 + Math.random() * 4.8]);
    // 靜電
    const gS = G.static;
    V.sph = [-1.4, 1.4].map((x, i) => {
      mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.8, 10), std(0xfde68a, 0.4), x, TY + 0.4, 0, gS);
      const s = mesh(new THREE.SphereGeometry(0.32, 24, 16), std(0x94a3b8, 0.2, 0.9), x, TY + 0.95, 0, gS);
      const t = tag('readout', gS, x, TY + 1.55, 0);
      const a = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(x, TY + 0.95, 0), 0.8, 0xf97316, 0.25, 0.16); gS.add(a);
      return { s, t, a, x };
    });
    V.balloon = mesh(new THREE.SphereGeometry(0.35, 20, 16), std(0xef4444, 0.3), -3.8, TY + 0.9, 1.6, gS); V.balloon.scale.set(1, 1.25, 1);
    V.wool = mesh(new THREE.BoxGeometry(0.9, 0.25, 0.7), std(0xd6d3d1, 1), -3.8, TY + 0.13, 1.6, gS);
    V.minus = []; for (let i = 0; i < 6; i++) { const m = mesh(new THREE.BoxGeometry(0.1, 0.025, 0.025), std(0x2563eb), 0, 0, 0, gS, false); V.minus.push(m); }
    V.papers = []; for (let i = 0; i < 8; i++) { const m = mesh(new THREE.BoxGeometry(0.08, 0.01, 0.06), std(0xfef3c7), -2.6 + (i % 4) * 0.12, TY + 0.01, 1.4 + Math.floor(i / 4) * 0.15, gS, false); m.userData.home = m.position.clone(); V.papers.push(m); }
    V.rod = new THREE.Group(); gS.add(V.rod);
    V.rodM = mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 12), std(0x94a3b8, 0.3, 0.9), 0, 0, 0, V.rod); V.rodM.rotation.z = Math.PI / 2;
    V.groundW = kit.beam(gS, std(0x84cc16), 0.03);
    V.stTag = tag('readout', gS, 0, TY + 2.1, 0);
    // 磁鐵
    const gM = G.magnet;
    V.m1 = magnetBar(gM); V.m1.position.set(0, TY, 0);
    V.m2a = magnetBar(gM); V.m2a.position.set(-1.4, TY, 0); V.m2b = magnetBar(gM); V.m2b.position.set(1.4, TY, 0);
    V.wireUp = mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 12), std(0xb45309, 0.4, 0.6), 0, TY + 0.6, 0, gM);
    V.coil = new THREE.Group(); V.coil.position.set(0, TY + 0.35, 0); gM.add(V.coil);
    for (let i = 0; i < 12; i++) { const r = mesh(new THREE.TorusGeometry(0.3, 0.03, 8, 20), std(0xb45309, 0.4, 0.6), -0.75 + i * 0.136, 0, 0, V.coil); r.rotation.y = Math.PI / 2; }
    V.coreM = mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.9, 16), std(0x64748b, 0.4, 0.8), 0, 0, 0, V.coil); V.coreM.rotation.z = Math.PI / 2;
    V.clips = []; for (let i = 0; i < 8; i++) { const c = mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 12), std(0x94a3b8, 0.3, 0.9), 1.05 + 0.02 * i, TY + 0.3 - i * 0.07, (i % 2 ? 1 : -1) * 0.05, gM); V.clips.push(c); }
    V.mTag = tag('readout', gM, 0, TY + 1.7, 0);
    // 摩打
    const gR = G.motor;
    V.magN = mesh(new THREE.BoxGeometry(0.7, 1.4, 1.2), std(0xdc2626, 0.4), -2.0, TY + 0.7, 0, gR); V.magS = mesh(new THREE.BoxGeometry(0.7, 1.4, 1.2), std(0x2563eb, 0.4), 2.0, TY + 0.7, 0, gR);
    tag('readout light', gR, -2.0, TY + 1.6, 0).el.textContent = 'N'; tag('readout light', gR, 2.0, TY + 1.6, 0).el.textContent = 'S';
    V.rotor = new THREE.Group(); V.rotor.position.set(0, TY + 0.75, 0); gR.add(V.rotor);
    const cm = std(0xb45309, 0.4, 0.6);
    [[0, 0.5, 0, 2.2, 0.06, 0.06], [0, -0.5, 0, 2.2, 0.06, 0.06], [1.1, 0, 0, 0.06, 1.0, 0.06], [-1.1, 0, 0, 0.06, 1.0, 0.06]].forEach(([x, y, z, w, h, d]) => mesh(new THREE.BoxGeometry(w, h, d), cm, x, y, z, V.rotor));
    V.rotor.rotation.order = 'XYZ';
    mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.4, 8), std(0x334155), 0, TY + 0.75, 0, gR).rotation.x = Math.PI / 2;
    V.comm = mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.25, 16, 1, false, 0, Math.PI * 1.8), std(0xd97706, 0.3, 0.8), 0, TY + 0.75, 1.3, gR); V.comm.rotation.x = Math.PI / 2;
    V.galv = new THREE.Group(); V.galv.position.set(3.6, TY, 1.4); gR.add(V.galv);
    mesh(new THREE.BoxGeometry(1, 0.7, 0.2), std(0xffffff, 0.5), 0, 0.35, 0, V.galv);
    V.gNeedle = mesh(new THREE.BoxGeometry(0.02, 0.45, 0.02), std(0xdc2626), 0, 0.15, 0.12, V.galv); V.gNeedle.geometry.translate(0, 0.22, 0);
    V.moTag = tag('readout', gR, 0, TY + 2.0, 0);
    // 感應
    const gI = G.induction;
    V.iCoil = new THREE.Group(); V.iCoil.position.set(1.4, TY + 0.4, 0); gI.add(V.iCoil);
    for (let i = 0; i < 14; i++) { const r = mesh(new THREE.TorusGeometry(0.42, 0.035, 8, 24), std(0xb45309, 0.4, 0.6), -0.9 + i * 0.14, 0, 0, V.iCoil); r.rotation.y = Math.PI / 2; }
    V.iMag = magnetBar(gI, 1.1); V.iMag.position.y = TY + 0.25;
    mesh(new THREE.BoxGeometry(6.4, 0.04, 0.6), std(0xcbd5e1, 0.5), -1.6, TY + 0.02, 0, gI);
    V.iG = new THREE.Group(); V.iG.position.set(1.4, TY, -1.8); gI.add(V.iG);
    mesh(new THREE.BoxGeometry(1.2, 0.8, 0.2), std(0xffffff, 0.5), 0, 0.4, 0, V.iG);
    V.iNeedle = mesh(new THREE.BoxGeometry(0.02, 0.5, 0.02), std(0xdc2626), 0, 0.15, 0.12, V.iG); V.iNeedle.geometry.translate(0, 0.25, 0);
    kit.beam(gI, std(0x111827), 0.03).set(0.5, TY + 0.4, -0.3, 0.9, TY + 0.4, -1.7); kit.beam(gI, std(0x111827), 0.03).set(2.3, TY + 0.4, -0.3, 1.9, TY + 0.4, -1.7);
    V.poleTag = tag('readout', gI, 0.35, TY + 1.0, 0);
    V.iTag = tag('readout', gI, 1.4, TY + 1.9, -1.8);
  }

  /* ================== 每幀 ================== */
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), one = new THREE.Vector3(1, 1, 1), pos = new THREE.Vector3();
  let fieldDirty = true, lastKey = '';
  function drawField() {
    const key = JSON.stringify([p.mode, p.qA, p.qB, st.qA, p.src, p.flip, p.I, p.N, p.core, p.strong, p.filings, Math.round(ind.x * 20)]);
    if (key === lastKey && !fieldDirty) return; lastKey = key; fieldDirty = false;
    let n = 0;
    for (const [x, z] of V.grid) {
      const [bx, bz] = field(x, z), mag = Math.hypot(bx, bz), a = Math.atan2(bz, bx), s = mag < 1e-3 ? 0.001 : clamp(0.55 + Math.log10(mag + 1e-3) * 0.25, 0.35, 1.1);
      e.set(0, -a, 0); q.setFromEuler(e); pos.set(x, TY + 0.03, z); m4.compose(pos, q, one.clone().multiplyScalar(s));
      V.tip.setMatrixAt(n, m4); V.tail.setMatrixAt(n, m4); n++;
    }
    V.tip.instanceMatrix.needsUpdate = V.tail.instanceMatrix.needsUpdate = true;
    V.fil.visible = p.filings && p.mode === 'magnet';
    if (V.fil.visible) { let k = 0; for (const [x, z] of V.filPts) { const [bx, bz] = field(x, z), mag = Math.hypot(bx, bz); const sv = clamp(0.4 + mag * 0.5, 0.2, 1.4); e.set(0, -Math.atan2(bz, bx), 0); q.setFromEuler(e); pos.set(x, TY + 0.02, z); m4.compose(pos, q, new THREE.Vector3(sv, 1, 1)); V.fil.setMatrixAt(k++, m4); } V.fil.instanceMatrix.needsUpdate = true; }
  }
  function sample() { H.push(S.t, { I: p.mode === 'induction' ? ind.I : NaN }); }
  function update(dt) {
    S.t += dt; if (S.t - S.lastSample >= 1 / 30) { S.lastSample = S.t; sample(); }
    const showGrid = p.mode !== 'motor'; V.tip.visible = V.tail.visible = showGrid;
    drawField();
    if (p.mode === 'static') {
      if (st.rubT > 0) { st.rubT -= dt; V.balloon.position.x = -3.8 + Math.sin(st.rubT * 25) * 0.15; V.balloon.position.y = TY + 0.55; } else { V.balloon.position.set(-3.8, TY + 0.9, 1.6); }
      V.minus.forEach((m, i) => { m.visible = st.charged; const a = (i / 6) * Math.PI * 2; m.position.set(V.balloon.position.x + Math.cos(a) * 0.37, V.balloon.position.y + Math.sin(a) * 0.42, 1.6 + 0.3); });
      V.papers.forEach((m, i) => { const h = m.userData.home; const up = st.charged && st.rubT <= 0; const tgt = up ? new THREE.Vector3(-3.8 + 0.2 + (i % 4) * 0.05, TY + 0.45, 1.6 + 0.25) : h; m.position.lerp(tgt, Math.min(1, dt * (up ? 3 : 6))); });
      if (st.touchT > 0) { st.touchT -= dt; if (p.rod === 'metal') st.qA *= Math.pow(0.02, dt / 1.2); if (st.touchT <= 0 && p.rod === 'metal') { st.qA = 0; ctx.emit('discharged', {}); } }
      V.rod.visible = st.touchT > 0; V.rodM.material.color.set(p.rod === 'metal' ? 0x94a3b8 : 0xfacc15); V.rodM.material.metalness = p.rod === 'metal' ? 0.9 : 0;
      V.rod.position.set(-1.4 - 1.1, TY + 0.95, 0); V.groundW.visible = st.touchT > 0; V.groundW.set(-3.3, TY + 0.95, 0, -3.3, TY, 0);
      const F = (st.qA * p.qB) / (2.8 * 2.8);
      V.sph.forEach((s, i) => { const dir = (i ? 1 : -1) * Math.sign(F); s.a.visible = Math.abs(F) > 0.01; if (s.a.visible) { s.a.setDirection(new THREE.Vector3(dir, 0, 0)); s.a.setLength(0.3 + Math.min(1.2, Math.abs(F) * 1.2), 0.22, 0.15); } s.s.material.color.set((i ? p.qB : st.qA) > 0 ? 0xfca5a5 : (i ? p.qB : st.qA) < 0 ? 0x93c5fd : 0x94a3b8); });
    } else if (p.mode === 'magnet') {
      V.m1.visible = p.src === 'bar'; V.m2a.visible = V.m2b.visible = p.src === 'two'; V.wireUp.visible = p.src === 'wire'; V.coil.visible = p.src === 'coil';
      V.m2b.rotation.y = p.flip ? 0 : Math.PI; V.coreM.visible = p.core;
      const nClip = p.src === 'coil' ? clamp(Math.floor(coilStrength() / 60), 0, 8) : 0;
      V.clips.forEach((c, i) => (c.visible = i < nClip));
    } else if (p.mode === 'motor') {
      const B = p.strong ? 1 : 0.45, tq = p.mDir * p.mI * p.mN * B * 0.12 * Math.abs(Math.cos(motor.th));
      motor.w += (tq - 0.35 * motor.w) * dt * 6; motor.th += motor.w * dt;
      V.rotor.rotation.z = motor.th; V.comm.rotation.y = motor.th;
      V.gNeedle.rotation.z = -clamp(p.mDir * p.mI / 4, -1, 1) * 1.1;
    } else if (p.mode === 'induction') {
      if (ind.target != null) { const d = ind.target - ind.x, stp = Math.sign(d) * p.spd * dt; if (Math.abs(d) <= Math.abs(stp)) { ind.x = ind.target; ind.target = null; } else ind.x += stp; }
      const phi = 3 / (1 + ((ind.x + 0.55 - 1.4 + 0.9) / 0.6) ** 2) + 3 / (1 + ((ind.x - 1.4) / 0.9) ** 2) * 0.4;
      const emf = -(p.iN / 100) * (phi - ind.phiPrev) / Math.max(dt, 1e-3); ind.phiPrev = phi;
      ind.I = ind.I + (emf * 18 - ind.I) * Math.min(1, dt * 12);
      if (Math.abs(ind.I) > 8 && !ind.fired && S.t > 0.5) { ind.fired = true; ctx.emit('induce', {}); }
      if (Math.abs(ind.I) < 2) ind.fired = false;
      V.iMag.position.x = ind.x; V.iNeedle.rotation.z = -clamp(ind.I / 60, -1, 1) * 1.1;
    }
  }
  function labels() {
    if (p.mode === 'static') {
      V.sph[0].t.el.textContent = `A ${st.qA > 0.05 ? '+' + f(st.qA, 1) : st.qA < -0.05 ? f(st.qA, 1) : '0'}`; V.sph[1].t.el.textContent = `B ${p.qB > 0 ? '+' + p.qB : p.qB}`;
      const F = st.qA * p.qB;
      V.stTag.el.innerHTML = Math.abs(F) < 0.05 ? L(sc('冇電力', 'No electric force')) : F > 0 ? L(sc('同性相拒 ↔', 'Like charges repel ↔')) : L(sc('異性相吸 → ←', 'Unlike charges attract → ←'));
    } else if (p.mode === 'magnet') {
      const t = { bar: sc('磁場由 N 出發，回到 S', 'The field runs from N round to S'), two: p.flip ? sc('N 對 S：互相吸引', 'N facing S: they attract') : sc('N 對 N：互相推開', 'N facing N: they repel'), wire: sc(`電流 ${p.I} A：磁場成圓圈`, `Current ${p.I} A: circular field`), coil: sc(`吸住 ${clamp(Math.floor(coilStrength() / 60), 0, 8)} 個萬字夾`, `Holding ${clamp(Math.floor(coilStrength() / 60), 0, 8)} paper clips`) }[p.src];
      V.mTag.el.textContent = L(t);
    } else if (p.mode === 'motor') {
      V.moTag.el.innerHTML = L(sc('轉速', 'Speed')) + ` ${f(Math.abs(motor.w) * 9.55, 0)} rpm<small>${motor.w > 0.05 ? L(sc('逆時針 ↺', 'anticlockwise ↺')) : motor.w < -0.05 ? L(sc('順時針 ↻', 'clockwise ↻')) : L(sc('停止', 'stopped'))}</small>`;
    } else if (p.mode === 'induction') {
      const approaching = ind.target != null && ind.target > ind.x, leaving = ind.target != null && ind.target < ind.x;
      V.poleTag.o.visible = Math.abs(ind.I) > 2;
      V.poleTag.el.innerHTML = approaching ? L(sc('線圈：N 極（推開磁鐵）', 'Coil end: N (repels)')) : leaving ? L(sc('線圈：S 極（拉住磁鐵）', 'Coil end: S (attracts)')) : '';
      V.iTag.el.innerHTML = L(sc('感生電流', 'Induced current')) + ` ${f(ind.I, 0)} mA`;
    }
  }
  function sync() { for (const k of Object.keys(G)) G[k].visible = p.mode === k; fieldDirty = true; }
  function apply(s = {}) {
    Object.assign(p, DEF); for (const k of Object.keys(DEF)) if (s[k] !== undefined) p[k] = s[k];
    st.charged = false; st.rubT = 0; st.touchT = 0; st.qA = p.qA; motor.w = 0; ind.x = -3.8; ind.target = null; ind.I = 0; ind.phiPrev = 0; ind.fired = false;
    S.t = 0; S.lastSample = -1; H.reset(); ghost = null; sync();
  }
  function again() { if (H.n > 5) ghost = { t: H.t.slice(), c: { I: H.c.I.slice() } }; st.qA = p.qA; st.charged = false; ind.x = -3.8; ind.target = null; S.t = 0; S.lastSample = -1; H.reset(); }
  function setParam(k, v) { p[k] = v; if (k === 'qA') st.qA = v; fieldDirty = true; }
  function act(a) {
    if (a[0] === 'rub') { st.rubT = 1.2; st.charged = true; ctx.sfx('zap'); setTimeout(() => ctx.emit('rubbed', {}), 1300); }
    if (a[0] === 'touch') { st.touchT = 1.4; ctx.sfx('click'); }
    if (a[0] === 'push') { ind.target = 0.9; }
    if (a[0] === 'pull') { ind.target = -3.8; }
  }
  // 拖動感應磁鐵
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -(TY + 0.25)), hp = new THREE.Vector3();
  let drag = false, dPrev = 0;
  function pointerDown(e, ray) { if (p.mode !== 'induction') return false; if (!ray.intersectObject(V.iMag, true).length) return false; drag = true; ind.target = null; return true; }
  function pointerMove(e, ray) { if (!drag) return; if (ray.ray.intersectPlane(plane, hp)) ind.x = clamp(hp.x, -4.6, 1.0); }
  function pointerUp() { drag = false; }
  function tap(ray) {
    if (p.mode === 'static' && ray.intersectObject(V.balloon, false).length) { act(['rub']); return true; }
    if (p.mode === 'motor' && ray.intersectObject(V.galv, true).length) { ctx.info('galv', () => L(sc('電流計', 'Galvanometer')), () => L(sc('線圈喺磁場入面受力轉動，彈簧拉住佢，所以轉動角度同電流成正比。', 'The coil turns in the magnetic field against a spring, so how far it turns is proportional to the current.'))); return true; }
    return false;
  }
  function screenPos(a) {
    let v;
    if (a[0] === 'rub') v = V.balloon.position.clone(); else if (a[0] === 'touch') v = new THREE.Vector3(-2.4, TY + 1, 0); else if (a[0] === 'push' || a[0] === 'pull') v = new THREE.Vector3(ind.x, TY + 0.4, 0); else return null;
    v.project(ctx.camera); return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight };
  }
  function describeGraph() {
    return ctx.lang() === 'zh' ? '呢幅係感生電流對時間圖。磁鐵推入嗰陣電流係一個方向，拉出嗰陣係相反方向；磁鐵唔郁，電流就係零。推得越快，個尖峰越高。'
      : 'This is an induced current–time graph. Pushing the magnet in gives current one way; pulling it out gives the opposite way; with the magnet still, the current is zero. Faster movement makes taller peaks.';
  }
  return {
    board: { title: 'Electricity & Magnetism · 電和磁', lines: ['+ + → ←', 'N ↔ N', 'F = BIL'],
      info: sc('黑板上：同性電荷相拒；同極磁鐵相拒；磁場對電流的力 F = BIL。', 'On the board: like charges repel; like magnetic poles repel; the force on a current in a field is F = BIL.') },
    camera: { pos: [0, 6.6, 6.8], target: [0, 0.9, 0.2] }, people: [[-6.6, -3.2, 0.5], [6.6, -3.2, -0.5]],
    params, graphs,
    buttons: [{ label: sc('🎈 擦氣球', '🎈 Rub the balloon'), act: ['rub'], cls: 'btn-primary', show: () => p.mode === 'static' }, { label: sc('🥢 用棒接觸 A 球', '🥢 Touch sphere A with the rod'), act: ['touch'], show: () => p.mode === 'static' },
      { label: sc('➡️ 推入磁鐵', '➡️ Push the magnet in'), act: ['push'], cls: 'btn-primary', show: () => p.mode === 'induction' }, { label: sc('⬅️ 拉出磁鐵', '⬅️ Pull the magnet out'), act: ['pull'], show: () => p.mode === 'induction' },
      { label: sc('🔄 重設', '🔄 Reset'), act: ['again'] }],
    lessons: [
      { id: 'static', icon: '🎈', subs: ['4.1'], items: [79, 80, 81, 82, 83, 84, 85], title: sc('靜電與電場', 'Static electricity and electric fields'),
        desc: sc('擦氣球、同性相拒、電場箭咀、導體放電和靜電的危險。', 'Rubbed balloons, like charges repelling, field arrows, conductors discharging, and static hazards.'),
        base: { mode: 'static' }, params: ['qA', 'qB', 'rod'], graphs: [], stages: staticStages },
      { id: 'magnet', icon: '🧲', subs: ['4.3'], items: [107, 108, 109, 110, 111, 112], title: sc('磁場與電磁鐵', 'Magnetic fields and electromagnets'),
        desc: sc('指南針、鐵粉、通電電線的磁場和電磁鐵。', 'Compasses, iron filings, the field around a wire, and electromagnets.'),
        base: { mode: 'magnet' }, params: ['src', 'flip', 'filings', 'I', 'N', 'core'], graphs: [], stages: magnetStages },
      { id: 'motor', icon: '⚙️', subs: ['4.3'], items: [113, 114, 115, 116], title: sc('直流電動機與電流計', 'd.c. motors and galvanometers'),
        desc: sc('摩打點樣轉、反轉電流、換向器、分流器和倍增器。', 'How motors spin, reversing the current, the commutator, shunts and multipliers.'),
        base: { mode: 'motor' }, params: ['mI', 'mDir', 'mN', 'strong'], graphs: [], camera: { pos: [1.2, 4.6, 7.8], target: [0.6, 1.0, 0.3] }, stages: motorStages },
      { id: 'induction', icon: '🔁', subs: ['4.3'], items: [117, 118], title: sc('電磁感應與楞次定律', "Electromagnetic induction and Lenz's law"),
        desc: sc('用磁鐵發電、快慢與方向、楞次定律和發電機。', "Making current with a magnet, speed and direction, Lenz's law and generators."),
        base: { mode: 'induction' }, params: ['spd', 'iN'], graphs: ['I'], camera: { pos: [-0.5, 4.2, 6.6], target: [-0.6, 0.9, -0.2] }, stages: inductionStages }
    ],
    mount, apply, again, act, update, labels, setParam,
    getParam: (k) => p[k], hist: () => H, ghost: () => ghost, simTime: () => S.t,
    pointerDown, pointerMove, pointerUp, tap, screenPos, describeGraph
  };
}
