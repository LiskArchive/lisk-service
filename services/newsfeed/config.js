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
const config = {};

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


// *************************************************************************************************
// *************************************************************************************************
const sources = require('./config.sources');

/**
 * CONFIGURATION
 */
config.endpoints = {};
config.endpoints.postgres = process.env.SERVICE_MARKET_POSTGRES || 'postgres://localhost:5432/market';
config.endpoints.mysql = process.env.SERVICE_NEWSFEED_MYSQL || 'mysql://lisk:password@localhost:3306/lisk?charset=utf8mb4';
config.sources = sources;

// Request-based APIs
config.apis = {
	http_rest: {
		description: 'HTTP',
		enabled: true,
		apiPath: '/api',
	},
	socket_io_rpc: {
		description: 'Socket.io API',
		enabled: true,
		apiPath: '/rpc',
	},
};

config.newsContentLength = 600;

config.postgresTables = {
	newsfeed: {
		query: {
			createTable: `CREATE TABLE newsfeed (
				id serial PRIMARY KEY,
				source VARCHAR (40) NOT NULL,
				source_id VARCHAR (40),
				hash VARCHAR (40) NOT NULL,
				title VARCHAR (255) NOT NULL,
				content text NULL DEFAULT NULL,
				url VARCHAR (2083) NOT NULL,
				image_url VARCHAR (2083),
				timestamp TIMESTAMP NOT NULL,
				author VARCHAR (100),
				UNIQUE(hash, source)
			)`,
		},
	},
	news_content: {
		query: {
			createTable: `CREATE TABLE news_content (
				id serial PRIMARY KEY,
				hash VARCHAR (40) NOT NULL,
				content_short text NULL DEFAULT NULL
			)`,
		},
	},
};

// Logging
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

config.moleculer = {
	transporter: process.env.SERVICE_NATS || 'nats://localhost:4222',
	requestTimeout: 5 * 1000,
};

module.exports = config;
