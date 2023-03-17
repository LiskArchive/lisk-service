// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
	testMatch: [
		'<rootDir>/services/*/tests/unit/*.test.js',
	],
	verbose: false,
	collectCoverage: false,
	coverageReporters: ['json'],
	coverageDirectory: '.coverage',
	testTimeout: 15000,
	testEnvironment: 'node',
};
