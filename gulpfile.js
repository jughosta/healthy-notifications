'use strict';

var gulp = require('gulp'),
	config = {
		cdnPath: 'components/'
	}, // custom config
	csstime = require('csstime-gulp-tasks');

csstime.loadGulpTasks(gulp, config);

gulp.task('publish-snapsvg', function () {
	return gulp.src('node_modules/snapsvg/dist/snap.svg-min.js')
		.pipe(gulp.dest('build'));
});