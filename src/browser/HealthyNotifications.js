'use strict';

var settingsTemplate = require('./templates/settings/template'),
	reminderTemplate = require('./templates/reminder/template'),
	headerTemplate = require('./templates/header/template'),
	Snap = require('snapsvg'),
	config = require('../../../src/config'),
	Notifier = require('./HTML5Notifier'),
	notifier = new Notifier(config.title, config.icon),
	helpers = require('./helpers'),
	LocalStore = require('./LocalStore'),
	localStore = new LocalStore(require('./reminders'));

var MAX_MESSAGE_LENGTH = 200,
	GREETING_MESSAGE = 'Hi! Have a nice day!',
	GREETING_DELAY = 1500,
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
		reminders[reminderAlias].interval =
			Number(reminders[reminderAlias].interval);
		remindersList.push(reminderTemplate({
			alias: reminderAlias,
			reminder: reminders[reminderAlias],
			interval: helpers
				.getIntervalShortString(reminders[reminderAlias].interval)
		}));
	});
	window.document.body.innerHTML = settingsTemplate({
		reminders: remindersList,
		header: headerTemplate({
			title: config.title
		})
	});

	this.addListeners();
	this.startTimers();
	this.greeting();
};

/**
 * Add listeners.
 */
HealthyNotifications.prototype.addListeners = function () {
	var self = this;

	[].slice.call(window.document.querySelectorAll('.js-reminder'))
		.forEach(function (reminderElement) {
			var s = new Snap(reminderElement.querySelector('svg')),
				path = s.select('.js-reminder-path'),
				pathHovered = s.select('.js-reminder-path-hovered'),
				pathEditing = s.select('.js-reminder-path-editing'),
				pathConfig = {
					path: path,
					initial: path.attr('d'),
					active: pathHovered.attr('d'),
					editing: pathEditing.attr('d'),
					speed: 330,
					easing: window.mina.backout
				};

			self.initAnimation(reminderElement, pathConfig);
			self.initToggleReminders(reminderElement);
			self.initEditingReminders(reminderElement, pathConfig);
			self.initSavingReminders(reminderElement, pathConfig);
		});
};

/**
 * Initializes onHover animation.
 * @param {Element} reminderElement
 * @param {Object} pathConfig
 */
HealthyNotifications.prototype.initAnimation =
	function (reminderElement, pathConfig) {
		reminderElement.addEventListener('mouseenter', function () {
			if (reminderElement.classList.contains('is-editing')) {
				return;
			}
			if (reminderElement.classList.contains('is-edited')) {
				return;
			}
			reminderElement.classList.add('is-active');
			pathConfig.path.animate({path: pathConfig.active},
				pathConfig.speed, pathConfig.easing);
		});

		reminderElement.addEventListener('mouseleave', function () {
			if (reminderElement.classList.contains('is-editing')) {
				return;
			}
			if (reminderElement.classList.contains('is-submitted')) {
				reminderElement.classList.remove('is-submitted');
				return;
			}
			if (reminderElement.classList.contains('is-edited')) {
				reminderElement.classList.remove('is-edited');
			}
			reminderElement.classList.remove('is-active');
			pathConfig.path.animate({path: pathConfig.initial},
				pathConfig.speed, pathConfig.easing);
		});
	};

/**
 * Initialize toggling reminders.
 * @param {Element} reminderElement
 */
HealthyNotifications.prototype.initToggleReminders =
	function (reminderElement) {
		var self = this,
			buttonElement = reminderElement
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
	};

/**
 * Initialize editing reminders.
 * @param {Element} reminderElement
 * @param {Object} pathConfig
 */
HealthyNotifications.prototype.initEditingReminders =
	function (reminderElement, pathConfig) {
		var buttonElement = reminderElement
				.querySelector('.js-reminder-button-edit'),
			intervalElement = reminderElement.querySelector('[name=interval]');

		buttonElement.addEventListener('click', function () {
			reminderElement.classList.add('is-editing');
			reminderElement.classList.remove('is-active');
			pathConfig.path.animate({path: pathConfig.editing},
				pathConfig.speed, pathConfig.easing);
			intervalElement.focus();
		});
	};

/**
 * Initialize saving reminders.
 * @param {Element} reminderElement
 * @param {Object} pathConfig
 */
HealthyNotifications.prototype.initSavingReminders =
	function (reminderElement, pathConfig) {
		var self = this,
			formElement = reminderElement
				.querySelector('.js-reminder-form');

		var reminderAlias = formElement.getAttribute('data-reminder-alias'),
			reminder = localStore.getData()[reminderAlias],
			defaultReminder = localStore.getDefaultData()[reminderAlias];

		formElement.addEventListener('submit', function (event) {
			event.preventDefault();
			event.stopPropagation();
			reminder.interval = Number(formElement
				.querySelector('[name=interval]').value);
			reminder.message =
				helpers.trimEnd(
					formElement.querySelector('[name=message]').value,
					MAX_MESSAGE_LENGTH
				) || defaultReminder.message;
			self.saveReminder(reminder);
			self.saveReminderView(reminder, reminderElement);
			pathConfig.path.animate({path: pathConfig.initial},
				pathConfig.speed, pathConfig.easing);
			reminderElement.classList.add('is-edited');
			reminderElement.classList.add('is-submitted');
			reminderElement.classList.remove('is-editing');
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
			.innerText = helpers.getIntervalShortString(reminder.interval);
		reminderElement.querySelector('.js-reminder-message')
			.innerText = reminder.message;
	};

/**
 * Greeting and checking permissions.
 */
HealthyNotifications.prototype.greeting = function () {
	setTimeout(function () {
		notifier.notify(GREETING_MESSAGE);
	}, GREETING_DELAY);
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