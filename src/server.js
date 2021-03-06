'use strict';

var app = require('app'),  // Module to control application life.
	// Module to create native browser window.
	BrowserWindow = require('browser-window'),
	config = require('./config.json');

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function () {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		title: config.title,
		width: config.size.width,
		height: config.size.height,
		'min-width': config.size.width,
		'min-height': config.size.height,
		icon: 'file://' + __dirname + '/' + config.icon
	});

	// and load the index.html of the app.
	mainWindow.loadUrl('file://' + __dirname + '/' + config.index);

	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});
});