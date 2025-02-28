importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBZy9ujbhG7HtrGpsU3hNnXQqs9eRvVqwI',
  authDomain: 'klypp-405b2.firebaseapp.com',
  projectId: 'klypp-405b2',
  storageBucket: 'klypp-405b2.firebasestorage.app',
  messagingSenderId: '623803828808',
  appId: '1:623803828808:web:d35fa1b6378a766d12667d'
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png',
    badge: '/badge.png',
    data: payload.data,
    tag: payload.data?.notificationId, // Use notificationId as tag to group notifications
    renotify: true, // Always notify even if there's an existing notification
    requireInteraction: true // Keep notification visible until user interacts
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  // Get the notification data
  const data = event.notification.data;
  
  // Navigate to the appropriate page based on notification type
  let url = '/notifications';
  if (data?.planId) {
    url = `/plan/${data.planId}`;
  }

  // Open or focus the appropriate window/tab
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If we have a matching window, focus it
        for (const client of clientList) {
          if (client.url === url) {
            return client.focus();
          }
        }
        // If no matching window, open a new one
        return clients.openWindow(url);
      })
  );
}); 