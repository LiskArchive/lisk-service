/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
	api: {},
	log: {},
};

/**
 * Gateway socket configuration
 */
config.port = process.env.PORT || 9901;
config.host = process.env.HOST || '0.0.0.0';

/**
 * Inter-service message broker
 */
config.transporter = process.env.SERVICE_BROKER || 'redis://localhost:6379/0';
config.brokerTimeout = Number(process.env.SERVICE_BROKER_TIMEOUT) || 30; // in seconds

/**
 * Compatibility
 */
config.jsonRpcStrictMode = process.env.JSON_RPC_STRICT_MODE || 'false';

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
 * API enablement
 */
config.api.http = process.env.ENABLE_HTTP_API || 'http-version1,http-version1-compat,http-status,http-version2';
config.api.ws = process.env.ENABLE_WS_API || 'rpc,rpc-v1,blockchain,rpc-v2';

/**
 * API versions
 */
config.api.versions = {
	'/api/v1': 'http-version1',
	'/api/v2': 'http-version2',
};

// Until and unless config is explicitly specified to be false, it default to true
config.includeCoreReadiness = Boolean(String(process.env.STRICT_READINESS_CHECK).toLowerCase() !== 'false');
module.exports = config;
