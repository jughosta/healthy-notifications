'use strict';

var HealthyNotifications = require('./HealthyNotifications');

window.document.addEventListener('DOMContentLoaded', function () {
	var healthyNotifications = new HealthyNotifications();
	healthyNotifications.load();
});