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
	Signals,
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

const defaultBrokerConfig = Object.freeze({
	name: 'indexer',
	transporter: config.transporter,
	brokerTimeout: config.brokerTimeout, // in seconds
	logger: loggerConf,
	events: {
		chainNewBlock: async () => {
			logger.debug('Received a \'chainNewBlock\' event from connecter.');
			Signals.get('chainNewBlock').dispatch();
		},
	},
	dependencies: [
		'connector',
	],
});

const app = Microservice(defaultBrokerConfig);

// Start a temporary broker to query for SDK module names
// To be used for dynamically registering the available module specific endpoints
const tempApp = Microservice({
	...defaultBrokerConfig,
	name: 'temp_service_indexer',
	events: {},
});
setAppContext(tempApp);

tempApp.run().then(async () => {
	const { getRegisteredModules } = require('./shared/constants');
	const registeredModules = await getRegisteredModules();
	registeredModules.forEach((module, index, self) => {
		// Map 'reward' module to the 'dynamicReward' endpoints
		if (module === 'reward') self[index] = 'dynamicReward';
	});
	await tempApp.getBroker().stop();

	// Add routes, events & jobs
	if (config.operations.isIndexingModeEnabled) {
		app.addMethods(path.join(__dirname, 'methods', 'indexer'));
		app.addEvents(path.join(__dirname, 'events'));
	}

	if (config.operations.isDataRetrievalModeEnabled) {
		app.addJobs(path.join(__dirname, 'jobs', 'dataService'));

		// First register all the default methods and then app registered module specific methods
		app.addMethods(path.join(__dirname, 'methods', 'dataService'));
		registeredModules.forEach(module => {
			const methodFilePath = path.join(__dirname, 'methods', 'dataService', 'modules', `${module}.js`);
			try {
				// eslint-disable-next-line import/no-dynamic-require
				const methods = require(methodFilePath);
				methods.forEach(method => app.addMethod(method));
			} catch (err) {
				logger.warn(`Moleculer method definitions missing for module: ${moduleName}. Is this expected?\nMethod definitions were expected at: ${methodFilePath}.`);
			}
		});
	}

	// Set the correct app context and start the application
	setAppContext(app);
	app.run().then(async () => {
		logger.info(`Service started ${packageJson.name}.`);

		// Init database
		const status = require('./shared/indexer/indexStatus');
		await status.init();

		if (config.operations.isIndexingModeEnabled) {
			const processor = require('./shared/processor');
			await processor.init();
		}
	});
}).catch(err => {
	logger.fatal(`Could not start the service ${packageJson.name} + ${err.message}`);
	logger.fatal(err.stack);
	process.exit(1);
});
