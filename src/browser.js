'use strict';

var util = require('util'),
	notifications = require('./notifications.json').notifications,
	notifier = require('./notifier'),
	config = require('../config.json');

var SETTINGS_REMINDER_FORMAT = '<div>' +
		'<label for="js-reminder-%s">%s</label>' +
		'<input type="number" id="js-reminder-%s" data-id="%s" value="%s" min="1" step="0.5"/>' +
	'</div>',
	SETTINGS_CHANGED_FORMAT = 'Reminder "%s" was updated to "%s"';

function load () {
	var settings = document.getElementById('js-settings'),
		reminders = '';

	notifications.forEach(function (reminder) {
		reminders += util.format(
			SETTINGS_REMINDER_FORMAT,
			reminder.id,
			reminder.message,
			reminder.id,
			reminder.id,
			reminder.interval
		);
	});

	settings.innerHTML = reminders;
}

function updateReminder (id, interval) {
	notifications.every(function (reminder) {
		if (reminder.id === id) {
			reminder.interval = interval;
			startTimerForReminder(reminder);
			console.log(
				util.format(SETTINGS_CHANGED_FORMAT, id, JSON.stringify(reminder))
			);

			return false;
		}

		return true;
	});
}

function startTimers () {
	notifications.forEach(function (reminder) {
		startTimerForReminder(reminder);
	});
}

function startTimerForReminder (reminder) {
	if (reminder.timer) {
		clearInterval(reminder.timer);
	}

	reminder.timer = setInterval(function () {
		notifier.notify(config.title, reminder.message);
	}, reminder.interval * 60 * 1000); // in minutes
}

function listenForChanges () {
	var settings = document.getElementById('js-settings');
	settings.addEventListener('change', function (event) {
		if (event.target.tagName.toLowerCase() !== 'input') {
			return;
		}

		updateReminder(
			Number(event.target.getAttribute('data-id')),
			event.target.value
		);
	});
}

window.onload = function () {
	load();
	startTimers();
	listenForChanges();
};