// Service Worker for Smart Teacher Schedule AI (iOS PWA & Web Push)
const CACHE_NAME = 'smart-teacher-v1.3.1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle Push Notifications
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Smart Teacher Schedule', body: event.data.text() };
    }
  }

  const title = data.title || 'Smart Teacher Schedule AI';
  const options = {
    body: data.body || 'Bạn có thông báo mới từ lịch giảng dạy.',
    icon: '/app_icon.jpg',
    badge: '/app_icon.jpg',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || 'smart-teacher-alert',
    renotify: true,
    data: {
      url: data.url || '/app'
    },
    actions: [
      { action: 'open', title: 'Xem Lịch Dạy' },
      { action: 'dismiss', title: 'Đã Xem' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click on iOS
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/app';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes('/app') && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
