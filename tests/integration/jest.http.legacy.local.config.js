module.exports = {
	verbose: true,
	testMatch: [
		'<rootDir>/api/http_legacy_local/*.test.js',
	],
	testEnvironment: 'node',
	setupFilesAfterEnv: [
		'jest-extended',
		'<rootDir>/helpers/setupCustomMatchers.js',
	],
};
