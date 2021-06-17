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
	LoggerConfig,
	Logger,
} = require('lisk-service-framework');

const config = require('./config');
const packageJson = require('./package.json');

// Configure logger
const loggerConf = {
	...config.log,
	name: packageJson.name,
	version: packageJson.version,
};

LoggerConfig(loggerConf);

const logger = Logger();

// Initialize Microservice framework
const app = Microservice({
	name: 'template',
	transporter: config.transporter,
	timeout: config.brokerTimeout,
	packageJson,
	logger: loggerConf,
});

// Add routes, events & jobs
app.addMethods(path.join(__dirname, 'methods'));
app.addEvents(path.join(__dirname, 'events'));
app.addJobs(path.join(__dirname, 'jobs'));

// Run the application
app.run().then(() => {
	logger.info(`Service started ${packageJson.name}`);
}).catch(err => {
	logger.fatal(`Could not start the service ${packageJson.name} + ${err.message}`);
	logger.fatal(err.stack);
	process.exit(1);
});

// ****************************************************************************************************
// ****************************************************************************************************

const postgres = require('./services/postgres');

const request = {
	twitter: require('./services/twitter'),
};

const MILLISECONDS_IN_SECOND = 1000;

const moleculer = require('./services/moleculer');

moleculer.init(config);

// Postgres Database
Object.keys(config.postgresTables).reduce((p, table) =>
	p.then(() => postgres.initializeTable(table))
	, Promise.resolve()).then(() => {
		Object.values(config.sources).forEach(async (source) => {
			if (source.enabled === true) {
				await postgres.updateDataInDb(source, request[source.type]);
				setInterval(() => {
					postgres.updateDataInDb(source, request[source.type]);
				}, (source.interval * MILLISECONDS_IN_SECOND));
			}
		});
	});
