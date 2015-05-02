'use strict';

var DELAY_BEFORE_CLOSE = 4000;

module.exports = Notifier;

/**
 * Notifier that uses HTML5 Notification API
 * @param {string} title
 * @param {string} icon
 * @constructor
 */
function Notifier (title, icon) {
	this._title = title || this._title;
	this._icon = icon || null;
}

/**
 * Title
 * @type {string}
 */
Notifier.prototype._title = 'Notifier';

/**
 * Icon
 * @type {string}
 * @private
 */
Notifier.prototype._icon = null;

/**
 * Notifies.
 * @param {string} message
 */
Notifier.prototype.notify = function (message) {
	var notification = null,
		title = this._title,
		icon = this._icon;

	// Let's check if the browser supports notifications
	if (!('Notification' in window)) {
		return;
	}

	// Let's check if the user is okay to get some notification
	if (window.Notification.permission === 'granted') {
		// If it's okay let's create a notification
		notification = new window.Notification(title, {
			body: message,
			icon: icon
		});
	} else if (window.Notification.permission !== 'denied') {
		// Otherwise, we need to ask the user for permission

		window.Notification.requestPermission(function (permission) {
			// If the user is okay, let's create a notification
			if (permission === 'granted') {
				notification = new window.Notification(title, {
					body: message,
					icon: icon
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