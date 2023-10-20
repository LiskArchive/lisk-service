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
const { Microservice, LoggerConfig, Logger } = require('lisk-service-framework');

const config = require('./config');

LoggerConfig(config.log);

const packageJson = require('./package.json');

const { init } = require('./shared/init');
const { initDatabase } = require('./shared/database/init');
const { setAppContext } = require('./shared/utils/request');

const logger = Logger();

// Initialize Microservice framework
const app = Microservice({
	name: 'app-registry',
	transporter: config.transporter,
	timeout: config.brokerTimeout,
	packageJson,
	logger: config.log,
	dependencies: ['indexer'],
});

setAppContext(app);

// Add routes, events & jobs
app.addMethods(path.join(__dirname, 'methods'));
app.addJobs(path.join(__dirname, 'jobs'));
app.addEvents(path.join(__dirname, 'events'));

// Run the application
const reportErrorAndExitProcess = err => {
	logger.fatal(`Failed to start service ${packageJson.name} due to: ${err.message}.`);
	logger.fatal(err.stack);
	process.exit(1);
};

initDatabase()
	.then(() =>
		app
			.run()
			.then(async () => {
				await init();
				logger.info(`Service started ${packageJson.name}.`);
			})
			.catch(reportErrorAndExitProcess),
	)
	.catch(reportErrorAndExitProcess);
