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
const BluebirdPromise = require('bluebird');

const {
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const logger = Logger();

const config = require('../../config');

const tableSchemas = {
	application_metadata: require('./schema/application_metadata'),
	token_metadata: require('./schema/token_metadata'),
};

const MYSQL_ENDPOINT = config.endpoints.mysql;

const initializeSearchIndex = async () => {
	logger.debug('Initializing all the tables.');
	await BluebirdPromise.map(
		Object.values(tableSchemas),
		async schema => {
			logger.trace(`Initializing table: ${schema.tableName}.`);
			return getTableInstance(schema, MYSQL_ENDPOINT);
		},
		{ concurrency: 1 },
	);
	logger.debug('Initialized all the tables successfully.');
};

const truncateAllTables = async () => {
	logger.info('Truncating all the tables.');
	await BluebirdPromise.map(
		Object.values(tableSchemas),
		async schema => {
			logger.trace(`Truncating table: ${schema.tableName}.`);
			const db = await getTableInstance(schema, MYSQL_ENDPOINT);
			await db.rawQuery(`TRUNCATE TABLE ${schema.tableName};`);
			logger.info(`Truncated table: ${schema.tableName}.`);
		},
		{ concurrency: 1 },
	);
	logger.debug('Truncated all the tables successfully.');
};

const initDatabase = async () => {
	if (config.isRebuildIndexAtInit) await truncateAllTables();
	await initializeSearchIndex();
};

module.exports = {
	initDatabase,
};
