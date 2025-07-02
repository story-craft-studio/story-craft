import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './app';
import './util/i18n';

// Unregister service workers on load
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.getRegistrations().then(function (registrations) {
		for (let registration of registrations) {
			registration.unregister().then(function (success) {
				if (success) {
					console.log('Service Worker unregistered');
				}
			});
		}
	});
}
if ('caches' in window) {
	caches.keys().then(function (names) {
		for (let name of names) {
			caches.delete(name);
		}
	});
}

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById('root')
);
