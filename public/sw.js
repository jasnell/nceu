/*
 * Retired service worker. Until the 2027 site, /sw.js was the 2026 attendee
 * app's worker (scope /app). The app now lives at /2026/app with its own worker
 * at /2026/sw.js, so phones that installed the old one pick up this file on
 * their next update check: it clears the old caches and unregisters itself,
 * letting /app reach the network (which redirects to /2026/app).
 */

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys()) {
        if (name.startsWith("nceu-app-")) await caches.delete(name);
      }
      await self.registration.unregister();
    })(),
  );
});
