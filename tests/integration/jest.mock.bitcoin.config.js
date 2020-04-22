module.exports = {
	verbose: true,
	testMatch: [
		'<rootDir>/api/http_bitcoin_mock/*.test.js',
	],
	testEnvironment: 'node',
	setupFilesAfterEnv: [
		'jest-extended',
		'<rootDir>/helpers/setupCustomMatchers.js',
	],
};
