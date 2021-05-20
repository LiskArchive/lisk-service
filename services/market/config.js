/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
};

// Moleculer broker config
config.transporter = process.env.SERVICE_BROKER || 'redis://localhost:6379/0';
config.brokerTimeout = Number(process.env.SERVICE_BROKER_TIMEOUT) || 5; // in seconds

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

// Api keys to access apis
config.access_key = {};
config.access_key.exchangeratesapi = process.env.EXCHANGERATESAPI_API_KEY;

// Expiry time for redis
config.ttl = {
    exchangeratesapi: 24 * 60 * 60 * 100, // miliseconds
};

/**
 * External endpoints
 */
config.endpoints.redis = process.env.SERVICE_MARKET_REDIS || 'redis://localhost:6379/2';
config.endpoints.bittrex = 'https://api.bittrex.com/v3';
config.endpoints.binance = 'https://api.binance.com/api/v3';
config.endpoints.exchangeratesapi = 'http://api.exchangeratesapi.io/v1';

module.exports = config;
