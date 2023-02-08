/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
	log: {},
};

/**
 * Inter-service message broker
 */
config.transporter = process.env.SERVICE_BROKER || 'redis://localhost:6379/0';
config.brokerTimeout = Number(process.env.SERVICE_BROKER_TIMEOUT) || 10; // in seconds

/**
 * External endpoints
 */
config.endpoints.redis = process.env.SERVICE_STATISTICS_REDIS || 'redis://localhost:6379/2';
config.endpoints.mysql = process.env.SERVICE_STATISTICS_MYSQL || 'mysql://lisk:password@localhost:3306/lisk';

config.transactionStatistics = {
	historyLengthDays: Number(process.env.TRANSACTION_STATS_HISTORY_LENGTH_DAYS || 366),
};

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

config.queue = {
	default: {
		defaultJobOptions: {
			attempts: 5,
			timeout: 5 * 60 * 1000, // millisecs
			removeOnComplete: true,
		},
	},
};

config.networks = [
	{
		networkName: 'mainnet',
		chainID: '00000000',
		serviceUrl: 'https://service.lisk.com',
	},
	{
		networkName: 'testnet',
		chainID: '01000000',
		serviceUrl: 'https://testnet-service.lisk.com',

	},
	{
		networkName: 'betanet',
		chainID: '02000000',
		serviceUrl: 'https://betanet-service.lisk.com',
	},
];

module.exports = config;
