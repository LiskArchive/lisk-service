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
	jobs: {},
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
config.endpoints.liskHttp = `${(process.env.LISK_APP_HTTP || 'http://127.0.0.1:8080')}/api`;
config.endpoints.liskWs = process.env.LISK_APP_WS || config.endpoints.liskHttp.replace('http', 'ws').replace('/api', '');
config.endpoints.geoip = process.env.GEOIP_JSON || 'https://geoip.lisk.com/json';

/**
 * API Client related settings
 */
config.isUseLiskIPCClient = Boolean(String(process.env.USE_LISK_IPC_CLIENT).toLowerCase() === 'true');
config.liskAppDataPath = process.env.LISK_APP_DATA_PATH || '~/.lisk/lisk-core';

/**
  * Network-related settings
  */
config.genesisBlockUrl = process.env.GENESIS_BLOCK_URL || '';
config.networks = [
	{
		name: 'mainnet',
		identifier: '4c09e6a781fc4c7bdb936ee815de8f94190f8a7519becd9de2081832be309a99',
		genesisBlockUrl: 'https://downloads.lisk.com/lisk/mainnet/genesis_block.json.tar.gz',
	},
	{
		name: 'testnet',
		identifier: '15f0dacc1060e91818224a94286b13aa04279c640bd5d6f193182031d133df7c',
		genesisBlockUrl: 'https://downloads.lisk.com/lisk/testnet/genesis_block.json.tar.gz',
	},
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

config.enableTestingMode = Boolean(String(process.env.ENABLE_TESTING_MODE).toLowerCase() === 'true');

module.exports = config;
