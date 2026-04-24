const CACHE_NAME = 'sxr-plays-v3';
const DOWNLOADS_CACHE = 'sxr-music-downloads';

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png'
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
      // Clean up old app caches
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter(key => key !== CACHE_NAME && key !== DOWNLOADS_CACHE)
            .map(key => caches.delete(key))
        );
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // For navigation requests (like clicking refresh or entering a URL)
  // ALWAYS try network first so we get the latest index.html with new JS hashes
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For other assets
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) return response;

      return fetch(request).then((networkResponse) => {
        // Don't cache dynamic API requests or huge audio files here
        // (Audio is handled by the downloadStore and cache.addAll)
        return networkResponse;
      }).catch(() => {
        // Fallback for missing assets
        return null;
      });
    })
  );
});
