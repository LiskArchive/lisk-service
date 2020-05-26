module.exports = {
	verbose: true,
	testMatch: [
		'<rootDir>/functional/*.test.js',
	],
	testEnvironment: 'node',
	setupFilesAfterEnv: [
		'jest-extended',
		'<rootDir>/helpers/setupCustomMatchers.js',
	],
};
