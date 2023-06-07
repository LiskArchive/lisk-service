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

const { init } = require('./shared/scheduler');
const { setAppContext } = require('./shared/utils/request');
const { waitForNodeToFinishSync } = require('./shared/init');

LoggerConfig(config.log);
const logger = Logger();

const app = Microservice({
	name: 'coordinator',
	transporter: config.transporter,
	brokerTimeout: config.brokerTimeout, // in seconds
	logger: config.log,
	events: {
		chainNewBlock: async (payload) => {
			logger.debug('Received a \'chainNewBlock\' event from connecter.');
			Signals.get('newBlock').dispatch(payload);
		},
		chainDeleteBlock: async (payload) => {
			logger.debug('Received a \'chainDeleteBlock\' event from connecter.');
			Signals.get('deleteBlock').dispatch(payload);
		},
		chainValidatorsChange: async (payload) => {
			logger.debug('Received a \'chainValidatorsChange\' event from connecter.');
			Signals.get('newRound').dispatch(payload);
		},
	},
	dependencies: [
		'connector',
		'indexer',
	],
});

setAppContext(app);

app.addJobs(path.join(__dirname, 'jobs'));

// Run the application
app.run().then(async () => {
	logger.info(`Service started ${packageJson.name}.`);
	logger.info('Checking for node sync status.');

	waitForNodeToFinishSync().then(async () => {
		logger.info('Initializing coordinator activities.');
		await init();
	});
}).catch(err => {
	logger.fatal(`Failed to start service ${packageJson.name} due to: ${err.message}.`);
	logger.fatal(err.stack);
	process.exit(1);
});
