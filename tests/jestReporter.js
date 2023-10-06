class TestReporter {
	constructor(globalConfig, options) {
		this.globalConfig = globalConfig;
		this.options = options;
	}

	// eslint-disable-next-line class-methods-use-this, consistent-return
	onTestResult(test, testResult) {
		if (testResult.status === 'failed') {
			console.info(`Test ${testResult.fullName} failed. Adding a delay...`);
			return new Promise(resolve => setTimeout(resolve, 1000));
		}
	}
}

module.exports = TestReporter;
