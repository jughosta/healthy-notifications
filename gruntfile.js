'use strict';

var packageConfig = require('./package.json'),
	config = require('./config.json');

module.exports = function(grunt) {
	grunt.initConfig({
		'build-atom-shell': {
			tag: 'v0.25.2',
			nodeVersion: '0.12.2',
			buildDir: './build',
			projectName: packageConfig.name,
			productName: config.title
		}
	});

	grunt.loadNpmTasks('grunt-build-atom-shell');

	grunt.registerTask('default', ['build-atom-shell']);
};