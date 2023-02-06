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
module.exports = {
	verbose: true,
	testMatch: [
		'<rootDir>/integration/api_v3/http/*.test.js',
		'<rootDir>/integration/api_v3/rpc/*.test.js',
		'<rootDir>/integration/api_v3/events/*.test.js',
		'<rootDir>/integration/gateway/*.test.js',
	],
	testEnvironment: 'node',
	testTimeout: 50000,
	maxWorkers: 1,
	setupFilesAfterEnv: [
		'jest-extended',
		'<rootDir>/helpers/setupCustomMatchers.js',
		'<rootDir>/setup.js',
	],
	watchPlugins: [
		['jest-watch-toggle-config', { setting: 'verbose' }],
		['jest-watch-toggle-config', { setting: 'bail' }],
		['jest-watch-toggle-config', { setting: 'notify' }],
		'jest-watch-typeahead/filename',
	],
};
