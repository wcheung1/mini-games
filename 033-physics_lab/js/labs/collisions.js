/* =====================================================================
 * 實驗室：撞車實驗室（牛頓定律與動量）
 * 實驗枱：軌道小車台（track bench）
 * ---------------------------------------------------------------------
 * 一個「實驗室模組」需要提供：
 *   title / icon / stages / params / graphs
 *   mount() update(dt) apply(setup) again() act(action)
 *   getParam(k) setParam(k,v) hist() ghost()
 *   pointerDown/Move/Up  screenPos(id)  describeGraph(id)  labels()
 * 將來新增實驗（例如加速度、動能）只需要寫新的 stages，
 * 或者複製這個檔案改成新的實驗枱。
 * ===================================================================== */

export function createCollisionLab(ctx) {
  const { THREE, CSS2DObject } = ctx;
  const L = (o) => (o ? o[ctx.lang()] ?? o.zh : '');
  const clamp = THREE.MathUtils.clamp;
  const sg = (n, d = 2) => (Math.abs(n) < 0.005 ? (0).toFixed(d) : (n > 0 ? '+' : '−') + Math.abs(n).toFixed(d));

  /* ---------------- 文字 ---------------- */
  const STR = {
    cartA: { zh: 'A 車', en: 'Cart A' }, cartB: { zh: 'B 車', en: 'Cart B' }, total: { zh: '合共', en: 'Total' },
    equal: { zh: '一樣大！', en: 'Equal!' },
    chan: { zh: '陳老師', en: 'Ms Chan' }, ming: { zh: '小明', en: 'Ming' },
    board: { zh: '黑板', en: 'Blackboard' }, floor: { zh: '地面', en: 'Floor' }, buffer: { zh: '緩衝器', en: 'Buffer' }
  };

  /* ---------------- 可調校參數 ---------------- */
  const DEF = { mA: 2, mB: 2, e: 1, mu: 0, J: 6, showB: true };
  const p = { ...DEF, slow: 1 };
  const eWord = (v) => v === 0 ? { zh: '黏在一起', en: 'stick together' } : v <= 0.4 ? { zh: '彈得很少', en: 'barely bouncy' }
    : v <= 0.7 ? { zh: '稍為彈開', en: 'a bit bouncy' } : v < 1 ? { zh: '幾乎完全彈開', en: 'very bouncy' } : { zh: '完全彈開', en: 'super bouncy' };
  const muWord = (v) => v === 0 ? { zh: '冰面，沒有摩擦力', en: 'ice, no friction' } : v <= 0.1 ? { zh: '光滑地板', en: 'smooth floor' }
    : v <= 0.25 ? { zh: '木地板', en: 'wooden floor' } : { zh: '地氈，摩擦力很大', en: 'carpet, lots of friction' };

  const params = [
    { key: 'mA', label: { zh: '🔴 A 車質量', en: '🔴 Cart A mass' }, min: 0.5, max: 5, step: 0.5, unit: 'kg',
      hint: { zh: '質量越大，越難改變速度', en: 'More mass = harder to change speed' } },
    { key: 'mB', label: { zh: '🔵 B 車質量', en: '🔵 Cart B mass' }, min: 0.5, max: 5, step: 0.5, unit: 'kg',
      hint: { zh: '質量越大，越難改變速度', en: 'More mass = harder to change speed' } },
    { key: 'J', label: { zh: '👉 推力大小', en: '👉 Push strength' }, min: 2, max: 12, step: 1, unit: 'N·s',
      hint: { zh: '每推一下給車子的「衝量」', en: 'The impulse each push gives' } },
    { key: 'e', label: { zh: '🏀 彈力（恢復係數 e）', en: '🏀 Bounciness (e)' }, min: 0, max: 1, step: 0.1, unit: '', word: eWord,
      hint: { zh: '0 = 黏在一起，1 = 完全彈開', en: '0 = stick together, 1 = super bouncy' } },
    { key: 'mu', label: { zh: '🧊 摩擦力（μ）', en: '🧊 Friction (μ)' }, min: 0, max: 0.5, step: 0.05, unit: '', word: muWord,
      hint: { zh: '0 = 冰面，越大摩擦力越大', en: '0 = ice; bigger = more friction' } },
    { key: 'slow', label: { zh: '🐢 播放速度（慢動作）', en: '🐢 Playback speed (slow-mo)' }, min: 0.1, max: 1, step: 0.1, unit: '×',
      hint: { zh: '調慢可看清楚碰撞', en: 'Slow it down to see the crash' } },
    { key: 'showB', type: 'toggle', label: { zh: '🔵 顯示 B 車', en: '🔵 Show cart B' } }
  ];

  /* ---------------- 圖表定義 ---------------- */
  const graphs = [
    { id: 'v', tab: { zh: '速度 v–t', en: 'Velocity v–t' }, y: { zh: '速度 v (m/s)', en: 'velocity v (m/s)' }, sym: true, min: 1,
      series: [['vA', 'A'], ['vB', 'B']] },
    { id: 's', tab: { zh: '位置 s–t', en: 'Position s–t' }, y: { zh: '位置 s (m)', en: 'position s (m)' }, fixed: [-6, 6],
      series: [['xA', 'A'], ['xB', 'B']] },
    { id: 'p', tab: { zh: '動量 p–t', en: 'Momentum p–t' }, y: { zh: '動量 p (kg·m/s)', en: 'momentum p (kg·m/s)' }, sym: true, min: 1,
      series: [['pA', 'A'], ['pB', 'B'], ['pT', 'T']] },
    { id: 'k', tab: { zh: '動能 KE–t', en: 'Kinetic energy KE–t' }, y: { zh: '動能 KE (J)', en: 'kinetic energy KE (J)' }, zero: true, min: 1,
      series: [['kA', 'A'], ['kB', 'B'], ['kT', 'T']] }
  ];
  const seriesName = (s) => L(s === 'A' ? STR.cartA : s === 'B' ? STR.cartB : STR.total);

  /* ---------------- 物理狀態 ---------------- */
  const PH = { L: 1, G: 9.8, WALL_E: 0.6, VMAX: 8, WR: 0.12 };
  const XMIN = -5.5, XMAX = 5.5;
  const carts = [{ id: 0, x: -3, v: 0, lift: 0 }, { id: 1, x: 1.5, v: 0, lift: 0 }];
  const S = { stuck: false, drag: -1, lastCrash: null, home: { xA: -3, xB: 1.5 }, simT: 0, lastSample: -1 };
  const newHist = () => ({ t: [], c: { xA: [], xB: [], vA: [], vB: [], pA: [], pB: [], pT: [], kA: [], kB: [], kT: [] }, ev: [] });
  let H = newHist(), ghost = null;

  /* =====================================================================
   * 教學步驟（粵語口語 / English）
   * goal：要小朋友做的動作；demo：自動模式下的示範
   * quiz：先估後做（Predict → Observe → Explain）
   * cond：實驗條件（控制變量）；chain：因果鏈；lock：鎖定的參數
   * ===================================================================== */
  const ALL = ['mA', 'mB', 'e', 'mu', 'J', 'showB'];
  const stages = [
    { id: 'intro', who: 'chan', title: { zh: '歡迎', en: 'Welcome' },
      say: { zh: '歡迎嚟到撞車實驗室！今日嘅大問題係：點解啲嘢會郁、會停，又會撞到彈開？物理學家有兩招絕技。第一招：由最基本、肯定係啱嘅事實開始，一步一步推理。第二招：學完之後，用自己嘅說話教返人。如果你教得識小明，就代表你真係明白！',
             en: "Welcome to the Crash Lab! Today's big question: why do things move, stop, and bounce when they crash? Physicists have two secret moves. Move one: start from the simplest facts we are sure are true, then reason step by step. Move two: after learning, explain it in your own words. If you can teach Ming, you really understand it!" },
      adv: { zh: '第一招叫「第一性原理」，第二招叫「費曼學習法」。', en: 'Move one is called first-principles thinking. Move two is called the Feynman technique.' },
      setup: {} },

    { id: 'controls', who: 'ming', title: { zh: '試試操控', en: 'Try the controls' },
      say: { zh: '我係小明！紅色係 A 車，藍色係 B 車。輕輕撳一下車仔，就可以推佢一下；撳住車仔拖，就可以搬佢，甚至拋出去。一隻手指喺空白位掃，可以轉鏡頭；兩隻手指可以移動同放大縮細。試吓撳一下 A 車啦！',
             en: "I'm Ming! The red one is cart A and the blue one is cart B. Tap a cart to give it a push. Press and drag a cart to move it, or even fling it. Swipe one finger on an empty spot to turn the camera, and use two fingers to move and zoom. Try tapping cart A now!" },
      task: { zh: '輕按 A 車，推它一下', en: 'Tap cart A to push it' },
      setup: {}, goal: { type: 'push' }, demo: [['push', 0]], settle: 2.2, graph: 'v' },

    { id: 'n1-predict', who: 'chan', title: { zh: '牛頓第一定律：估一估', en: "Newton's 1st law: predict" },
      say: { zh: '第一個最基本嘅問題：如果冇人推、冇嘢阻，一架車會點？我哋將 B 車搬走，地面變成冇摩擦力嘅冰面。先估一估，再做實驗。',
             en: "Here's the most basic question: if nothing pushes and nothing gets in the way, what does a cart do? We've moved cart B away and made the floor slippery ice with no friction. Make a guess first, then we'll test it." },
      cond: [{ zh: '沒有摩擦力（冰面）', en: 'No friction (ice)' }, { zh: '只推一次，然後放手', en: 'One push, then let go' }, { zh: 'B 車已移走', en: 'Cart B removed' }],
      setup: { showB: false, xA: -5 }, lock: ALL, graph: 'v',
      quiz: { q: { zh: '喺冇摩擦力嘅冰面上，推一下 A 車之後放手，A 車會點？', en: 'On frictionless ice, you push cart A once and let go. What happens next?' },
        opts: [{ zh: '慢慢變慢，最後停低', en: 'It slows down and stops' }, { zh: '一直用同一個速度滑落去', en: 'It keeps sliding at the same speed' }, { zh: '越嚟越快', en: 'It goes faster and faster' }],
        ans: 1, run: [['push', 0]], watch: 2.6,
        why: { zh: '答案係：一直用同一個速度滑落去！你睇吓速度–時間圖，條線係平嘅，代表速度冇變。因為冇摩擦力，放手之後就冇任何力去改變佢，所以佢會保持原本嘅速度。',
               en: "The answer: it keeps sliding at the same speed! Look at the velocity–time graph. The line is flat, which means the velocity doesn't change. With no friction, once you let go there's no force to change its motion, so it keeps the same velocity." } },
      chain: [{ zh: '沒有摩擦力', en: 'No friction' }, { zh: '沒有力改變它的運動', en: 'No force changes its motion' }, { zh: '速度保持不變', en: 'Velocity stays the same' }],
      items: [30] },

    { id: 'n1-explain', who: 'chan', title: { zh: '慣性', en: 'Inertia' },
      say: { zh: '呢個就係牛頓第一定律：一件嘢如果冇受到外力，停定嘅就會繼續停定，郁緊嘅就會用同一個速度、向同一個方向繼續郁。你坐巴士嗰陣，巴士突然剎車，你個身會向前衝，就係因為你個身想保持原本嘅速度。諗深一層：咁點解喺現實世界，碌出去嘅波最後都會停低呢？',
             en: "This is Newton's First Law: if no outside force acts on an object, a still object stays still, and a moving object keeps moving at the same speed in the same direction. When a bus brakes suddenly, your body lurches forward because it wants to keep its old speed. Think deeper: so why does a rolling ball in real life always stop in the end?" },
      adv: { zh: '物件保持原本運動狀態嘅特性叫做慣性。質量越大，慣性越大，越難改變佢嘅運動。', en: 'This tendency to keep the same motion is called inertia. The more mass, the more inertia, and the harder it is to change the motion.' },
      chain: [{ zh: '巴士突然剎車', en: 'The bus brakes suddenly' }, { zh: '身體想保持原本速度', en: 'Your body wants to keep its speed' }, { zh: '身體向前衝', en: 'You lurch forward' }],
      items: [30] },

    { id: 'friction', who: 'ming', title: { zh: '摩擦力', en: 'Friction' },
      say: { zh: '我知！係因為有嘢阻住佢。我哋只改變一樣嘢：將冰面換成木地板，其他條件好似推力、車嘅重量都保持不變。推 A 車，睇吓佢會唔會停。',
             en: "I know! Something is slowing it down. Let's change just one thing: swap the ice for a wooden floor. Everything else, like the push and the cart's mass, stays the same. Push cart A and see if it stops." },
      task: { zh: '推 A 車，看它在木地板上會否停下', en: 'Push cart A and watch whether it stops on the wooden floor' },
      cond: [{ zh: '只改變：地面（冰面 → 木地板）', en: 'Only change: the floor (ice → wood)' }, { zh: '保持不變：推力、車的質量', en: 'Kept the same: push and cart mass' }],
      setup: { showB: false, xA: -5, mu: 0.15 }, lock: ALL, graph: 'v',
      goal: { type: 'rest', id: 0 }, demo: [['push', 0]], settle: 1.4,
      chain: [{ zh: '木地板有摩擦力', en: 'The wooden floor has friction' }, { zh: '摩擦力向後拉', en: 'Friction pulls backwards' }, { zh: '速度慢慢減少', en: 'Speed drops' }, { zh: '最後停下', en: 'The cart stops' }],
      items: [31, 32] },

    { id: 'friction-quiz', who: 'chan', title: { zh: '摩擦力是壞東西嗎？', en: 'Is friction bad?' },
      say: { zh: '冇錯！地板同車轆之間有摩擦力，一直向後拉住架車，速度就慢慢減少，最後停低。睇吓速度–時間圖，條線變咗向下斜。咁摩擦力係咪壞嘢呢？我哋諗吓相反嘅情況。',
             en: "Exactly! Friction between the floor and the wheels keeps pulling the cart backwards, so its speed drops until it stops. On the velocity–time graph, the line now slopes down. So is friction a bad thing? Let's imagine the opposite." },
      graph: 'v',
      quiz: { q: { zh: '如果世界上突然冇晒摩擦力，會發生咩事？', en: 'If all friction suddenly disappeared from the world, what would happen?' },
        opts: [{ zh: '行路會變得好容易', en: 'Walking would get much easier' }, { zh: '我哋會不停跣低，連行路都行唔到', en: "We'd keep slipping and couldn't even walk" }, { zh: '乜嘢都唔會變', en: 'Nothing would change' }],
        ans: 1,
        why: { zh: '答案係：我哋會跣到行唔到！我哋行路嗰陣，隻腳向後撐地，係靠摩擦力先可以將我哋推向前。冇咗摩擦力，就好似喺好滑嘅冰上面行，寸步難行。所以摩擦力有時阻住我哋，有時幫到我哋。',
               en: "The answer: we'd slip and couldn't walk! When you walk, your foot pushes back on the ground, and friction is what pushes you forward. Without friction, it would be like walking on super slippery ice. So friction sometimes slows us down, and sometimes helps us." } },
      adv: { zh: '摩擦力會將動能變成熱能。你用力搓手，手會變暖，就係呢個原因。', en: 'Friction turns kinetic energy into heat. That is why your hands get warm when you rub them together.' },
      chain: [{ zh: '腳向後推地面', en: 'Your foot pushes back on the ground' }, { zh: '摩擦力向前推腳', en: 'Friction pushes your foot forward' }, { zh: '人向前走', en: 'You walk forward' }],
      items: [31, 38] },

    { id: 'n2-predict', who: 'chan', title: { zh: '牛頓第二定律：估一估', en: "Newton's 2nd law: predict" },
      say: { zh: '第二個基本問題：用同樣嘅推力，推輕嘅車同推重嘅車，會有咩分別？今次我哋只改變車嘅質量，推力保持不變。',
             en: "Second basic question: with the same push, what's the difference between pushing a light cart and a heavy cart? This time we only change the cart's mass. The push stays the same." },
      cond: [{ zh: '只改變：A 車的質量（1 kg → 4 kg）', en: "Only change: cart A's mass (1 kg → 4 kg)" }, { zh: '保持不變：推力、沒有摩擦力', en: 'Kept the same: push strength, no friction' }],
      setup: { showB: false, xA: -5, mA: 1 }, lock: ALL, graph: 'v',
      quiz: { q: { zh: '用一樣大力推一下，1 kg 嘅 A 車同 4 kg 嘅 A 車，邊架會郁得快啲？', en: 'With the same push, which goes faster: cart A at 1 kg, or cart A at 4 kg?' },
        opts: [{ zh: '1 kg 嘅車快啲', en: 'The 1 kg cart' }, { zh: '4 kg 嘅車快啲', en: 'The 4 kg cart' }, { zh: '兩架一樣快', en: 'Both the same' }],
        ans: 0, run: [['set', 'mA', 1], ['push', 0], ['wait', 1.5], ['again'], ['set', 'mA', 4], ['wait', 0.6], ['push', 0]], watch: 2.2,
        why: { zh: '答案係：1 kg 嘅車快啲！睇吓速度–時間圖，淡色虛線係上一次 1 kg 嘅車，實線係今次 4 kg 嘅車。推力一樣，質量大咗四倍，速度就細咗四倍。重嘅嘢比較懶，比較難改變速度。',
               en: "The answer: the 1 kg cart! On the velocity–time graph, the faint dashed line is the 1 kg run and the solid line is the 4 kg run. Same push, four times the mass, so a quarter of the speed. Heavy things are lazier and harder to speed up." } },
      chain: [{ zh: '推力一樣', en: 'Same push' }, { zh: '質量越大', en: 'More mass' }, { zh: '速度改變得越少', en: 'Smaller change in speed' }],
      items: [33] },

    { id: 'n2-try', who: 'chan', title: { zh: '牛頓第二定律：F = ma', en: "Newton's 2nd law: F = ma" },
      say: { zh: '呢個就係牛頓第二定律：力越大，速度改變得越快；質量越大，速度改變得越慢。好似推超級市場嘅購物車：空車一推就飛走，裝滿嘢嘅車就要好大力先推得郁。到你試：喺工具箱將 A 車調到 3 kg 或以上，再推吓佢。',
             en: "This is Newton's Second Law: a bigger force changes speed faster, and a bigger mass changes speed more slowly. Think of a supermarket trolley: an empty one zooms off with a little push, but a full one needs a big push. Your turn: open the toolbox, set cart A to 3 kg or more, then push it." },
      adv: { zh: '寫成公式就係 F = ma：力 = 質量 × 加速度。加速度就係速度每秒改變幾多。', en: 'As a formula, F = ma: force = mass × acceleration. Acceleration means how much the velocity changes each second.' },
      task: { zh: '在工具箱把 A 車調到 3 kg 或以上，再推它', en: 'In the toolbox, set cart A to 3 kg or more, then push it' },
      setup: { showB: false, xA: -5, mA: 1 }, graph: 'v',
      goal: { type: 'push', id: 0, test: () => p.mA >= 3 }, demo: [['openTools'], ['wait', 0.5], ['set', 'mA', 3], ['wait', 0.8], ['push', 0]], settle: 2.2,
      chain: [{ zh: '購物車裝滿東西', en: 'A full trolley' }, { zh: '質量變大', en: 'More mass' }, { zh: '同樣的力，加速度變小', en: 'Same force, less acceleration' }],
      items: [33] },

    { id: 'n3-predict', who: 'chan', title: { zh: '牛頓第三定律：估一估', en: "Newton's 3rd law: predict" },
      say: { zh: '第三個基本問題：兩架車撞埋嗰一刻，佢哋會互相推。今次 A 車係 4 kg 嘅大車，B 車係 1 kg 嘅細車，B 車停定喺度。',
             en: 'Third basic question: at the moment two carts crash, they push on each other. This time cart A is a big 4 kg cart, and cart B is a small 1 kg cart standing still.' },
      cond: [{ zh: 'A 車 4 kg，B 車 1 kg', en: 'Cart A 4 kg, cart B 1 kg' }, { zh: 'B 車原本靜止', en: 'Cart B starts still' }, { zh: '沒有摩擦力', en: 'No friction' }],
      setup: { mA: 4, mB: 1, xA: -4, xB: 0 }, lock: ALL, graph: 'v',
      quiz: { q: { zh: '撞嗰一刻，邊架車推對方推得大力啲？', en: 'At the moment of the crash, which cart pushes the other harder?' },
        opts: [{ zh: '大車推細車推得大力啲', en: 'The big cart pushes harder' }, { zh: '細車推大車推得大力啲', en: 'The small cart pushes harder' }, { zh: '兩個力一樣大', en: 'Both pushes are equal' }],
        ans: 2, run: [['push', 0]], watch: 3.0,
        why: { zh: '答案係：兩個力一樣大！睇吓兩個橙色箭咀，長度一樣，方向相反。好多人以為大車推得大力啲，其實唔係。A 推 B 幾大力，B 就會同時用一樣大嘅力推返 A。',
               en: "The answer: the two pushes are equal! Look at the two orange arrows: same length, opposite directions. Lots of people think the big cart pushes harder, but it doesn't. However hard A pushes B, B pushes back on A just as hard, at the same moment." } },
      chain: [{ zh: 'A 推 B', en: 'A pushes B' }, { zh: 'B 同時推回 A', en: 'B pushes back on A at the same time' }, { zh: '兩個力大小相同、方向相反', en: 'Equal size, opposite directions' }],
      items: [34, 35] },

    { id: 'n3-explain', who: 'chan', title: { zh: '作用力與反作用力', en: 'Action and reaction' },
      say: { zh: '呢個就係牛頓第三定律：力一定係一對一對出現，大小一樣，方向相反。你喺溜冰場推一推朋友，你哋兩個都會向後滑開。諗深一層：咁點解撞完之後，細車飛得快好多，大車就只係慢咗少少？用返第二定律諗吓：力一樣，細車質量細，所以速度改變得多；大車質量大，所以速度改變得少。',
             en: "This is Newton's Third Law: forces always come in pairs, equal in size and opposite in direction. If you push a friend at the ice rink, you both slide apart. Think deeper: so why does the small cart fly off much faster, while the big cart only slows a little? Use the Second Law: the forces are equal, the small cart has less mass so its speed changes a lot, and the big cart has more mass so its speed changes only a little." },
      adv: { zh: '寫成公式：F(A→B) = −F(B→A)。撞擊時間一樣，所以兩架車動量嘅改變 Δp 都一樣大、方向相反。', en: "As a formula: F(A→B) = −F(B→A). The contact time is the same, so both carts' change in momentum, Δp, is equal in size and opposite in direction." },
      chain: [{ zh: '兩個力一樣大', en: 'The forces are equal' }, { zh: '細車質量小', en: 'The small cart has less mass' }, { zh: '細車的速度改變得多', en: "The small cart's speed changes more" }],
      items: [34, 35] },

    { id: 'velocity', who: 'ming', title: { zh: '速率與速度', en: 'Speed and velocity' },
      say: { zh: '我發現一樣嘢！速度原來有方向㗎。向右郁，我哋叫佢正數；向左郁，就叫佢負數。試吓推 B 車，佢會向左郁，睇吓速度–時間圖條藍線係咪去咗零下面。',
             en: 'I found something! Velocity has a direction. Moving right, we call it positive. Moving left, we call it negative. Try pushing cart B. It moves left. Check whether the blue line on the velocity–time graph goes below zero.' },
      task: { zh: '推 B 車，觀察它的速度變成負數', en: 'Push cart B and watch its velocity become negative' },
      cond: [{ zh: '向右 = 正（+）', en: 'Right = positive (+)' }, { zh: '向左 = 負（−）', en: 'Left = negative (−)' }],
      setup: { xA: -5, xB: 4 }, graph: 'v',
      goal: { type: 'push', id: 1 }, demo: [['push', 1]], settle: 2.4,
      chain: [{ zh: 'B 車向左移動', en: 'Cart B moves left' }, { zh: '與正方向相反', en: 'Opposite to the positive direction' }, { zh: '速度是負數', en: 'Its velocity is negative' }],
      items: [21, 24, 25] },

    { id: 'vector-quiz', who: 'chan', title: { zh: '標量與向量', en: 'Scalars and vectors' },
      say: { zh: '冇錯！只講有幾快，叫做速率；講埋向邊個方向，就叫做速度。只有大小嘅量叫做標量，有大小又有方向嘅量叫做向量。考考你！',
             en: 'Right! How fast something goes is its speed. How fast plus which way is its velocity. A quantity with only a size is a scalar. A quantity with a size and a direction is a vector. Quiz time!' },
      quiz: { q: { zh: 'A 車以每秒 3 米向右走，B 車以每秒 3 米向左走。佢哋嘅速率同速度一唔一樣？', en: 'Cart A moves right at 3 m/s and cart B moves left at 3 m/s. Are their speeds and velocities the same?' },
        opts: [{ zh: '速率同速度都一樣', en: 'Same speed and same velocity' }, { zh: '速率一樣，但速度唔一樣', en: 'Same speed, different velocity' }, { zh: '速率同速度都唔一樣', en: 'Different speed and different velocity' }],
        ans: 1,
        why: { zh: '答案係：速率一樣，速度唔一樣！兩架車都係每秒 3 米，所以速率一樣。但係一架向右、一架向左，速度一個係正 3，一個係負 3，所以速度唔一樣。',
               en: 'The answer: same speed, different velocity! Both carts move at 3 m/s, so their speeds match. But one goes right and one goes left, so one velocity is plus 3 and the other is minus 3. Their velocities are different.' } },
      chain: [{ zh: '速率：只有大小', en: 'Speed: size only' }, { zh: '速度：大小 + 方向', en: 'Velocity: size + direction' }, { zh: '速度是向量', en: 'Velocity is a vector' }],
      items: [21, 24, 25] },

    { id: 'momentum', who: 'chan', title: { zh: '動量', en: 'Momentum' },
      say: { zh: '我哋再由最基本諗起：咩嘢會令一次撞擊更加犀利？第一，越重越犀利；第二，越快越犀利。物理學家將兩樣加埋，叫佢做動量。',
             en: "Let's think from the basics again: what makes a crash more powerful? One, heavier means more powerful. Two, faster means more powerful. Physicists combine the two and call it momentum." },
      quiz: { q: { zh: '三個波都以每秒 1 米慢慢碌過嚟，邊個嘅動量最大？', en: 'Three balls all roll towards you slowly at 1 m/s. Which has the most momentum?' },
        opts: [{ zh: '乒乓波', en: 'A ping-pong ball' }, { zh: '網球', en: 'A tennis ball' }, { zh: '保齡球', en: 'A bowling ball' }],
        ans: 2,
        why: { zh: '答案係：保齡球！三個波一樣快，但保齡球最重，所以動量最大，撞落腳度都係佢最痛。',
               en: 'The answer: the bowling ball! All three move at the same speed, but the bowling ball is the heaviest, so it has the most momentum. If it hit your foot, it would hurt the most.' } },
      adv: { zh: '動量 p = m × v，單位係 kg·m/s。動量都係向量，有方向。', en: 'Momentum p = m × v, measured in kg·m/s. Momentum is a vector too, so it has a direction.' },
      chain: [{ zh: '質量越大', en: 'More mass' }, { zh: '速度越快', en: 'More speed' }, { zh: '動量越大', en: 'More momentum' }],
      items: [44] },

    { id: 'conserve-predict', who: 'chan', title: { zh: '動量守恆：估一估', en: 'Conservation of momentum: predict' },
      say: { zh: '而家好玩喇！兩架車一樣重，都係 2 kg，碰撞方式揀完全彈開。A 車去撞停定喺度嘅 B 車。',
             en: "Now for the fun part! Both carts weigh the same, 2 kg each, set to super bouncy. Cart A crashes into cart B, which is standing still." },
      cond: [{ zh: '兩車質量相同（2 kg）', en: 'Same mass (2 kg each)' }, { zh: '完全彈開（e = 1）', en: 'Super bouncy (e = 1)' }, { zh: 'B 車原本靜止', en: 'Cart B starts still' }, { zh: '沒有摩擦力', en: 'No friction' }],
      setup: { xA: -4, xB: 0 }, lock: ALL, graph: 'p',
      quiz: { q: { zh: '撞完之後會點？', en: 'What happens after the crash?' },
        opts: [{ zh: '兩架車一齊向前走', en: 'Both carts move forward together' }, { zh: 'A 車停低，B 車用 A 車原本嘅速度衝出去', en: "Cart A stops, and cart B shoots off at A's old speed" }, { zh: 'A 車彈返轉頭，B 車唔郁', en: 'Cart A bounces back, and cart B stays still' }],
        ans: 1, run: [['push', 0]], watch: 2.4,
        why: { zh: '答案係：A 車停低，B 車接力衝出去！好似接力賽交棒咁，A 車將佢全部嘅動量交晒俾 B 車。睇吓動量–時間圖：黑色嘅總動量線一直都係平嘅。',
               en: 'The answer: cart A stops and cart B takes over, like passing the baton in a relay race. Cart A hands all its momentum to cart B. Look at the momentum–time graph: the black total momentum line stays flat the whole time.' } },
      chain: [{ zh: 'A 車停下', en: 'Cart A stops' }, { zh: 'A 的動量全部交給 B', en: "All of A's momentum goes to B" }, { zh: '總動量不變', en: 'Total momentum stays the same' }],
      items: [46, 47] },

    { id: 'conserve-why', who: 'chan', title: { zh: '為甚麼動量守恆？', en: 'Why is momentum conserved?' },
      say: { zh: '點解總動量唔會變？我哋用返之前學過嘅嘢推理：第一，撞車時 A 推 B 同 B 推 A 嘅力一樣大、方向相反；第二，兩個力推嘅時間一樣長；所以，A 失去幾多動量，B 就得到幾多動量。總數唔會多，亦唔會少。好似兩個小朋友交換波子，波子總數一直都一樣。不過要記住一個條件：冇外力，例如冇摩擦力。',
             en: "Why doesn't the total momentum change? Let's reason from what we already know. One: during the crash, A pushes B exactly as hard as B pushes A, in opposite directions. Two: both pushes last the same amount of time. So whatever momentum A loses, B gains. The total never goes up or down. It's like two kids swapping marbles: the total number of marbles stays the same. But remember one condition: no outside force, such as friction." },
      adv: { zh: 'Δp_A = −Δp_B，所以 p_A + p_B 保持不變，呢個叫動量守恆定律。', en: 'Δp_A = −Δp_B, so p_A + p_B stays constant. This is the law of conservation of momentum.' },
      cond: [{ zh: '條件：沒有外力（例如沒有摩擦力）', en: 'Condition: no outside force (e.g. no friction)' }],
      chain: [{ zh: '兩個力一樣大、方向相反', en: 'Equal and opposite forces' }, { zh: '推的時間一樣長', en: 'Same contact time' }, { zh: 'A 失去的動量 = B 得到的動量', en: 'Momentum A loses = momentum B gains' }, { zh: '總動量不變', en: 'Total momentum stays the same' }],
      graph: 'p', items: [46] },

    { id: 'inelastic-predict', who: 'ming', title: { zh: '非彈性碰撞：估一估', en: 'Inelastic collision: predict' },
      say: { zh: '咁如果兩架車撞完黐埋一齊呢？我哋將碰撞方式改做黏在一起，其他條件同上次一樣。',
             en: "What if the carts stick together after the crash? We'll switch to stick together and keep everything else the same as last time." },
      cond: [{ zh: '只改變：碰撞方式（彈開 → 黏在一起）', en: 'Only change: bounce → stick together' }, { zh: '保持不變：質量、推力、沒有摩擦力', en: 'Kept the same: masses, push, no friction' }],
      setup: { e: 0, xA: -4, xB: 0 }, lock: ALL, graph: 'p',
      quiz: { q: { zh: '兩架車黐埋之後，會用咩速度一齊郁？', en: 'After sticking together, how fast do the two carts move?' },
        opts: [{ zh: '用 A 車原本嘅速度', en: "At cart A's original speed" }, { zh: '用 A 車原本速度嘅一半', en: "At half of cart A's original speed" }, { zh: '兩架車一齊停低', en: 'They both stop' }],
        ans: 1, run: [['push', 0]], watch: 2.4,
        why: { zh: '答案係：一半速度！總動量要保持不變，但係而家要郁嘅質量多咗一倍，由 2 kg 變成 4 kg，所以速度就要減一半。',
               en: 'The answer: half the speed! The total momentum must stay the same, but now twice the mass is moving, 4 kg instead of 2 kg, so the speed has to halve.' } },
      chain: [{ zh: '總動量不變', en: 'Total momentum stays the same' }, { zh: '移動的質量加倍', en: 'Twice the mass is moving' }, { zh: '速度減半', en: 'Speed halves' }],
      items: [47] },

    { id: 'energy-teach', who: 'chan', title: { zh: '教小明：動能去了哪裏？', en: 'Teach Ming: where did the energy go?' },
      say: { zh: '睇吓動能–時間圖：黐埋之後，總動能少咗一半！小明有個諗法，你幫老師判斷吓佢啱唔啱。',
             en: "Check the kinetic energy–time graph: after sticking, the total kinetic energy dropped by half! Ming has an idea. Help me judge whether he's right." },
      setup: { e: 0, xA: -4, xB: 0 }, lock: ALL, graph: 'k', pre: [['wait', 0.4], ['push', 0]],
      quiz: { q: { zh: '小明話：「撞完之後動能少咗，所以動量都一定少咗。」小明啱唔啱？', en: "Ming says: 'After the crash the kinetic energy went down, so the momentum must have gone down too.' Is Ming right?" },
        opts: [{ zh: '啱，兩樣一齊少咗', en: 'Yes, both went down' }, { zh: '唔啱，動量冇變，少咗嘅動能變咗做熱同聲音', en: 'No. Momentum stayed the same, and the lost kinetic energy became heat and sound' }, { zh: '唔啱，動量同動能都冇變', en: 'No. Neither momentum nor kinetic energy changed' }],
        ans: 1,
        why: { zh: '答案係：小明唔啱！動量一直守恆，但動能可以變成其他能量。撞嗰陣車身會變形、會嘭一聲、會有少少熱，少咗嘅動能就係變咗做呢啲能量。能量冇消失，只係轉咗形式。完全彈開嘅碰撞叫彈性碰撞，動能冇損失；黐埋或者冇完全彈開，就叫非彈性碰撞。',
               en: "The answer: Ming is wrong! Momentum is always conserved, but kinetic energy can change into other forms. In the crash, the carts dent, go bang and warm up a little. That's where the missing kinetic energy went. Energy doesn't vanish; it just changes form. A perfectly bouncy crash is called an elastic collision and loses no kinetic energy. Sticking together, or not bouncing fully, is called an inelastic collision." } },
      adv: { zh: '動能 KE = ½mv²。撞之前：½ × 2 × 3² = 9 J；撞之後：½ × 4 × 1.5² = 4.5 J。', en: 'Kinetic energy KE = ½mv². Before: ½ × 2 × 3² = 9 J. After: ½ × 4 × 1.5² = 4.5 J.' },
      chain: [{ zh: '非彈性碰撞', en: 'Inelastic collision' }, { zh: '部分動能變成熱和聲音', en: 'Some kinetic energy becomes heat and sound' }, { zh: '總動能減少，總動量不變', en: 'Total KE drops; total momentum stays' }],
      items: [40, 47, 38] },

    { id: 'airbag', who: 'chan', title: { zh: '安全氣袋', en: 'Airbags' },
      say: { zh: '最後用物理解釋生活。車撞停嗰陣，你嘅動量一定要由好大變成零，呢個改變係避唔到嘅。不過，用幾耐時間去改變，就可以控制。',
             en: "Finally, let's use physics to explain real life. When a car crashes to a stop, your momentum must go from big to zero. That change can't be avoided. But how long the change takes is something we can control." },
      quiz: { q: { zh: '安全氣袋係點樣保護你？', en: 'How does an airbag protect you?' },
        opts: [{ zh: '令你嘅動量變細咗', en: 'It makes your momentum smaller' }, { zh: '令你用長啲嘅時間停低，所以撞擊力細咗', en: 'It makes you take longer to stop, so the force is smaller' }, { zh: '令架車變得更重', en: 'It makes the car heavier' }],
        ans: 1,
        why: { zh: '答案係：令你用長啲時間停低！動量要改變嘅總數係一樣嘅，如果用長啲時間慢慢改變，每一刻嘅力就細好多。就好似你跳落地嗰陣會屈膝，都係同一個道理。',
               en: 'The answer: it makes you take longer to stop! The total change in momentum is the same, but spreading it over a longer time makes the force at each moment much smaller. It is the same reason you bend your knees when you land from a jump.' } },
      adv: { zh: '淨力 = 動量改變 ÷ 時間，即係 F = Δp / Δt。時間 Δt 越長，力 F 越細。', en: 'Net force = change in momentum ÷ time, or F = Δp / Δt. The longer the time Δt, the smaller the force F.' },
      chain: [{ zh: '動量的改變相同', en: 'Same change in momentum' }, { zh: '停下的時間變長', en: 'Longer time to stop' }, { zh: '撞擊力變小', en: 'Smaller force' }],
      items: [45] },

    { id: 'free', who: 'ming', title: { zh: '自由實驗', en: 'Free play' },
      say: { zh: '自由實驗時間！打開工具箱，所有參數都可以調：車嘅質量、推力、彈力、摩擦力，仲可以用慢動作睇清楚。試吓輕車撞重車，再試吓重車撞輕車，睇吓有咩唔同。',
             en: 'Free play time! Open the toolbox and adjust everything: cart masses, push strength, bounciness and friction. You can even use slow motion to see more clearly. Try a light cart hitting a heavy one, then a heavy cart hitting a light one, and spot the difference.' },
      task: { zh: '自由調校參數，做你自己的實驗', en: 'Adjust any settings and run your own experiments' },
      setup: { mA: 1, mB: 4, xA: -4, xB: 0 }, graph: 'v',
      demo: [['openTools'], ['wait', 0.5], ['push', 0], ['wait', 3], ['again'], ['set', 'mA', 4], ['set', 'mB', 1], ['wait', 0.8], ['push', 0], ['wait', 3]] },

    { id: 'summary', who: 'chan', title: { zh: '輪到你做老師', en: 'Your turn to teach' },
      say: { zh: '做得好好！而家輪到你做老師，試吓用你自己嘅說話，講返呢四個重點俾屋企人聽：第一，冇外力，郁緊嘅嘢會一直郁。第二，同樣嘅力，越重越難改變速度。第三，你推我，我就用一樣大嘅力推返你。第四，冇外力嘅時候，撞車前後總動量不變。',
             en: "Great job! Now it's your turn to be the teacher. Try explaining these four big ideas to your family in your own words. One: with no outside force, a moving thing keeps moving. Two: with the same force, heavier things are harder to speed up. Three: if you push me, I push you back just as hard. Four: with no outside force, the total momentum stays the same before and after a crash." },
      chain: [{ zh: '第一定律：慣性', en: '1st law: inertia' }, { zh: '第二定律：F = ma', en: '2nd law: F = ma' }, { zh: '第三定律：力成對出現', en: '3rd law: forces come in pairs' }, { zh: '動量守恆', en: 'Momentum is conserved' }],
      finish: true }
  ];

  /* =====================================================================
   * 3D 場景
   * ===================================================================== */
  const group = new THREE.Group();
  ctx.scene.add(group);
  const std = (color, rough = 0.6, metal = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
  const hiddenMat = new THREE.MeshBasicMaterial({ visible: false });
  function mesh(geo, mat, x, y, z, parent = group) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
    parent.add(m); return m;
  }
  const pickables = []; // { obj, kind, id }
  let bedMat, cartViews = [], people = [], fx = {};

  function canvasTex(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  }

  function mount() {
    // 地板（實驗室地磚）
    const tiles = canvasTex(512, 512, (g, w, h) => {
      g.fillStyle = '#eef2f7'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#d5dde8'; g.lineWidth = 4;
      for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 128); g.lineTo(w, i * 128); g.stroke(); }
    });
    tiles.wrapS = tiles.wrapT = THREE.RepeatWrapping; tiles.repeat.set(12, 12);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(48, 48), new THREE.MeshStandardMaterial({ map: tiles, roughness: 0.9 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; group.add(floor);

    // 後牆 + 窗
    mesh(new THREE.BoxGeometry(48, 9, 0.2), std(0xf8fafc, 0.95), 0, 4.5, -7.5).castShadow = false;
    mesh(new THREE.BoxGeometry(48, 0.6, 0.25), std(0xcbd5e1, 0.8), 0, 0.3, -7.38);
    for (const x of [-11, 11]) {
      mesh(new THREE.BoxGeometry(4.2, 3.2, 0.1), std(0xbae6fd, 0.2, 0, { emissive: 0x7dd3fc, emissiveIntensity: 0.35 }), x, 4.4, -7.36);
      mesh(new THREE.BoxGeometry(4.5, 0.15, 0.2), std(0xffffff), x, 2.75, -7.3);
      mesh(new THREE.BoxGeometry(0.12, 3.2, 0.14), std(0xffffff), x, 4.4, -7.3);
    }

    // 黑板
    const board = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.1), new THREE.MeshStandardMaterial({ map: boardTex(), roughness: 0.95 }));
    board.position.set(0, 3.2, -7.35); group.add(board);
    mesh(new THREE.BoxGeometry(8.3, 3.4, 0.08), std(0x92400e, 0.8), 0, 3.2, -7.42);
    pickables.push({ obj: board, kind: 'board' });

    // 實驗儀器櫃（裝飾）
    const shelf = new THREE.Group(); shelf.position.set(-8.6, 0, -6.4); group.add(shelf);
    mesh(new THREE.BoxGeometry(3.2, 2.2, 1), std(0xe2e8f0, 0.7), 0, 1.1, 0, shelf);
    mesh(new THREE.BoxGeometry(3.3, 0.08, 1.05), std(0x94a3b8, 0.5), 0, 2.24, 0, shelf);
    const glass = std(0x93c5fd, 0.05, 0, { transparent: true, opacity: 0.55 });
    [[-1.1, 0x22c55e], [-0.4, 0xf97316], [0.4, 0xa855f7], [1.1, 0x06b6d4]].forEach(([x, c], i) => {
      mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.5, 20), glass, x, 2.53, 0, shelf);
      mesh(new THREE.CylinderGeometry(0.15, 0.19, 0.25, 20), std(c, 0.3, 0, { transparent: true, opacity: 0.8 }), x, 2.42, 0, shelf);
      if (i % 2) mesh(new THREE.SphereGeometry(0.22, 20, 14), glass, x, 2.95, 0, shelf);
    });

    // 軌道底座（顏色隨摩擦力改變）
    bedMat = std(0xbfe9ff, 0.08, 0.1);
    const bed = mesh(new THREE.BoxGeometry(13, 0.1, 1.6), bedMat, 0, 0.05, 0);
    pickables.push({ obj: bed, kind: 'floor' });
    const railMat = std(0x94a3b8, 0.3, 0.6);
    for (const z of [-0.55, 0.55]) mesh(new THREE.BoxGeometry(12.6, 0.08, 0.06), railMat, 0, 0.14, z);
    // 米尺（有數字，配合位置–時間圖）
    const ruler = new THREE.Mesh(new THREE.PlaneGeometry(12.4, 0.36), new THREE.MeshStandardMaterial({ map: rulerTex(), roughness: 0.8 }));
    ruler.rotation.x = -Math.PI / 2; ruler.position.set(0, 0.104, 0.98); ruler.receiveShadow = true; group.add(ruler);
    mesh(new THREE.BoxGeometry(12.6, 0.1, 0.42), std(0xffffff, 0.8), 0, 0.05, 0.98);
    // 兩端緩衝器
    for (const s of [-1, 1]) {
      const b = mesh(new THREE.BoxGeometry(0.3, 0.45, 1.4), std(0xfacc15), s * 6.15, 0.32, 0);
      mesh(new THREE.BoxGeometry(0.04, 0.3, 1.2), std(0x1f2937, 0.9), s * 6.01, 0.32, 0);
      pickables.push({ obj: b, kind: 'buffer' });
    }

    cartViews = [buildCart(0), buildCart(1)];
    people = [
      makePerson({ key: 'chan', scale: 1, top: 0xffffff, bottom: 0x334155, hair: 0x1f2937, coat: true, glasses: true, bun: true, badge: 0x4f46e5 }),
      makePerson({ key: 'ming', scale: 0.75, top: 0xf8fafc, bottom: 0x1e3a8a, hair: 0x111827, shorts: true, bareLegs: true, tie: 0xdc2626 })
    ];
    people[0].g.position.set(-4.3, 0, -2.3); people[0].baseRotY = 0.45;
    people[1].g.position.set(4.3, 0, -2.3); people[1].baseRotY = -0.45;
    people.forEach((pp) => { group.add(pp.g); pickables.push({ obj: pp.hit, kind: 'person', id: pp.key }); });

    // 碰撞特效
    const fa = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(), 1, 0xf97316, 0.3, 0.22);
    const fb = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1, 0xf97316, 0.3, 0.22);
    fa.visible = fb.visible = false; group.add(fa, fb);
    const tagEl = document.createElement('div'); tagEl.className = 'force-tag';
    const tag = new CSS2DObject(tagEl); tag.visible = false; group.add(tag);
    const spark = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.18, 32),
      new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
    spark.visible = false; group.add(spark);
    const push = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 0.9, 0x22c55e, 0.3, 0.22);
    push.visible = false; group.add(push);
    fx = { fa, fb, tag, tagEl, spark, push, t: 0, len: 1, pushT: 0 };
    syncFloor();
  }

  function boardTex() {
    return canvasTex(1024, 400, (g) => {
      g.fillStyle = '#14532d'; g.fillRect(0, 0, 1024, 400);
      g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 3;
      for (let i = 0; i < 24; i++) { g.beginPath(); g.moveTo(Math.random() * 1024, Math.random() * 400); g.lineTo(Math.random() * 1024, Math.random() * 400); g.stroke(); }
      g.textAlign = 'center'; g.fillStyle = '#f8fafc';
      g.font = 'bold 62px "Chalkboard SE", "Comic Sans MS", sans-serif';
      g.fillText('F = ma', 190, 120); g.fillText('p = mv', 512, 120); g.fillText('KE = ½mv²', 835, 120);
      g.fillStyle = '#fde68a'; g.font = 'bold 42px "Chalkboard SE", "PingFang HK", sans-serif';
      g.fillText("Newton's Laws · 牛頓定律", 512, 225);
      const arrow = (x1, x2, y) => { g.beginPath(); g.moveTo(x1, y); g.lineTo(x2, y); g.stroke(); const d = Math.sign(x2 - x1);
        g.beginPath(); g.moveTo(x2, y); g.lineTo(x2 - d * 26, y - 16); g.lineTo(x2 - d * 26, y + 16); g.closePath(); g.fill(); };
      g.fillStyle = '#ef4444'; g.fillRect(400, 300, 90, 50); g.fillStyle = '#3b82f6'; g.fillRect(534, 300, 90, 50);
      g.strokeStyle = '#fdba74'; g.fillStyle = '#fdba74'; g.lineWidth = 8;
      arrow(390, 250, 325); arrow(634, 774, 325);
    });
  }
  function rulerTex() {
    return canvasTex(2048, 64, (g, w, h) => {
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
      const px = (x) => ((x + 6.2) / 12.4) * w;
      g.strokeStyle = '#334155'; g.fillStyle = '#334155'; g.textAlign = 'center';
      g.font = 'bold 26px -apple-system, sans-serif';
      for (let i = -12; i <= 12; i++) {
        const x = px(i / 2), major = i % 2 === 0;
        g.lineWidth = major ? 3 : 2; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, major ? 26 : 14); g.stroke();
        if (major) g.fillText((i / 2 > 0 ? '+' : '') + i / 2 + (i === 12 ? ' m' : ''), x, 56);
      }
    });
  }

  function buildCart(id) {
    const color = id === 0 ? 0xef4444 : 0x3b82f6, facing = id === 0 ? 1 : -1;
    const g = new THREE.Group(); group.add(g);
    mesh(new THREE.BoxGeometry(PH.L * 0.92, 0.28, 0.7), std(color, 0.45), 0, 0.44, 0, g);
    mesh(new THREE.BoxGeometry(PH.L * 0.93, 0.05, 0.71), std(0xffffff, 0.5), 0, 0.5, 0, g);
    const wheelGeo = new THREE.CylinderGeometry(PH.WR, PH.WR, 0.08, 20); wheelGeo.rotateX(Math.PI / 2);
    const wheels = [];
    for (const sx of [-0.3, 0.3]) for (const sz of [-0.36, 0.36]) {
      const w = mesh(wheelGeo, std(0x1f2937, 0.8), sx, 0.22, sz, g);
      mesh(new THREE.BoxGeometry(0.16, 0.03, 0.085), std(0xe5e7eb), 0, 0, 0, w);
      wheels.push(w);
    }
    const springGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.06, 14); springGeo.rotateZ(Math.PI / 2);
    const spring = mesh(springGeo, std(0xfacc15, 0.4), facing * 0.48, 0.44, 0, g);
    const velcro = mesh(new THREE.BoxGeometry(0.04, 0.24, 0.55), std(0x92400e, 1), facing * 0.475, 0.44, 0, g);
    const weights = [];
    for (let i = 0; i < 10; i++) weights.push(mesh(new THREE.BoxGeometry(0.42, 0.13, 0.42), std(0x64748b, 0.35, 0.5), 0, 0.655 + i * 0.145, 0, g));
    const arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1.75, 0), 1, color, 0.28, 0.2);
    arrow.visible = false; g.add(arrow);
    const hit = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.9, 1.3), hiddenMat);
    hit.position.y = 0.95; g.add(hit);
    pickables.unshift({ obj: hit, kind: 'cart', id });
    const tagEl = document.createElement('div'); tagEl.className = 'cart-tag';
    const tag = new CSS2DObject(tagEl); tag.position.set(0, id === 0 ? 2.2 : 2.95, 0); g.add(tag); // 兩車標籤上下錯開，靠近時不重疊
    return { g, wheels, spring, velcro, weights, arrow, tagEl, prevX: carts[id].x };
  }

  function makePerson(o) {
    const g = new THREE.Group();
    const skin = std(0xf2c9a0, 0.7), hair = std(o.hair, 0.9), top = std(o.top, 0.7), bottom = std(o.bottom, 0.7);
    for (const sx of [-0.1, 0.1]) {
      mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.75, 12), o.bareLegs ? skin : bottom, sx, 0.375, 0, g);
      mesh(new THREE.BoxGeometry(0.14, 0.08, 0.26), std(0x334155), sx, 0.04, 0.04, g);
    }
    if (o.shorts) mesh(new THREE.CylinderGeometry(0.23, 0.25, 0.26, 16), bottom, 0, 0.72, 0, g);
    if (o.coat) mesh(new THREE.CylinderGeometry(0.26, 0.32, 0.45, 16), top, 0, 0.78, 0, g);
    mesh(new THREE.CapsuleGeometry(0.24, 0.42, 6, 16), top, 0, 1.12, 0, g);
    if (o.badge) mesh(new THREE.BoxGeometry(0.08, 0.08, 0.02), std(o.badge), 0.1, 1.3, 0.235, g);
    if (o.tie) mesh(new THREE.BoxGeometry(0.06, 0.26, 0.02), std(o.tie), 0, 1.25, 0.24, g);
    const arms = [];
    for (const sx of [-1, 1]) {
      const piv = new THREE.Group(); piv.position.set(sx * 0.31, 1.45, 0); g.add(piv);
      mesh(new THREE.CapsuleGeometry(0.065, 0.4, 4, 10), top, 0, -0.26, 0, piv);
      mesh(new THREE.SphereGeometry(0.075, 12, 10), skin, 0, -0.53, 0, piv);
      piv.rotation.z = sx * 0.12; arms.push(piv);
    }
    const head = new THREE.Group(); head.position.set(0, 1.78, 0); g.add(head);
    mesh(new THREE.SphereGeometry(0.22, 24, 18), skin, 0, 0, 0, head);
    const cap = mesh(new THREE.SphereGeometry(0.235, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), hair, 0, 0.01, -0.01, head);
    cap.rotation.x = -0.35;
    if (o.bun) mesh(new THREE.SphereGeometry(0.1, 14, 12), hair, 0, 0.16, -0.17, head);
    for (const sx of [-0.08, 0.08]) mesh(new THREE.SphereGeometry(0.028, 10, 8), std(0x111827, 0.3), sx, 0.02, 0.2, head);
    const smile = mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 16, Math.PI), std(0xbe123c), 0, -0.07, 0.2, head);
    smile.rotation.z = Math.PI;
    for (const sx of [-0.13, 0.13]) mesh(new THREE.SphereGeometry(0.035, 10, 8), std(0xfda4af), sx, -0.04, 0.17, head);
    if (o.glasses) {
      const gm = std(0x1e293b, 0.4);
      for (const sx of [-0.08, 0.08]) mesh(new THREE.TorusGeometry(0.055, 0.01, 8, 20), gm, sx, 0.02, 0.215, head);
      mesh(new THREE.BoxGeometry(0.05, 0.01, 0.01), gm, 0, 0.03, 0.215, head);
    }
    const hit = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 2.1, 12), hiddenMat); hit.position.y = 1.05; g.add(hit);
    const tagEl = document.createElement('div'); tagEl.className = 'name-tag';
    const tag = new CSS2DObject(tagEl); tag.position.set(0, 2.3, 0); g.add(tag);
    g.scale.setScalar(o.scale);
    return { g, head, arms, hit, tagEl, key: o.key, phase: Math.random() * 6, waveT: 0, jumpT: 0, baseRotY: 0 };
  }

  function syncFloor() {
    if (!bedMat) return;
    const v = p.mu;
    const [c, r] = v === 0 ? [0xbfe9ff, 0.08] : v <= 0.1 ? [0xe2e8f0, 0.4] : v <= 0.25 ? [0xc08457, 0.85] : [0x9a3412, 1];
    bedMat.color.set(c); bedMat.roughness = r;
  }

  /* =====================================================================
   * 物理（一維碰撞，含恢復係數 e 與摩擦力 μ）
   * ===================================================================== */
  function applyFriction(c, dt, both) {
    if (p.mu <= 0 || c.v === 0) return;
    const dv = p.mu * PH.G * dt;
    if (Math.abs(c.v) <= dv) {
      c.v = 0;
      if (both) { carts[1].v = 0; ctx.emit('rest', { id: 0 }); ctx.emit('rest', { id: 1 }); }
      else ctx.emit('rest', { id: c.id });
    } else c.v -= Math.sign(c.v) * dv;
  }
  function wall(c) {
    if (c.x < XMIN) { c.x = XMIN; if (c.v < 0) { c.v = -c.v * PH.WALL_E; ctx.sfx('tick'); } }
    if (c.x > XMAX) { c.x = XMAX; if (c.v > 0) { c.v = -c.v * PH.WALL_E; ctx.sfx('tick'); } }
  }
  function step(dt) {
    const [a, b] = carts;
    if (S.stuck && p.showB) {
      applyFriction(a, dt, true);
      a.x += a.v * dt;
      if (a.x < XMIN) { a.x = XMIN; if (a.v < 0) a.v = -a.v * PH.WALL_E; }
      if (a.x + PH.L > XMAX) { a.x = XMAX - PH.L; if (a.v > 0) a.v = -a.v * PH.WALL_E; }
      b.x = a.x + PH.L; b.v = a.v;
      return;
    }
    for (const c of carts) {
      if (c.id === 1 && !p.showB) continue;
      if (c.id === S.drag) continue;
      applyFriction(c, dt); c.x += c.v * dt; wall(c);
    }
    if (!p.showB) return;
    const gap = b.x - a.x - PH.L;
    if (gap >= 0) return;
    if (S.drag >= 0) {
      const free = S.drag === 0 ? b : a, dir = S.drag === 0 ? 1 : -1;
      if (free === b) b.x = a.x + PH.L; else a.x = b.x - PH.L;
      if (free.v * dir < 0) free.v = -free.v * 0.5;
      wall(free); return;
    }
    if (a.v - b.v > 0) collide(a, b);
    const ov = -gap; a.x -= ov / 2; b.x += ov / 2;
    if (a.x < XMIN) { a.x = XMIN; b.x = Math.max(b.x, a.x + PH.L); }
    if (b.x > XMAX) { b.x = XMAX; a.x = Math.min(a.x, b.x - PH.L); }
  }
  function collide(a, b) {
    const mA = p.mA, mB = p.mB, M = mA + mB, vA = a.v, vB = b.v, P = mA * vA + mB * vB;
    let nA, nB;
    if (p.e === 0) { nA = nB = P / M; S.stuck = true; }
    else { nA = (P + mB * p.e * (vB - vA)) / M; nB = (P + mA * p.e * (vA - vB)) / M; }
    a.v = nA; b.v = nB;
    const before = { P, KE: 0.5 * mA * vA * vA + 0.5 * mB * vB * vB };
    const after = { P: mA * nA + mB * nB, KE: 0.5 * mA * nA * nA + 0.5 * mB * nB * nB };
    const dp = mB * (nB - vB);
    S.lastCrash = { before, after, dp };
    H.ev.push({ t: S.simT, type: 'crash' });
    const x = (a.x + b.x) / 2;
    fx.t = 0.9; fx.len = clamp(Math.abs(dp) * 0.3, 0.6, 2.2); fx.dp = dp;
    fx.fa.position.set(x - 0.05, 0.95, 0); fx.fb.position.set(x + 0.05, 0.95, 0);
    fx.tag.position.set(x, 1.55, 0); fx.spark.position.set(x, 0.6, 0);
    people[1].jumpT = 0.6;
    ctx.sfx('crash');
    ctx.emit('crash', { dp, e: p.e });
  }
  function push(id) {
    if (id === 1 && !p.showB) return;
    if (S.drag === id) return;
    const dir = id === 0 ? 1 : -1;
    if (S.stuck && p.showB) {
      const dv = (dir * p.J) / (p.mA + p.mB);
      carts.forEach((c) => (c.v = clamp(c.v + dv, -PH.VMAX, PH.VMAX)));
    } else {
      const c = carts[id], m = id === 0 ? p.mA : p.mB;
      c.v = clamp(c.v + (dir * p.J) / m, -PH.VMAX, PH.VMAX);
    }
    const c = carts[id];
    fx.push.position.set(c.x - dir * 1.35, 0.44, 0); fx.push.setDirection(new THREE.Vector3(dir, 0, 0));
    fx.push.visible = true; fx.pushT = 0.5;
    ctx.sfx('pop');
    ctx.emit('push', { id });
  }

  function sample() {
    const [a, b] = carts, sb = p.showB;
    const pA = p.mA * a.v, pB = sb ? p.mB * b.v : NaN;
    const kA = 0.5 * p.mA * a.v * a.v, kB = sb ? 0.5 * p.mB * b.v * b.v : NaN;
    const row = { xA: a.x, xB: sb ? b.x : NaN, vA: a.v, vB: sb ? b.v : NaN, pA, pB, pT: pA + (sb ? pB : 0), kA, kB, kT: kA + (sb ? kB : 0) };
    H.t.push(S.simT);
    for (const k in H.c) H.c[k].push(row[k]);
    if (H.t.length > 1800) { H.t.shift(); for (const k in H.c) H.c[k].shift(); }
  }

  function resetMotion() {
    carts[0].x = S.home.xA; carts[1].x = p.showB ? S.home.xB : 60;
    carts.forEach((c) => (c.v = 0));
    S.stuck = false; S.lastCrash = null; S.simT = 0; S.lastSample = -1;
    fx.t = 0; fx.pushT = 0;
    H = newHist();
  }
  function apply(s = {}) {
    Object.assign(p, DEF);
    for (const k of Object.keys(DEF)) if (s[k] !== undefined) p[k] = s[k];
    S.home = { xA: s.xA ?? -3, xB: s.xB ?? 1.5 };
    ghost = null; resetMotion(); syncFloor();
  }
  function again() {
    if (H.t.length > 10) ghost = H;
    resetMotion();
  }
  function setParam(k, v) {
    p[k] = v;
    if (k === 'mu') syncFloor();
    if (k === 'e' && v !== 0) S.stuck = false;
    if (k === 'showB') { S.stuck = false; carts[1].v = 0; carts[1].x = v ? Math.max(S.home.xB, carts[0].x + PH.L + 0.5) : 60; if (v && carts[1].x > XMAX) carts[1].x = XMAX; }
    ctx.emit('param', { key: k, value: v });
  }
  function act(a) {
    if (a[0] === 'push') push(a[1]);
    else if (a[0] === 'set') setParam(a[1], a[2]);
    else if (a[0] === 'again') again();
  }

  /* =====================================================================
   * 每幀更新
   * ===================================================================== */
  const tmp = new THREE.Vector3();
  function update(dt, time) {
    const sdt = dt * p.slow;
    const n = Math.max(1, Math.ceil(sdt / (1 / 240)));
    for (let i = 0; i < n; i++) { step(sdt / n); S.simT += sdt / n; if (S.simT - S.lastSample >= 1 / 30) { S.lastSample = S.simT; sample(); } }

    cartViews.forEach((v, i) => {
      const c = carts[i];
      v.g.visible = i === 0 || p.showB;
      c.lift += ((S.drag === i ? 0.35 : 0) - c.lift) * Math.min(1, dt * 12);
      v.g.position.set(c.x, c.lift, 0);
      const dx = c.x - v.prevX; v.prevX = c.x;
      if (Math.abs(dx) < 2) v.wheels.forEach((w) => (w.rotation.z -= dx / PH.WR));
      const m = i === 0 ? p.mA : p.mB, full = Math.floor(m), half = m - full >= 0.5;
      v.weights.forEach((w, k) => { w.visible = k < full + (half ? 1 : 0); w.scale.y = k === full && half ? 0.5 : 1; w.position.y = 0.655 + Math.min(k, full) * 0.145 - (k === full && half ? 0.035 : 0); });
      v.spring.visible = p.e !== 0; v.velcro.visible = p.e === 0;
      const show = ctx.adv() && Math.abs(c.v) > 0.05 && v.g.visible;
      v.arrow.visible = show;
      if (show) {
        const len = Math.min(0.45 + Math.abs(c.v) * 0.4, 3.2);
        v.arrow.setDirection(tmp.set(Math.sign(c.v), 0, 0));
        v.arrow.setLength(len, Math.min(0.28, len * 0.5), 0.2);
      }
    });

    const talker = ctx.speaker();
    for (const pp of people) {
      const talking = talker === pp.key;
      let y = Math.sin(time * 2 + pp.phase) * 0.015;
      if (pp.jumpT > 0) { pp.jumpT -= dt; y += Math.sin(clamp(1 - pp.jumpT / 0.6, 0, 1) * Math.PI) * 0.35; }
      pp.g.position.y = y; pp.g.rotation.y = pp.baseRotY;
      pp.head.rotation.x = talking ? Math.sin(time * 9) * 0.08 : Math.sin(time * 1.3 + pp.phase) * 0.03;
      pp.head.rotation.z = talking ? Math.sin(time * 4) * 0.05 : 0;
      const arm = pp.arms[1];
      if (pp.waveT > 0) { pp.waveT -= dt; arm.rotation.z = 2.6 + Math.sin(time * 14) * 0.35; }
      else if (talking) arm.rotation.z = 0.5 + Math.sin(time * 5) * 0.35;
      else arm.rotation.z += (0.12 - arm.rotation.z) * Math.min(1, dt * 6);
    }

    if (fx.t > 0) {
      fx.t -= dt;
      const k = Math.max(0, fx.t) / 0.9, on = fx.t > 0, len = fx.len * (1 + Math.sin((1 - k) * Math.PI) * 0.15);
      fx.fa.visible = fx.fb.visible = fx.tag.visible = fx.spark.visible = on;
      fx.fa.setLength(len, Math.min(0.3, len * 0.5), 0.22); fx.fb.setLength(len, Math.min(0.3, len * 0.5), 0.22);
      fx.spark.scale.setScalar(1 + (1 - k) * 4); fx.spark.material.opacity = k; fx.spark.lookAt(ctx.camera.position);
    }
    if (fx.pushT > 0) { fx.pushT -= dt; fx.push.visible = fx.pushT > 0; }
  }

  function labels() {
    cartViews.forEach((v, i) => {
      const c = carts[i], m = i === 0 ? p.mA : p.mB;
      v.tagEl.innerHTML = `<b>${L(i ? STR.cartB : STR.cartA)}</b> · ${m} kg` +
        (ctx.adv() ? `<div class="sub">v ${sg(c.v, 1)} m/s</div><div class="sub">p ${sg(m * c.v, 1)} kg·m/s</div>` : '');
    });
    people.forEach((pp) => (pp.tagEl.textContent = (pp.key === 'chan' ? '👩‍🔬 ' : '👦 ') + L(STR[pp.key])));
    fx.tagEl.textContent = L(STR.equal) + (ctx.adv() && fx.dp != null ? ` Δp = ±${Math.abs(fx.dp).toFixed(2)}` : '');
  }

  /* =====================================================================
   * 觸控：拖曳 / 拋出 / 輕按（推）／點物件看解說
   * ===================================================================== */
  const drag = { id: -1, pointer: null, off: 0, samples: [], t0: 0, sx: 0, sy: 0, moved: 0 };
  let tapCand = null;
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.44);
  const hitPt = new THREE.Vector3();
  const planeX = (ray) => (ray.ray.intersectPlane(dragPlane, hitPt) ? hitPt.x : null);

  function pointerDown(e, ray) {
    const hits = ray.intersectObjects(pickables.map((q) => q.obj), false);
    if (!hits.length) return false;
    const hit = pickables.find((q) => q.obj === hits[0].object);
    if (hit.kind === 'cart' && (hit.id === 0 || p.showB)) {
      const id = hit.id, px = planeX(ray);
      Object.assign(drag, { id, pointer: e.pointerId, off: px === null ? 0 : carts[id].x - px,
        samples: [{ x: carts[id].x, t: performance.now() }], t0: performance.now(), sx: e.clientX, sy: e.clientY, moved: 0 });
      S.drag = id; S.stuck = false; carts[id].v = 0;
      return true; // 由實驗室接管（暫停旋轉）
    }
    tapCand = { hit, x: e.clientX, y: e.clientY, t: performance.now() };
    return false;
  }
  function pointerMove(e, ray) {
    if (drag.pointer !== e.pointerId) return;
    const px = planeX(ray); if (px === null) return;
    const [a, b] = carts;
    let x = px + drag.off;
    if (drag.id === 0) x = Math.min(Math.max(x, XMIN), p.showB ? b.x - PH.L : XMAX);
    else x = Math.max(Math.min(x, XMAX), a.x + PH.L);
    carts[drag.id].x = x; carts[drag.id].v = 0;
    const now = performance.now();
    drag.samples.push({ x, t: now });
    while (drag.samples.length > 2 && now - drag.samples[0].t > 120) drag.samples.shift();
    drag.moved = Math.max(drag.moved, Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy));
  }
  function pointerUp(e) {
    if (tapCand) {
      const c = tapCand; tapCand = null;
      if (Math.hypot(e.clientX - c.x, e.clientY - c.y) < 10 && performance.now() - c.t < 450) objectInfo(c.hit);
    }
    if (drag.pointer !== e.pointerId) return;
    const id = drag.id, c = carts[id], now = performance.now();
    drag.id = -1; drag.pointer = null; S.drag = -1;
    if (drag.moved < 10 && now - drag.t0 < 350) { push(id); objectInfo({ kind: 'cart', id }); return; }
    const s = drag.samples, f = s[0], l = s[s.length - 1], dt = (l.t - f.t) / 1000;
    const v = dt > 0.01 && now - l.t < 100 ? (l.x - f.x) / dt : 0;
    c.v = clamp(v, -PH.VMAX, PH.VMAX);
    if (Math.abs(c.v) > 0.3) ctx.emit('push', { id, fling: true });
  }

  function objectInfo(h) {
    if (h.kind === 'cart') {
      const id = h.id, m = id === 0 ? p.mA : p.mB, v = carts[id].v, pm = m * v;
      ctx.info('cart' + id, () => L(id ? STR.cartB : STR.cartA), () => L({
        zh: `質量 ${m} kg，速度 ${sg(v)} m/s，動量 ${sg(pm)} kg·m/s。質量越大，慣性越大，越難改變它的速度。`,
        en: `Mass ${m} kg, velocity ${sg(v)} m/s, momentum ${sg(pm)} kg·m/s. The more mass, the more inertia, and the harder it is to change its speed.` }));
    } else if (h.kind === 'person') {
      const pp = people.find((q) => q.key === h.id); pp.waveT = 1.6;
      ctx.info(h.id, () => L(STR[h.id]), () => L(h.id === 'chan'
        ? { zh: '陳老師是物理學家，最喜歡問「為甚麼」。', en: 'Ms Chan is a physicist who loves asking why.' }
        : { zh: '小明讀小學四年級，最喜歡動手做實驗。', en: 'Ming is in Primary 4 and loves doing experiments.' }));
    } else if (h.kind === 'board') {
      ctx.info('board', () => L(STR.board), () => L({ zh: '黑板上有三條公式：F = ma 是牛頓第二定律；p = mv 是動量；KE = ½mv² 是動能。',
        en: "The blackboard shows three formulas: F = ma is Newton's second law, p = mv is momentum, and KE = ½mv² is kinetic energy." }));
    } else if (h.kind === 'floor') {
      const mu = p.mu;
      ctx.info('floor', () => L(STR.floor), () => L({ zh: `摩擦力 μ = ${mu}（${muWord(mu).zh}）。μ 越大，摩擦力越大，車子停得越快。`,
        en: `Friction μ = ${mu} (${muWord(mu).en}). The bigger μ is, the more friction there is and the sooner the cart stops.` }));
    } else if (h.kind === 'buffer') {
      ctx.info('buffer', () => L(STR.buffer), () => L({ zh: '車子撞到兩邊的緩衝器會反彈，但會損失一部分能量。', en: 'Carts bounce off the buffers at each end, but lose some energy each time.' }));
    }
  }

  function screenPos(id) {
    const v = new THREE.Vector3(carts[id].x, 0.7, 0).project(ctx.camera);
    return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight };
  }

  /* ---------------- 圖表語音說明 ---------------- */
  function describeGraph(id) {
    const n = H.t.length, last = (k) => (n ? H.c[k][n - 1] : 0), sb = p.showB;
    const z = ctx.lang() === 'zh';
    if (id === 'v') return z
      ? `呢個係速度–時間圖。橫軸係時間，直軸係速度。紅線係 A 車${sb ? '，藍線係 B 車' : ''}。線喺零上面代表向右，喺零下面代表向左。條線平，代表速度冇變；條線斜，代表速度改變緊。而家 A 車速度係 ${sg(last('vA'))} m/s${sb ? `，B 車係 ${sg(last('vB'))} m/s` : ''}。`
      : `This is a velocity–time graph. The horizontal axis is time and the vertical axis is velocity. The red line is cart A${sb ? ' and the blue line is cart B' : ''}. Above zero means moving right; below zero means moving left. A flat line means the velocity isn't changing; a sloping line means it is. Right now cart A's velocity is ${sg(last('vA'))} m/s${sb ? ` and cart B's is ${sg(last('vB'))} m/s` : ''}.`;
    if (id === 's') return z
      ? '呢個係位置–時間圖。直軸係車仔喺軌道上嘅位置，同軌道前面把米尺一樣。條線越斜，代表車郁得越快；條線平，代表車停咗。'
      : "This is a position–time graph. The vertical axis is the cart's position on the track, the same as the ruler in front of the track. The steeper the line, the faster the cart moves. A flat line means the cart has stopped.";
    if (id === 'p') return z
      ? `呢個係動量–時間圖。黑色線係兩架車加埋嘅總動量。冇摩擦力嘅時候，就算撞車，黑色線都會保持平，代表動量守恆。而家總動量係 ${sg(last('pT'))} kg·m/s。`
      : `This is a momentum–time graph. The black line is the total momentum of both carts. With no friction, the black line stays flat even through a crash: that's conservation of momentum. Right now the total momentum is ${sg(last('pT'))} kg·m/s.`;
    return z
      ? `呢個係動能–時間圖。黑色線係總動能。完全彈開嘅碰撞之後，總動能唔變；黐埋或者有摩擦力，總動能就會減少，變咗做熱同聲音。而家總動能係 ${last('kT').toFixed(2)} J。`
      : `This is a kinetic energy–time graph. The black line is the total kinetic energy. After a super bouncy crash the total stays the same; if the carts stick or there's friction, it drops, turning into heat and sound. Right now the total kinetic energy is ${last('kT').toFixed(2)} J.`;
  }

  return {
    id: 'collisions', icon: '🚗💥',
    title: { zh: '撞車實驗室：牛頓定律與動量', en: "Crash Lab: Newton's Laws & Momentum" },
    desc: { zh: '推車仔、撞車仔，親手發現牛頓三大定律和動量守恆。', en: "Push and crash carts to discover Newton's three laws and conservation of momentum." },
    stages, params, graphs, seriesName,
    mount, update, apply, again, act, labels, screenPos, describeGraph,
    pointerDown, pointerMove, pointerUp,
    show: (on) => (group.visible = on),
    getParam: (k) => p[k], setParam,
    paramWord: (k, v) => { const d = params.find((q) => q.key === k); return d && d.word ? L(d.word(v)) : ''; },
    hist: () => H, ghost: () => ghost, simTime: () => S.simT,
    camera: { pos: [0, 5.2, 10.5], target: [0, 0.7, 0] }
  };
}
