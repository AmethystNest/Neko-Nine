const CACHE_VERSION = 'neko-nine-v2';
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const SHELL = ['./manifest.webmanifest'];

self.addEventListener('install', (event) => {
  // Do not eagerly download the multi-megabyte stage HTML files. On iPhone this
  // competes with the first game load and can create avoidable memory/network
  // pressure. Cache only the tiny app shell here; game pages are cached after
  // they are actually requested.
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('neko-nine-') && key !== CACHE_VERSION && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // HTML navigations are network-first so a GitHub Pages deployment cannot be
  // hidden indefinitely behind an old cached stage/payload. Cached content is
  // retained as an offline/failure fallback.
  if (request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          event.waitUntil(cache.put(request, response.clone()));
        }
        return response;
      } catch (error) {
        const cached = await cache.match(request);
        if (cached) return cached;
        throw error;
      }
    })());
    return;
  }

  // Versioned/static same-origin assets use cache-first. Missing assets are
  // fetched once and retained, avoiding repeated downloads during retries.
  event.respondWith((async () => {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response && response.ok) {
      event.waitUntil(cache.put(request, response.clone()));
    }
    return response;
  })());
});
