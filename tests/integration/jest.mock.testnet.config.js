module.exports = {
	verbose: true,
	testMatch: [
		'<rootDir>/api/mock_testnet/*.test.js',
	],
	testEnvironment: 'node',
	setupFilesAfterEnv: [
		'jest-extended',
		'<rootDir>/helpers/setupCustomMatchers.js',
	],
};
