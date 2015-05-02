'use strict';

var assert = require('assert'),
	LocalStore = require('../../../src/browser/LocalStore');

describe('src/browser/LocalStore.js', function () {
	it('should return default data', function (done) {
		var testData = {test: 'testValue'},
			localStore = new LocalStore(testData);

		assert.deepEqual(localStore.getData(), testData);
		done();
	});

	it('should save data', function (done) {
		var testData = {test: 'testValue'},
			localStore = new LocalStore(testData);

		testData.test2 = 'testValue2';
		localStore.save(localStore.getData());

		assert.deepEqual(localStore.getData(), testData);
		done();
	});

	it('should update data', function (done) {
		var testData = {test: 'testValue'},
			newTestData = {newTest: 'newTestValue'},
			localStore = new LocalStore(testData);

		localStore.save(newTestData);

		assert.deepEqual(localStore.getData(), newTestData);
		done();
	});

	it('should restore default data', function (done) {
		var testData = {test: 'testValue'},
			newTestData = {newTest: 'newTestValue'},
			localStore = new LocalStore(testData);

		localStore.save(newTestData);
		localStore.restore();

		assert.deepEqual(localStore.getData(), testData);
		done();
	});
});