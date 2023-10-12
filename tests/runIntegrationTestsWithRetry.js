// run_tests_with_retries.js
const { runCLI } = require('jest');
const jestIntegrationTestsConfig = require('./jest.config.integration.apiv3');

const NUM_RETRIES = 20;

const delay = (delayInms) => new Promise(resolve => setTimeout(resolve, delayInms));

async function runTestsAndRetry(jestConfig, retriesRemaining) {
	const { results } = await runCLI(jestConfig, ['integration']);

	// If there were no failures or we're out of retries, return
	if (!results.numFailedTests && !results.numFailedTestSuites) {
		return Promise.resolve();
	}
	if (retriesRemaining === 1) {
		return Promise.reject(new Error('Out of retries. Some tests are still failing.'));
	}

	// Compile a list of the test suites that failed and tell Jest to only run those files next time
	const failedTestPaths = results.testResults
		.filter((testResult) => testResult.numFailingTests > 0 || testResult.failureMessage)
		.map((testResult) => testResult.testFilePath);
	jestConfig.testMatch = failedTestPaths;

	// Decrement retries remaining and retry
	await delay(10000);
	retriesRemaining -= 1;
	console.info(`Retrying failed tests. ${retriesRemaining} attempts remaining.`);

	// eslint-disable-next-line no-return-await
	return await runTestsAndRetry(jestConfig, retriesRemaining);
}

runTestsAndRetry(jestIntegrationTestsConfig, NUM_RETRIES);
