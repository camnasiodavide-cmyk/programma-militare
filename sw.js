const CACHE = 'bodyweight-v5';
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => {
 event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
 self.clients.claim();
});
self.addEventListener('fetch', event => {
 if(event.request.method !== 'GET') return;
 const url = new URL(event.request.url);
 if(url.origin !== self.location.origin) return;
 const fresh = event.request.mode === 'navigate' || url.pathname.endsWith('/version.json');
 event.respondWith(
  fetch(event.request, fresh ? {cache:'no-store'} : undefined)
   .then(response => {
    if(!fresh && response.ok) {
     const clone = response.clone();
     event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request,clone)).catch(()=>{}));
    }
    return response;
   })
   .catch(async () => {
    const cached = await caches.match(event.request);
    if(cached) return cached;
    return Response.error();
   })
 );
});
