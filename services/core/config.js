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
const config = {
	endpoints: {},
	cacheDelegateAddress: {},
	log: {},
	wsEvents: [],
};

/**
 * Inter-service message broker
 */
config.transporter = process.env.SERVICE_TRANSPORTER || 'redis://localhost:6379';
config.brokerTimeout = Number(process.env.SERVICE_BROKER_TIMEOUT) || 5; // in seconds

/**
 * External endpoints
 */
config.endpoints.liskHttp = `${(process.env.LISK_CORE_HTTP || 'http://127.0.0.1:4000')}/api`;
config.endpoints.liskWs = process.env.LISK_CORE_WS || config.endpoints.liskHttp.replace('http', 'ws').replace('/api', '');
config.endpoints.redis = process.env.SERVICE_CORE_REDIS || 'redis://localhost:6379/0';
config.endpoints.postgres = process.env.SERVICE_CORE_POSTGRES || 'postgres://localhost:5432/lisk-service-core';
config.endpoints.liskStatic = process.env.LISK_STATIC || 'https://static-data.lisk.io';
config.endpoints.geoip = process.env.GEOIP_JSON || 'https://geoip.lisk.io/json';

/**
 * Caching
 */
// Time in seconds to keep the general cache
config.cacheTTL = 20;
/**
 * Cache delegate info in order to replace address by username
 * Delegate caching support (true - enabled, false - disabled)
 */
// TODO: These options seem to be unused, need to clarify
config.cacheDelegateAddress.enabled = true;
// Interval in ms for checking new delegates registration (default: 60 seconds)
config.cacheDelegateAddress.updateInterval = 60000;

config.transactionStatistics = {
	updateInterval: Number(process.env.TRANSACTION_STATS_UPDATE_INTERVAL || 10 * 60), // seconds
	historyLengthDays: Number(process.env.TRANSACTION_STATS_HISTORY_LENGTH_DAYS || 366),
};

config.ttl = {
	affectedByNewBlocks: 1000,
	stable: 60 * 60, // seconds
};

/**
 * Lisk Core socket.io events
 */
config.wsEvents = [
	'dapps/change',
	'multisignatures/change',
	'delegates/fork',
	'rounds/change',
	'signature/change',
	'transactions/change',
	'blocks/change',
	'multisignatures/signature/change',
	'multisignatures/change',
	'delegates/fork',
	'loader/sync',
];

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

module.exports = config;
