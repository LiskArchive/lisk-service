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

const SocketIOService = require('./shared/moleculer-io');

const ApiService = Libs['moleculer-web'];
const { methods } = require('./shared/moleculer-web/methods');

const config = require('./config');
const routes = require('./routes');
const namespaces = require('./namespaces');
const packageJson = require('./package.json');
const { ValidationException } = require('./shared/exceptions');
const { getStatus } = require('./shared/status');
const { getReady, updateSvcStatus } = require('./shared/ready');
const { genDocs } = require('./shared/generateDocs');

const mapper = require('./shared/customMapper');
const blockResponse = require('./sources/version2/mappings/block');
const forgerResponse = require('./sources/version2/mappings/forgers');
const transactionResponse = require('./sources/version2/mappings/transaction');

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

const sendSocketIoEvent = (eventName, payload) => {
	broker.call('gateway.broadcast', {
		namespace: '/blockchain',
		event: eventName,
		args: [payload],
	});
};

broker.createService({
	transporter: config.transporter,
	mixins: [ApiService, SocketIOService],
	name: 'gateway',
	actions: {
		spec(ctx) { return genDocs(ctx); },
		status() { return getStatus(this.broker); },
		ready() { return getReady(this.broker); },
	},
	settings: {
		host,
		port,
		path: '/api',
		use: [],

		cors: {
			origin: '*',
			methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
			allowedHeaders: [
				'Content-Type',
				'Access-Control-Request-Method',
				'Access-Control-Request-Headers',
				'Access-Control-Max-Age',
			],
			exposedHeaders: [],
			credentials: false,
			maxAge: 3600,
		},

		// Used server instance. If null, it will create a new HTTP(s)(2) server
		// If false, it will start without server in middleware mode
		server: true,

		logRequestParams: 'debug',
		logResponseData: 'debug',
		logRequest: 'debug',
		enableHTTPRequest: false,
		log2XXResponses: 'debug',
		enable2XXResponses: false,
		httpServerTimeout: 30 * 1000, // ms
		optimizeOrder: true,
		routes,

		assets: {
			folder: './public',
			options: {},
		},

		onError(req, res, err) {
			if (err instanceof ValidationException === false) {
				res.setHeader('Content-Type', 'application/json');
				res.writeHead(err.code || 500);
				res.end(JSON.stringify({
					error: true,
					message: `Server error: ${err.message}`,
				}));
			}
		},
		io: {
			namespaces,
		},
	},
	methods,
	events: {
		'block.change': (payload) => sendSocketIoEvent('update.block', mapper({ data: [payload] }, {
			data: ['data', blockResponse],
			meta: {},
		})),
		'round.change': (payload) => sendSocketIoEvent('update.round', mapper(payload, {
			data: ['data', forgerResponse],
			meta: {},
		})),
		'forgers.change': (payload) => sendSocketIoEvent('update.forgers', mapper(payload, {
			data: ['data', forgerResponse],
			meta: {},
		})),
		'transactions.confirmed': (payload) => sendSocketIoEvent('update.transactions.confirmed', mapper(payload, {
			data: ['data', transactionResponse],
			meta: {},
		})),
		'update.fee_estimates': (payload) => sendSocketIoEvent('update.fee_estimates', payload),
		'coreService.Ready': (payload) => updateSvcStatus(payload),
	},
});

broker.waitForServices(['core', 'market']);

broker.start();
logger.info(`Started Gateway API on ${host}:${port}`);
