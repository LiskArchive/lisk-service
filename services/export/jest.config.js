// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
	coverageDirectory: 'tests/coverage',

	testMatch: [
		'<rootDir>/tests/unit/*.test.js',
	],

	testTimeout: 15000,
	testEnvironment: 'node',
};
