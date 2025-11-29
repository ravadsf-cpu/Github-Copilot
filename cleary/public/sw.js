/* cleary service worker: caches API responses and images for faster loads */
const VERSION = 'v3';
const SHELL_CACHE = `cleary-shell-${VERSION}`;
const API_CACHE = `cleary-api-${VERSION}`;
const IMG_CACHE = `cleary-img-${VERSION}`;

// Minimal app shell to precache (kept small; CRA assets are hashed and cached by the browser)
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/robots.txt'
];

self.addEventListener('install', event => {
  // Precache minimal shell and activate immediately
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => cache.addAll(SHELL_ASSETS)).catch(() => null)
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => ![SHELL_CACHE, API_CACHE, IMG_CACHE].includes(key))
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Utility: cache-first for images
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // As a last resort, return a generic response or a 504
    return new Response('', { status: 504, statusText: 'Gateway Timeout' });
  }
}

// Utility: stale-while-revalidate for API GETs
async function staleWhileRevalidate(event, cacheName) {
  const { request } = event;
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = (async () => {
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    } catch (err) {
      // Network failed; if we have a cached response, use it
      if (cached) return cached;
      throw err;
    }
  })();

  if (cached) {
    // Return cached immediately, update in background
    event.waitUntil(networkPromise);
    return cached;
  }
  // No cache; go to network
  return networkPromise;
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return; // only cache GETs

  const url = new URL(request.url);

  // Only handle same-origin requests
  const sameOrigin = url.origin === self.location.origin;

  // API routes to cache: /api/news-fast, /api/news, /api/article
  if (sameOrigin && (
    url.pathname.startsWith('/api/news-fast') ||
    url.pathname.startsWith('/api/news') ||
    url.pathname.startsWith('/api/article')
  )) {
    event.respondWith(staleWhileRevalidate(event, API_CACHE));
    return;
  }

  // Cache images with cache-first
  const accept = request.headers.get('accept') || '';
  const isImage = accept.includes('image') || /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(url.pathname);
  if (sameOrigin && isImage) {
    event.respondWith(cacheFirst(request, IMG_CACHE));
    return;
  }

  // Optionally, serve the app shell for navigation requests (basic SPA fallback)
  if (sameOrigin && request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then(resp => resp || fetch(request))
    );
  }
});

// Optional: listen for messages to clear caches or trigger refresh
self.addEventListener('message', event => {
  const { action } = event.data || {};
  if (action === 'CLEAR_API_CACHE') {
    event.waitUntil(caches.delete(API_CACHE));
  }
  if (action === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
