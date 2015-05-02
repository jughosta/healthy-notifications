var HealthyNotifications = require('./HealthyNotifications'),
	healthyNotifications = new HealthyNotifications();

onload = function () {
	healthyNotifications.load();
};