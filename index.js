/* Service worker for Restaurant Reviews */
/* written by Gerben Boersma */

/*	Name for cache to use */
const staticCacheName = 'restaurant-review-v1';

/*  Array of files to cache */
let cacheFiles = [
	'/skeleton',
	'/index.html',
	'/restaurant.html',
	'/js/dbhelper.js',
	'/js/index.js',
	'/js/main.js',
	'/js/restaurant_info.js',
	'/css/styles.css',
	'https://api.mapbox.com/mapbox-gl-js/v0.49.0/mapbox-gl.js',
	'https://api.mapbox.com/mapbox-gl-js/v0.49.0/mapbox-gl.css',
	'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css']


/*	Handle installation of Service Worker
 *
 */
self.addEventListener('install', event => {

	event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll(cacheFiles);
    })
  );

});


/*	Execute once the Service Worker is activated
 *
 */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('restaurant-review-') &&
                 cacheName != staticCacheName;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});


/*	Handle fetch events of the Service Worker
 *
 */
self.addEventListener('fetch', function(event) {

	event.respondWith(
	    caches.match(event.request).then(function(response) {
	      return response || fetch(event.request);
	    })
	);
});