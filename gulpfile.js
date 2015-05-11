'use strict';

var gulp = require('gulp'),
	config = {
		cdnPath: 'components/'
	}, // custom config
	csstime = require('csstime-gulp-tasks'),
	browserify = require('gulp-browserify'),
	handlebars = require('gulp-handlebars'),
	uglify = require('gulp-uglify'),
	defineModule = require('gulp-define-module'),
	del = require('del');

csstime.loadGulpTasks(gulp, config);

gulp.task('publish-snapsvg', function () {
	return gulp.src([
		'node_modules/snapsvg/src/mina.js',
		'node_modules/snapsvg/dist/snap.svg-min.js',
		'node_modules/snapsvg/dist/snap.svg.js'
	])
		.pipe(gulp.dest('build'));
});

gulp.task('remove-tmp', function (cb) {
	del(['build/tmp'], cb);
});

gulp.task('remove-server', function (cb) {
	del([
		'build/server.js',
		'build/config.json',
		'build/package.json',
		'build/electron'
	], cb);
});

gulp.task('copy-server', function () {
	return gulp.src(['src/server.js', 'src/config.json', 'src/package.json'])
		.pipe(gulp.dest('build'));
});

gulp.task('copy-browser', ['copy-server'], function () {
	return gulp.src('src/browser/*.*')
		.pipe(gulp.dest('build/tmp/browser'));
});

gulp.task('browserify', ['copy-browser', 'handlebars'], function () {
	return gulp.src('build/tmp/browser/bundle.js')
		.pipe(browserify())
		.pipe(gulp.dest('build/'));
});

gulp.task('handlebars', function () {
	gulp.src(['src/components/**/*.hbs'])
		.pipe(handlebars({
			handlebars: require('handlebars')
		}))
		.pipe(defineModule('node'))
		.pipe(gulp.dest('build/tmp/browser/templates/'));
});

gulp.task('watch', ['browserify'], function () {
	gulp.watch(
		[
			'src/**/*.js', 'src/**/*.json',
			'src/components/**/*.hbs', 'src/config.json'
		],
		['browserify']
	);
});

gulp.task('uglify', ['browserify'], function () {
	return gulp.src('build/bundle.js')
		.pipe(uglify())
		.pipe(gulp.dest('build'));
});

gulp.task('release', ['browserify'], function () {
	gulp.start('remove-tmp');
});

gulp.task('release-web', ['release', 'uglify'], function () {
	gulp.start('remove-server');
});

var ELECTRON_TAG = '0.25.1',
	ELECTRON_BUILD = 'electron-v' + ELECTRON_TAG + '-darwin-x64.zip';

gulp.task('electron:clear', function (cb) {
	del(['build/electron'], cb);
});

gulp.task('electron:unzip', ['electron:clear'], function (cb) {
	var extract = require('extract-zip'),
		replace = require('gulp-replace'),
		appConfig = require('./src/package.json'),
		packageConfig = require('./package.json');
	extract(
		'node_modules/electron-prebuilt/' + ELECTRON_BUILD,
		{dir: 'build/electron'},
		function (error) {
			if (error) {
				cb(error);
				return;
			}

			gulp.src('build/electron/Electron.app/Contents/**/Info.plist')
				.pipe(replace('<string>' + ELECTRON_TAG + '</string>',
					'<string>' + packageConfig.version + '/' +
					ELECTRON_TAG + '</string>'))
				.pipe(replace('<string>Electron</string>', '<string>' +
					appConfig.productName + '</string>'))
				.pipe(replace('<string>Electron Helper', '<string>' +
					appConfig.productName + ' Helper'))
				.pipe(replace('<string>com.github.electron',
				 	'<string>com.github.' + appConfig.name.replace('-', '')))
				.pipe(gulp.dest('build/electron/Electron.app/Contents/'))
				.on('end', cb);
		});
});

gulp.task('electron:build', ['electron:unzip'], function () {
	return gulp.src('build/*.*')
		.pipe(gulp.dest('build/electron/Electron.app/Contents/Resources/app'));
});