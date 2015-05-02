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

gulp.task('copy-server', function () {
	return gulp.src(['src/server.js', 'config.json'])
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
		['src/**/*.js', 'src/**/*.json', 'src/components/**/*.hbs', 'config.json'],
		['browserify']
	);
});

gulp.task('uglify', ['browserify'], function () {
	return gulp.src('build/bundle.js')
		.pipe(uglify())
		.pipe(gulp.dest('build'));
});

gulp.task('release', ['uglify'], function () {
	gulp.start('remove-tmp');
});