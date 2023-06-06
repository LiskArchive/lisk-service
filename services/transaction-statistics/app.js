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

const { initDatabase } = require('./shared/database/init');
const { setAppContext } = require('./shared/utils/request');

LoggerConfig(config.log);

const logger = Logger();

const app = Microservice({
	name: 'statistics',
	transporter: config.transporter,
	brokerTimeout: config.brokerTimeout, // in seconds
	logger: config.log,
	events: {
		'index.ready': (payload) => Signals.get('blockIndexReady').dispatch(payload),
	},
	dependencies: [
		'indexer',
		'connector',
	],
});

setAppContext(app);

// Add routes, events & jobs
app.addMethods(path.join(__dirname, 'methods'));
app.addJobs(path.join(__dirname, 'jobs'));

// Run the application
const reportErrorAndExitProcess = (err) => {
	logger.fatal(`Failed to start service ${packageJson.name} due to: ${err.message}.`);
	logger.fatal(err.stack);
	process.exit(1);
};

initDatabase()
	.then(() => app.run()
		.then(() => { logger.info(`Service started ${packageJson.name}.`); })
		.catch(reportErrorAndExitProcess),
	)
	.catch(reportErrorAndExitProcess);
