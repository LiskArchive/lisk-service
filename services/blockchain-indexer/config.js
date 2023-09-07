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
config.transporter = process.env.SERVICE_BROKER || 'redis://127.0.0.1:6379/0';
config.brokerTimeout = Number(process.env.SERVICE_BROKER_TIMEOUT) || 10; // in seconds

/**
 * External endpoints
 */
config.endpoints.cache = process.env.SERVICE_INDEXER_CACHE_REDIS || 'redis://127.0.0.1:6379/2';
config.endpoints.volatileRedis = process.env.SERVICE_INDEXER_REDIS_VOLATILE || 'redis://127.0.0.1:6379/3';
config.endpoints.messageQueue = process.env.SERVICE_MESSAGE_QUEUE_REDIS || 'redis://127.0.0.1:6379/4';
// Primary database. Used for both read-write operations.
config.endpoints.mysql = process.env.SERVICE_INDEXER_MYSQL || 'mysql://lisk:password@127.0.0.1:3306/lisk';
// DB replicas against the primary. Used for read-only operations.
config.endpoints.mysqlReplica = process.env.SERVICE_INDEXER_MYSQL_READ_REPLICA
	|| config.endpoints.mysql;
config.endpoints.mainchainServiceUrl = process.env.MAINCHAIN_SERVICE_URL; // For custom deployments
config.endpoints.liskStatic = process.env.LISK_STATIC || 'https://static-data.lisk.com';

/**
 * LOGGING
 *
 * log.level   - TRACE < DEBUG < INFO < WARN < ERROR < FATAL < MARK
 * log.console - Plain JavaScript console.log() output (true/false)
 * log.stdout  - Writes directly to stdout (true/false)
 * log.file    - outputs to a file (ie. ./logs/app.log)
 * log.gelf    - Writes to GELF-compatible socket (ie. 127.0.0.1:12201/udp)
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
	defaultJobOptions: {
		attempts: 5,
		timeout: 5 * 60 * 1000, // millisecs
		removeOnComplete: true,
	},

	// Inter-microservice message queues
	account: { name: 'Account' },
	block: { name: 'Block' },
	event: { name: 'Event' },

	// Intra-microservice job queues
	accountBalanceIndex: {
		name: 'AccountBalanceIndex',
		concurrency: 1,
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
	deleteIndexedBlocks: {
		name: 'DeleteIndexedBlocks',
		concurrency: 1,
	},
	indexBlocks: {
		name: 'IndexBlocks',
		concurrency: 1,
	},
	indexAccountPublicKey: {
		name: 'PendingAccountPublicKeyUpdates',
		concurrency: 64,
	},
	indexAccountAddress: {
		name: 'PendingAccountAddressUpdates',
		concurrency: 64,
	},
	updateBlockIndex: {
		name: 'UpdateBlockIndexQueue',
		concurrency: 1,
	},
};

config.operations = {
	isDataRetrievalModeEnabled: Boolean(
		String(process.env.ENABLE_DATA_RETRIEVAL_MODE).toLowerCase() !== 'false',
	), // Enabled by default
	isIndexingModeEnabled: Boolean(
		String(process.env.ENABLE_INDEXING_MODE).toLowerCase() !== 'false',
	), // Enabled by default
};

config.networks = Object.freeze({
	LISK: [
		{
			name: 'mainnet',
			chainID: '00000000',
			serviceURL: 'https://service.lisk.com',
			snapshotURL: 'https://snapshots.lisk.com/mainnet/service.sql.gz',
		},
		{
			name: 'testnet',
			chainID: '01000000',
			serviceURL: 'https://testnet-service.lisk.com',
			snapshotURL: 'https://snapshots.lisk.com/testnet/service.sql.gz',
		},
		{
			name: 'betanet',
			chainID: '02000000',
			serviceURL: 'https://betanet-service.lisk.com',
			snapshotURL: 'https://snapshots.lisk.com/betanet/service.sql.gz',
		},
		{
			name: 'devnet',
			chainID: '04000000',
			serviceURL: process.env.DEVNET_MAINCHAIN_URL || 'http://devnet-service.liskdev.net:9901',
		},
	],
});

config.db.isPersistEvents = Boolean(
	String(process.env.ENABLE_PERSIST_EVENTS).toLowerCase() === 'true',
);

config.snapshot = {
	enable: Boolean(String(process.env.ENABLE_APPLY_SNAPSHOT).toLowerCase() === 'true'), // Disabled by default
	url: process.env.INDEX_SNAPSHOT_URL,
	allowInsecureHttp: Boolean(
		String(process.env.ENABLE_SNAPSHOT_ALLOW_INSECURE_HTTP).toLowerCase() === 'true',
	), // Disabled by default
};

config.job = {
	// Interval takes priority over schedule and must be greater than 0 to be valid
	deleteSerializedEvents: {
		interval: process.env.JOB_INTERVAL_DELETE_SERIALIZED_EVENTS || 0,
		schedule: process.env.JOB_SCHEDULE_DELETE_SERIALIZED_EVENTS || '*/5 * * * *',
	},
	refreshValidators: {
		interval: process.env.JOB_INTERVAL_REFRESH_VALIDATORS || 0,
		schedule: process.env.JOB_SCHEDULE_REFRESH_VALIDATORS || '*/5 * * * *',
	},
	validateValidatorsRank: {
		interval: process.env.JOB_INTERVAL_VALIDATE_VALIDATORS_RANK || 0,
		schedule: process.env.JOB_SCHEDULE_VALIDATE_VALIDATORS_RANK || '4-59/15 * * * *',
	},
	refreshLiveIndexingJobCount: {
		interval: process.env.JOB_INTERVAL_REFRESH_INDEX_STATUS || 10,
		schedule: process.env.JOB_SCHEDULE_REFRESH_INDEX_STATUS || '',
	},
	refreshBlockchainAppsStats: {
		interval: process.env.JOB_INTERVAL_REFRESH_BLOCKCHAIN_APPS_STATS || 0,
		schedule: process.env.JOB_SCHEDULE_REFRESH_BLOCKCHAIN_APPS_STATS || '*/15 * * * *',
	},
	refreshAccountsKnowledge: {
		interval: process.env.JOB_INTERVAL_REFRESH_ACCOUNT_KNOWLEDGE || 0,
		schedule: process.env.JOB_SCHEDULE_REFRESH_ACCOUNT_KNOWLEDGE || '*/15 * * * *',
	},
	deleteFinalizedCCUMetadata: {
		interval: process.env.JOB_INTERVAL_DELETE_FINALIZED_CCU_METADATA || 0,
		schedule: process.env.JOB_SCHEDULE_DELETE_FINALIZED_CCU_METADATA || '0 2 * * *',
	},
	triggerAccountUpdates: {
		interval: process.env.JOB_INTERVAL_TRIGGER_ACCOUNT_UPDATES || 0,
		schedule: process.env.JOB_SCHEDULE_TRIGGER_ACCOUNT_UPDATES || '*/15 * * * *',
	},
};

config.estimateFees = {
	bufferBytesLength: process.env.ESTIMATES_BUFFER_BYTES_LENGTH || 0,
};

module.exports = config;
