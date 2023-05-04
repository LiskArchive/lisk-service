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
const packageJson = require('./package.json');

const config = {
	endpoints: {},
	jobs: {},
	log: {
		name: packageJson.name,
		version: packageJson.version,
	},
	db: {},
};

/**
 * Inter-service message broker
 */
config.transporter = process.env.SERVICE_BROKER || 'redis://localhost:6379/0';
config.brokerTimeout = Number(process.env.SERVICE_BROKER_TIMEOUT) || 10; // in seconds

/**
 * External endpoints
 */
config.endpoints.cache = process.env.SERVICE_INDEXER_CACHE_REDIS || 'redis://localhost:6379/2';
config.endpoints.volatileRedis = process.env.SERVICE_INDEXER_REDIS_VOLATILE || 'redis://localhost:6379/3';
config.endpoints.messageQueue = process.env.SERVICE_MESSAGE_QUEUE_REDIS || 'redis://localhost:6379/4';
config.endpoints.mysql = process.env.SERVICE_INDEXER_MYSQL || 'mysql://lisk:password@localhost:3306/lisk';
config.endpoints.mainchainServiceUrl = process.env.MAINCHAIN_SERVICE_URL; // For custom deployments

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
 * Message queue options
 */
config.queue = {
	accounts: {
		name: 'Accounts',
	},
	accountBalances: {
		name: 'AccountBalances',
	},
	blocks: {
		name: 'Blocks',
	},
	events: {
		name: 'Events',
	},
	defaultJobOptions: {
		attempts: 5,
		timeout: 5 * 60 * 1000, // millisecs
		removeOnComplete: true,
	},
};

config.operations = {
	isDataRetrievalModeEnabled: Boolean(String(process.env.ENABLE_DATA_RETRIEVAL_MODE).toLowerCase() !== 'false'), // Enabled by default
	isIndexingModeEnabled: Boolean(String(process.env.ENABLE_INDEXING_MODE).toLowerCase() !== 'false'), // Enabled by default
};

config.networks = Object.freeze({
	LISK: [
		{
			name: 'mainnet',
			chainID: '00000000',
			serviceURL: 'https://service.lisk.com',
		},
		{
			name: 'testnet',
			chainID: '01000000',
			serviceURL: 'https://testnet-service.lisk.com',

		},
		{
			name: 'betanet',
			chainID: '02000000',
			serviceURL: 'https://betanet-service.lisk.com',
		},
		{
			name: 'alphanet',
			chainID: '03000000',
			serviceURL: 'https://alphanet-service.liskdev.net',
		},
		{
			name: 'devnet',
			chainID: '04000000',
			serviceURL: process.env.DEVNET_MAINCHAIN_URL || 'http://devnet-service.liskdev.net:9901',
		},
	],
});

config.db.isPersistEvents = Boolean(String(process.env.ENABLE_PERSIST_EVENTS).toLowerCase() === 'true');

module.exports = config;
