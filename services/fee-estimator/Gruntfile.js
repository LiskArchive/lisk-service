/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
module.exports = function (grunt) {
	// Load NPM Tasks
	grunt.loadNpmTasks('grunt-mocha-test');

	// Load Custom Tasks
	grunt.loadTasks('tasks');

	// Project Configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		mochaTest: {
			test: {
				options: {
					reporter: 'mocha-multi-reporters',
					reporterOptions: {
						reporterEnabled: 'spec,xunit',
						xunitReporterOptions: {
							output: './xunit-report.xml',
						},
					},
					quiet: false,
					clearRequireCache: false,
					noFail: false,
					timeout: '250s',
				},
				src: ['test'],
			},
		},
	});

	// Register tasks for travis.
	grunt.registerTask('test', ['mochaTest']);
};
