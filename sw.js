const CACHE_NAME = 'kanji-step-v1';
const urlsToCache = [
  '/',
  'index.html',
  'manifest.json',
  'icons/icon-192.jpg',
  'icons/icon-512.jpg'
];

// インストール時にキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// フェッチ時にキャッシュ優先、オフライン対応
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request).then(fetchRes => {
        if (!fetchRes || fetchRes.status !== 200) return fetchRes;
        const responseToCache = fetchRes.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return fetchRes;
      });
    }).catch(() => {
      // オフライン時に代替ページ (任意)
      return new Response('オフラインです。漢字ステップを楽しんでください。', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    })
  );
});

// 古いキャッシュの削除
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (!cacheWhitelist.includes(cache)) return caches.delete(cache);
        })
      );
    })
  );
});