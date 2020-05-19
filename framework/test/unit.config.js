module.exports = {
	verbose: true,
	testMatch: [
		'<rootDir>/unit/*.spec.js',
	],
	testEnvironment: 'node',
	setupFilesAfterEnv: [
		'jest-extended',
		'<rootDir>/helpers/setupCustomMatchers.js',
	],
};
