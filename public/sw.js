// Service Worker — House Chores (self-unregistering)
// The app no longer needs a service worker. This file unregisters itself
// so that users who cached a previous version get cleaned up.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', () => {
  self.registration.unregister()
})
