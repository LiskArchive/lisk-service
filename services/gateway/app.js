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
const path = require('path');
const {
	Microservice,
	Logger,
	LoggerConfig,
	Libs,
	Exceptions: { ValidationException },
} = require('lisk-service-framework');

const SocketIOService = require('./shared/moleculer-io');

const ApiService = Libs['moleculer-web'];
const { methods } = require('./shared/moleculer-web/methods');

const config = require('./config');
const { getHttpRoutes } = require('./routes');
const { getSocketNamespaces } = require('./namespaces');
const packageJson = require('./package.json');
const { getStatus } = require('./shared/status');
const { getReady, getIndexStatus } = require('./shared/ready');
const { genDocs } = require('./shared/generateDocs');
const { setAppContext } = require('./shared/appContext');

const mapper = require('./shared/customMapper');
const { definition: blocksDefinition } = require('./sources/version3/blocks');
const { definition: feesDefinition } = require('./sources/version3/fees');
const { definition: generatorsDefinition } = require('./sources/version3/generators');
const { definition: transactionsDefinition } = require('./sources/version3/transactions');

const { host, port } = config;

const loggerConf = {
	...config.log,
	name: packageJson.name,
	version: packageJson.version,
};

LoggerConfig(loggerConf);

const logger = Logger();
const MODULE = {
	DYNAMIC_REWARD: 'dynamicReward',
	REWARD: 'reward',
};

const defaultBrokerConfig = {
	name: 'gateway',
	transporter: config.transporter,
	brokerTimeout: config.brokerTimeout, // in seconds
	logger: loggerConf,
	dependencies: config.brokerDependencies,
};

// Use temporary service to fetch registered sdk modules
const tempApp = Microservice({
	...defaultBrokerConfig,
	name: 'temp_service_gateway',
	events: {},
});

tempApp.run().then(async () => {
	// Prepare routes
	const { modules: registeredModules } = await tempApp.requestRpc('connector.getSystemMetadata');
	const registeredModuleNames = registeredModules.map(
		module => module.name === MODULE.REWARD ? MODULE.DYNAMIC_REWARD : module.name,
	);
	await tempApp.getBroker().stop();
	const httpRoutes = getHttpRoutes(registeredModuleNames);
	const socketNamespaces = getSocketNamespaces(registeredModuleNames);

	// Prepare gateway service
	const app = Microservice(defaultBrokerConfig);
	const broker = app.getBroker();

	const sendSocketIoEvent = (eventName, payload) => {
		broker.call('gateway.broadcast', {
			namespace: '/blockchain',
			event: eventName,
			args: [payload],
		});
	};

	const gatewayConfig = {
		transporter: config.transporter,
		mixins: [ApiService, SocketIOService],
		name: 'gateway',
		actions: {
			ready() { return getReady(); },
			spec(ctx) { return genDocs(ctx); },
			status() { return getStatus(this.broker); },
			isBlockchainIndexReady() { return getIndexStatus(); },
		},
		settings: {
			host,
			port,
			path: '/api',
			etag: 'strong',
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
			routes: httpRoutes,

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
				namespaces: socketNamespaces,
			},
		},
		methods,
		events: {
			'block.new': (payload) => sendSocketIoEvent('new.block', mapper(payload, blocksDefinition)),
			'transactions.new': (payload) => sendSocketIoEvent('new.transactions', mapper(payload, transactionsDefinition)),
			'block.delete': (payload) => sendSocketIoEvent('delete.block', mapper(payload, blocksDefinition)),
			'transactions.delete': (payload) => sendSocketIoEvent('delete.transactions', mapper(payload, transactionsDefinition)),
			'round.change': (payload) => sendSocketIoEvent('update.round', payload),
			'generators.change': (payload) => sendSocketIoEvent('update.generators', mapper(payload, generatorsDefinition)),
			'update.fee_estimates': (payload) => sendSocketIoEvent('update.fee_estimates', mapper(payload, feesDefinition)),
			'metadata.change': (payload) => sendSocketIoEvent('update.metadata', payload),
		},
		dependencies: [],
	};

	if (config.rateLimit.enable) {
		logger.info(`Enabling rate limiter, connLimit: ${config.rateLimit.connectionLimit}, window: ${config.rateLimit.window}`);

		gatewayConfig.settings.rateLimit = {
			window: (config.rateLimit.window || 10) * 1000,
			limit: config.rateLimit.connectionLimit || 200,
			headers: true,

			key: (req) => req.headers['x-forwarded-for']
				|| req.connection.remoteAddress
				|| req.socket.remoteAddress
				|| req.connection.socket.remoteAddress,
		};
	}

	setAppContext(app);
	app.addJobs(path.join(__dirname, 'jobs'));

	// Run the application
	app.run(gatewayConfig).then(() => {
		logger.info(`Started Gateway API on ${host}:${port}`);
	}).catch(err => {
		logger.fatal(`Could not start the service ${packageJson.name} + ${err.message}`);
		logger.fatal(err.stack);
		process.exit(1);
	});
});

