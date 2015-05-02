'use strict';

var settingsTemplate = require('./templates/settings/template'),
	reminderTemplate = require('./templates/reminder/template'),
	Snap = require('snapsvg'),
	config = require('../../config'),
	Notifier = require('./HTML5Notifier'),
	notifier = new Notifier(config.title, config.icon),
	LocalStore = require('./LocalStore'),
	localStore = new LocalStore(require('./reminders'));

var GREETING_MESSAGE = 'Hi! Have a nice day!',
	INTERVAL_RATIO = 60 * 1000; // in minutes

module.exports = HealthyNotifications;

/**
 * Healthy notifications
 * @constructor
 */
function HealthyNotifications () {
	this._timers = {};
}

/**
 * Timers for all reminders.
 * @type {Object}
 * @private
 */
HealthyNotifications.prototype._timers = null;

/**
 * Loads reminders.
 */
HealthyNotifications.prototype.load = function () {
	var remindersList = [],
		reminders = localStore.getData();
	Object.keys(reminders).forEach(function (reminderAlias) {
		remindersList.push(reminderTemplate({
			alias: reminderAlias,
			reminder: reminders[reminderAlias]
		}));
	});
	window.document.body.innerHTML = settingsTemplate({
		reminders: remindersList
	});

	this.initAnimation();
	this.initToggleReminders();
	this.initEditingReminders();
	this.initSavingReminders();
	this.startTimers();
	this.greeting();
};

/**
 * Initializes onHover animation.
 */
HealthyNotifications.prototype.initAnimation = function () {
	var speed = 330,
		easing = window.mina.backout;

	[].slice.call(window.document.querySelectorAll('.js-reminder'))
		.forEach(function (reminderElement) {
			var s = new Snap(reminderElement.querySelector('svg')),
				path = s.select('.js-reminder-path'),
				pathHovered = s.select('.js-reminder-path-hovered'),
				pathConfig = {
					from: path.attr('d'),
					to: pathHovered.attr('d')
				};

			path.attr('data-d', path.attr('d'));

			reminderElement.addEventListener('mouseenter', function () {
				if (reminderElement.classList.contains('is-editing')) {
					return;
				}
				if (reminderElement.classList.contains('is-edited')) {
					return;
				}
				path.animate({path: pathConfig.to}, speed, easing);
			});

			reminderElement.addEventListener('mouseleave', function () {
				if (reminderElement.classList.contains('is-editing')) {
					return;
				}
				if (reminderElement.classList.contains('is-edited')) {
					setTimeout(function () {
						reminderElement.classList.remove('is-edited');
					}, 5000);
					return;
				}
				path.animate({path: pathConfig.from}, speed, easing);
			});
		});
};

/**
 * Initialize toggling reminders.
 */
HealthyNotifications.prototype.initToggleReminders = function () {
	var self = this;

	[].slice.call(window.document.querySelectorAll('.js-reminder'))
		.forEach(function (reminderElement) {
			var buttonElement = reminderElement
				.querySelector('.js-reminder-button-toggle');

			var reminderAlias = buttonElement.getAttribute('data-reminder-alias'),
				reminder = localStore.getData()[reminderAlias];

			buttonElement.addEventListener('click', function () {
				self.toggleReminder(reminder);
				buttonElement.innerText =
					reminder.isEnabled ? 'Disable' : 'Enable';

				reminderElement.classList[
					reminder.isEnabled ? 'remove' : 'add'
					]('is-disabled');
			});
		});
};

/**
 * Initialize editing reminders.
 */
HealthyNotifications.prototype.initEditingReminders = function () {
	var self = this,
		speed = 330,
		easing = window.mina.backout;

	[].slice.call(window.document.querySelectorAll('.js-reminder'))
		.forEach(function (reminderElement) {
			var buttonElement = reminderElement
				.querySelector('.js-reminder-button-edit');

			var s = new Snap(reminderElement.querySelector('svg')),
				path = s.select('.js-reminder-path'),
				pathEditing = s.select('.js-reminder-path-editing');

			buttonElement.addEventListener('click', function () {
				reminderElement.classList.add('is-editing');
				path.animate({path: pathEditing.attr('d')}, speed, easing);
			});
		});
};

/**
 * Initialize saving reminders.
 */
HealthyNotifications.prototype.initSavingReminders = function () {
	var self = this,
		speed = 330,
		easing = window.mina.backout;

	[].slice.call(window.document.querySelectorAll('.js-reminder'))
		.forEach(function (reminderElement) {
			var formElement = reminderElement
				.querySelector('.js-reminder-form');

			var reminderAlias = formElement.getAttribute('data-reminder-alias'),
				reminder = localStore.getData()[reminderAlias];

			var s = new Snap(reminderElement.querySelector('svg')),
				path = s.select('.js-reminder-path');

			formElement.addEventListener('submit', function (event) {
				event.preventDefault();
				event.stopPropagation();
				reminder.interval = formElement.querySelector('[name=interval]')
					.value;
				reminder.message = formElement.querySelector('[name=message]')
					.value;
				self.saveReminder(reminder);
				self.saveReminderView(reminder, reminderElement);
				path.animate({path: path.attr('data-d')}, speed, easing);
				reminderElement.classList.add('is-edited');
				reminderElement.classList.remove('is-editing');
			});
		});
};

/**
 * Toggles reminder.
 * @param {Object} reminder
 */
HealthyNotifications.prototype.toggleReminder = function (reminder) {
	reminder.isEnabled = !reminder.isEnabled;
	this.saveReminder(reminder);
};

/**
 * Saves reminder options.
 * @param {Object} reminder
 */
HealthyNotifications.prototype.saveReminder = function (reminder) {
	localStore.save(localStore.getData());
	this.startTimerForReminder(reminder);
};

/**
 * Saves reminder view.
 * @param {Object} reminder
 * @param {Element} reminderElement
 */
HealthyNotifications.prototype.saveReminderView =
	function (reminder, reminderElement) {
		reminderElement.querySelector('.js-reminder-interval')
			.innerText = reminder.interval;
		reminderElement.querySelector('.js-reminder-message')
			.innerText = reminder.message;
	};

/**
 * Greeting and checking permissions.
 */
HealthyNotifications.prototype.greeting = function () {
	setTimeout(function () {
		notifier.notify(GREETING_MESSAGE);
	}, 1500);
};

/**
 * Starts timers.
 */
HealthyNotifications.prototype.startTimers = function () {
	var self = this,
		reminders = localStore.getData();
	Object.keys(reminders).forEach(function (reminderAlias) {
		self.startTimerForReminder(reminders[reminderAlias]);
	});
};

/**
 * Starts timer for reminder.
 * @param {Object} reminder
 */
HealthyNotifications.prototype.startTimerForReminder = function (reminder) {
	if (reminder.id in this._timers) {
		clearInterval(this._timers[reminder.id]);

		console.log('HealthyNotifications: stopped timer for ' +
			JSON.stringify(reminder));
	}

	if (!reminder.isEnabled) {
		return;
	}

	var self = this;

	this._timers[reminder.id] = setInterval(function () {
		self.onNotify(reminder);
	}, reminder.interval * INTERVAL_RATIO); // in minutes

	console.log('HealthyNotifications: started timer for ' +
		JSON.stringify(reminder));
};

/**
 * Event: onNotify
 * @param {Object} reminder
 */
HealthyNotifications.prototype.onNotify = function (reminder) {
	if (!reminder.isEnabled) {
		return;
	}

	notifier.notify(reminder.message);
};