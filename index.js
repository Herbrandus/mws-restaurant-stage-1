/* Service worker for Restaurant Reviews */
/* written by Gerben Boersma */

/*	Name for cache to use */
const staticCacheName = 'restaurant-review-v6';

/*  Array of files to cache */
let cacheFiles = [
	'/index.html',
	'/restaurant.html',
	'/data/restaurants.json',
	'/js/index.js',
	'/js/main.js',
	'/css/styles.css'
];


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


/*	Handle fetch events of the Service Worker
 *
 */
self.addEventListener('fetch', function(event) {

	var requestUrl = new URL(event.request.url);

	if (requestUrl.origin === location.origin) {
		if (requestUrl.pathname === '/') {
			event.respondWith(caches.match('/index.html'));
			return;
		}

		if (requestUrl.pathname === '/restaurant.html') {
			event.respondWith(caches.match('/restaurant.html', {ignoreSearch: true}));
			return;
		}
	}

	event.respondWith(
	    caches.match(event.request).then(function(response) {
	      return response || fetch(event.request);
	    })
	);
});