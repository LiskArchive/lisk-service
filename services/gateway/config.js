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
const packageJson = require('./package.json');

const config = {
	api: {},
	log: {
		name: packageJson.name,
		version: packageJson.version,
	},
};

/**
 * Gateway socket configuration
 */
config.port = process.env.PORT || 9901;
config.host = process.env.HOST || '0.0.0.0';

/**
 * Inter-service message broker
 */
config.transporter = process.env.SERVICE_BROKER || 'redis://localhost:6379/0';
config.brokerTimeout = Number(process.env.SERVICE_BROKER_TIMEOUT) || 10; // in seconds
config.volatileRedis = process.env.SERVICE_GATEWAY_REDIS_VOLATILE || 'redis://localhost:6379/5';

/**
 * Compatibility
 */
config.jsonRpcStrictMode = process.env.JSON_RPC_STRICT_MODE || 'false';

config.rateLimit = {};
config.rateLimit.enable = Boolean(String(process.env.HTTP_RATE_LIMIT_ENABLE).toLowerCase() === 'true');
config.rateLimit.window = Number(process.env.HTTP_RATE_LIMIT_WINDOW) || 10; // in seconds
// Max number of requests during window
config.rateLimit.connectionLimit = Number(process.env.HTTP_RATE_LIMIT_CONNECTIONS || 200);

/**
 * LOGGING
 *
 * log.level   - TRACE < DEBUG < INFO < WARN < ERROR < FATAL < MARK
 * log.console - Plain JavaScript console.log() output (true/false)
 * log.stdout  - Writes directly to stdout (true/false)
 * log.file    - outputs to a file (ie. ./logs/app.log)
 * log.gelf    - Writes to GELF-compatible socket (ie. localhost:12201/udp)
 */
config.log.level = process.env.SERVICE_LOG_LEVEL || 'info';
config.log.console = process.env.SERVICE_LOG_CONSOLE || 'false';
config.log.stdout = process.env.SERVICE_LOG_STDOUT || 'true';
config.log.gelf = process.env.SERVICE_LOG_GELF || 'false';
config.log.file = process.env.SERVICE_LOG_FILE || 'false';
config.log.docker_host = process.env.DOCKER_HOST || 'local';
config.debug = process.env.SERVICE_LOG_LEVEL === 'debug';

/**
 * API enablement
 */
config.api.http = process.env.ENABLE_HTTP_API || 'http-status,http-version3,http-exports';
config.api.ws = process.env.ENABLE_WS_API || 'blockchain,rpc-v3';

/**
 * API versions
 */
config.api.versions = {
	'/api/v3': ['http-version3', 'http-exports'],
};

/**
 * HTTP API response caching support
 */
config.api.httpCacheControlDirectives = String(process.env.HTTP_CACHE_CONTROL_DIRECTIVES || 'public, max-age=10');
config.api.enableHttpCacheControl = Boolean(String(process.env.ENABLE_HTTP_CACHE_CONTROL).toLowerCase() === 'true');

// configuration for websocket rate limit
config.websocket = {
	enableRateLimit: Boolean(String(process.env.WS_RATE_LIMIT_ENABLE).toLowerCase() === 'true'),
	rateLimit: {
		points: Number(process.env.WS_RATE_LIMIT_CONNECTIONS || 5),
		duration: Number(process.env.WS_RATE_LIMIT_DURATION || 1), // in seconds
	},
};

// Gateway RPC cache settings
config.rpcCache = {
	ttl: 5, // in seconds
	enable: Boolean(String(process.env.ENABLE_REQUEST_CACHING).toLowerCase() !== 'false'),
};

const DEFAULT_DEPENDENCIES = 'indexer,connector';
const { GATEWAY_DEPENDENCIES } = process.env;

config.brokerDependencies = DEFAULT_DEPENDENCIES.concat(',', GATEWAY_DEPENDENCIES || '').split(',');

config.job = {
	// Interval takes priority over schedule and must be greater than 0 to be valid
	updateReadinessStatus: {
		interval: process.env.UPDATE_READINESS_STATUS_INTERVAL || 0,
		schedule: process.env.UPDATE_READINESS_STATUS_SCHEDULE || '* * * * *',
	},
};

config.cors = {
	allowedOrigin: process.env.CORS_ALLOWED_ORIGIN ? process.env.CORS_ALLOWED_ORIGIN.split(',') : '*',
};

module.exports = config;
