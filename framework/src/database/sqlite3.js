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

const { mkdir, exists } = require('../fs');
const Logger = require('../logger').get;

const logger = Logger();

const util = require('./util');

const connectionPool = {};
const tablePool = {};

const DB_DATA_DIR = 'data/db_cache';

const createDBConnection = async (dbDataDir, tableName) => {
	const knex = require('knex')({
		client: 'better-sqlite3',
		connection: {
			filename: `./${dbDataDir}/${tableName}_db.sqlite3`,
		},
		useNullAsDefault: true,
		pool: {
			max: 100,
			min: 2,
		},
		log: {
			warn(message) { logger.warn(message); },
			error(message) { logger.error(message); },
			deprecate(message) { logger.warn(message); },
			debug(message) { logger.debug(message); },
		},
	});

	knex.select(1)
		.on('query-error', error => {
			logger.error(error.message);
		})
		.catch(err => {
			if (err.code === 'ECONNREFUSED') {
				logger.error(err.message);
				logger.fatal('Unable to connect to the database, shutting down the process...');
				process.exit(1);
			}
			logger.error(err.message);
		});

	return knex;
};

const getDBConnection = async (tableName, dbDataDir) => {
	if (!connectionPool[tableName]) {
		if (!(await exists(dbDataDir))) {
			await mkdir(dbDataDir, { recursive: true });
		}
		connectionPool[tableName] = await createDBConnection(dbDataDir, tableName);
	}

	const knex = connectionPool[tableName];
	return knex;
};

const createTableIfNotExists = async tableConfig => {
	const { tableName } = tableConfig;

	if (!tablePool[tableName]) {
		logger.info(`Creating schema for ${tableName}`);
		const knex = await getDBConnection(tableName);
		await util.loadSchema(knex, tableName, tableConfig);
		tablePool[tableName] = true;
	}
};

const getTableInstance = async (tableConfig, dbDataDir = DB_DATA_DIR) => {
	const { tableName } = tableConfig;

	const knex = await getDBConnection(tableName, dbDataDir);

	const createDefaultTransaction = async connection => util.startDBTransaction(connection);

	await createTableIfNotExists(tableConfig);

	const dbOperations = util.getTableInstance(tableConfig, knex);

	const rawQuery = async (queryStatement, trx) => {
		let isDefaultTrx = false;
		if (!trx) {
			trx = await createDefaultTransaction(knex);
			isDefaultTrx = true;
		}

		const query = trx.raw(queryStatement);

		if (isDefaultTrx) return query
			.then(async result => {
				await trx.commit();
				return result;
			}).catch(async err => {
				await trx.rollback();
				logger.error(err.message);
				throw err;
			});

		return query;
	};

	return {
		...dbOperations,
		rawQuery,
	};
};

module.exports = {
	default: getTableInstance,
	getDBConnection,
	getTableInstance,
	startDBTransaction: util.startDBTransaction,
	commitDBTransaction: util.commitDBTransaction,
	rollbackDBTransaction: util.rollbackDBTransaction,
	createTableIfNotExists,

	// For backward compatibility
	getDbConnection: getDBConnection,
	startDbTransaction: util.startDBTransaction,
	commitDbTransaction: util.commitDBTransaction,
	rollbackDbTransaction: util.rollbackDBTransaction,
};
