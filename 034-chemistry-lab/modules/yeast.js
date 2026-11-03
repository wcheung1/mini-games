/* Topic 7.5 醇：發酵（酵母吹氣球；用石灰水測試二氧化碳） */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V2, V3 } = K;

// 三個樽：size = 一個鐘之後氣球有幾脹（0 至 1）
const BOT = [
  { k: 'A', zh: 'A：暖水＋糖', en: 'A: warm water + sugar', sugar: true, warm: true, size: 1, rate: 16, border: '#f97316' },
  { k: 'B', zh: 'B：暖水（冇糖）', en: 'B: warm water, no sugar', sugar: false, warm: true, size: 0.06, rate: 0.6, border: '#f97316' },
  { k: 'C', zh: 'C：凍水＋糖', en: 'C: cold water + sugar', sugar: true, warm: false, size: 0.35, rate: 4, border: '#38bdf8' },
];
const BALLOON = ['#ef4444', '#22c55e', '#a855f7'];

function Panel({ S }) {
  const { pick, lang } = useApp();
  const zh = lang === 'zh';
  const min = S.min || 0;
  return html`<div className="grid gap-1.5 text-sm">
    ${BOT.map((b, i) => html`<div key=${b.k} className="rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="flex-1 font-bold text-slate-700">${pick(b)}</span>
        <span className="text-xs text-slate-500">${S['y' + i] ? (zh ? '✅ 酵母' : '✅ yeast') : (zh ? '— 酵母' : '— yeast')}${b.sugar ? (S['s' + i] ? (zh ? ' ✅ 糖' : ' ✅ sugar') : (zh ? ' — 糖' : ' — sugar')) : ''}</span>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-xs text-slate-500 w-16">${zh ? '氣球大細' : 'Balloon'}</span>
        <div className="flex-1 h-3 rounded-full bg-slate-200 overflow-hidden"><div className="h-full rounded-full" style=${{ width: `${Math.max(4, (min / 60) * b.size * 100)}%`, background: BALLOON[i], opacity: min ? 1 : 0.25 }}></div></div>
      </div>
    </div>`)}
    <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2">
      <b className="text-slate-700">${zh ? '⏰ 時間：' : '⏰ Time: '}</b><span className="text-slate-600">${Math.round(min)} ${zh ? '分鐘' : 'min'}</span>
      <span className="text-slate-400">　·　</span>
      <b className="text-slate-700">${zh ? '石灰水：' : 'Limewater: '}</b><span className="text-slate-600">${S.lime ? (zh ? '變奶白色 → 二氧化碳 ✅' : 'turns milky → carbon dioxide ✅') : '—'}</span>
    </div>
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    ${[[45, 30, '#ef4444'], [100, 17, '#a855f7'], [155, 9, '#22c55e']].map(([x, r, c]) => html`<g key=${x}>
      <path d=${`M${x - 18} 102 v-30 l10 -14 v-8 h16 v8 l10 14 v30 a4 4 0 0 1 -4 4 h-28 a4 4 0 0 1 -4 -4z`} fill="#fff" fillOpacity=".9" stroke="#cbd5e1" strokeWidth="3" />
      <rect x=${x - 15} y="78" width="30" height="24" rx="3" fill="#f3e2b8" />
      <ellipse cx=${x} cy=${50 - r} rx=${r * 0.8} ry=${r} fill=${c} />
    </g>`)}
  </svg>`;
}

const events = {
  mx_yeast: { zh: '酵母放咗落去。佢喺水入面慢慢醒緊。', en: 'The yeast is in. It is slowly waking up in the water.' },
  mx_sugar: { zh: '加咗一匙糖，糖係酵母嘅食物。', en: 'A spoonful of sugar is in. Sugar is food for yeast.' },
  mx_nosugar: { zh: 'B 樽係用嚟比較嘅，唔加糖㗎！咁先知道糖有冇影響。', en: 'Bottle B is for comparing, so it gets no sugar! That is how we find out whether sugar matters.' },
  mixAll: { zh: '三個樽都準備好喇！', en: 'All three bottles are ready!' },
  w_need: { zh: '先將三個氣球套好落樽口，先好快轉時間。', en: 'Fit all three balloons onto the bottles first, then fast-forward the time.' },
  w_go: { zh: '時間快轉中……酵母開始食糖，樽入面冒出細細嘅泡泡。', en: 'Fast-forwarding time… The yeast starts eating the sugar, and tiny bubbles appear in the bottles.' },
  w_done: { zh: '一個鐘之後：A 嘅氣球脹到好大，C 只係脹少少，B 幾乎冇變！', en: 'One hour later: balloon A is really big, balloon C has grown a little, and balloon B has hardly changed!' },
  g_milky: { zh: '石灰水變咗奶白色！所以氣球入面嘅氣體係二氧化碳。', en: 'The limewater has turned milky! So the gas in the balloon is carbon dioxide.' },
  bread: { zh: '麵包入面嘅細洞，就係酵母整出嚟嘅二氧化碳留低嘅。', en: 'The little holes in bread are left by carbon dioxide made by yeast.' },
  lime: { zh: '石灰水係用嚟測試二氧化碳嘅：二氧化碳會令佢變奶白色。', en: 'Limewater is used to test for carbon dioxide: carbon dioxide turns it milky.' },
  bottle: { zh: '三個樽一樣大，水嘅份量一樣，酵母份量都一樣，咁先係公平測試。', en: 'The three bottles are the same size, with the same amount of water and yeast. That makes it a fair test.' },
  clockDone: { zh: '已經過咗一個鐘喇。', en: 'One hour has already passed.' },
};

export default {
  id: 'yeast', topics: ['7.5'], accent: '#f59e0b', dark: '#b45309', bg: 'linear-gradient(135deg,#fef3c7,#fde68a)', Art,
  title: { zh: '酵母吹氣球', en: 'Yeast Balloons' },
  desc: { zh: '請細小嘅酵母幫手吹氣球！睇下佢最鍾意咩環境，再查出氣球入面係咩氣體。', en: 'Let tiny yeast blow up balloons! Find out what yeast likes best, then test the gas inside.' },
  steps: [
    { tag: 'intro', zh: '你有冇食過鬆軟嘅麵包？麵包入面有好多細細嘅洞，係一種叫「酵母」嘅細小生物整出嚟㗎！酵母係一種真菌，同菇係親戚，細到要用顯微鏡先睇到。今日我哋請酵母幫手吹氣球，睇下佢最鍾意咩環境。安全提提你：暖水唔好太熱，實驗嘅嘢唔好食。後面嘅物件可以撳嚟睇介紹。',
      en: 'Have you ever eaten soft, fluffy bread? Bread is full of tiny holes, made by tiny living things called yeast! Yeast is a fungus, a relative of mushrooms, and it is so small you need a microscope to see it. Today we will ask yeast to blow up balloons and find out what it likes best. Safety first: the warm water must not be too hot, and never eat anything from an experiment. Tap the objects at the back to learn about them.' },
    { tag: 'try', action: { id: 'mix', events: ['mx_'] }, zh: '將酵母拖落三個樽，再將糖匙拖落 A 同 C 樽。B 樽唔加糖，係用嚟比較嘅。',
      en: 'Drag the yeast into all three bottles, then drag the sugar spoon into bottles A and C. Bottle B gets no sugar, because it is for comparing.' },
    { tag: 'observe', zh: '三個樽準備好：A 暖水加糖，B 暖水但係冇糖，C 凍水加糖。好嘅科學測試每次淨係改變一樣嘢：A 同 B 比較有冇糖，A 同 C 比較水嘅溫度。呢個叫「公平測試」。',
      en: 'The three bottles are ready: A has warm water and sugar, B has warm water but no sugar, and C has cold water and sugar. A good science test changes only one thing at a time: A and B compare sugar, and A and C compare the water temperature. This is called a fair test.' },
    { tag: 'try', action: { id: 'wait', events: ['w_'] }, zh: '將前面三個氣球套落三個樽口，然後撳右邊嘅時鐘，快轉一個鐘。',
      en: 'Fit the three balloons at the front onto the three bottles, then tap the clock on the right to fast-forward one hour.' },
    { tag: 'observe', zh: 'A 嘅氣球脹得最大，C 只係脹少少，B 幾乎冇變。酵母食咗糖，就會放出氣體，將氣球吹脹。冇糖，酵母冇嘢食；太凍，酵母就郁得好慢。',
      en: 'Balloon A grows the most, C grows a little, and B hardly changes. When yeast eats sugar, it gives off a gas that blows up the balloon. Without sugar, the yeast has no food; in the cold, it works very slowly.' },
    { tag: 'try', action: { id: 'gas', events: ['g_'] }, zh: '氣球入面係咩氣體？將 A 樽嘅氣球拖去右邊嘅石灰水，睇下會唔會變奶白色。',
      en: 'What gas is in the balloon? Drag balloon A to the limewater on the right and see whether it turns milky.' },
    { tag: 'feynman', zh: '酵母好似一班細細嘅廚師：食咗糖，就會「呼」出二氧化碳，同時整出少少酒精。呢個過程叫「發酵」。佢哋最鍾意暖暖哋，太凍會懶洋洋，太熱（例如滾水）就會死。',
      en: 'Yeast is like a team of tiny chefs: when they eat sugar, they "breathe out" carbon dioxide and make a little alcohol too. This is called fermentation. They like it nice and warm. In the cold they become lazy, and if it is too hot (like boiling water) they die.' },
    { tag: 'first', zh: '由最基本諗起：糖係由碳、氫、氧原子砌成嘅。酵母入面有「酵素」，好似一把把細剪刀，將糖分子剪開，重新砌成二氧化碳同酒精（乙醇），同時放出能量俾酵母生活。暖啲，粒子同酵素郁得快啲，反應就快啲；但係太熱，酵素會變形壞咗。',
      en: 'Back to basics: sugar is built from carbon, hydrogen and oxygen atoms. Yeast contains enzymes, which work like tiny scissors: they cut sugar molecules apart and rebuild them into carbon dioxide and alcohol (ethanol), releasing energy for the yeast to live. When it is warmer, particles and enzymes move faster, so the reaction is faster; but if it is too hot, the enzymes change shape and stop working.' },
    { tag: 'life', zh: '生活應用：搓好嘅麵團放喺暖嘅地方發酵，二氧化碳令麵包發起，焗嘅時候酒精會蒸發走晒。啤酒同葡萄酒都係靠酵母發酵；而醋，就係細菌將酒精再變成醋酸整出嚟嘅。',
      en: 'Everyday life: dough is left somewhere warm to rise, because the carbon dioxide puffs up the bread, and the alcohol evaporates during baking. Beer and wine are made by yeast fermentation too, and vinegar is made when bacteria turn alcohol into acetic acid.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '整麵包嘅時候，點解搓好嘅麵團要放喺暖嘅地方？', en: 'When making bread, why is the dough left somewhere warm?' },
    options: [
      { zh: '等麵團變乾啲', en: 'To dry the dough out' },
      { zh: '酵母喺暖嘅地方最活躍，會產生多啲二氧化碳，令麵團發起', en: 'Yeast is most active when warm, so it makes more carbon dioxide and the dough rises' },
      { zh: '令麵團變甜啲', en: 'To make the dough sweeter' },
    ],
    correct: 1,
    right: { zh: '啱！就好似 A 樽咁：有糖、夠暖，酵母就發酵得最快，二氧化碳將麵團吹脹。', en: 'Right! Just like bottle A: with sugar and warmth, yeast ferments fastest, and the carbon dioxide puffs up the dough.' },
    wrong: { zh: '再諗下三個樽：邊個樽嘅氣球脹得最大？嗰個樽有咩條件？', en: 'Think about the three bottles: which balloon grew the most, and what were the conditions in that bottle?' },
  },
  tools: [
    { id: 'm', label: { zh: '加下一樣材料', en: 'Add the next ingredient' }, run: (c) => c.mixNext() },
    { id: 'b', label: { zh: '套下一個氣球', en: 'Fit the next balloon' }, run: (c) => c.balloonNext() },
    { id: 'f', primary: true, label: { zh: '⏩ 快轉一個鐘', en: '⏩ Fast-forward 1 hour' }, run: (c) => c.fastForward() },
    { id: 'g', label: { zh: '測試氣體', en: 'Test the gas' }, run: (c) => c.testGas() },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = { min: 0, lime: false }; BOT.forEach((b, i) => { S['y' + i] = false; S['s' + i] = false; });
    const push = () => api.state({ ...S });
    const bxs = [-1.7, -0.45, 0.8], BZ = -0.3, LV = 0.42, MOUTH = 0.98;
    const prof = [V2(0, 0), V2(0.3, 0), V2(0.32, 0.04), V2(0.32, 0.6), V2(0.15, 0.8), V2(0.1, 0.86), V2(0.1, MOUTH)];
    const WATER = '#dbeafe', CLOUDY = '#eadcb8';
    const bottles = BOT.map((b, i) => {
      const v = K.makeVessel(prof, { liquidColor: WATER, level: LV, opacity: 0.55, sx: 0.92 });
      v.group.position.set(bxs[i], T + 0.01, BZ); scene.add(v.group);
      const lab = api.label(b, { border: b.border, h: 0.16 }); lab.position.set(bxs[i], T + 0.1, BZ + 0.55);
      api.tap(v.group, () => api.emit('bottle'), b, [lab]);
      if (!b.warm) [-0.08, 0.1].forEach((x, k) => { const ice = new THREE.Mesh(new K.RoundedBoxGeometry(0.11, 0.09, 0.11, 2, 0.02), new THREE.MeshPhysicalMaterial({ color: '#e0f2fe', roughness: 0.05, transparent: true, opacity: 0.7, clearcoat: 1 })); ice.position.set(x, LV - 0.02, k * 0.08 - 0.04); ice.rotation.y = k; v.group.add(ice); });
      return { ...v, x: bxs[i], bub: K.makeBubbles(v.group, { max: 160, size: 0.022 }), mouth: V3(bxs[i], T + 0.01 + MOUTH, BZ) };
    });

    // 前排：酵母包、糖匙
    const yeast = new THREE.Group(); yeast.position.set(-2.7, T, 0.95); scene.add(yeast);
    const pack = new THREE.Mesh(new K.RoundedBoxGeometry(0.34, 0.42, 0.08, 2, 0.02), K.stdMat('#d6a85c', 0.7)); pack.position.y = 0.21; yeast.add(pack);
    const lY = api.label({ zh: '酵母', en: 'Yeast' }, { border: '#b45309', h: 0.17 }); lY.position.set(0, -0.02, 0.35); yeast.add(lY);
    const sugar = new THREE.Group(); sugar.position.set(-1.65, T, 1.0); scene.add(sugar);
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.4, side: THREE.DoubleSide })); bowl.position.y = 0.2; sugar.add(bowl);
    const heap = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 8), K.stdMat('#ffffff', 0.9)); heap.scale.y = 0.35; heap.position.y = 0.19; sugar.add(heap);
    const spoon = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8), K.stdMat('#cbd5e1', 0.3, 0.8)); spoon.position.set(0.08, 0.32, 0); spoon.rotation.z = -0.6; sugar.add(spoon);
    const lS = api.label({ zh: '糖', en: 'Sugar' }, { border: '#94a3b8', h: 0.17 }); lS.position.set(0, -0.02, 0.38); sugar.add(lS);

    // 氣球（原點喺樽口）
    const balloons = BALLOON.map((c, j) => {
      const g = new THREE.Group(); g.position.set(-0.45 + j * 0.55, T + 0.02, 1.05); scene.add(g);
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 16), K.stdMat(c, 0.35)); body.scale.y = 1.2; body.position.y = 0.36; g.add(body);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.11, 0.12, 16), K.stdMat(c, 0.35)); neck.position.y = 0.06; g.add(neck);
      g.scale.setScalar(0.35);
      return { g, on: -1 };
    });
    const onBottle = [-1, -1, -1]; // 每個樽套咗邊個氣球

    // 右邊：石灰水試管、時鐘
    const LX = 2.35, LZ = -0.35;
    const rack = K.makeRack([0], 0.2, 0.7, 0.6); rack.position.set(LX, T, LZ); scene.add(rack);
    const lime = K.makeVessel(K.tubeProfile(0.17, 1.2), { liquidColor: '#eef6fb', level: 0.62, opacity: 0.45 });
    lime.group.position.set(LX, T + 0.07, LZ); scene.add(lime.group);
    const limeBub = K.makeBubbles(lime.group, { max: 80, size: 0.02 });
    const lL = api.label({ zh: '石灰水', en: 'Limewater' }, { border: '#64748b', h: 0.16 }); lL.position.set(LX, T + 1.5, LZ);
    api.tap(lime.group, () => api.emit('lime'), { zh: '石灰水', en: 'Limewater' }, [lL]);
    const limeMouth = V3(LX, T + 1.27, LZ);
    const clock = new THREE.Group(); clock.position.set(2.75, T, 0.85); scene.add(clock);
    const face = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 32), K.stdMat('#fef3c7', 0.5)); face.rotation.x = Math.PI / 2; face.position.y = 0.34; clock.add(face);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.03, 10, 40), K.stdMat('#f59e0b', 0.4)); rim.position.y = 0.34; clock.add(rim);
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.02), K.stdMat('#1e293b', 0.5)); hand.geometry.translate(0, 0.1, 0); hand.position.set(0, 0.34, 0.05); clock.add(hand);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.18), K.stdMat('#f59e0b', 0.5)); foot.position.y = 0.03; clock.add(foot);
    const lClock = api.label((lang) => (lang === 'zh' ? `⏰ ${Math.round(S.min)} 分鐘` : `⏰ ${Math.round(S.min)} min`), { border: '#f59e0b', h: 0.17 }); lClock.position.set(2.75, T + 0.85, 0.85);
    const refreshClock = () => lClock.userData.refresh();
    // 後排：麵包
    const bread = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.35, 6, 16), K.stdMat('#c98a4b', 0.8)); bread.rotation.z = Math.PI / 2; bread.position.set(-2.85, T + 0.16, -1.15); scene.add(bread);
    const lBread = api.label({ zh: '麵包', en: 'Bread' }, { border: '#94a3b8', h: 0.15 }); lBread.position.set(-2.85, T + 0.5, -1.15);
    api.tap(bread, () => api.emit('bread'), { zh: '麵包', en: 'Bread' }, [lBread]);

    let busy = false, ffDone = false, limeK = 0;
    const needSugar = (i) => BOT[i].sugar && !S['s' + i];
    const mixDone = () => BOT.every((b, i) => S['y' + i] && !needSugar(i));
    const allFitted = () => onBottle.every((j) => j >= 0);
    const finishMix = () => { if (mixDone()) { api.done('mix'); api.emit('mixAll'); } };

    async function pourInto(obj, h, i, color) {
      const B = bottles[i], target = V3(B.x, B.mouth.y + 0.35, BZ);
      await K.moveTo(tw, obj, K.tipPose(V2(0, 0.35), 1.6, target), 1.6, 0.5);
      await K.dripDrop(scene, tw, target, V3(B.x, T + LV, BZ), color);
      await h.returnHome();
    }
    async function addYeast(i, h = hY) {
      if (busy || S['y' + i]) return false; busy = true;
      await pourInto(yeast, h, i, '#d6a85c');
      S['y' + i] = true; push(); api.emit('mx_yeast');
      const from = bottles[i].mat.color.clone();
      tw.to(1.5, (k) => bottles[i].mat.color.copy(from).lerp(new THREE.Color(CLOUDY), k));
      busy = false; finishMix();
    }
    async function addSugar(i, h = hS) {
      if (busy) return false;
      if (!BOT[i].sugar) { api.emit('mx_nosugar'); return false; }
      if (S['s' + i]) return false; busy = true;
      await pourInto(sugar, h, i, '#ffffff');
      S['s' + i] = true; push(); api.emit('mx_sugar');
      busy = false; finishMix();
    }
    async function fit(j, i, h) {
      if (busy || onBottle[i] >= 0 || balloons[j].on >= 0) return false; busy = true;
      const B = bottles[i], g = balloons[j].g;
      await K.moveTo(tw, g, V3(B.x, B.mouth.y + 0.4, BZ), 0, 0.4);
      await K.moveTo(tw, g, B.mouth, 0, 0.3);
      balloons[j].on = i; onBottle[i] = j; h.setHome(B.mouth.clone());
      busy = false;
    }
    async function fastForward() {
      if (busy || ffDone) { if (ffDone) api.emit('clockDone'); return; }
      if (!allFitted()) { api.emit('w_need'); return; }
      busy = true;
      api.emit('w_go');
      await tw.to(5, (k) => {
        S.min = 60 * k; refreshClock(); hand.rotation.z = -Math.PI * 2 * k;
        BOT.forEach((b, i) => balloons[onBottle[i]].g.scale.setScalar(0.35 + 0.85 * b.size * k));
      }, K.lin);
      ffDone = true; push();
      await api.waitSpeech();
      api.emit('w_done'); api.done('wait');
      busy = false;
    }
    async function testGas(h) {
      const j = onBottle[0];
      if (busy || !ffDone || S.lime || j < 0) return false; busy = true;
      h = h || hB[j];
      await K.moveTo(tw, balloons[j].g, V3(LX, limeMouth.y + 0.05, LZ), 0, 0.7);
      limeK = 1;
      const from = lime.mat.color.clone();
      await tw.to(2.2, (k) => { lime.mat.color.copy(from).lerp(new THREE.Color('#f8fafc'), k); lime.mat.opacity = 0.45 + 0.5 * k; balloons[j].g.scale.setScalar(1.2 - 0.25 * k); });
      limeK = 0; S.lime = true; push(); api.emit('g_milky');
      await h.returnHome();
      busy = false; api.done('gas');
    }

    const hY = api.drag(yeast, { label: { zh: '酵母', en: 'Yeast' }, lift: 0.9, enabled: () => !busy,
      targets: () => bottles.map((B, i) => ({ key: 'b' + i, pos: B.mouth, r: 0.42, ringY: T, accept: () => !S['y' + i] })),
      onDrop: (tg, h) => addYeast(Number(tg.key.slice(1)), h), onTap: () => { const i = [0, 1, 2].find((k) => !S['y' + k]); if (!busy && i !== undefined) hY.dropOn('b' + i); } });
    const hS = api.drag(sugar, { label: { zh: '糖', en: 'Sugar' }, lift: 0.9, enabled: () => !busy,
      targets: () => bottles.map((B, i) => ({ key: 'b' + i, pos: B.mouth, r: 0.42, ringY: T, accept: () => !S['s' + i] })),
      onDrop: (tg, h) => addSugar(Number(tg.key.slice(1)), h), onTap: () => { const i = [0, 1, 2].find(needSugar); if (!busy && i !== undefined) hS.dropOn('b' + i); } });
    const hB = balloons.map((bl, j) => api.drag(bl.g, { label: { zh: '氣球', en: 'Balloon' }, lift: 0.9,
      enabled: () => !busy && (bl.on < 0 || (bl.on === 0 && ffDone && !S.lime)),
      targets: () => (bl.on < 0
        ? bottles.map((B, i) => ({ key: 'b' + i, pos: B.mouth, r: 0.42, ringY: T, accept: () => onBottle[i] < 0 }))
        : [{ key: 'lime', pos: limeMouth, r: 0.42, ringY: T, accept: () => bl.on === 0 && ffDone && !S.lime }]),
      onDrop: (tg, h) => (tg.key === 'lime' ? testGas(h) : fit(j, Number(tg.key.slice(1)), h)),
      onTap: () => {
        if (busy) return;
        if (bl.on < 0) { const i = onBottle.indexOf(-1); if (i >= 0) hB[j].dropOn('b' + i); } else if (bl.on === 0 && ffDone && !S.lime) hB[j].dropOn('lime');
      } }));
    api.tap(clock, () => fastForward(), { zh: '快轉時鐘', en: 'Fast-forward clock' }, [lClock]);

    const nextMix = () => { const i = [0, 1, 2].find((k) => !S['y' + k]); if (i !== undefined) return ['y', i]; const s = [0, 1, 2].find(needSugar); return s !== undefined ? ['s', s] : null; };
    const nextBalloon = () => balloons.findIndex((b) => b.on < 0);
    push();
    return {
      cam: { pos: [0.1, 3.9, 5.1], target: [0.1, 1.45, -0.1], fitW: 6.9 },
      fastForward,
      testGas: () => testGas(),
      mixNext() { const n = nextMix(); if (!n || busy) return; if (n[0] === 'y') hY.dropOn('b' + n[1]); else hS.dropOn('b' + n[1]); },
      balloonNext() { const j = nextBalloon(), i = onBottle.indexOf(-1); if (!busy && j >= 0 && i >= 0) hB[j].dropOn('b' + i); },
      async demo(id) {
        while (busy) await tw.wait(0.1);
        if (id === 'mix') for (let n = nextMix(), c = 0; n && c < 8; n = nextMix(), c++) { while (busy) await tw.wait(0.1); await (n[0] === 'y' ? hY : hS).dropOn('b' + n[1]); await api.waitSpeech(); }
        if (id === 'wait') {
          for (let j = nextBalloon(), c = 0; j >= 0 && c < 4; j = nextBalloon(), c++) { while (busy) await tw.wait(0.1); await hB[j].dropOn('b' + onBottle.indexOf(-1)); }
          while (busy) await tw.wait(0.1);
          await fastForward();
        }
        if (id === 'gas') { while (busy) await tw.wait(0.1); if (onBottle[0] >= 0) await hB[onBottle[0]].dropOn('lime'); }
      },
      getHint(id) {
        if (busy) return null;
        if (id === 'mix') { const n = nextMix(); return n ? { from: K.worldOf(n[0] === 'y' ? yeast : sugar, 0.2), to: bottles[n[1]].mouth } : null; }
        if (id === 'wait') {
          const j = nextBalloon(); if (j >= 0) return { from: K.worldOf(balloons[j].g, 0.1), to: bottles[onBottle.indexOf(-1)].mouth };
          return ffDone ? null : { from: K.worldOf(clock, 0.34) };
        }
        if (id === 'gas') return ffDone && !S.lime && onBottle[0] >= 0 ? { from: K.worldOf(balloons[onBottle[0]].g, 0.4), to: limeMouth } : null;
        return null;
      },
      update(dt, t) {
        const k = S.min / 60;
        bottles.forEach((B, i) => {
          const b = BOT[i], active = S['y' + i] && (b.sugar ? S['s' + i] : true);
          const rate = active ? b.rate * (k > 0 ? 1 : 0.15) : 0;
          if (rate && Math.random() < dt * rate) B.bub.spawn((Math.random() - 0.5) * 0.36, 0.06 + Math.random() * 0.15, (Math.random() - 0.5) * 0.36, LV - 0.01, 0.8);
          B.bub.update(dt, t);
        });
        if (limeK && Math.random() < dt * 25) limeBub.spawn((Math.random() - 0.5) * 0.12, 0.1, (Math.random() - 0.5) * 0.12, 0.6, 0.9);
        limeBub.update(dt, t);
      },
      reset() {
        tw.clear(); busy = false; ffDone = false; limeK = 0;
        Object.keys(S).forEach((key) => { S[key] = key === 'min' ? 0 : false; }); push(); refreshClock();
        hand.rotation.z = 0;
        bottles.forEach((B) => { B.bub.clear(); B.mat.color.set(WATER); });
        limeBub.clear(); lime.mat.color.set('#eef6fb'); lime.mat.opacity = 0.45;
        onBottle.fill(-1);
        balloons.forEach((bl, j) => { bl.on = -1; bl.g.scale.setScalar(0.35); hB[j].setHome(V3(-0.45 + j * 0.55, T + 0.02, 1.05)); });
        [hY, hS, ...hB].forEach((h) => { h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.busy = false; });
      },
    };
  },
};
