'use strict';

var DELAY_BEFORE_CLOSE = 4000;

module.exports = Notifier;

/**
 * Notifier that uses HTML5 Notification API
 * @param {string} title
 * @constructor
 */
function Notifier (title) {
	this.title = title || this.title;
}

/**
 * Title
 * @type {string}
 */
Notifier.prototype.title = 'Notifier';

/**
 * Notifies.
 * @param {string} message
 */
Notifier.prototype.notify = function (message) {
	var notification = null,
		title = this.title;

	// Let's check if the browser supports notifications
	if (!('Notification' in window)) {
		return;
	}

	// Let's check if the user is okay to get some notification
	if (window.Notification.permission === 'granted') {
		// If it's okay let's create a notification
		notification = new window.Notification(title, {
			body: message
		});
	} else if (window.Notification.permission !== 'denied') {
		// Otherwise, we need to ask the user for permission

		window.Notification.requestPermission(function (permission) {
			// If the user is okay, let's create a notification
			if (permission === 'granted') {
				notification = new window.Notification(title, {
					body: message
				});
			}
		});
	}

	if (!notification) {
		// At last, if the user already denied any notification, and you
		// want to be respectful there is no need to bother them any more.
		return;
	}

	setTimeout(function () {
		notification.close();
	}, DELAY_BEFORE_CLOSE);
};