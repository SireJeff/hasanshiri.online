// Portfolio PWA Service Worker
// Cache version - update this to invalidate all caches
const CACHE_VERSION = 'v1'
const CACHE_NAME = `portfolio-${CACHE_VERSION}`

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline',
]

// Cache patterns for runtime caching
const CACHE_PATTERNS = {
  // Images - cache first, network fallback
  images: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
  // Fonts - cache first, network fallback
  fonts: /\.(?:woff|woff2|ttf|otf|eot)$/,
  // API calls - network first, cache fallback
  api: /^\/api\//,
}

// Cache strategies
const strategies = {
  // Cache first, fall back to network
  cacheFirst: async (request) => {
    const cache = await caches.open(CACHE_NAME)
    const cached = await cache.match(request)

    if (cached) {
      // Update cache in background
      fetch(request).then((response) => {
        if (response.ok) {
          cache.put(request, response.clone())
        }
      })
      return cached
    }

    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  },

  // Network first, fall back to cache
  networkFirst: async (request) => {
    const cache = await caches.open(CACHE_NAME)

    try {
      const response = await fetch(request)
      if (response.ok) {
        cache.put(request, response.clone())
      }
      return response
    } catch (error) {
      const cached = await cache.match(request)
      if (cached) {
        return cached
      }
      throw error
    }
  },

  // Stale while revalidate
  staleWhileRevalidate: async (request) => {
    const cache = await caches.open(CACHE_NAME)
    const cached = await cache.match(request)

    // Fetch in background
    const fetchPromise = fetch(request).then((response) => {
      if (response.ok) {
        cache.put(request, response.clone())
      }
      return response
    })

    // Return cached version immediately or wait for fetch
    return cached || fetchPromise
  },
}

// Determine which strategy to use based on request
function getStrategy(request) {
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return null

  // Skip chrome extensions and other protocols
  if (!url.protocol.startsWith('http')) return null

  // Images - cache first
  if (CACHE_PATTERNS.images.test(url.pathname)) {
    return strategies.cacheFirst
  }

  // Fonts - cache first
  if (CACHE_PATTERNS.fonts.test(url.pathname)) {
    return strategies.cacheFirst
  }

  // API calls - network first
  if (CACHE_PATTERNS.api.test(url.pathname)) {
    return strategies.networkFirst
  }

  // Static assets from same origin - stale while revalidate
  if (url.origin === location.origin) {
    return strategies.staleWhileRevalidate
  }

  return null
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith('portfolio-') && cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - handle requests with appropriate strategy
self.addEventListener('fetch', (event) => {
  const strategy = getStrategy(event.request)

  if (strategy) {
    event.respondWith(strategy(event.request))
  }
})

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true })
    })
  }
})
