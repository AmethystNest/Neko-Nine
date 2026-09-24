// Neko Nine service worker: network-first for pages/scripts so updates arrive,
// cache fallback for offline play. Old caches are removed on activate.
const CACHE='neko-nine-v2';
const CORE=['./','./index.html','./manifest.webmanifest','./js/assets.js','./js/engine.js','./js/stages.js','./js/render.js','./js/main.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(
    fetch(e.request).then(r=>{
      if(r && r.ok && new URL(e.request.url).origin===location.origin){ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); }
      return r;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html')))
  );
});
