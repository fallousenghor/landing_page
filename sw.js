const CACHE_NAME = 'porfo-cache-v1';
const OFFLINE_URL = './offline.html';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './gallas.jpeg',
  './Fallou-Senghor-CV.pdf',
  './offline.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((k) => {
        if (k !== CACHE_NAME) return caches.delete(k);
      })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  // Always respond with cached resources when available, else network, else offline page
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // Optionally cache GET requests
        if (request.method === 'GET' && response && response.status === 200 && response.type !== 'opaque') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => {
        // If navigation request, serve offline page
        if (request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'))) {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});
