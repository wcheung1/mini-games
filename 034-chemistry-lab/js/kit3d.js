/* =====================================================================
   3D 工具箱：所有實驗共用嘅物件同效果
   （容器、液體、標籤、氣泡、沉澱、水流、水蒸氣、電熱板、動畫）
   ===================================================================== */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export { THREE, RoundedBoxGeometry };

export const TABLE_Y = 1.0;
export const V2 = (x, y) => new THREE.Vector2(x, y);
export const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
export const easeIO = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const lin = (k) => k;
export const clamp01 = (v) => Math.max(0, Math.min(1, v));
export const smooth = (a, b, v) => { const k = clamp01((v - a) / (b - a)); return k * k * (3 - 2 * k); };

/* ---------- 物料 ---------- */
export function glassMat() {
  return new THREE.MeshPhysicalMaterial({ color: 0xeef9ff, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.2,
    side: THREE.DoubleSide, depthWrite: false, clearcoat: 1, clearcoatRoughness: 0.08 });
}
export const liquidMat = (c, o = 0.85) => new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: o, roughness: 0.35, metalness: 0, depthWrite: false, envMapIntensity: 0.4 });
export const stdMat = (c, r = 0.6, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });

/* ---------- 形狀 ---------- */
export function tubeProfile(r, h, seg = 10) {
  const p = [];
  for (let i = 0; i <= seg; i++) { const a = -Math.PI / 2 + (i / seg) * (Math.PI / 2); p.push(V2(Math.max(0, Math.cos(a) * r), r + Math.sin(a) * r)); }
  p.push(V2(r, h));
  return p;
}
export const flaskProfile = (s = 1) => [V2(0, 0), V2(0.38 * s, 0), V2(0.4 * s, 0.04 * s), V2(0.39 * s, 0.1 * s), V2(0.12 * s, 0.62 * s), V2(0.12 * s, 0.9 * s), V2(0.135 * s, 0.92 * s)];
export const beakerProfile = (r = 0.4, h = 0.85) => [V2(0, 0), V2(r, 0), V2(r, h), V2(r + 0.05, h + 0.05)];

function clipProfile(pts, level, sx, oy) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], y = p.y + oy;
    if (y <= level) out.push(V2(p.x * sx, y));
    else {
      const q = pts[i - 1];
      if (q) { const qy = q.y + oy; const k = (level - qy) / (y - qy); out.push(V2((q.x + (p.x - q.x) * k) * sx, level)); }
      break;
    }
  }
  const last = out[out.length - 1];
  if (last && last.y < level - 1e-4) out.push(V2(last.x, level));
  out.push(V2(0, level));
  return out;
}
// 有液體嘅容器：setLevel(高度) 會即時改液面
export function makeVessel(profile, { liquidColor = '#bfe6ff', level = 0, opacity = 0.85, sx = 0.9, oy = 0.012, mat = null, rim = true } = {}) {
  const group = new THREE.Group();
  const shell = new THREE.Mesh(new THREE.LatheGeometry(profile, 40), mat || glassMat());
  shell.renderOrder = 3; group.add(shell);
  if (rim) {
    const top = profile[profile.length - 1];
    const r = new THREE.Mesh(new THREE.TorusGeometry(top.x, 0.013, 8, 48), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.25, transparent: true, opacity: 0.8 }));
    r.rotation.x = Math.PI / 2; r.position.y = top.y; r.renderOrder = 3; group.add(r);
  }
  const lmat = liquidMat(liquidColor, opacity);
  const liquid = new THREE.Mesh(new THREE.BufferGeometry(), lmat);
  liquid.renderOrder = 2; group.add(liquid);
  let cur = -1;
  function setLevel(l) {
    if (Math.abs(l - cur) < 1e-4) return;
    cur = l;
    liquid.geometry.dispose();
    if (l <= oy + 0.004) { liquid.visible = false; liquid.geometry = new THREE.BufferGeometry(); return; }
    liquid.visible = true;
    liquid.geometry = new THREE.LatheGeometry(clipProfile(profile, l, sx, oy), 40);
  }
  setLevel(level);
  return { group, shell, liquid, setLevel, getLevel: () => cur, mat: lmat };
}
export function makeRack(xs, holeR, width, depth = 0.8) {
  const g = new THREE.Group(); const wood = stdMat('#f1c48f', 0.75);
  const base = new THREE.Mesh(new THREE.BoxGeometry(width, 0.06, depth), wood); base.position.y = 0.03; g.add(base);
  const sh = new THREE.Shape();
  sh.moveTo(-width / 2, -depth / 2); sh.lineTo(width / 2, -depth / 2); sh.lineTo(width / 2, depth / 2); sh.lineTo(-width / 2, depth / 2); sh.closePath();
  xs.forEach((x) => { const hole = new THREE.Path(); hole.absarc(x, 0, holeR, 0, Math.PI * 2, true); sh.holes.push(hole); });
  const plank = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.06, bevelEnabled: false, curveSegments: 24 }), wood);
  plank.rotation.x = -Math.PI / 2; plank.position.y = 0.55; g.add(plank);
  [-1, 1].forEach((s) => { const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, depth), wood); post.position.set(s * (width / 2 - 0.04), 0.3, 0); g.add(post); });
  return g;
}
// 試劑樽 / 滴瓶（原點喺樽底；樽口喺 (0, 0.86)）
export function makeBottle({ body = '#ffffff', cap = '#0ea5e9', dropper = false, glass = false } = {}) {
  const g = new THREE.Group();
  const prof = [V2(0, 0), V2(0.2, 0), V2(0.22, 0.04), V2(0.22, 0.42), V2(0.13, 0.53), V2(0.085, 0.57), V2(0.085, 0.64)];
  const bodyMat = glass ? new THREE.MeshPhysicalMaterial({ color: body, roughness: 0.1, transmission: 0, transparent: true, opacity: 0.85, clearcoat: 1 })
    : new THREE.MeshPhysicalMaterial({ color: body, roughness: 0.15, clearcoat: 1 });
  const b = new THREE.Mesh(new THREE.LatheGeometry(prof, 32), bodyMat);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.224, 0.224, 0.16, 32, 1, true), stdMat('#ffffff', 0.8)); band.position.y = 0.22;
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.055, 24), new THREE.MeshBasicMaterial({ color: cap })); dot.position.set(0, 0.22, 0.227);
  g.add(b, band, dot);
  let capM;
  if (dropper) {
    capM = new THREE.Group();
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 24), stdMat('#334155', 0.5)); collar.position.y = 0.04;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 14), stdMat(cap, 0.5)); bulb.scale.set(1, 1.3, 1); bulb.position.y = 0.16;
    capM.add(collar, bulb); capM.position.y = 0.64;
  } else {
    capM = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.14, 24), stdMat(cap, 0.45)); capM.position.y = 0.7;
  }
  g.add(capM);
  return { g, cap: capM, bodyMat };
}

/* ---------- 標籤（跟語言轉） ---------- */
export const FONT = '"Noto Sans TC", "PingFang HK", "Microsoft JhengHei", system-ui, sans-serif';
export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
export function makeLabel(texts, { border = '#38bdf8', fg = '#1e293b', bg = '#ffffff', h = 0.22 } = {}) {
  const mat = new THREE.SpriteMaterial({ transparent: true, depthTest: false });
  const spr = new THREE.Sprite(mat); spr.renderOrder = 20;
  let lastLang = 'zh';
  function draw(str) {
    const fs = 64, pad = 30;
    const c = document.createElement('canvas'); const x = c.getContext('2d');
    x.font = `900 ${fs}px ${FONT}`;
    const w = Math.ceil(x.measureText(str).width) + pad * 2, hh = Math.round(fs + pad * 1.4);
    c.width = w; c.height = hh;
    x.font = `900 ${fs}px ${FONT}`;
    roundRect(x, 5, 5, w - 10, hh - 10, hh / 2 - 5); x.fillStyle = typeof bg === 'function' ? bg() : bg; x.fill();
    x.lineWidth = 8; x.strokeStyle = typeof border === 'function' ? border() : border; x.stroke();
    x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(str, w / 2, hh / 2 + 4);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    if (mat.map) mat.map.dispose();
    mat.map = tex; mat.needsUpdate = true;
    spr.scale.set(h * (w / hh), h, 1);
  }
  spr.userData.setLang = (lang) => { lastLang = lang; draw(typeof texts === 'function' ? texts(lang) : (texts[lang] || texts.zh)); };
  spr.userData.refresh = () => spr.userData.setLang(lastLang);
  return spr;
}
// 浮起然後消失嘅大字（例如「噗！」）
export function popText(scene, tw, text, pos, color = '#f97316') {
  const l = makeLabel({ zh: text, en: text }, { border: color, h: 0.32 }); l.userData.setLang('zh');
  l.position.copy(pos); scene.add(l);
  return tw.to(1.4, (e, k) => { l.position.y = pos.y + k * 0.6; l.material.opacity = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3; }, lin)
    .then(() => { scene.remove(l); l.material.map && l.material.map.dispose(); l.material.dispose(); });
}

/* ---------- 提示圈 ---------- */
export function makeHint(r) {
  const m = new THREE.Mesh(new THREE.RingGeometry(r * 0.8, r, 48),
    new THREE.MeshBasicMaterial({ color: '#fbbf24', transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.renderOrder = 1;
  return m;
}
export function pulseHints(hints, t) {
  hints.forEach((h, i) => { if (!h.visible) return; const s = Math.sin(t * 4 + i); h.material.opacity = 0.4 + 0.35 * s; h.scale.setScalar(1 + 0.07 * s); });
}
export function softCircleTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ---------- 動畫 ---------- */
export function makeTweener() {
  const list = [];
  const api = {
    add(dur, u, done, e = easeIO) { const w = { t: 0, dur: Math.max(dur, 1e-4), u, done, e }; list.push(w); return w; },
    to(dur, u, e = easeIO) { return new Promise((res) => api.add(dur, u, res, e)); },
    wait(sec) { return api.to(sec, () => {}, lin); },
    update(dt) {
      for (let i = list.length - 1; i >= 0; i--) {
        const w = list[i]; if (!w) continue;
        w.t += dt; const k = Math.min(1, w.t / w.dur);
        w.u && w.u(w.e(k), k);
        if (k >= 1) { const j = list.indexOf(w); if (j >= 0) list.splice(j, 1); w.done && w.done(); }
      }
    },
    clear() { list.length = 0; },
  };
  return api;
}
// 傾側容器時，個底要擺喺邊，先可以令樽口（tip）對準 target
export function tipPose(tipLocal, rz, target) {
  const c = Math.cos(rz), s = Math.sin(rz);
  return new THREE.Vector3(target.x - (tipLocal.x * c - tipLocal.y * s), target.y - (tipLocal.x * s + tipLocal.y * c), target.z);
}
// 將物件由而家位置移去某姿勢
export function moveTo(tw, obj, pos, rz = 0, dur = 0.7, rx = null) {
  const from = obj.position.clone(), r0 = obj.rotation.z, x0 = obj.rotation.x;
  return tw.to(dur, (k) => { obj.position.lerpVectors(from, pos, k); obj.rotation.z = r0 + (rz - r0) * k; if (rx !== null) obj.rotation.x = x0 + (rx - x0) * k; });
}
export function ripple(scene, tw, p, color = '#ffffff') {
  const m = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.05, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.copy(p); m.position.y += 0.006; m.renderOrder = 4; scene.add(m);
  tw.add(0.7, (e, k) => { m.scale.setScalar(1 + k * 2.2); m.material.opacity = 0.9 * (1 - k); }, () => { scene.remove(m); m.geometry.dispose(); m.material.dispose(); }, lin);
}
// 一滴液體由 from 飛落 to
export async function dripDrop(scene, tw, from, to, color) {
  const d = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), stdMat(color, 0.2));
  d.scale.set(1, 1.25, 1); d.position.copy(from); scene.add(d);
  await tw.to(0.45, (e, k) => { d.position.lerpVectors(from, to, k * k); }, lin);
  scene.remove(d); d.geometry.dispose(); d.material.dispose();
  ripple(scene, tw, to);
}
// 水流
export function makeStream(scene, color = '#3e9cc4', radius = 0.04) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 0.8, 1, 12, 1, true), liquidMat(color, 0.9));
  mesh.visible = false; mesh.renderOrder = 2; scene.add(mesh);
  const UP = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3();
  return {
    mesh,
    set(a, b) {
      dir.subVectors(b, a); const len = dir.length(); dir.normalize();
      mesh.position.copy(a).addScaledVector(dir, len / 2); mesh.quaternion.setFromUnitVectors(UP, dir); mesh.scale.set(1, len, 1); mesh.visible = true;
    },
    hide() { mesh.visible = false; },
  };
}
// 氣泡（座標係 parent 入面）
export function makeBubbles(parent, { max = 160, color = '#ffffff', size = 0.028 } = {}) {
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(size, 10, 8),
    new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.75, roughness: 0.1, depthWrite: false }), max);
  mesh.count = 0; mesh.renderOrder = 4; mesh.frustumCulled = false; parent.add(mesh);
  const ps = []; const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3();
  return {
    spawn(x, y, z, top, s = 1) { if (ps.length < max) ps.push({ x, y, z, top, v: 0.25 + Math.random() * 0.3, s: s * (0.6 + Math.random() * 0.8), ph: Math.random() * 6 }); },
    update(dt, t) {
      for (let i = ps.length - 1; i >= 0; i--) {
        const b = ps[i]; b.y += b.v * dt; b.v += dt * 0.4;
        if (b.y >= b.top) ps.splice(i, 1);
      }
      ps.forEach((b, i) => { p.set(b.x + Math.sin(t * 7 + b.ph) * 0.01, b.y, b.z); sc.setScalar(b.s); mesh.setMatrixAt(i, m4.compose(p, q, sc)); });
      mesh.count = ps.length; mesh.instanceMatrix.needsUpdate = true;
    },
    clear() { ps.length = 0; mesh.count = 0; },
  };
}
// 沉澱（一團團有顏色嘅固體）
export function makeCloud(parent, { color = '#2f7fd6', count = 70, r = 0.12, yMin = 0.4, yMax = 0.65, yBottom = 0.06 } = {}) {
  const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.035, 1), new THREE.MeshStandardMaterial({ color, roughness: 0.9, transparent: true, opacity: 0.85, depthWrite: false }), count);
  mesh.renderOrder = 4; mesh.frustumCulled = false; parent.add(mesh);
  const pts = [...Array(count)].map(() => { const a = Math.random() * 6.28, rho = Math.sqrt(Math.random()) * r; return { x: Math.cos(a) * rho, z: Math.sin(a) * rho, y: yMin + Math.random() * (yMax - yMin), yb: yBottom + Math.random() * 0.12, s: 0.6 + Math.random() * 0.9 }; });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3();
  let grow = 0, settle = 0;
  function apply() {
    pts.forEach((d, i) => { p.set(d.x, d.y + (d.yb - d.y) * settle, d.z); sc.setScalar(Math.max(0.0001, grow * d.s)); mesh.setMatrixAt(i, m4.compose(p, q, sc)); });
    mesh.instanceMatrix.needsUpdate = true;
  }
  apply();
  return { mesh, set(g, s = settle) { grow = g; settle = s; apply(); } };
}
// 水蒸氣
export function makeSteam(scene) {
  const tex = softCircleTexture();
  const ps = [...Array(18)].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false })); s.visible = false; scene.add(s); return { s, life: 0, max: 1 }; });
  return {
    update(dt, t, active, origin, spread = 0.45) {
      ps.forEach((p, i) => {
        if (p.life <= 0) {
          if (active && Math.random() < dt * 7) { p.life = p.max = 1.5 + Math.random(); p.s.position.set(origin.x + (Math.random() - 0.5) * spread, origin.y, origin.z + (Math.random() - 0.5) * spread * 0.8); p.s.visible = true; }
          else { p.s.visible = false; return; }
        }
        p.life -= dt; const a = 1 - p.life / p.max;
        p.s.position.y += dt * 0.55; p.s.position.x += Math.sin(t * 2 + i) * dt * 0.1;
        p.s.scale.setScalar(0.2 + a * 0.55); p.s.material.opacity = 0.7 * Math.sin(Math.PI * clamp01(a));
      });
    },
    clear() { ps.forEach((p) => { p.life = 0; p.s.visible = false; }); },
  };
}
// 電熱板
export function makeHotplate() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.2, 1.0, 3, 0.05), stdMat('#e2e8f0', 0.5)); body.position.y = 0.1; g.add(body);
  const disk = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.02, 40), new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.6, emissive: '#ff3b1f', emissiveIntensity: 0 }));
  disk.position.y = 0.21; g.add(disk);
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 20), stdMat('#ef4444', 0.4)); knob.rotation.x = Math.PI / 2; knob.position.set(0.3, 0.1, 0.52); g.add(knob);
  return { g, disk, setHeat: (k) => { disk.material.emissiveIntensity = 1.6 * k; } };
}
// 蒸發皿＋鹽粒（原點喺皿底）
export function makeDish(liquidColor = '#6cc0e2') {
  const prof = []; const A = 72 * Math.PI / 180;
  for (let i = 0; i <= 8; i++) { const a = (i / 8) * A; prof.push(V2(0.5 * Math.sin(a), 0.5 * (1 - Math.cos(a)))); }
  prof.push(V2(0.5 * Math.sin(A) + 0.03, 0.5 * (1 - Math.cos(A)) + 0.01));
  const v = makeVessel(prof, { mat: new THREE.MeshStandardMaterial({ color: '#d7e1ea', roughness: 0.35, side: THREE.DoubleSide }), liquidColor, level: 0, opacity: 0.8, sx: 0.97, oy: 0.012, rim: false });
  const CRY = 48;
  const crystals = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), stdMat('#ffffff', 0.3), CRY);
  const data = [...Array(CRY)].map(() => { const rho = Math.random() * 0.33, a = Math.random() * 6.28; return { x: Math.cos(a) * rho, z: Math.sin(a) * rho, y: 0.5 - Math.sqrt(0.25 - rho * rho) + 0.035, ry: Math.random() * 3, s: 0.6 + Math.random() * 0.8 }; });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), sc = new THREE.Vector3(), p = new THREE.Vector3();
  function setCrystals(k) {
    data.forEach((d, i) => { p.set(d.x, d.y, d.z); q.setFromEuler(e3.set(0, d.ry, 0)); sc.setScalar(Math.max(0.0001, k * d.s)); crystals.setMatrixAt(i, m4.compose(p, q, sc)); });
    crystals.instanceMatrix.needsUpdate = true;
  }
  setCrystals(0); v.group.add(crystals);
  return { ...v, setCrystals, MAX: 0.2 };
}
// 鹽嘅晶格（鈉離子＋氯離子）
export function makeLattice() {
  const g = new THREE.Group();
  const naM = stdMat('#a78bfa', 0.35), clM = stdMat('#4ade80', 0.35);
  const naG = new THREE.SphereGeometry(0.055, 20, 14), clG = new THREE.SphereGeometry(0.088, 20, 14);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) {
    const isNa = (i + j + k) % 2 === 0;
    const s = new THREE.Mesh(isNa ? naG : clG, isNa ? naM : clM); s.position.set((i - 1) * 0.19, (j - 1) * 0.19, (k - 1) * 0.19); g.add(s);
  }
  return g;
}

/* ---------- 實驗室房間 ---------- */
export function buildRoom(scene, theme = {}) {
  const th = { bg: '#b7cde0', wall: '#c6d9ea', floor: '#8ea6bb', top: '#cf9b66', leg: '#5b7fa0', ...theme };
  scene.background = new THREE.Color(th.bg);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9fb3c6, 0.95));
  const sun = new THREE.DirectionalLight(0xffffff, 1.55);
  sun.position.set(3.5, 8, 5.5); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  const c = sun.shadow.camera; c.left = -5; c.right = 5; c.top = 5; c.bottom = -5; c.near = 1; c.far = 20;
  sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.02;
  scene.add(sun);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(16, 48), stdMat(th.floor, 1));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 14), stdMat(th.wall, 1)); wall.position.set(0, 6, -5); scene.add(wall);
  const top = new THREE.Mesh(new RoundedBoxGeometry(7.6, 0.22, 3.8, 3, 0.08), stdMat(th.top, 0.7));
  top.position.y = TABLE_Y - 0.11; top.receiveShadow = true; scene.add(top);
  const legM = stdMat(th.leg, 0.5, 0.2);
  [[-3.5, -1.6], [3.5, -1.6], [-3.5, 1.6], [3.5, 1.6]].forEach(([x, z]) => {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, TABLE_Y - 0.22, 16), legM);
    l.position.set(x, (TABLE_Y - 0.22) / 2, z); scene.add(l);
  });
  return { sun, dayBg: new THREE.Color(th.bg) };
}
// 物件嘅世界座標（加少少高度）
export const worldOf = (obj, dy = 0) => { const v = new THREE.Vector3(); obj.getWorldPosition(v); v.y += dy; return v; };
