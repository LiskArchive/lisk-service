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
const { Logger } = require('lisk-service-framework');
const config = require('../../config');

const logger = Logger();

const connectionPool = {};
const tablePool = {};

const loadSchema = async (knex, tableName, tableConfig) => {
	const { primaryKey, schema, indexes } = tableConfig;

	if (await knex.schema.hasTable(tableName)) return knex;

	await knex.schema
		.createTable(tableName, table => {
			Object.keys(schema).map(p => {
				const kProp = (table[schema[p].type])(p);
				if (schema[p].null === false) kProp.notNullable();
				if (p === primaryKey) kProp.primary();
				if (indexes[p]) kProp.index();

				// TODO: Add support for composite primary keys and foreign keys
				return kProp;
			});
		});

	return knex;
};

const createDbConnection = async (connEndpoint) => {
	const knex = require('knex')({
		client: 'mysql',
		version: '5.7',
		connection: connEndpoint,
		useNullAsDefault: true,
		log: {
			warn(message) { logger.warn(message); },
			error(message) { logger.error(message); },
			deprecate(message) { logger.deprecate(message); },
			debug(message) { logger.debug(message); },
		},
	});

	knex.select(1)
		.on('query-error', (error) => {
			logger.error(error);
		})
		.catch((err) => {
			if (err.code === 'ECONNREFUSED') {
				logger.error(err.message);
				logger.error('Database error, shutting down the process');
				process.exit(1);
			}
			logger.error(err);
		});

	return knex;
};

const cast = (val, type) => {
	if (type === 'number') return Number(val);
	if (type === 'integer') return Number(val);
	if (type === 'string') return String(val);
	if (type === 'boolean') return Boolean(val);
	if (type === 'bigInteger') return BigInt(val);
	return val;
};

const resolveQueryParams = (params) => {
	const queryParams = Object.keys(params)
		.filter(key => !['sort', 'limit', 'propBetweens', 'orWhere', 'offset']
			.includes(key))
		.reduce((obj, key) => {
			obj[key] = params[key];
			return obj;
		}, {});
	return queryParams;
};

const getValue = (val) => {
	if (typeof val === 'undefined') return null;
	if (Number.isNaN(val)) return null;
	return val;
};

const getDbInstance = async (tableName, tableConfig, connEndpoint = config.endpoints.mysql) => {
	const userName = connEndpoint.split('//')[1].split('@')[0].split(':')[0];
	const [hostPort, dbName] = connEndpoint.split('@')[1].split('/');
	const connPoolKey = `${userName}@${hostPort}/${dbName}`;
	const connPoolKeyTable = `${connPoolKey}/${tableName}`;

	if (!connectionPool[connPoolKey]) {
		connectionPool[connPoolKey] = await createDbConnection(connEndpoint);
	}

	const knex = connectionPool[connPoolKey];

	if (!tablePool[connPoolKeyTable]) {
		await loadSchema(knex, tableName, tableConfig);
		tablePool[connPoolKeyTable] = true;
	}

	const { primaryKey, schema } = tableConfig;

	const upsert = async (inputRows) => {
		let rawRows = inputRows;
		if (!Array.isArray(rawRows)) rawRows = [inputRows];

		const rows = [];
		rawRows.forEach(item => {
			const row = {};
			Object.keys(schema).forEach(o => {
				row[o] = getValue(cast(item[o], schema[o].type));
			});
			rows.push(row);
		});

		try {
			const chunkSize = 1000;
			const ids = await knex.batchInsert(tableName, rows, chunkSize);
			logger.debug(`${rows.length} row(s) inserted/updated in '${tableName}' table`);
			return ids;
		} catch (error) {
			const errCode = error.code;
			const errMessage = error.message.split(`${errCode}: `)[1] || error.message;
			const errCause = errMessage.split(': ')[0];
			logger.debug('Encountered error with batch insert:', errCause,
				'\nRe-attempting to update/merge the conflicted transactions one at a time: ');

			return knex.transaction(async trx => {
				// TODO: Consider replacing promise all to Bluebird
				const inserts = await Promise.all(rows.map(row => trx(tableName).insert(row).onConflict('id').merge()
					.transacting(trx)));
				logger.debug(`${rows.length} row(s) inserted/updated in '${tableName}' table`);
				return inserts;
			});
		}
	};

	const queryBuilder = (params, columns) => {
		const limit = Number(params.limit) || 10;
		const offset = Number(params.offset) || 0;
		const query = knex.select(columns).table(tableName);
		const queryParams = resolveQueryParams(params);

		if (params.orWhere) {
			const { orWhere } = params;
			query.where(function () {
				this.where(queryParams).orWhere(orWhere);
			});
		} else {
			query.where(queryParams);
		}

		if (params.propBetweens) {
			const { propBetweens } = params;
			propBetweens.forEach(propBetween => query.whereBetween(propBetween.property, [propBetween.from, propBetween.to]));
		}

		if (params.sort) {
			const [sortProp, sortOrder] = params.sort.split(':');
			query.orderBy(sortProp, sortOrder);
		}

		return query
			.limit(limit)
			.offset(offset);
	};

	const find = (params, columns) => new Promise((resolve, reject) => {
		queryBuilder(params, columns).then(response => {
			resolve(response);
		}).catch(err => {
			logger.error(err.message);
			reject(err);
		});
	});

	const deleteIds = async ids => knex(tableName)
		.whereIn(primaryKey, ids)
		.del();

	const count = async (params) => {
		const query = knex.count('id as count').table(tableName);
		const queryParams = resolveQueryParams(params);

		if (params.orWhere) {
			const { orWhere } = params;
			query.where(function () {
				this.where(queryParams).orWhere(orWhere);
			});
		} else {
			query.where(queryParams);
		}

		if (params.propBetweens) {
			const { propBetweens } = params;
			propBetweens.forEach(propBetween => query.whereBetween(propBetween.property, [propBetween.from, propBetween.to]));
		}

		const [totalCount] = await query;
		return totalCount.count;
	};

	return {
		upsert,
		find,
		deleteIds,
		count,
	};
};

module.exports = getDbInstance;
