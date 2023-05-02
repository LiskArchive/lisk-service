// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
	verbose: true,
	coverageDirectory: 'test/coverage',

	testMatch: [
		'<rootDir>/tests/functional/**/*.test.js',
	],

	testTimeout: 15000,
	testEnvironment: 'node',
};
