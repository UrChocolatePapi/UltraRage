const CACHE_VERSION = '1.2'; // Increment this on every update
const CACHE_NAME = `DefaultCompany-UltraRage-${CACHE_VERSION}`;
const CONTENT_TO_CACHE = [
  "Build/web.loader.js",
  "Build/web.framework.js",
  "Build/web.data",
  "Build/web.wasm",
  "TemplateData/style.css"
];

// Install: cache assets and activate immediately
self.addEventListener('install', function (e) {
  console.log('[Service Worker] Install');
  e.waitUntil((async function () {
    const cache = await caches.open(CACHE_NAME);
    console.log('[Service Worker] Caching all: app shell and content');
    await cache.addAll(CONTENT_TO_CACHE);
    self.skipWaiting(); // Activate new SW immediately
  })());
});

// Activate: clean up old caches and take control
self.addEventListener('activate', function (e) {
  console.log('[Service Worker] Activate');
  e.waitUntil((async function () {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.filter(name => name !== CACHE_NAME)
        .map(name => caches.delete(name))
    );
    self.clients.claim(); // Take control of all clients
  })());
});

// Fetch: serve from cache, update cache if needed
self.addEventListener('fetch', function (e) {
  e.respondWith((async function () {
    let response = await caches.match(e.request);
    if (response) {
      console.log(`[Service Worker] Fetching resource from cache: ${e.request.url}`);
      return response;
    }
    response = await fetch(e.request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(e.request, response.clone());
    console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
    return response;
  })());
});
