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

PouchDB.plugin(require('pouchdb-adapter-memory'));
PouchDB.plugin(require('pouchdb-upsert'));
PouchDB.plugin(require('pouchdb-find'));

const logger = Logger();

const config = require('../config');

const connectionPool = {};

const createDb = async (name, idxList = []) => {
	logger.debug(`Creating/opening database ${name}...`);

	const collectionName = name.split('/')[1];
	const adapter = config.db.collections[collectionName].adapter
		? config.db.collections[collectionName].adapter
		: config.db.defaults.adapter;

	const enableAutoCompaction = config.db.collections[collectionName].auto_compaction
		? config.db.collections[collectionName].auto_compaction
		: config.db.defaults.auto_compaction;

	const db = new PouchDB(name, { adapter, auto_compaction: enableAutoCompaction });
	db.setMaxListeners(50);

	// const availableIndexes = [];
	// (await db.getIndexes())
	// 	.indexes.forEach(index => availableIndexes.push(index.name));
	// console.log(availableIndexes);

	idxList.forEach(async propName => {
		let idxName = 'idx-'.concat(db.name.split('/')[1]).concat('-');
		if (typeof propName === 'string') {
			idxName = idxName.concat(propName);
			propName = [propName];
		} else {
			idxName = idxName.concat(propName.join('-'));
		}

		logger.debug(`Setting up index ${name}/${idxName.split('-').slice(2).join('-')}...`);

		await db.createIndex({
			index: {
				fields: propName,
				name: idxName,
				ddoc: idxName.concat('-doc'),
			},
		});
	});

	return db;
};

const dbLogger = {};

const getDbInstance = async (collectionName, idxList = []) => {
	if (!dbLogger[collectionName]) dbLogger[collectionName] = Logger(`pouchdb-${collectionName}`);
	const cLogger = dbLogger[collectionName];

	if (!connectionPool[collectionName]) {
		const dbDataDir = `${config.db.defaults.directory}/${collectionName}`;

		if (
			config.db.collections[collectionName].adapter !== 'memory'
			&& !fs.existsSync(dbDataDir)
		) fs.mkdirSync(dbDataDir, { recursive: true });

		connectionPool[collectionName] = await createDb(dbDataDir, [
			...config.db.collections[collectionName].indexes,
			...idxList,
		]);
		cLogger.info(`Opened PouchDB database: ${collectionName}`);
	}

	const db = connectionPool[collectionName];

	const write = async (doc) => {
		if (!doc._id) doc._id = doc.id;
		return db.upsert(doc);
	};

	const writeOnce = async (doc) => {
		if (!doc._id) doc._id = doc.id;
		return db.putIfNotExists(doc);
	};

	const writeBatch = async (docs) => {
		docs.map((doc) => {
			if (!doc._id) doc._id = doc.id;
			return doc;
		});
		return db.bulkDocs(docs);
	};

	const findAll = async () => {
		const res = await db.allDocs({ include_docs: true });
		const allDocs = res.rows.map(entry => entry.doc);
		const filteredDocs = allDocs.filter(doc => !doc._id.includes('idx'));
		return filteredDocs;
	};

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

	const deleteById = async (id) => db.remove(await findById(id));

	const deleteBatch = async (docs) => {
		if (docs instanceof Array && docs.length === 0) return null;
		docs.map((doc) => {
			if (!doc._id) doc._id = doc.id;
			doc._deleted = true;
			return doc;
		});
		return db.bulkDocs(docs);
	};

	const deleteByProperty = async (property, value) => {
		const res = await findOneByProperty(property, value);
		return deleteBatch(res);
	};

	const getCount = async () => (await db.info()).doc_count;

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
	};
};

module.exports = getDbInstance;
