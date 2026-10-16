/* =====================================================================
 * 課程大綱（全部 132 項）＋ 開發路線圖
 * - phase：預計開放的「期數」（見 README / 對話中的路線圖）
 * - bench：用哪一個「實驗枱」（可重用的 3D 場景引擎）
 * - 每項格式：[編號, 中文, English]
 * - 某項是否「已開放」由實驗室（labs/*.js）裏 stages 的 items 自動決定
 * ===================================================================== */

export const BENCHES = {
  track:   { icon: '🛤️', zh: '軌道小車台', en: 'Track & carts bench' },
  heat:    { icon: '🫖', zh: '熱學實驗枱', en: 'Heat bench' },
  wave:    { icon: '🌊', zh: '波槽與彈簧', en: 'Ripple tank & slinky' },
  optics:  { icon: '🔦', zh: '光學枱', en: 'Optics bench' },
  circuit: { icon: '🔌', zh: '電路枱', en: 'Circuit bench' },
  field:   { icon: '🧲', zh: '電場磁場枱', en: 'Field bench' },
  atom:    { icon: '⚛️', zh: '原子實驗枱', en: 'Atom bench' }
};

// 部分涵蓋（已有實驗提及，但未有專屬步驟）
export const PARTIAL = [32, 38, 40];

export const TOPICS = [
  {
    id: 1, icon: '🔥', color: '#f97316',
    name: { zh: '熱學', en: 'Heat' },
    desc: { zh: '研究冷和熱：為甚麼熱湯會慢慢變涼？為甚麼水煮沸後會變成蒸氣？', en: 'Hot and cold: why does hot soup cool down, and why does boiling water turn into steam?' },
    subs: [
      { id: '1.1', phase: 5, bench: 'heat', name: { zh: '溫度、熱和內能', en: 'Temperature, heat and internal energy' }, items: [
        [1, '溫度的定義', 'Definition of temperature'],
        [2, '溫度、平均動能與氣體分子無規則運動的關係', 'Temperature, average kinetic energy and random motion of gas molecules'],
        [3, '用來量度溫度的溫度相關性質', 'Temperature-dependent properties used to measure temperature'],
        [4, '攝氏溫標的定點', 'Fixed points on the Celsius scale'],
        [5, '熱的定義', 'Definition of heat'],
        [6, '內能', 'Internal energy'],
        [7, '比熱容量', 'Specific heat capacity'],
        [8, '熱容量', 'Heat capacity'],
        [9, '應用 E = mcΔT', 'Application of E = mcΔT'],
        [10, '水的高比熱容量的應用', 'Application of the high specific heat capacity of water'] ] },
      { id: '1.2', phase: 5, bench: 'heat', name: { zh: '熱的轉移過程', en: 'Transfer processes' }, items: [
        [11, '能量轉移的方法', 'Means of energy transfer'],
        [12, '紅外輻射', 'Infra-red radiation'] ] },
      { id: '1.3', phase: 5, bench: 'heat', name: { zh: '物態的改變', en: 'Change of state' }, items: [
        [13, '熔點和沸點', 'Melting point and boiling point'],
        [14, '潛熱', 'Latent heat'],
        [15, '熔解比潛熱', 'Specific latent heat of fusion'],
        [16, '汽化比潛熱', 'Specific latent heat of vaporization'],
        [17, '實驗結果與理論結果的偏差', 'Experimental results that differ from theory'],
        [18, '以分子運動解釋蒸發', 'Evaporation explained by molecular motion'],
        [19, '影響蒸發速率的因素', 'Factors affecting the rate of evaporation'],
        [20, '蒸發與沸騰的比較', 'Evaporation vs boiling'] ] }
    ]
  },
  {
    id: 2, icon: '🚗', color: '#4f46e5',
    name: { zh: '力學', en: 'Mechanics' },
    desc: { zh: '研究推、拉和移動：為甚麼單車會停下？為甚麼撞車會彈開？', en: 'Pushes, pulls and motion: why do bikes stop, and why do crashing things bounce apart?' },
    subs: [
      { id: '2.1', phase: 2, bench: 'track', name: { zh: '位置和移動', en: 'Position and movement' }, items: [
        [21, '標量和向量', 'Scalars and vectors'],
        [22, '路程和位移 (1)', 'Distance and displacement (1)'],
        [23, '路程和位移 (2)', 'Distance and displacement (2)'],
        [24, '速率和速度 (1)', 'Speed and velocity (1)'],
        [25, '速率和速度 (2)', 'Speed and velocity (2)'],
        [26, '加速度', 'Acceleration'],
        [27, '加速度–時間圖', 'Acceleration–time graph'],
        [28, '勻加速直線運動方程', 'Equations of uniformly accelerated motion'],
        [29, '重力加速度', 'Acceleration due to gravity'] ] },
      { id: '2.2', phase: 1, bench: 'track', name: { zh: '力和運動', en: 'Force and motion' }, items: [
        [30, '牛頓第一運動定律', "Newton's 1st law of motion"],
        [31, '摩擦力', 'Friction'],
        [32, '力', 'Forces'],
        [33, '牛頓第二運動定律', "Newton's 2nd law of motion"],
        [34, '牛頓第三運動定律 (1)', "Newton's 3rd law of motion (1)"],
        [35, '牛頓第三運動定律 (2)', "Newton's 3rd law of motion (2)"],
        [36, '質量和重量', 'Mass and weight'] ] },
      { id: '2.3', phase: 2, bench: 'track', name: { zh: '作功、能量和功率', en: 'Work, energy and power' }, items: [
        [37, '功', 'Work'],
        [38, '克服摩擦力所作的功及其他能量損失', 'Work done against friction and other energy losses'],
        [39, '勢能 (PE)', 'Potential energy (PE)'],
        [40, '動能 (KE)', 'Kinetic energy (KE)'],
        [41, '能量守恆定律', 'The law of conservation of energy'],
        [42, '能量轉換', 'Energy conversion'],
        [43, '功率', 'Power'] ] },
      { id: '2.4', phase: 1, bench: 'track', name: { zh: '動量', en: 'Momentum' }, items: [
        [44, '線動量', 'Linear momentum'],
        [45, '動量的改變與淨力', 'Change in momentum and net force'],
        [46, '動量守恆定律', 'The law of conservation of momentum'],
        [47, '彈性碰撞和非彈性碰撞', 'Elastic and inelastic collisions'] ] }
    ]
  },
  {
    id: 3, icon: '🌊', color: '#0891b2',
    name: { zh: '波動學', en: 'Waves' },
    desc: { zh: '研究波浪、光和聲音：為甚麼飲管放進水中好像斷了？蝙蝠怎樣用聲音找路？', en: 'Water waves, light and sound: why does a straw in water look broken, and how do bats find their way with sound?' },
    subs: [
      { id: '3.1', phase: 6, bench: 'wave', name: { zh: '波的本質和特性', en: 'Nature and properties of waves' }, items: [
        [48, '橫波與縱波的分別', 'Transverse vs longitudinal travelling waves'],
        [49, '行波的位移–時間圖和位移–距離圖 (1)', 'Displacement–time and displacement–distance graphs (1)'],
        [50, '行波的位移–時間圖和位移–距離圖 (2)', 'Displacement–time and displacement–distance graphs (2)'],
        [51, '行波的位移–時間圖和位移–距離圖 (3)', 'Displacement–time and displacement–distance graphs (3)'],
        [52, '行波的位移–時間圖和位移–距離圖 (4)', 'Displacement–time and displacement–distance graphs (4)'],
        [53, '行波的位移–時間圖和位移–距離圖 (5)', 'Displacement–time and displacement–distance graphs (5)'],
        [54, '波動方程', 'Wave equation'],
        [55, '波動中的振動', 'Oscillations in a wave'],
        [56, '波在平面障礙物上的反射', 'Reflection at a plane barrier'],
        [57, '波在凹面上的反射', 'Reflection at a concave surface'],
        [58, '波在凸面上的反射', 'Reflection at a convex surface'],
        [59, '波在直線界面上的折射', 'Refraction across a straight boundary'],
        [60, '波的衍射', 'Diffraction of waves'],
        [61, '干涉的特性', 'Properties of interference'],
        [62, '相長干涉', 'Constructive interference'],
        [63, '相消干涉', 'Destructive interference'],
        [64, '程差', 'Path difference'] ] },
      { id: '3.2', phase: 3, bench: 'optics', name: { zh: '光', en: 'Light' }, items: [
        [65, '光作為電磁波的特性', 'Light as an electromagnetic wave'],
        [66, '反射定律', 'Law of reflection'],
        [67, '平面鏡成像', 'Images in a plane mirror'],
        [68, '折射定律', 'Laws of refraction'],
        [69, '以圖解法求折射率', 'Refractive index by a graphical method'],
        [70, '實深和視深', 'Real and apparent depth'],
        [71, '全內反射', 'Total internal reflection'],
        [72, '凸透鏡的作圖規則', 'Ray rules for convex lenses'],
        [73, '凹透鏡的作圖規則', 'Ray rules for concave lenses'],
        [74, '透鏡成像', 'Images formed by lenses'],
        [75, '光的波動性', 'The wave nature of light'] ] },
      { id: '3.3', phase: 6, bench: 'wave', name: { zh: '聲音', en: 'Sound' }, items: [
        [76, '聲音的一般特性', 'General properties of sound'],
        [77, '利用超聲波計算海床深度', 'Finding sea-bed depth with ultrasound'],
        [78, '超聲波的應用', 'Applications of ultrasound'] ] }
    ]
  },
  {
    id: 4, icon: '⚡', color: '#ca8a04',
    name: { zh: '電和磁', en: 'Electricity and Magnetism' },
    desc: { zh: '研究電和磁石：燈泡怎樣亮起來？摩打怎樣轉動？', en: 'Electricity and magnets: how does a bulb light up, and how does a motor spin?' },
    subs: [
      { id: '4.1', phase: 7, bench: 'field', name: { zh: '靜電學', en: 'Electrostatics' }, items: [
        [79, '電荷的定義', 'Definition of electric charge'],
        [80, '電力的證據', 'Evidence of electric force'],
        [81, '導體和絕緣體', 'Conductors and insulators'],
        [82, '起電和放電的過程', 'Charging and discharging'],
        [83, '電場', 'Electric field'],
        [84, '靜電的危險', 'Hazards of electrostatics'],
        [85, '靜電的應用', 'Applications of electrostatics'] ] },
      { id: '4.2', phase: 4, bench: 'circuit', name: { zh: '電路和家居用電', en: 'Circuits and domestic electricity' }, items: [
        [86, '電流的定義', 'Definition of electric current'],
        [87, '電動勢 (e.m.f.)', 'Electromotive force (e.m.f.)'],
        [88, '電勢差 (p.d.)', 'Potential difference (p.d.)'],
        [89, '短路', 'Short circuit'],
        [90, '電阻（歐姆定律）', "Resistance (Ohm's law)"],
        [91, '電阻（影響電阻的因素）／變阻器', 'Factors affecting resistance / rheostat'],
        [92, '串聯和並聯電路', 'Series and parallel circuits'],
        [93, '電阻', 'Resistance'],
        [94, '簡單電路', 'Simple circuits'],
        [95, '用實用電錶量度小電阻', 'Measuring small resistance with practical meters'],
        [96, '用實用電錶量度大電阻', 'Measuring large resistance with practical meters'],
        [97, '電功率', 'Electrical power'],
        [98, '電阻器耗散的電能', 'Electrical energy dissipated by a resistor'],
        [99, '電器的功率額定值', 'Power rating of electrical appliances'],
        [100, '電能費用的計算', 'Calculating the cost of electrical energy'],
        [101, '主電路的電纜', 'Mains cables'],
        [102, '主電路：插座', 'The mains circuit: sockets'],
        [103, '地線／插頭', 'Earth wire / plugs'],
        [104, '保險絲', 'Fuses'],
        [105, '電器的連接', 'Connecting electrical appliances'],
        [106, '安全用電與節約用電', 'Electrical safety and saving electricity'] ] },
      { id: '4.3', phase: 7, bench: 'field', name: { zh: '電磁學', en: 'Electromagnetism' }, items: [
        [107, '磁場 (1)', 'Magnetic field (1)'],
        [108, '磁場 (2)', 'Magnetic field (2)'],
        [109, '磁場 (3)', 'Magnetic field (3)'],
        [110, '磁場 (4)', 'Magnetic field (4)'],
        [111, '電磁鐵', 'Electromagnets'],
        [112, '磁力', 'Magnetic force'],
        [113, '直流電動機', 'The d.c. motor'],
        [114, '動圈式電流計', 'Moving-coil galvanometer'],
        [115, '分流器', 'Shunts'],
        [116, '倍增器', 'Multipliers'],
        [117, '楞次定律', "Lenz's law"],
        [118, '感生電流', 'Induced current'] ] }
    ]
  },
  {
    id: 5, icon: '⚛️', color: '#16a34a',
    name: { zh: '原子物理學', en: 'Atomic Physics' },
    desc: { zh: '研究非常微小的原子，還有太陽為甚麼會發光發熱。', en: 'Tiny, tiny atoms, and why the Sun shines and gives off heat.' },
    subs: [
      { id: '5.1', phase: 8, bench: 'atom', name: { zh: '輻射和放射性', en: 'Radiation and radioactivity' }, items: [
        [119, 'X 射線及其應用', 'X-rays and their applications'],
        [120, 'α、β 和 γ 輻射', 'Alpha, beta and gamma radiation'],
        [121, '放射衰變', 'Radioactive decay'],
        [122, '放射衰變的特性', 'Properties of radioactive decay'],
        [123, '從圖像求半衰期', 'Finding half-life from a graph'],
        [124, '輻射在電場和磁場中的偏轉', 'Deflection of radiation in electric and magnetic fields'],
        [125, '計算半衰期的方程', 'Equations for half-life'],
        [126, '背景輻射和輻射的探測', 'Background radiation and detecting radiation'],
        [127, '輻射安全', 'Radiation safety'] ] },
      { id: '5.2', phase: 8, bench: 'atom', name: { zh: '原子模型', en: 'Atomic model' }, items: [
        [128, '原子的結構', 'Structure of an atom'],
        [129, '符號表示法和同位素', 'Symbolic notation and isotopes'] ] },
      { id: '5.3', phase: 8, bench: 'atom', name: { zh: '核能', en: 'Nuclear energy' }, items: [
        [130, '核裂變', 'Nuclear fission'],
        [131, '核聚變', 'Nuclear fusion'],
        [132, '使用核能發電的優點和缺點', 'Pros and cons of nuclear power'] ] }
    ]
  }
];

// 主頁自動導覽（spot：要高亮的元素 id）
export const HUB_TOUR = [
  { who: 'chan', spot: 'hubHero',
    zh: '歡迎嚟到物理虛擬實驗室！我係陳老師。物理學就係研究「點解」嘅學問：點解冰會溶？點解單車會停？點解天上會有彩虹？',
    en: "Welcome to the Physics Virtual Lab! I'm Ms Chan. Physics is all about asking why: why does ice melt, why does a bike stop, and why are there rainbows?" },
  { who: 'ming', spot: 'topics',
    zh: '我係小明！呢度有五個大課題，我哋逐個睇吓！',
    en: "I'm Ming! There are five big topics here. Let's look at each one!" },
  { who: 'ming', spot: 'topic-1',
    zh: '第一個係熱學，研究冷同熱：點解熱湯會慢慢凍，點解水滾咗會變蒸氣。',
    en: 'Topic one is Heat, all about hot and cold: why hot soup cools down, and why boiling water turns into steam.' },
  { who: 'ming', spot: 'topic-2',
    zh: '第二個係力學，研究推、拉同郁動：點解單車會停，點解撞車會彈開。',
    en: 'Topic two is Mechanics, all about pushes, pulls and motion: why bikes stop, and why crashing things bounce apart.' },
  { who: 'ming', spot: 'topic-3',
    zh: '第三個係波動學，研究波浪、光同聲音：點解飲管放落水好似斷咗，點解蝙蝠可以用聲音搵路。',
    en: 'Topic three is Waves, all about water waves, light and sound: why a straw in water looks broken, and how bats find their way using sound.' },
  { who: 'ming', spot: 'topic-4',
    zh: '第四個係電和磁，研究電同磁石：燈泡點樣著，摩打點樣轉。',
    en: 'Topic four is Electricity and Magnetism: how a light bulb lights up, and how a motor spins.' },
  { who: 'ming', spot: 'topic-5',
    zh: '第五個係原子物理學，研究好細好細嘅原子，仲有太陽點解會發光發熱。',
    en: 'Topic five is Atomic Physics: tiny, tiny atoms, and why the Sun shines and gives off heat.' },
  { who: 'chan', spot: 'featured',
    zh: '有綠色剔號嘅已經開放，黃色係部分開放，有鎖頭嘅就即將推出。今日我哋先玩力學嘅撞車實驗室，一齊探索牛頓定律同動量！',
    en: "Items with a green tick are open, yellow ones are partly open, and the ones with a lock are coming soon. Today we'll start with the Crash Lab in Mechanics and explore Newton's laws and momentum!" }
];
