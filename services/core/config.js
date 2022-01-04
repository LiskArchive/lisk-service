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
	log: {},
};

/**
 * Inter-service message broker
 */
config.transporter = process.env.SERVICE_BROKER || 'redis://localhost:6379/0';
config.brokerTimeout = Number(process.env.SERVICE_BROKER_TIMEOUT) || 10; // in seconds
config.httpTimeout = Number(process.env.LISK_CORE_CLIENT_TIMEOUT) || 30; // in seconds

/**
 * External endpoints
 */
config.endpoints.liskHttp = `${(process.env.LISK_CORE_HTTP || 'http://127.0.0.1:8080')}/api`;
config.endpoints.liskWs = process.env.LISK_CORE_WS || config.endpoints.liskHttp.replace('http', 'ws').replace('/api', '');
config.endpoints.redis = process.env.SERVICE_CORE_REDIS || 'redis://localhost:6379/1';
config.endpoints.volatileRedis = process.env.SERVICE_CORE_REDIS_VOLATILE || 'redis://localhost:6379/2';
config.endpoints.liskStatic = process.env.LISK_STATIC || 'https://static-data.lisk.com';
config.endpoints.geoip = process.env.GEOIP_JSON || 'https://geoip.lisk.com/json';
config.endpoints.mysql = process.env.SERVICE_CORE_MYSQL || 'mysql://lisk:password@localhost:3306/lisk';

/**
 * Network-related settings
 */
config.genesisBlockUrl = process.env.GENESIS_BLOCK_URL || '';

config.networks = [
	{
		name: 'mainnet',
		identifier: '4c09e6a781fc4c7bdb936ee815de8f94190f8a7519becd9de2081832be309a99',
		genesisBlockUrl: 'https://downloads.lisk.com/lisk/mainnet/genesis_block.json.tar.gz',
		snapshotUrl: 'https://snapshots.lisk.io/mainnet/service-core-snapshot.sql.gz',

	},
	{
		name: 'testnet',
		identifier: '15f0dacc1060e91818224a94286b13aa04279c640bd5d6f193182031d133df7c',
		genesisBlockUrl: 'https://downloads.lisk.com/lisk/testnet/genesis_block.json.tar.gz',
		snapshotUrl: 'https://snapshots.lisk.io/testnet/service-core-snapshot.sql.gz',
	},
];

/**
 * Indexing
 *
 * Important: The number of blocks makes the process responsible of creating
 * and maintaining search index of the given number of blocks behind the current height.
 *
 * indexNumOfBlocks = 0 means that index will consist of all blocks.
 *
 * The block index may trigger indexing of other entities that are part of the block
 * such as transactions, accounts, votes etc.
 */
config.indexNumOfBlocks = Number(process.env.INDEX_N_BLOCKS || 202);

config.transactionStatistics = {
	enabled: Boolean(String(process.env.ENABLE_TRANSACTION_STATS).toLowerCase() === 'true'),
	historyLengthDays: Number(process.env.TRANSACTION_STATS_HISTORY_LENGTH_DAYS || 5),
};

config.ttl = {
	affectedByNewBlocks: 1000,
};

config.feeEstimates = {
	quickAlgorithmEnabled: Boolean(String(process.env.ENABLE_FEE_ESTIMATOR_QUICK).toLowerCase() === 'true'),
	fullAlgorithmEnabled: Boolean(String(process.env.ENABLE_FEE_ESTIMATOR_FULL).toLowerCase() === 'true'),
	coldStartBatchSize: Number(process.env.FEE_EST_COLD_START_BATCH_SIZE || 1),
	defaultStartBlockHeight: Number(process.env.FEE_EST_DEFAULT_START_BLOCK_HEIGHT || 1),
	medEstLowerPercentile: 25,
	medEstUpperPercentile: 75,
	highEstLowerPercentile: 80,
	highEstUpperPercentile: 100,
	emaBatchSize: Number(process.env.FEE_EST_EMA_BATCH_SIZE || 20),
	emaDecayRate: Number(process.env.FEE_EST_EMA_DECAY_RATE || 0.5),
	wavgDecayPercentage: Number(process.env.FEE_EST_WAVG_DECAY_PERCENTAGE || 10),
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
	defaults: {
		defaultJobOptions: {
			attempts: 5,
			timeout: 5 * 60 * 1000, // millisecs
			removeOnComplete: true,
		},
		settings: {},
		// limiter: {},
	},
	transactionStatisticsQueue: {
		defaultJobOptions: {
			attempts: 5,
			timeout: 5 * 60 * 1000, // millisecs
			removeOnComplete: true,
		},
		settings: {},
		// limiter: {},
	},
};

/**
 * Lisk Core jobs configs
 */
config.jobs = {};

config.snapshot = {
	url: process.env.INDEX_SNAPSHOT_URL,
	enable: Boolean(String(process.env.ENABLE_APPLY_SNAPSHOT).toLowerCase() !== 'false'), // Enable by default
};

module.exports = config;
