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
const nodeStatus = require('./shared/nodeStatus');
const { init } = require('./shared/sdk');

const loggerConf = {
	...config.log,
	name: packageJson.name,
	version: packageJson.version,
};

LoggerConfig(loggerConf);

const logger = Logger();

const app = Microservice({
	name: 'connector',
	transporter: config.transporter,
	brokerTimeout: config.brokerTimeout, // in seconds
	logger: loggerConf,
});

nodeStatus.waitForNode().then(async () => {
	logger.info(`Found a node, starting service ${packageJson.name.toUpperCase()}...`);

	// Add routes, events & jobs
	app.addMethods(path.join(__dirname, 'methods'));

	const allBlockhainEndpoints = await require('./methods/proxy/allEndpoints');
	allBlockhainEndpoints.forEach((method) => app.addMethod(method));

	app.addEvents(path.join(__dirname, 'events'));
	const allBlockchainEvents = await require('./events/proxy/allEvents');
	allBlockchainEvents.forEach((event) => app.addEvent(event));

	app.addJobs(path.join(__dirname, 'jobs'));

	if (config.enableTestingMode) {
		app.addMethods(path.join(__dirname, 'methods', 'tests'));
	}

	app.run()
		.then(async () => {
			await init();
		})
		.catch(err => {
			logger.fatal(`Could not start the service ${packageJson.name} + ${err.message}`);
			logger.fatal(err.stack);
			process.exit(1);
		});
});
