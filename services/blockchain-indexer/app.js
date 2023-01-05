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
const MODULE = {
	DYNAMIC_REWARD: 'dynamicReward',
	REWARD: 'reward',
};

const defaultBrokerConfig = {
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
};

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
	let registeredModules = await getRegisteredModules();
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

		// Map 'reward' module to the 'dynamicReward' module endpoints
		registeredModules = registeredModules.map(
			module => module === MODULE.REWARD ? MODULE.DYNAMIC_REWARD : module,
		);
		registeredModules.forEach(module => {
			const methodsFilePath = path.join(__dirname, 'methods', 'dataService', 'modules', `${module}.js`);
			try {
				// eslint-disable-next-line import/no-dynamic-require
				const methods = require(methodsFilePath);
				methods.forEach(method => app.addMethod(method));
			} catch (err) {
				logger.warn(`Moleculer method definitions missing for module: ${module}. Is this expected?\nMethod definitions were expected at: ${methodsFilePath}.`);
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
