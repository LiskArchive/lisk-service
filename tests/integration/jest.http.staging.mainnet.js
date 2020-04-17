module.exports = {
	verbose: true,
	testMatch: [
		'<rootDir>/api/http_staging_mainnet/*.test.js',
	],
	testEnvironment: 'node',
	setupFilesAfterEnv: [
		'jest-extended',
		'<rootDir>/helpers/setupCustomMatchers.js',
	],
};
