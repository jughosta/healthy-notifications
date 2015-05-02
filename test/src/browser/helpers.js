'use strict';

var assert = require('assert'),
	helpers = require('../../../src/browser/helpers');

describe('src/browser/helpers.js', function () {
	describe('getIntervalShortString()', function () {
		it('should return string for 0.5 minutes', function (done) {
			assert.equal(helpers.getIntervalShortString(0.5), '30 seconds');
			done();
		});

		it('should return string for 1 minute', function (done) {
			assert.equal(helpers.getIntervalShortString(1), 'minute');
			done();
		});

		it('should return string for 1.5 minutes', function (done) {
			assert.equal(helpers.getIntervalShortString(1.5), '1m 30s');
			done();
		});

		it('should return string for 2 minutes', function (done) {
			assert.equal(helpers.getIntervalShortString(2), '2 minutes');
			done();
		});

		it('should return string for 25.5 minutes', function (done) {
			assert.equal(helpers.getIntervalShortString(25.5), '25m 30s');
			done();
		});

		it('should return string for 60 minutes', function (done) {
			assert.equal(helpers.getIntervalShortString(60), 'hour');
			done();
		});

		it('should return string for 120 minutes', function (done) {
			assert.equal(helpers.getIntervalShortString(120), '2h');
			done();
		});

		it('should return string for 120.5 minutes', function (done) {
			assert.equal(helpers.getIntervalShortString(120.5), '2h 30s');
			done();
		});

		it('should return string for 130.5 minutes', function (done) {
			assert.equal(helpers.getIntervalShortString(130.5), '2h 10m 30s');
			done();
		});

		it('should return string for 150 minutes', function (done) {
			assert.equal(helpers.getIntervalShortString(150), '2h 30m');
			done();
		});

		it('should return string for day', function (done) {
			assert.equal(helpers.getIntervalShortString(24 * 60), 'day');
			done();
		});
	});

	describe('trimEnd()', function () {
		it('should return empty string', function (done) {
			assert.equal(helpers.trimEnd('       ', 10), '');
			done();
		});

		it('should return short string', function (done) {
			assert.equal(helpers.trimEnd(' test  ', 10), 'test');
			done();
		});

		it('should return trimmed string', function (done) {
			assert.equal(helpers.trimEnd(' test test ', 5), 'test...');
			done();
		});
	});
});