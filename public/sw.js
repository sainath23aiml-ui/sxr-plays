const CACHE_NAME = 'resonance-v2';
const DOWNLOADS_CACHE = 'sxr-music-downloads';
const ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icons.svg',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clean up old app caches, but NOT the downloads cache
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter(key => key !== CACHE_NAME && key !== DOWNLOADS_CACHE).map(key => caches.delete(key))
        );
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // 1. If found in any cache (ASSETS or DOWNLOADS), return it
      if (response) return response;

      // 2. If not in cache, try to find it specifically in the downloads cache (redundant but safe)
      return caches.open(DOWNLOADS_CACHE).then((cache) => {
        return cache.match(event.request).then((downloadResponse) => {
          if (downloadResponse) return downloadResponse;

          // 3. Otherwise fetch from network
          return fetch(event.request).catch(() => {
            // If network fails and it's a navigation request (page reload), return index.html
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            return null;
          });
        });
      });
    })
  );
});
