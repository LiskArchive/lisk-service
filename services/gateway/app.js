/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const {
	Microservice, 
	Logger, 
	LoggerConfig
} = require('lisk-service-framework');

const ApiService = require("moleculer-web");
const config = require('./config');
const packageJson = require('./package.json');

const ip = '0.0.0.0';
const port = 3011;

LoggerConfig({
	...config.log,
	name: packageJson.name,
	version: packageJson.version,
});

const logger = Logger();

const app = Microservice({
	name: 'gateway',
	transporter: config.transporter,
	timeout: config.brokerTimeout,
	logger: console,
});

const broker = app.getBroker();

broker.createService({
	transporter: config.transporter,
	mixins: [ApiService],
	name: 'status',
	actions: {
		status() {
			return 'OK'
		}
	},
	settings: {
		port,
		ip,
		middleware: false,
		path: "/api",
	},
});

broker.start();
logger.info(`Started Gateway API on ${ip}:${port}`);
