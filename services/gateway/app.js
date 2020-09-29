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
	Libs,
} = require('lisk-service-framework');

const { MoleculerError } = require('moleculer').Errors;

const SocketIOService = require('./shared/moleculer-io');

const ApiService = Libs['moleculer-web'];

const config = require('./config');
const routes = require('./routes');
const namespaces = require('./namespaces');
const packageJson = require('./package.json');
const { getStatus, getReady } = require('./shared/status');
const { genDocs } = require('./apis/http-version1/swagger/generateDocs');

const { host, port } = config;

const loggerConf = {
	...config.log,
	name: packageJson.name,
	version: packageJson.version,
};

LoggerConfig(loggerConf);

const logger = Logger();

const broker = Microservice({
	name: 'gateway',
	transporter: config.transporter,
	timeout: config.brokerTimeout * 1000, // ms
	logger: loggerConf,
}).getBroker();

broker.createService({
	transporter: config.transporter,
	mixins: [ApiService, SocketIOService],
	name: 'gateway',
	actions: {
		spec() { return genDocs(); },
		status() { return getStatus(); },
		async ready() {
			const services = await getReady();
			// isReady: returns true if any one of service is unavailable
			const isReady = Object.keys(services.services).some(value => !services.services[value]);
			if (isReady === true) {
				return Promise.reject(new MoleculerError('503 Not available', 503, 'ERR_SOMETHING', { services }));
			} return Promise.resolve(services);
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

		// Global CORS settings for all routes
		cors: {
			// Configure the Access-Control-Allow-Origin CORS header
			origin: '*',
		},

		// Used server instance. If null, it will create a new HTTP(s)(2) server
		// If false, it will start without server in middleware mode
		server: true,

		logRequestParams: 'debug',
		logResponseData: 'debug',
		httpServerTimeout: 30 * 1000, // ms
		optimizeOrder: true,
		routes,

		assets: {
			folder: './public',
			options: {},
		},

		onError(req, res, err) {
			res.setHeader('Content-Type', 'application/json');
			res.writeHead(err.code || 500);
			res.end(JSON.stringify({
				error: true,
				message: `Server error: ${err.message}`,
			}));
		},
		io: {
			namespaces,
		},
	},
});

broker.start();
logger.info(`Started Gateway API on ${host}:${port}`);
