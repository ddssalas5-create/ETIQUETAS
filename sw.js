// Service worker mínimo: solo lo necesario para que el navegador permita "Instalar app".
// No guarda nada en caché de forma agresiva — cada carga sigue pidiendo la versión más reciente
// de tus archivos, para que tus próximas actualizaciones se vean sin que el cliente tenga que
// desinstalar nada.
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ self.clients.claim(); });
self.addEventListener('fetch', function(e){
  e.respondWith(fetch(e.request).catch(function(){ return caches.match(e.request); }));
});
