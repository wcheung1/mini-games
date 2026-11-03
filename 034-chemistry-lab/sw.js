/* 離線版（service worker）
   - 自己網站嘅檔案：網絡優先，有網就攞最新版，冇網就用快取。
   - CDN（React、htm、Three.js、Tailwind、字型）：版本固定，所以快取優先。
   - 唔使人手維護檔案清單：頁面載入完會將用過嘅檔案清單傳過嚟（見 index.html），之後每次讀檔都會自動更新快取。 */
const CACHE = 'lily-lab-v1';
const CDN = ['cdn.jsdelivr.net', 'unpkg.com', 'fonts.gstatic.com'];

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

const cacheable = (res) => res && (res.ok || res.type === 'opaque');

async function put(req, res) {
  if (!cacheable(res)) return;
  const c = await caches.open(CACHE);
  await c.put(req, res);
}

// 第一次打開時，頁面喺 service worker 接手之前已經載入咗嘅檔案：補存入快取
async function store(url) {
  const c = await caches.open(CACHE);
  if (await c.match(url)) return;
  let res;
  try { res = await fetch(url); } catch (_) { try { res = await fetch(url, { mode: 'no-cors' }); } catch (_) { return; } }
  if (cacheable(res)) await c.put(url, res);
}

self.addEventListener('message', (e) => {
  const d = e.data;
  if (!d || d.type !== 'cache' || !Array.isArray(d.urls)) return;
  e.waitUntil(Promise.all(d.urls.filter((u) => /^https?:/.test(u)).map((u) => store(u.split('#')[0]))));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    // 網絡優先
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        e.waitUntil(put(req, res.clone()));
        return res;
      } catch (err) {
        const hit = await caches.match(req) || await caches.match(req, { ignoreSearch: true });
        if (hit) return hit;
        if (req.mode === 'navigate') {
          const home = await caches.match('./') || await caches.match('./index.html');
          if (home) return home;
        }
        throw err;
      }
    })());
  } else if (CDN.includes(url.hostname) || url.hostname === 'fonts.googleapis.com') {
    // 快取優先（字型 CSS 冇版本號，所以背景再更新一次）
    e.respondWith((async () => {
      const hit = await caches.match(req);
      const net = () => fetch(req).then((res) => { e.waitUntil(put(req, res.clone())); return res; });
      if (hit) {
        if (url.hostname === 'fonts.googleapis.com') e.waitUntil(net().catch(() => {}));
        return hit;
      }
      return net();
    })());
  }
});
