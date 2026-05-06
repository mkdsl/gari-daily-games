const CACHE_NAME = 'park-ranger-v1';
const STATIC_ASSETS = ['./', './index.html', './manifest.json', './quests.json', './src/config.js', './src/state.js', './src/quest.js', './src/streak.js', './src/ui.js', './src/audio.js', './src/main.js', './styles/base.css', './styles/ui.css', './styles/game.css'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS).catch(e => console.warn('SW cache warn', e))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => {
    if (cached) return cached;
    return fetch(event.request).then(response => {
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      }
      return response;
    }).catch(() => { if (event.request.mode === 'navigate') return caches.match('./index.html'); });
  }));
});

self.addEventListener('push', event => {
  let data = { title: '🌳 Park Ranger', body: 'Čuvar Parka je spreman. Tvoj nalog čeka.', tag: 'daily-quest' };
  if (event.data) { try { data = { ...data, ...event.data.json() }; } catch (_) { data.body = event.data.text() || data.body; } }
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body, icon: './icon-192.png', badge: './icon-72.png',
    tag: data.tag, renotify: false, vibrate: [200, 100, 200],
    data: { url: self.location.origin + self.location.pathname.replace('sw.js', '') },
    actions: [{ action: 'open', title: 'Otvori nalog' }, { action: 'dismiss', title: 'Kasnije' }]
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : self.location.origin;
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
    for (const client of clientList) { if (client.url.includes('park-ranger') && 'focus' in client) return client.focus(); }
    if (clients.openWindow) return clients.openWindow(targetUrl);
  }));
});

self.addEventListener('periodicsync', event => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(self.registration.showNotification('🌳 Park Ranger', { body: 'Tvoj dnevni nalog čeka. Čuvar Parka veruje u tebe.', icon: './icon-192.png', tag: 'daily-quest', data: { url: self.location.origin } }));
  }
});
