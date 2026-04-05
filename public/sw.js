// BREW Service Worker v3
const CACHE = 'brew-v3';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks =>
      Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Always use network for HTML, API, and SW itself
  if (
    url.pathname === '/' ||
    url.pathname.startsWith('/api/') ||
    url.pathname === '/sw.js' ||
    (e.request.headers.get('accept') || '').includes('text/html')
  ) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  // Cache-first for static assets (fonts, manifest, icons)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const c = res.clone();
          caches.open(CACHE).then(ca => ca.put(e.request, c));
        }
        return res;
      });
    })
  );
});
