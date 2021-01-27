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

const loadSchema = async (knex, tableName, tableConfig) => {
	const { primaryKey, schema, index } = tableConfig;

	await knex.schema
	.createTable(tableName, table => {
		Object.keys(schema).map(p => {
			const kProp = table[schema[p].type](schema[p]);
			if (schema[p].null === false) kProp.notNullable();
			if (p === primaryKey) kProp.primary();
			if (index[p]) kProp.index();
			return kProp;
		});
	});
};

const createDb = async (tableName, tableConfig, connEndpoint) => {
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

	await loadSchema(knex, tableName, tableConfig);

	// await knex.migrate.latest(); // ?

	return knex;
};

const getDbInstance = async (tableName, schema, connEndpoint = config.endpoints.mysql) => {
	const userName = connEndpoint.split('//')[1].split(':')[0];
	const hostPort = connEndpoint.split('@')[1].split('/')[0];
	const connPoolKey = [userName, hostPort].join('@');
	const connPoolKeyTable = `${connPoolKey}/${tableName}`;
	if (!connectionPool[connPoolKeyTable]) {
		connectionPool[connPoolKeyTable] = await createDb(tableName, schema, connEndpoint);
	}

	const knex = connectionPool[connPoolKeyTable];

	const upsertOne = async (row) => knex.transaction(async trx => {
		const inserts = await trx(tableName).insert(row).onConflict('id').merge()
			.transacting(trx);
		logger.info(`${inserts.length} row inserted/updated in '${tableName}' table`);
		return inserts;
	});

	const upsert = async (rows) => {
		try {
			const chunkSize = 1000;
			const ids = await knex.batchInsert(tableName, rows, chunkSize);
			logger.info(`${rows.length} row(s) inserted/updated in '${tableName}' table`);
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
				logger.info(`${rows.length} row(s) inserted/updated in '${tableName}' table`);
				return inserts;
			});
		}
	};

	const find = async (params) => {
		// TODO: Remove after PouchDB specific code is removed from the shared layer
		if (params.selector) params = params.selector;

		let res;
		if (params.propBetween) {
			const { propBetween } = params;
			delete params.propBetween;
			res = await knex.select().table(tableName)
				.whereBetween(propBetween.property, [propBetween.from, propBetween.to]);
		} else if (params.sort) {
			const [sortProp, sortOrder] = params.sort.split(':');
			delete params.sort;
			res = await knex.select().table(tableName).where(params).orderBy(sortProp, sortOrder);
		} else {
			res = await knex.select().table(tableName).where(params);
		}
		return res;
	};

	// const findById = async (id) => find({ id });

	// const findOneByProperty = async (property, value) => {
	// 	const params = {};
	// 	params[property] = value;
	// 	return find(params);
	// };

	// const deleteByProperty = async (property, value) => {
	// 	const whereParams = {};
	// 	whereParams[property] = value;
	// 	return knex(tableName).where(whereParams).del();
	// };

	// const deleteById = async (id) => deleteByProperty({ id });

	// const deleteBatch = async (rows) => {
	// 	if (rows instanceof Array && rows.length === 0) return null;
	// 	return knex(tableName).delete().whereIn('id', rows.map(row => row.id));
	// };

	// const getCount = async () => knex(tableName).count({ count: 'id' });

	return {
		upsert,
		find,
		// delete,
		// getCount,
	};
};

module.exports = getDbInstance;
