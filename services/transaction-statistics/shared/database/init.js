/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
const path = require('path');

const {
	Logger,
	MySQL: {
		getTableInstance,
		KVStore: { configureKeyValueTable, getKeyValueTable },
	},
	Utils,
} = require('lisk-service-framework');

const logger = Logger();

const config = require('../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const tableSchemas = Object.values(Utils.requireAllJs(path.join(__dirname, './schemas')));

const initializeSearchIndex = async () => {
	await getKeyValueTable();

	logger.debug('Initializing all the tables.');
	await BluebirdPromise.map(
		tableSchemas,
		async schema => {
			logger.trace(`Initializing table: ${schema.tableName}.`);
			return getTableInstance(schema, MYSQL_ENDPOINT);
		},
		{ concurrency: 1 },
	);
	logger.debug('Initialized all the tables successfully.');
};

const initDatabase = async () => {
	configureKeyValueTable(MYSQL_ENDPOINT);
	await initializeSearchIndex();
};

module.exports = {
	initDatabase,
};
