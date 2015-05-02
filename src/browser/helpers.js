'use strict';

module.exports = {

	/**
	 * Gets short interval string.
	 * @param {number} intervalInMinutes
	 * @returns {string}
	 */
	getIntervalShortString: function (intervalInMinutes) {
		if (typeof intervalInMinutes !== 'number') {
			throw new Error('Invalid type of interval');
		}
		if (intervalInMinutes < 1) {
			return (intervalInMinutes * 60) + ' seconds';
		}

		if (intervalInMinutes === 1) {
			return 'minute';
		}

		if (intervalInMinutes === 60) {
			return 'hour';
		}

		if (intervalInMinutes === 24 * 60) {
			return 'day';
		}

		var hoursWithoutSeconds,
			minutes,
			seconds = (intervalInMinutes - Math.floor(intervalInMinutes)) * 60;

		if (intervalInMinutes < 60) {
			if (seconds > 0) {
				return Math.floor(intervalInMinutes) + 'm ' + seconds + 's';
			}
			return intervalInMinutes + ' minutes';
		}


		hoursWithoutSeconds = Math.floor(intervalInMinutes);
		minutes = hoursWithoutSeconds % 60;
		return Math.floor(hoursWithoutSeconds / 60) + 'h' +
			(minutes > 0 ? ' ' + minutes + 'm' : '') +
			(seconds > 0 ? ' ' + seconds + 's' : '');
	},

	/**
	 * Trims string
	 * @param {string} message
	 * @param {number} maxLength
	 * @returns {string}
	 */
	trimEnd: function (message, maxLength) {
		message = message.trim();
		if (message.length <= maxLength) {
			return message;
		}

		return message.substr(message, maxLength).trim() + '...';
	}
};