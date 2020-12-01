module.exports = {
	verbose: true,
	testMatch: [
		'<rootDir>/integration/**/*.test.js',
		'<rootDir>/functional/**/*.test.js',
	],
	testEnvironment: 'node',
	testTimeout: 15000,
	setupFilesAfterEnv: [
		'jest-extended',
		'<rootDir>/helpers/setupCustomMatchers.js',
	],
	watchPlugins: [
		['jest-watch-toggle-config', { setting: 'verbose' }],
		['jest-watch-toggle-config', { setting: 'bail' }],
		['jest-watch-toggle-config', { setting: 'notify' }],
		'jest-watch-typeahead/filename',
	],
};
