/* Service Worker — captura Visión Cero (PWA offline).
   - Navegaciones: red primero; si no hay red, sirve el app-shell cacheado.
   - Estáticos hasheados (/_next/static, fuentes, imágenes): cache primero.
   - API: nunca se cachea (siempre red; las entrevistas offline viven en el outbox). */
const CACHE = "vision-cero-shell-v1";
const SHELL = "/";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return; // API: siempre red

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(SHELL, copy));
          return res;
        })
        .catch(() => caches.match(SHELL).then((r) => r || Response.error())),
    );
    return;
  }

  const isStatic = url.pathname.startsWith("/_next/static") || /\.(css|js|woff2?|png|svg|ico|jpg|jpeg|webp)$/.test(url.pathname);
  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req).then((res) => {
          if (isStatic && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
