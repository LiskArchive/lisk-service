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
const BluebirdPromise = require('bluebird');

const config = require('../../config');

const logger = Logger();

const connectionPool = {};
const tablePool = {};

const loadSchema = async (knex, tableName, tableConfig) => {
	const { primaryKey, charset, schema, indexes } = tableConfig;

	if (await knex.schema.hasTable(tableName)) return knex;

	await knex.schema
		.createTable(tableName, table => {
			if (charset) table.charset(charset);

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
		pool: {
			max: 50,
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
	if (val) {
		if (type === 'number') return Number(val);
		if (type === 'integer') return Number(val);
		if (type === 'string') return String(val);
		if (type === 'boolean') return Boolean(val);
		if (type === 'bigInteger') return BigInt(val);
	}
	return val;
};

const resolveQueryParams = (params) => {
	const queryParams = Object.keys(params)
		.filter(key => !['sort', 'limit', 'propBetweens', 'orWhere', 'offset', 'whereIn', 'orWhereIn', 'search', 'aggregate']
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
			const ids = await knex
				.transaction(trx => knex.batchInsert(tableName, rows, chunkSize).transacting(trx));
			logger.debug(`${rows.length} row(s) inserted/updated in '${tableName}' table`);
			return ids;
		} catch (error) {
			const errCode = error.code;
			const errMessage = error.message.split(`${errCode}: `)[1] || error.message;
			const errCause = errMessage.split(': ')[0];
			logger.debug('Encountered error with batch insert:', errCause,
				'\nRe-attempting to update/merge the conflicted transactions one at a time: ');

			return knex.transaction(async trx => {
				const inserts = await BluebirdPromise.map(
					rows,
					async row => trx(tableName)
						.insert(row)
						.onConflict(tableConfig.primaryKey)
						.merge()
						.transacting(trx),
					{ concurrency: 50 },
				);
				logger.debug(`${rows.length} row(s) inserted/updated in '${tableName}' table`);
				return inserts;
			});
		}
	};

	const queryBuilder = (params, columns) => {
		const query = knex.select(columns).table(tableName);
		const queryParams = resolveQueryParams(params);

		if (params.propBetweens) {
			const { propBetweens } = params;
			propBetweens.forEach(
				propBetween => query
					.where(propBetween.property, '>=', propBetween.from)
					.where(propBetween.property, '<=', propBetween.to));
		}

		if (params.sort) {
			const [sortProp, sortOrder] = params.sort.split(':');
			query.orderBy(sortProp, sortOrder);
		}

		if (params.whereIn) {
			const { property, values } = params.whereIn;
			query.whereIn(property, values);
		}

		if (params.orWhere) {
			const { orWhere } = params;
			query.where(function () {
				this.where(queryParams).orWhere(orWhere);
			});
		} else {
			query.where(queryParams);
		}

		if (params.orWhereIn) {
			const { property, values } = params.orWhereIn;
			query.orWhereIn(property, values);
		}

		if (params.search) {
			const { property, pattern } = params.search;
			query.where(`${property}`, 'like', `%${pattern}%`);
		}

		if (params.aggregate) {
			query.where(queryParams).sum(`${params.aggregate} as total`);
		}

		if (params.limit) query.limit(Number(params.limit));
		if (params.offset) query.offset(Number(params.offset));

		return query;
	};

	const find = (params = {}, columns) => new Promise((resolve, reject) => {
		const query = queryBuilder(params, columns);
		const debugSql = query.toSQL().toNative();
		logger.debug(`${debugSql.sql}; bindings: ${debugSql.bindings}`);
		query.then(response => {
			resolve(response);
		}).catch(err => {
			logger.error(err.message);
			reject(err);
		});
	});

	const deleteIds = async ids => knex(tableName)
		.whereIn(primaryKey, ids)
		.del();

	const count = async (params = {}) => {
		const query = knex.count(`${tableConfig.primaryKey} as count`).table(tableName);
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
			propBetweens.forEach(
				propBetween => query
					.where(propBetween.property, '>=', propBetween.from)
					.where(propBetween.property, '<=', propBetween.to));
		}

		if (params.whereIn) {
			const { property, values } = params.whereIn;
			query.whereIn(property, values);
		}

		if (params.orWhereIn) {
			const { property, values } = params.orWhereIn;
			query.orWhereIn(property, values);
		}

		if (params.search) {
			const { property, pattern } = params.search;
			query.where(`${property}`, 'like', `%${pattern}%`);
		}

		const [totalCount] = await query;
		return totalCount.count;
	};

	const rawQuery = async queryStatement => {
		const [resultSet] = await knex.raw(queryStatement);
		return resultSet;
	};

	return {
		upsert,
		find,
		deleteIds,
		count,
		rawQuery,
	};
};

module.exports = getDbInstance;
