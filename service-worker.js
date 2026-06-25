const CACHE_NAME = 'florecer-v1';
const ASSETS = [
  '/florecer/',
  '/florecer/index.html',
  '/florecer/manifest.json',
  '/florecer/icon-192.png',
  '/florecer/icon-512.png',
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap'
];

// Instalar e fazer cache dos assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(err => console.log('Cache parcial:', err));
    })
  );
  self.skipWaiting();
});

// Ativar e limpar caches antigos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estratégia: Network first, fallback para cache
self.addEventListener('fetch', (e) => {
  // Ignorar Firebase e Google APIs (sempre online)
  if (e.request.url.includes('firebase') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('gstatic') ||
      e.request.url.includes('firebaseapp')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Salvar cópia no cache
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      })
      .catch(() => {
        // Sem internet: usar cache
        return caches.match(e.request).then(cached => {
          return cached || caches.match('/florecer/index.html');
        });
      })
  );
});
