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
		if (typeof idxName === 'string') idxName = [idxName];
		logger.debug(`Setting up index ${name}/${idxName.join('-')}...`);

		await db.createIndex({
			index: {
				fields: idxName,
			},
		});
	});

	return db;
};

const getDbInstance = async (collectionName, idxList = []) => {
	if (!connectionPool[collectionName]) {
		const dbDataDir = `${config.db.directory}/${collectionName}`;
		if (!fs.existsSync(dbDataDir)) fs.mkdirSync(dbDataDir, { recursive: true });

		connectionPool[collectionName] = await createDb(
			dbDataDir,
			[...config.db.collections[collectionName].indexes, ...idxList],
		);
		logger.info(`Opened PouchDB database: ${collectionName}`);
	}

	const db = connectionPool[collectionName];

	const findById = async (id) => {
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

	const write = async (doc) => {
		if (!doc._id) doc._id = doc.id;
		return db.upsert(doc);
	};

	const writeOnce = async (doc) => {
		if (!doc._id) doc._id = doc.id;
		return db.putIfNotExists(doc);
	};

	const writeBatch = async (docs) => {
		docs.map(async doc => {
			if (!doc._id) doc._id = doc.id;
			const dbResult = await findById(doc._id);
			if (dbResult._rev) doc._rev = dbResult._rev;
			return doc;
		});
		return db.bulkDocs(docs);
	};

	const deleteById = async (id) => db.remove(await findById(id));

	const deleteBatch = async (docs) => {
		if (docs instanceof Array && docs.length === 0) return;
		docs.map(doc => {
			if (!doc._id) doc._id = doc.id;
			doc._deleted = true;
			return doc;
		});
		db.bulkDocs(docs);
	};

	const deleteByProperty = async (property, value) => {
		const res = await findOneByProperty(property, value);
		return deleteBatch(res);
	};

	return {
		write,
		writeOnce,
		writeBatch,
		find,
		findById,
		findOneByProperty,
		deleteById,
		deleteBatch,
		deleteByProperty,
	};
};

module.exports = getDbInstance;
