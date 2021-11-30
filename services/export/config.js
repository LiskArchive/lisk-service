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

/**
 * External endpoints
 */
config.endpoints = {};
config.endpoints.redis = process.env.SERVICE_EXPORT_REDIS || 'redis://localhost:6379/3';

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

// CSV output
config.csv = {};
config.csv.delimiter = ';';
config.csv.dateFormat = 'YYYY-MM-DD';
config.csv.timeFormat = 'hh:mm:ss';

config.queue = {
	defaults: {
		jobOptions: {
			attempts: 5,
			timeout: 5 * 60 * 1000, // millisecs
			removeOnComplete: true,
		},
		settings: {},
	},
};

// CSV cache config
config.cache = {};
config.cache.partials = {
	driver: 'filesystem', // Accepted values: ['filesystem', 's3-minio']
	dirPath: process.env.SERVICE_EXPORT_PARTIALS || './data/partials',
	retentionInDays: 30,
	s3: { bucketName: process.env.EXPORT_S3_BUCKET_NAME_PARTIALS || 'partials' },
};

config.cache.exports = {
	driver: 'filesystem', // Accepted values: ['filesystem', 's3-minio']
	dirPath: process.env.SERVICE_EXPORT_STATIC || './data/static',
	retentionInDays: 30,
	s3: { bucketName: process.env.EXPORT_S3_BUCKET_NAME_EXPORTS || 'exports' },
};

// Amazon S3 config
config.s3 = {};
config.s3.endPoint = process.env.EXPORT_S3_ENDPOINT || 's3.amazonaws.com'; // Optional
config.s3.accessKey = process.env.EXPORT_S3_ACCESS_KEY;
config.s3.secretKey = process.env.EXPORT_S3_SECRET_KEY; // Optional
config.s3.sessionToken = process.env.EXPORT_S3_SESSION_TOKEN;
config.s3.region = process.env.EXPORT_S3_REGION || 'eu-central-1'; // Default: Europe (Frankfurt)
config.s3.bucketNameDefault = process.env.EXPORT_S3_BUCKET_NAME || 'export';

module.exports = config;
