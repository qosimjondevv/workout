const VERSION = "v1";
const SHELL_CACHE = `tj-shell-${VERSION}`;
const ASSET_CACHE = `tj-assets-${VERSION}`;
const FONT_CACHE = `tj-fonts-${VERSION}`;
const PHOTO_CACHE = `tj-photos-${VERSION}`;
const KNOWN = [SHELL_CACHE, ASSET_CACHE, FONT_CACHE, PHOTO_CACHE];

const SHELL_URL = "/";
const PRECACHE = [
  SHELL_URL,
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

const NAV_TIMEOUT_MS = 3000;
const MAX_ASSETS = 80;
const MAX_PHOTOS = 60;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch((e) => console.warn("Oldindan keshlash bajarilmadi:", e))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !KNOWN.includes(k)).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

async function cacheMatch(name, request) {
  try {
    return await (await caches.open(name)).match(request);
  } catch {
    return undefined;
  }
}

function cachePut(name, request, response) {
  return caches
    .open(name)
    .then((cache) => cache.put(request, response))
    .catch(() => {});
}

async function trimCache(name, max) {
  try {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((k) => cache.delete(k)));
  } catch {}
}

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
}

async function handleNavigate(request) {
  const network = fetch(request).then((response) => {
    if (response.ok) cachePut(SHELL_CACHE, SHELL_URL, response.clone());
    return response;
  });
  network.catch(() => {});

  try {
    return await Promise.race([network, timeout(NAV_TIMEOUT_MS)]);
  } catch {
    const cached = await cacheMatch(SHELL_CACHE, SHELL_URL);
    if (cached) return cached;
    try {
      return await network;
    } catch {
      return Response.error();
    }
  }
}

async function cacheFirst(request, cacheName, max) {
  const hit = await cacheMatch(cacheName, request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok || response.type === "opaque") {
    cachePut(cacheName, request, response.clone()).then(() => max && trimCache(cacheName, max));
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const hit = await cacheMatch(SHELL_CACHE, request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cachePut(SHELL_CACHE, request, response.clone());
      return response;
    })
    .catch(() => hit ?? Response.error());
  return hit ?? network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  if (url.hostname === "firebasestorage.googleapis.com" && url.pathname.includes("%2Fphotos%2F")) {
    event.respondWith(cacheFirst(request, PHOTO_CACHE, MAX_PHOTOS));
    return;
  }

  if (url.origin !== self.location.origin || url.pathname.startsWith("/__/")) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigate(request));
  } else if (url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(request, ASSET_CACHE, MAX_ASSETS));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const client = list.find((c) => "focus" in c);
      return client ? client.focus() : self.clients.openWindow("/jurnal");
    }),
  );
});
