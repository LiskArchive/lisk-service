module.exports = {
	verbose: true,
	testMatch: [
		'<rootDir>/template/*.test.js',
	],
	testEnvironment: 'node',
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
