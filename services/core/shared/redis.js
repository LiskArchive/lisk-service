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
const redis = require('ioredis');
const { Logger } = require('lisk-service-framework');

const config = require('../config');

const logger = Logger();

const connectionPool = {};

const getDbInstance = async (
	collectionName,
	idxConfig = {},
	endpoint = config.endpoints.redis,
	) => {
	if (!connectionPool[endpoint]) {
		connectionPool[endpoint] = new redis(endpoint);
		connectionPool[endpoint].on('error', (err) => logger.error('connection issues ', err));
	}

	const db = connectionPool[endpoint];
	const { primaryId, schema, indexes, purge } = idxConfig;

	const cast = (val, type) => {
		if (type === 'number') return Number(val);
		if (type === 'string') return String(val);
		if (type === 'boolean') return Boolean(val);
		return val;
	};

	const writeKey = async (setName, key, value) => {
		db.hset(`idx:${collectionName}:${setName}`, key, value);
	};

	const writeRange = async (setName, index, value) => {
		db.zadd(`idx:${collectionName}:${setName}`, Number(index), value);
	};

	const write = async (doc) => {
		const item = {};
		const itemToWrite = {};
		Object.keys(schema).forEach(o => {
			item[o] = cast(doc[o], schema[o].type);
			if (o.store === true) itemToWrite;
		});

		Object.keys(indexes).forEach(idx => {
			const [ from, to ] = idx.split(':');
			if (to) {
				const { type } = indexes[idx];
				if (type === 'key') return writeKey(`${from}:${to}`, item[from], item[to]);
				if (type === 'range') return writeRange(`${from}:${to}`, item[from], item[to]);
			} else {
				const data = indexes[idx].json === true ? JSON.stringify(item) : item;
				if (type === 'key') return writeKey(`${from}:${to}`, item[from], data);
				if (type === 'range') return writeRange(`${from}:${to}`, item[from], data);
			}
		});
	};

	const findProperty = async (key, prop) => {
		if (schema[key]) {
			if (schema[key]) {}
		}
		db.hset(`idx:${index}`, key, value);
		
	};

	const find = async (params) => {
		const offset = params.offset || 0;
		const limit = params.limit || 10;

		delete params.offset;
		delete params.limit;

		// TODO: Remove after PouchDB specific code is removed from the shared layer
		if (params.selector) params = params.selector;

		const filterByParams = (item, lParams) => {
			const paramMatches = Object.entries(lParams)
				.filter(([, v]) => v)
				.map(([k, v]) => item[k] === v);
			return paramMatches.reduce((a, b) => a && b, true);
			// return !paramMatches.some(isMatch => !isMatch);
		};

		const result = await findAll();
		const filteredResult = result.filter(item => filterByParams(item, params));

		return filteredResult.slice(offset, offset + limit);
	};

	const readKey = async (index, key) => new Promise(resolve => {
		db.hget(`idx:${index}`, key, async (err, result) => {
			if (err) logger.error(`Error retrieving ${collectionName} data with id ${key}: `, err);

			const res = [];
			if (result) res.push(JSON.parse(result));
			return resolve(res);
		});
	});

	const findById = async (id) => readKey(`${collectionName}:default`, id);

	const findByProperty = async (prop, value, to) => {
		schema[prop].index.find(o => o.to === '')
		if (schema[prop] === '')
	};

	const find = async (params) => {

	};

	const findRange = async () => async (prop, from, to, reverse, limit = 1, offset = 0) => {
		const [ index, target ] = prop.split(':');
		if (indexes[`idx:${collectionName}:${index}:${target}`]) {
			return findByRange(prop, from, to, reverse, limit, offset);
		} else if (schema[index]) {
			const ids = await findByRange(`${index}:${primaryKey}`, from, to, reverse, limit, offset);
			return ids.map(async id => (await findById(`idx:${collectionName}:${index}`, id))[target]);
		}
		return [];
	};

	const findByRange = async (prop, from, to, reverse, limit = 1, offset = 0) => {
		if ([...indexes, ...customIndexes].includes(prop)) {
			if (reverse) {
				return db.zrevrangebyscore(collectionName,
					Number(to) || '+Inf', Number(from) || 0,
					'LIMIT', Number(offset), Number(limit));
			}
			return db.zrangebyscore(collectionName,
				Number(from) || 0, Number(to) || '+Inf',
				'LIMIT', Number(offset), Number(limit));
		}
		return [];
	};

	const deleteByRange = async (prop, from, to) => {
		if ([...indexes, ...customIndexes].includes(prop)) {
			return db.zrem(collectionName,
				Number(from) || 0, Number(to) || '+Inf',
				'LIMIT', Number(offset), Number(limit));
		}
		return [];
	};

	const deleteById = async (id) => db.hdel(collectionName, id);

	const deleteBatch = async (docs) => {
		if (docs instanceof Array && docs.length === 0) return 0;
		return (await Promise.all(docs.map(doc => deleteById(doc.id)))).reduce((a, b) => a + b, 0);
	};

	const deleteByProperty = async (prop, value) => {
		if ([...indexes, ...customIndexes].includes(prop)) {
			const id = ['timestamp'].includes(prop)
				? await db.zrangebyscore(collectionName, value, value, 'LIMIT', 0, 1)
				: await db.hget(`${collectionName}_${prop}`, value);

			db.hdel(`${collectionName}_${prop}`, value);

			return deleteById(id);
		}

		const params = {};
		params[prop] = value;
		const results = await find(params);

		return deleteBatch(results);
	};

	const getCount = () => db.hlen(collectionName);

	return {
		write,
		writeOnce,
		writeBatch,
		findAll,
		find,
		findById,
		findOneByProperty,
		deleteById,
		deleteBatch,
		deleteByProperty,
		getCount,
		writeRange,
		findByRange,
	};
};

module.exports = getDbInstance;
