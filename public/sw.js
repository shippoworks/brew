// BREW Service Worker v2 — network-first for HTML
const CACHE = 'brew-v2';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Always network for HTML and API
  if(url.pathname==='/' || url.pathname.startsWith('/api/') || e.request.headers.get('accept')?.includes('text/html')){
    e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
    return;
  }
  // Cache-first for static assets
  e.respondWith(caches.match(e.request).then(cached=>{
    if(cached) return cached;
    return fetch(e.request).then(res=>{
      if(res && res.status===200){
        const c=res.clone();
        caches.open(CACHE).then(ca=>ca.put(e.request,c));
      }
      return res;
    });
  }));
});
