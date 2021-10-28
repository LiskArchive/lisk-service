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
const getDrupalConfig = require('./config_drupal');
const getTwitterConfig = require('./config_twitter');

const config = {};

/**
 * CONFIGURATION
 */

/**
 * Inter-service message broker
 */
config.transporter = process.env.SERVICE_BROKER || 'redis://localhost:6379/0';
config.brokerTimeout = Number(process.env.SERVICE_BROKER_TIMEOUT) || 30 * 1000; // in seconds

/**
 * External endpoints
 */
config.endpoints = {};
config.endpoints.mysql = process.env.SERVICE_NEWSFEED_MYSQL || 'mysql://lisk:password@localhost:3306/lisk?charset=utf8mb4';

config.defaultNewsLength = 600;

const defaultSources = 'drupal_lisk_general,drupal_lisk_announcements,twitter_lisk';
config.sources_enable = process.env.SERVICE_NEWSFEED_ENABLE_SOURCES || defaultSources;
config.sources = {
	drupal_lisk_general: getDrupalConfig({
		name: 'drupal_lisk_general',
		url: 'https://lisk.com/api/blog',
		// TODO: Move filters to jobs
		filter: item => item.category !== 'Announcement' && item.description !== '',
		restrictLength: config.defaultNewsLength,
	}),
	drupal_lisk_announcements: getDrupalConfig({
		name: 'drupal_lisk_announcements',
		url: 'https://lisk.com/api/blog/43',
		// TODO: Move filters to jobs
		filter: item => item.description !== '',
		restrictLength: config.defaultNewsLength,
	}),
	twitter_lisk: getTwitterConfig(),
};

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

module.exports = config;
