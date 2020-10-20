/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
const PouchDB = require('pouchdb');
const fs = require('fs');

PouchDB.plugin(require('pouchdb-upsert'));
PouchDB.plugin(require('pouchdb-find'));

const logger = Logger();

const config = require('../config');

const connectionPool = {};

const createDb = async (name, idxList = []) => {
	logger.debug(`Creating/opening database ${name}...`);
	const db = new PouchDB(name, { auto_compaction: true });

	idxList.forEach(async idxName => {
		logger.debug(`Setting up index ${name}/${idxName}...`);
		await db.createIndex({
			index: {
				fields: [idxName],
			},
		});
	});

	return Promise.resolve(db);
};

const getDbInstance = async (collectionName, idxList) => {
	// make sure the directory exists on disk
	// mkdir -p

	const dbDataDir = `${config.databaseDir}/${collectionName}`;
	if (!fs.existsSync(dbDataDir)) fs.mkdirSync(dbDataDir, { recursive: true });
	if (!connectionPool[collectionName]) {
		connectionPool[collectionName] = await createDb(dbDataDir, idxList);
		logger.info(`Opened to PouchDB database: ${collectionName}`);
	}

	const db = connectionPool[collectionName];

	const write = (obj) => {
		if (!obj._id) obj._id = obj.id;
		return db.upsert(obj);
	};

	const writeOnce = (obj) => {
		if (!obj._id) obj._id = obj.id;
		return db.putIfNotExists(obj);
	};

	const findById = async (id) => {
		logger.debug(`Reading block ${id}...`);
		try {
			const res = await db.get(id);
			return res;
		} catch (err) {
			if (err.message === 'missing') return [];
			logger.error(err.message);
		}
		return [];
	};

	const find = async (params) => {
		const res = await db.find(params);
		return res.docs;
	};

	const findOneByProperty = async (property, value) => {
		const selector = {};
		selector[property] = value;
		const res = await db.find({ selector, limit: 1 });
		return res.docs;
	};

	return {
		write,
		writeOnce,
		find,
		findById,
		findOneByProperty,
	};
};

module.exports = getDbInstance;
