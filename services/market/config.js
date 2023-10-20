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
const packageJson = require('./package.json');

const config = {
	endpoints: {},
	market: {},
};

// Moleculer broker config
config.transporter = process.env.SERVICE_BROKER || 'redis://127.0.0.1:6379/0';
config.brokerTimeout = Number(process.env.SERVICE_BROKER_TIMEOUT) || 10; // in seconds

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

// Api keys to access apis
config.access_key = {};
config.access_key.exchangeratesapi = process.env.EXCHANGERATESAPI_IO_API_KEY;

// Expiry time for redis
config.ttl = {
	exchangeratesapi: 24 * 60 * 60 * 1000, // milliseconds,
	binance: 15 * 60 * 1000, // milliseconds
	bittrex: 15 * 60 * 1000, // milliseconds
	kraken: 15 * 60 * 1000, // milliseconds
};

/**
 * External endpoints
 */
config.endpoints.redis = process.env.SERVICE_MARKET_REDIS || 'redis://127.0.0.1:6379/6';

/**
 * Market prices config
 */
// SERVICE_MARKET_FIAT_CURRENCIES & SERVICE_MARKET_TARGET_PAIRS should be CSV-based strings
config.market.supportedFiatCurrencies =
	process.env.SERVICE_MARKET_FIAT_CURRENCIES || 'EUR,USD,CHF,GBP,RUB,PLN,JPY,AUD,GBP,INR';
config.market.targetPairs =
	process.env.SERVICE_MARKET_TARGET_PAIRS ||
	'LSK_BTC,LSK_EUR,LSK_USD,LSK_CHF,LSK_PLN,LSK_JPY,LSK_AUD,LSK_GBP,LSK_INR,BTC_EUR,BTC_USD,BTC_CHF';
config.market.sources = {
	binance: {
		apiEndpoint: 'https://api.binance.com/api/v3',
		allowRefreshAfter: 1 * 60 * 1000, // milliseconds
	},
	bittrex: {
		apiEndpoint: 'https://api.bittrex.com/v3',
		allowRefreshAfter: 1 * 60 * 1000, // milliseconds
	},
	exchangeratesapi: {
		apiEndpoint: 'http://api.exchangeratesapi.io/v1',
		allowRefreshAfter: 8 * 60 * 60 * 1000, // milliseconds
	},
	kraken: {
		apiEndpoint: 'https://api.kraken.com/0',
		allowRefreshAfter: 1 * 60 * 1000, // milliseconds
	},
};

config.job = {
	// Interval takes priority over schedule and must be greater than 0 to be valid
	refreshPricesBinance: {
		interval: process.env.JOB_INTERVAL_REFRESH_PRICES_BINANCE || 0,
		schedule: process.env.JOB_SCHEDULE_REFRESH_PRICES_BINANCE || '* * * * *',
	},
	refreshPricesBittrex: {
		interval: process.env.JOB_INTERVAL_REFRESH_PRICES_BITTREX || 0,
		schedule: process.env.JOB_SCHEDULE_REFRESH_PRICES_BITTREX || '* * * * *',
	},
	refreshPricesExchangeratesapi: {
		interval: process.env.JOB_INTERVAL_REFRESH_PRICES_EXCHANGERATESAPI || 0,
		schedule: process.env.JOB_SCHEDULE_REFRESH_PRICES_EXCHANGERATESAPI || '* * * * *',
	},
	refreshPricesKraken: {
		interval: process.env.JOB_INTERVAL_REFRESH_PRICES_KRAKEN || 0,
		schedule: process.env.JOB_SCHEDULE_REFRESH_PRICES_KRAKEN || '* * * * *',
	},
	updatePrices: {
		interval: process.env.JOB_INTERVAL_UPDATE_PRICES || 5,
		schedule: process.env.JOB_SCHEDULE_UPDATE_PRICES || '',
	},
};

module.exports = config;
