/**
 * Kovin service worker.
 * App-shell precache + stale-while-revalidate runtime cache +
 * offline fallback + push/sync-ready stubs.
 *
 * Bump CACHE_VERSION on any deploy that changes cached files so
 * old clients pick up fresh content instead of stale cache.
 */
const CACHE_VERSION = 'kovin-v6';

const APP_SHELL = [
  './',
  './index.html',
  './selector.html',
  './eliminate.html',
  './journey.html',
  './confidence.html',
  './lifemode.html',
  './library.html',
  './horizon.html',
  './secondopinion.html',
  './family.html',
  './knowledgegraph.html',
  './knowledge-graph.js',
  './memory.html',
  './kovin-memory.js',
  './trust.html',
  './kovin-trust.js',
  './principles.html',
  './offline.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-192-maskable.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
];

/* ── Install: precache the app shell ── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: drop old cache versions, take control immediately ── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* ── Fetch: navigations get cache-first + offline fallback;
   everything else (fonts, CDN scripts, product images) gets
   stale-while-revalidate so repeat visits feel instant. ── */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
            }
            return res;
          })
          .catch(() => cached || caches.match('./offline.html'));
        return cached || network;
      })
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE_VERSION).then((cache) =>
      cache.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    )
  );
});

/* ══════════════════════════════════════════════════
   PUSH NOTIFICATIONS — ready architecture.
   No backend exists yet to actually send these; this listener
   is what a real push payload would be handled by once one does.
   Expected categories (sent as JSON in the push payload's `tag`
   and `title`/`body`):
     - pickup-ready        "Your <device> is ready for pickup"
     - consultation-reminder
     - price-change        on a saved/wishlisted product
     - software-update     insight for an owned device
     - ownership-reminder  ties to journey.html's timeline stages
     - accessory-suggestion based on owned devices
══════════════════════════════════════════════════ */
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}

  const title = data.title || 'Kovin';
  const options = {
    body: data.body || 'You have an update from Kovin.',
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    tag: data.tag || 'kovin-general',
    data: { url: data.url || './journey.html' },
    vibrate: [80, 40, 80],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || './index.html';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientsArr) => {
      for (const client of clientsArr) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

/* ══════════════════════════════════════════════════
   BACKGROUND SYNC — ready architecture.
   Registered from the page via:
     navigator.serviceWorker.ready.then(r => r.sync.register('kovin-sync-cart'))
   A real implementation would push localStorage cart/ownership
   changes made offline to a backend once connectivity returns.
══════════════════════════════════════════════════ */
self.addEventListener('sync', (event) => {
  if (event.tag === 'kovin-sync-cart') {
    event.waitUntil(Promise.resolve());
  }
});
