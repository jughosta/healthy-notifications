var settingsTemplate = require('./templates/settings/template'),
	reminderTemplate = require('./templates/reminder/template'),
	Snap = require('snapsvg'),
	config = require('../../../config'),
	Notifier = require('./HTML5Notifier'),
	notifier = new Notifier(config.title),
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
	document.body.innerHTML = settingsTemplate({
		reminders: remindersList
	});

	this.initAnimation();
	this.initToggleReminders();
	this.startTimers();
	this.greeting();
};

/**
 * Initializes onHover animation.
 */
HealthyNotifications.prototype.initAnimation = function () {
	var speed = 330,
		easing = mina.backout;

	[].slice.call(document.querySelectorAll('.js-reminder'))
		.forEach(function (reminderElement) {
			var s = Snap(reminderElement.querySelector('svg')),
				path = s.select('.js-reminder-path'),
				pathHidden = s.select('.js-reminder-path-hidden'),
				pathConfig = {
					from: path.attr('d'),
					to: pathHidden.attr('d')
				};

			reminderElement.addEventListener('mouseenter', function () {
				path.animate({'path': pathConfig.to}, speed, easing);
			});

			reminderElement.addEventListener('mouseleave', function () {
				path.animate({'path': pathConfig.from}, speed, easing);
			});
		});
};

/**
 * Initialize toggling reminders.
 */
HealthyNotifications.prototype.initToggleReminders = function () {
	var self = this;

	[].slice.call(document.querySelectorAll('.js-reminder'))
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
 * Toggles reminder.
 * @param {Object} reminder
 */
HealthyNotifications.prototype.toggleReminder = function (reminder) {
	reminder.isEnabled = !reminder.isEnabled;
	localStore.save(localStore.getData());
	this.startTimerForReminder(reminder);
};

/**
 * Greeting and checking permissions.
 */
HealthyNotifications.prototype.greeting = function () {
	notifier.notify(GREETING_MESSAGE);
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