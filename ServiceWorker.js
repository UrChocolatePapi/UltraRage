const cacheName = "Ransom Interactive-Ultra Rage-0.1.1 [preview]";
const contentToCache = [
    "Build/unity UR.loader.js",
    "Build/unity UR.framework.js",
    "Build/unity UR.data",
    "Build/unity UR.wasm",
    "TemplateData/style.css"
];

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    e.waitUntil((async function () {
        const cache = await caches.open(cacheName);
        console.log('[Service Worker] Caching all: app shell and content');
        await cache.addAll(contentToCache);
        self.skipWaiting(); // Activate new SW immediately
    })());
});

self.addEventListener('activate', function (e) {
    console.log('[Service Worker] Activate');
    e.waitUntil((async function () {
        // Delete all caches except the current one
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(name => {
                if (name !== cacheName) {
                    console.log('[Service Worker] Deleting old cache:', name);
                    return caches.delete(name);
                }
            })
        );
        self.clients.claim(); // Take control of all clients
    })());
});

self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
        let response = await caches.match(e.request);
        console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
        if (response) { return response; }

        response = await fetch(e.request);
        const cache = await caches.open(cacheName);
        console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
        cache.put(e.request, response.clone());
        return response;
    })());
});
