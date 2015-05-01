'use strict';

module.exports = {

	/**
	 * Notifies with title and message.
	 * @param {string} title
	 * @param {string} message
	 */
	notify: function notifyMe (title, message) {
		var notification;

		// Let's check if the browser supports notifications
		if (!('Notification' in window)) {
			alert('This app does not support desktop notification');
		}

		// Let's check if the user is okay to get some notification
		else if (Notification.permission === 'granted') {
			// If it's okay let's create a notification
			notification = new Notification(title, {
				body: message
			});
		}

		// Otherwise, we need to ask the user for permission
		else if (Notification.permission !== 'denied') {
			Notification.requestPermission(function (permission) {
				// If the user is okay, let's create a notification
				if (permission === 'granted') {
					notification = new Notification(title, {
						body: message
					});
				}
			});
		}

		// At last, if the user already denied any notification, and you
		// want to be respectful there is no need to bother them any more.
	}
};