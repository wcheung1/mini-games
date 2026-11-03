/* Topic 4.1 酸：家居的酸、酸的性質（與碳酸鹽、金屬反應；氣體測試） */
import { html, useApp } from '../js/lib.js';
import * as K from '../js/kit3d.js';
const { THREE, TABLE_Y: T, V2, V3 } = K;

function Panel({ S }) {
  const { lang } = useApp();
  const zh = lang === 'zh';
  const rows = [
    { k: 'A', what: zh ? '白醋 ＋ 蛋殼' : 'Vinegar + eggshell', on: S.shell, gas: S.testA ? (zh ? '二氧化碳（火會熄）' : 'carbon dioxide (flame goes out)') : '?' },
    { k: 'B', what: zh ? '稀鹽酸 ＋ 鎂帶' : 'Dilute hydrochloric acid + magnesium', on: S.mg, gas: S.testB ? (zh ? '氫氣（「噗」一聲）' : 'hydrogen ("pop!")') : '?' },
  ];
  return html`<div className="grid gap-2">
    ${rows.map((r) => html`<div key=${r.k} className="rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2 text-sm">
      <div className="font-black text-slate-700">${r.k}：${r.what}</div>
      <div className="text-slate-600">${zh ? '冒泡？' : 'Bubbles?'} ${r.on ? '✅' : '—'}　·　${zh ? '氣體：' : 'Gas: '}${r.on ? r.gas : '—'}</div>
    </div>`)}
  </div>`;
}

function Art() {
  return html`<svg viewBox="0 0 200 110" className="h-24 drop-shadow-md" aria-hidden="true">
    <path d="M70 14 h20 v30 l26 52 a6 6 0 0 1 -5 9 h-62 a6 6 0 0 1 -5 -9 l26 -52z" fill="#fff" fillOpacity=".9" stroke="#cbd5e1" strokeWidth="3" />
    <path d="M58 72 h44 l12 24 a5 5 0 0 1 -4 7 h-60 a5 5 0 0 1 -4 -7z" fill="#fde68a" />
    ${[[70, 80], [80, 62], [88, 74], [76, 50], [92, 88]].map(([x, y]) => html`<circle key=${x + '-' + y} cx=${x} cy=${y} r="4" fill="#fff" stroke="#94a3b8" />`)}
    <ellipse cx="150" cy="70" rx="24" ry="30" fill="#fde047" stroke="#ca8a04" strokeWidth="3" /><path d="M150 40 q6 -10 14 -8" stroke="#16a34a" strokeWidth="4" fill="none" />
  </svg>`;
}

const events = {
  shell: { zh: '蛋殼一落去白醋，就不停冒出細細粒泡泡！泡泡入面係一種氣體，我哋等陣測試佢係咩。', en: 'As soon as the eggshell goes into the vinegar, tiny bubbles keep appearing! The bubbles hold a gas, and we will test what it is soon.' },
  mg: { zh: '鎂帶一放落稀鹽酸，即刻冒出大量泡泡，仲會慢慢變細，最後消失！個瓶仲會暖暖哋。', en: 'The moment the magnesium goes into the dilute acid, lots of bubbles rush out, and the magnesium slowly shrinks and disappears! The flask gets a little warm too.' },
  spl_pop: { zh: '「噗！」點著嘅木條一放近瓶口，就響咗一聲。呢個係氫氣嘅特徵：氫氣遇到火會「噗」一聲燒起嚟。', en: '"Pop!" When the burning splint goes near the mouth of the flask, there is a pop. That is the sign of hydrogen: hydrogen burns with a squeaky pop.' },
  spl_out: { zh: '火熄咗！瓶入面嘅氣體令火焰熄滅，呢個係二氧化碳嘅特徵。（科學家通常會再用石灰水確認：二氧化碳會令石灰水變奶白色。）', en: 'The flame goes out! The gas in the flask puts out the flame, which is a sign of carbon dioxide. (Scientists usually check with limewater too: carbon dioxide turns limewater milky.)' },
  spl_nogas: { zh: '呢個瓶仲未有氣體，要先將東西放落去，等佢冒泡先測試啦！', en: 'There is no gas in this flask yet. Add something to make it bubble first, then test it!' },
  relight: { zh: '我幫你將木條再點著喇，可以測試另一個瓶。', en: 'I have relit the splint for you, so you can test the other flask.' },
  lemon: { zh: '檸檬同橙入面有「檸檬酸」，所以食落酸酸哋。', en: 'Lemons and oranges contain citric acid, which is why they taste sour.' },
  vbottle: { zh: '醋入面有「醋酸」，係屋企最常見嘅酸。', en: 'Vinegar contains acetic acid. It is the most common acid at home.' },
  soda: { zh: '汽水入面溶咗二氧化碳，變成「碳酸」，所以汽水都係酸性㗎。', en: 'Fizzy drinks have carbon dioxide dissolved in them, which makes carbonic acid, so fizzy drinks are acidic too.' },
  labacid: { zh: '呢個係實驗室嘅稀鹽酸。佢有腐蝕性，一定要由老師處理，千祈唔好掂或者試味！', en: 'This is dilute hydrochloric acid from the lab. It is corrosive, so only a teacher should handle it. Never touch or taste it!' },
  flaskA: { zh: '呢個錐形瓶裝住白醋。', en: 'This conical flask holds white vinegar.' },
  flaskB: { zh: '呢個錐形瓶裝住稀鹽酸，係實驗室常用嘅酸。', en: 'This conical flask holds dilute hydrochloric acid, a common lab acid.' },
};

export default {
  id: 'acidprops', topics: ['4.1'], accent: '#f59e0b', dark: '#b45309', bg: 'linear-gradient(135deg,#fff7d6,#ffe8cc)', Art,
  title: { zh: '酸性大發現', en: 'Discovering Acids' },
  desc: { zh: '酸會同蛋殼、金屬反應冒泡！用點著嘅木條，查出泡泡入面係咩氣體。', en: 'Acids fizz with eggshells and metals! Use a burning splint to find out which gas is in the bubbles.' },
  steps: [
    { tag: 'intro', zh: '酸喺生活好常見：檸檬同橙有檸檬酸，醋有醋酸，汽水有碳酸。食物入面嘅酸食落酸酸哋，但係記住：實驗室入面嘅酸，千祈唔好試味！今日我哋睇下酸有咩特性。後面啲物件都可以撳嚟睇介紹。',
      en: 'Acids are everywhere: lemons and oranges have citric acid, vinegar has acetic acid, and fizzy drinks have carbonic acid. Acids in food taste sour, but remember: never taste anything in a lab! Today we will find out what acids can do. You can tap the objects at the back to learn about them.' },
    { tag: 'try', action: { id: 'shell', events: ['shell'] }, zh: '第一個實驗：將蛋殼拖落左邊裝住白醋嘅錐形瓶，睇下會點。',
      en: 'Experiment one: drag the eggshell into the left conical flask, which holds white vinegar, and see what happens.' },
    { tag: 'observe', zh: '蛋殼不停冒泡！蛋殼主要由「碳酸鈣」組成，粉筆、石灰石同大理石都係。酸遇到碳酸鈣呢類「碳酸鹽」，就會產生二氧化碳氣體。',
      en: 'The eggshell keeps fizzing! Eggshell is mostly calcium carbonate, just like chalk, limestone and marble. When an acid meets a carbonate like this, it makes carbon dioxide gas.' },
    { tag: 'try', action: { id: 'mg', events: ['mg'] }, zh: '第二個實驗：將鎂帶拖落右邊裝住稀鹽酸嘅錐形瓶。鎂係一種金屬。真實做嘅時候，要由老師處理稀鹽酸。',
      en: 'Experiment two: drag the magnesium ribbon into the right conical flask, which holds dilute hydrochloric acid. Magnesium is a metal. In a real lab, a teacher handles the acid.' },
    { tag: 'observe', zh: '鎂帶冒出大量泡泡，仲會慢慢變細，最後消失！呢啲泡泡係「氫氣」。好多金屬遇到酸都會產生氫氣，不過唔係全部，例如銅就唔會。',
      en: 'The magnesium makes lots of bubbles and slowly shrinks until it disappears! These bubbles are hydrogen gas. Many metals make hydrogen with acids, but not all of them: copper does not, for example.' },
    { tag: 'try', action: { id: 'splint', events: ['spl_'] }, zh: '點樣知道兩個瓶入面係咩氣體？用「火柴偵探」！將點著嘅木條拖到兩個瓶口，一個一個測試。',
      en: 'How can we tell which gas is in each flask? Use the burning-splint detective! Drag the burning splint to the mouth of each flask, one at a time.' },
    { tag: 'feynman', zh: '用一句說話講：氫氣好易燒，遇到火會「噗」一聲；二氧化碳唔會燒，仲會趕走火需要嘅氧氣，所以火會熄。有啲滅火筒入面就係裝住二氧化碳！',
      en: 'In one sentence: hydrogen burns easily, so it pops when it meets a flame; carbon dioxide does not burn and pushes away the oxygen a flame needs, so the flame goes out. Some fire extinguishers are filled with carbon dioxide!' },
    { tag: 'first', zh: '由最基本諗起：點解唔同嘅酸，例如醋同鹽酸，都有相同嘅特性？因為所有酸溶喺水入面，都會放出「氫離子」。氫離子遇到鎂呢類金屬，會由金屬度攞走極細嘅粒子，自己孖埋變成氫氣；遇到碳酸鈣，就會將佢拆開，放出二氧化碳。',
      en: 'Back to basics: why do different acids, like vinegar and hydrochloric acid, behave in the same ways? Because every acid releases hydrogen ions in water. Hydrogen ions take tiny particles from metals like magnesium and pair up to become hydrogen gas. With calcium carbonate, they break it apart and release carbon dioxide.' },
    { tag: 'life', zh: '生活應用：水煲入面白色嘅水垢係碳酸鈣，可以用醋清走；酸雨會慢慢蝕壞大理石雕像；汽水有氣，係因為入面溶咗二氧化碳。',
      en: 'Everyday life: the white scale inside a kettle is calcium carbonate, so vinegar can clean it away; acid rain slowly wears away marble statues; and fizzy drinks bubble because carbon dioxide is dissolved in them.' },
    { tag: 'quiz', zh: '最後，一齊做個思考挑戰！', en: 'Finally, a thinking challenge!' },
  ],
  events,
  quiz: {
    q: { zh: '點解可以用醋清走水煲入面白色嘅水垢？', en: 'Why can vinegar clean the white scale out of a kettle?' },
    options: [
      { zh: '因為醋會令水垢結冰', en: 'Because vinegar freezes the scale' },
      { zh: '因為水垢係碳酸鈣，醋入面嘅酸會同佢反應，將佢溶走', en: 'Because the scale is calcium carbonate, and the acid in vinegar reacts with it and dissolves it' },
      { zh: '因為醋會將水垢變成金屬', en: 'Because vinegar turns the scale into metal' },
    ],
    correct: 1,
    right: { zh: '酸同碳酸鈣反應，會變成溶得落水嘅物質同埋二氧化碳，所以水垢會冒泡，然後慢慢消失。', en: 'The acid reacts with calcium carbonate to make substances that dissolve in water, plus carbon dioxide. So the scale fizzes and slowly disappears.' },
    wrong: { zh: '再諗下蛋殼實驗：蛋殼同水垢都係碳酸鈣，佢哋遇到酸會點？', en: 'Think about the eggshell: eggshell and kettle scale are both calcium carbonate. What happens when they meet an acid?' },
  },
  tools: [
    { id: 'a', label: { zh: '蛋殼放落白醋', en: 'Eggshell into vinegar' }, run: (c) => c.addShell() },
    { id: 'b', label: { zh: '鎂帶放落稀鹽酸', en: 'Magnesium into acid' }, run: (c) => c.addMg() },
    { id: 'c', label: { zh: '測試 A 瓶氣體', en: 'Test gas in A' }, run: (c) => c.test('A') },
    { id: 'd', label: { zh: '測試 B 瓶氣體', en: 'Test gas in B' }, run: (c) => c.test('B') },
  ],
  Panel,

  build(scene, api) {
    const tw = api.tween;
    const S = { shell: false, mg: false, testA: false, testB: false };
    const push = () => api.state({ ...S });
    const LV = 0.32, FS = 1.1; // 液面、錐形瓶大細
    const mkFlask = (x, color, name) => {
      const v = K.makeVessel(K.flaskProfile(FS), { liquidColor: color, level: LV, opacity: 0.75, sx: 0.93 });
      v.group.position.set(x, T + 0.01, -0.25); scene.add(v.group);
      const lab = api.label(name, { border: '#f59e0b', h: 0.2 }); lab.position.set(x, T + 1.3, -0.25);
      return { ...v, x, lab, mouth: V3(x, T + 0.01 + 0.92 * FS, -0.25) };
    };
    const A = mkFlask(-1.15, '#f2e6c4', { zh: 'A：白醋', en: 'A: vinegar' });
    const B = mkFlask(1.15, '#cfe8fb', { zh: 'B：稀鹽酸', en: 'B: dilute acid' });
    api.tap(A.group, () => api.emit('flaskA'), { zh: '白醋錐形瓶', en: 'Flask of vinegar' }, [A.lab]);
    api.tap(B.group, () => api.emit('flaskB'), { zh: '稀鹽酸錐形瓶', en: 'Flask of dilute acid' }, [B.lab]);
    const bubA = K.makeBubbles(A.group, { size: 0.036 }), bubB = K.makeBubbles(B.group, { max: 220, size: 0.036 });

    // 後排：生活中的酸
    const deco = [];
    const lemon = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), K.stdMat('#fde047', 0.5)); lemon.scale.set(1.25, 1, 1); lemon.position.set(-2.7, T + 0.2, -1.2); scene.add(lemon);
    const vb = K.makeBottle({ body: '#f5f0e6', cap: '#ef4444' }); vb.g.position.set(-2.0, T, -1.25); scene.add(vb.g);
    const can = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.5, 24), K.stdMat('#ef4444', 0.35, 0.5)); can.position.set(2.0, T + 0.25, -1.25); scene.add(can);
    const lab = K.makeBottle({ body: '#e0f2fe', cap: '#334155' }); lab.g.position.set(2.75, T, -1.2); scene.add(lab.g);
    const warn = new THREE.Mesh(new THREE.CircleGeometry(0.08, 3), new THREE.MeshBasicMaterial({ color: '#f97316' })); warn.position.set(0, 0.22, 0.228); lab.g.add(warn);
    [[lemon, 'lemon', { zh: '檸檬', en: 'Lemon' }, -2.7], [vb.g, 'vbottle', { zh: '醋', en: 'Vinegar' }, -2.0], [can, 'soda', { zh: '汽水', en: 'Fizzy drink' }, 2.0], [lab.g, 'labacid', { zh: '稀鹽酸', en: 'Dilute acid' }, 2.75]].forEach(([o, ev, name, x]) => {
      const l = api.label(name, { border: '#cbd5e1', h: 0.2 }); l.position.set(x, T + 0.95, -1.2);
      api.tap(o, () => api.emit(ev), name, [l]); deco.push(o);
    });

    // 工具：蛋殼
    const shell = new THREE.Group(); shell.position.set(-2.55, T + 0.06, 0.9); scene.add(shell);
    const shellMat = new THREE.MeshStandardMaterial({ color: '#fbf3e4', roughness: 0.6, side: THREE.DoubleSide });
    [[0, 0, 0, 0], [0.12, 0.02, 0.05, 1.2], [-0.1, 0.01, -0.06, 2.4]].forEach(([x, y, z, r]) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 10, 0, Math.PI * 0.9, 0, Math.PI * 0.45), shellMat);
      m.position.set(x, y, z); m.rotation.set(Math.PI, r, 0.3); shell.add(m);
    });
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.04, 28), K.stdMat('#e2e8f0', 0.5)); dish.position.set(-2.55, T + 0.02, 0.9); scene.add(dish);
    const lShell = api.label({ zh: '蛋殼', en: 'Eggshell' }, { border: '#d6a85c', h: 0.18 }); lShell.position.set(0, 0.0, 0.42); shell.add(lShell);
    // 工具：鎂帶
    const mg = new THREE.Group(); mg.position.set(-0.1, T + 0.05, 0.95); scene.add(mg);
    const mgMat = K.stdMat('#cbd5e1', 0.25, 0.9);
    for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.012, 0.05), mgMat); s.position.set(-0.24 + i * 0.12, 0.02 + (i % 2) * 0.03, 0); s.rotation.z = (i % 2 ? -0.4 : 0.4); mg.add(s); }
    const lMg = api.label({ zh: '鎂帶', en: 'Magnesium ribbon' }, { border: '#94a3b8', h: 0.18 }); lMg.position.set(0, -0.02, 0.4); mg.add(lMg);
    // 工具：點著嘅木條（火焰喺 (0, 0.62)）
    const splint = new THREE.Group(); splint.position.set(2.45, T + 0.08, 0.85); scene.add(splint);
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.6, 10), K.stdMat('#c08a4a', 0.8)); stick.position.y = 0.3; splint.add(stick);
    const tipChar = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 8), K.stdMat('#292524', 0.9)); tipChar.position.y = 0.6; splint.add(tipChar);
    const flame = new THREE.Group(); flame.position.y = 0.62; splint.add(flame);
    const fOuter = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 16), new THREE.MeshBasicMaterial({ color: '#fb923c', transparent: true, opacity: 0.85 })); fOuter.position.y = 0.08;
    const fInner = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.11, 12), new THREE.MeshBasicMaterial({ color: '#fde68a' })); fInner.position.y = 0.05;
    flame.add(fOuter, fInner);
    const holder = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.1, 20), K.stdMat('#64748b', 0.5)); holder.position.set(2.45, T + 0.05, 0.85); scene.add(holder);
    const lSp = api.label({ zh: '點著嘅木條', en: 'Burning splint' }, { border: '#f97316', h: 0.18 }); lSp.position.set(0, 0.0, 0.42); splint.add(lSp);
    const smoke = K.makeSteam(scene);
    let smokeOn = 0; const smokePos = V3(0, 0, 0);

    let busy = false, flameOn = true, mgLeft = 1, reactA = false, reactB = false;
    const tgtA = () => [{ key: 'A', pos: A.mouth, r: 0.5, ringY: T, accept: () => !S.shell && !busy }];
    const tgtB = () => [{ key: 'B', pos: B.mouth, r: 0.5, ringY: T, accept: () => !S.mg && !busy }];
    const tgtSp = () => [
      { key: 'A', pos: A.mouth, r: 0.5, ringY: T, accept: () => !S.testA && !busy },
      { key: 'B', pos: B.mouth, r: 0.5, ringY: T, accept: () => !S.testB && !busy },
    ];

    async function dropInto(obj, F, inside, scale) {
      const over = V3(F.x, F.mouth.y + 0.45, F.mouth.z);
      await K.moveTo(tw, obj, over, 0, 0.5);
      const from = obj.position.clone(), s0 = obj.scale.x;
      await tw.to(0.7, (k) => { obj.position.lerpVectors(from, inside, k * k); obj.scale.setScalar(s0 + (scale - s0) * k); });
      K.ripple(scene, tw, V3(F.x, T + 0.01 + LV, F.mouth.z));
    }
    async function addShell() {
      if (S.shell || busy) return false; busy = true;
      lShell.visible = false;
      await dropInto(shell, A, V3(A.x, T + 0.06, -0.25), 0.55);
      reactA = true; S.shell = true; push(); api.emit('shell'); api.done('shell'); busy = false;
    }
    async function addMg() {
      if (S.mg || busy) return false; busy = true;
      lMg.visible = false;
      await dropInto(mg, B, V3(B.x, T + 0.06, -0.25), 0.6);
      reactB = true; S.mg = true; push(); api.emit('mg'); api.done('mg'); busy = false;
    }
    async function test(which, h = hSp) {
      if (busy || !flameOn) return false; const F = which === 'A' ? A : B;
      if ((which === 'A' && S.testA) || (which === 'B' && S.testB)) return false;
      busy = true;
      const hasGas = which === 'A' ? S.shell : S.mg;
      const target = V3(F.x, F.mouth.y + 0.05, F.mouth.z);
      await K.moveTo(tw, splint, K.tipPose(V2(0, 0.66), 2.3, target), 2.3, 0.7);
      if (!hasGas) { api.emit('spl_nogas'); await tw.wait(0.6); await h.returnHome(); busy = false; return; }
      if (which === 'B') {
        const flash = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14), new THREE.MeshBasicMaterial({ color: '#fff7ae', transparent: true, opacity: 0.9 }));
        flash.position.copy(target); scene.add(flash);
        api.emit('spl_pop');
        K.popText(scene, tw, '噗！Pop!', V3(F.x, F.mouth.y + 0.5, F.mouth.z), '#f97316');
        await tw.to(0.35, (k) => { flash.scale.setScalar(1 + k * 2.5); flash.material.opacity = 0.9 * (1 - k); }, K.lin);
        scene.remove(flash); flash.geometry.dispose(); flash.material.dispose();
        S.testB = true;
      } else {
        api.emit('spl_out');
        await tw.to(0.7, (k) => flame.scale.setScalar(Math.max(0.001, 1 - k)));
        flameOn = false; smokeOn = 1.5; smokePos.copy(target);
        K.popText(scene, tw, '熄咗！Out!', V3(F.x, F.mouth.y + 0.5, F.mouth.z), '#64748b');
        S.testA = true;
      }
      push();
      await tw.wait(0.5);
      await h.returnHome();
      if (!flameOn) { await tw.to(0.5, (k) => flame.scale.setScalar(Math.max(0.001, k))); flameOn = true; if (!(S.testA && S.testB)) api.emit('relight'); }
      busy = false;
      if (S.testA && S.testB) api.done('splint');
    }
    const hShell = api.drag(shell, { label: { zh: '蛋殼', en: 'Eggshell' }, lift: 0.9, extra: [dish], enabled: () => !busy && !S.shell, targets: tgtA, onDrop: () => addShell(), onTap: () => addShell() });
    const hMg = api.drag(mg, { label: { zh: '鎂帶', en: 'Magnesium ribbon' }, lift: 0.9, enabled: () => !busy && !S.mg, targets: tgtB, onDrop: () => addMg(), onTap: () => addMg() });
    const hSp = api.drag(splint, { label: { zh: '點著嘅木條', en: 'Burning splint' }, lift: 0.9, extra: [holder], enabled: () => !busy && flameOn, targets: tgtSp,
      onDrop: (tg, h) => test(tg.key, h), onTap: () => test(!S.testA && S.shell ? 'A' : !S.testB && S.mg ? 'B' : !S.testA ? 'A' : 'B') });

    async function demo(id) {
      while (busy) await tw.wait(0.1);
      if (id === 'shell') await hShell.dropOn('A');
      if (id === 'mg') await hMg.dropOn('B');
      if (id === 'splint') {
        if (!S.testA) { await hSp.dropOn('A'); await api.waitSpeech(); }
        while (busy) await tw.wait(0.1);
        if (!S.testB) { await hSp.dropOn('B'); await api.waitSpeech(); }
      }
    }
    push();
    return {
      cam: { pos: [0, 3.9, 5.0], target: [0, 1.3, -0.1], fitW: 5.9 },
      addShell, addMg, test: (w) => test(w), demo,
      getHint(id) {
        if (id === 'shell') return { from: K.worldOf(shell, 0.2), to: A.mouth };
        if (id === 'mg') return { from: K.worldOf(mg, 0.2), to: B.mouth };
        if (id === 'splint') return { from: K.worldOf(splint, 0.5), to: !S.testA ? A.mouth : B.mouth };
        return null;
      },
      update(dt, t) {
        if (reactA && Math.random() < dt * 14) bubA.spawn((Math.random() - 0.5) * 0.25, 0.08, (Math.random() - 0.5) * 0.25, LV - 0.01, 0.8);
        if (reactB && mgLeft > 0) {
          for (let i = 0; i < 2; i++) if (Math.random() < dt * 22) bubB.spawn((Math.random() - 0.5) * 0.3, 0.08, (Math.random() - 0.5) * 0.3, LV - 0.01, 1.1);
          mgLeft = Math.max(0, mgLeft - dt / 30); mg.scale.setScalar(0.6 * Math.max(0.02, mgLeft));
          if (mgLeft <= 0) mg.visible = false;
        }
        bubA.update(dt, t); bubB.update(dt, t);
        if (flameOn) { const f = 1 + Math.sin(t * 22) * 0.08 + Math.sin(t * 13) * 0.05; fOuter.scale.set(1, f, 1); }
        if (smokeOn > 0) smokeOn -= dt;
        smoke.update(dt, t, smokeOn > 0, smokePos, 0.1);
      },
      reset() {
        tw.clear(); busy = false; reactA = reactB = false; mgLeft = 1; flameOn = true; smokeOn = 0; smoke.clear();
        Object.assign(S, { shell: false, mg: false, testA: false, testB: false }); push();
        bubA.clear(); bubB.clear();
        [hShell, hMg, hSp].forEach((h) => { h.obj.position.copy(h.home); h.obj.rotation.copy(h.homeRot); h.obj.scale.setScalar(1); h.obj.visible = true; h.busy = false; });
        lShell.visible = true; lMg.visible = true; flame.scale.setScalar(1);
      },
    };
  },
};
