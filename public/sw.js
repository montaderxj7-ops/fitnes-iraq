self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // A basic fetch handler is required by Chrome to trigger the PWA install prompt.
  event.respondWith(fetch(event.request).catch(() => new Response("Network error")));
});

self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: data.icon || '/logos/icon.png',
      badge: '/logos/icon.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
        url: data.url || '/app'
      },
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
});

self.addEventListener('notificationclick', function (event) {
  console.log('Notification click received.')
  event.notification.close()
  if (event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url))
  }
});

