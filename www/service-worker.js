/**
 * Service Worker - LycéePad
 * Gère le cache pour permettre l'utilisation hors-ligne
 *
 * Stratégies utilisées :
 *  - Cache First  → fichiers statiques (CSS, JS, fonts, images)
 *  - Network First → données dynamiques (API, JSON de version)
 *  - Offline page → si tout échoue, une page de secours est affichée
 */

const CACHE_VERSION = 'lyceepad-v1';

// Fichiers mis en cache immédiatement à l'installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/html/map.html',
  '/html/scanner.html',
  '/html/Quiz.html',
  '/html/About.html',
  '/html/ZoneContent.html',
  '/html/login.html',
  '/css/app.css',
  '/css/Home.css',
  '/css/map.css',
  '/css/scanner.css',
  '/css/Quiz.css',
  '/css/About.css',
  '/css/ZoneContent.css',
  '/css/login.css',
  '/css/Admin.css',
  '/js/app.js',
  '/js/db-manager.js',
  '/js/login.js',
  '/js/kiosk.js',
  '/js/Contenus.js',
  '/js/map.js',
  '/js/scanner.js',
  '/js/About.js',
  '/js/Home.js',
  '/js/Quiz.js',
  '/js/ZoneContent.js',
  '/js/Admin.js',
  '/data/qr-data.json',
  '/img/logo.png',
  '/img/plan-lycee.png',
  '/lib/fontawesome/css/all.min.css',
  '/offline.html'
];

// URLs dont on veut toujours la version réseau fraîche
const NETWORK_FIRST_PATTERNS = [
  /\/data\/db-version\.json/,
  /\/data\/qr-data\.json/,
  /\/API\//
];

// ─── Installation ────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE_ASSETS.map(url => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Précache partiel (certains fichiers manquants) :', err))
  );
});

// ─── Activation (nettoyage des anciens caches) ────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_VERSION)
          .map(key => {
            console.log('[SW] Suppression ancien cache :', key);
            return caches.delete(key);
          })
      ))
      .then(() => self.clients.claim())
  );
});

// ─── Interception des requêtes ────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-HTTP (chrome-extension, etc.)
  if (!url.protocol.startsWith('http')) return;

  // Ignorer les requêtes POST (formulaires, uploads)
  if (request.method !== 'GET') return;

  // Vérifier si la requête doit passer en Network First
  const isNetworkFirst = NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname));

  if (isNetworkFirst) {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(cacheFirst(request));
  }
});

// ─── Stratégie Cache First ────────────────────────────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    // Ne mettre en cache que les réponses valides
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Ressource non disponible hors-ligne
    return offlineFallback(request);
  }
}

// ─── Stratégie Network First ──────────────────────────────────────────────────
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Réseau indisponible → utiliser le cache
    const cached = await caches.match(request);
    if (cached) return cached;
    return offlineFallback(request);
  }
}

// ─── Fallback hors-ligne ─────────────────────────────────────────────────────
async function offlineFallback(request) {
  const url = new URL(request.url);

  // Si c'est une navigation vers une page HTML → page offline
  if (request.headers.get('Accept')?.includes('text/html')) {
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) return offlinePage;
  }

  // Sinon réponse vide générique
  return new Response('', { status: 503, statusText: 'Service Unavailable' });
}

// ─── Message depuis l'appli (ex: forcer la mise à jour) ──────────────────────
self.addEventListener('message', event => {
  if (event.data?.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
