/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
	LoggerConfig
} = require('lisk-service-framework');

const config = require('./config');
const packageJson = require('./package.json');

LoggerConfig({
	...config.log,
	name: packageJson.name,
	version: packageJson.version,
});

const logger = Logger();

const app = Microservice({
	name: 'core',
	transporter: config.transporter,
	timeout: config.brokerTimeout,
	logger: Logger('lisk:moleculer'),
});

app.addMethods(path.join(__dirname, 'methods'));
app.addEvents(path.join(__dirname, 'events'));
app.addJobs(path.join(__dirname, 'jobs'));

const CORE_DISCOVERY_INTERVAL = 10 * 1000; // ms

const nodeStatus = require('./helpers/nodeStatus');
const updatersInit = require('./helpers/updatersInit');
const socketInit = require('./helpers/socket');

nodeStatus().then(() => {
	updatersInit();
	setInterval(nodeStatus, CORE_DISCOVERY_INTERVAL);

	socketInit(app.getBroker());

	app.run().then(() => {
		logger.info(`Service started ${packageJson.name}`);
	}).catch((err) => {
		logger.fatal(`Could not start the service ${packageJson.name} + ${err.message}`);
		logger.fatal(err.stack);
		process.exit(1);
	});
});



