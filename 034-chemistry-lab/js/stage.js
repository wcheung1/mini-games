/* =====================================================================
   3D 舞台：渲染、鏡頭控制、點擊、拖放、提示手指
   每個實驗模組透過 api 建立自己嘅場景（見 README）
   ===================================================================== */
import { THREE, buildRoom, makeTweener, makeLabel, makeHint, smooth, TABLE_Y } from './kit3d.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { html, useEffect, useRef, useState, useApp } from './lib.js';
import { Speech } from './speech.js';

const BOUNDS = { x: [-3.5, 3.5], z: [-1.7, 1.75] };

export function ThreeStage({ mod, lang, readMode, ctrlRef, onEvent, onReadLabel, onInteract, hintId }) {
  const mountRef = useRef(null);
  const handRef = useRef(null);
  const langRef = useRef(lang); langRef.current = lang;
  const rmRef = useRef(readMode); rmRef.current = readMode;
  const evRef = useRef(onEvent); evRef.current = onEvent;
  const rlRef = useRef(onReadLabel); rlRef.current = onReadLabel;
  const intRef = useRef(onInteract); intRef.current = onInteract;
  const hintRef = useRef(hintId); hintRef.current = hintId;
  const applyLangRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const { t } = useApp();

  useEffect(() => {
    const mount = mountRef.current;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); }
    catch (err) { setFailed(true); return undefined; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const room = buildRoom(scene, mod.theme);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex; scene.environmentIntensity = 0.55;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.08; controls.screenSpacePanning = true;
    controls.minDistance = 2.2; controls.maxDistance = 16;
    controls.minPolarAngle = 0.12; controls.maxPolarAngle = Math.PI * 0.49;
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
    controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };

    const tween = makeTweener();
    const pickables = []; const labels = []; const langFns = [];
    const dropRing = makeHint(0.5); dropRing.material.color.set('#22c55e'); dropRing.visible = false; scene.add(dropRing);

    const api = {
      THREE, scene, tween, room, camera,
      lang: () => langRef.current,
      emit: (k, p) => evRef.current && evRef.current(k, p),
      done: (id) => evRef.current && evRef.current('done', { id }),
      state: (patch) => evRef.current && evRef.current('state', patch),
      waitSpeech: () => Speech.waitIdle(),
      label(texts, opts) { const l = makeLabel(texts, opts); labels.push(l); return l; },
      onLang(fn) { langFns.push(fn); },
      // 可以撳嘅物件
      tap(obj, fn, label, extra = []) { [obj, ...extra].forEach((o) => { o.userData.tap = fn; o.userData.label = label; pickables.push(o); }); },
      // 可以拖嘅物件（必須係 scene 嘅直接子物件）
      drag(obj, opts) {
        const h = {
          obj, opts, busy: false, home: obj.position.clone(), homeRot: obj.rotation.clone(),
          setHome(v) { h.home.copy(v); },
          returnHome(dur = 0.5) {
            const from = obj.position.clone(), rz = obj.rotation.z, rx = obj.rotation.x;
            return tween.to(dur, (k) => {
              obj.position.lerpVectors(from, h.home, k);
              obj.rotation.z = rz + (h.homeRot.z - rz) * k; obj.rotation.x = rx + (h.homeRot.x - rx) * k;
            });
          },
          // 示範用：自動「拖」去目標
          async dropOn(key) {
            const tg = (opts.targets ? opts.targets() : []).find((x) => x.key === key);
            if (!tg) return;
            h.busy = true;
            const from = obj.position.clone();
            const hover = new THREE.Vector3(tg.pos.x, Math.max(h.home.y + (opts.lift ?? 0.6), tg.pos.y + 0.25), tg.pos.z);
            await tween.to(0.9, (k) => { obj.position.lerpVectors(from, hover, k); obj.position.y += Math.sin(k * Math.PI) * 0.25; });
            try { const r = await opts.onDrop(tg, h); if (r === false) await h.returnHome(); } finally { h.busy = false; }
          },
        };
        obj.userData.drag = h; obj.userData.label = opts.label; pickables.push(obj);
        (opts.extra || []).forEach((e) => { e.userData.dragRoot = obj; e.userData.label = opts.label; pickables.push(e); });
        return h;
      },
    };

    const ctrl = mod.build(scene, api);
    labels.forEach((l) => { if (!l.parent) scene.add(l); });
    scene.traverse((o) => { if (o.isMesh && !(o.material && o.material.transparent)) { o.castShadow = true; o.receiveShadow = true; } });
    const applyLang = (l) => { labels.forEach((x) => x.userData.setLang(l)); langFns.forEach((f) => f(l)); };
    applyLangRef.current = applyLang;
    applyLang(langRef.current);
    let disposed = false;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!disposed) applyLang(langRef.current); });

    const fit = () => {
      const w = mount.clientWidth || 1, h = mount.clientHeight || 1;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    // 預設視角：確保成張實驗枱（fitW 闊）都入到畫面，窄畫面會自動拉遠
    const resetView = () => {
      const [px, py, pz] = ctrl.cam.pos, [tx, ty, tz] = ctrl.cam.target;
      const fitW = ctrl.cam.fitW || 6.4;
      const dir = new THREE.Vector3(px - tx, py - ty, pz - tz); const base = dir.length(); dir.normalize();
      const hfov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
      const need = (fitW / 2) / Math.tan(hfov / 2) + 0.5;
      const dist = Math.min(base * 2.4, Math.max(base, need));
      controls.target.set(tx, ty, tz);
      camera.position.set(tx + dir.x * dist, ty + dir.y * dist, tz + dir.z * dist);
      controls.update();
    };
    fit(); resetView();
    ctrl.resetView = resetView;
    ctrlRef.current = ctrl;
    let lastAspect = camera.aspect;
    const ro = new ResizeObserver(() => { fit(); if (Math.abs(camera.aspect - lastAspect) / lastAspect > 0.15) { lastAspect = camera.aspect; resetView(); } });
    ro.observe(mount);

    /* ---------- 點擊同拖放 ---------- */
    const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2();
    const isVisible = (o) => { while (o) { if (!o.visible) return false; o = o.parent; } return true; };
    const setRay = (cx, cy) => {
      const r = renderer.domElement.getBoundingClientRect();
      ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
    };
    const hit = (cx, cy) => {
      setRay(cx, cy);
      const hits = ray.intersectObjects(pickables, true);
      for (const h of hits) {
        if (!isVisible(h.object)) continue;
        let o = h.object; while (o && !o.userData.tap && !o.userData.drag && !o.userData.dragRoot) o = o.parent;
        if (o) return o.userData.dragRoot || o;
      }
      return null;
    };
    const doTap = (o) => {
      if (!o) return;
      if (rmRef.current) { if (o.userData.label) rlRef.current && rlRef.current(o.userData.label); return; }
      const h = o.userData.drag;
      if (h) { if (h.opts.onTap && !h.busy) h.opts.onTap(); return; }
      if (o.userData.tap) o.userData.tap();
    };
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); const hitP = new THREE.Vector3();
    const st = { pts: new Map(), start: null, multi: false, cand: null, dragging: false, active: null, planeY: 0 };
    // 用畫面距離判斷有冇拖到目標（tg.pos = 目標開口嘅世界座標），小朋友對準睇到嘅位置就得
    const sv = new THREE.Vector3();
    const findTarget = (h, cx, cy) => {
      const r = renderer.domElement.getBoundingClientRect();
      const base = Math.max(56, 0.085 * Math.min(r.width, r.height));
      const p = h.obj.position; let best = null, bd = 1e9;
      (h.opts.targets ? h.opts.targets() : []).forEach((tg) => {
        if (tg.accept && !tg.accept()) return;
        sv.copy(tg.pos).project(camera);
        const sx = r.left + (sv.x + 1) / 2 * r.width, sy = r.top + (1 - sv.y) / 2 * r.height;
        const dPix = Math.hypot(sx - cx, sy - cy) / ((tg.r || 0.5) / 0.5);
        const dW = Math.hypot(tg.pos.x - p.x, tg.pos.z - p.z) / (tg.r || 0.5);
        const score = Math.min(dPix / base, dW);
        if (score < 1 && score < bd) { bd = score; best = tg; }
      });
      return best;
    };
    const beginDrag = () => {
      st.dragging = true; const h = st.cand;
      st.planeY = h.home.y + (h.opts.lift ?? 0.6);
      plane.constant = -st.planeY;
      h.opts.onDragStart && h.opts.onDragStart();
    };
    const moveDrag = (cx, cy) => {
      const h = st.cand; setRay(cx, cy);
      if (!ray.ray.intersectPlane(plane, hitP)) return;
      const b = h.opts.bounds || BOUNDS;
      const x = Math.max(b.x[0], Math.min(b.x[1], hitP.x)), z = Math.max(b.z[0], Math.min(b.z[1], hitP.z));
      h.obj.position.set(x, st.planeY, z);
      const tg = findTarget(h, cx, cy); st.active = tg;
      if (tg) {
        dropRing.visible = true; dropRing.position.set(tg.pos.x, (tg.ringY ?? TABLE_Y) + 0.012, tg.pos.z);
        dropRing.scale.setScalar((tg.r || 0.5) / 0.5);
        h.obj.rotation.z = (h.opts.tilt ?? 0.3) * (tg.pos.x < x ? 1 : -1);
      } else { dropRing.visible = false; h.obj.rotation.z = h.homeRot.z; }
    };
    const endDrag = (drop) => {
      const h = st.cand; const tg = st.active;
      st.dragging = false; st.cand = null; st.active = null; dropRing.visible = false; controls.enabled = true;
      if (!h) return;
      if (drop && tg && (!tg.accept || tg.accept())) {
        h.busy = true;
        Promise.resolve(h.opts.onDrop(tg, h)).then((r) => (r === false ? h.returnHome() : null)).finally(() => { h.busy = false; });
      } else {
        if (drop && h.opts.onMiss) h.opts.onMiss();
        h.busy = true; h.returnHome().then(() => { h.busy = false; });
      }
    };
    const onDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      intRef.current && intRef.current();
      st.pts.set(e.pointerId, true);
      if (st.pts.size > 1) {
        st.multi = true;
        if (st.dragging) endDrag(false); else if (st.cand) { st.cand = null; controls.enabled = true; }
        return;
      }
      st.start = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId }; st.multi = false;
      const o = hit(e.clientX, e.clientY);
      const h = o && o.userData.drag;
      if (h && !rmRef.current && !h.busy && (!h.opts.enabled || h.opts.enabled())) { st.cand = h; controls.enabled = false; }
    };
    const onMove = (e) => {
      if (st.cand && st.start && e.pointerId === st.start.id) {
        if (!st.dragging && Math.hypot(e.clientX - st.start.x, e.clientY - st.start.y) > 8) beginDrag();
        if (st.dragging) moveDrag(e.clientX, e.clientY);
        return;
      }
      if (e.pointerType === 'mouse' && !st.pts.size && e.target === renderer.domElement) {
        const o = hit(e.clientX, e.clientY);
        renderer.domElement.style.cursor = o ? (o.userData.drag ? 'grab' : 'pointer') : 'default';
      }
    };
    const onUp = (e) => {
      const isStart = st.start && e.pointerId === st.start.id;
      st.pts.delete(e.pointerId);
      if (st.cand && isStart) {
        if (st.dragging) endDrag(true);
        else { const h = st.cand; st.cand = null; controls.enabled = true; doTap(h.obj); }
      } else if (isStart && !st.multi) {
        if (Math.hypot(e.clientX - st.start.x, e.clientY - st.start.y) < 12 && performance.now() - st.start.t < 700) doTap(hit(e.clientX, e.clientY));
      }
      if (st.pts.size === 0) { st.start = null; if (!st.dragging) controls.enabled = true; }
    };
    const onCancel = (e) => {
      st.pts.delete(e.pointerId); st.multi = true;
      if (st.dragging) endDrag(false); else if (st.cand) { st.cand = null; controls.enabled = true; }
      if (st.pts.size === 0) st.start = null;
    };
    const noMenu = (e) => e.preventDefault();
    mount.addEventListener('pointerdown', onDown, true);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    renderer.domElement.addEventListener('contextmenu', noMenu);

    const clampTarget = () => {
      const tg = controls.target;
      const cx = Math.max(-4, Math.min(4, tg.x)), cy = Math.max(0.3, Math.min(3.5, tg.y)), cz = Math.max(-2.5, Math.min(2.5, tg.z));
      if (cx !== tg.x || cy !== tg.y || cz !== tg.z) { camera.position.x += cx - tg.x; camera.position.y += cy - tg.y; camera.position.z += cz - tg.z; tg.set(cx, cy, cz); }
    };

    /* ---------- 提示手指 ---------- */
    const tmp = new THREE.Vector3();
    const proj = (v) => { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * mount.clientWidth, (1 - tmp.y) / 2 * mount.clientHeight]; };
    const updateHand = (time) => {
      const hand = handRef.current; if (!hand) return;
      const id = hintRef.current;
      const hn = id && !st.dragging && ctrl.getHint ? ctrl.getHint(id) : null;
      if (!hn || !hn.from) { hand.style.opacity = '0'; return; }
      let x, y, op = 1;
      if (hn.to) {
        const T = (time % 2.6) / 2.6; const a = proj(hn.from), b = proj(hn.to); const k = smooth(0.18, 0.72, T);
        x = a[0] + (b[0] - a[0]) * k; y = a[1] + (b[1] - a[1]) * k;
        op = T < 0.08 ? T / 0.08 : T > 0.86 ? (1 - T) / 0.14 : 1;
        hand.textContent = T < 0.18 || T > 0.72 ? '👆' : '✊';
      } else {
        const a = proj(hn.from); x = a[0]; y = a[1] + Math.abs(Math.sin(time * 4)) * 10; hand.textContent = '👆';
      }
      hand.style.opacity = String(op);
      hand.style.transform = `translate(${x - 16}px, ${y - 4}px)`;
    };

    const clock = new THREE.Clock(); let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.2); const time = clock.elapsedTime;
      tween.update(dt); ctrl.update && ctrl.update(dt, time);
      if (dropRing.visible) dropRing.material.opacity = 0.55 + 0.3 * Math.sin(time * 8);
      controls.update(); clampTarget();
      renderer.render(scene, camera);
      updateHand(time);
    };
    tick();

    return () => {
      disposed = true; cancelAnimationFrame(raf); ro.disconnect();
      mount.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      renderer.domElement.removeEventListener('contextmenu', noMenu);
      controls.dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        const m = o.material; if (m) (Array.isArray(m) ? m : [m]).forEach((mm) => { if (mm.map) mm.map.dispose(); mm.dispose(); });
      });
      envTex.dispose(); renderer.dispose();
      if (renderer.forceContextLoss) renderer.forceContextLoss();
      renderer.domElement.remove(); ctrlRef.current = null; applyLangRef.current = null;
    };
  }, [mod]);

  useEffect(() => { if (applyLangRef.current) applyLangRef.current(lang); }, [lang]);

  return html`<div ref=${mountRef} className="absolute inset-0">
    <div ref=${handRef} className="hint-hand" aria-hidden="true">👆</div>
    ${failed ? html`<div className="absolute inset-0 grid place-items-center p-6 text-center font-bold text-slate-600">${t('noWebgl')}</div>` : null}
  </div>`;
}
