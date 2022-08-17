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
const config = {};

// Moleculer broker config
config.transporter = process.env.SERVICE_BROKER || 'redis://localhost:6379/0';
config.brokerTimeout = Number(process.env.SERVICE_BROKER_TIMEOUT) || 5; // in seconds

/**
 * External endpoints
 */
config.endpoints = {};
config.endpoints.mysql = process.env.SERVICE_APP_REGISTRY_MYSQL || 'mysql://lisk:password@localhost:3306/lisk';

// Logging
config.log = {};
/**
 * log.level - Limits the importance of log messages for console and stdout outputs
 *             One fo the following in that order:
 *               TRACE < DEBUG < INFO < WARN < ERROR < FATAL < MARK
 */
config.log.level = process.env.SERVICE_LOG_LEVEL || 'info';

/*
 * True / False outputs
 * log.console - Plain JavaScript console.log() output
 * log.stdout  - Writes directly to stdout
 */
config.log.console = process.env.SERVICE_LOG_CONSOLE || 'false';
config.log.stdout = process.env.SERVICE_LOG_STDOUT || 'true';

/*
 * Configurable outputs
 * log.file   - outputs to a file (ie. ./logs/app.log)
 * log.gelf   - Writes to GELF-compatible socket (ie. localhost:12201/udp)
 */
config.log.gelf = process.env.SERVICE_LOG_GELF || 'false';
config.log.file = process.env.SERVICE_LOG_FILE || 'false';

// Set docker host if running inside the container
config.log.docker_host = process.env.DOCKER_HOST || 'local';

//  Truncate tables at init, default to false
config.isRebuildIndexAtInit = Boolean(String(process.env.ENABLE_REBUILD_INDEX_AT_INIT).toLowerCase() === 'true');

config.gitHub = {
	accessToken: process.env.GITHUB_ACCESS_TOKEN,
	appRegistryRepo: process.env.GITHUB_APP_REGISTRY_REPO || 'https://github.com/LiskHQ/app-registry',
	branch: process.env.GITHUB_APP_REGISTRY_REPO_BRANCH || 'main',
};

config.serviceURL = {
	mainnet: process.env.SERVICE_URL_MAINNET || 'https://service.lisk.com',
	testnet: process.env.SERVICE_URL_TESTNET || 'https://testnet-service.lisk.com',
	betanet: process.env.SERVICE_URL_BETANET || 'https://betanet-service.lisk.com',
};

config.supportedNetworks = ['mainnet', 'testnet', 'betanet'];

const DEFAULT_LISK_APPS = ['Lisk', 'Lisk DEX'];
const DEFAULT_USER_APPS = String(process.env.DEFAULT_APPS).split(',');

config.defaultApps = DEFAULT_LISK_APPS.concat(DEFAULT_USER_APPS);

module.exports = config;
