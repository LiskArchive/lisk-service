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
const BluebirdPromise = require('bluebird');

const { MoleculerError } = require('moleculer').Errors;

const SocketIOService = require('./shared/moleculer-io');

const ApiService = Libs['moleculer-web'];

const config = require('./config');
const routes = require('./routes');
const namespaces = require('./namespaces');
const packageJson = require('./package.json');
const { updateServiceStatus, getStatus } = require('./shared/status');
const { genDocs } = require('./apis/http-version1/swagger/generateDocs');

const mapper = require('./shared/customMapper');
const delegateResponse = require('./apis/socketio-blockchain-updates/mappers/socketDelegate');

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
		spec() { return genDocs(); },
		status() { return getStatus(); },
		async ready() {
			// const services = await getReady();
			const coreMethods = { lisk_accounts: 'core.accounts', lisk_blocks: 'core.blocks' };
			const keys = Object.keys(coreMethods);
			const services = await BluebirdPromise.map(
				keys,
				async key => {
					const service = {};
					const response = await this.broker.call(coreMethods[key]);
					service[key] = !!response.data.length;
					return service;
				},
				{ concurrency: keys.length },
			);
			// isReady: returns true if any one of service is unavailable
			const isReady = services.some(value => !value);
			if (isReady === true) {
				return Promise.reject(new MoleculerError('503 Not available', 503, 'ERR_SOMETHING', { services }));
			} return Promise.resolve({ services: Object.assign({}, ...services) });
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
	events: {
		'block.change': (payload) => sendSocketIoEvent('update.block', payload),
		'round.change': (payload) => sendSocketIoEvent('update.round', payload),
		'forgers.change': (payload) => sendSocketIoEvent('update.forgers', mapper(payload, {
			data: ['data', delegateResponse],
			meta: {},
		})),
		'transactions.confirmed': (payload) => sendSocketIoEvent('update.transactions.confirmed', payload),
		'update.fee_estimates': (payload) => sendSocketIoEvent('update.fee_estimates', payload),
	},
});

broker.waitForServices('core').then(() => updateServiceStatus());

broker.start();
logger.info(`Started Gateway API on ${host}:${port}`);
