/* Service worker for Restaurant Reviews */
/* written by Gerben Boersma */

/*	Name for cache to use */
const cacheName = 'restaurant-review-v1';

/*	Handle installation of Service Worker
 *
 */
self.addEventListener('install', function(event) {

	event.waitUntil(
		caches.open(cacheName).then(function(cache) {
			return cache.addAll([
				'index.html',
				'restaurant.html',
				'js/dbhelper.js',
				'js/index.js',
				'js/main.js',
				'js/restaurant_info.js',
				'css/styles.css'
			]);
		})
	);

});


/*	Handle fetch events of the Service Worker
 *
 */
self.addEventListener('fetch', function(event) {

	event.respondWith(
		fetch(event.request).then(function(response) {
			if (response.status == 404) {
				
				// respond with this when 404
				return new Response('<p style="font-family:arial;font-size:15px;">The page you\'re looking for does not exist!</p>', {
					headers: {'Content-Type': 'text/html'}
				});

			} else {

				// otherwise return regular website
				return response;
			}

		}).catch(function() {

			// respond with this html when offline
			return new Response('<p style="font-family:arial;font-size:15px;">The page you\'re looking for does not exist!</p>', {
				headers: {'Content-Type': 'text/html'}
			});
		})
	);
});