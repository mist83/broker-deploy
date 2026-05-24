// Cache the game shell so a player can keep going on a flaky couch wifi.
// Stale-while-revalidate for same-origin GETs — fetch wins when online, cache
// answers when offline. New deploys land on the next reload after fetch updates.

const CACHE = 'tic-hack-toe-v1';
const SHELL = [
  './game.html',
  './game-logic.js',
  '../favicon.ico',
  '../favicon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const network = fetch(req).then((response) => {
      if (response && response.ok && response.type === 'basic') {
        cache.put(req, response.clone()).catch(() => { /* quota or opaque */ });
      }
      return response;
    }).catch(() => null);

    const cached = await cache.match(req);
    return cached || (await network) || Response.error();
  })());
});
