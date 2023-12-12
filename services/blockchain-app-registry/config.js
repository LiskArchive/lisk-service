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

const config = {};

// Moleculer broker config
config.transporter = process.env.SERVICE_BROKER || 'redis://lisk:password@127.0.0.1:6379/0';
config.brokerTimeout = Number(process.env.SERVICE_BROKER_TIMEOUT) || 5; // in seconds

/**
 * External endpoints
 */
config.endpoints = {};
config.endpoints.mysql =
	process.env.SERVICE_APP_REGISTRY_MYSQL || 'mysql://lisk:password@127.0.0.1:3306/lisk';

// Logging
config.log = {
	name: packageJson.name,
	version: packageJson.version,
};

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
 * log.gelf   - Writes to GELF-compatible socket (ie. 127.0.0.1:12201/udp)
 */
config.log.gelf = process.env.SERVICE_LOG_GELF || 'false';
config.log.file = process.env.SERVICE_LOG_FILE || 'false';

// Set docker host if running inside the container
config.log.docker_host = process.env.DOCKER_HOST || 'local';

// Truncate tables at init, default to false
config.isRebuildIndexAtInit = Boolean(
	String(process.env.ENABLE_REBUILD_INDEX_AT_INIT).toLowerCase() === 'true',
);

config.gitHub = {
	accessToken: process.env.GITHUB_ACCESS_TOKEN,
	appRegistryRepo: process.env.GITHUB_APP_REGISTRY_REPO || 'https://github.com/LiskHQ/app-registry',
	branch: process.env.GITHUB_APP_REGISTRY_REPO_BRANCH || 'main',
	get appRegistryRepoName() {
		return this.appRegistryRepo.split('/').pop();
	},
};

config.dataDir = `${__dirname}/data`;

config.supportedNetworks = ['mainnet', 'testnet', 'devnet'];

const DEFAULT_LISK_APPS = ['lisk_mainchain'];
const DEFAULT_USER_APPS = String(process.env.DEFAULT_APPS).split(',');

config.defaultApps = DEFAULT_LISK_APPS.concat(DEFAULT_USER_APPS);

config.FILENAME = Object.freeze({
	APP_JSON: 'app.json',
	NATIVETOKENS_JSON: 'nativetokens.json',
});

config.ALLOWED_FILES = Object.values(config.FILENAME);
config.ALLOWED_FILE_EXTENSIONS = ['.png', '.svg'];

config.CHAIN_ID_PREFIX_NETWORK_MAP = Object.freeze({
	'00': 'mainnet',
	'01': 'testnet',
	'04': 'devnet',
});

config.job = {
	// Interval takes priority over schedule and must be greater than 0 to be valid
	deleteNonMetadataFiles: {
		interval: Number(process.env.JOB_INTERVAL_DELETE_NON_METADATA_FILES) || 0,
		schedule: process.env.JOB_SCHEDULE_DELETE_NON_METADATA_FILES || '0 0 * * *',
	},
	updateApplicationMetadata: {
		interval: Number(process.env.JOB_INTERVAL_UPDATE_METADATA) || 0,
		schedule: process.env.JOB_SCHEDULE_UPDATE_METADATA || '*/10 * * * *',
	},
};

module.exports = config;
