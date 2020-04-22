module.exports = {
	verbose: true,
	testMatch: [
		'<rootDir>/api/http_v1_local/*.test.js',
		'<rootDir>/api/http_v1_testnet/*.test.js',
		'<rootDir>/api/socketJsonRpc_v1_local/*.test.js',
		'<rootDir>/api/socketJsonRpc_v1_testnet/*.test.js',
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

