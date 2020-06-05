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
	LoggerConfig,
} = require('lisk-service-framework');

const ApiService = require('moleculer-web');
const config = require('./config');
const routes = require('./routes');
const packageJson = require('./package.json');

const { host, port } = config;

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
	logger: Logger('lisk-service-gateway'),
});

const broker = app.getBroker();

broker.createService({
	transporter: config.transporter,
	mixins: [ApiService],
	name: 'status',
	actions: {
		status() {
			return 'OK';
		},
	},
	settings: {
		host,
		port,
		path: '/api',
		use: [
			// compression(),
			// cookieParser()
		],

		// Used server instance. If null, it will create a new HTTP(s)(2) server
		// If false, it will start without server in middleware mode
		server: true,

		logRequestParams: 'info',
		logResponseData: 'debug',
		httpServerTimeout: 30,
		optimizeOrder: true,
		routes,

		assets: {
			folder: './public',
			options: {},
		},

		onError(req, res, err) {
			res.setHeader('Content-Type', 'text/plain');
			res.writeHead(err.code || 500);
			res.end(`Server error: ${err.message}`);
		},
	},
});

broker.start();
logger.info(`Started Gateway API on ${host}:${port}`);
