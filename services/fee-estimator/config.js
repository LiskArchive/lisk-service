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
config.endpoints.cache = process.env.SERVICE_FEE_ESTIMATOR_CACHE || 'redis://localhost:6379/1';

config.feeEstimates = {
	quickAlgorithmEnabled: Boolean(String(process.env.ENABLE_FEE_ESTIMATOR_QUICK).toLowerCase() !== 'false'),
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

module.exports = config;
