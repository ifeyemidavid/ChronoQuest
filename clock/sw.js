const CACHE_NAME = 'chronoquest-cache-v1';
const ASSETS = [
  '.',
  'index.html',
  'manifest.json',
  'sw.js',
  // sounds (cached)
  'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg',
  'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg',
  'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => { if(k !== CACHE_NAME) return caches.delete(k); })))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = event.request.url;
  // network-first for same-origin HTML, cache-first for others
  if(event.request.mode === 'navigate' || (url.endsWith('.html'))){
    event.respondWith(fetch(event.request).catch(()=>caches.match('index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(resp => resp || fetch(event.request).catch(()=>{})));
});
