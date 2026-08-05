// LexiQ — офлайн-режим.
//
// Стратегии разные, потому что данные разные:
//   • страницы — сначала сеть, при обрыве отдаём копию из кэша (иначе после
//     деплоя человек неделю сидел бы на старой версии);
//   • стили, скрипты, словарь — сначала кэш, обновляем в фоне (быстрый старт);
//   • /api/* — только сеть. Ответ ИИ кэшировать бессмысленно и вредно.

const VERSION = 'lexiq-v1';
const SHELL = [
  '/',
  '/app.html',
  '/assets/css/site.css',
  '/assets/css/app.css',
  '/assets/js/app.js',
  '/assets/js/auth.js',
  '/assets/favicon.svg',
  '/data/vocabulary.json',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION)
      // Отдельные файлы могут не докачаться (например, шрифты с другого домена) —
      // это не повод отменить установку целиком.
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;   // шрифты и SDK — мимо кэша
  if (url.pathname.startsWith('/api/')) return;      // ИИ всегда живьём

  const isPage = request.mode === 'navigate' ||
    (request.headers.get('accept') || '').includes('text/html');

  if (isPage) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match('/app.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((hit) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || network;
    })
  );
});
