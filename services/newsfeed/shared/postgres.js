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
const to = require('await-to-js').default;
const pgPromise = require('pg-promise')({
	capSQL: true,
	promiseLib: Promise,
	noLocking: false,
});
const logger = require('./logger')();
const { normalizeData } = require('./normalizers');
const config = require('../config');

const connPool = {};

const connect = (endpoint) => {
	if (!connPool[endpoint]) {
		connPool[endpoint] = pgPromise(endpoint);
		logger.debug(`Connected to database: ${endpoint}`);
	}
	return connPool[endpoint];
};

const db = connect(config.endpoints.postgres);

const dbTx = (list, query) => (
	db.tx((t) => {
		const queries = list.map(l => t.one(query, Object.values(l)));
		return t.batch(queries);
	})
);

// eslint-disable-next-line no-async-promise-executor
const initializeTable = table => new Promise(async (resolve, reject) => {
	const tableExists = await db.any('SELECT to_regclass($1)', table);
	if (!tableExists[0].to_regclass) {
		db.any(config.postgresTables[table].query.createTable)
			.then(() => {
				logger.debug(`Initialized postgrest table: ${table}`);
				resolve();
			})
			.catch(err => reject(err));
	} else {
		resolve();
	}
});

const getNewItems = (data, dbHashList) => {
	const newData = data.filter(item => (
		dbHashList.indexOf(item.hash) < 0
	));
	return newData;
};

const cropFlagsBeyondApiResponse = flagArray => (
	(flagArray.lastIndexOf(false) !== -1)
		? flagArray.slice(0, flagArray.lastIndexOf(false) + 1)
		: flagArray
);

/*
 * getStaleHashes function might need some explanation:
 *
 * Given dbHashList is a list of up to 200 hashes from database and
 * data is a list of about 30 hashes from the 3rd party API (exact count is source-specific)
 *
 * Then the goal is to get the hashes of the database rows that should be deleted.
 * Those are such rows, whose hashes are not in 3rd party API response,
 * but are not older than the oldest item in the API response
 */
const getStaleHashes = (data, dbHashList) => {
	const dataHashes = data.map(({ hash }) => hash);
	let missingIndexFlagArray = dbHashList.map(hash => (dataHashes.indexOf(hash) < 0));

	missingIndexFlagArray = cropFlagsBeyondApiResponse(missingIndexFlagArray);
	const staleHashes = missingIndexFlagArray.map((item, index) => (
		item ? dbHashList[index] : null
	)).filter(hash => !!hash);
	return staleHashes;
};

const updateRows = async (data, source, table, dbHashList) => {
	const staleHashes = getStaleHashes(data, dbHashList);
	const newItems = getNewItems(data, dbHashList);

	if (staleHashes.length > 0 || newItems.length > 0) {
		logger.debug(`${newItems.length} to be added and ${staleHashes.length} rows to be removed  from '${source.name}'`);
		const [error] = await to(db.tx(t => t.batch([
			...staleHashes.map(hash => t.any(source[table].query.delete, [hash])),
			...newItems.map(l => t.one(source[table].query.insert, Object.values(l))),
		])));
		if (error) {
			logger.error(`Updating table '${table}' from source '${source.name}' failed: ${String(error).substr(0, 200)}`);
		} else {
			logger.debug(`Table '${table}' was updated from source '${source.name}'`);
		}
	}
};

const updateDataInDb = async (source, request) => {
	const tableNames = Object.keys(config.postgresTables);
	const dbData = await db.any(source[tableNames[0]].query.select);
	const dbHashList = dbData.map(data => data.hash);

	const [apiError, data] = await to(request(source.url, source.requestOptions));
	if (apiError) {
		logger.error(`Fetching newsfeed data source failed: ${apiError}`);
		return;
	}

	tableNames.forEach(async (table) => {
		const normalizedData = normalizeData(source, data, table);
		await updateRows(normalizedData, source, table, dbHashList);
	});
};

const retrieveDataFromDb = async (query, params) => {
	const endpoint = config.endpoints.postgres;
	try {
		logger.trace(`Requesting ${endpoint}, query ${query}`);
		const result = await db.any(query, params);
		return result;
	} catch (err) {
		logger.warn(`Error while retrieveing data from ${endpoint}, query ${query}, error: ${err}`);
		throw err;
	}
};

module.exports = {
	dbTx,
	updateDataInDb,
	initializeTable,
	retrieveDataFromDb,
};
