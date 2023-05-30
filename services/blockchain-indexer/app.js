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
	MySQL: {
		KVStore: {
			configureKeyValueTable,
		},
	},
} = require('lisk-service-framework');

const config = require('./config');

configureKeyValueTable(config.endpoints.mysql);
LoggerConfig(config.log);

const packageJson = require('./package.json');

const { MODULE } = require('./shared/constants');
const { setAppContext } = require('./shared/utils/request');

const logger = Logger();

const defaultBrokerConfig = {
	name: 'indexer',
	transporter: config.transporter,
	brokerTimeout: config.brokerTimeout, // in seconds
	logger: config.log,
	events: {
		chainNewBlock: async () => {
			logger.debug('Received a \'chainNewBlock\' event from connecter.');
			Signals.get('chainNewBlock').dispatch();
		},
	},
	dependencies: [
		'connector',
		'fees',
	],
};

// Add routes, events & jobs
(async () => {
	const registeredModules = [];
	if (config.operations.isDataRetrievalModeEnabled) {
		// Start a temporary broker to query for SDK module names
		// To be used for dynamically registering the available module specific endpoints
		const tempApp = Microservice({
			...defaultBrokerConfig,
			name: 'temp_service_indexer',
			events: {},
		});
		setAppContext(tempApp);
		await tempApp.run();
		const { getRegisteredModules } = require('./shared/constants');
		registeredModules.push(...await getRegisteredModules());
		// Stop the temporary node before app definition to avoid context (logger) overwriting issue
		await tempApp.getBroker().stop();
	}

	const app = Microservice(defaultBrokerConfig);

	app.addMethods(path.join(__dirname, 'methods'));

	if (config.operations.isDataRetrievalModeEnabled) {
		app.addJobs(path.join(__dirname, 'jobs', 'dataService'));

		// First register all the default methods followed by app specific module methods
		app.addMethods(path.join(__dirname, 'methods', 'dataService'));
		registeredModules.forEach(module => {
			// Map 'reward' module to the 'dynamicReward' module endpoints
			if (module === MODULE.REWARD) module = MODULE.DYNAMIC_REWARD;

			const methodsFilePath = path.join(__dirname, 'methods', 'dataService', 'modules', `${module}.js`);
			try {
				// eslint-disable-next-line import/no-dynamic-require
				const methods = require(methodsFilePath);
				methods.forEach(method => app.addMethod(method));
			} catch (err) {
				logger.warn(`Moleculer method definitions missing for module: ${module}. Is this expected?\nWas expected at: ${methodsFilePath}.`);
			}
		});
	}

	if (config.operations.isIndexingModeEnabled) {
		app.addMethods(path.join(__dirname, 'methods', 'indexer'));
		app.addEvents(path.join(__dirname, 'events'));
		app.addJobs(path.join(__dirname, 'jobs', 'indexer'));
	}

	// Set the app context and start the application
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
	}).catch(err => {
		logger.fatal(`Failed to start service ${packageJson.name} due to: ${err.message}.`);
		logger.fatal(err.stack);
		process.exit(1);
	});
})();
