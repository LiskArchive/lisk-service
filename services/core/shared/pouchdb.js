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
const fs = require('fs');
const { Logger } = require('lisk-service-framework');
const PouchDB = require('pouchdb');

PouchDB.plugin(require('pouchdb-upsert'));
PouchDB.plugin(require('pouchdb-find'));

const logger = Logger();

const config = require('../config');

const connectionPool = {};

const createDb = async (name, idxList = []) => {
	logger.debug(`Creating/opening database ${name}...`);
	const db = new PouchDB(name, { auto_compaction: true });

	idxList.forEach(async idxName => {
		logger.debug(`Setting up index ${idxName}...`);
		await db.createIndex({
			index: {
				fields: [idxName],
			},
		});
	});

	return db;
};

const getDbInstance = (collectionName) => {
	const dbDataDir = `${config.db.directory}/${collectionName}`;
	if (!fs.existsSync(dbDataDir)) fs.mkdirSync(dbDataDir, { recursive: true });

	if (!connectionPool[collectionName]) {
		connectionPool[collectionName] = createDb(dbDataDir);
		logger.info(`Opened PouchDB database: ${collectionName}`);
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

	const findById = (id) => {
		logger.debug(`Reading block ${id}...`);
		return db.get(id);
	};

	const find = (params) => db.find(params);

	const findOneByProperty = (property, value) => {
		const selector = {};
		selector[property] = value;
		return db.find({ selector, limit: 1 });
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
