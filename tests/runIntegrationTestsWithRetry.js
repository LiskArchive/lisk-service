// run_tests_with_retries.js
const { runCLI } = require('jest')
const jestConfig = require('./jest.config.integration.apiv3.sdkv6')

const NUM_RETRIES = 20;

const delay = (delayInms) => {
    return new Promise(resolve => setTimeout(resolve, delayInms));
  };

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
  retriesRemaining = retriesRemaining - 1;
  console.log(`Retrying failed tests. ${retriesRemaining} attempts remaining.`);
  return await runTestsAndRetry(jestConfig, retriesRemaining);
}

runTestsAndRetry(jestConfig, NUM_RETRIES);