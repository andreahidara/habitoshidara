const CACHE_NAME = 'habit-tracker-v2';

const STATIC_ASSETS = [
  '/',
  '/icons/icon.svg',
];

// Routes that must never be cached (auth flows, Supabase callbacks)
const NEVER_CACHE_PATTERNS = [
  /supabase/,
  /\/auth\//,
  /\/api\/auth/,
  /access_token/,
  /refresh_token/,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Never cache auth-related or Supabase routes
  const fullUrl = request.url;
  if (NEVER_CACHE_PATTERNS.some((pattern) => pattern.test(fullUrl))) {
    return;
  }

  // Next.js API routes and dynamic data: network-first, no cache store
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/data/')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Static assets (_next/static): cache-first, store on miss
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached || fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
      )
    );
    return;
  }

  // HTML pages: network-first, cache for offline fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache successful same-origin responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
