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
	constants: {},
};

/**
 * Inter-service message broker
 */
config.transporter = process.env.SERVICE_BROKER || 'redis://localhost:6379/0';
config.brokerTimeout = Number(process.env.SERVICE_BROKER_TIMEOUT) || 10; // in seconds

/**
 * External endpoints
 */
config.endpoints.liskHttp = `${(process.env.LISK_APP_HTTP || 'http://127.0.0.1:7887')}/api`;
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
config.constants.GENESIS_BLOCK_URL_DEFAULT = '';
config.genesisBlockUrl = process.env.GENESIS_BLOCK_URL
	|| config.constants.GENESIS_BLOCK_URL_DEFAULT;
config.genesisHeight = Number(process.env.GENESIS_HEIGHT || 0);
config.networks = {
	LISK: [
		{
			name: 'mainnet',
			chainID: '00000000',
			genesisBlockUrl: 'https://downloads.lisk.com/lisk/mainnet/genesis_block.json.tar.gz',
		},
		{
			name: 'testnet',
			chainID: '01000000',
			genesisBlockUrl: 'https://downloads.lisk.com/lisk/testnet/genesis_block.json.tar.gz',
		},
		{
			name: 'betanet',
			chainID: '02000000',
			genesisBlockUrl: 'https://downloads.lisk.com/lisk/betanet/genesis_block.json.tar.gz',
		},
	],
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

config.enableTestingMode = Boolean(String(process.env.ENABLE_TESTING_MODE).toLowerCase() === 'true');

module.exports = config;
