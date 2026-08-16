/* global self */
/**
 * Service worker source template.
 *
 * scripts/build-sw.mjs replaces the precache-manifest placeholder below with
 * the generated manifest and writes the final file to public/sw.js. The
 * Workbox runtime is self-hosted at /workbox/ (copied from node_modules at
 * build time) so the worker never depends on a CDN.
 */
importScripts(
  "/workbox/workbox-core.prod.js",
  "/workbox/workbox-routing.prod.js",
  "/workbox/workbox-strategies.prod.js",
  "/workbox/workbox-precaching.prod.js"
);

const { precacheAndRoute, cleanupOutdatedCaches } = self.workbox.precaching;
const { registerRoute } = self.workbox.routing;
const { NetworkFirst } = self.workbox.strategies;

/**
 * Precache the whole app shell: every content-hashed /_next/static chunk,
 * the public shell pages (/, /resources, /resources/exercises, /offline) and
 * all static public assets (fonts, icons, images). A fresh install therefore
 * works offline with no prior online visit.
 *
 * Auth-gated routes are NOT in the manifest — a logged-out install must
 * never cache the login page under a protected URL. They are handled by the
 * network-first navigation route below and are cached only after a
 * successful authenticated visit.
 */
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Take control immediately (matches the previous hand-rolled worker and lets
// offline users keep their current page when the connection drops).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // One-time cleanup of caches left behind by the pre-Workbox hand-rolled
      // worker (cleanupOutdatedCaches only handles old Workbox precaches).
      caches
        .keys()
        .then((keys) =>
          Promise.all(keys.filter((k) => k.startsWith("fibrocare-v2-")).map((k) => caches.delete(k)))
        ),
    ])
  );
});

const NAVIGATION_CACHE = "fibrocare-navigations";

// Only cache real 200 responses — and never redirected ones. The route proxy
// redirects logged-out visitors away from protected routes (e.g. a
// /dashboard request becomes a 307 to /login, which fetch() follows to a 200
// login page); without this guard the login page would be cached under the
// protected URL and served to that user offline.
const navigationPlugins = [
  {
    cacheWillUpdate: async ({ response }) => {
      if (!response || response.status !== 200 || response.redirected) return null;
      return response;
    },
  },
];

/**
 * Navigations. Workbox checks routes in reverse registration order, so this
 * route (registered after precacheAndRoute) is checked before the precache
 * route for navigations: every page load goes network-first — keeping
 * authenticated pages fresh online — and offline falls back to the cached
 * copy (which hits the precache for shell pages), then the /offline page,
 * then a minimal inline page. Non-navigation requests (chunks, fonts, …)
 * only match the precache route and are served from the precache.
 */
registerRoute(
  ({ request }) => request.mode === "navigate",
  async ({ event, request }) => {
    const strategy = new NetworkFirst({ cacheName: NAVIGATION_CACHE, plugins: navigationPlugins });
    try {
      const response = await strategy.handle({ event, request });
      if (response) return response;
    } catch {
      // Network unreachable — fall through to cache / offline page.
    }
    // Precache entries are stored under keys that keep Workbox's
    // __WB_REVISION__ query param, so raw Cache API matches must ignore
    // search params to find them.
    const cached = await caches.match(request.url, { ignoreSearch: true });
    if (cached) return cached;
    const offlinePage = await caches.match("/offline", { ignoreSearch: true });
    if (offlinePage) return offlinePage;
    return offlineResponse();
  }
);

/** Last-resort inline page if even the /offline fallback is not cached. */
function offlineResponse() {
  return new Response(
    "<!doctype html><html lang='en'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Offline — FibroCare</title></head>" +
      "<body style='font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;background:#0B101B;color:#E6EDE6;text-align:center'>" +
      "<div><h1 style='margin:0 0 .5rem'>You&rsquo;re offline</h1>" +
      "<p style='margin:0;opacity:.7'>Connect to the internet to continue. Your check-ins are safe on this device.</p></div></body></html>",
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
