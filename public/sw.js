/* AURA service worker — app shell + offline support.
 *
 * All paths are resolved relative to the SW's own location, so the same
 * file serves both deployments:
 *   GitHub Pages → scope https://<user>.github.io/AURA/
 *   Vercel       → scope https://aura-ner.vercel.app/
 *
 * Strategy:
 *   - navigation requests      → network-first, offline fallback to cached app shell
 *   - hashed build assets      → cache-first (immutable, content-hashed filenames)
 *   - Google Fonts             → stale-while-revalidate
 *   - everything else          → network, no interference
 */

const VERSION = 'aura-v3'
const SHELL_CACHE = `${VERSION}-shell`
const ASSET_CACHE = `${VERSION}-assets`
const FONT_CACHE = `${VERSION}-fonts`

// Relative to the SW scope — the scope always ends with '/'
const scopeUrl = new URL(self.registration.scope)
const rel = (p) => new URL(p, scopeUrl).href

const SHELL_ASSETS = [
  rel('./'),
  rel('./index.html'),
  rel('./manifest.webmanifest'),
  rel('./icons/pwa-192.png'),
  rel('./icons/pwa-512.png'),
  rel('./icons/pwa-maskable-192.png'),
  rel('./icons/pwa-maskable-512.png'),
  rel('./icons/apple-touch-icon.png'),
  rel('./icons/favicon-32.png'),
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE)
      // Cache each shell asset independently — one miss must not break the install
      await Promise.allSettled(
        SHELL_ASSETS.map((url) => cache.add(new Request(url, { cache: 'reload' })))
      )
      await self.skipWaiting()
    })()
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Remove caches from older versions
      const names = await caches.keys()
      await Promise.all(
        names
          .filter((n) => n.startsWith('aura-') && !n.startsWith(VERSION))
          .map((n) => caches.delete(n))
      )
      await self.clients.claim()
    })()
  )
})

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
})

async function networkFirstNavigation(event) {
  const cache = await caches.open(SHELL_CACHE)
  try {
    const fresh = await fetch(event.request)
    // Keep the shell fresh opportunistically
    if (fresh && fresh.ok) cache.put(rel('./index.html'), fresh.clone()).catch(() => {})
    return fresh
  } catch (err) {
    const shell =
      (await cache.match(event.request)) ||
      (await cache.match(rel('./index.html'))) ||
      (await cache.match(rel('./')))
    if (shell) return shell
    throw err
  }
}

async function cacheFirst(event) {
  const cache = await caches.open(ASSET_CACHE)
  const hit = await cache.match(event.request)
  if (hit) return hit
  const res = await fetch(event.request)
  if (res && (res.ok || res.type === 'opaque')) cache.put(event.request, res.clone()).catch(() => {})
  return res
}

async function staleWhileRevalidate(event) {
  const cache = await caches.open(FONT_CACHE)
  const hit = await cache.match(event.request)
  const network = fetch(event.request)
    .then((res) => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(event.request, res.clone()).catch(() => {})
      return res
    })
    .catch(() => undefined)
  return hit || (await network) || Response.error()
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // App navigations — SPA shell offline
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(event))
    return
  }

  // Same-origin hashed build assets → cache-first (safe: filenames are content-hashed)
  if (url.origin === self.location.origin && url.pathname.includes('/assets/')) {
    event.respondWith(cacheFirst(event))
    return
  }

  // Google Fonts → stale-while-revalidate
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(event))
  }
  // Everything else passes through untouched
})
