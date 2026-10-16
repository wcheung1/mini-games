/* =====================================================================
 * 共用工具（kit）＋ 實驗室房間（world）
 * 每個實驗枱都會用到：材質、網格、文字標籤、歷史數據、人物、黑板
 * ===================================================================== */

// 圖表顏色（已用色盲檢查工具驗證）
export const C = { red: '#dc2626', blue: '#2563eb', amber: '#d97706', teal: '#0d9488', ink: '#334155' };

export function makeKit(THREE, CSS2DObject) {
  const std = (color, rough = 0.6, metal = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
  const basic = (color, extra = {}) => new THREE.MeshBasicMaterial({ color, ...extra });
  const hiddenMat = new THREE.MeshBasicMaterial({ visible: false });
  const glass = (color = 0xbfdbfe, opacity = 0.28) => new THREE.MeshStandardMaterial({ color, roughness: 0.05, metalness: 0, transparent: true, opacity, depthWrite: false });
  function mesh(geo, mat, x = 0, y = 0, z = 0, parent = null, shadow = true) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (shadow) { m.castShadow = true; m.receiveShadow = true; }
    if (parent) parent.add(m);
    return m;
  }
  function canvasTex(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    t.userData.canvas = c;
    return t;
  }
  function tag(cls, parent, x = 0, y = 0, z = 0) {
    const el = document.createElement('div'); el.className = cls;
    const o = new CSS2DObject(el); o.position.set(x, y, z); parent.add(o);
    return { el, o };
  }
  // 細長方塊：由 (x1,y1,z1) 到 (x2,y2,z2) 的線段（光線、電線、箭咀身）
  function beam(parent, mat, w = 0.04) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(1, w, w), mat); parent.add(m);
    const a = new THREE.Vector3(), b = new THREE.Vector3();
    m.set = (x1, y1, z1, x2, y2, z2) => {
      a.set(x1, y1, z1); b.set(x2, y2, z2);
      const len = a.distanceTo(b); m.visible = len > 1e-4;
      if (!m.visible) return m;
      m.scale.set(len, 1, 1); m.position.copy(a).add(b).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), b.clone().sub(a).normalize());
      return m;
    };
    return m;
  }
  // 一組可重用的線段（數量會變的東西，例如光線）
  function beamPool(parent, w = 0.035) {
    const pool = [];
    return {
      draw(segs) { // segs: [{a:[x,y,z], b:[x,y,z], color, opacity}]
        while (pool.length < segs.length) {
          const mat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 1, depthWrite: false });
          pool.push(beam(parent, mat, w));
        }
        pool.forEach((m, i) => {
          const s = segs[i];
          if (!s) { m.visible = false; return; }
          m.set(...s.a, ...s.b);
          m.material.color.set(s.color ?? 0xff2d2d); m.material.opacity = s.opacity ?? 1;
        });
      }
    };
  }
  const sg = (n, d = 2) => (!Number.isFinite(n) ? '—' : Math.abs(n) < 0.5 * Math.pow(10, -d) ? (0).toFixed(d) : (n > 0 ? '+' : '−') + Math.abs(n).toFixed(d));
  const f = (n, d = 2) => (!Number.isFinite(n) ? '—' : n.toFixed(d));
  // 時間序列（給圖表）
  class Hist {
    constructor(keys, cap = 1800) { this.keys = keys; this.cap = cap; this.reset(); }
    reset() { this.t = []; this.c = {}; this.keys.forEach((k) => (this.c[k] = [])); this.ev = []; }
    push(t, row) { this.t.push(t); for (const k of this.keys) this.c[k].push(row[k] ?? NaN); if (this.t.length > this.cap) { this.t.shift(); this.keys.forEach((k) => this.c[k].shift()); } }
    last(k) { const a = this.c[k]; return a.length ? a[a.length - 1] : NaN; }
    get n() { return this.t.length; }
  }
  const L2 = (lang) => (o) => (o ? o[lang()] ?? o.zh : '');
  return { std, basic, glass, hiddenMat, mesh, canvasTex, tag, beam, beamPool, sg, f, Hist, L2, C };
}

/* ---------------------------------------------------------------------
 * 實驗室房間：地板、牆、窗、黑板、儀器櫃、陳老師、小明
 * ------------------------------------------------------------------- */
export function buildWorld(THREE, kit, scene) {
  const { std, mesh, canvasTex, tag, hiddenMat } = kit;
  const g = new THREE.Group(); scene.add(g);
  const tiles = canvasTex(512, 512, (c, w, h) => {
    c.fillStyle = '#eef2f7'; c.fillRect(0, 0, w, h); c.strokeStyle = '#d5dde8'; c.lineWidth = 4;
    for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 128, 0); c.lineTo(i * 128, h); c.stroke(); c.beginPath(); c.moveTo(0, i * 128); c.lineTo(w, i * 128); c.stroke(); }
  });
  tiles.wrapS = tiles.wrapT = THREE.RepeatWrapping; tiles.repeat.set(12, 12);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(48, 48), new THREE.MeshStandardMaterial({ map: tiles, roughness: 0.9 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; g.add(floor);
  mesh(new THREE.BoxGeometry(48, 9, 0.2), std(0xf8fafc, 0.95), 0, 4.5, -7.5, g, false);
  mesh(new THREE.BoxGeometry(48, 0.6, 0.25), std(0xcbd5e1, 0.8), 0, 0.3, -7.38, g, false);
  for (const x of [-11, 11]) {
    mesh(new THREE.BoxGeometry(4.2, 3.2, 0.1), std(0xbae6fd, 0.2, 0, { emissive: 0x7dd3fc, emissiveIntensity: 0.35 }), x, 4.4, -7.36, g, false);
    mesh(new THREE.BoxGeometry(4.5, 0.15, 0.2), std(0xffffff), x, 2.75, -7.3, g, false);
    mesh(new THREE.BoxGeometry(0.12, 3.2, 0.14), std(0xffffff), x, 4.4, -7.3, g, false);
  }
  // 黑板（每個實驗枱可以換內容）
  const boardMat = new THREE.MeshStandardMaterial({ roughness: 0.95 });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.1), boardMat);
  board.position.set(0, 3.2, -7.35); g.add(board);
  mesh(new THREE.BoxGeometry(8.3, 3.4, 0.08), std(0x92400e, 0.8), 0, 3.2, -7.42, g, false);
  function setBoard(b) {
    const tex = canvasTex(1024, 400, (c) => {
      c.fillStyle = '#14532d'; c.fillRect(0, 0, 1024, 400);
      c.strokeStyle = 'rgba(255,255,255,.06)'; c.lineWidth = 3;
      for (let i = 0; i < 24; i++) { c.beginPath(); c.moveTo(Math.random() * 1024, Math.random() * 400); c.lineTo(Math.random() * 1024, Math.random() * 400); c.stroke(); }
      c.textAlign = 'center'; c.fillStyle = '#f8fafc';
      const lines = b.lines || [], slot = 1000 / Math.max(1, lines.length);
      lines.forEach((ln, i) => {
        let fs = 58;
        do { c.font = `bold ${fs}px "Chalkboard SE", "Comic Sans MS", sans-serif`; fs -= 2; } while (c.measureText(ln).width > slot - 36 && fs > 22);
        c.fillText(ln, 12 + slot * (i + 0.5), 125);
      });
      c.fillStyle = '#fde68a'; c.font = 'bold 42px "Chalkboard SE", "PingFang HK", sans-serif';
      c.fillText(b.title || '', 512, 240);
      if (b.sub) { c.fillStyle = '#bbf7d0'; c.font = '34px "Chalkboard SE", "PingFang HK", sans-serif'; c.fillText(b.sub, 512, 320); }
    });
    if (boardMat.map) boardMat.map.dispose();
    boardMat.map = tex; boardMat.needsUpdate = true;
  }
  // 儀器櫃（裝飾）
  const shelf = new THREE.Group(); shelf.position.set(-8.6, 0, -6.4); g.add(shelf);
  mesh(new THREE.BoxGeometry(3.2, 2.2, 1), std(0xe2e8f0, 0.7), 0, 1.1, 0, shelf);
  mesh(new THREE.BoxGeometry(3.3, 0.08, 1.05), std(0x94a3b8, 0.5), 0, 2.24, 0, shelf);
  const gl = kit.glass(0x93c5fd, 0.55);
  [[-1.1, 0x22c55e], [-0.4, 0xf97316], [0.4, 0xa855f7], [1.1, 0x06b6d4]].forEach(([x, c], i) => {
    mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.5, 20), gl, x, 2.53, 0, shelf);
    mesh(new THREE.CylinderGeometry(0.15, 0.19, 0.25, 20), std(c, 0.3, 0, { transparent: true, opacity: 0.8 }), x, 2.42, 0, shelf);
    if (i % 2) mesh(new THREE.SphereGeometry(0.22, 20, 14), gl, x, 2.95, 0, shelf);
  });

  function makePerson(o) {
    const p = new THREE.Group();
    const skin = std(0xf2c9a0, 0.7), hair = std(o.hair, 0.9), top = std(o.top, 0.7), bottom = std(o.bottom, 0.7);
    for (const sx of [-0.1, 0.1]) {
      mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.75, 12), o.bareLegs ? skin : bottom, sx, 0.375, 0, p);
      mesh(new THREE.BoxGeometry(0.14, 0.08, 0.26), std(0x334155), sx, 0.04, 0.04, p);
    }
    if (o.shorts) mesh(new THREE.CylinderGeometry(0.23, 0.25, 0.26, 16), bottom, 0, 0.72, 0, p);
    if (o.coat) mesh(new THREE.CylinderGeometry(0.26, 0.32, 0.45, 16), top, 0, 0.78, 0, p);
    mesh(new THREE.CapsuleGeometry(0.24, 0.42, 6, 16), top, 0, 1.12, 0, p);
    if (o.badge) mesh(new THREE.BoxGeometry(0.08, 0.08, 0.02), std(o.badge), 0.1, 1.3, 0.235, p);
    if (o.tie) mesh(new THREE.BoxGeometry(0.06, 0.26, 0.02), std(o.tie), 0, 1.25, 0.24, p);
    const arms = [];
    for (const sx of [-1, 1]) {
      const piv = new THREE.Group(); piv.position.set(sx * 0.31, 1.45, 0); p.add(piv);
      mesh(new THREE.CapsuleGeometry(0.065, 0.4, 4, 10), top, 0, -0.26, 0, piv);
      mesh(new THREE.SphereGeometry(0.075, 12, 10), skin, 0, -0.53, 0, piv);
      piv.rotation.z = sx * 0.12; arms.push(piv);
    }
    const head = new THREE.Group(); head.position.set(0, 1.78, 0); p.add(head);
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
    const hit = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 2.1, 12), hiddenMat); hit.position.y = 1.05; p.add(hit);
    const t = tag('name-tag', p, 0, 2.3, 0);
    p.scale.setScalar(o.scale);
    g.add(p);
    return { g: p, head, arms, hit, tagEl: t.el, key: o.key, phase: Math.random() * 6, waveT: 0, jumpT: 0, baseRotY: 0 };
  }
  const people = [
    makePerson({ key: 'chan', scale: 1, top: 0xffffff, bottom: 0x334155, hair: 0x1f2937, coat: true, glasses: true, bun: true, badge: 0x4f46e5 }),
    makePerson({ key: 'ming', scale: 0.75, top: 0xf8fafc, bottom: 0x1e3a8a, hair: 0x111827, shorts: true, bareLegs: true, tie: 0xdc2626 })
  ];
  function placePeople(pos) {
    const P = pos || [[-4.3, -2.3, 0.45], [4.3, -2.3, -0.45]];
    people.forEach((p, i) => { p.g.position.set(P[i][0], 0, P[i][1]); p.baseRotY = P[i][2] ?? 0; });
  }
  placePeople();
  function update(dt, time, speaker) {
    for (const p of people) {
      const talking = speaker === p.key;
      let y = Math.sin(time * 2 + p.phase) * 0.015;
      if (p.jumpT > 0) { p.jumpT -= dt; y += Math.sin(Math.min(1, Math.max(0, 1 - p.jumpT / 0.6)) * Math.PI) * 0.35; }
      p.g.position.y = y; p.g.rotation.y = p.baseRotY;
      p.head.rotation.x = talking ? Math.sin(time * 9) * 0.08 : Math.sin(time * 1.3 + p.phase) * 0.03;
      p.head.rotation.z = talking ? Math.sin(time * 4) * 0.05 : 0;
      const arm = p.arms[1];
      if (p.waveT > 0) { p.waveT -= dt; arm.rotation.z = 2.6 + Math.sin(time * 14) * 0.35; }
      else if (talking) arm.rotation.z = 0.5 + Math.sin(time * 5) * 0.35;
      else arm.rotation.z += (0.12 - arm.rotation.z) * Math.min(1, dt * 6);
    }
  }
  const pickables = [{ obj: board, kind: 'board' }, ...people.map((p) => ({ obj: p.hit, kind: 'person', id: p.key }))];
  return {
    group: g, people, setBoard, placePeople, update, pickables,
    labels(names) { people.forEach((p) => (p.tagEl.textContent = (p.key === 'chan' ? '👩‍🔬 ' : '👦 ') + names[p.key])); },
    wave(id) { const p = people.find((q) => q.key === id); if (p) p.waveT = 1.6; },
    cheer() { people[1].jumpT = 0.6; }
  };
}
