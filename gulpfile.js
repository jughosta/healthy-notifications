'use strict';

var gulp = require('gulp'),
	config = {
		cdnPath: 'components/'
	}, // custom config
	csstime = require('csstime-gulp-tasks'),
	browserify = require('gulp-browserify'),
	handlebars = require('gulp-handlebars'),
	defineModule = require('gulp-define-module');

csstime.loadGulpTasks(gulp, config);

gulp.task('publish-snapsvg', function () {
	return gulp.src([
		'node_modules/snapsvg/src/mina.js',
		'node_modules/snapsvg/dist/snap.svg-min.js',
		'node_modules/snapsvg/dist/snap.svg.js'
	])
		.pipe(gulp.dest('build'));
});

gulp.task('copy', function () {
	return gulp.src('src/browser/*.*')
		.pipe(gulp.dest('build/__csstime-tmp/browser'));
});

gulp.task('browserify', ['copy', 'handlebars'], function () {
	return gulp.src('build/__csstime-tmp/browser/bundle.js')
		.pipe(browserify())
		.pipe(gulp.dest('build/'));
});

gulp.task('handlebars', function () {
	gulp.src(['src/components/**/*.hbs'])
		.pipe(handlebars({
			handlebars: require('handlebars')
		}))
		.pipe(defineModule('node'))
		.pipe(gulp.dest('build/__csstime-tmp/browser/templates/'));
});

gulp.task('watch', ['browserify'], function () {
	gulp.watch(['src/browser/*.*', 'src/components/**/*.hbs'], ['browserify']);
});