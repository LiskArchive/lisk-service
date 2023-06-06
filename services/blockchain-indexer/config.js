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
config.endpoints.liskStatic = process.env.LISK_STATIC || 'https://static-data.lisk.com';

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
	accountBalanceIndex: {
		name: 'AccountBalanceIndex',
		concurrency: 1,
	},
	accounts: {
		name: 'Accounts',
	},
	accountQueueByAddress: {
		name: 'AccountQueueByAddress',
		concurrency: 1,
	},
	accountQueueDirect: {
		name: 'AccountQueueDirect',
		concurrency: 1,
	},
	accountQueueByPublicKey: {
		name: 'AccountQueueByPublicKey',
		concurrency: 1,
	},
	blocks: {
		name: 'Blocks',
	},
	deleteIndexedBlocks: {
		name: 'DeleteIndexedBlocksQueue',
		concurrency: 1,
	},
	events: {
		name: 'Events',
	},
	indexBlocks: {
		name: 'IndexBlocksQueue',
		concurrency: 1,
	},
	updateBlockIndex: {
		name: 'UpdateBlockIndexQueue',
		concurrency: 1,
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

config.job = {
	// Interval takes priority over schedule and must be greater than 0 to be valid
	deleteSerializedEvents: {
		interval: process.env.DELETE_SERIALIZED_EVENTS_INTERVAL || 0,
		schedule: process.env.DELETE_SERIALIZED_EVENTS_SCHEDULE || '*/5 * * * *',
	},
	refreshValidators: {
		interval: process.env.REFRESH_VALIDATORS_INTERVAL || 0,
		schedule: process.env.REFRESH_VALIDATORS_SCHEDULE || '*/5 * * * *',
	},
	validateValidatorsRank: {
		interval: process.env.VALIDATE_VALIDATORS_RANK_INTERVAL || 0,
		schedule: process.env.VALIDATE_VALIDATORS_RANK_SCHEDULE || '4-59/15 * * * *',
	},
	refreshLiveIndexingJobCount: {
		interval: process.env.REFRESH_INDEX_STATUS_INTERVAL || 10,
		schedule: process.env.REFRESH_INDEX_STATUS_SCHEDULE || '',
	},
	refreshBlockchainAppsStats: {
		interval: process.env.REFRESH_BLOCKCHAIN_APPS_STATS_INTERVAL || 0,
		schedule: process.env.REFRESH_BLOCKCHAIN_APPS_STATS_SCHEDULE || '*/15 * * * *',
	},
	refreshAccountsKnowledge: {
		interval: process.env.REFRESH_BLOCKCHAIN_APPS_STATS_INTERVAL || 0,
		schedule: process.env.REFRESH_BLOCKCHAIN_APPS_STATS_SCHEDULE || '*/15 * * * *',
	},
};

module.exports = config;
