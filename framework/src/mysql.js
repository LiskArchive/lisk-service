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
const Logger = require('./logger').get;

const logger = Logger();

const connectionPool = {};
const tablePool = {};

const CONN_ENDPOINT_DEFAULT = 'mysql://lisk:password@localhost:3306/lisk';

const loadSchema = async (knex, tableName, tableConfig) => {
	const { primaryKey, charset, schema, indexes } = tableConfig;

	if (await knex.schema.hasTable(tableName)) return knex;

	await knex.schema
		.createTable(tableName, table => {
			if (charset) table.charset(charset);

			Object.keys(schema).map(p => {
				const kProp = (table[schema[p].type])(p);
				if (schema[p].null === false) kProp.notNullable();
				if ('defaultValue' in schema[p]) kProp.defaultTo(schema[p].defaultValue);
				if (indexes[p]) kProp.index();
				return kProp;
			});
			table.primary(primaryKey);
		});

	return knex;
};

const createDBConnection = async connEndpoint => {
	const knex = require('knex')({
		client: 'mysql2',
		version: '8',
		connection: connEndpoint,
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

const cast = (val, type) => {
	if (typeof val === 'undefined') return null;
	if (type === 'number') return Number(val);
	if (type === 'integer') return Number(val);
	if (type === 'string') return String(val);
	if (type === 'boolean') return Boolean(val);
	if (type === 'bigInteger') return BigInt(val);
	if (type === 'json') return JSON.stringify(val);
	return val;
};

const resolveQueryParams = params => {
	const KNOWN_QUERY_PARAMS = [
		'sort', 'limit', 'offset', 'propBetweens', 'andWhere', 'orWhere', 'orWhereWith',
		'whereIn', 'orWhereIn', 'whereJsonSupersetOf', 'search', 'aggregate', 'distinct',
		'order', 'orSearch', 'count', 'whereNull', 'whereNotNull',
	];
	const queryParams = Object.keys(params)
		.filter(key => !KNOWN_QUERY_PARAMS.includes(key))
		.reduce((obj, key) => {
			obj[key] = params[key];
			return obj;
		}, {});
	return queryParams;
};

const getValue = val => {
	if (typeof val === 'undefined') return null;
	if (Number.isNaN(val)) return null;
	return val;
};

const mapRowsBySchema = async (rawRows, schema) => {
	const rows = [];
	rawRows.forEach(item => {
		const row = {};
		Object.keys(schema).forEach(column => {
			const val = item[column];
			const valType = schema[column].type;
			if (`${column}` in item) row[column] = getValue(cast(val, valType));
		});
		rows.push(row);
	});
	return rows;
};

const getConnectionPoolKey = (connEndpoint = CONN_ENDPOINT_DEFAULT) => {
	const userName = connEndpoint.split('//')[1].split('@')[0].split(':')[0];
	const [hostPort, dbName] = connEndpoint.split('@')[1].split('/');
	const connPoolKey = `${userName}@${hostPort}/${dbName}`;
	return connPoolKey;
};

const getDBConnection = async (connEndpoint = CONN_ENDPOINT_DEFAULT) => {
	const connPoolKey = getConnectionPoolKey(connEndpoint);
	const defaultCharset = 'utf8mb4';

	if (!connectionPool[connPoolKey]) {
		logger.info(`Attempting to connect ${connEndpoint}...`);
		let connString = connEndpoint;
		if (!connEndpoint.includes('charset')) {
			connString = connEndpoint.includes('?')
				? `${connEndpoint}&charset=${defaultCharset}`
				: `${connEndpoint}?charset=${defaultCharset}`;
		}
		connectionPool[connPoolKey] = await createDBConnection(connString);
	}

	const knex = connectionPool[connPoolKey];
	return knex;
};

const createTableIfNotExists = async (tableName,
	tableConfig,
	connEndpoint = CONN_ENDPOINT_DEFAULT) => {
	const connPoolKey = getConnectionPoolKey(connEndpoint);
	const connPoolKeyTable = `${connPoolKey}/${tableName}`;

	if (!tablePool[connPoolKeyTable]) {
		logger.info(`Creating schema for ${tableName}`);
		const knex = await getDBConnection(connEndpoint);
		await loadSchema(knex, tableName, tableConfig);
		tablePool[connPoolKeyTable] = true;
	}
};

const startDBTransaction = async connection => connection.transaction();

const commitDBTransaction = async transaction => transaction.commit();

const rollbackDBTransaction = async transaction => transaction.rollback();

const getTableInstance = async (...params) => {

	let tableName;
	let tableConfig;
	let connEndpoint = CONN_ENDPOINT_DEFAULT;

	if(params.length == 3) {					// If user passed (tableName, tableConfig, connEndpoint)
		tableName = params[0];
		tableConfig = params[1];
		connEndpoint = params[2];
	} else if (params.length == 2) {
		if(typeof params[0] === 'object') {  	// If user passed (tableConfig, connEndpoint)
			tableName = params[0].tableName;
			tableConfig = params[0];
			connEndpoint = params[1];
		} else {								// If user passed (tableName, tableConfig)
			tableName = params[0];
			tableConfig = params[1];
		}
	} else if(params.length == 1) {				// If user passed (tableConfig)
		tableName = params[0].tableName;
		tableConfig = params[0];
	} else {
		throw Error("Incorrect number of params passed to getTableInstance function");
	}

	const { primaryKey, schema } = tableConfig;

	const knex = await getDBConnection(connEndpoint);

	const createDefaultTransaction = async connection => startDBTransaction(connection);

	await createTableIfNotExists(tableName, tableConfig, connEndpoint);

	const upsert = async (inputRows, trx) => {
		let isDefaultTrx = false;
		if (!trx) {
			trx = await createDefaultTransaction(knex);
			isDefaultTrx = true;
		}

		let rawRows = inputRows;
		if (!Array.isArray(rawRows)) rawRows = [inputRows];
		const rows = await mapRowsBySchema(rawRows, schema);

		// Create all queries for `INSERT or UPDATE on Duplicate keys`
		const queries = rows.map(row => knex(tableName)
			.transacting(trx)
			.insert(row)
			.onConflict(primaryKey)
			.merge(),
		);

		// Perform all queries within a batch together
		if (isDefaultTrx) return Promise.all(queries)
			.then(async result => {
				await trx.commit();
				return result;
			}).catch(async err => {
				await trx.rollback();
				logger.error(err.message);
				throw err;
			});
		return Promise.all(queries);
	};

	const queryBuilder = (params, columns, trx) => {
		const query = knex(tableName).transacting(trx);
		const queryParams = resolveQueryParams(params);

		if (columns && !params.count) query.select(columns);
		else if (columns && params.count && !params.distinct) query.count(`${columns[0]} as count`);
		else if (params.count && params.distinct) query.countDistinct(`${params.distinct} as count`);

		if (params.where) {
			query.where(params.where);
		} else {
			query.where(queryParams);
		}

		if (params.distinct && !params.count) {
			const distinctParams = params.distinct.split(',');
			query.distinct(distinctParams);
		}

		if (params.sort && !params.count) {
			const [sortColumn, sortDirection] = params.sort.split(':');
			query.whereNotNull(sortColumn);
			query.select(sortColumn).orderBy(sortColumn, sortDirection);
		}

		if (params.order && !params.count) {
			const [orderColumn, orderDirection] = params.order.split(':');
			query.whereNotNull(orderColumn);
			query.select(orderColumn).orderBy(orderColumn, orderDirection);
		}

		if (params.propBetweens) {
			const { propBetweens } = params;
			propBetweens.forEach(
				propBetween => {
					if ('from' in propBetween) query.where(propBetween.property, '>=', propBetween.from);
					if ('to' in propBetween) query.where(propBetween.property, '<=', propBetween.to);
					if ('greaterThan' in propBetween) query.where(propBetween.property, '>', propBetween.greaterThan);
					if ('lowerThan' in propBetween) query.where(propBetween.property, '<', propBetween.lowerThan);
				});
		}

		if (params.whereIn) {
			const { whereIn } = params;
			const whereIns = Array.isArray(whereIn) ? whereIn : [whereIn];

			whereIns.forEach(param => {
				const { property, values } = param;
				query.whereIn(property, values);
			});
		}

		if (params.whereJsonSupersetOf) {
			const { property, values } = params.whereJsonSupersetOf;
			query.where(function () {
				const [val0, ...remValues] = Array.isArray(values) ? values : [values];
				this.whereJsonSupersetOf(property, [val0]);
				remValues.forEach(value => this.orWhere(function () {
					this.whereJsonSupersetOf(property, [value]);
				}));
			});
		}

		if (params.andWhere) {
			const { andWhere } = params;
			query.where(function () {
				this.where(andWhere);
			});
		}

		if (params.orWhere) {
			const { orWhere, orWhereWith } = params;
			query.where(function () {
				this.where(orWhere).orWhere(orWhereWith);
			});
		}

		if (params.orWhereIn) {
			const { property, values } = params.orWhereIn;
			query.orWhereIn(property, values);
		}

		if (params.search) {
			params.search = Array.isArray(params.search) ? params.search : [params.search];

			params.search.forEach(search => {
				const { property, pattern, startsWith, endsWith } = search;
				if (pattern) query.where(`${property}`, 'like', `%${pattern}%`);
				if (startsWith) query.where(`${property}`, 'like', `${startsWith}%`);
				if (endsWith) query.where(`${property}`, 'like', `%${endsWith}`);
			});
		}

		if (params.orSearch) {
			params.orSearch = Array.isArray(params.orSearch) ? params.orSearch : [params.orSearch];

			query.andWhere(function () {
				params.orSearch.forEach((orSearch, index) => {
					const { property, pattern, startsWith, endsWith } = orSearch;

					if (index === 0) {
						if (pattern) this.where(`${property}`, 'like', `%${pattern}%`);
						if (startsWith) this.where(`${property}`, 'like', `${startsWith}%`);
						if (endsWith) this.where(`${property}`, 'like', `%${endsWith}`);
					} else {
						if (pattern) this.orWhere(`${property}`, 'like', `%${pattern}%`);
						if (startsWith) this.orWhere(`${property}`, 'like', `${startsWith}%`);
						if (endsWith) this.orWhere(`${property}`, 'like', `%${endsWith}`);
					}
				});
			});
		}

		if (params.whereNull) {
			params.whereNull = Array.isArray(params.whereNull) ? params.whereNull : [params.whereNull];

			params.whereNull.forEach(whereNullProperty => {
				query.whereNull(whereNullProperty);
			});
		}

		if (params.whereNotNull) {
			params.whereNotNull = Array.isArray(params.whereNotNull)
				? params.whereNotNull : [params.whereNotNull];

			params.whereNotNull.forEach(whereNotNullProperty => {
				query.whereNotNull(whereNotNullProperty);
			});
		}

		if (!params.count) {
			if (params.aggregate) {
				query.sum(`${params.aggregate} as total`);
			}

			if (params.limit) {
				query.limit(Number(params.limit));
			} else {
				logger.warn(`No 'limit' set for the query:\n${query.toString()}`);
			}

			if (params.offset) query.offset(Number(params.offset));
		}

		return query;
	};

	const deleteByParams = async (params, trx) => {
		let isDefaultTrx = false;
		if (!trx) {
			trx = await createDefaultTransaction(knex);
			isDefaultTrx = true;
		}

		const query = queryBuilder(params, tableConfig.primaryKey, trx).del();
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

	const deleteByPrimaryKey = async (ids, trx) => {
		let isDefaultTrx = false;
		if (!trx) {
			trx = await createDefaultTransaction(knex);
			isDefaultTrx = true;
		}

		ids = Array.isArray(ids) ? ids : [ids];
		const query = knex(tableName).transacting(trx).whereIn(primaryKey, ids).del();
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

	const update = async (params, trx) => {
		let isDefaultTrx = false;
		if (!trx) {
			trx = await createDefaultTransaction(knex);
			isDefaultTrx = true;
		}

		const { where, updates } = params;
		const query = queryBuilder({ ...where }, tableConfig.primaryKey, trx).update({ ...updates });
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

	const find = async (params = {}, columns, trx) => {
		let isDefaultTrx = false;
		if (!trx) {
			trx = await createDefaultTransaction(knex);
			isDefaultTrx = true;
		}

		if (!columns) {
			logger.warn(`No SELECT columns specified in the query, returning the '${tableName}' table primary key: '${tableConfig.primaryKey}'`);
			columns = Array.isArray(tableConfig.primaryKey)
				? tableConfig.primaryKey : [tableConfig.primaryKey];
		}
		const query = queryBuilder(params, columns, trx);
		const debugSql = query.toSQL().toNative();
		logger.debug(`${debugSql.sql}; bindings: ${debugSql.bindings}`);

		if (isDefaultTrx) return query
			.then(async response => {
				await trx.commit();
				return response;
			}).catch(async err => {
				await trx.rollback();
				logger.error(err.message);
				throw err;
			});

		return query;
	};

	const count = async (params = {}, column) => {
		const trx = await createDefaultTransaction(knex);
		params.count = true;

		if (!column) {
			logger.warn(`No SELECT columns specified in the query, returning the '${tableName}' table primary key: '${tableConfig.primaryKey}'`);
			column = Array.isArray(tableConfig.primaryKey)
				? [tableConfig.primaryKey[0]] : [tableConfig.primaryKey];
		} else {
			column = Array.isArray(column) ? [column[0]] : [column];
		}

		const query = queryBuilder(params, column, trx);
		const debugSql = query.toSQL().toNative();
		logger.debug(`${debugSql.sql}; bindings: ${debugSql.bindings}`);

		params.count = false;

		return query
			.then(async result => {
				await trx.commit();
				const [totalCount] = result;
				return totalCount.count;
			}).catch(async err => {
				await trx.rollback();
				logger.error(err.message);
				throw err;
			});
	};

	const rawQuery = async queryStatement => {
		const trx = await createDefaultTransaction(knex);
		return trx
			.raw(queryStatement)
			.then(async result => {
				await trx.commit();
				const [resultSet] = result;
				return resultSet;
			}).catch(async err => {
				await trx.rollback();
				logger.error(err.message);
				throw err;
			});
	};

	const increment = async (params, trx) => {
		let isDefaultTrx = false;
		if (!trx) {
			trx = await createDefaultTransaction(knex);
			isDefaultTrx = true;
		}

		const query = queryBuilder(params, false, trx).increment(params.increment);

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

	const decrement = async (params, trx) => {
		let isDefaultTrx = false;
		if (!trx) {
			trx = await createDefaultTransaction(knex);
			isDefaultTrx = true;
		}

		const query = queryBuilder(params, false, trx).decrement(params.decrement);

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
		upsert,
		find,
		delete: deleteByParams,
		deleteByPrimaryKey,
		update,
		count,
		rawQuery,
		increment,
		decrement,
	};
};

module.exports = {
	default: getTableInstance,
	getDBConnection,
	getTableInstance,
	startDBTransaction,
	commitDBTransaction,
	rollbackDBTransaction,

	// For backward compatibility
	getDbConnection: getDBConnection,
	startDbTransaction: startDBTransaction,
	commitDbTransaction: commitDBTransaction,
	rollbackDbTransaction: rollbackDBTransaction,
};
