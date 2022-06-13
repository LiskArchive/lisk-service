/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
const path = require('path');
const {
	Microservice,
	Logger,
	LoggerConfig,
} = require('lisk-service-framework');

const config = require('./config');
const packageJson = require('./package.json');
const { setAppContext } = require('./shared/utils/request');

const loggerConf = {
	...config.log,
	name: packageJson.name,
	version: packageJson.version,
};

LoggerConfig(loggerConf);

const logger = Logger();

const app = Microservice({
	name: 'indexer',
	transporter: config.transporter,
	brokerTimeout: config.brokerTimeout, // in seconds
	logger: loggerConf,
	dependencies: [
		'connector',
	],
});

setAppContext(app);

// Add routes, events & jobs
if (config.operations.isIndexingModeEnabled) {
	app.addMethods(path.join(__dirname, 'methods', 'indexer'));
	app.addEvents(path.join(__dirname, 'events'));
}

if (config.operations.isDataRetrievalModeEnabled) {
	app.addMethods(path.join(__dirname, 'methods', 'dataService'));
}

app.addJobs(path.join(__dirname, 'jobs'));

// Run the application
app.run().then(async () => {
	logger.info(`Service started ${packageJson.name}`);

	// Init database
	const status = require('./shared/indexer/indexStatus');
	await status.init();

	if (config.operations.isIndexingModeEnabled) {
		const processor = require('./shared/processor');
		await processor.init();
	}
}).catch(err => {
	logger.fatal(`Could not start the service ${packageJson.name} + ${err.message}`);
	logger.fatal(err.stack);
	process.exit(1);
});
