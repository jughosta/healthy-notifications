var settingsTemplate = require('./templates/settings/template'),
	reminderTemplate = require('./templates/reminder/template'),
	reminders = require('./reminders').reminders,
	Snap = require('snapsvg'),
	config = require('../../../config'),
	Notifier = require('./HTML5Notifier'),
	notifier = new Notifier(config.title);

var GREETING_MESSAGE = 'Hi! Have a nice day!',
	INTERVAL_RATIO = 60 * 1000; // in minutes

module.exports = HealthyNotifications;

/**
 * Healthy notifications
 * @constructor
 */
function HealthyNotifications () {

}

/**
 * Loads reminders.
 */
HealthyNotifications.prototype.load = function () {
	var remindersList = [];
	reminders.forEach(function (reminder) {
		remindersList.push(reminderTemplate({
			reminder: reminder
		}));
	});
	document.body.innerHTML = settingsTemplate({
		reminders: remindersList
	});

	this.initAnimation();
	this.greeting();
	this.startTimers();
};

/**
 * Initializes onHover animation.
 */
HealthyNotifications.prototype.initAnimation = function () {
	var speed = 330,
		easing = mina.backout;

	[].slice.call(document.querySelectorAll('.js-reminder'))
		.forEach(function (el) {
			var s = Snap(el.querySelector('svg')),
				path = s.select('#js-reminder-path'),
				pathHidden = s.select('#js-reminder-path-hidden'),
				pathConfig = {
					from: path.attr('d'),
					to: pathHidden.attr('d')
				};

			el.addEventListener('mouseenter', function () {
				path.animate({'path': pathConfig.to}, speed, easing);
			});

			el.addEventListener('mouseleave', function () {
				path.animate({'path': pathConfig.from}, speed, easing);
			});
		});
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
	var self = this;
	reminders.forEach(function (reminder) {
		self.startTimerForReminder(reminder);
	});
};

/**
 * Starts timer for reminder.
 * @param {Object} reminder
 */
HealthyNotifications.prototype.startTimerForReminder = function (reminder) {
	if (reminder.timer) {
		clearInterval(reminder.timer);
	}

	if (!reminder.isEnable) {
		return;
	}

	reminder.timer = setInterval(function () {
		notifier.notify(reminder.message);
	}, reminder.interval * INTERVAL_RATIO); // in minutes
};