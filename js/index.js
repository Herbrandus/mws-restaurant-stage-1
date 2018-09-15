/* General script to handle the service worker */
/* written by Gerben Boersma */
'use strict';

if (navigator.serviceWorker) {

	// Installing Service Worker only when it is supported in browser
	navigator.serviceWorker.register('index.js', {
	}).then(function(reg) {
		//console.log('serviceWorker loaded');
	}).catch(function(error) {
		console.log(error);
	});

}
