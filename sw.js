// Congix English — офлайн-режим.
//
// Всё своё берём сначала из сети, в кэш складываем копию и достаём её только
// когда сети нет. Раньше стили и скрипты шли «сначала кэш», и после каждого
// деплоя пользователь оставался на старом оформлении: HTML приезжал новый,
// CSS — прежний, и интерфейс разваливался. Быстрый старт того не стоит.
//
// /api/* не кэшируется никогда: ответ ИИ одноразовый.

// ASSET_V должен совпадать с ?v= в ссылках на стили и скрипты в HTML.
// Иначе в кэш ляжет один адрес, а страница попросит другой, и офлайн-старт
// останется без стилей.
const ASSET_V = '6';
const VERSION = 'lexiq-v6';
const SHELL = [
  '/',
  '/app.html',
  `/assets/css/site.css?v=${ASSET_V}`,
  `/assets/css/app.css?v=${ASSET_V}`,
  `/assets/js/app.js?v=${ASSET_V}`,
  `/assets/js/auth.js?v=${ASSET_V}`,
  '/assets/favicon.svg',
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

  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(request, copy));
        }
        return res;
      })
      // Сети нет — отдаём последнюю сохранённую копию,
      // для навигации в крайнем случае саму страницу приложения.
      .catch(() => caches.match(request).then((hit) => hit || (isPage ? caches.match('/app.html') : undefined)))
  );
});
