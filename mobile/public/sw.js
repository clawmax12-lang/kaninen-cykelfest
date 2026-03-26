// Kaninens Cykelfest 2026 — Service Worker
// Strategi: Network-first med cache-fallback för offline-stöd

const CACHE_NAME = 'cykelfest-v1';

// Resurser som cachas vid installation (app shell)
const PRECACHE_URLS = ['/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Rensa gamla cacher
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Hoppa över icke-GET och externa API-anrop (backend)
  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Spara en kopia i cache om det lyckades
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Nätverk saknas — använd cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          // Fallback till root för SPA-navigering
          if (request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});
