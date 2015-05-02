var settingsTemplate = require('./templates/settings/template'),
	reminderTemplate = require('./templates/reminder/template'),
	reminders = require('./reminders').reminders,
	Snap = require('snapsvg');

module.exports = HealthyNotifications;

function HealthyNotifications () {

}

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
};

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