/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'artisanflow-v2';
const urlsToCache = [
  '/',
  '/logo.png'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        // Ajouter les URLs une par une pour éviter l'erreur si certaines échouent
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(err => console.warn(`[SW] Failed to cache ${url}:`, err))
          )
        );
      })
      .then(() => {
        console.log('[SW] Service worker installed');
        return self.skipWaiting();
      })
      .catch(err => console.error('[SW] Installation failed:', err))
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim();
    })
  );
});

// Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET ou vers des domaines externes
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('[SW] Serving from cache:', event.request.url);
          return response;
        }
        console.log('[SW] Fetching from network:', event.request.url);
        return fetch(event.request).catch(err => {
          console.error('[SW] Fetch failed:', err);
          throw err;
        });
      })
  );
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'ArtisanFlow';
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [200, 100, 200],
    data: data.data || {}
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
