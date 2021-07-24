const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

const CACHE_NAME = "my-cache";
const DATA_CACHE_NAME = "data-cache";

self.addEventListener("install", function (e) {
  // Caches all transactions
  e.waitUntil(
    caches.open(DATA_CACHE_NAME)
    .then(function (cache) {
      cache.add("/api/transaction");
    }).catch(err => console.log(err))
  );

  // Caches static assets
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        cache.addAll(FILES_TO_CACHE);
      })
      .catch((err) => console.log(err))
  );

  self.skipWaiting();
});

self.addEventListener("activate", () => {
  console.log("Cache is active!");
});

self.addEventListener("fetch", function (e) {
  const url = new URL(e.request.url);
  console.log(url);
  if (url.pathname === ("/api/transaction")) {
    e.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(e.request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(e.request.url, response.clone());
              }
              return response;
            })
            .catch((err) => {
              return cache.match(e.request);
            });
        })
        .catch((err) => console.log(err))
    );
    return;
  } else {
    e.respondWith(
      caches.match(e.request).then(function (response) {
        return response || fetch(e.request);
      })
    );
  }
});
