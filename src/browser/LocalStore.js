'use strict';

module.exports = LocalStore;

var LOCAL_STORAGE_KEY = 'localStoreData',
	windowObject = (typeof window === 'undefined') ? {} : window;

/**
 * Local store
 * @param {Object} defaultData
 * @constructor
 */
function LocalStore (defaultData) {
	this._defaultData = defaultData || {};
	this._data = this.load();
}

/**
 * Data
 * @type {Object}
 * @private
 */
LocalStore.prototype._data = null;

/**
 * Default data
 * @type {Object}
 * @private
 */
LocalStore.prototype._defaultData = null;

/**
 * Gets data.
 * @returns {Object}
 */
LocalStore.prototype.getData = function () {
	return this._data;
};

/**
 * Gets default data.
 * @returns {Object}
 */
LocalStore.prototype.getDefaultData = function () {
	return this._defaultData;
};

/**
 * Loads data.
 * @returns {Object}
 */
LocalStore.prototype.load = function () {
	if (!windowObject.localStorage) {
		return this._defaultData;
	}

	var data = windowObject.localStorage.getItem(LOCAL_STORAGE_KEY);
	if (!data) {
		return this._defaultData;
	}

	console.log('LocalStore: loaded custom data ' + data);

	return JSON.parse(data);
};

/**
 * Saves data.
 * @param {Object} data
 */
LocalStore.prototype.save = function (data) {
	this._data = data;

	if (!windowObject.localStorage) {
		return;
	}

	windowObject.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));

	console.log('LocalStore: saved ' + JSON.stringify(data));
};

/**
 * Restores default data.
 */
LocalStore.prototype.restore = function () {
	this._data = this._defaultData;

	if (!windowObject.localStorage) {
		return;
	}

	windowObject.localStorage.removeItem(LOCAL_STORAGE_KEY);

	console.log('LocalStore: restored ' + JSON.stringify(this._data));
};