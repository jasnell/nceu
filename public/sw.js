/*
 * Service worker for the attendee app (/app), registered with scope "/app"
 * by app/app/attendee-app.tsx in production builds only.
 *
 * - /app: network first, falling back to the saved copy after a few seconds
 *   or when offline, so a fresh deploy (program changes) is picked up but
 *   flaky venue Wi-Fi never shows a blank screen.
 * - /assets/*: content-hashed build output, so cache first, forever.
 * - Icons/manifest: served from cache, refreshed in the background.
 * - Google Fonts: the stylesheet is served from cache and refreshed in the
 *   background; font files (immutable URLs) are cache first.
 * - Images: sponsor logos, listed by the app in a "cache-images" message
 *   (they aren't in the page HTML, and several are on other sites), are
 *   saved once and then served cache first.
 *
 * This file is served as a static asset without a Content-Security-Policy,
 * which is what lets it fetch fonts and logos from other hosts. If a CSP is
 * ever applied to it, its connect-src must allow those hosts.
 *
 * Every time /app is fetched from the network, the JS/CSS it references is
 * cached too, so the saved page always has matching assets. The Google Fonts
 * stylesheet is found through the app CSS's @import and cached along with its
 * Latin font files, so typography works offline right after the first visit.
 */

const VERSION = "v3";
const PAGE_CACHE = `nceu-app-page-${VERSION}`;
const ASSET_CACHE = `nceu-app-assets-${VERSION}`;
const FONT_CACHE = `nceu-app-fonts-${VERSION}`;
const IMAGE_CACHE = `nceu-app-images-${VERSION}`;
const MAX_IMAGES = 100;
const APP_URL = "/app";
const NETWORK_TIMEOUT_MS = 3500;
const FONT_CSS_HOST = "fonts.googleapis.com";
const FONT_FILE_HOST = "fonts.gstatic.com";
const STATIC_FILES = [
  "/app.webmanifest",
  "/hexagon.svg",
  "/app-icons/icon-192.png",
  "/app-icons/icon-512.png",
  "/app-icons/icon-maskable-512.png",
  "/app-icons/apple-touch-icon.png",
];

// Font requests are refetched in CORS mode: a stylesheet @import is a no-cors
// request, and caching its opaque response would cost megabytes of quota.
const fetchCors = (url) => fetch(url, { mode: "cors", credentials: "omit" });

/**
 * Fetches an image for the cache. Cross-origin logos are tried with CORS first;
 * hosts that don't send CORS headers get a no-cors request, whose opaque
 * response still displays in an <img> (at the cost of padded quota usage).
 */
async function fetchImage(url) {
  if (new URL(url).origin === self.location.origin) return fetch(url);
  try {
    return await fetchCors(url);
  } catch {
    return fetch(url, { mode: "no-cors", credentials: "omit" });
  }
}

async function cacheImages(urls) {
  const cache = await caches.open(IMAGE_CACHE);
  const wanted = urls.filter((url) => typeof url === "string" && /^https?:\/\//.test(url)).slice(0, MAX_IMAGES);
  await Promise.all(
    wanted.map(async (url) => {
      if (await cache.match(url)) return;
      try {
        const response = await fetchImage(url);
        if (response.ok || response.type === "opaque") await cache.put(url, response);
      } catch {
        // Offline or host down: try again on the next visit.
      }
    }),
  );
}

/** Serves a saved image, falling back to the network for anything else. */
async function imageFirst(request) {
  const cached = await caches.match(request.url, { cacheName: IMAGE_CACHE });
  return cached ?? fetch(request);
}

/**
 * Caches a Google Fonts stylesheet and the Latin font files it references
 * (other subsets are fetched on demand if a page ever needs them).
 */
async function cacheFontsFrom(cssUrl) {
  const cache = await caches.open(FONT_CACHE);
  if (await cache.match(cssUrl)) return;
  const response = await fetchCors(cssUrl);
  if (!response.ok) return;
  const css = await response.clone().text();
  const fontUrls = new Set(
    [...css.matchAll(/\/\*\s*latin\s*\*\/\s*@font-face\s*{[^}]*?url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map(
      (match) => match[1],
    ),
  );
  await Promise.all(
    [...fontUrls].map(async (url) => {
      if (await cache.match(url)) return;
      const font = await fetchCors(url);
      if (font.ok) await cache.put(url, font);
    }),
  );
  // Stored last, so a cached stylesheet means its fonts are there too.
  await cache.put(cssUrl, response);
}

/** Caches the /assets/* files referenced by the /app HTML, and their web fonts. */
async function cacheAssetsFrom(html) {
  const urls = new Set(
    [...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)].map((match) => match[1]),
  );
  const cache = await caches.open(ASSET_CACHE);
  await Promise.all(
    [...urls].map(async (url) => {
      if (!(await cache.match(url))) await cache.add(url);
      if (!url.endsWith(".css")) return;
      const css = await (await cache.match(url)).text();
      const imports = css.matchAll(/@import\s+(?:url\()?["']?(https:\/\/fonts\.googleapis\.com\/[^"')\s]+)/g);
      // Fonts are a nice-to-have; never let them fail the page caching.
      await Promise.all([...imports].map((match) => cacheFontsFrom(match[1]).catch(() => {})));
    }),
  );
}

/**
 * Fetches /app. Resolves with the response straight away; `saved` settles once
 * the page and its assets are in the cache.
 */
async function fetchApp(request) {
  const response = await fetch(request);
  if (!response.ok) return { response, saved: Promise.resolve() };
  const forPage = response.clone();
  const forParse = response.clone();
  const saved = (async () => {
    await cacheAssetsFrom(await forParse.text());
    // Saved last, so the cached page never references assets we don't have.
    await (await caches.open(PAGE_CACHE)).put(APP_URL, forPage);
  })();
  return { response, saved };
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      await (await caches.open(ASSET_CACHE)).addAll(STATIC_FILES);
      await (await fetchApp(new Request(APP_URL, { cache: "no-store" }))).saved;
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([PAGE_CACHE, ASSET_CACHE, FONT_CACHE, IMAGE_CACHE]);
      for (const name of await caches.keys()) {
        if (name.startsWith("nceu-app-") && !keep.has(name)) await caches.delete(name);
      }
      await self.clients.claim();
    })(),
  );
});

async function appPage(event) {
  const network = fetchApp(event.request).then(({ response, saved }) => {
    // Keep refreshing the saved copy even if the cached one wins the race.
    event.waitUntil(saved.catch(() => {}));
    return response;
  });
  event.waitUntil(network.catch(() => {}));

  const cached = await caches.match(APP_URL, { cacheName: PAGE_CACHE });
  if (!cached) return network;

  const timeout = new Promise((resolve) => setTimeout(() => resolve(null), NETWORK_TIMEOUT_MS));
  const response = await Promise.race([network.catch(() => null), timeout]);
  return response && response.ok ? response : cached;
}

async function cacheFirst(request, cacheName, load = (req) => fetch(req)) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request.url);
  if (cached) return cached;
  const response = await load(request);
  if (response.ok) await cache.put(request.url, response.clone());
  return response;
}

async function staleWhileRevalidate(event, cacheName, { load = fetch, ignoreSearch = false } = {}) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(event.request.url, { ignoreSearch });
  const network = load(event.request.url).then(async (response) => {
    if (response.ok) await cache.put(event.request.url, response.clone());
    return response;
  });
  event.waitUntil(network.catch(() => {}));
  return cached ?? network;
}

self.addEventListener("message", (event) => {
  if (event.data?.type !== "cache-images" || !Array.isArray(event.data.urls)) return;
  event.waitUntil(cacheImages(event.data.urls));
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    if (url.hostname === FONT_CSS_HOST) {
      event.respondWith(staleWhileRevalidate(event, FONT_CACHE, { load: fetchCors }));
    } else if (url.hostname === FONT_FILE_HOST) {
      event.respondWith(cacheFirst(request, FONT_CACHE, (req) => fetchCors(req.url)));
    } else if (request.destination === "image") {
      event.respondWith(imageFirst(request));
    }
    return;
  }

  if (request.mode === "navigate" && url.pathname === APP_URL) {
    event.respondWith(appPage(event));
  } else if (url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
  } else if (STATIC_FILES.includes(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event, ASSET_CACHE, { ignoreSearch: true }));
  } else if (request.destination === "image") {
    event.respondWith(imageFirst(request));
  }
});
