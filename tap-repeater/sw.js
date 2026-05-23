// Cache name is bumped whenever the precache contents or fetch strategy change.
// The activate handler deletes every cache that isn't the current one, so the
// previous version's precache is evicted on the next visit.
const CACHE_NAME = 'tap-repeater-v2';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './vendor/rhythm-engine/events.js',
  './vendor/rhythm-engine/index.js',
  './vendor/rhythm-engine/pattern.js',
  './vendor/rhythm-engine/playback.js',
  './vendor/rhythm-engine/projection.js',
  './vendor/rhythm-engine/serialization.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Network-first with cache fallback. Mirrors mullmania.site.json cacheControl
// for *.html / *.js / *.json (no-store / no-cache). The precached shell is the
// offline fallback; live deploys land as soon as the user reloads online,
// instead of being shadowed by a stale precache indefinitely.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || Response.error()))
  );
});
